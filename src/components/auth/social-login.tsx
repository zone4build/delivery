import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useSocialLogin } from '@/framework/user';

const SocialLogin = () => {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const { mutate: socialLogin, error } = useSocialLogin();
  useEffect(() => {
    // is true when valid social login access token and provider is available in the session
    // but not authorize/logged in
    if (session?.access_token && session?.provider) {
      socialLogin({
        provider: session.provider as string,
        access_token: session.access_token as string,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  if (!error) return null;
  return <div>{(error as any)?.message}</div>;
};

export default SocialLogin;
