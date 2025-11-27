// /app/panel/cardapio/storage/db.ts

export const DB_NAME = "tifra-delivery";
export const DB_VERSION = 1;

// Abre ou cria o banco
export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;

      // Criar tabela de categorias
      if (!db.objectStoreNames.contains("categories")) {
        db.createObjectStore("categories", { keyPath: "id" });
      }

      // Criar tabela de produtos
      if (!db.objectStoreNames.contains("products")) {
        const store = db.createObjectStore("products", { keyPath: "id" });
        store.createIndex("categoryId", "categoryId", { unique: false });
      }

      // Criar tabela de complementos globais
      if (!db.objectStoreNames.contains("complements")) {
        db.createObjectStore("complements", { keyPath: "id" });
      }

      // Criar tabela de pedidos (futuro)
      if (!db.objectStoreNames.contains("orders")) {
        db.createObjectStore("orders", { keyPath: "id" });
      }
    };

    request.onerror = () => reject("Erro ao abrir IndexedDB");
    request.onsuccess = () => resolve(request.result);
  });
}

// =====================================================================
//  🔥 FUNÇÃO dbSave ATUALIZADA PARA NÃO APAGAR COMPLEMENTOS
// =====================================================================
export async function dbSave(storeName: string, data: any) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);

    // Primeiro busca dados antigos
    const getOld = store.get(data.id);

    getOld.onsuccess = () => {
      const oldData = getOld.result || {};

      // 🧩 Merge: mantém tudo que já existia (inclusive complements)
      const finalData = { ...oldData, ...data };

      // Salva sem perder nada
      const saveReq = store.put(finalData);

      saveReq.onsuccess = () => resolve(true);
      saveReq.onerror = () => reject("Erro ao salvar no IndexedDB");
    };

    getOld.onerror = () => reject("Erro ao carregar registro antigo");
  });
}

// Função genérica para carregar todos os registros da tabela
export async function dbLoadAll(storeName: string) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);

    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("Erro ao carregar dados do IndexedDB");
  });
}

// Deletar item
export async function dbDelete(storeName: string, id: string) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);

    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject("Erro ao deletar");
  });
}
