import api, { unwrap } from "./api";

export async function searchProperties(params) {
  return unwrap(await api.get("/properties", { params }));
}

export async function getProperty(id) {
  const data = unwrap(await api.get(`/properties/${id}`));
  return data.property;
}

export async function createProperty(payload) {
  const data = unwrap(await api.post("/properties", payload));
  return data.property;
}

export async function updateProperty(id, payload) {
  const data = unwrap(await api.put(`/properties/${id}`, payload));
  return data.property;
}

export async function deleteProperty(id) {
  await api.delete(`/properties/${id}`);
}

export async function updatePropertyStatus(id, availabilityStatus) {
  const data = unwrap(await api.patch(`/properties/${id}/status`, { availabilityStatus }));
  return data.property;
}

export async function myListings() {
  return unwrap(await api.get("/properties/my-listings"));
}

export async function uploadImages(files) {
  const form = new FormData();
  files.forEach((file) => form.append("photos", file));
  const data = unwrap(await api.post("/uploads", form));
  return data.photos;
}
