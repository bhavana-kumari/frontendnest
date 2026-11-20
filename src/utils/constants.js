export const PROPERTY_TYPES = [
  { value: "independent_house", label: "Independent House" },
  { value: "apartment", label: "Apartment / Flat" },
  { value: "complete_floor", label: "Complete Floor" },
];

export const FURNISHING = [
  { value: "furnished", label: "Furnished" },
  { value: "unfurnished", label: "Unfurnished" },
];

export const RADII = [
  { value: "5", label: "5 km" },
  { value: "10", label: "10 km" },
  { value: "25", label: "25 km" },
  { value: "50", label: "50 km" },
];

export const PRIVACY_FIELDS = [
  {
    key: "kitchen",
    label: "Kitchen",
    options: [
      { value: "private", label: "Private" },
      { value: "shared", label: "Shared" },
      { value: "not_available", label: "Not available" },
    ],
  },
  {
    key: "washroom",
    label: "Washroom",
    options: [
      { value: "private", label: "Private" },
      { value: "shared", label: "Shared" },
      { value: "not_available", label: "Not available" },
    ],
  },
  {
    key: "entrance",
    label: "Entrance",
    options: [
      { value: "private", label: "Private" },
      { value: "shared", label: "Shared" },
      { value: "not_specified", label: "Not specified" },
    ],
  },
];

export const AMENITIES = [
  { key: "wifi", label: "Wi-Fi" },
  { key: "parking", label: "Parking" },
  { key: "petAllowed", label: "Pet allowed" },
  { key: "waterSupply", label: "Water supply" },
  { key: "electricityBackup", label: "Electricity backup" },
  { key: "balcony", label: "Balcony" },
  { key: "lift", label: "Lift" },
  { key: "washingMachine", label: "Washing machine" },
  { key: "airConditioning", label: "Air conditioning" },
  { key: "nearbyPark", label: "Nearby park", nearby: true },
  { key: "nearbyMarket", label: "Nearby market", nearby: true },
  { key: "nearbyHospital", label: "Nearby hospital", nearby: true },
  { key: "nearbySchool", label: "Nearby school", nearby: true },
  { key: "publicTransport", label: "Public transport nearby", nearby: true },
];

export const STEPS = ["Basics", "Location", "Privacy", "Amenities", "Photos", "Review"];

export function labelFor(list, value) {
  return list.find((item) => item.value === value)?.label || value || "Any";
}

export function emptyAmenities() {
  return Object.fromEntries(AMENITIES.map((item) => [item.key, false]));
}

export function privacyHighlights(privacy = {}) {
  const items = [];
  if (privacy.kitchen === "private") items.push("Private kitchen");
  else if (privacy.kitchen === "shared") items.push("Shared kitchen");
  if (privacy.washroom === "private") items.push("Private washroom");
  else if (privacy.washroom === "shared") items.push("Shared washroom");
  if (privacy.entrance === "private") items.push("Private entrance");
  else if (privacy.entrance === "shared") items.push("Shared entrance");
  return items.slice(0, 3);
}

export function amenityHighlights(amenities = {}) {
  return AMENITIES.filter((item) => amenities[item.key]).slice(0, 3);
}

export function privacyLabel(field, value) {
  const match = PRIVACY_FIELDS.find((item) => item.key === field);
  return match?.options.find((option) => option.value === value)?.label || "Not specified";
}
