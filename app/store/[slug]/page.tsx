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

  // 🔒 segurança básica
  if (!slug || typeof slug !== "string") {
    return notFound();
  }

  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL não configurada");
  }

  // 🔥 ROTA PÚBLICA CORRETA (POR SUBDOMÍNIO)
  const res = await fetch(
    `${API_URL}/stores/by-subdomain/${slug}`,
    {
      cache: "no-store", // página pública sempre atualizada
    }
  );

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
