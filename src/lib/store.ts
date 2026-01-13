import api from "./api";

export async function getMyStore() {
  const response = await api.get("/api/store/me");
  return response.data;
}
