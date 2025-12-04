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

  // 🔥 ÚNICA ALTERAÇÃO NECESSÁRIA
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

  useEffect(() => {
    if (!hasDiscount) return;
    const base = toNumber(price);
    const pct = Number(discountPercent);
    if (!pct || base <= 0) return;
    const final = base - (base * pct) / 100;
    setDiscountPrice(final.toFixed(2).replace(".", ","));
  }, [discountPercent, price]);

  useEffect(() => {
    if (!hasDiscount) return;
    const base = toNumber(price);
    const desc = toNumber(discountPrice);
    if (desc <= 0 || desc >= base) return;
    const pct = Math.round(100 - (desc / base) * 100);
    setDiscountPercent(String(pct));
  }, [discountPrice]);

  // ============================================================
  // CLASSIFICAÇÕES
  // ============================================================
  function toggleClassification(val: string) {
    setClassifications((prev) =>
      prev.includes(val)
        ? prev.filter((c) => c !== val)
        : [...prev, val]
    );
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
  function handleSave() {
    if (!name.trim()) return alert("Nome obrigatório");
    if (!description.trim()) return alert("Descrição obrigatória");
    if (!categoryId) return alert("Selecione uma categoria");

    const numericPrice = toNumber(price);
    if (numericPrice <= 0) return alert("Preço inválido");

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

        {/* 🔥 FIX: Evitar crash quando categories for undefined */}
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
          <p className="text-red-500 mb-4">
            Nenhuma categoria encontrada
          </p>
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
          <label className="flex items-center gap-1 select-none">
            <input
              type="checkbox"
              checked={hasDiscount}
              onChange={(e) => setHasDiscount(e.target.checked)}
            />
            Desconto
          </label>
        </div>

        {hasDiscount && (
          <div className="flex gap-3 mt-3 mb-4">
            <input
              className="border rounded-md p-2 w-1/2"
              placeholder="%"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
            />
            <input
              className="border rounded-md p-2 w-1/2"
              placeholder="Preço com desconto"
              value={discountPrice}
              onChange={(e) =>
                setDiscountPrice(formatCurrency(e.target.value))
              }
            />
          </div>
        )}


        {/* PORÇÃO */}
        <label className="block font-medium mb-1">Tamanho da porção (opcional)</label>
        <div className="flex gap-2 mb-4">
          <input
            className="border rounded-md p-2 w-1/2"
            placeholder="Valor"
            value={portionValue}
            onChange={(e) => setPortionValue(e.target.value)}
          />
          <select
            className="border rounded-md p-2 w-1/2"
            value={portionUnit}
            onChange={(e) => setPortionUnit(e.target.value)}
          >
            <option value="ml">ml</option>
            <option value="l">l</option>
            <option value="g">g</option>
            <option value="kg">kg</option>
            <option value="un">un</option>
            <option value="cm">cm</option>
          </select>
        </div>

        {/* SERVE */}
        <label className="block font-medium mb-1">Serve até (opcional)</label>
        <input
          className="w-full border rounded-md p-2 mb-4"
          value={serves}
          onChange={(e) => setServes(e.target.value)}
        />

        {/* IMAGEM */}
        <label className="block font-medium mb-1">Imagem</label>
        <div className="border-2 border-dashed rounded-md flex flex-col items-center justify-center h-40 mb-4 p-4">
          {image ? (
            <img src={image} className="h-full object-cover rounded" />
          ) : (
            <p className="text-gray-400">Arraste ou clique para enviar</p>
          )}
          <input
            type="file"
            className="mt-2"
            onChange={handleImageUpload}
          />
        </div>

        {/* DESTAQUE */}
        <label className="block font-medium mb-1">Destaque</label>
        <select
          className="w-full border rounded-md p-2 mb-4"
          value={highlight}
          onChange={(e) => setHighlight(e.target.value)}
        >
          <option value="">Nenhum</option>
          <option value="recomendado">Recomendado</option>
          <option value="novidade">Novidade</option>
        </select>

        {/* CLASSIFICAÇÕES */}
        <label className="block font-medium mb-2">Classificações</label>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {["Vegano", "Zero Lactose", "Zero Açúcar", "Orgânico"].map((c) => (
            <label key={c} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={classifications.includes(c)}
                onChange={() => toggleClassification(c)}
              />
              {c}
            </label>
          ))}
        </div>

        {/* BOTÕES */}
        <div className="flex justify-end gap-3">
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
