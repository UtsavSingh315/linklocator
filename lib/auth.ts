import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { admins } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const admin = await db
          .select()
          .from(admins)
          .where(eq(admins.email, credentials.email as string))
          .limit(1);

        if (!admin.length) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password as string,
          admin[0].password
        );

        if (!isValidPassword) {
          return null;
        }

        return {
          id: admin[0].id,
          email: admin[0].email,
          name: admin[0].name,
        };
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});
