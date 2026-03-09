import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { authConfig } from "@/auth.config";

interface DbUser {
  id: number;
  email: string;
  password: string;
  role: string;
  created_at: string;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string | undefined)?.trim().toLowerCase();
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        const existing = db
          .prepare("SELECT * FROM users WHERE email = ?")
          .get(email) as DbUser | undefined;

        if (!existing) {
          // ── New user: hash password and insert ──
          const hashed = await bcrypt.hash(password, 12);
          const result = db
            .prepare("INSERT INTO users (email, password) VALUES (?, ?)")
            .run(email, hashed);

          return {
            id: String(result.lastInsertRowid),
            email,
            role: "user",
          };
        }

        // ── Existing user: verify password ──
        const valid = await bcrypt.compare(password, existing.password);
        if (!valid) return null;

        return {
          id: String(existing.id),
          email: existing.email,
          role: existing.role ?? "user",
        };
      },
    }),
  ],
});
