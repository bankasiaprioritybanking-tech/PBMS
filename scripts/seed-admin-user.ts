import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADMIN_EMAIL = 'bankasia.prioritybanking@gmail.com';
const ADMIN_PASSWORD = 'Admin@123456';
const ADMIN_NAME = 'System Administrator';
const ADMIN_USER_ID = 'ADMIN001';

async function seedAdminUser() {
  try {
    // Load Firebase config
    const firebaseConfig = JSON.parse(
      readFileSync(path.join(__dirname, '../firebase-applet-config.json'), 'utf-8')
    );

    // Initialize Firebase Admin (requires GOOGLE_APPLICATION_CREDENTIALS env var)
    const app = initializeApp({
      projectId: firebaseConfig.projectId,
    });

    const auth = getAuth(app);
    const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

    console.log('🔧 Setting up demo admin user...');
    console.log(`📧 Email: ${ADMIN_EMAIL}`);
    console.log(`🔐 Password: ${ADMIN_PASSWORD}`);

    // Create user in Firebase Auth
    let user;
    try {
      user = await auth.getUserByEmail(ADMIN_EMAIL);
      console.log('✅ User already exists in Firebase Auth');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        user = await auth.createUser({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          displayName: ADMIN_NAME,
        });
        console.log('✅ Created user in Firebase Auth:', user.uid);
      } else {
        throw error;
      }
    }

    // Create/update user document in Firestore
    const userRef = db.collection('users').doc(user.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        uid: user.uid,
        userId: ADMIN_USER_ID,
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        phone: '+880-1234-567890',
        branch: 'Head Office',
        division: 'Administration',
        functionalDesignation: 'System Administrator',
        roleIds: ['admin'], // Assuming 'admin' role exists
        status: 'ACTIVE',
        isLocked: false,
        mustChangePassword: false,
        displayPreferences: {
          theme: 'dark',
          notifications: true,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log('✅ Created admin user document in Firestore');
    } else {
      console.log('✅ Admin user document already exists in Firestore');
    }

    console.log('\n✨ Demo admin user setup complete!');
    console.log('\n📋 Test Credentials:');
    console.log('────────────────────────────────');
    console.log(`Email:    ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log('────────────────────────────────');
    console.log('\nNote: User must change password on first login.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    process.exit(1);
  }
}

seedAdminUser();
