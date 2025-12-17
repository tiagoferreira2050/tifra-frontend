"use client";

import { useState, useEffect } from "react";
import ProductComplementsManager from "./ui/ProductComplementsManager";
import { apiFetch } from "@/lib/api";

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

  // 🔥 SEPARAÇÃO CORRETA
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

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
    const onlyNums = value.replace(/\D/g, "");
    if (!onlyNums) return "0,00";
    return (parseInt(onlyNums) / 100).toFixed(2).replace(".", ",");
  }

  function toNumber(val: string) {
    const num = Number(val.replace(",", "."));
    return isNaN(num) ? 0 : num;
  }

  // ============================================================
  // ✅ UPLOAD DE IMAGEM (IGUAL COMPLEMENTOS)
  // ============================================================
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // preview local (NUNCA vai pro banco)
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!API_URL) {
      alert("Backend não configurado");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || !data?.url) {
        alert("Erro ao enviar imagem");
        return;
      }

      // 🔥 URL REAL (CLOUDINARY)
      setImageUrl(data.url);
    } catch (err) {
      console.error("Erro upload imagem:", err);
      alert("Falha ao enviar imagem");
    }
  }

  // ============================================================
  // SALVAR PRODUTO
  // ============================================================
  async function handleSave() {
    if (!name.trim()) return alert("Nome obrigatório");
    if (!description.trim()) return alert("Descrição obrigatória");
    if (!categoryId) return alert("Selecione uma categoria");

    const numericPrice = toNumber(price);
    if (numericPrice <= 0) return alert("Preço inválido");

    try {
      const product = await apiFetch("/products", {
        method: "POST",
        body: JSON.stringify({
          name,
          description,
          priceInCents: Math.round(numericPrice * 100),
          categoryId,
          storeId: "e6fa0e88-308d-49a2-b988-9618d28daa73",

          // 🔥 SOMENTE URL REAL
          imageUrl: imageUrl || null,

          complements: selectedComplements.map(
            (c: any) => c.complementId
          ),
        }),
      });

  

      if (onSave) onSave();
      onClose();
    } catch (error: any) {
      console.error("Erro ao salvar produto:", error);
      alert(error?.message || "Erro ao salvar produto");
    }
  }

  // ============================================================
  // UI
  // ============================================================
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center overflow-y-auto py-10 z-50">
      <div className="bg-white rounded-2xl w-[750px] max-h-[90vh] overflow-y-auto p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-6">Criar novo produto</h2>

        <label className="block font-medium mb-1">Nome do produto *</label>
        <input
          className="w-full border rounded-md p-2 mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="block font-medium mb-1">Descrição *</label>
        <textarea
          className="w-full border rounded-md p-2 mb-4"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

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

        <label className="block font-medium mb-1 mt-3">
          Complementos do produto
        </label>

        <ProductComplementsManager
          productComplements={selectedComplements}
          setProductComplements={setSelectedComplements}
          globalComplements={globalComplementsState}
          openGlobalCreate={() => {}}
          openGlobalEdit={() => {}}
        />

        <label className="block font-medium mb-1">Código PDV (opcional)</label>
        <input
          className="w-full border rounded-md p-2 mb-4"
          value={pdv}
          onChange={(e) => setPdv(e.target.value)}
        />

        <label className="block font-medium mb-1">Preço *</label>
        <input
          className="border rounded-md p-2 w-full mb-4"
          value={price}
          onChange={(e) => setPrice(formatCurrency(e.target.value))}
        />

        <label className="block font-medium mb-1">Imagem</label>
        <div className="border-2 border-dashed rounded-md flex flex-col items-center justify-center h-40 mb-4 p-4 cursor-pointer relative">
          {imagePreview || imageUrl ? (
            <img
              src={imagePreview || imageUrl}
              className="h-full object-cover rounded"
            />
          ) : (
            <p className="text-gray-400">Arraste ou clique para enviar</p>
          )}

          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleImageUpload}
          />
        </div>

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
