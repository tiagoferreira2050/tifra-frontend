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
  const subdomain = params.path?.[0];

  if (!subdomain || !API_URL) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loja inválida
      </div>
    );
  }

  let store: any = null;
  let categories: any[] = [];

  try {
    const storeRes = await fetch(
      `${API_URL}/api/store/by-subdomain/${subdomain}`,
      { cache: "no-store" }
    );
    if (!storeRes.ok) throw new Error();
    store = await storeRes.json();

    const menuRes = await fetch(
      `${API_URL}/api/public/menu/${store.id}`,
      { cache: "no-store" }
    );
    if (menuRes.ok) {
      const menuData = await menuRes.json();
      categories = menuData.categories ?? [];
    }
  } catch (err) {
    console.error("[STORE PAGE]", err);
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

          {/* overlay */}
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

                <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-1">
                  <span className="text-green-600 font-medium">● Aberto</span>
                  <span>⏱ 40–50 min</span>
                  <span>Sem pedido mínimo</span>
                </div>
              </div>

              {/* BOTÃO SACOLA (visual apenas, MiniCartBar continua abaixo) */}
              <div className="hidden sm:block">
                <button className="bg-purple-600 text-white px-5 py-2 rounded-xl font-medium">
                  Ver sacola
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ESPAÇO */}
        <div className="h-16" />

        {/* ================= PRODUTOS ================= */}
        <div className="max-w-3xl mx-auto px-4 py-6 pb-28">
          <CategoryList categories={categories} />
        </div>

        {/* ================= MINI CARRINHO ================= */}
        <MiniCartBar />
      </div>
    </CartProvider>
  );
}
