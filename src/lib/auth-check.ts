import api from "./api";

export async function checkAuth() {
  try {
    await api.get("/api/me");
    return true;
  } catch {
    return false;
  }
}
