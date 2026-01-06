import { headers } from "next/headers";
import { CategoryList } from "./components/CategoryList";
import { CartProvider } from "@/src/contexts/CartContext";
import MiniCartBar from "./components/MiniCartBar";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* ===============================
   SUBDOMAIN HELPER
=============================== */
function getSubdomainFromHost(host: string) {
  const cleanHost = host.split(":")[0];

  // ignora localhost
  if (cleanHost.includes("localhost")) return null;

  // ignora domínio raiz
  if (cleanHost === "tifra.com.br") return null;

  // subdomínio válido
  if (cleanHost.endsWith(".tifra.com.br")) {
    return cleanHost.replace(".tifra.com.br", "");
  }

  return null;
}

export default async function StorePage() {
  /* ================= SUBDOMAIN ================= */
  const headersList = headers();
  const host = headersList.get("host") ?? "";
  const subdomain = getSubdomainFromHost(host);

  if (!subdomain) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center text-gray-500 px-4">
        <div>
          <h1 className="text-xl font-bold mb-2">Loja inválida</h1>
          <p>Esse cardápio pode estar indisponível.</p>
        </div>
      </div>
    );
  }

  if (!API_URL) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center text-red-500">
        API não configurada
      </div>
    );
  }

  let store: any = null;
  let categories: any[] = [];

  try {
    /**
     * ✅ ROTA CORRETA DO BACKEND
     * storeSettings.public.routes.js
     * GET /api/public/store/:subdomain
     */
    const res = await fetch(
      `${API_URL}/api/public/store/${subdomain}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      throw new Error("Store não encontrada");
    }

    const data = await res.json();
    store = data.store ?? null;
    categories = data.categories ?? [];
  } catch (err) {
    console.error("[PUBLIC STORE] erro:", err);
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center text-gray-500 px-4">
        <div>
          <h1 className="text-xl font-bold mb-2">Loja não encontrada</h1>
          <p>Esse cardápio pode estar indisponível.</p>
        </div>
      </div>
    );
  }

  return (
    <CartProvider>
      <div className="bg-gray-50 min-h-screen relative">
        {/* ================= HEADER ================= */}
        <div className="relative">
          <div className="h-56 w-full overflow-hidden">
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

          <div className="absolute left-0 right-0 -bottom-16">
            <div className="max-w-2xl mx-auto px-4">
              <div className="bg-white rounded-2xl shadow-xl p-4 flex gap-4 items-center">
                {store.logoUrl && (
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="w-20 h-20 rounded-full border object-cover"
                  />
                )}

                <div className="flex-1">
                  <h1 className="text-xl font-bold text-gray-900">
                    {store.name}
                  </h1>

                  {store.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {store.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 text-xs text-gray-600 mt-2">
                    <span className="font-medium text-green-600">
                      ● Aberto
                    </span>
                    <span>⏱ 40–50 min</span>
                    <span>Sem pedido mínimo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COMPENSA SOBREPOSIÇÃO */}
        <div className="h-24" />

        {/* ================= PRODUTOS ================= */}
        <div className="max-w-2xl mx-auto px-4 py-6 pb-28">
          <CategoryList categories={categories} />
        </div>

        {/* ================= MINI CARRINHO ================= */}
        <MiniCartBar />
      </div>
    </CartProvider>
  );
}
