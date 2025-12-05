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

  // ========================================================
  // TOGGLE ACTIVE
  // ========================================================
  function toggleActive(id: string) {
    setCategories((prev: any[]) => {
      const next = prev.map((c: any) =>
        c.id === id ? { ...c, active: !c.active } : c
      );

      const updated = next.find((c: any) => c.id === id);
      if (updated) dbSave("categories", updated);

      return next;
    });
  }

  // ========================================================
  // DRAG AND DROP ORDER
  // ========================================================
  function onDragEnd(event: any) {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      setCategories((prev: any[]) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id);
        const newIndex = prev.findIndex((i) => i.id === over.id);
        const next = arrayMove(prev, oldIndex, newIndex);

        next.forEach((cat) => dbSave("categories", cat));
        return next;
      });
    }
  }

  // ========================================================
  // EDIT
  // ========================================================
  function handleEdit(category: any) {
    setEditingCategory(category);
    setIsNew(false);
    setModalOpen(true);
  }

  // ========================================================
  // CREATE (BACKEND)
  // ========================================================
  async function handleCreate() {
    const name = prompt("Nome da categoria:");
    if (!name) return;

    const storeId = process.env.NEXT_PUBLIC_STORE_ID;

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          storeId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Erro ao criar backend:", data);
        alert("Erro ao criar categoria!");
        return;
      }

      const newCat = {
        id: data.id,
        name: data.name,
        active: true,
        products: [],
      };

      setCategories((prev: any[]) => [...prev, newCat]);
      onSelectCategory(newCat.id);

    } catch (err) {
      console.error(err);
      alert("Erro ao criar categoria (servidor)");
    }
  }

  // ========================================================
  // SAVE (EDIT MODAL)
  // ========================================================
  function handleSave(updated: any) {
    if (isNew) {
      setCategories((prev: any[]) => {
        const next = [...prev, updated];
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

      dbSave("categories", updated);
    }

    setModalOpen(false);
  }

  // ========================================================
  // DELETE
  // ========================================================
  function handleDelete(id: string) {
    setCategories((prev: any[]) => prev.filter((c) => c.id !== id));

    dbDelete("categories", id);

    if (selectedCategoryId === id) {
      onSelectCategory(null);
    }
  }

  // ========================================================
  // DUPLICATE
  // ========================================================
  function handleDuplicate(cat: any) {
    const newCat = {
      ...cat,
      id: String(Date.now()),
      name: cat.name + " (Cópia)",
      products: cat.products ? [...cat.products] : [],
    };

    setCategories((prev: any[]) => {
      const next = [...prev, newCat];

      dbSave("categories", newCat);
      onSelectCategory(newCat.id);

      return next;
    });
  }

  // ========================================================
  // SAVE ORDER (LOCAL)
  // ========================================================
  function saveOrder() {
    try {
      const simple = categories.map((c) => ({ id: c.id, name: c.name }));
      localStorage.setItem("categories_order", JSON.stringify(simple));
      alert("Ordem salva localmente. Depois podemos mandar para API.");
    } catch (err) {
      console.error("Erro ao salvar ordem:", err);
      alert("Erro ao salvar ordem.");
    }
  }

  // ========================================================
  // UI
  // ========================================================
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
