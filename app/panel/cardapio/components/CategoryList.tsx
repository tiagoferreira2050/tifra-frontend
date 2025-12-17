"use client";

import { MoreVertical } from "lucide-react";

export default function CategoryList({
  categories = [],
  onToggle,
  onMenuClick,
}: {
  categories: any[];
  onToggle?: (id: string) => void;
  onMenuClick?: (category: any) => void;
}) {
  if (!Array.isArray(categories) || categories.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Nenhuma categoria encontrada
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {categories.map((cat: any) => (
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
                checked={!!cat.active}
                onChange={() => onToggle?.(cat.id)}
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
                />
              </div>
            </label>

            <span className="font-medium text-sm">
              {cat.name}
            </span>
          </div>

          {/* Menu */}
          <button
            className="p-1 text-gray-500 hover:text-black"
            onClick={() => onMenuClick?.(cat)}
          >
            <MoreVertical size={20} />
          </button>
        </div>
      ))}
    </div>
  );
}
