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
     🔥 BUSCAR LOJA + CATEGORIAS
     GET /api/store/by-subdomain/:subdomain
  =============================== */
  let store: any = null;
  let categories: any[] = [];

  try {
    const res = await fetch(
      `${API_URL}/api/store/by-subdomain/${slug}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      console.error(
        "[STORE BY SUBDOMAIN] status:",
        res.status,
        "slug:",
        slug
      );
    } else {
      const data = await res.json();
      store = data.store ?? null;
      categories = data.categories ?? [];
    }
  } catch (err) {
    console.error("[STORE BY SUBDOMAIN] erro:", err);
  }

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
     RENDER
  =============================== */
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ================= HEADER ================= */}
      <div className="relative">
        {/* CAPA */}
        <div className="h-48 w-full overflow-hidden">
          {store.coverImage ? (
            <img
              src={store.coverImage}
              alt={store.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-purple-600 to-purple-400" />
          )}
        </div>

        {/* CARD DA LOJA */}
        <div className="max-w-2xl mx-auto px-4">
          <div className="-mt-16 bg-white rounded-2xl shadow-lg p-4 flex gap-4 items-center">
            {/* LOGO */}
            {store.logoUrl && (
              <img
                src={store.logoUrl}
                className="w-20 h-20 rounded-full border object-cover"
                alt={store.name}
              />
            )}

            {/* INFO */}
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">
                {store.name}
              </h1>

              {store.description && (
                <p className="text-sm text-gray-500 mt-1">
                  {store.description}
                </p>
              )}

              {/* Infos fixas por enquanto (depois vêm do backend) */}
              <div className="flex flex-wrap gap-3 text-xs text-gray-600 mt-2">
                <span className="font-medium text-green-600">
                  🟢 Aberto
                </span>
                <span>⏱ 40–50 min</span>
                <span>Sem pedido mínimo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= CATEGORIAS / PRODUTOS ================= */}
      <div className="max-w-2xl mx-auto px-4 py-10">
        <CategoryList categories={categories} />
      </div>
    </div>
  );
}
