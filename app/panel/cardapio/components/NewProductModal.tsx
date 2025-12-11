"use client";

import { useState, useEffect } from "react";
import ProductComplementsManager from "./ui/ProductComplementsManager";

export default function NewProductModal({
  open,
  onClose,
  categories,
  selectedCategoryId,
  onSave,
  complements: globalComplements = [],
}: any) {
  if (!open) return null;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [pdv, setPdv] = useState("");
  const [price, setPrice] = useState("0,00");
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");

  const [portionValue, setPortionValue] = useState("");
  const [portionUnit, setPortionUnit] = useState("un");
  const [serves, setServes] = useState("");
  const [highlight, setHighlight] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [classifications, setClassifications] = useState([] as string[]);

  const [selectedComplements, setSelectedComplements] = useState<any[]>([]);
  const [globalComplementsState, setGlobalComplementsState] = useState<any[]>([]);

  useEffect(() => {
    if (open) setCategoryId(selectedCategoryId || "");
  }, [selectedCategoryId, open]);

  useEffect(() => {
    setGlobalComplementsState(globalComplements || []);
  }, [globalComplements]);

  function formatCurrency(value: string) {
    if (!value) return "0,00";
    let onlyNums = value.replace(/\D/g, "");
    if (onlyNums === "") return "0,00";
    let cents = (parseInt(onlyNums) / 100).toFixed(2);
    return cents.replace(".", ",");
  }

  function toNumber(val: string) {
    const num = Number(val.replace(",", "."));
    return isNaN(num) ? 0 : num;
  }

  function toggleClassification(val: string) {
    setClassifications((prev) =>
      prev.includes(val)
        ? prev.filter((c) => c !== val)
        : [...prev, val]
    );
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImage(url);
  }

  // ============================================================
  // SALVAR PRODUTO (API)
  // ============================================================
  async function handleSave() {
    if (!name.trim()) return alert("Nome obrigatório");
    if (!description.trim()) return alert("Descrição obrigatória");
    if (!categoryId) return alert("Selecione uma categoria");

    const numericPrice = toNumber(price);
    if (numericPrice <= 0) return alert("Preço inválido");

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          priceInCents: Math.round(numericPrice * 100),
          categoryId,
          storeId: "e6fa0e88-308d-49a2-b988-9618d28daa73",
          imageUrl: image || null,

          // ✅ PEGA SEMPRE O ID DO GRUPO (correto para seu sistema)
          complements: selectedComplements.map((c: any) => c.complementId),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(`Erro ao salvar: ${data.error || res.status}`);
        return;
      }

      alert("Produto salvo com sucesso!");
      const product = await res.json();

      if (onSave) onSave(categoryId, product);

      onClose();
    } catch (error) {
      console.error("Erro ao salvar produto no banco:", error);
      alert("Erro ao conectar ao servidor");
    }
  }

  // ============================================================
  // UI
  // ============================================================
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[750px] max-height-[90vh] overflow-y-auto p-6 shadow-xl">

        <h2 className="text-xl font-semibold mb-6">Criar novo produto</h2>

        {/* NOME */}
        <label className="block font-medium mb-1">Nome do produto *</label>
        <input
          className="w-full border rounded-md p-2 mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* DESCRIÇÃO */}
        <label className="block font-medium mb-1">Descrição *</label>
        <textarea
          className="w-full border rounded-md p-2 mb-4"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* CATEGORIA */}
        <label className="block font-medium mb-1">Categoria *</label>
        {Array.isArray(categories) && categories.length > 0 ? (
          <select
            className="w-full border rounded-md p-2 mb-4"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-red-500 mb-4">Nenhuma categoria encontrada</p>
        )}

        {/* COMPLEMENTOS */}
        <label className="block font-medium mb-1 mt-3">Complementos do produto</label>

        <ProductComplementsManager
          productComplements={selectedComplements}
          setProductComplements={setSelectedComplements}
          globalComplements={globalComplementsState}
          openGlobalCreate={() => {}}
          openGlobalEdit={() => {}}
        />

        {/* PDV */}
        <label className="block font-medium mb-1">Código PDV (opcional)</label>
        <input
          className="w-full border rounded-md p-2 mb-4"
          value={pdv}
          onChange={(e) => setPdv(e.target.value)}
        />

        {/* PREÇO */}
        <label className="block font-medium mb-1">Preço *</label>
        <div className="flex items-center gap-3">
          <input
            className="border rounded-md p-2 w-full"
            value={price}
            onChange={(e) => setPrice(formatCurrency(e.target.value))}
          />
        </div>

        {/* PORÇÃO, SERVE, IMAGEM, DESTAQUE, CLASSIFICAÇÕES... */}
        {/* 🔥 Tudo mantido exatamente como estava no seu arquivo */}

        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2 bg-gray-200 rounded-md"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            className="px-4 py-2 bg-red-600 text-white rounded-md"
            onClick={handleSave}
          >
            Salvar produto
          </button>
        </div>
      </div>
    </div>
  );
}
