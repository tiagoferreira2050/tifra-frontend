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
// POST - CRIAR GRUPO + ITENS
// ===================================================
export async function POST(req: Request) {
  try {
    const { name, description, required, min, max, type, options } =
      await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "name é obrigatório" },
        { status: 400 }
      );
    }

    // 1) Criar grupo corretamente
    const group = await prisma.complementGroup.create({
      data: {
        name,
        description: description ?? "",
        required: required ?? false,
        min: min !== undefined ? Number(min) : 0,
        max: max !== undefined ? Number(max) : 1,
        active: true,
        type: type || "multiple",
      },
    });

    // 2) Criar itens — criamos um a um para garantir hooks / triggers corretos
    if (Array.isArray(options) && options.length > 0) {
      for (const opt of options) {
        await prisma.complement.create({
          data: {
            groupId: group.id,
            name: opt.name,
            price: opt.price !== undefined ? Number(opt.price) : 0,
            active: opt.active ?? true,
            imageUrl: opt.imageUrl || null,
            description: opt.description || "",
          },
        });
      }
    }

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
// PATCH - ATUALIZAR GRUPO + ITENS
// ===================================================
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, name, description, required, min, max, active, type } = body;
    const options = Array.isArray(body.options) ? body.options : undefined;

    if (!id) {
      return NextResponse.json(
        { error: "ID obrigatório" },
        { status: 400 }
      );
    }

    // --- 1) Atualiza apenas os campos realmente enviados ---
    const groupData: any = {};
    if (name !== undefined) groupData.name = name;
    if (description !== undefined) groupData.description = description;
    if (required !== undefined) groupData.required = !!required;
    if (min !== undefined) groupData.min = Number(min);
    if (max !== undefined) groupData.max = Number(max);
    if (active !== undefined) groupData.active = !!active;
    if (type !== undefined) groupData.type = type;

    // Se groupData estiver com alguma propriedade, atualiza
    if (Object.keys(groupData).length > 0) {
      await prisma.complementGroup.update({
        where: { id },
        data: groupData,
      });
    }

    // --- 2) Atualizar / Criar itens (se options foi enviado) ---
    if (Array.isArray(options)) {
      for (const opt of options) {
        const isNew =
          !opt.id ||
          typeof opt.id !== "string" ||
          String(opt.id).startsWith("opt-");

        const payload = {
          name: opt.name,
          price: opt.price !== undefined ? Number(opt.price) : 0,
          active: opt.active ?? true,
          imageUrl: opt.imageUrl || opt.image || null,
          description: opt.description || "",
        };

        if (isNew) {
          await prisma.complement.create({
            data: {
              groupId: id,
              ...payload,
            },
          });
        } else {
          // atualiza item existente (se existir)
          await prisma.complement.update({
            where: { id: opt.id },
            data: payload,
          });
        }
      }

      // --- 3) Remover itens apagados pelo usuário (somente se options foi enviado) ---
      const existing = await prisma.complement.findMany({
        where: { groupId: id },
        select: { id: true },
      });

      const payloadIds = options
        .filter((o: any) => o.id && !String(o.id).startsWith("opt-"))
        .map((o: any) => o.id);

      const toDelete = existing
        .map((i) => i.id)
        .filter((realId) => !payloadIds.includes(realId));

      if (toDelete.length > 0) {
        await prisma.complement.deleteMany({
          where: { id: { in: toDelete } },
        });
      }
    }

    const updated = await prisma.complementGroup.findUnique({
      where: { id },
      include: { items: { orderBy: { createdAt: "asc" } } },
    });

    return NextResponse.json(updated);
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

    await prisma.complement.deleteMany({
      where: { groupId: id },
    });

    await prisma.complementGroup.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Erro DELETE /complements:", err);
    return NextResponse.json(
      { error: "Erro ao deletar complemento", details: err.message },
      { status: 500 }
    );
  }
}
