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

  // Buscar loja
  const store = await prisma.store.findUnique({
    where: { subdomain: slug },
    select: { id: true, name: true },
  });

  if (!store) return notFound();

  // Buscar categorias via raw
  const categories = await prisma.$queryRaw<any[]>`
    SELECT id, name
    FROM "Category"
    WHERE "storeId" = ${store.id}
    ORDER BY "createdAt" ASC
  `;

  // Buscar produtos por categoria
  const categoriesWithProducts = await Promise.all(
    categories.map(async (category) => {
      const products = await prisma.$queryRaw<any[]>`
        SELECT id, name, price, description, "imageUrl"
        FROM "Product"
        WHERE "categoryId" = ${category.id}
        ORDER BY "createdAt" ASC
      `;

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
