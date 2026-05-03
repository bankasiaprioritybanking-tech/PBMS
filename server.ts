import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc,
  serverTimestamp,
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc 
} from 'firebase/firestore';
import { readFileSync } from 'fs';
import { createHash } from 'crypto';
import admin from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase Config
const firebaseConfig = JSON.parse(
  readFileSync(path.join(__dirname, 'firebase-applet-config.json'), 'utf-8')
);

const clientApp = initializeApp(firebaseConfig);
const db = getFirestore(clientApp, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Admin SDK
// Set FIREBASE_SERVICE_ACCOUNT_JSON secret (from Firebase Console > Project Settings > Service Accounts)
// to enable privileged user provisioning via the Admin SDK.
function initAdminSdk(): admin.app.App {
  if (admin.apps.length > 0) return admin.apps[0]!;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson) {
    const serviceAccount = JSON.parse(serviceAccountJson);
    return admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }
  return admin.initializeApp({ credential: admin.credential.applicationDefault() });
}

let adminAuth: admin.auth.Auth | null = null;
try {
  const adminApp = initAdminSdk();
  adminAuth = admin.auth(adminApp);
  console.log('[Admin SDK] Initialized successfully.');
} catch (e) {
  console.warn('[Admin SDK] Initialization failed. Set FIREBASE_SERVICE_ACCOUNT_JSON secret to enable privileged endpoints.');
}

import cryptoRandomString from 'crypto-random-string';

// Verify Firebase ID token and attach caller uid to request
async function verifyIdToken(req: express.Request, res: express.Response): Promise<string | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: missing or malformed authentication token.' });
    return null;
  }
  if (!adminAuth) {
    res.status(503).json({ error: 'Admin SDK not available. Set the FIREBASE_SERVICE_ACCOUNT_JSON secret in project settings.' });
    return null;
  }
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.slice(7));
    return decoded.uid;
  } catch {
    res.status(401).json({ error: 'Unauthorized: invalid or expired token.' });
    return null;
  }
}

