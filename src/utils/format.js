export function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function formatRent(rent) {
  if (rent == null || Number.isNaN(Number(rent))) return "";
  return `${new Intl.NumberFormat("en-IN").format(rent)} / month`;
}

export function formatDistance(km) {
  if (km == null) return "";
  if (km < 0.1) return "Under 0.1 km from search point";
  return `${Number(km).toFixed(1)} km from search point`;
}

export function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatMonth(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function photoUrl(url) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const assetBase = import.meta.env.VITE_ASSET_URL || "";
  return `${assetBase}${url}`;
}

export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  const data = error?.response?.data;
  if (Array.isArray(data?.errors) && data.errors.length) {
    return data.errors.map((item) => item.message).join(" ");
  }
  return data?.message || fallback;
}

export function placeLabel(property) {
  return [property.locality, property.city].filter(Boolean).join(", ");
}

export function safeRedirect(value, fallback = "/") {
  if (typeof value === "string" && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return fallback;
}
