# Demo Admin User Setup

## Quick Start Credentials

**Email:** `bankasia.prioritybanking@gmail.com`  
**Password:** `Admin@123456`

## How to Create the Admin User

### Method 1: Using the Seed Script (Requires Firebase Admin SDK)

If you have Firebase Admin credentials set up:

```bash
# Set the Firebase service account credentials
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# Run the seed script
npx tsx scripts/seed-admin-user.ts
```

### Method 2: Manual Setup via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `gen-lang-client-0330716857`
3. Navigate to **Authentication** → **Users**
4. Click **Create user**
5. Enter:
   - **Email:** `bankasia.prioritybanking@gmail.com`
   - **Password:** `Admin@123456`
6. Create a corresponding document in Firestore:
   - Collection: `users`
   - Document ID: (use the UID from step 5)
   - Add fields as shown in `scripts/seed-admin-user.ts`

## First Login Flow

1. Log in with the credentials above
2. System will prompt you to change the password (30-day rotation policy)
3. Enter a new password following the requirements:
   - At least 8 characters
   - At least 1 uppercase letter
   - At least 1 lowercase letter
   - At least 1 number

## Security Notes

⚠️ **These are demo credentials only** — Change immediately in production.

- The admin account has access to all system features
- Password changes are tracked in Firestore (`passwordLastChanged` field)
- All authentication is handled by Firebase
- Email domain restriction: Only `@bankasia-bd.com` and admin exception email allowed

## Troubleshooting

**"Access restricted to @bankasia-bd.com accounts"**
- The email `bankasia.prioritybanking@gmail.com` is the only allowed exception
- Ensure it matches exactly

**"User not found or invalid password"**
- Check that the user was created successfully in Firebase Console
- Verify the Firestore user document exists

**Cannot change password on first login**
- Ensure you entered a valid password (8+ chars, uppercase, lowercase, number)
- Check browser console for validation messages
