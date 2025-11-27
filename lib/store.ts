import { supabase } from "@/lib/supabaseClient";

export async function ensureStoreExists(userId: string) {
  if (!userId) {
    throw new Error("ID do usuário inválido.");
  }

  console.log("🔍 ensureStoreExists() → userId:", userId);

  // 1. verificar se a loja já existe
  const { data: existingStore, error: selectError } = await supabase
    .from("stores")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (selectError) {
    console.error("Erro ao buscar loja:", selectError);
    throw new Error("Erro ao verificar loja.");
  }

  if (existingStore) {
    console.log("✔ Loja já existe:", existingStore);
    return existingStore;
  }

  // 2. criar loja nova
  const { data: newStore, error: insertError } = await supabase
    .from("stores")
    .insert({
      user_id: userId,
      name: "Minha Loja",
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    console.error("❌ Erro ao criar loja:", insertError);
    throw new Error("Erro ao criar loja: " + insertError.message);
  }

  console.log("🏪 Loja criada:", newStore);
  return newStore;
}
