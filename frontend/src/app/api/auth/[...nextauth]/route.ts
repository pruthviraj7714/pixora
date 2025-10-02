import { BACKEND_URL } from "@/lib/config";
import axios from "axios";
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "text" },
      },
      async authorize(credentials, req) {
        const res = await axios.post(`${BACKEND_URL}/user/signin`, {
          username: credentials?.username,
          password: credentials?.password,
        });

        if (res.status !== 200) return null; 

        if (!res.data.token) return null;

        return {
          id: res.data.id,
          token: res.data.token,
          role: res.data.role,
          username : res.data.username
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.token;
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id as string,
        role: token.role,
        username : token.username

      };
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };