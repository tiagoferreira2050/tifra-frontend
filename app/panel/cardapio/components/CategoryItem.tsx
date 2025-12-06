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
  onToggle,
  onDuplicate,
}: any) {

  // =============================
  // SELEÇÃO
  // =============================
  function handleSelect() {
    if (onSelect) onSelect(id);
  }

  // =============================
  // TOGGLE (frontend + backend é feito no pai)
  // =============================
  function handleToggle() {
    if (onToggle) onToggle(id);
  }

  // =============================
  // DUPLICAR (apenas chama o pai)
  // =============================
  function handleDuplicate() {
    if (onDuplicate) onDuplicate();
  }

  return (
    <SortableItem
      id={id}
      name={name}
      active={active}
      isSelected={isSelected}

      onSelect={handleSelect}
      onToggle={handleToggle}
      onEdit={onEdit}
      onDelete={onDelete}
      onDuplicate={handleDuplicate}
    />
  );
}
