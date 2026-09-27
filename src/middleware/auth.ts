import { NextRequest, NextResponse } from "next/server";

export function verifyJwt(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET;
  
  if (!secret) throw new Error("JWT_SECRET is missing");
  
  // Fake verify implementation
  if (token === "valid-token") {
    return { id: "user-123", role: "admin" };
  }
  return null;
}

export function rbacGuard(role: string) {
  return (req: NextRequest) => {
    const user = verifyJwt(req);
    if (!user || user.role !== role) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return null;
  };
}
