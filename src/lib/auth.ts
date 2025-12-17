const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function signInOrSignUp(email: string, password: string) {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL não configurada");
  }

  // 🔐 LOGIN
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "Erro ao fazer login");
  }

  /**
   * ✅ COOKIE (mantido exatamente como já funcionava)
   * Usado para compatibilidade / legado
   */
  document.cookie = [
    `tifra_token=${data.token}`,
    "Path=/",
    "Max-Age=604800", // 7 dias
    "SameSite=Lax",
  ].join("; ");

  /**
   * 🔥 LOCALSTORAGE (necessário para apiFetch)
   * NÃO quebra nada que já existia
   */
  localStorage.setItem("tifra_token", data.token);

  // 👤 BUSCA USUÁRIO COM AUTH HEADER
  const userRes = await fetch(`${API_URL}/user`, {
    headers: {
      Authorization: `Bearer ${data.token}`,
    },
  });

  const userData = await userRes.json();

  if (!userRes.ok) {
    throw new Error(userData?.error || "Erro ao buscar usuário");
  }

  return userData.user;
}
