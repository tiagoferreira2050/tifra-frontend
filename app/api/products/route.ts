import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { 
      name, 
      description, 
      priceInCents, 
      categoryId, 
      storeId,
      imageUrl,
      complements // array de GROUP IDs
    } = await req.json();

    // VALIDATION (aceitando preço 0)
    if (!name || priceInCents === undefined || !categoryId || !storeId) {
      return NextResponse.json(
        { error: "Dados obrigatórios faltando" },
        { status: 400 }
      );
    }

    const price = priceInCents / 100;

    // garante array válido e remove duplicados
    const uniqueComplements = Array.isArray(complements)
      ? [...new Set(complements)]
      : [];

    // CREATE PRODUCT
    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price,
        categoryId,
        storeId,
        imageUrl: imageUrl || null,

        productComplements: {
          create: uniqueComplements.map((groupId: string, index: number) => ({
            groupId,
            order: index,   // mantém ordem correta
            active: true,
          })),
        },
      },

      include: {
        productComplements: {
          orderBy: { order: "asc" },
          include: {
            group: {
              include: {
                items: true, // retorna os itens do grupo
              },
            },
          },
        },
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
