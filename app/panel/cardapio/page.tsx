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
import { dbSave } from "./storage/db";

export default function CardapioPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [complements, setComplements] = useState<any[]>([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

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
        const res = await fetch("/api/categories", { cache: "no-store" });
        const data = await res.json();

        const formatted = Array.isArray(data)
          ? data.map((cat: any) => ({
              id: cat.id,
              name: cat.name,
              active: cat.active ?? true,
              products: Array.isArray(cat.products) ? cat.products : [],
            }))
          : [];

        setCategories(formatted);
        setSelectedCategoryId(formatted[0]?.id || null);
      } catch (error) {
        setCategories([]);
      }
    }

    loadData();
  }, []);

  // ==========================
  // CARREGAR COMPLEMENTOS
  // ==========================
  useEffect(() => {
    async function loadComplements() {
      try {
        const res = await fetch("/api/complements", { cache: "no-store" });
        const data = await res.json();

        const formatted = data.map((g: any) => ({
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
              image: i.imageUrl || null,
              description: i.description || "",
            })) || [],
        }));

        setComplements(formatted);
      } catch (err) {
        console.error("Erro ao carregar complementos:", err);
      }
    }

    loadComplements();
  }, []);

  // ==========================
  // SALVAR NOVO PRODUTO
  // ==========================
  function handleSaveProduct(categoryId: string, newProduct: any) {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? { ...cat, products: [...cat.products, newProduct] }
          : cat
      )
    );

    dbSave("products", newProduct);
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

    dbSave("products", updatedProduct);
  }

  // ==========================
  // SALVAR NOVO COMPLEMENTO
  // ==========================
  async function saveNewComplement(newComp: any) {
    try {
      const res = await fetch("/api/complements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      const created = await res.json();

      if (!res.ok) {
        alert("Erro ao criar complemento");
        return;
      }

      // ADICIONA NA UI SEM RELOAD
      setComplements((prev) => [
        ...prev,
        {
          id: created.id,
          title: created.name,
          description: created.description || "",
          type: created.type,
          required: created.required,
          minChoose: created.min,
          maxChoose: created.max,
          active: created.active,
          options:
            created.items?.map((i: any) => ({
              id: i.id,
              name: i.name,
              price: i.price,
              active: i.active,
              image: i.imageUrl || null,
              description: i.description || "",
            })) || [],
        },
      ]);
    } catch (err) {
      alert("Erro ao salvar complemento");
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
      const payload = {
        id: updated.id,
        name: updated.title,
        description: updated.description ?? "",
        required: updated.required ?? false,
        min: updated.minChoose ? Number(updated.minChoose) : 0,
        max: updated.maxChoose ? Number(updated.maxChoose) : 1,
        active: updated.active,
        type: updated.type,
        options: updated.options.map((opt: any) => ({
          id: opt.id,
          name: opt.name,
          price: Number(opt.price ?? 0),
          active: opt.active,
          imageUrl: opt.imageUrl || opt.image || null,
          description: opt.description || "",
        })),
      };

      const backup = [...complements];

      // Atualiza imediatamente no painel
      const optimistic = complements.map((g: any) =>
        g.id === updated.id
          ? {
              ...g,
              title: updated.title,
              description: updated.description ?? "",
              type: updated.type,
              required: updated.required,
              minChoose: updated.minChoose,
              maxChoose: updated.maxChoose,
              active: updated.active,
              options: updated.options.map((o: any) => ({
                id: o.id,
                name: o.name,
                price: Number(o.price ?? 0),
                active: o.active,
                image: o.imageUrl || o.image || null,
                description: o.description || "",
              })),
            }
          : g
      );

      setComplements(optimistic);

      // PATCH backend
      const res = await fetch("/api/complements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        setComplements(backup);
        alert("Erro ao atualizar complemento.");
        return;
      }
    } catch (err) {
      alert("Erro inesperado ao salvar complemento.");
    }
  }

  // ==========================
  // LAYOUT
  // ==========================
  return (
    <>
      <div className="flex w-full h-full p-4 gap-4">
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
