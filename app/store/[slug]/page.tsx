import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CategoryList } from "./components/CategoryList";

interface StorePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;

  if (!slug || typeof slug !== "string") {
    return notFound();
  }

  const store = await prisma.store.findUnique({
    where: { subdomain: slug },
    select: {
      id: true,
      name: true,
    },
  });

  if (!store) return notFound();

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
