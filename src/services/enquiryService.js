import api, { unwrap } from "./api";

export async function createEnquiry(payload) {
  const data = unwrap(await api.post("/enquiries", payload));
  return data.enquiry;
}

export async function myEnquiries() {
  return unwrap(await api.get("/enquiries/my-enquiries"));
}

export async function receivedEnquiries() {
  return unwrap(await api.get("/enquiries/received"));
}

export async function updateEnquiryStatus(id, status) {
  const data = unwrap(await api.patch(`/enquiries/${id}/status`, { status }));
  return data.enquiry;
}
