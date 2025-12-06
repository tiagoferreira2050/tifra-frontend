export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ===================================================
// POST - CRIAR ITEM DE COMPLEMENTO
// ===================================================
export async function POST(req: Request) {
  try {
    const { groupId, name, price = 0, active = true } = await req.json();

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
        price,
        active,
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
