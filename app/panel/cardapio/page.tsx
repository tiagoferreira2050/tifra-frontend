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

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const [newComplementOpen, setNewComplementOpen] = useState(false);
  const [editComplementOpen, setEditComplementOpen] = useState(false);
  const [editingComplement, setEditingComplement] = useState<any>(null);

  const [activeTab, setActiveTab] = useState("produtos");
  const [search, setSearch] = useState("");

  const [newProductOpen, setNewProductOpen] = useState(false);

  // ======================================================
  // 1) CARREGAR CATEGORIAS
  // ======================================================
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error("Resposta inválida de /api/categories:", data);
          setCategories([]);
          return;
        }

        const formatted = data.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          active: cat.active ?? true,
          products: Array.isArray(cat.products) ? cat.products : [],
        }));

        setCategories(formatted);
        setSelectedCategoryId(formatted[0]?.id || null);

      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        setCategories([]);
      }
    }

    loadData();
  }, []);

  // ======================================================
  // 2) CARREGAR COMPLEMENTOS DO BACKEND
  // ======================================================
  useEffect(() => {
    async function loadComplements() {
      try {
        const res = await fetch("/api/complements", { cache: "no-store" });
        const data = await res.json();

        const formatted = data.map((g: any) => ({
  id: g.id,
  title: g.name,
  description: "",
  type: g.type || "multiple", // 👈 CORREÇÃO AQUI
  required: g.required,
  minChoose: g.min,
  maxChoose: g.max,
  active: g.active ?? true,
  options: g.items?.map((i: any) => ({
    id: i.id,
    name: i.name,
    price: i.price ?? 0,
    active: i.active ?? true,
  })) || [],
}));


        setComplements(formatted);
      } catch (err) {
        console.error("Erro ao carregar complementos:", err);
      }
    }

    loadComplements();
  }, []);

  // ======================================================
  // 3) SALVAR NOVO PRODUTO
  // ======================================================
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

  // ======================================================
  // 4) ATUALIZAR PRODUTO
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
  // 5) SALVAR NOVO COMPLEMENTO (NO BANCO)
  // ======================================================
  async function saveNewComplement(newComp: any, productId: string) {
  try {
    const res = await fetch("/api/complements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        name: newComp.title,
        required: newComp.required,
        min: newComp.minChoose,
        max: newComp.maxChoose,
        options: newComp.options || [], // <<< enviar sub-opções
      }),
    });

    const created = await res.json();

    if (!res.ok) {
      console.error("Erro ao criar complemento:", created);
      alert("Erro ao criar complemento");
      return;
    }

    // atualizar UI
    setComplements((prev) => [...prev, {
      id: created.id,
      title: created.name,
      required: created.required,
      minChoose: created.min,
      maxChoose: created.max,
      active: created.active,
      options: created.items?.map((i: any) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        active: i.active,
      })) || [],
    }]);

  } catch (err) {
    console.error("Erro salvar complemento:", err);
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

  async function saveEditedComplement(updated: any) {
  try {
    // ---------------------------------------------------
    // 1) Atualiza o GRUPO
    // ---------------------------------------------------
    const groupPayload = {
  id: updated.id,
  name: updated.title,
  required: updated.required,
  min: updated.minChoose ? Number(updated.minChoose) : 0,
  max: updated.maxChoose ? Number(updated.maxChoose) : 1,
  active: updated.active,
  type: updated.type, // 👈 CORRETO
};




    const resGroup = await fetch("/api/complements", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(groupPayload),
    });

    const savedGroup = await resGroup.json();

    if (!resGroup.ok) {
      console.error("Erro ao atualizar grupo:", savedGroup);
      alert("Erro ao atualizar complemento");
      return;
    }

    // ---------------------------------------------------
    // 2) ITENS (criar / atualizar)
    // ---------------------------------------------------
    const options = updated.options || [];

    const createPromises: Promise<any>[] = [];
    const updatePromises: Promise<any>[] = [];

    for (const opt of options) {
      // 🛑 ignorar itens vazios
      if (!opt.name || opt.name.trim() === "") continue;

      const isNew = !opt.id || String(opt.id).startsWith("opt-");

      const basePayload = {
        groupId: savedGroup.id,
        name: opt.name.trim(),
        price: Number(opt.price ?? 0),
        active: opt.active ?? true,
      };

      if (isNew) {
        // criar item
        createPromises.push(
          fetch("/api/complements/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(basePayload),
          })
        );
      } else {
        // atualizar item
        updatePromises.push(
          fetch("/api/complements/items", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: opt.id,
              ...basePayload,
            }),
          })
        );
      }
    }

    // 🧠 Espera todas operações
    await Promise.all([...createPromises, ...updatePromises]);

    // ---------------------------------------------------
    // 3) Recarrega dados para UI atualizada
    // ---------------------------------------------------
    const resReload = await fetch("/api/complements", {
      cache: "no-store",
    });

    const dataReload = await resReload.json();

    const formatted = dataReload.map((g: any) => ({
      id: g.id,
      title: g.name,
      description: "",
      type: "multiple",
      required: g.required,
      minChoose: g.min,
      maxChoose: g.max,
      active: g.active,
      options:
        g.items?.map((i: any) => ({
          id: i.id,
          name: i.name,
          price: i.price ?? 0,
          active: i.active ?? true,
        })) || [],
    }));

    setComplements(formatted);

  } catch (err) {
    console.error("Erro salvar complemento + itens:", err);
    alert("Erro ao atualizar complemento");
  }
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

          {/* LISTAS */}
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
