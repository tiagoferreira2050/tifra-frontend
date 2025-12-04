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

  // ============================================================
  // ESTADOS DO PRODUTO
  // ============================================================
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

  // ============================================================
  // COMPLEMENTOS
  // ============================================================
  const [selectedComplements, setSelectedComplements] = useState<any[]>([]);
  const [globalComplementsState, setGlobalComplementsState] = useState<any[]>([]);

  useEffect(() => {
    if (open) setCategoryId(selectedCategoryId || "");
  }, [selectedCategoryId, open]);

  useEffect(() => {
    setGlobalComplementsState(globalComplements || []);
  }, [globalComplements]);

  // ============================================================
  // FORMATADORES
  // ============================================================
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

  // ============================================================
  // IMAGEM
  // ============================================================
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImage(url);
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

    // 🔥 converter para centavos
    const priceInCents = Math.round(numericPrice * 100);

    // 🔥 salvar no banco
    await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
        priceInCents,
        categoryId,
        storeId: "c8d9f792-cabd-4095-ba4a-c8095bab84e5", // ✔️ store real
      }),
    });

    // 🔥 código antigo continua funcionando
    const numericDiscountPrice = hasDiscount ? toNumber(discountPrice) : null;

    const fullComplements = selectedComplements
      .map((c: any) =>
        globalComplementsState.find(
          (gc: any) => gc.id === c.complementId || gc.id === c.id
        )
      )
      .filter(Boolean);

    const newProduct = {
      id: "prod-" + Date.now(),
      name,
      description,
      categoryId,
      pdv,
      price: numericPrice,
      portion: portionValue
        ? { value: portionValue, unit: portionUnit }
        : null,
      serves,
      highlight,
      image,
      discount: hasDiscount
        ? {
            percent: Number(discountPercent),
            price: numericDiscountPrice,
          }
        : null,
      classifications,
      complements: fullComplements,
      active: true,
    };

    onSave(categoryId, newProduct);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[750px] max-h-[90vh] overflow-y-auto p-6 shadow-xl">

        {/* ... resto sem mudanças ... */}

        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 bg-gray-200 rounded-md" onClick={onClose}>
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
