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
    // 👇 AGORA RECEBE description TAMBÉM
    const { name, description, required, min, max, type, options } =
      await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "name é obrigatório" },
        { status: 400 }
      );
    }

    // 1) Criar grupo
    const group = await prisma.complementGroup.create({
      data: {
        name,
        description: description ?? "", // 👈 GARANTE STRING
        required: required ?? false,
        min: min !== undefined ? Number(min) : 0,
        max: max !== undefined ? Number(max) : 1,
        active: true,
        type: type || "multiple",
      },
    });

    // 2) Se existir opções, cria cada item
    if (Array.isArray(options) && options.length > 0) {
      await prisma.complement.createMany({
  data: options.map((opt: any) => ({
    groupId: group.id,
    name: opt.name,
    price: opt.price !== undefined ? Number(opt.price) : 0,
    active: opt.active ?? true,
    imageUrl: opt.imageUrl || null,
  })),
});

    }

    // 3) Retorna grupo completo com itens
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
    const body = await req.json();

    // 👇 AGORA RECEBE description TAMBÉM
    const { id, name, description, required, min, max, active, type } = body;
    const options = Array.isArray(body.options) ? body.options : null;

    if (!id) {
      return NextResponse.json(
        { error: "ID obrigatório" },
        { status: 400 }
      );
    }

    // 1) Atualiza o grupo
    await prisma.complementGroup.update({
      where: { id },
      data: {
        name,
        description: description ?? "", // 👈 ATUALIZA DESCRIÇÃO
        required: !!required,
        min: min !== undefined ? Number(min) : 0,
        max: max !== undefined ? Number(max) : 1,
        active: active ?? true,
        type: typeof type === "string" ? type : "multiple",
      },
    });

    // 2) Se options foram enviados, mexe nos itens
    if (options && options.length > 0) {
      // 2.1 Criar / atualizar
      for (const opt of options) {
        const isNew = !opt.id || String(opt.id).startsWith("opt-");

        const payload = {
          name: opt.name,
          price: opt.price !== undefined ? Number(opt.price) : 0,
          active: opt.active ?? true,
        };

        if (isNew) {
          await prisma.complement.create({
            data: {
              groupId: id,
              ...payload,
            },
          });
          continue;
        }

        await prisma.complement.update({
          where: { id: opt.id },
          data: payload,
        });
      }

      // 2.2 Remover itens deletados
      const existingItemIds = await prisma.complement.findMany({
        where: { groupId: id },
        select: { id: true },
      });

      const payloadIds = options
        .filter((opt: any) => opt.id && !String(opt.id).startsWith("opt-"))
        .map((opt: any) => opt.id);

      const toDeleteIds = existingItemIds
        .map((i: any) => i.id)
        .filter((itemId: string) => !payloadIds.includes(itemId));

      if (toDeleteIds.length > 0) {
        await prisma.complement.deleteMany({
          where: { id: { in: toDeleteIds } },
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

// ===================================================
// DELETE - REMOVER GRUPO + ITENS
// ===================================================
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID obrigatório" },
        { status: 400 }
      );
    }

    // Deletar itens ligados ao grupo
    await prisma.complement.deleteMany({
      where: { groupId: id },
    });

    // Deletar grupo
    await prisma.complementGroup.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );

  } catch (err: any) {
    console.error("Erro DELETE /complements:", err);
    return NextResponse.json(
      { error: "Erro ao deletar complemento", details: err.message },
      { status: 500 }
    );
  }
}
