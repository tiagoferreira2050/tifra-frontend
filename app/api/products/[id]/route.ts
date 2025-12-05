import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// ===================================================
// PATCH - atualizar campos do produto
// ===================================================
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // agora params é Promise — precisa de await
    const { id } = await context.params;

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
// DELETE - remover produto
// ===================================================
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

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
