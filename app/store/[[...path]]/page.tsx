"use client";

import { useEffect, useRef, useState } from "react";
import { Clock, MapPin, Star, ShoppingBag, Plus, Search, Info } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { useCart } from "@/src/contexts/CartContext";
import ProductModal from "./components/ProductModal";
import CartDrawer from "./components/CartDrawer";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function StorePage({ params }: { params: { path?: string[] } }) {
  const router = useRouter();
  const subdomain = params.path?.[0];

  const { total, totalItens } = useCart();

  const [store, setStore] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [productSelected, setProductSelected] = useState<any>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  /* ================= FETCH STORE + MENU ================= */
  useEffect(() => {
    if (!subdomain) return;

    async function load() {
      const storeRes = await fetch(
        `${API_URL}/api/store/by-subdomain/${subdomain}`
      );
      const storeData = await storeRes.json();
      setStore(storeData);

      const menuRes = await fetch(
        `${API_URL}/api/public/menu/${storeData.id}`
      );
      const menuData = await menuRes.json();

      setCategories(menuData.categories ?? []);
      setActiveCategory(menuData.categories?.[0]?.id ?? null);
    }

    load();
  }, [subdomain]);

  const handleCategoryClick = (id: string) => {
    setActiveCategory(id);
    categoryRefs.current[id]?.scrollIntoView({ behavior: "smooth" });
  };

  if (!store) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-orange-50 to-amber-50">
      {/* ================= HERO ================= */}
      <div className="relative h-56 overflow-hidden">
        {store.coverImage ? (
          <img
            src={store.coverImage}
            alt={store.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400" />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* ================= STORE CARD ================= */}
      <div className="relative max-w-4xl mx-auto px-4 -mt-24 mb-8">
        <div className="bg-white rounded-3xl shadow-2xl p-6 flex gap-6 items-center">
          {store.logoUrl && (
            <img
              src={store.logoUrl}
              alt={store.name}
              className="w-24 h-24 rounded-2xl object-cover"
            />
          )}

          <div className="flex-1">
            <h1 className="text-2xl font-bold">{store.name}</h1>
            <div className="flex gap-3 text-sm text-gray-600 mt-2">
              <Badge className="bg-emerald-500 text-white">Aberto</Badge>
              <span className="flex items-center gap-1">
                <Clock size={14} /> 40–50 min
              </span>
            </div>
          </div>

          <Button onClick={() => setIsCartOpen(true)}>
            <ShoppingBag />
            {totalItens > 0 && <span className="ml-2">{totalItens}</span>}
          </Button>
        </div>
      </div>

      {/* ================= SEARCH ================= */}
      <div className="max-w-4xl mx-auto px-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Buscar no cardápio..."
            className="pl-12"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ================= CATEGORIES ================= */}
      <div className="max-w-4xl mx-auto px-4 mb-8 flex gap-3 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className={`px-5 py-3 rounded-2xl font-medium ${
              activeCategory === cat.id
                ? "bg-purple-600 text-white"
                : "bg-white"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* ================= PRODUCTS ================= */}
      <div className="max-w-4xl mx-auto px-4 pb-32">
        {categories.map((cat) => {
          const products = cat.products?.filter((p: any) =>
            p.name.toLowerCase().includes(search.toLowerCase())
          );

          if (!products?.length) return null;

          return (
            <div
              key={cat.id}
              ref={(el) => (categoryRefs.current[cat.id] = el)}
              className="mb-10"
            >
              <h2 className="text-xl font-bold mb-4">{cat.name}</h2>

              <div className="grid gap-4">
                {products.map((p: any) => (
                  <div
                    key={p.id}
                    onClick={() => setProductSelected(p)}
                    className="bg-white rounded-2xl p-4 shadow hover:shadow-lg cursor-pointer flex gap-4"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{p.name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {p.description}
                      </p>
                      <span className="font-bold text-purple-600">
                        R$ {p.price.toFixed(2).replace(".", ",")}
                      </span>
                    </div>

                    {p.imageUrl && (
                      <img
                        src={p.imageUrl}
                        className="w-28 h-28 rounded-xl object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {productSelected && (
        <ProductModal
          product={productSelected}
          onClose={() => setProductSelected(null)}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
}
