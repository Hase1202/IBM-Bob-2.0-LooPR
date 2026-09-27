import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { owner, repo } = await params;
  const fullName = `${owner}/${repo}`;
  const body = await req.json();
  const { featureName, description } = body as { featureName: string; description: string };

  if (!featureName?.trim()) {
    return NextResponse.json({ error: "featureName is required" }, { status: 400 });
  }

  // Upsert the repository record
  let repoRecord = await prisma.repository.findFirst({
    where: { fullName },
  });
  if (!repoRecord) {
    repoRecord = await prisma.repository.create({
      data: { name: repo, fullName, userId: session.user.id },
    });
  }

  // Build the contract JSON
  const contractJson = JSON.stringify({
    feature: featureName,
    description,
    requirements: [
      "Implement feature as described",
      "Follow existing patterns in the repository",
      "Do not introduce duplicate abstractions",
      "Preserve compatibility with existing consumers",
      "Handle edge cases and failures gracefully",
    ],
    requiredDependencies: [],
    forbiddenPatterns: [],
    architectureRules: [],
    expectedInterfaces: [],
    edgeCases: [],
  });

  const contract = await prisma.architecturalContract.create({
    data: {
      feature: featureName,
      description: description ?? "",
      status: "active",
      contractJson,
      repoId: repoRecord.id,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ id: contract.id, feature: contract.feature });
}
