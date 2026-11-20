import api, { unwrap } from "./api";

export async function searchPlaces(q) {
  const data = unwrap(await api.get("/geo/search", { params: { q } }));
  return data.places;
}

export async function reversePlace(lat, lng) {
  const data = unwrap(await api.get("/geo/reverse", { params: { lat, lng } }));
  return data.place;
}

export async function health() {
  return unwrap(await api.get("/health"));
}
