import { apiFetch } from "@/lib/api";

type Store = {
  id: string;
  name: string;
  subdomain: string;
  userId: string;
};

export async function ensureStoreExists(userId: string): Promise<Store> {
  if (!userId) {
    throw new Error("ID do usuário inválido.");
  }

  // 🔍 tenta buscar store existente
  try {
    const store = await apiFetch(`/stores/by-user/${userId}`);
    if (store) return store;
  } catch (_) {
    // se não existir, seguimos para criar
  }

  // 🏪 cria store padrão
  const created = await apiFetch("/stores", {
    method: "POST",
    body: JSON.stringify({
      name: "Minha Loja",
      userId,
    }),
  });

  return created;
}
