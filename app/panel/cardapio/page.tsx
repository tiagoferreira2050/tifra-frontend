"use client";

import { useState, useEffect } from "react";

// COMPONENTES (PRODUTOS)
import CategoryManager from "./components/CategoryManager";
import ProductList from "./components/ProductList";
import NewProductModal from "./components/NewProductModal";

// COMPONENTES (COMPLEMENTOS)
import ComplementManager from "./components/complements/ComplementManager";
import NewComplementModal from "./components/complements/NewComplementModal";
import EditComplementModal from "./components/complements/EditComplementModal";

import { Search, Plus } from "lucide-react";

// 📦 IndexedDB
import { dbLoadAll, dbSave } from "./storage/db";

export default function CardapioPage() {
  // ======================================================
  // ESTADOS PRINCIPAIS
  // ======================================================
  const [categories, setCategories] = useState<any[]>([]);
  const [complements, setComplements] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  const [newComplementOpen, setNewComplementOpen] = useState(false);
  const [editComplementOpen, setEditComplementOpen] = useState(false);
  const [editingComplement, setEditingComplement] = useState<any>(null);

  const [activeTab, setActiveTab] = useState("produtos");
  const [search, setSearch] = useState("");

  const [newProductOpen, setNewProductOpen] = useState(false);

  // ======================================================
  // 1) CARREGAR CATEGORIAS DO BACKEND AO ABRIR O PAINEL
  // ======================================================
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error("Resposta inválida de /api/categories:", data);
          setCategories([]);
          return;
        }

        // 🔥 Garante estrutura compatível com o restante do app
        const formatted = data.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          active: true, // default — backend ainda não salva
          products: [], // obrigatório para ProductList
        }));

        setCategories(formatted);
        setSelectedCategoryId(formatted[0]?.id || null);

        // complementos ainda não estão no backend
        setComplements([]);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        setCategories([]);
      }
    }

    loadData();
  }, []);

  // ======================================================
  // 4) SALVAR NOVO PRODUTO
  // ======================================================
  function handleSaveProduct(categoryId: string, newProduct: any) {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              products: [...cat.products, newProduct],
            }
          : cat
      )
    );

    dbSave("products", newProduct);
  }

  // ======================================================
  // 5) ATUALIZAR (EDITAR) PRODUTO
  // ======================================================
  function handleUpdateProduct(updatedProduct: any) {
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        products: cat.products.map((p: any) =>
          p.id === updatedProduct.id ? updatedProduct : p
        ),
      }))
    );

    dbSave("products", updatedProduct);
  }

  // ======================================================
  // COMPLEMENTOS
  // ======================================================
  function openCreateComplement() {
    setNewComplementOpen(true);
  }

  function openEditComplement(comp: any) {
    setEditingComplement(comp);
    setEditComplementOpen(true);
  }

  function saveNewComplement(newComp: any) {
    setComplements((prev) => [...prev, newComp]);
    dbSave("complements", newComp);
  }

  function saveEditedComplement(updated: any) {
    setComplements((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
    dbSave("complements", updated);
  }

  // ======================================================
  // LAYOUT
  // ======================================================
  return (
    <>
      <div className="flex w-full h-full p-4 gap-4">
        {/* LEFT — CATEGORIAS */}
        <div className="w-1/3 bg-white rounded-lg border shadow-sm p-4 overflow-y-auto">
          <CategoryManager
            categories={categories}
            setCategories={setCategories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(id: string | null) =>
              setSelectedCategoryId(id || "")
            }
          />
        </div>

        {/* RIGHT */}
        <div className="flex-1 bg-white rounded-lg border shadow-sm p-4">
          {/* TABS */}
          <div className="flex border-b mb-4 gap-6">
            {["produtos", "complementos", "promocoes"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 text-sm font-medium ${
                  activeTab === tab
                    ? "border-b-2 border-black text-black"
                    : "text-gray-500"
                }`}
              >
                {tab[0].toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* SEARCH */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center border rounded-md px-2 w-1/2">
              <Search size={18} className="text-gray-400" />
              <input
                placeholder="Buscar produtos e complementos..."
                className="w-full px-2 py-1 outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {activeTab === "produtos" && (
              <button
                className="bg-red-600 text-white px-4 py-1.5 rounded-md flex items-center gap-2"
                onClick={() => setNewProductOpen(true)}
              >
                <Plus size={16} /> Novo produto
              </button>
            )}
          </div>

          {/* TABS */}
          {activeTab === "produtos" && (
            <ProductList
              categories={categories}
              setCategories={setCategories}
              selectedCategoryId={selectedCategoryId}
              search={search}
              complements={complements}
              onUpdateProduct={handleUpdateProduct}
            />
          )}

          {activeTab === "complementos" && (
            <ComplementManager
              complements={complements}
              setComplements={setComplements}
              onOpenCreate={openCreateComplement}
              onOpenEdit={openEditComplement}
              globalSearch={search}
            />
          )}

          {activeTab === "promocoes" && (
            <p className="text-gray-500">Em breve…</p>
          )}
        </div>
      </div>

      {/* MODAIS */}
      <NewProductModal
        open={newProductOpen}
        onClose={() => setNewProductOpen(false)}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSave={handleSaveProduct}
        complements={complements}
      />

      <NewComplementModal
        open={newComplementOpen}
        onClose={() => setNewComplementOpen(false)}
        onSave={saveNewComplement}
      />

      <EditComplementModal
        open={editComplementOpen}
        onClose={() => setEditComplementOpen(false)}
        complement={editingComplement}
        onSave={saveEditedComplement}
      />
    </>
  );
}
