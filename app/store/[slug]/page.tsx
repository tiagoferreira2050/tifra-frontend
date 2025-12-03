import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CategoryList } from "./components/CategoryList";

// Tipo correto do params no Next.js 13+
interface StorePageProps {
  params: {
    slug: string;
  };
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = params;

  const store = await prisma.store.findUnique({
    where: { subdomain: slug },
    include: {
      categories: {
        include: {
          products: true,
        },
      },
    },
  });

  if (!store) return notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-8 text-center">{store.name}</h1>

      <CategoryList categories={store.categories} />
    </div>
  );
}
