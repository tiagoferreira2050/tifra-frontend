const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function signInOrSignUp(email: string, password: string) {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL não configurada");
  }

  // 🔐 LOGIN → backend seta cookie httpOnly (tifra_token)
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

  // ❌ NÃO salva token
  // ❌ NÃO retorna token
  // cookie já foi criado pelo backend

  // 👤 BUSCA USUÁRIO USANDO COOKIE
  const userRes = await fetch(`${API_URL}/user`, {
    method: "GET",
    credentials: "include", // 🔥 ENVIA tifra_token automaticamente
  });

  const userData = await userRes.json();

  if (!userRes.ok) {
    throw new Error(userData?.error || "Erro ao buscar usuário");
  }

  return userData.user;
}
