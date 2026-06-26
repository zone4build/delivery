import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// VAPID key from Firebase Console (Web Push Certificate)
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Get messaging instance (only in browser)
export const getMessagingInstance = async () => {
    if (typeof window === 'undefined') return null;

    try {
        const supported = await isSupported();
        if (!supported) {
            console.log('Firebase Messaging not supported in this browser');
            return null;
        }

        return getMessaging(app);
    } catch (error) {
        console.error('Error initializing Firebase Messaging:', error);
        return null;
    }
};

// Request notification permission and get FCM token
export const requestNotificationPermission = async () => {
    try {
        const messaging = await getMessagingInstance();
        if (!messaging) {
            console.log('Firebase Messaging not available');
            return null;
        }

        // Manually register service worker to avoid registration timeouts
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        
        // Wait for service worker to be ready/active
        await navigator.serviceWorker.ready;

        // Check if permission is already granted
        if (Notification.permission === 'granted') {
            const token = await getToken(messaging, { 
                vapidKey: VAPID_KEY,
                serviceWorkerRegistration: registration
            });
            if (process.env.NODE_ENV === 'development') {
                console.log('FCM Token (already granted):', token?.substring(0, 20) + '...');
            }
            return token;
        }

        // Request permission
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await getToken(messaging, { 
                vapidKey: VAPID_KEY,
                serviceWorkerRegistration: registration
            });
            if (process.env.NODE_ENV === 'development') {
                console.log('FCM Token (newly granted):', token?.substring(0, 20) + '...');
            }
            return token;
        } else {
            console.log('Notification permission denied');
            return null;
        }
    } catch (error: any) {
        // Suppress permission-blocked and AbortError to clean up the console
        // AbortError commonly occurs in browsers that block push services (like Brave) or in Incognito mode
        const errorString = error?.toString() || '';
        if (
            error?.code === 'messaging/permission-blocked' || 
            error?.name === 'AbortError' || 
            errorString.includes('AbortError') ||
            errorString.includes('push service error') ||
            error?.message?.includes('push service error')
        ) {
            return null;
        }
        
        console.error('Error getting FCM token:', error);
        return null;
    }
};

// Listen for foreground messages
export const onMessageListener = async (callback: (payload: any) => void) => {
    const messaging = await getMessagingInstance();
    if (!messaging) return;

    onMessage(messaging, (payload) => {
        console.log('Message received in foreground:', payload);
        callback(payload);
    });
};
