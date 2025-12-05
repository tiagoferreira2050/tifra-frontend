import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// ===================================================
// PATCH - ATUALIZAR STATUS (active) OU NAME
// ===================================================
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await req.json();

    // atualiza somente os campos enviados
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
// PUT - EDITAR NOME E ACTIVE (método já existente)
// ===================================================
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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
