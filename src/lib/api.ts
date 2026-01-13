const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(path: string, options: RequestInit = {}) {
  const isBodyMethod =
    options.method &&
    ["POST", "PUT", "PATCH"].includes(options.method);

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include", // 🔥 PADRÃO GLOBAL
    headers: {
      ...(isBodyMethod ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    throw new Error(data?.error || "Erro na requisição");
  }

  return data;
}
