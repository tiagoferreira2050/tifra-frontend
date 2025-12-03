"use client";

import ProductCard from "./ProductCard";

export function CategoryList({ categories }: any) {
  return (
    <div className="space-y-6 mt-6 pb-32">
      {categories.map((category: any) => (
        <div key={category.id} className="space-y-3">
          
          <h2 className="text-lg font-bold text-gray-800">{category.name}</h2>

          <div className="space-y-4">
            {category.products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

        </div>
      ))}
    </div>
  );
}
