import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(categories);
  } catch (err) {
    console.error("Erro GET /categories:", err);
    return NextResponse.json(
      { error: "Erro ao listar categorias" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, storeId } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Nome obrigatório" },
        { status: 400 }
      );
    }

    if (!storeId) {
      return NextResponse.json(
        { error: "storeId obrigatório" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        storeId,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (err) {
    console.error("Erro POST /categories:", err);
    return NextResponse.json(
      { error: "Erro ao criar categoria" },
      { status: 500 }
    );
  }
}
