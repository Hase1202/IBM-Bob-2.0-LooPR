import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string; contractId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { contractId } = await params;
  const { notes } = (await req.json()) as { notes: string };

  const contract = await prisma.architecturalContract.findUnique({
    where: { id: contractId },
    select: { userId: true },
  });

  if (!contract || contract.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.architecturalContract.update({
    where: { id: contractId },
    data: { notes: notes ?? "" },
  });

  return NextResponse.json({ ok: true });
}
