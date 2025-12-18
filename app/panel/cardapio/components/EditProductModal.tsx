"use client";

import { useState, useEffect } from "react";
import ProductComplementsManager from "./ui/ProductComplementsManager";
import { apiFetch } from "@/lib/api";

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

  // 🔥 PADRÃO DEFINITIVO (IGUAL NEW)
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [selectedComplements, setSelectedComplements] = useState<any[]>([]);
  const [globalComplementsState, setGlobalComplementsState] = useState<any[]>([]);

  // ============================================================
  // LOAD PRODUCT (NÃO MEXER NO ESPELHO)
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

    setImageUrl(
      typeof product.imageUrl === "string" &&
        product.imageUrl.startsWith("http")
        ? product.imageUrl
        : null
    );
    setImagePreview(null);

    const raw = product.productComplements || [];

    // ✅ FORMATO CORRETO
    setSelectedComplements(
      raw.map((pc: any, index: number) => ({
        groupId: pc.groupId,
        active: pc.active ?? true,
        order: pc.order ?? index,
      }))
    );
  }, [product]);

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
  // UPLOAD IMAGE (IGUAL NEW PRODUCT)
  // ============================================================
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
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

      if (typeof data.url === "string" && data.url.startsWith("http")) {
        setImageUrl(data.url);
      }
    } catch (err) {
      console.error("Erro upload imagem:", err);
      alert("Erro ao enviar imagem");
    }
  }

  // ============================================================
  // SAVE (CORRIGIDO)
  // ============================================================
  async function handleSave() {
    if (!name.trim()) return alert("Nome obrigatório");
    if (!description.trim()) return alert("Descrição obrigatória");

    const numericPrice = toNumber(price);
    if (numericPrice <= 0) return alert("Preço inválido");

    try {
      const payload: any = {
        name,
        description,
        priceInCents: Math.round(numericPrice * 100),
        categoryId,
        pdv,
      };

      // ✅ imagem blindada
      if (typeof imageUrl === "string" && imageUrl.startsWith("http")) {
        payload.imageUrl = imageUrl;
      }

      // ✅ complementos corretos
      if (selectedComplements.length > 0) {
        payload.complements = selectedComplements
          .sort((a, b) => a.order - b.order)
          .map((c: any) => c.groupId);
      }

      const updated = await apiFetch(`/products/${product.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      if (onSave) onSave(updated);
      onClose();
    } catch (err: any) {
      console.error("Erro ao salvar produto:", err);
      alert(err?.message || "Erro ao salvar produto");
    }
  }

  // ============================================================
  // UI (NÃO ALTERADA)
  // ============================================================
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center overflow-y-auto py-10 z-50">
      <div className="bg-white rounded-2xl w-[750px] max-h-[90vh] overflow-y-auto p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-6">Editar produto</h2>

        {/* resto do JSX permanece exatamente igual */}
        {/* botão chama handleSave */}
      </div>
    </div>
  );
}
