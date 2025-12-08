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
// PATCH - ATUALIZAR COMPLEMENTO + ITENS
// ===================================================
export async function PATCH(req: Request) {
  try {
    const { id, name, required, min, max, active, options = [] } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID obrigatório" },
        { status: 400 }
      );
    }

    // 1) Atualiza o grupo
    const group = await prisma.complementGroup.update({
      where: { id },
      data: {
        name,
        required: !!required,
        min: min ?? 0,
        max: max ?? 1,
        active: active ?? true,
      },
    });

    // 2) Atualiza os itens
    for (const opt of options) {
      // UPDATE
      if (opt.id && typeof opt.id === "string" && !opt.id.startsWith("opt-")) {
        await prisma.complement.update({
          where: { id: opt.id },
          data: {
            name: opt.name,
            price: opt.price ?? 0,
            active: opt.active ?? true,
          },
        });
        continue;
      }

      // CREATE (se não tem id real)
      if (!opt.id || opt.id.startsWith("opt-")) {
        await prisma.complement.create({
          data: {
            groupId: id,
            name: opt.name,
            price: opt.price ?? 0,
            active: opt.active ?? true,
          },
        });
      }
    }

    // 3) Retorna atualizado com itens
    const updated = await prisma.complementGroup.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { createdAt: "asc" },
        },
      },
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
