// lib/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL não configurada");
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  // 🔐 TOKEN (se existir)
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("tifra_token")
      : null;

  // 👤 USER ID (necessário para rotas /store)
  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("tifra_user_id")
      : null;

  const isBodyMethod =
    options.method &&
    ["POST", "PUT", "PATCH"].includes(options.method);

  const res = await fetch(`${API_URL}${path}`, {
    ...options,

    // 🔑 essencial para CORS + cookies (Railway / Vercel)
    credentials: "include",

    headers: {
      ...(isBodyMethod ? { "Content-Type": "application/json" } : {}),

      // 🔐 Auth por token (mantido)
      ...(token ? { Authorization: `Bearer ${token}` } : {}),

      // 🔥 FIX DEFINITIVO para /store/me e /store/update-subdomain
      ...(userId ? { "x-user-id": userId } : {}),

      ...(options.headers || {}),
    },
  });

  // 🔍 tenta ler JSON, sem quebrar se vier vazio
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    console.error("❌ API ERROR:", {
      path,
      status: res.status,
      data,
    });

    throw new Error(data?.error || "Erro na requisição");
  }

  return data;
}
