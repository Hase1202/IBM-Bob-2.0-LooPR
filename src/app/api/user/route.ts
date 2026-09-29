import { NextRequest, NextResponse } from "next/server";
import { rbacGuard } from "@/middleware/auth";

export async function GET(req: NextRequest) {
  // Use the central rbacGuard middleware to enforce architecture contract
  const authResponse = rbacGuard("admin")(req);
  if (authResponse) {
    return authResponse;
  }

  return NextResponse.json({ user: { id: "user-123", name: "Alice" } });
}
