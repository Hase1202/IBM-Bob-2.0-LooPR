import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string; id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.architecturalContract.delete({
      where: {
        id: id,
        userId: session.user.id,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete contract" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string; id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  try {
    const contract = await prisma.architecturalContract.update({
      where: {
        id: id,
        userId: session.user.id,
      },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.feature && { feature: body.feature }),
        ...(body.description && { description: body.description }),
        ...(body.contractJson && { contractJson: body.contractJson }),
      },
    });
    return NextResponse.json(contract);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update contract" }, { status: 500 });
  }
}
