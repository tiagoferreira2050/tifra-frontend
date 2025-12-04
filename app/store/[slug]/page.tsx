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

  // 1) Buscar loja
  const store = await prisma.store.findUnique({
    where: { subdomain: slug },
  });

  if (!store) return notFound();

  // 2) Buscar categorias
  const categories = await prisma.category.findMany({
    where: { storeId: store.id },
  });

  // 3) Buscar produtos e anexar
  const categoriesWithProducts = await Promise.all(
    categories.map(async (category) => {
      const products = await prisma.product.findMany({
        where: { categoryId: category.id },
      });

      return {
        ...category,
        products,
      };
    })
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-8 text-center">{store.name}</h1>

      <CategoryList categories={categoriesWithProducts} />
    </div>
  );
}
