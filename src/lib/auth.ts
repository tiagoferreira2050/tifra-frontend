const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function signInOrSignUp(email: string, password: string) {
  if (!API_URL) {
    throw new Error("API_URL não configurada");
  }

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

  localStorage.setItem("tifra_token", data.token);

  const userRes = await fetch(`${API_URL}/user`, {
    headers: {
      Authorization: `Bearer ${data.token}`,
    },
  });

  const userData = await userRes.json();

  if (!userRes.ok) {
    throw new Error("Erro ao buscar usuário");
  }

  return userData.user;
}
