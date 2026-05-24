self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.hostname.includes('api.zone4build.com')) {
    event.respondWith(fetch(event.request));
    return;
  }
});

// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase configuration
// Note: These values should match your .env configuration
const firebaseConfig = {
    apiKey: "AIzaSyAS6q3C2Ind34lSPJ3LnF72Fne8DYH30n8",
    authDomain: "zone4build-a71ed.firebaseapp.com",
    projectId: "zone4build-a71ed",
    storageBucket: "zone4build-a71ed.firebasestorage.app",
    messagingSenderId: "19241849715",
    appId: "1:19241849715:web:3cd3af33400dbf3e4d2b06",
    measurementId: "G-ZVEW98QCYJ"
};

// Initialize Firebase in service worker
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Background message received:', payload);

    const notificationTitle = payload.notification?.title || payload.data?.title || 'New Notification';
    const notificationOptions = {
        body: payload.notification?.body || payload.data?.message || '',
        icon: '/icon-192x192.png',
        badge: '/icon-96x96.png',
        tag: payload.data?.tag || 'notification',
        data: {
            url: payload.data?.url || '/',
            ...payload.data
        },
        requireInteraction: false,
        vibrate: [200, 100, 200]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification clicked:', event.notification);

    event.notification.close();

    // Get the URL from notification data or default to home
    const urlToOpen = event.notification.data?.url || '/';

    // Open or focus the app window
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUninstalled: false })
            .then((clientList) => {
                // Check if there's already a window open
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // If no window is open, open a new one
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});