// Check if a Firebase uid belongs to a user with the Admin role in Firestore
async function isAdminUser(uid: string): Promise<boolean> {
  try {
    const userSnap = await getDocs(query(collection(db, 'users'), where('uid', '==', uid)));
    if (userSnap.empty) return false;
    const roleIds: string[] = userSnap.docs[0].data().roleIds || [];
    if (roleIds.length === 0) return false;
    for (const roleId of roleIds) {
      const roleDoc = await getDoc(doc(db, 'roles', roleId));
      if (roleDoc.exists() && roleDoc.data().name === 'Admin') return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Middleware: require valid Firebase ID token AND Admin role
async function requireAdminRole(req: express.Request, res: express.Response, next: express.NextFunction) {
  const uid = await verifyIdToken(req, res);
  if (!uid) return;
  const isAdmin = await isAdminUser(uid);
  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden: Admin role required.' });
  }
  (req as any).callerUid = uid;
  next();
}

async function startServer() {
  const expressApp = express();
  const PORT = parseInt(process.env.PORT || '5000', 10);

  expressApp.use(express.json());

  // API v1: Create Firebase Auth user + Firestore invitation atomically (Admin SDK, requires Admin role)
  expressApp.post('/api/v1/users/invite', requireAdminRole, async (req, res) => {
    if (!adminAuth) {
      return res.status(503).json({ error: 'Admin SDK not available. Set the FIREBASE_SERVICE_ACCOUNT_JSON secret.' });
    }

    const { email, tempPassword, name, userId, phone, branch, division, functionalDesignation, roleIds } = req.body;
    const invitedByUid = (req as any).callerUid;

    if (!email || !tempPassword) {
      return res.status(400).json({ error: 'Missing required fields: email, tempPassword.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const isAllowedDomain = normalizedEmail.endsWith('@bankasia-bd.com') || normalizedEmail === 'bankasia.prioritybanking@gmail.com';
    if (!isAllowedDomain) {
      return res.status(400).json({ error: 'Domain violation. Only @bankasia-bd.com addresses are permitted.' });
    }

    let createdUid: string | null = null;
    try {
      // Step 1: Create Firebase Auth account via Admin SDK
      const userRecord = await adminAuth.createUser({
        email: normalizedEmail,
        password: tempPassword,
        emailVerified: false,
        disabled: false
      });
      createdUid = userRecord.uid;
      console.log(`[INVITE] Firebase Auth account created via Admin SDK for ${normalizedEmail} (uid: ${createdUid})`);

      // Step 2: Hash the temp password for Firestore verification
      const tempPasswordHash = createHash('sha256').update(tempPassword).digest('hex');

      // Step 3: Write invitation to Firestore
      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
      await addDoc(collection(db, 'invitations'), {
        name: name || '',
        userId: userId || '',
        email: normalizedEmail,
        phone: phone || '',
        branch: branch || '',
        division: division || '',
        functionalDesignation: functionalDesignation || '',
        roleIds: roleIds || [],
        tempPasswordHash,
        firebaseUid: createdUid,
        invitedByUid,
        createdAt: serverTimestamp(),
        expiresAt,
        status: 'pending'
      });

      res.json({ success: true, uid: createdUid });
    } catch (err: any) {
      // Rollback: if anything failed after Auth account was created, delete it to avoid orphan accounts
      if (createdUid && adminAuth) {
        try {
          await adminAuth.deleteUser(createdUid);
          console.log(`[INVITE] Rolled back Auth account for ${normalizedEmail} (uid: ${createdUid}) after error.`);
        } catch (rollbackErr) {
          console.error(`[INVITE] Rollback failed for uid ${createdUid}:`, rollbackErr);
        }
      }
      const code = err.code || err.message || 'UNKNOWN';
      if (code === 'auth/email-already-exists') {
        return res.status(409).json({ error: 'A Firebase Auth account for this email already exists.' });
      }
      console.error('[INVITE] Error:', err);
      return res.status(500).json({ error: `Invitation failed: ${code}` });
    }
  });

  // API v1: Reset User Password via Admin SDK (requires Admin role)
  expressApp.post('/api/v1/users/reset-password', requireAdminRole, async (req, res) => {
    if (!adminAuth) {
      return res.status(503).json({ error: 'Admin SDK not available. Set the FIREBASE_SERVICE_ACCOUNT_JSON secret.' });
    }
    const verifiedAdminUid = (req as any).callerUid;
    const { email, userId } = req.body;
    if (!email || !userId) {
      return res.status(400).json({ error: 'Missing required fields: email, userId.' });
    }

    const tempPassword = cryptoRandomString({ length: 12, type: 'alphanumeric' }) + 'R1!';
    try {
      const userRecord = await adminAuth.getUserByEmail(email);
      await adminAuth.updateUser(userRecord.uid, { password: tempPassword });
      console.log(`[RESET] Password reset by verified admin ${verifiedAdminUid} for ${email}`);

      res.json({
        success: true,
        message: 'Password reset successfully via Admin SDK.',
        tempPassword,
        auditId: cryptoRandomString({ length: 8 })
      });
    } catch (err: any) {
      console.error('Reset fault:', err);
      res.status(500).json({ error: `Password reset failed: ${err.message || err.code}` });
    }
  });

  // API v1: Secure User Onboarding (legacy — prefer /api/v1/users/invite)
  expressApp.post('/api/v1/users/onboard', async (req, res) => {
    try {
      const { email, name } = req.body;
      if (!email || (!email.endsWith('@bankasia-bd.com') && email !== 'bankasia.prioritybanking@gmail.com')) {
        return res.status(400).json({ error: 'Domain violation. Only @bankasia-bd.com is permitted.' });
      }
      const tempPassword = cryptoRandomString({ length: 12, type: 'alphanumeric' }) + 'A1!';
      console.log(`[ONBOARD] Legacy endpoint called for ${email}. Use /api/v1/users/invite instead.`);
      res.json({ success: true, message: 'Use /api/v1/users/invite for Admin SDK provisioning.', tempPassword });
    } catch (error) {
      console.error('Onboarding Error:', error);
      res.status(500).json({ error: 'System error during onboarding' });
    }
  });

  // API v1: RBAC Rights Mapping
  expressApp.get('/api/v1/users/:staffId/rights', async (req, res) => {
    try {
      const { staffId } = req.params;
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('userId', '==', staffId));
      const userSnap = await getDocs(q);

      if (userSnap.empty) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = userSnap.docs[0].data();
      const roleIds = userData.roleIds || [];

      const rights = new Set<string>();
      const rolesInfo = [];

      for (const roleId of roleIds) {
        const roleDoc = await getDoc(doc(db, 'roles', roleId));
        if (roleDoc.exists()) {
          const roleData = roleDoc.data();
          rolesInfo.push({ id: roleId, name: roleData.name });
          if (roleData.permissionIds) {
            for (const pid of roleData.permissionIds) {
              const permDoc = await getDoc(doc(db, 'permissions', pid));
              if (permDoc.exists()) {
                rights.add(permDoc.data().name);
              }
            }
          }
        }
      }

      res.json({
        staffId,
        fullName: userData.name,
        branch: userData.branch,
        roles: rolesInfo,
        effectiveRights: Array.from(rights),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({ error: 'Internal system fault during RBAC traversal' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    expressApp.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    expressApp.use(express.static(distPath));
    expressApp.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  expressApp.listen(PORT, '0.0.0.0', () => {
    console.log(`RBAC API Gateway running on http://localhost:${PORT}`);
  });
}

startServer();
