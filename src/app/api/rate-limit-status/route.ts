import { NextRequest, NextResponse } from "next/server";

/**
 * BROKEN IMPLEMENTATION — intentional violations for IntentLoop testing:
 *
 * Violation 1 (ADR-021): Implements its own in-memory counter instead of
 *   using the approved `src/lib/rateLimit.ts` abstraction.
 *
 * Violation 2 (Interface): Returns `{ limited: boolean }` instead of the
 *   required `{ allowed: boolean; remaining: number; resetAt: number }`.
 *
 * Violation 3 (Architecture): Rate limiting logic lives inside the route
 *   handler instead of being applied at the middleware layer.
 */

// Direct in-memory counter — forbidden by ADR-021
const requestCounts = new Map<string, { count: number; ts: number }>();

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const now = Date.now();
  const window = 60_000;
  const maxRequests = 10;

  const entry = requestCounts.get(ip);

  // Reset window if expired
  if (!entry || now - entry.ts > window) {
    requestCounts.set(ip, { count: 1, ts: now });
  } else {
    entry.count += 1;
  }

  const current = requestCounts.get(ip)!;

  if (current.count > maxRequests) {
    // Wrong response shape — should be { allowed, remaining, resetAt }
    return NextResponse.json({ limited: true }, { status: 429 });
  }

  return NextResponse.json({ limited: false });
}
