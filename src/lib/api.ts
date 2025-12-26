// lib/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL não configurada");
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("tifra_token")
      : null;

  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("tifra_user_id")
      : null;

  const isBodyMethod =
    options.method &&
    ["POST", "PUT", "PATCH"].includes(options.method);

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(isBodyMethod ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(userId ? { "x-user-id": userId } : {}),
      ...(options.headers || {}),
    },
  });

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
