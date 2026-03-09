import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config — no Node.js-only imports.
 * Used by middleware to decode the JWT without touching the database.
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "user";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (token.id) session.user.id = token.id as string;
        (session.user as { role?: string }).role = (token.role as string) ?? "user";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  providers: [], // Filled-in by auth.ts on the Node.js side
};
