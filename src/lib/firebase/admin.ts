import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin for server-side operations
if (!getApps().length) {
  try {
    // If running locally without service account, it will try to use ADC (Application Default Credentials)
    // For a real production app, FIREBASE_PRIVATE_KEY is injected into the environment.
    const serviceAccount = process.env.FIREBASE_PRIVATE_KEY 
      ? {
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        } 
      : undefined;

    initializeApp(
      serviceAccount 
        ? { credential: cert(serviceAccount) } 
        : { projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID }
    );
  } catch (error: any) {
    console.error('Firebase admin initialization error:', error.stack);
  }
}

export const adminDb = getFirestore();
