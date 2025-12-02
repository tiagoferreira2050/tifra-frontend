import prisma from "@/lib/prisma";

function generateSubdomain(name: string) {
  return name
    .toLowerCase()
    .replace(/[^\w]+/g, "")
    .replace(/\s+/g, "");
}

export async function ensureStoreExists(userId: string) {
  if (!userId) throw new Error("ID do usuário inválido.");

  // Verifica se já existe loja
  let store = await prisma.store.findFirst({
    where: { userId },
  });

  if (store) return store;

  const defaultName = "Minha Loja";
  let sub = generateSubdomain(defaultName);

  const exists = await prisma.store.findUnique({
    where: { subdomain: sub },
  });

  if (exists) {
    sub = `${sub}-${Math.floor(Math.random() * 9999)}`;
  }

  store = await prisma.store.create({
    data: {
      userId,
      name: defaultName,
      subdomain: sub,
    },
  });

  return store;
}
