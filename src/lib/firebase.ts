import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Itinerary } from '../types';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

const config = firebaseConfig as any;
const databaseId = config.firestoreDatabaseId || 'ai-studio-planzoaitravelit-5c2fec32-ffa4-490f-9261-5ad0e35c2f4d';

export const db = databaseId && databaseId !== '(default)'
  ? getFirestore(app, databaseId)
  : getFirestore(app);

// Authentication Helpers
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    if (user) {
      try {
        // Save/update user profile in Firestore
        const userRef = doc(db, 'users', user.uid);
        await setDoc(
          userRef,
          {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (fErr) {
        console.warn('Firestore user doc update warning:', fErr);
      }
    }
    return user;
  } catch (error: any) {
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request' ||
      error?.code === 'auth/popup-blocked'
    ) {
      console.log('Google sign-in popup was closed or cancelled by user.');
      return null;
    }
    console.error('Unexpected error signing in with Google:', error);
    return null;
  }
};

/**
 * Connects (or re-connects) Google Calendar OAuth with prompt: 'select_account'
 * so user can pick either their current logged-in Google account or a different Google account for Calendar.
 */
export const connectGoogleCalendarAccount = async () => {
  try {
    const calendarProvider = new GoogleAuthProvider();
    calendarProvider.addScope('https://www.googleapis.com/auth/calendar.events');
    calendarProvider.setCustomParameters({ prompt: 'select_account' });

    const result = await signInWithPopup(auth, calendarProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;
    const gcalEmail = result.user?.email;

    if (accessToken) {
      sessionStorage.setItem('gcal_access_token', accessToken);
    }
    if (gcalEmail) {
      sessionStorage.setItem('gcal_account_email', gcalEmail);
    }

    return { user: result.user, accessToken, email: gcalEmail, error: null };
  } catch (error: any) {
    console.warn('Google Calendar OAuth error:', error);
    console.error('Google Calendar OAuth detailed error:', {
      code: error?.code,
      message: error?.message,
      customData: error?.customData,
    });
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request'
    ) {
      return { user: null, accessToken: null, email: null, error: 'cancelled' };
    }
    if (error?.code === 'auth/popup-blocked') {
      return { user: null, accessToken: null, email: null, error: 'popup_blocked' };
    }
    // Google Cloud OAuth Unverified / Testing 403 access_denied
    return { user: null, accessToken: null, email: null, error: 'access_denied', message: error?.message };
  }
};

export const logoutUser = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    console.warn('Error signing out:', err);
  }
};

// Firestore Itinerary Helpers
export const saveItineraryToFirestore = async (itinerary: Itinerary, userId?: string) => {
  try {
    const itineraryRef = doc(db, 'itineraries', itinerary.id);
    const dataToSave = {
      ...itinerary,
      userId: userId || itinerary.userId || 'anonymous',
      isPublic: itinerary.isPublic ?? true,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(itineraryRef, dataToSave, { merge: true });
    return dataToSave;
  } catch (error) {
    console.warn('Note: Could not save itinerary to Firestore database (using local state fallback):', error);
    return itinerary;
  }
};

export const deleteItineraryFromFirestore = async (itineraryId: string) => {
  try {
    const itineraryRef = doc(db, 'itineraries', itineraryId);
    await deleteDoc(itineraryRef);
  } catch (error) {
    console.warn('Note: Could not delete itinerary from Firestore:', error);
  }
};

export const subscribeUserTrips = (userId: string, callback: (trips: Itinerary[]) => void) => {
  try {
    const q = query(
      collection(db, 'itineraries'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const trips: Itinerary[] = [];
        snapshot.forEach((docSnap) => {
          trips.push(docSnap.data() as Itinerary);
        });
        callback(trips);
      },
      (error) => {
        console.warn('Firestore subscription notice (User Trips):', error.message || error);
      }
    );
  } catch (err) {
    console.warn('Firestore subscription unavailable for user trips:', err);
    return () => {};
  }
};

export const subscribeCommunityTrips = (callback: (trips: Itinerary[]) => void) => {
  try {
    const q = query(collection(db, 'itineraries'), orderBy('createdAt', 'desc'), limit(9));

    return onSnapshot(
      q,
      (snapshot) => {
        const trips: Itinerary[] = [];
        snapshot.forEach((docSnap) => {
          trips.push(docSnap.data() as Itinerary);
        });
        callback(trips);
      },
      (error) => {
        console.warn('Firestore subscription notice (Community Trips):', error.message || error);
      }
    );
  } catch (err) {
    console.warn('Firestore subscription unavailable for community trips:', err);
    return () => {};
  }
};

export { onAuthStateChanged };
export type { User };
