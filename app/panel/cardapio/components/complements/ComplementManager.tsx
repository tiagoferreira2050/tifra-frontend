"use client";

import { useState, useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";

export default function ComplementManager({
  complements = [],
  setComplements,
  onOpenCreate,
  onOpenEdit,
  globalSearch = "",
}: any) {
  const [localSearch, setLocalSearch] = useState("");

  const effectiveSearch =
    localSearch.trim() !== "" ? localSearch : globalSearch;

  // ---------------- FILTRO ----------------
  const filtered = useMemo(() => {
    const term = (effectiveSearch || "").toLowerCase();
    if (!term) return complements;

    return complements.filter((c: any) => {
      const inTitle = (c.title || "").toLowerCase().includes(term);
      const inDescription = (c.description || "")
        .toLowerCase()
        .includes(term);

      const inOptions =
        Array.isArray(c.options) &&
        c.options.some((opt: any) =>
          (opt.name || "").toLowerCase().includes(term)
        );

      return inTitle || inDescription || inOptions;
    });
  }, [complements, effectiveSearch]);

  // ---------------- TOGGLE ACTIVE + SALVAR NO BACKEND ----------------
  async function toggleActive(id: string) {
    setComplements((prev: any[]) =>
      prev.map((c) =>
        c.id === id ? { ...c, active: !c.active } : c
      )
    );

    const changed = complements.find((c) => c.id === id);
    if (!changed) return;

    try {
      await fetch("/api/complements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          active: !changed.active,
        }),
      });
    } catch (err) {
      console.error("Erro ao atualizar complemento:", err);
    }
  }

  // ---------------- DELETE (LOCAL) ----------------
  async function deleteComplement(id: string) {
    if (!confirm("Deseja deletar este complemento?")) return;

    const backup = complements;

    setComplements((prev: any[]) => prev.filter((c) => c.id !== id));

    try {
      const res = await fetch("/api/complements", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error("Falha no backend");
      }

    } catch (err) {
      console.error("Erro ao deletar:", err);
      setComplements(backup);
      alert("Erro ao deletar complemento");
    }
  }

  // ---------------- UI ----------------
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Lista de complementos</h2>

        <button
          onClick={onOpenCreate}
          className="bg-red-600 text-white px-4 py-2 rounded-md text-sm"
        >
          + Novo complemento
        </button>
      </div>

      <input
        type="text"
        placeholder="Pesquisar variações"
        className="border w-full p-2 rounded-md"
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
      />

      <div className="flex flex-col gap-4">
        {filtered.map((comp: any) => (
          <div
            key={comp.id}
            className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-col gap-2"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={!!comp.active}
                    onChange={() => toggleActive(comp.id)}
                  />
                  <div
                    className={`w-11 h-6 rounded-full p-1 flex items-center transition ${
                      comp.active ? "bg-red-500" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`bg-white w-5 h-5 rounded-full shadow transform transition ${
                        comp.active ? "translate-x-5" : ""
                      }`}
                    />
                  </div>
                </label>

                <div className="flex flex-col">
                  <strong className="text-sm">{comp.title}</strong>

                  {comp.description && (
                    <p className="text-xs text-gray-600 leading-tight mt-1">
                      {comp.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onOpenEdit(comp)}
                  className="text-gray-600 hover:text-blue-600 p-1"
                >
                  <Pencil size={18} />
                </button>

                <button
                  onClick={() => deleteComplement(comp.id)}
                  className="text-gray-600 hover:text-red-600 p-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-1">
              {Array.isArray(comp.options) && comp.options.length > 0
                ? comp.options.map((o: any) => o.name).join(", ")
                : "Nenhuma opção adicionada"}
            </p>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-gray-500 text-center py-6">
            Nenhum complemento encontrado.
          </p>
        )}
      </div>
    </div>
  );
}
