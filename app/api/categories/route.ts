import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        createdAt: "asc"
      }
    });

    return NextResponse.json(categories);
  } catch (error: any) {
    console.error("Erro ao buscar categorias:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar categorias" },
      { status: 500 }
    );
  }
}
