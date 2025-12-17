"use client";

import { useState, useEffect } from "react";
import ProductComplementsManager from "./ui/ProductComplementsManager";

export default function EditProductModal({
  open,
  onClose,
  product,
  categories,
  onSave,
  globalComplements = [],
}: any) {
  if (!open || !product) return null;

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

  // ============================================================
  // CARREGAR PRODUTO AO ABRIR
  // ============================================================
  useEffect(() => {
    if (!product) return;

    setName(product.name || "");
    setDescription(product.description || "");
    setCategoryId(product.categoryId || "");
    setPdv(product.pdv || "");

    setPrice(
      typeof product.price === "number"
        ? product.price.toFixed(2).replace(".", ",")
        : "0,00"
    );

    // 🔥 imagem vinda do banco
    setImageUrl(product.imageUrl || null);
    setImagePreview(null);

    const raw = product.productComplements || [];

    setSelectedComplements(
      raw.map((pc: any, index: number) => ({
        complementId: pc.groupId,
        active: pc.active ?? true,
        order: pc.order ?? index,
      }))
    );
  }, [product]);

  // GLOBAL COMPLEMENTS
  useEffect(() => {
    setGlobalComplementsState(globalComplements || []);
  }, [globalComplements]);

  // ============================================================
  // HELPERS
  // ============================================================
  function formatCurrency(value: string) {
    const onlyNums = value.replace(/\D/g, "");
    if (!onlyNums) return "0,00";
    return (parseInt(onlyNums) / 100).toFixed(2).replace(".", ",");
  }

  function toNumber(val: string) {
    const n = Number(val.replace(",", "."));
    return isNaN(n) ? 0 : n;
  }

  // ============================================================
  // UPLOAD DE IMAGEM (PADRÃO CORRETO)
  // ============================================================
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // preview local
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);

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

      // 🔥 URL REAL (Cloudinary)
      setImageUrl(data.url);
    } catch (err) {
      console.error("Erro upload imagem:", err);
      alert("Erro ao enviar imagem");
    }
  }

  // ============================================================
  // SALVAR NO BANCO (PATCH)
  // ============================================================
  async function handleSave() {
    if (!name.trim()) return alert("Nome obrigatório");
    if (!description.trim()) return alert("Descrição obrigatória");

    const numericPrice = toNumber(price);
    if (numericPrice <= 0) return alert("Preço inválido");

    try {
      const complementsOrdered = [...selectedComplements].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
      );

      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          priceInCents: Math.round(numericPrice * 100),
          categoryId,
          pdv,

          // 🔥 SOMENTE URL REAL
          ...(imageUrl ? { imageUrl } : {}),

          complements: complementsOrdered.map(
            (c: any) => c.complementId
          ),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(`Erro ao salvar: ${data.error || res.status}`);
        return;
      }

      alert("Produto atualizado!");
      const updated = await res.json();

      if (onSave) onSave(updated);
      onClose();
    } catch (err) {
      console.error("Erro ao salvar produto:", err);
      alert("Erro ao conectar ao servidor");
    }
  }

  // ============================================================
  // UI
  // ============================================================
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center overflow-y-auto py-10 z-50">
      <div className="bg-white rounded-2xl w-[750px] max-h-[90vh] overflow-y-auto p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-6">Editar produto</h2>

        <label className="block font-medium mb-1">Nome *</label>
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

        <label className="block font-medium mb-1 mt-3">
          Complementos do produto
        </label>

        <ProductComplementsManager
          productComplements={selectedComplements}
          setProductComplements={setSelectedComplements}
          globalComplements={globalComplementsState}
        />

        <label className="block font-medium mb-1">
          Código PDV (opcional)
        </label>
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
            Salvar alterações
          </button>
        </div>
      </div>
    </div>
  );
}
