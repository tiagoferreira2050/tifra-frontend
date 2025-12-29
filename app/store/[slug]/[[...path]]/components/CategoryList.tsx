"use client";

import ProductCard from "./ProductCard";

interface CategoryListProps {
  categories: any[];
}

export function CategoryList({ categories = [] }: CategoryListProps) {
  if (!categories.length) {
    return (
      <div className="text-center text-gray-500 mt-10">
        Nenhum produto disponível no momento
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-6 pb-32">
      {categories.map((category: any) => {
        if (!category?.products || category.products.length === 0) {
          return null;
        }

        return (
          <section key={category.id} className="space-y-3">
            {/* NOME DA CATEGORIA */}
            <h2 className="text-lg font-bold text-gray-800">
              {category.name}
            </h2>

            {/* PRODUTOS */}
            <div className="space-y-4">
              {category.products
                .filter(
                  (product: any) => product?.active !== false
                )
                .map((product: any) => (
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
