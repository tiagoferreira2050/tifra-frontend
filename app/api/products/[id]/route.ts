import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ======================================
// PATCH - Atualizar parcialmente
// (Usado para ativar/desativar)
// ======================================
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // dados enviados no body
    const data = await req.json();

    // Garante que pelo menos um campo foi enviado
    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      );
    }

    // Atualiza apenas os campos enviados
    const updated = await prisma.product.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);

  } catch (error: any) {
    console.error("Erro PATCH /products/[id]:", error);

    return NextResponse.json(
      {
        error:
          error?.meta?.cause ||
          error?.message ||
          "Erro interno ao atualizar produto",
      },
      { status: 500 }
    );
  }
}

// ======================================
// DELETE - Excluir produto (opcional)
// ======================================
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Erro DELETE /products/[id]:", error);

    return NextResponse.json(
      { error: "Erro ao excluir produto" },
      { status: 500 }
    );
  }
}
