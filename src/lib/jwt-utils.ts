/**
 * JWT Utility Functions
 * Decode JWT tokens and extract user data from cookies
 */

/**
 * Decode a JWT token (without verification - client-side only)
 * @param token - The JWT token string
 * @returns Decoded payload or null if invalid
 */
export const decodeJWT = (token: string): any | null => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const payload = parts[1];
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
};

/**
 * Extract user data from the auth_token cookie
 * @returns Object with userId and authToken, or null if not found
 */
export const getUserDataFromCookie = (): { userId: string; authToken: string } | null => {
    if (typeof window === 'undefined') return null;

    // Find the auth_token cookie
    const authCookie = document.cookie
        .split('; ')
        .find(c => c.startsWith('auth_token='));

    if (!authCookie) {
        console.log('No auth_token cookie found');
        return null;
    }

    const token = authCookie.split('=')[1];
    const payload = decodeJWT(token);

    if (!payload?.sub) {
        console.log('Invalid JWT payload - no sub claim');
        return null;
    }

    console.log('✅ Extracted user data from cookie:', { userId: payload.sub });

    return {
        userId: payload.sub,
        authToken: token
    };
};
