import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
        };
        token: string;
        permissions: string[];
    }

    interface User {
        id: string;
        email: string;
        name: string;
        token?: string;
        permissions?: string[];
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        email: string;
        name: string;
        accessToken: string;
        refreshToken: string;
        accessTokenExpires: number;
        expiresIn: number;
        tokenType: string;
        permissions: string[];
        error?: string;
    }
}
