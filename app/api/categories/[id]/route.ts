import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// ===================================================
// PATCH - UPDATE PARCIAL
// ===================================================
export async function PATCH(
  req: NextRequest,
  context: any // 👈 força tipagem para evitar conflito
) {
  try {
    const { id } = context.params;
    const data = await req.json();

    const updated = await prisma.category.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);

  } catch (err) {
    console.error("Erro PATCH /categories/[id]:", err);
    return NextResponse.json(
      { error: "Erro ao atualizar categoria" },
      { status: 500 }
    );
  }
}

// ===================================================
// PUT - UPDATE NAME / ACTIVE
// ===================================================
export async function PUT(
  req: NextRequest,
  context: any // 👈 força tipagem para evitar conflito
) {
  try {
    const { id } = context.params;
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
// DELETE
// ===================================================
export async function DELETE(
  req: NextRequest,
  context: any // 👈 força tipagem para evitar conflito
) {
  try {
    const { id } = context.params;

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
