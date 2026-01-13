const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function signInOrSignUp(email: string, password: string) {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL não configurada");
  }

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // 🔥 ESSENCIAL
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "Erro ao fazer login");
  }

  // ✅ NÃO BUSCA /user
  // ✅ NÃO MANDA BEARER
  // ✅ COOKIE JÁ ESTÁ SETADO PELO BACKEND

  return data.user;
}
