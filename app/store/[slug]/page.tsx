import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CategoryList } from "./components/CategoryList";

interface StorePageProps {
  params: {
    slug: string;
  };
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = params;

  // 1. Buscar loja
  const store = await prisma.store.findUnique({
    where: { subdomain: slug },
    select: {
      id: true,
      name: true,
    },
  });

  if (!store) return notFound();

  // 2. Buscar categorias + produtos (agora compatível com o Vercel)
  const categories = await prisma.category.findMany({
    where: { storeId: store.id },
    include: {
      products: true,
    },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-8 text-center">{store.name}</h1>

      <CategoryList categories={categories} />
    </div>
  );
}
