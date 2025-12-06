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
// POST - CRIAR (COM PRODUTOS ANINHADOS)
// ===================================================
export async function POST(req: Request) {
  try {
    const { name, storeId, products = [] } = await req.json();

    if (!name || !storeId) {
      return NextResponse.json(
        { error: "Nome e storeId obrigatórios" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        store: {
          connect: { id: storeId }, // 👈 OBRIGATÓRIO
        },
        products: products.length
          ? {
              create: products.map((p: any) => ({
                name: p.name ?? "",
                price: p.price ?? 0,
                description: p.description ?? null,
                image: p.image ?? null,   // 👈 sem undefined
                active: p.active ?? true,
                order: p.order ?? 0,      // 👈 sem undefined
              })),
            }
          : undefined,
      },
      include: {
        products: true, // 👈 pra retornar tudo pro front
      },
    });

    return NextResponse.json(category, { status: 201 });

  } catch (err: any) {
    console.error("Erro POST /categories:", err);
    return NextResponse.json(
      { error: "Erro ao criar categoria", details: err.message },
      { status: 500 }
    );
  }
}
