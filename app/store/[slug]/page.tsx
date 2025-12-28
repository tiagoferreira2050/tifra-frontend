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
    throw new Error("NEXT_PUBLIC_API_URL não configurada");
  }

  // ===============================
  // 1️⃣ DADOS DA LOJA (HEADER)
  // ===============================
  const settingsRes = await fetch(
    `${API_URL}/store/${slug}/settings`,
    { cache: "no-store" }
  );

  if (!settingsRes.ok) {
    return notFound();
  }

  const settingsData = await settingsRes.json();
  const { store, settings } = settingsData;

  if (!store) {
    return notFound();
  }

  // ===============================
  // 2️⃣ CATEGORIAS E PRODUTOS (🔥 ROTA CORRIGIDA)
  // ===============================
  const productsRes = await fetch(
    `${API_URL}/api/store/by-subdomain/${slug}`,
    { cache: "no-store" }
  );

  if (!productsRes.ok) {
    return notFound();
  }

  const productsData = await productsRes.json();
  const { categories } = productsData;

  // ===============================
  // RENDER
  // ===============================
  return (
    <div>
      {/* HEADER DA LOJA */}
      <div className="relative">
        {store.coverImage && (
          <img
            src={store.coverImage}
            className="w-full h-56 object-cover"
            alt={store.name}
          />
        )}

        <div className="max-w-2xl mx-auto px-4">
          <div className="-mt-16 bg-white rounded-xl p-4 shadow flex gap-4 items-center">
            {store.logoUrl && (
              <img
                src={store.logoUrl}
                className="w-20 h-20 rounded-full border object-cover"
                alt={store.name}
              />
            )}

            <div className="flex-1">
              <h1 className="text-xl font-bold">{store.name}</h1>

              {store.description && (
                <p className="text-sm text-gray-500">
                  {store.description}
                </p>
              )}

              <div className="flex gap-4 text-xs text-gray-600 mt-2">
                <span>
                  {settings?.isOpen ? "🟢 Aberto" : "🔴 Fechado"}
                </span>

                {settings?.estimatedTime && (
                  <span>⏱ {settings.estimatedTime}</span>
                )}

                <span>
                  {settings?.minOrderValue > 0
                    ? `Pedido mínimo R$ ${settings.minOrderValue}`
                    : "Sem pedido mínimo"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORIAS */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <CategoryList categories={categories || []} />
      </div>
    </div>
  );
}
