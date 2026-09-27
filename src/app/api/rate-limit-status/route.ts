import { NextRequest, NextResponse } from "next/server";
import { limit } from "@/lib/rateLimit";

/**
 * GET /api/rate-limit-status
 *
 * Returns the current rate limit status for the requesting IP.
 * Uses the approved shared abstraction (ADR-021): src/lib/rateLimit.ts
 * Response shape: { allowed: boolean; remaining: number; resetAt: number }
 */
export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  const result = limit(ip, 60, 60_000);

  if (!result.allowed) {
    return NextResponse.json(
      { allowed: false, remaining: 0, resetAt: result.resetAt },
      { status: 429 }
    );
  }

  return NextResponse.json({
    allowed: result.allowed,
    remaining: result.remaining,
    resetAt: result.resetAt,
  });
}
