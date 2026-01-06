import { CategoryList } from "./components/CategoryList";
import MiniCartBar from "./components/MiniCartBar";
import { CartProvider } from "@/src/contexts/CartContext";
import StoreClientBootstrap from "./components/StoreClientBootstrap";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface StorePageProps {
  params: {
    path?: string[];
  };
}

export default async function StorePage({ params }: StorePageProps) {
  const subdomain = params.path?.[0];

  if (!subdomain || !API_URL) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loja inválida
      </div>
    );
  }

  let store: any = null;
  let settings: any = null;
  let categories: any[] = [];

  try {
    // 🔥 rota pública unificada da loja
    const res = await fetch(
      `${API_URL}/api/public/store/${subdomain}`,
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("Store não encontrada");

    const data = await res.json();

    store = data.store;
    settings = data.settings;
    categories = data.categories ?? [];
  } catch (err) {
    console.error("[PUBLIC STORE PAGE]", err);
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loja não encontrada
      </div>
    );
  }

  return (
    <CartProvider>
      {/* 🔥 registra storeId no client (localStorage / contexto) */}
      <StoreClientBootstrap storeId={store.id} />

      <div className="bg-[#FFF3EE] min-h-screen relative">
        {/* ================= BANNER ================= */}
        <div className="relative h-64 w-full overflow-hidden">
          {store.coverImage ? (
            <img
              src={store.coverImage}
              alt={store.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500" />
          )}

          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* ================= CARD DA LOJA ================= */}
        <div className="relative -mt-24 z-10">
          <div className="max-w-3xl mx-auto px-4">
            <div className="bg-white rounded-3xl shadow-xl p-6 flex items-center gap-5">
              {/* LOGO */}
              {store.logoUrl ? (
                <img
                  src={store.logoUrl}
                  alt={store.name}
                  className="w-20 h-20 rounded-2xl object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                  {store.name?.[0]}
                </div>
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

                <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-2">
                  <span
                    className={
                      settings?.isOpen
                        ? "text-green-600 font-medium"
                        : "text-red-500 font-medium"
                    }
                  >
                    ● {settings?.isOpen ? "Aberto" : "Fechado"}
                  </span>

                  {settings?.estimatedTime && (
                    <span>⏱ {settings.estimatedTime} min</span>
                  )}

                  {settings?.minOrderValue !== null && (
                    <span>
                      Pedido mínimo:{" "}
                      {settings.minOrderValue === 0
                        ? "Sem pedido mínimo"
                        : `R$ ${settings.minOrderValue}`}
                    </span>
                  )}
                </div>
              </div>

              {/* SACOLA (desktop) */}
              <div className="hidden sm:block">
                <button className="bg-purple-600 text-white px-5 py-2 rounded-xl font-medium">
                  Ver sacola
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="h-16" />

        {/* ================= PRODUTOS ================= */}
        <div className="max-w-3xl mx-auto px-4 py-6 pb-28">
          <CategoryList categories={categories} />
        </div>

        {/* ================= MINI CART ================= */}
        <MiniCartBar />
      </div>
    </CartProvider>
  );
}
