const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function signInOrSignUp(email: string, password: string) {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL não configurada");
  }

  // 🔐 LOGIN (cookie httpOnly é setado pelo backend)
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

  // 🔥 BUSCA USUÁRIO JÁ AUTENTICADO (cookie)
  const userRes = await fetch(`${API_URL}/user`, {
    credentials: "include", // 🔥 ESSENCIAL
  });

  const userData = await userRes.json();

  if (!userRes.ok) {
    throw new Error(userData?.error || "Erro ao buscar usuário");
  }

  return userData.user;
}
