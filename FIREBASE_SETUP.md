# Firebase Setup Guide for SnipSnap

This guide will walk you through setting up Firebase for SnipSnap with Anonymous Authentication and Firestore Database.

## Prerequisites

- A Google account
- Node.js and npm installed

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "SnipSnap")
4. (Optional) Enable Google Analytics
5. Click "Create project"

## Step 2: Register Your Web App

1. In your Firebase project, click the **Web icon** (`</>`) to add a web app
2. Enter an app nickname (e.g., "SnipSnap Web")
3. **Do NOT** check "Firebase Hosting" (unless you plan to use it)
4. Click "Register app"
5. Copy the Firebase configuration object - you'll need these values

## Step 3: Enable Anonymous Authentication

1. In the Firebase Console, go to **Authentication** (left sidebar)
2. Click "Get started" if this is your first time
3. Go to the **Sign-in method** tab
4. Find **Anonymous** in the providers list
5. Click on it, toggle **Enable**, and click **Save**

## Step 4: Create Firestore Database

1. In the Firebase Console, go to **Firestore Database** (left sidebar)
2. Click "Create database"
3. Select a location for your database (choose one closest to your users)
4. Start in **Production mode** (we'll set up rules next)
5. Click "Create"

## Step 5: Configure Firestore Security Rules

1. In Firestore Database, go to the **Rules** tab
2. Replace the default rules with the following:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // User's tasks subcollection
      match /tasks/{taskId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click **Publish** to save the rules

## Step 6: Configure Your App

1. Create a `.env` file in your project root (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Add your Firebase configuration values to `.env`:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

3. Replace `your_api_key_here`, `your_project_id`, etc., with the actual values from Step 2

## Step 7: Install Dependencies

If you haven't already, install the Firebase package:

```bash
npm install firebase
```

## Step 8: Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your app in the browser
3. The app should automatically sign in anonymously
4. Try creating a task - it should save to Firestore
5. Check the Firestore Database in the Firebase Console to see your data

## Firestore Data Structure

Your data is organized as follows:

```
users (collection)
└── {userId} (document - Anonymous Auth UID)
    └── tasks (subcollection)
        └── {taskId} (document)
            ├── text: string
            ├── completed: boolean
            ├── imageUrl?: string
            ├── createdAt: timestamp
            └── updatedAt: timestamp
```

## Security Features

✅ **Anonymous Authentication**: Each user gets a unique UID automatically
✅ **User Isolation**: Users can only see their own tasks
✅ **Secure Rules**: Firestore rules prevent unauthorized access
✅ **Client-Side SDK**: All Firebase operations happen securely through the SDK

## Troubleshooting

### "Failed to authenticate user"
- Make sure Anonymous Authentication is enabled in Firebase Console
- Check your internet connection

### "Permission denied" errors
- Verify your Firestore security rules are configured correctly
- Make sure the user is authenticated before making database calls

### Tasks not loading
- Check the browser console for errors
- Verify your Firebase config in `.env` is correct
- Make sure Firestore is created and rules are published

### Data not showing in Firestore Console
- It may take a few seconds to appear
- Refresh the Firestore Database page
- Check that you're looking in the right location: `users/{userId}/tasks`

## Next Steps

- Set up Firebase Analytics to track usage
- Add Firebase Storage for larger image uploads
- Implement Firebase Cloud Functions for server-side logic
- Add Firebase Authentication with email/password or social providers

## Important Notes

⚠️ **Anonymous Auth Considerations**:
- Anonymous users are temporary by default
- If a user clears their browser data, they'll get a new UID and lose access to their previous tasks
- Consider implementing account linking or email authentication for permanent accounts

📝 **API Keys**:
- Firebase web API keys are designed to be public
- Your security comes from Firestore Security Rules, not hiding API keys
- Never put backend/admin SDK credentials in client-side code

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Anonymous Authentication](https://firebase.google.com/docs/auth/web/anonymous-auth)
