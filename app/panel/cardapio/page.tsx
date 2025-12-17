"use client";

import { useState, useEffect } from "react";

// COMPONENTES (PRODUTOS)
import CategoryManager from "./components/CategoryManager";
import ProductList from "./components/ProductList";
import NewProductModal from "./components/NewProductModal";
import EditProductModal from "./components/EditProductModal";

// COMPONENTES (COMPLEMENTOS)
import ComplementManager from "./components/complements/ComplementManager";
import NewComplementModal from "./components/complements/NewComplementModal";
import EditComplementModal from "./components/complements/EditComplementModal";

import { apiFetch } from "@/lib/api"; // ✅ ADIÇÃO NECESSÁRIA

export default function CardapioPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [complements, setComplements] = useState<any[]>([]);

  const [editProductOpen, setEditProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [selectedCategoryId, setSelectedCategoryId] =
    useState<string | null>(null);

  const [newComplementOpen, setNewComplementOpen] = useState(false);
  const [editComplementOpen, setEditComplementOpen] = useState(false);
  const [editingComplement, setEditingComplement] = useState<any>(null);

  const [activeTab, setActiveTab] = useState("produtos");
  const [search, setSearch] = useState("");

  const [newProductOpen, setNewProductOpen] = useState(false);

  // ==========================
  // CARREGAR CATEGORIAS
  // ==========================
  useEffect(() => {
    async function loadData() {
      try {
        const data = await apiFetch("/categories");

        const formatted = Array.isArray(data)
          ? data.map((cat: any) => ({
              id: cat.id,
              name: cat.name,
              active: cat.active ?? true,
              products: Array.isArray(cat.products)
  ? cat.products.map((p: any) => ({
      ...p,
      imageUrl: p.imageUrl || null, // 🔥 LINHA QUE FALTAVA
      discount: p?.discount ?? 0,
      price: p?.price ?? 0,
      active: p?.active ?? true,
      complements: Array.isArray(p?.complements)
        ? p.complements
                      : [],
                  }))
                : [],
            }))
          : [];

        setCategories(formatted);
        setSelectedCategoryId(formatted[0]?.id ?? null);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      }
    }

    loadData();
  }, []);

  // ==========================
  // CARREGAR COMPLEMENTOS
  // ==========================
  async function loadComplementsFromServer() {
    try {
      const data = await apiFetch("/complements");

      const formatted = Array.isArray(data)
        ? data.map((g: any) => ({
            id: g.id,
            title: g.name,
            description: g.description || "",
            type: g.type || "multiple",
            required: g.required,
            minChoose: g.min,
            maxChoose: g.max,
            active: g.active ?? true,
            options:
              g.items?.map((i: any) => ({
                id: i.id,
                name: i.name,
                price: i.price ?? 0,
                active: i.active ?? true,
                imageUrl: i.imageUrl || null,
                description: i.description || "",
              })) || [],
          }))
        : [];

      setComplements(formatted);
    } catch (err) {
      console.error("Erro ao carregar complementos:", err);
    }
  }

  useEffect(() => {
    loadComplementsFromServer();
  }, []);

  // ==========================
  // SALVAR NOVO PRODUTO
  // ==========================
 async function handleSaveProduct() {
  try {
    const data = await apiFetch("/categories");

    const formatted = Array.isArray(data)
      ? data.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          active: cat.active ?? true,
          products: Array.isArray(cat.products)
            ? cat.products.map((p: any) => ({
                ...p,
                price: p?.price ?? 0,
                active: p?.active ?? true,
                complements: Array.isArray(p?.productComplements)
                  ? p.productComplements
                  : [],
              }))
            : [],
        }))
      : [];

    setCategories(formatted);
    setSelectedCategoryId(formatted[0]?.id ?? null);
  } catch (err) {
    console.error("Erro ao recarregar produtos:", err);
  }
}

  // ==========================
  // ATUALIZAR PRODUTO
  // ==========================
  function handleUpdateProduct(updatedProduct: any) {
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        products: cat.products.map((p: any) =>
          p.id === updatedProduct.id ? updatedProduct : p
        ),
      }))
    );
  }

  // ==========================
  // SALVAR NOVO COMPLEMENTO
  // ==========================
  async function saveNewComplement(newComp: any) {
    try {
      await apiFetch("/complements", {
        method: "POST",
        body: JSON.stringify({
          name: newComp.title,
          description: newComp.description,
          type: newComp.type,
          required: newComp.required,
          min: newComp.minChoose,
          max: newComp.maxChoose,
          options: newComp.options || [],
        }),
      });

      await loadComplementsFromServer();
    } catch (err) {
      alert("Erro ao salvar complemento.");
    }
  }

  function openCreateComplement() {
    setNewComplementOpen(true);
  }

  function openEditComplement(comp: any) {
    setEditingComplement(comp);
    setEditComplementOpen(true);
  }

  // ==========================
  // SALVAR EDIÇÃO DO COMPLEMENTO
  // ==========================
  async function saveEditedComplement(updated: any) {
    try {
      await apiFetch("/complements", {
        method: "PATCH",
        body: JSON.stringify(updated),
      });

      await loadComplementsFromServer();
    } catch (err) {
      alert("Erro ao atualizar complemento.");
    }
  }

  return (
    <>
      <div className="flex w-full h-full p-4 gap-4">
        <div className="w-1/3 bg-white rounded-lg border shadow-sm p-4 overflow-y-auto">
          <CategoryManager
            categories={categories}
            setCategories={setCategories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(id: string | null) =>
              setSelectedCategoryId(id)
            }
          />
        </div>

        <div className="flex-1 bg-white rounded-lg border shadow-sm p-4">
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

          {activeTab === "produtos" && (
            <ProductList
              categories={categories}
              setCategories={setCategories}
              selectedCategoryId={selectedCategoryId}
              search={search}
              complements={complements}
              onUpdateProduct={handleUpdateProduct}
              onCreateProduct={() => setNewProductOpen(true)}
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
        </div>
      </div>

      <NewProductModal
        open={newProductOpen}
        onClose={() => setNewProductOpen(false)}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSave={handleSaveProduct}
        complements={complements}
      />

      <EditProductModal
        open={editProductOpen}
        onClose={() => setEditProductOpen(false)}
        product={editingProduct}
        categories={categories}
        globalComplements={complements}
        onSave={handleUpdateProduct}
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
