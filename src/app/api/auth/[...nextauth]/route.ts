import NextAuth from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';
import type { JWT } from 'next-auth/jwt';
const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? '',
      clientSecret: process.env.GOOGLE_SECRET ?? '',
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async session({ session, token }: { session: any; token: JWT }) {
      if (session.user && token?.sub) {
        (session.user as any).id = token.sub as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
