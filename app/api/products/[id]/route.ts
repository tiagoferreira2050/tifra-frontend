import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// ===================================================
// PATCH — Atualizar produto + complements (groups)
// ===================================================
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const {
      name,
      description,
      priceInCents,
      categoryId,
      pdv,
      imageUrl,
      complements = [], // IDs dos grupos
    } = body;

    // ======================
    // FORMATAR CAMPOS
    // ======================
    const price =
      priceInCents !== undefined && priceInCents !== null
        ? priceInCents / 100
        : undefined;

    const uniqueComplements = Array.isArray(complements)
      ? [...new Set(complements)]
      : [];

    // ======================
    // ATUALIZAR PRODUTO
    // ======================
    await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        categoryId,
        pdv,
        imageUrl: imageUrl || null,
        price: price ?? undefined,
      },
    });

    // ======================
    // ATUALIZAR COMPLEMENTOS
    // ======================
    await prisma.productComplement.deleteMany({
      where: { productId: id },
    });

    if (uniqueComplements.length > 0) {
      await prisma.productComplement.createMany({
        data: uniqueComplements.map((groupId: string, order: number) => ({
          productId: id,
          groupId,
          order,
          active: true,
        })),
      });
    }

    // ======================
    // RETORNAR PRODUTO COMPLETO
    // ======================
    const updated = await prisma.product.findUnique({
      where: { id },
      include: {
        productComplements: {
          orderBy: { order: "asc" },
          include: {
            group: {
              include: { items: true },
            },
          },
        },
      },
    });

    return NextResponse.json(updated);

  } catch (error) {
    console.error("Erro PATCH /products/[id]:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar produto" },
      { status: 500 }
    );
  }
}

// ===================================================
// DELETE — Remover produto
// ===================================================
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro DELETE /products/[id]:", error);
    return NextResponse.json(
      { error: "Erro ao excluir produto" },
      { status: 500 }
    );
  }
}
