import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CategoryList } from "./components/CategoryList";

export default async function StorePage(props: any) {
  // NEXT PASSA PARAMS COMO PROMISE EM PRODUÇÃO
  const { slug } = await props.params;

  // 1) buscar loja pelo subdominio
  const store = await prisma.store.findUnique({
    where: { subdomain: slug },
  });

  if (!store) return notFound();

  // 2) buscar categorias e produtos
  const categories = await prisma.category.findMany({
    where: { storeId: store.id },
    include: {
      products: true,
    },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-8 text-center">
        {store.name}
      </h1>

      {categories.length === 0 && (
        <p className="text-center text-gray-500">Nenhum produto disponível.</p>
      )}

      <CategoryList categories={categories} />
    </div>
  );
}
