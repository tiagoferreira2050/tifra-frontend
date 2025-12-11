"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Edit2 } from "lucide-react";

export default function ProductComplementsManager({
  productComplements = [],
  setProductComplements,
  globalComplements = [],
  openGlobalCreate,
  openGlobalEdit,
}: any) {
  const [localSearch, setLocalSearch] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  // ❗ REMOVEU O USEEFFECT QUE CAUSAVA TODOS OS BUGS

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  );

  // Normalização segura
  const normalized = Array.isArray(productComplements)
    ? productComplements
    : [];

  // FILTRO DO PICKER
  const filteredGlobal = useMemo(() => {
    const term = (localSearch || "").toLowerCase();
    if (!term) return globalComplements || [];

    return (globalComplements || []).filter((g: any) => {
      const title = (g.title || "").toLowerCase().includes(term);
      const inOptions =
        Array.isArray(g.options) &&
        g.options.some((o: any) =>
          (o.name || "").toLowerCase().includes(term)
        );
      return title || inOptions;
    });
  }, [globalComplements, localSearch]);

  // ➕ ADICIONAR COMPLEMENTO
  function addComplement(globalId: string) {
    setProductComplements((prev: any[]) => {
      const arr = Array.isArray(prev) ? prev : [];
      if (arr.find((c: any) => c.complementId === globalId)) return arr;

      return [
        ...arr,
        {
          complementId: globalId,
          active: true,
          order: arr.length,
        },
      ];
    });

    setShowPicker(false);
    setLocalSearch("");
  }

  // 🗑 REMOVER COMPLEMENTO
  function removeComplement(complementId: string) {
    setProductComplements((prev: any[]) =>
      prev.filter((c: any) => c.complementId !== complementId)
    );
  }

  // 🔄 ATIVAR / DESATIVAR COMPLEMENTO
  function toggleActive(complementId: string) {
    setProductComplements((prev: any[]) =>
      prev.map((c: any) =>
        c.complementId === complementId ? { ...c, active: !c.active } : c
      )
    );
  }

  // ↕️ DRAG & DROP
  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setProductComplements((prev: any[]) => {
      const arr = [...prev];
      const oldIndex = arr.findIndex((n: any) => n.complementId === active.id);
      const newIndex = arr.findIndex((n: any) => n.complementId === over.id);
      if (oldIndex === -1 || newIndex === -1) return arr;

      return arrayMove(arr, oldIndex, newIndex).map((item: any, idx: number) => ({
        ...item,
        order: idx,
      }));
    });
  }

  // ITEM DA LISTA
  function Row({ item }: { item: any }) {
    const id = item.complementId;
    const global = globalComplements.find((g: any) => g.id === id) || {};

    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id });

    return (
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        className="border rounded-lg p-3 bg-white shadow-sm flex items-start gap-3"
      >
        <div {...attributes} {...listeners} className="cursor-grab p-2 text-gray-400">
          <GripVertical size={18} />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">
                {global.title || "Complemento removido"}
              </div>

              {global.options?.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  {global.options.map((o: any) => o.name).join(", ")}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openGlobalEdit && openGlobalEdit(global)}
                className="p-2 hover:text-blue-600"
              >
                <Edit2 size={16} />
              </button>

              <button
                onClick={() => removeComplement(id)}
                className="p-2 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>

        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only"
            checked={!!item.active}
            onChange={() => toggleActive(id)}
          />
          <div
            className={`w-10 h-5 rounded-full p-1 flex items-center transition ${
              item.active ? "bg-red-500" : "bg-gray-300"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
                item.active ? "translate-x-5" : ""
              }`}
            />
          </div>
        </label>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        className="w-full border-2 border-red-200 text-red-600 rounded-lg py-3 font-medium"
        onClick={() => setShowPicker((s) => !s)}
      >
        + Adicionar complemento
      </button>

      {showPicker && (
        <div className="p-3 border rounded-md bg-white">
          <input
            type="text"
            placeholder="Pesquisar..."
            className="border rounded-md p-2 w-full mb-3"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />

          <div className="max-h-48 overflow-y-auto">
            {filteredGlobal.map((g: any) => (
              <div
                key={g.id}
                className="p-2 rounded-md hover:bg-gray-50 cursor-pointer flex justify-between"
                onMouseDown={() => addComplement(g.id)}
              >
                <div>
                  <div className="font-medium">{g.title}</div>
                  <div className="text-xs text-gray-500">
                    {g.options?.map((o: any) => o.name).join(", ")}
                  </div>
                </div>
                +
              </div>
            ))}
          </div>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={normalized.map((n: any) => n.complementId)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3">
            {normalized.map((item: any) => (
              <Row key={item.complementId} item={item} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {normalized.length === 0 && (
        <p className="text-gray-500 text-center py-4">
          Nenhum complemento adicionado ao produto.
        </p>
      )}
    </div>
  );
}
