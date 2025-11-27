"use client";

import { useState } from "react";
import { MoreVertical } from "lucide-react";
import categoriesMock from "../data/mockCategories";

export default function CategoryList() {
  const [categories, setCategories] = useState(categoriesMock);

  function toggleActive(id: string) {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === id ? { ...cat, active: !cat.active } : cat
      )
    );
  }

  return (
    <div className="flex flex-col gap-3">

      {categories.map(cat => (
        <div
          key={cat.id}
          className="border rounded-lg p-3 flex items-center justify-between hover:shadow-sm transition"
        >
          <div className="flex items-center gap-3">
            {/* Toggle */}
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="sr-only"
                checked={cat.active}
                onChange={() => toggleActive(cat.id)}
              />
              <div
                className={`w-10 h-5 flex items-center rounded-full p-1 transition ${
                  cat.active ? "bg-red-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
                    cat.active ? "translate-x-5" : ""
                  }`}
                ></div>
              </div>
            </label>

            <span className="font-medium text-sm">
              {cat.name}
            </span>
          </div>

          {/* Menu três pontinhos */}
          <button className="p-1 text-gray-500 hover:text-black">
            <MoreVertical size={20} />
          </button>
        </div>
      ))}

    </div>
  );
}
