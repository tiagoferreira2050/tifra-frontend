import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ===================================================
// PATCH - UPDATE PARCIAL
// ===================================================
export async function PATCH(
  req: Request,
  context: any
) {
  try {
    const { id } = await context.params; // 👈 CORREÇÃO

    if (!id) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    // 🔥 tenta parsear o body de forma segura
    let body: any = {};
    try {
      body = await req.json();
    } catch (_) {
      // se falhar, body fica vazio
    }

    const { name, active, order } = body;

    // 🔥 se nenhum campo foi enviado, não tem o que atualizar
    if (
      name === undefined &&
      active === undefined &&
      order === undefined
    ) {
      return NextResponse.json(
        { error: "Nenhum campo enviado" },
        { status: 400 }
      );
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(active !== undefined && { active }),
        ...(order !== undefined && { order }),
      },
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
  req: Request,
  context: any
) {
  try {
    const { id } = await context.params; // 👈 CORREÇÃO

    if (!id) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

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
  req: Request,
  context: any
) {
  try {
    const { id } = await context.params; // 👈 CORREÇÃO

    if (!id) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    const exists = await prisma.category.findUnique({
      where: { id },
    });

    if (!exists) {
      return NextResponse.json({ success: true });
    }

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
