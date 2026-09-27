import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getGithubToken } from "@/lib/github/token";
import { getPullRequestDiff, getPullRequestFiles } from "@/lib/github/octokit";
import { runFullReview } from "@/lib/analysis/review-engine";

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

  if (!prNumber) {
    return NextResponse.json({ error: "prNumber is required" }, { status: 400 });
  }

  const token = await getGithubToken(session.user.id);
  if (!token) {
    return NextResponse.json({ error: "No GitHub token found" }, { status: 401 });
  }

  // Fetch the PR diff and file list from GitHub
  let prDiff = "";
  let prFiles: string[] = [];
  let prTitle = `PR #${prNumber}`;
  try {
    prDiff = await getPullRequestDiff(token, owner, repo, prNumber);
    const files = await getPullRequestFiles(token, owner, repo, prNumber);
    prFiles = files.map((f) => f.filename);
    // Get PR title
    const { Octokit } = await import("@octokit/rest");
    const octokit = new Octokit({ auth: token });
    const { data: pr } = await octokit.pulls.get({ owner, repo, pull_number: prNumber });
    prTitle = pr.title;
  } catch (e) {
    console.error("GitHub fetch error:", e);
  }

  // Load the contract if provided
  let contractJson = "{}";
  if (contractId) {
    const contract = await prisma.architecturalContract.findUnique({
      where: { id: contractId },
      select: { contractJson: true },
    });
    if (contract) contractJson = contract.contractJson;
  }

  // Run the review pipeline
  const result = await runFullReview(contractJson, prDiff, prFiles);

  // Patch in the real PR number/title
  const finalResult = { ...result, prNumber, prTitle };

  // Persist review record
  try {
    const fullName = `${owner}/${repo}`;
    const repoRecord = await prisma.repository.findFirst({
      where: { fullName },
    });
    if (repoRecord && contractId) {
      const review = await prisma.pullRequestReview.create({
        data: {
          prNumber,
          prTitle,
          status: "reviewed",
          contractId,
          userId: session.user.id,
          reviewJson: JSON.stringify(finalResult),
        },
      });

      // Save findings
      for (const finding of finalResult.findings) {
        await prisma.reviewFinding.create({
          data: {
            reviewId: review.id,
            type: finding.type,
            severity: finding.severity,
            title: finding.title,
            description: finding.description,
            filePath: finding.filePath ?? null,
            lineNumber: finding.lineNumber ?? null,
            suggestion: finding.suggestion ?? null,
          },
        });
      }

      // Update contract status based on findings
      const hasDrift = finalResult.findings.some((f) => f.type === "drift" && f.severity === "high");
      await prisma.architecturalContract.update({
        where: { id: contractId },
        data: { status: hasDrift ? "drift_detected" : "verified" },
      });
    }
  } catch (e) {
    console.error("DB persist error:", e);
    // Non-fatal — still return the result
  }

  return NextResponse.json(finalResult);
}
