"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
// futuramente: import ProductModal from "./ProductModal";

interface Category {
  id: string;
  name: string;
  products?: any[];
}

interface CategoryListProps {
  categories: Category[];
}

export function CategoryList({ categories = [] }: CategoryListProps) {
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  if (!categories.length) {
    return (
      <div className="text-center text-gray-500 mt-16">
        Nenhum produto disponível no momento
      </div>
    );
  }

  return (
    <>
      <div className="space-y-12 pb-32">
        {categories.map((category) => {
          const products =
            category.products?.filter(
              (product: any) => product?.active !== false
            ) || [];

          if (!products.length) {
            return null;
          }

          return (
            <section
              key={category.id}
              id={`category-${category.id}`}
              className="space-y-5"
            >
              {/* HEADER DA CATEGORIA */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-gray-900">
                  {category.name}
                </h2>

                <span className="text-xs text-gray-400">
                  {products.length} itens
                </span>
              </div>

              {/* LISTA DE PRODUTOS */}
              <div className="space-y-4">
                {products.map((product: any) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpen={setSelectedProduct}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* MODAL (entra no próximo passo) */}
      {selectedProduct && (
        <div>
          {/* 
            Aqui vai entrar:
            <ProductModal
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
            />
          */}
        </div>
      )}
    </>
  );
}
