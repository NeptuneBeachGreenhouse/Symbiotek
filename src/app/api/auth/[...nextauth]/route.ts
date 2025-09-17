import NextAuth from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (session.user && token?.sub) {
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
