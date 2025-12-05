import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// ===================================================
// PATCH - Atualizar ativo (ou outros campos futuramente)
// ===================================================
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await req.json();

    const updated = await prisma.product.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);

  } catch (error) {
    console.error("Erro PATCH /products/[id]:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar produto" },
      { status: 500 }
    );
  }
}

// ===================================================
// DELETE - Excluir produto
// ===================================================
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Erro DELETE /products/[id]:", error);
    return NextResponse.json(
      { error: "Erro ao excluir produto" },
      { status: 500 }
    );
  }
}
