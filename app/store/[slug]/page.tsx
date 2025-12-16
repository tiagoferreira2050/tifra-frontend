// app/store/[slug]/page.tsx

import { notFound } from "next/navigation";
import { CategoryList } from "./components/CategoryList";

interface StorePageProps {
  params: {
    slug: string;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = params;

  if (!slug || typeof slug !== "string") {
    return notFound();
  }

  if (!API_URL) {
    throw new Error("API_URL não configurada");
  }

  // 🔥 Busca dados da loja + categorias via API
  const res = await fetch(`${API_URL}/store/${slug}`, {
    // importante para páginas públicas
    cache: "no-store",
  });

  if (!res.ok) {
    return notFound();
  }

  const data = await res.json();

  if (!data?.store) {
    return notFound();
  }

  const { store, categories } = data;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-8 text-center">
        {store.name}
      </h1>

      <CategoryList categories={categories || []} />
    </div>
  );
}
