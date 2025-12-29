// app/store/[slug]/[[...path]]/page.tsx

import { CategoryList } from "./components/CategoryList";

interface StorePageProps {
  params: {
    slug: string;
    path?: string[];
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = params;

  if (!slug) {
    return (
      <div className="text-center mt-10 text-gray-500">
        Loja inválida
      </div>
    );
  }

  if (!API_URL) {
    return (
      <div className="text-center mt-10 text-red-500">
        API não configurada
      </div>
    );
  }

  /* ===============================
     1️⃣ BUSCAR CONFIGURAÇÕES DA LOJA
  =============================== */
  let store: any = null;
  let settings: any = null;

  try {
    const settingsRes = await fetch(
      `${API_URL}/api/store/${slug}/settings`,
      { cache: "no-store" }
    );

    if (settingsRes.ok) {
      const data = await settingsRes.json();
      store = data?.store ?? null;
      settings = data?.settings ?? null;
    } else {
      console.error(
        "[STORE SETTINGS] Status:",
        settingsRes.status,
        "Slug:",
        slug
      );
    }
  } catch (err) {
    console.error("[STORE SETTINGS] Erro:", err);
  }

  // Se não achou a loja, MOSTRA MENSAGEM (não 404)
  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center text-gray-500 px-4">
        <div>
          <h1 className="text-xl font-bold mb-2">
            Loja não encontrada
          </h1>
          <p>
            Esse cardápio pode estar indisponível no momento.
          </p>
        </div>
      </div>
    );
  }

  /* ===============================
     2️⃣ BUSCAR PRODUTOS / CATEGORIAS
  =============================== */
  let categories: any[] = [];

  try {
    const productsRes = await fetch(
      `${API_URL}/api/store/by-subdomain/${slug}`,
      { cache: "no-store" }
    );

    if (productsRes.ok) {
      const data = await productsRes.json();
      categories = data?.categories ?? [];
    } else {
      console.error(
        "[STORE PRODUCTS] Status:",
        productsRes.status,
        "Slug:",
        slug
      );
    }
  } catch (err) {
    console.error("[STORE PRODUCTS] Erro:", err);
  }

  /* ===============================
     RENDER
  =============================== */
  return (
    <div>
      {/* HEADER */}
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
              <h1 className="text-xl font-bold">
                {store.name}
              </h1>

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
        <CategoryList categories={categories} />
      </div>
    </div>
  );
}
