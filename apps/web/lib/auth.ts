import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { env } from './env';

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: env.NEXTAUTH_SECRET,
  providers: [Google({ clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET })],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === 'google' && profile) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p = profile as any;
        const res = await fetch(`${env.USER_SERVICE_URL}/auth/google`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-internal-secret': env.INTERNAL_SERVICE_SECRET },
          body: JSON.stringify({
            googleId: p.sub,
            email: profile.email,
            name: profile.name ?? profile.email,
            avatarUrl: p.picture,
          }),
        });
        if (!res.ok) throw new Error('user-service login failed');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await res.json() as any;
        token.appAccessToken = data.accessToken;
        token.appRefreshToken = data.refreshToken;
        token.userId = data.user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const s = session as any;
      s.appAccessToken = token.appAccessToken;
      s.userId = token.userId;
      return s;
    },
  },
});
