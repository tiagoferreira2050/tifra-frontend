"use client";

import ProductCard from "./ProductCard";

interface Category {
  id: string;
  name: string;
  products?: any[];
}

interface CategoryListProps {
  categories: Category[];
}

export function CategoryList({ categories = [] }: CategoryListProps) {
  if (!categories.length) {
    return (
      <div className="text-center text-gray-500 mt-16">
        Nenhum produto disponível no momento
      </div>
    );
  }

  return (
    <div className="space-y-14 pb-32">
      {categories.map((category) => {
        const products =
          category.products?.filter(
            (product: any) => product?.active !== false
          ) || [];

        if (!products.length) return null;

        return (
          <section
            key={category.id}
            id={`category-${category.id}`}
            className="space-y-6"
          >
            {/* HEADER DA CATEGORIA */}
            <div className="flex flex-col items-center text-center gap-1">
              <h2 className="text-lg font-semibold text-gray-900">
                {category.name}
              </h2>

              <span className="text-xs text-gray-400">
                {products.length} itens
              </span>

              {/* divisória sutil */}
              <div className="mt-2 w-12 h-[2px] bg-gray-200 rounded-full" />
            </div>

            {/* LISTA DE PRODUTOS */}
            <div className="space-y-4">
              {products.map((product: any) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
