export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ===================================================
// GET - LISTAR COMPLEMENTOS
// ===================================================
export async function GET() {
  try {
    const groups = await prisma.complementGroup.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        items: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json(groups);
  } catch (err) {
    console.error("Erro GET /complements:", err);
    return NextResponse.json(
      { error: "Erro ao listar complementos" },
      { status: 500 }
    );
  }
}

// ===================================================
// POST - CRIAR GRUPO DE COMPLEMENTO
// ===================================================
export async function POST(req: Request) {
  try {
    const { name, required, min, max } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "name é obrigatório" },
        { status: 400 }
      );
    }

    const group = await prisma.complementGroup.create({
      data: {
        name,
        required: required ?? false,
        min: min ?? 0,
        max: max ?? 1,
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(group, { status: 201 });

  } catch (err) {
    console.error("Erro POST /complements:", err);
    return NextResponse.json(
      { error: "Erro ao criar complemento" },
      { status: 500 }
    );
  }
}



// ===================================================
// PATCH - ATUALIZAR STATUS DO GRUPO
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

    const updated = await prisma.complementGroup.update({
      where: { id },
      data: { active: !!active },
    });

    return NextResponse.json(updated, { status: 200 });

  } catch (err: any) {
    console.error("Erro PATCH /complements:", err);
    return NextResponse.json(
      { error: "Erro ao atualizar complemento", details: err.message },
      { status: 500 }
    );
  }
}

