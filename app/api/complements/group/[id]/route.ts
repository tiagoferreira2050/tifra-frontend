export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ===================================================
// GET - LISTAR 1 GRUPO + ITENS
// ===================================================
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    const group = await prisma.complementGroup.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: "Grupo não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(group);

  } catch (err) {
    console.error("Erro GET /complements/group/[id]:", err);
    return NextResponse.json(
      { error: "Erro ao buscar grupo" },
      { status: 500 }
    );
  }
}
