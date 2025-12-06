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
// POST - CRIAR GRUPO DE COMPLEMENTO + ITENS
// ===================================================
export async function POST(req: Request) {
  try {
    const { productId, name, required, min, max, options } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "name é obrigatório" },
        { status: 400 }
      );
    }

    // criar grupo
    const group = await prisma.complementGroup.create({
      data: {
        productId: productId || null,
        name,
        required: required ?? false,
        min: min ?? 0,
        max: max ?? 1,
      },
    });

    // se existir opções, cria cada item
    if (Array.isArray(options) && options.length > 0) {
      await prisma.complement.createMany({
        data: options.map((opt: any) => ({
          groupId: group.id,
          name: opt.name,
          price: opt.price ?? 0,
          active: opt.active ?? true,
        })),
      });
    }

    // retorna grupo completo com itens
    const result = await prisma.complementGroup.findUnique({
      where: { id: group.id },
      include: {
        items: true,
      },
    });

    return NextResponse.json(result, { status: 201 });

  } catch (err: any) {
    console.error("Erro POST /complements:", err);
    return NextResponse.json(
      { error: "Erro ao criar complemento", details: err.message },
      { status: 500 }
    );
  }
}



// ===================================================
// PATCH - ATUALIZAR GRUPO COMPLETO
// ===================================================
export async function PATCH(req: Request) {
  try {
    const { id, name, required, min, max, active } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID obrigatório" },
        { status: 400 }
      );
    }

    const updated = await prisma.complementGroup.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(required !== undefined && { required }),
        ...(min !== undefined && { min: Number(min) }),
        ...(max !== undefined && { max: Number(max) }),
        ...(active !== undefined && { active }),
      },
      include: {
        items: true
      }
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
