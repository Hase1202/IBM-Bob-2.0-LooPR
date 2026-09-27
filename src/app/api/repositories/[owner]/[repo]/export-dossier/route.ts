import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateDossierMarkdown } from "@/lib/analysis/dossier";
import type { ReviewResult } from "@/lib/analysis/review-engine";
import * as fs from "fs";
import * as path from "path";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { owner, repo } = await params;
  const body = await req.json();
  const { prNumber, contractId } = body as { prNumber: number; contractId?: string };

  // Find latest review for this PR
  let reviewResult: ReviewResult | null = null;
  let contractLabel = `PR #${prNumber}`;

  if (contractId) {
    const dbReview = await prisma.pullRequestReview.findFirst({
      where: { prNumber, contractId, userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    if (dbReview?.reviewJson) {
      try {
        reviewResult = JSON.parse(dbReview.reviewJson) as ReviewResult;
      } catch { /* ignore */ }
    }

    const contract = await prisma.architecturalContract.findUnique({
      where: { id: contractId },
      select: { feature: true },
    });
    if (contract) contractLabel = contract.feature;
  }

  if (!reviewResult) {
    return NextResponse.json({ error: "No review found. Run the review first." }, { status: 404 });
  }

  const markdown = generateDossierMarkdown(reviewResult, contractLabel);
  const slug = contractLabel.toLowerCase().replace(/\s+/g, "-");
  const outDir = path.join(process.cwd(), ".bob", "reviews");
  fs.mkdirSync(outDir, { recursive: true });
  const filename = `${slug}-pr${prNumber}-review.md`;
  fs.writeFileSync(path.join(outDir, filename), markdown, "utf-8");

  return NextResponse.json({ ok: true, path: `.bob/reviews/${filename}` });
}
