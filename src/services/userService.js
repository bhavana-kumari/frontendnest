import api, { unwrap } from "./api";

export async function updateProfile(payload) {
  const data = unwrap(await api.put("/users/profile", payload));
  return data.user;
}
