import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const { orders } = await req.json();

    // validação básica
    if (!Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json(
        { error: "Orders inválido ou vazio" },
        { status: 400 }
      );
    }

    // monta updates apenas com itens válidos
    const updates = orders
      .filter((item: any) => item?.id !== undefined)
      .map((item: any) => {
        // garante número
        const orderValue =
          typeof item.order === "number" && !isNaN(item.order)
            ? item.order
            : 0;

        return prisma.category.update({
          where: { id: item.id },
          data: { order: orderValue },
        });
      });

    // se não existe nada pra atualizar
    if (updates.length === 0) {
      return NextResponse.json(
        { error: "Nenhum item válido enviado" },
        { status: 400 }
      );
    }

    // executa transação
    await prisma.$transaction(updates);

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Erro PUT /categories/order:", err);
    return NextResponse.json(
      { error: "Erro ao salvar ordem" },
      { status: 500 }
    );
  }
}
