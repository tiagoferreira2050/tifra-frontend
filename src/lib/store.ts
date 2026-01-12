import { apiFetch } from "@/lib/api";

/* ===============================
   TYPES
=============================== */
export type Store = {
  id: string;
  name: string;
  subdomain: string | null;
  userId: string;
};

/* ===================================================
   🚨 LEGADO (NÃO REMOVER)
   👉 Usado por partes antigas do sistema
=================================================== */
export async function getStoreByUser(userId: string): Promise<Store> {
  if (!userId) {
    throw new Error("ID do usuário inválido.");
  }

  const store = await apiFetch(`/stores/by-user/${userId}`);

  if (!store) {
    throw new Error("Usuário não possui loja vinculada.");
  }

  return store;
}

/* ===================================================
   ✅ NOVO PADRÃO OFICIAL
   👉 SEMPRE use esse método após login
   👉 Cria a loja automaticamente se não existir
=================================================== */
export async function getMyStore(): Promise<Store> {
  const data = await apiFetch("/api/store/me");

  if (!data?.store?.id) {
    throw new Error("Erro ao inicializar loja do usuário");
  }

  return data.store;
}
