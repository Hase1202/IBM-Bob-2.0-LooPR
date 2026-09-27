import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  basePath: "/api/auth",
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID || process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.AUTH_GITHUB_SECRET || process.env.GITHUB_CLIENT_SECRET || "",
      authorization: { params: { scope: "read:user user:email repo", prompt: "consent" } },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
          githubLogin: profile.login,
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account && user.id) {
        // NextAuth doesn't update existing accounts on sign in. We must manually update the token
        // so that scopes like `repo` are applied when the user re-authenticates.
        try {
          await prisma.account.update({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
            data: {
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              scope: account.scope,
            },
          });
        } catch (e) {
          // Ignores if account doesn't exist yet (handled by adapter on first sign up)
        }
      }
      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // Fetch githubLogin from our User record
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { githubLogin: true },
        });
        (session.user as typeof session.user & { githubLogin?: string }).githubLogin =
          dbUser?.githubLogin ?? undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
