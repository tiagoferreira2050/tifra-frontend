import { apiFetch } from "@/lib/api";

type Store = {
  id: string;
  name: string;
  subdomain: string;
  userId: string;
};

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
