"use client";

import { useState, useEffect, useRef } from "react";
import ProductComplementsManager from "./ui/ProductComplementsManager";

export default function EditProductModal({
  open,
  onClose,
  product,
  categories,
  onSave,
  globalComplements = [],
}: any) {
  if (!open) return null;

  if (!product) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 shadow">Carregando produto…</div>
      </div>
    );
  }

  // ======================================================================
  // STATES
  // ======================================================================
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
  const [image, setImage] = useState<any>(null);
  const [classifications, setClassifications] = useState([] as string[]);

  const [selectedComplements, setSelectedComplements] = useState<any[]>([]);
  const initializedRef = useRef(false);

  // ======================================================================
  // CARREGA OS DADOS DO PRODUTO AO ABRIR
  // ======================================================================
  useEffect(() => {
    if (!product?.id) return;

    initializedRef.current = false;

    setName(product.name || "");
    setDescription(product.description || "");
    setCategoryId(product.categoryId || "");
    setPdv(product.pdv || "");

    setPrice(
      typeof product.price === "number"
        ? product.price.toFixed(2).replace(".", ",")
        : product.price || "0,00"
    );

    setHasDiscount(!!product.discount);
    setDiscountPercent(product.discount?.percent ? String(product.discount.percent) : "");
    setDiscountPrice(
      product.discount?.price ? String(product.discount.price).replace(".", ",") : ""
    );

    setPortionValue(product.portion?.value || "");
    setPortionUnit(product.portion?.unit || "un");
    setServes(product.serves || "");
    setHighlight(product.highlight || "");
    setImage(product.image || null);
    setClassifications(product.classifications || []);

  }, [product?.id]);

  // ======================================================================
  // INICIALIZA COMPLEMENTOS APENAS UMA VEZ
  // ======================================================================
  useEffect(() => {
    if (!product?.id || !open) return;
    if (initializedRef.current) return;

    let mapped: any[] = [];

    if (Array.isArray(product.complements) && product.complements.length > 0) {
      mapped = product.complements.map((c: any, index: number) => ({
        complementId: c.complementId || c.id || c,
        active: c.active ?? true,
        order: c.order ?? index,
      }));
    }

    setSelectedComplements(mapped);
    initializedRef.current = true;
  }, [product?.id, open, globalComplements]);

  // ======================================================================
  // HELPERS
  // ======================================================================
  function formatCurrency(value: string) {
    if (!value) return "0,00";
    const onlyNums = value.replace(/\D/g, "");
    if (!onlyNums) return "0,00";
    const cents = (parseInt(onlyNums) / 100).toFixed(2);
    return cents.replace(".", ",");
  }

  function toNumber(val: string) {
    const num = Number(String(val).replace(",", "."));
    return isNaN(num) ? 0 : num;
  }

  useEffect(() => {
    if (!hasDiscount) return;
    const base = toNumber(price);
    const pct = Number(discountPercent);
    if (!pct || base <= 0) return;
    setDiscountPrice((base - (base * pct) / 100).toFixed(2).replace(".", ","));
  }, [discountPercent, price]);

  useEffect(() => {
    if (!hasDiscount) return;
    const base = toNumber(price);
    const desc = toNumber(discountPrice);
    if (desc > 0 && desc < base) {
      const pct = Math.round(100 - (desc / base) * 100);
      setDiscountPercent(String(pct));
    }
  }, [discountPrice]);

  function toggleClassification(val: string) {
    setClassifications((prev) =>
      prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val]
    );
  }

  function handleImageUpload(e: any) {
    const file = e.target.files?.[0];
    if (file) setImage(URL.createObjectURL(file));
  }

  // ======================================================================
  // SALVAR PRODUTO
  // ======================================================================
  function handleSave() {
    if (!name.trim()) return alert("Nome obrigatório");
    if (!description.trim()) return alert("Descrição obrigatória");

    const numericPrice = Number(price.replace(",", "."));
if (isNaN(numericPrice) || numericPrice <= 0) {
  return alert("Preço inválido");
}


    const updated = {
      ...product,
      name,
      description,
      categoryId,
      pdv,
      price: numericPrice,
      portion: portionValue ? { value: portionValue, unit: portionUnit } : null,
      serves,
      highlight,
      image,
      discount: hasDiscount
        ? {
            percent: Number(discountPercent),
            price: toNumber(discountPrice),
          }
        : null,
      classifications,

      // ✅ ENVIA APENAS OS IDs DOS GRUPOS DE COMPLEMENTO
      complements: selectedComplements.map((c: any) => c.complementId),
    };

    onSave(updated);
    onClose();
  }

  // ======================================================================
  // UI
  // ======================================================================
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center overflow-y-auto py-10 z-50">
      <div className="bg-white rounded-2xl w-[750px] max-h-[90vh] overflow-y-auto p-6 shadow-xl">

        <h2 className="text-xl font-semibold mb-6">Editar produto</h2>

        {/* CAMPOS */}
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

        {/* COMPLEMENTOS */}
        <label className="block font-medium mb-1 mt-3">Complementos do produto</label>
        <ProductComplementsManager
          productComplements={selectedComplements}
          setProductComplements={setSelectedComplements}
          globalComplements={globalComplements}
          openGlobalCreate={() => {}}
          openGlobalEdit={() => {}}
        />

        {/* PDV */}
        <label className="block font-medium mb-1">Código PDV</label>
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
          <label className="flex items-center gap-1">
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
              onChange={(e) => setDiscountPrice(formatCurrency(e.target.value))}
            />
          </div>
        )}

        {/* PORÇÃO */}
        <label className="block font-medium mb-1">Porção</label>
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

        {/* SERVE ATÉ */}
        <label className="block font-medium mb-1">Serve até</label>
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
          <input type="file" className="mt-2" onChange={handleImageUpload} />
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
          <button className="px-4 py-2 bg-gray-200 rounded-md" onClick={onClose}>
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
