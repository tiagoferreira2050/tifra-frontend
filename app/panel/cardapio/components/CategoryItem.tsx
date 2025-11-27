"use client";

import SortableItem from "./SortableItem";

export default function CategoryItem({
  id,
  name,
  active,
  isSelected,
  onSelect,
  onToggle,
  onEdit,
  onDelete,
  onDuplicate
}: any) {
  function handleSelect() {
    if (onSelect) onSelect(id); // ← AGORA PASSA O ID CERTO
  }

  return (
    <SortableItem
      id={id}
      name={name}
      active={active}
      isSelected={isSelected}
      onSelect={handleSelect}     // ← CORRIGIDO
      onToggle={onToggle}
      onEdit={onEdit}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
    />
  );
}
