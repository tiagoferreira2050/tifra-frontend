"use client";

import SortableItem from "./SortableItem";

export default function CategoryItem({
  id,
  name,
  active,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onUpdateUI,      // 👈 NOVO: pai atualiza UI
  storeId          // 👈 NOVO: usado na duplicação
}: any) {

  // =============================
  // SELEÇÃO
  // =============================
  function handleSelect() {
    if (onSelect) onSelect(id);
  }

  // =============================
  // TOGGLE ACTIVE (frontend + backend)
  // =============================
  async function handleToggle() {
    const newActive = !active;

    // Atualiza UI
    if (onUpdateUI) {
      onUpdateUI(id, { active: newActive });
    }

    // Salva no backend
    await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ active: newActive }),
    });
  }

  // =============================
  // DUPLICAR (frontend + backend)
  // =============================
  async function handleDuplicate() {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name + " (cópia)",
        storeId,
      }),
    });

    const newCat = await res.json();

    // Atualiza UI
    if (onUpdateUI) {
      onUpdateUI(null, null, newCat);
    }
  }

  return (
    <SortableItem
      id={id}
      name={name}
      active={active}
      isSelected={isSelected}

      onSelect={handleSelect}
      onToggle={handleToggle}        // 👈 atualizado
      onEdit={onEdit}
      onDelete={onDelete}
      onDuplicate={handleDuplicate}  // 👈 atualizado
    />
  );
}
