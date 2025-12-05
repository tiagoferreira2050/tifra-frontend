import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, description, priceInCents, categoryId, storeId } = await req.json();

    // VALIDATION
    if (!name || !priceInCents || !categoryId || !storeId) {
      return NextResponse.json(
        { error: "Dados obrigatórios faltando" },
        { status: 400 }
      );
    }

    const price = priceInCents / 100;

    // CREATE
    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price,
        categoryId,
        storeId,
      },
    });

    return NextResponse.json(product, { status: 201 });

  } catch (error: any) {
    console.error("Erro ao criar produto no Prisma:", error);

    return NextResponse.json(
      {
        error: error?.meta?.cause || error.message || "Erro interno ao criar produto",
      },
      { status: 500 }
    );
  }
}
