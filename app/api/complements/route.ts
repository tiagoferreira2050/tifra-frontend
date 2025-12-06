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
    const { productId, name, required, min, max } = await req.json();

    if (!productId || !name) {
      return NextResponse.json(
        { error: "productId e name são obrigatórios" },
        { status: 400 }
      );
    }

    const group = await prisma.complementGroup.create({
      data: {
        productId,
        name,
        required: required ?? false,
        min: min ?? 0,
        max: max ?? 1,
      },
      include: {
        items: true, // só pra retornar vazio por enquanto
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
