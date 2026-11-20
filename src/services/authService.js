import api, { unwrap } from "./api";

export async function register(payload) {
  const data = unwrap(await api.post("/auth/register", payload));
  return data.user;
}

export async function login(payload) {
  const data = unwrap(await api.post("/auth/login", payload));
  return data.user;
}

export async function logout() {
  await api.post("/auth/logout");
}

export async function me() {
  const data = unwrap(await api.get("/auth/me"));
  return data.user;
}
