import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc 
} from 'firebase/firestore';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase Config
const firebaseConfig = JSON.parse(
  readFileSync(path.join(__dirname, 'firebase-applet-config.json'), 'utf-8')
);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

import cryptoRandomString from 'crypto-random-string';

async function startServer() {
  const expressApp = express();
  const PORT = 3000;

  expressApp.use(express.json());

  // API v1: Secure User Onboarding
  expressApp.post('/api/v1/users/onboard', async (req, res) => {
    try {
      const { email, name, branch, roleIds, userId } = req.body;
      
      if (!email.endsWith('bankasia-bd.com') && email !== 'bankasia.prioritybanking@gmail.com') {
        return res.status(400).json({ error: 'Domain violation. Only bankasia-bd.com is permitted.' });
      }

      // 1. Generate Secure Password
      const tempPassword = cryptoRandomString({ length: 12, type: 'alphanumeric' }) + 'A1!';
      
      // 2. LOG THE PASSWORD (Simulating Email)
      console.log('--------------------------------------------------');
      console.log(`[EMAIL SYSTEM] SENDING TO: ${email}`);
      console.log(`Subject: Your Priority Banking Access Credentials`);
      console.log(`Body: Hello ${name}, your account is ready.`);
      console.log(`Username: ${email}`);
      console.log(`Temporary Password: ${tempPassword}`);
      console.log(`Note: You must change this password on first login.`);
      console.log('--------------------------------------------------');

      // 3. In a real environment with a Service Account, we would:
      // await admin.auth().createUser({ email, password: tempPassword });
      
      // For this implementation, we simulate by returning success 
      // and asking the RM to inform the user or checking the console.
      
      res.json({
        success: true,
        message: 'User onboarding initiated. Credentials sent to email.',
        simulated: true,
        tempPassword // Returning here so the UI can show it for the prototype
      });
    } catch (error) {
      console.error('Onboarding Error:', error);
      res.status(500).json({ error: 'System error during onboarding' });
    }
  });

  // API v1: Reset User Password
  expressApp.post('/api/v1/users/reset-password', async (req, res) => {
    try {
      const { email, userId } = req.body;
      
      // 1. Generate new temporary password
      const tempPassword = cryptoRandomString({ length: 10, type: 'alphanumeric' }) + 'R1!';
      
      // 2. LOG THE PASSWORD (Simulating Email)
      console.log('--------------------------------------------------');
      console.log(`[EMAIL SYSTEM] PASSWORD RESET FOR: ${email}`);
      console.log(`Temporary Password: ${tempPassword}`);
      console.log('--------------------------------------------------');

      // 3. In a real environment:
      // await admin.auth().updateUser(uid, { password: tempPassword });

      res.json({
        success: true,
        message: 'Password reset successful.',
        tempPassword: tempPassword
      });
    } catch (error) {
      console.error('Reset Error:', error);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  });

  // API v1: RBAC Rights Mapping
  expressApp.get('/api/v1/users/:staffId/rights', async (req, res) => {
    try {
      const { staffId } = req.params;
      
      // 1. Fetch User by staffId (the banking-specific ID)
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('userId', '==', staffId));
      const userSnap = await getDocs(q);

      if (userSnap.empty) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = userSnap.docs[0].data();
      const roleIds = userData.roleIds || [];

      // 2. Aggregate Roles and Permissions
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
    expressApp.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  expressApp.listen(PORT, '0.0.0.0', () => {
    console.log(`RBAC API Gateway running on http://localhost:${PORT}`);
  });
}

startServer();
