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

    // VALIDATION
    if (!name || priceInCents === undefined || !categoryId || !storeId) {
      return NextResponse.json(
        { error: "Dados obrigatórios faltando" },
        { status: 400 }
      );
    }

    const price = priceInCents / 100;

    const uniqueComplements = Array.isArray(complements)
      ? [...new Set(complements)]
      : [];

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
            order: index,
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
                items: true,
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
