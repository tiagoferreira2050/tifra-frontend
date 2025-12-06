export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ===================================================
// GET - LISTAR
// ===================================================
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        products: {
          orderBy: { createdAt: "asc" },
        },
      },
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

// ===================================================
// POST - CRIAR (suporta duplicar com produtos)
// ===================================================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, storeId, products } = body;

    if (!name || !storeId) {
      return NextResponse.json(
        { error: "Nome e storeId obrigatórios" },
        { status: 400 }
      );
    }

    // 1. cria a categoria
    const category = await prisma.category.create({
      data: { name, storeId },
    });

    // 2. se veio array de produtos, duplica
    if (Array.isArray(products) && products.length > 0) {
      const ops = products.map((p: any) =>
        prisma.product.create({
          data: {
            name: p.name,
            price: p.price,
            description: p.description,
            image: p.image,
            active: p.active ?? true,
            order: p.order ?? 0,
            categoryId: category.id,
          },
        })
      );

      await prisma.$transaction(ops);
    }

    // 3. busca categoria com produtos (para retornar completa)
    const full = await prisma.category.findUnique({
      where: { id: category.id },
      include: {
        products: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json(full, { status: 201 });

  } catch (err) {
    console.error("Erro POST /categories:", err);
    return NextResponse.json(
      { error: "Erro ao criar categoria" },
      { status: 500 }
    );
  }
}
