import { NextApiRequest, NextApiResponse } from 'next';
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { getAccessMode } from '@/lib/routing-constants';

const PUBLIC_REST_API = process.env.NEXT_PUBLIC_REST_API_ENDPOINT || "https://api.zone4build.com/commerce";
const PUBLIC_AUTH_API = process.env.NEXT_PUBLIC_AUTH_URL || "https://api.zone4build.com/auth";

async function refreshAccessToken(token: any, SSR_AUTH_ENDPOINT: string, tenantId: string) {
  try {
    const response = await fetch(`${SSR_AUTH_ENDPOINT}/${tenantId}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: token.refreshToken }),
    });
    const refreshedTokens = await response.json();
    if (!response.ok) throw refreshedTokens;
    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + (refreshedTokens.expires_in * 1000),
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('❌ Error refreshing access token:', error);
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}

function getEndpoints() {
  const isVercel = process.env.VERCEL === '1';
  const SSR_REST_ENDPOINT = (isVercel || !process.env.INTERNAL_REST_API_URL?.startsWith('http'))
    ? PUBLIC_REST_API
    : process.env.INTERNAL_REST_API_URL!;

  let internalAuth = process.env.INTERNAL_AUTH_API_URL || process.env.INTERNAL_API_URL;
  if (internalAuth?.includes('commerce-api')) {
    internalAuth = internalAuth.replace('commerce-api', 'auth-api');
  }

  let SSR_AUTH_ENDPOINT = (isVercel || !internalAuth?.startsWith('http'))
    ? PUBLIC_AUTH_API
    : internalAuth;

  if (SSR_AUTH_ENDPOINT.includes('api.zone4build.com') && !SSR_AUTH_ENDPOINT.includes('/auth')) {
    SSR_AUTH_ENDPOINT = SSR_AUTH_ENDPOINT.replace('api.zone4build.com', 'api.zone4build.com/auth');
  }

  return { SSR_REST_ENDPOINT, SSR_AUTH_ENDPOINT };
}

function resolveShopSlugFromRequest(host: string, tenantId: string): string | null {
  const accessMode = getAccessMode(host);
  if (accessMode === 'custom') return null; // Logic from shop-2200 uses tenantId as fallback
  
  const hostParts = host.replace('www.', '').split('.');
  if (hostParts.length < 2) return null;
  return hostParts[0].split(':')[0];
}

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  const { SSR_REST_ENDPOINT, SSR_AUTH_ENDPOINT } = getEndpoints();
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || 'store2200';
  const host = req.headers.host || '';
  
  // Dynamic Shop Resolution
  const resolvedShopSlug = resolveShopSlugFromRequest(host, tenantId) || tenantId;

  let googleClientId = '';
  let googleClientSecret = '';

  // Fetch Tenant Shop Settings for Google Config
  try {
    const [shopRes, settingsRes] = await Promise.all([
      fetch(`${SSR_REST_ENDPOINT}/shops/${resolvedShopSlug}`, { headers: { 'X-Tenant-ID': tenantId } }),
      fetch(`${SSR_REST_ENDPOINT}/settings`, { headers: { 'X-Tenant-ID': tenantId } })
    ]);

    let shopData = shopRes.ok ? await shopRes.json() : null;
    let settingsData = settingsRes.ok ? await settingsRes.json() : null;
    if (Array.isArray(settingsData)) settingsData = settingsData[0];
    
    const shopGoogle = shopData?.settings?.google;
    const globalGoogle = settingsData?.options?.google;

    if (shopGoogle?.isEnable && shopGoogle?.clientId && shopGoogle?.clientSecret) {
      googleClientId = shopGoogle.clientId;
      googleClientSecret = shopGoogle.clientSecret;
    } else if (globalGoogle?.isEnable && globalGoogle?.clientId && globalGoogle?.clientSecret) {
      googleClientId = globalGoogle.clientId;
      googleClientSecret = globalGoogle.clientSecret;
    }
  } catch (error) {
    console.error('Failed to fetch dynamic settings for NextAuth:', error);
  }

  const providers: any[] = [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        tenantId: { label: "Tenant ID", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const targetTenant = (credentials as any)?.tenantId || tenantId;
        const isGoogleLogin = (credentials as any).google_id_token;

        try {
          let authData;
          if (isGoogleLogin) {
            const response = await fetch(`${SSR_AUTH_ENDPOINT}/${targetTenant}/login/google`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                id_token: (credentials as any).google_id_token,
                access_token: (credentials as any).google_access_token 
              }),
            });
            if (!response.ok) return null;
            authData = await response.json();
          } else {
            const response = await fetch(`${SSR_AUTH_ENDPOINT}/${targetTenant}/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                login: credentials.email,
                password: credentials.password,
              }),
            });
            if (!response.ok) return null;
            authData = await response.json();
          }

          const userResponse = await fetch(`${SSR_REST_ENDPOINT}/me`, {
            headers: {
              'Authorization': `Bearer ${authData.access_token}`,
              'X-Tenant-ID': targetTenant,
            },
          });
          if (!userResponse.ok) return null;
          const userData = await userResponse.json();

          return {
            id: userData.id?.toString() || '',
            email: userData.email,
            name: userData.name,
            accessToken: authData.access_token,
            refreshToken: authData.refresh_token,
            expiresIn: authData.expires_in,
          };
        } catch (error) {
          console.error('[NextAuth] Authorize error:', error);
          return null;
        }
      },
    }),
  ];

  if (googleClientId && googleClientSecret) {
    providers.push(
      GoogleProvider({
        clientId: googleClientId,
        clientSecret: googleClientSecret,
      })
    );
  }

  // Dynamic NEXTAUTH_URL for custom domains
  if (host) {
    const protocol = process.env.NODE_ENV === 'development' && host.includes('localhost') ? 'http' : 'https';
    process.env.NEXTAUTH_URL = `${protocol}://${host}`;
  }

  return await NextAuth(req, res, {
    providers,
    secret: process.env.NEXTAUTH_SECRET,
    session: { strategy: 'jwt' },
    callbacks: {
      async jwt({ token, user, account }: any) {
        if (user && account?.provider === 'credentials') {
          token.accessToken = user.accessToken;
          token.refreshToken = user.refreshToken;
          token.accessTokenExpires = Date.now() + (user.expiresIn * 1000);
          token.provider = 'credentials';
          return token;
        }

        if (account && account.provider === 'google' && (account.access_token || account.id_token)) {
           try {
               const loginResponse = await fetch(`${SSR_AUTH_ENDPOINT}/${tenantId}/login/google`, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ 
                   access_token: account.access_token,
                   id_token: account.id_token
                 })
               });
               if (!loginResponse.ok) return token;
               const authData = await loginResponse.json();
               const userResponse = await fetch(`${SSR_REST_ENDPOINT}/me`, {
                 headers: {
                   'Authorization': `Bearer ${authData.access_token}`,
                   'X-Tenant-ID': tenantId,
                 },
               });
               const userData = await userResponse.json();
               token.accessToken = authData.access_token;
               token.refreshToken = authData.refresh_token;
               token.accessTokenExpires = Date.now() + (authData.expires_in * 1000);
               token.provider = 'google';
               return token;
           } catch(e) { console.error(e); }
        }

        if (Date.now() < (token.accessTokenExpires as number)) {
          return token;
        }
        return refreshAccessToken(token, SSR_AUTH_ENDPOINT, tenantId);
      },
      async session({ session, token }: any) {
        session.token = token.accessToken;
        session.provider = token.provider;
        return session;
      },
    },
    trustHost: true,
  } as any);
}
