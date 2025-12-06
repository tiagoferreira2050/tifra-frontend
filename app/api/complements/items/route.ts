export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ===================================================
// POST - CRIAR ITEM NO GRUPO
// ===================================================
export async function POST(req: Request) {
  try {
    const { groupId, name, price, active } = await req.json();

    if (!groupId || !name) {
      return NextResponse.json(
        { error: "groupId e name são obrigatórios" },
        { status: 400 }
      );
    }

    const item = await prisma.complement.create({
      data: {
        groupId,
        name,
        price: price ?? 0,
        active: active ?? true,
      },
    });

    return NextResponse.json(item, { status: 201 });

  } catch (err: any) {
    console.error("Erro POST /complements/items:", err);
    return NextResponse.json(
      { error: "Erro ao criar item", details: err.message },
      { status: 500 }
    );
  }
}

// ===================================================
// PATCH - ATUALIZAR STATUS DE ITEM
// ===================================================
export async function PATCH(req: Request) {
  try {
    const { id, active } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID obrigatório" },
        { status: 400 }
      );
    }

    const updated = await prisma.complement.update({
      where: { id },
      data: { active },
    });

    return NextResponse.json(updated);

  } catch (err: any) {
    console.error("Erro PATCH /complements/items:", err);
    return NextResponse.json(
      { error: "Erro ao atualizar complemento", details: err.message },
      { status: 500 }
    );
  }
}