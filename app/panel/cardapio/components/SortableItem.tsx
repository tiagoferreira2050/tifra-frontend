"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical, MoreVertical } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function SortableItem({
  id,
  name,
  active,
  isSelected,
  onSelect,
  onToggle,
  onEdit,
  onDelete,
  onDuplicate,
}: any) {
  // =====================================================
  // SORTABLE
  // =====================================================
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  // =====================================================
  // FECHAR MENU AO CLICAR FORA
  // =====================================================
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =====================================================
  // UI
  // =====================================================
  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect?.(id)}
      className={`border rounded-lg p-3 flex items-center justify-between 
        bg-white hover:bg-gray-50 shadow-sm cursor-pointer transition
        ${isSelected ? "border-red-500 bg-red-50" : ""}`}
    >
      {/* DRAG HANDLE */}
      <div
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="cursor-grab active:cursor-grabbing text-gray-400"
      >
        <GripVertical size={20} />
      </div>

      {/* NOME */}
      <span className="flex-1 ml-3 text-sm select-none">
        {name || "Sem nome"}
      </span>

      {/* TOGGLE ATIVO */}
      <label
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center cursor-pointer mr-3"
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={!!active}
          onChange={() => onToggle?.(id)}
        />
        <div
          className={`w-10 h-5 rounded-full p-1 flex items-center transition ${
            active ? "bg-red-500" : "bg-gray-300"
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
              active ? "translate-x-5" : ""
            }`}
          />
        </div>
      </label>

      {/* MENU */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <MoreVertical size={20} />
        </button>

        {menuOpen && (
          <div
            className="absolute right-0 top-7 bg-white border shadow-md rounded-md w-32 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setMenuOpen(false);
                onEdit?.();
              }}
              className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
            >
              Editar
            </button>

            <button
              onClick={() => {
                setMenuOpen(false);
                onDuplicate?.();
              }}
              className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
            >
              Duplicar
            </button>

            <button
              onClick={() => {
                setMenuOpen(false);
                onDelete?.();
              }}
              className="block w-full text-left px-3 py-2 hover:bg-red-100 text-sm text-red-600"
            >
              Deletar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
