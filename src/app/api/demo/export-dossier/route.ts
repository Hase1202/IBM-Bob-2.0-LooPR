import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import { DEMO_REVIEW_RESULT, DEMO_CONTRACT_FULL } from "@/lib/demo/data";
import { generateDossierMarkdown } from "@/lib/analysis/dossier";
import type { ReviewResult } from "@/lib/analysis/review-engine";

export async function POST() {
  try {
    const dossier = generateDossierMarkdown(
      DEMO_REVIEW_RESULT as unknown as ReviewResult,
      DEMO_CONTRACT_FULL.featureLabel
    );

    const outDir = path.join(process.cwd(), ".bob", "reviews");
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(
      path.join(outDir, "currency-cache-review.md"),
      dossier,
      "utf-8"
    );

    return NextResponse.json({ ok: true, path: ".bob/reviews/currency-cache-review.md" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
