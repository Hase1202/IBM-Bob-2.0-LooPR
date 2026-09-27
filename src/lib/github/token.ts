import { prisma } from "@/lib/db";

/**
 * Looks up the GitHub access_token stored by PrismaAdapter for a given user.
 */
export async function getGithubToken(userId: string): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "github" },
    select: { access_token: true },
  });
  return account?.access_token ?? null;
}
