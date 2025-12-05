// app/panel/cardapio/components/EditCategoryModal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from "@/app/panel/cardapio/components/ui/dialog";

import { useState, useEffect } from "react";

export default function EditCategoryModal({
  open,
  onClose,
  category,
  onSave,
  isNew = false, // 🔥 modo criação
}: any) {
  const [name, setName] = useState("");

  // Carrega dados da categoria ao abrir (somente se estiver editando)
  useEffect(() => {
    if (!isNew && category) {
      setName(category.name ?? "");
    } else {
      setName(""); // limpeza ao criar novo
    }
  }, [category, isNew]);

  function handleSave() {
    if (!name.trim()) return;

    onSave({
  ...category,
  name,
});

  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isNew ? "Criar nova categoria" : `Editar categoria "${category?.name ?? ""}"`}
          </DialogTitle>
        </DialogHeader>

        {/* NOME */}
        <div className="flex flex-col gap-2 mt-4">
          <label className="text-sm font-medium">Nome da categoria</label>
          <input
            className="border rounded-md px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-3">
          <DialogClose asChild>
            <button
              type="button"
              className="px-4 py-2 rounded-md border text-sm"
            >
              Cancelar
            </button>
          </DialogClose>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 text-sm"
          >
            Salvar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
