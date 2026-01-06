import { CategoryList } from "./components/CategoryList";
import { CartProvider } from "@/src/contexts/CartContext";
import MiniCartBar from "./components/MiniCartBar";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface StorePageProps {
  params: {
    path?: string[];
  };
}

export default async function StorePage({ params }: StorePageProps) {
  /**
   * Middleware gera:
   * /store/{subdomain}
   * /store/{subdomain}/checkout
   * /store/{subdomain}/checkout/summary
   */
  const subdomain = params.path?.[0];

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
      <div className="min-h-screen flex items-center justify-center text-red-500">
        API não configurada
      </div>
    );
  }

  let store: any = null;
  let categories: any[] = [];

  try {
    /**
     * ✅ ROTA CORRETA (CONFIRMADA)
     * GET /api/store/by-subdomain/:subdomain
     */
    const storeRes = await fetch(
      `${API_URL}/api/store/by-subdomain/${subdomain}`,
      { cache: "no-store" }
    );

    if (!storeRes.ok) {
      throw new Error("Store não encontrada");
    }

    store = await storeRes.json();

    /**
     * 🔁 MENU PÚBLICO CONTINUA IGUAL
     * (usa store.id)
     */
    const menuRes = await fetch(
      `${API_URL}/api/public/menu/${store.id}`,
      { cache: "no-store" }
    );

    if (menuRes.ok) {
      const menuData = await menuRes.json();
      categories = menuData.categories ?? [];
    }
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
                    <span className="font-medium text-green-600">● Aberto</span>
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
