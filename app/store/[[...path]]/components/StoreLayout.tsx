"use client";

import { useRef, useState } from "react";
import { Clock, ShoppingBag, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCart } from "@/src/contexts/CartContext";

interface Props {
  store: any;
  categories: any[];
}

export default function StoreLayout({ store, categories }: Props) {
  const { totalItens } = useCart();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(
    categories[0]?.id ?? null
  );

  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleCategoryClick = (id: string) => {
    setActiveCategory(id);
    categoryRefs.current[id]?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-orange-50 to-amber-50">
      {/* HERO */}
      <div className="relative h-56 overflow-hidden">
        {store.coverImage ? (
          <img
            src={store.coverImage}
            alt={store.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500" />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* STORE CARD */}
      <div className="relative max-w-4xl mx-auto px-4 -mt-24 mb-8">
        <div className="bg-white rounded-3xl shadow-2xl p-6 flex gap-6 items-center">
          {store.logoUrl && (
            <img
              src={store.logoUrl}
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

          <div className="relative">
            <ShoppingBag />
            {totalItens > 0 && (
              <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {totalItens}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* SEARCH */}
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

      {/* CATEGORIES */}
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

      {/* PRODUCTS */}
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
                    className="bg-white rounded-2xl p-4 shadow flex gap-4"
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
    </div>
  );
}
