import { supabase } from "./supabaseClient";

export async function signInOrSignUp(email: string, password: string) {
  // login normal
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (loginData?.user) {
    console.log("LOGIN OK:", loginData.user);
    return loginData.user;
  }

  // senha incorreta
  if (loginError && loginError.message.toLowerCase().includes("invalid login credentials")) {
    throw new Error("Senha incorreta.");
  }

  // verificar se usuário existe pelo admin
  const { data: usersData } = await supabase.auth.admin.listUsers();
  const exists = usersData.users.some(u => u.email === email);

  if (exists) {
    throw new Error("Senha incorreta.");
  }

  // criar usuário
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    throw new Error(signUpError.message);
  }

  console.log("SIGNUP OK:", signUpData.user);
  return signUpData.user;
}
