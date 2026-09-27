import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // DRIFT VIOLATION 1: Inspecting raw tokens directly instead of using central middleware
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  // DRIFT VIOLATION 2: Hardcoding the sensitive key instead of using process.env.JWT_SECRET
  const jwtSecret = process.env.JWT_SECRET || "my-secret-key-123";

  if (!token || token !== "test-token") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // DRIFT VIOLATION 3: inline RBAC check instead of rbacGuard
  const userRole = "user"; // Faked
  if (userRole !== "admin") {
     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ user: { id: "123", name: "Alice" } });
}
