import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
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
    async signIn({ user, account, profile }) {
      if (account?.provider === "github" && profile?.login) {
        await prisma.user.update({
          where: { id: user.id },
          data: { githubLogin: profile.login as string },
        }).catch(() => {
          // User may not exist yet on first sign-in — adapter handles creation
        });
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
});
