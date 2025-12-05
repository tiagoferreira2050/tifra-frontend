import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const { orders } = await req.json();

    if (!Array.isArray(orders)) {
      return NextResponse.json(
        { error: "Orders inválido" },
        { status: 400 }
      );
    }

    const updates = orders
      .filter((item: any) => item?.id)
      .map((item: any) =>
        prisma.category.update({
          where: { id: item.id },
          data: { order: item.order ?? 0 },
        })
      );

    await Promise.all(updates);

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Erro PUT /categories/order:", err);
    return NextResponse.json(
      { error: "Erro ao salvar ordem" },
      { status: 500 }
    );
  }
}
