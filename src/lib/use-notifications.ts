import { useEffect, useState } from 'react';
import { requestNotificationPermission, onMessageListener } from './firebase';
import { registerFCMToken, subscribeToTopic as subscribeToTopicApi } from './notification-api';
import { getUserDataFromCookie } from './jwt-utils';

interface UseNotificationsOptions {
    userId?: string;
    authToken?: string;
    onMessage?: (payload: any) => void;
    autoRequest?: boolean;
}

export const useNotifications = ({
    userId,
    authToken,
    onMessage,
    autoRequest = true
}: UseNotificationsOptions = {}) => {
    const [token, setToken] = useState<string | null>(null);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Request notification permission
    const requestPermission = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const fcmToken = await requestNotificationPermission();

            if (fcmToken) {
                setToken(fcmToken);
                setPermission('granted');

                // Try to get user data from cookie if not provided via props
                const cookieData = getUserDataFromCookie();
                const effectiveUserId = userId || cookieData?.userId;
                const effectiveAuthToken = authToken || cookieData?.authToken;

                // Register token with backend if authenticated
                if (effectiveUserId && effectiveAuthToken) {
                    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
                        console.log('🔐 [Localhost] Skipping FCM backend registration to avoid CORS errors.');
                    } else {
                        await registerFCMToken(fcmToken, effectiveUserId, effectiveAuthToken);
                    }
                }

                return fcmToken;
            } else {
                // Safe check for Notification API which is missing in some WebViews
                const currentPermission = typeof Notification !== 'undefined' ? Notification.permission : 'default';
                setPermission(currentPermission as NotificationPermission);
                return null;
            }
        } catch (err: any) {
            console.error('Error requesting notification permission:', err);
            setError(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-request on mount
    useEffect(() => {
        if (autoRequest && permission === 'default') {
            console.log('🔔 Auto-requesting notification permission for user (guest or logged in)...');
            requestPermission();
        }
    }, [autoRequest]);

    // Register token when auth becomes available
    useEffect(() => {
        const cookieData = getUserDataFromCookie();
        const effectiveUserId = userId || cookieData?.userId;
        const effectiveAuthToken = authToken || cookieData?.authToken;

        if (token && effectiveUserId && effectiveAuthToken) {
            if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
                console.log('🔐 [Localhost] Auth state detected, but skipping FCM token sync to avoid 502/CORS errors.');
                return;
            }
            
            console.log('🔐 Auth state detected with FCM token, syncing token to backend...');
            registerFCMToken(token, effectiveUserId, effectiveAuthToken).catch(err => {
                console.error('Failed to sync lazy FCM token:', err);
            });
        }
    }, [token, userId, authToken]);

    // Generic subscribe function
    const subscribeToTopic = async (topic: string) => {
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            return null;
        }

        const cookieData = getUserDataFromCookie();
        const effectiveAuthToken = authToken || cookieData?.authToken;

        if (!token || !effectiveAuthToken) {
            console.log('FCM token or auth token not available for shop topic subscription');
            return null;
        }

        return await subscribeToTopicApi(token, topic, effectiveAuthToken);
    };

    // Listen for foreground messages
    useEffect(() => {
        if (onMessage) {
            onMessageListener(onMessage);
        }
    }, [onMessage]);

    return {
        token,
        permission,
        isLoading,
        error,
        requestPermission,
        subscribeToTopic
    };
};
