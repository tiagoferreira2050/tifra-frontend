"use client";

import { useState, useEffect } from "react";

export default function EditComplementModal({
  open,
  onClose,
  complement,
  onSave,
}: any) {
  if (!open || !complement) return null;


  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"single" | "multiple" | "addable">("multiple");
  const [required, setRequired] = useState(false);
  const [minChoose, setMinChoose] = useState("");
  const [maxChoose, setMaxChoose] = useState("");
  const [options, setOptions] = useState<any[]>([]);

  // ==========================================================
  // CARREGAR DADOS
  // ==========================================================
  useEffect(() => {
    if (!complement) return;

    setTitle(complement.title || "");
    setDescription(complement.description || "");
    setType(complement.type || "multiple");
    setRequired(!!complement.required);
    setMinChoose(complement.minChoose ? String(complement.minChoose) : "");
    setMaxChoose(complement.maxChoose ? String(complement.maxChoose) : "");

    setOptions(
      (complement.options || []).map((o: any) => ({
        id: o.id || "opt-" + crypto.randomUUID(),
        name: o.name || "",
        price:
          o.price !== undefined
            ? String(o.price).replace(".", ",")
            : "0,00",
        active: o.active ?? true,
        pdv: o.pdv || "",
        imageUrl: o.imageUrl || o.image || null, // 🔥 PADRONIZADO
        description: o.description || "",
      }))
    );
  }, [complement, open]);

  // ==========================================================
  // GERENCIAR OPÇÕES
  // ==========================================================
  function addOption() {
    setOptions((prev) => [
      ...prev,
      {
        id: "opt-" + crypto.randomUUID(),
        name: "",
        price: "0,00",
        active: true,
        pdv: "",
        imageUrl: null, // 🔥 PADRONIZADO
        description: "",
      },
    ]);
  }

  function updateOption(id: string, patch: any) {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }

  function removeOption(id: string) {
    setOptions((prev) => prev.filter((o) => o.id !== id));
  }

  // ==========================================================
  // UPLOAD IMAGEM
  // ==========================================================
  async function handleImageUpload(e: any, id: string) {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: data });
    const json = await res.json();

    if (!res.ok || !json.url) {
      alert("Erro ao enviar imagem");
      return;
    }

    updateOption(id, { imageUrl: json.url }); // 🔥 PADRONIZADO
  }

  // ==========================================================
  // FORMATADORES
  // ==========================================================
  function formatCurrency(value: string) {
    if (!value) return "0,00";
    const only = value.replace(/\D/g, "");
    if (!only) return "0,00";
    return (parseInt(only) / 100).toFixed(2).replace(".", ",");
  }

  function toNumber(val: string) {
  if (!val) return 0;
  return Number(val.replace(".", "").replace(",", ".")) || 0;
}


  // ==========================================================
  // SALVAR
  // ==========================================================
  function handleSave() {
    if (!title.trim()) {
      alert("Título obrigatório");
      return;
    }

    const payload = {
      id: complement.id,
      title,
      description,
      type,
      required,
      minChoose: minChoose ? Number(minChoose) : null,
      maxChoose: maxChoose ? Number(maxChoose) : null,
      active: complement.active,
      options: options.map((opt: any) => ({
        id: opt.id,
        name: opt.name,
        price: toNumber(opt.price),
        active: opt.active,
        imageUrl: opt.imageUrl || null, // 🔥 PADRONIZADO
        description: opt.description || "",
      })),
    };

    onSave(payload);
    onClose();
  }

  // ==========================================================
  // LAYOUT
  // ==========================================================
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[820px] max-h-[90vh] overflow-y-auto p-6 shadow-xl">

        <h2 className="text-xl font-semibold mb-4">Editar complemento</h2>

        <label className="block font-medium mb-1">Título *</label>
        <input
          className="w-full border rounded-md p-2 mb-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="block font-medium mb-1">Descrição (opcional)</label>
        <textarea
          className="w-full border rounded-md p-2 mb-3"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Tipo / Required / Min / Max */}
        <div className="flex gap-3 mb-3">
          <div>
            <label className="block font-medium mb-1">Tipo</label>
            <select
              className="border rounded-md p-2"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
            >
              <option value="single">Opção única</option>
              <option value="multiple">Múltipla escolha</option>
              <option value="addable">Somável</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Obrigatório</label>
            <input
              type="checkbox"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Min</label>
            <input
              className="border rounded-md p-2 w-20"
              value={minChoose}
              onChange={(e) => setMinChoose(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Max</label>
            <input
              className="border rounded-md p-2 w-20"
              value={maxChoose}
              onChange={(e) => setMaxChoose(e.target.value)}
            />
          </div>
        </div>

        {/* OPÇÕES */}
        <div className="mb-3 flex items-center justify-between">
          <strong>Opções</strong>
          <button
            onClick={addOption}
            className="bg-red-600 text-white px-3 py-1 rounded-md text-sm"
          >
            + Adicionar opção
          </button>
        </div>

        <div className="flex flex-col gap-3 mb-4">
          {options.map((opt) => (
            <div key={opt.id} className="border rounded-lg p-3 flex gap-3 items-start">
              <div className="flex-1">

                <input
                  className="w-full border rounded p-2 mb-2"
                  placeholder="Nome da opção"
                  value={opt.name}
                  onChange={(e) => updateOption(opt.id, { name: e.target.value })}
                />

                <div className="flex gap-2">
                  <input
                    className="border rounded p-2 w-36"
                    placeholder="Preço"
                    value={opt.price}
                    onChange={(e) =>
                      updateOption(opt.id, { price: formatCurrency(e.target.value) })
                    }
                  />

                  <input
                    className="border rounded p-2 w-36"
                    placeholder="PDV"
                    value={opt.pdv}
                    onChange={(e) => updateOption(opt.id, { pdv: e.target.value })}
                  />
                </div>

                <textarea
                  className="w-full border rounded p-2 mt-2"
                  placeholder="Descrição"
                  value={opt.description}
                  onChange={(e) =>
                    updateOption(opt.id, { description: e.target.value })
                  }
                />
              </div>

              {/* IMAGEM */}
              <div className="flex flex-col items-end gap-2">
                <label className="text-xs text-gray-600">Imagem</label>

                <div className="w-20 h-20 border rounded-md overflow-hidden mb-1">
                  {opt.imageUrl ? (
                    <img src={opt.imageUrl} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                      sem imagem
                    </div>
                  )}
                </div>

                <input type="file" onChange={(e) => handleImageUpload(e, opt.id)} />

                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={opt.active}
                    onChange={(e) => updateOption(opt.id, { active: e.target.checked })}
                  />
                  <span className="text-sm">Ativo</span>

                  <button
                    onClick={() => removeOption(opt.id)}
                    className="text-red-600 px-2"
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">
            Cancelar
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-red-600 text-white rounded-md"
          >
            Salvar alterações
          </button>
        </div>
      </div>
    </div>
  );
}
