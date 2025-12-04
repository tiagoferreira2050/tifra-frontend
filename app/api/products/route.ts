import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      description,
      priceInCents,
      categoryId,
      storeId,
    } = body;

    if (!name || !priceInCents || !categoryId || !storeId) {
      return NextResponse.json(
        { error: "Dados obrigatórios faltando" },
        { status: 400 }
      );
    }

    const price = priceInCents / 100;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        categoryId,
        storeId,
      },
    });

    return NextResponse.json(product, { status: 201 });

  } catch (error: any) {
  console.error("Erro ao criar produto no Prisma:", error);

  return NextResponse.json(
    { error: error.message || "Erro interno ao criar produto" },
    { status: 500 }
  );
}
}
