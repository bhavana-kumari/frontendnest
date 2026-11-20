import api, { unwrap } from "./api";

export async function listFavorites() {
  return unwrap(await api.get("/favorites"));
}

export async function addFavorite(propertyId) {
  const data = unwrap(await api.post(`/favorites/${propertyId}`));
  return data.property;
}

export async function removeFavorite(propertyId) {
  await api.delete(`/favorites/${propertyId}`);
}
