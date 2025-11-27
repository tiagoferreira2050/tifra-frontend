"use client";

import CategoryItem from "./CategoryItem";
import EditCategoryModal from "./EditCategoryModal";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { useState } from "react";

// 🔥 IndexedDB
import { dbSave, dbDelete } from "../storage/db";

export default function CategoryManager({
  categories,
  setCategories,
  selectedCategoryId,
  onSelectCategory,
}: {
  categories: any[];
  setCategories: (fn: any) => void;
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor));

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isNew, setIsNew] = useState(false);

  function toggleActive(id: string) {
    setCategories((prev: any) =>
      prev.map((c: any) =>
        c.id === id ? { ...c, active: !c.active } : c
      )
    );

    // salvar mudança no banco
    const updated = categories.find((c) => c.id === id);
    if (updated) dbSave("categories", updated);
  }

  function onDragEnd(event: any) {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      setCategories((prev: any[]) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id);
        const newIndex = prev.findIndex((i) => i.id === over.id);
        const next = arrayMove(prev, oldIndex, newIndex);

        // salvar todas no db
        next.forEach((cat) => dbSave("categories", cat));

        return next;
      });
    }
  }

  function handleEdit(category: any) {
    setEditingCategory(category);
    setIsNew(false);
    setModalOpen(true);
  }

  function handleCreate() {
    const newCat = {
      id: String(Date.now()),
      name: "",
      active: true,
      products: [],
    };

    setEditingCategory(newCat);
    setIsNew(true);
    setModalOpen(true);
  }

  function handleSave(updated: any) {
    if (isNew) {
      setCategories((prev: any[]) => {
        const next = [...prev, updated];

        // salvar nova no banco
        dbSave("categories", updated);

        onSelectCategory(updated.id);
        return next;
      });
    } else {
      setCategories((prev: any[]) =>
        prev.map((c: any) =>
          c.id === updated.id ? updated : c
        )
      );

      // salvar edição no banco
      dbSave("categories", updated);
    }

    setModalOpen(false);
  }

  function handleDelete(id: string) {
    setCategories((prev: any[]) => prev.filter((c) => c.id !== id));

    // 🔥 DELETA DO BANCO DE VERDADE
    dbDelete("categories", id);

    if (selectedCategoryId === id) {
      onSelectCategory(null);
    }
  }

  function handleDuplicate(cat: any) {
    const newCat = {
      ...cat,
      id: String(Date.now()),
      name: cat.name + " (Cópia)",
      products: cat.products ? [...cat.products] : [],
    };

    setCategories((prev: any[]) => {
      const next = [...prev, newCat];

      // salvar no banco
      dbSave("categories", newCat);

      onSelectCategory(newCat.id);
      return next;
    });
  }

  function saveOrder() {
    try {
      const simple = categories.map((c) => ({ id: c.id, name: c.name }));
      localStorage.setItem("categories_order", JSON.stringify(simple));
      alert("Ordem salva localmente (localStorage). Substitua por sua API se necessário.");
    } catch (err) {
      console.error("Erro ao salvar ordem:", err);
      alert("Erro ao salvar ordem. Veja o console.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Categorias</h2>
        <button
          onClick={handleCreate}
          className="bg-red-600 text-white px-4 py-2 rounded-md text-sm"
        >
          + Nova categoria
        </button>
      </div>

      <button
        onClick={saveOrder}
        className="bg-green-600 w-full text-white py-2 rounded-md font-medium"
      >
        Salvar Ordem
      </button>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {categories.map((cat: any) => (
              <CategoryItem
                key={cat.id}
                id={cat.id}
                name={cat.name}
                active={cat.active}
                isSelected={selectedCategoryId === cat.id}
                onSelect={() => onSelectCategory(cat.id)}
                onToggle={toggleActive}
                onEdit={() => handleEdit(cat)}
                onDelete={() => handleDelete(cat.id)}
                onDuplicate={() => handleDuplicate(cat)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <EditCategoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        category={editingCategory}
        onSave={handleSave}
        isNew={isNew}
      />
    </div>
  );
}
