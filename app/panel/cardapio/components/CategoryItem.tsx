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
  return (
    <SortableItem
      id={id}
      name={name}
      active={!!active}
      isSelected={!!isSelected}
      onSelect={() => onSelect?.(id)}
      onToggle={() => onToggle?.(id)}
      onEdit={onEdit}
      onDelete={onDelete}
      onDuplicate={() => onDuplicate?.(id)}
    />
  );
}
