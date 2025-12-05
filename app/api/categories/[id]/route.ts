import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ===================================================
// PUT - EDITAR
// ===================================================
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const { name, active } = await req.json();

    const updated = await prisma.category.update({
      where: { id },
      data: { name, active },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Erro PUT /categories/[id]:", err);
    return NextResponse.json(
      { error: "Erro ao atualizar categoria" },
      { status: 500 }
    );
  }
}

// ===================================================
// DELETE - EXCLUIR
// ===================================================
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro DELETE /categories/[id]:", err);
    return NextResponse.json(
      { error: "Erro ao excluir categoria" },
      { status: 500 }
    );
  }
}
