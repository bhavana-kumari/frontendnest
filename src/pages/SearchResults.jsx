import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Alert from "../components/common/Alert";
import EmptyState from "../components/common/EmptyState";
import Pagination from "../components/common/Pagination";
import { PageLoader } from "../components/common/Spinner";
import PropertyCard from "../components/property/PropertyCard";
import ResultsMap from "../components/property/ResultsMap";
import SearchBar from "../components/search/SearchBar";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { searchProperties } from "../services/propertyService";
import { FURNISHING, PROPERTY_TYPES, labelFor } from "../utils/constants";
import { cn, getErrorMessage } from "../utils/format";

function summary(params) {
  const parts = [];
  const location = params.get("location");
  const hasPoint = params.get("lat") && params.get("lng");
  if (location) parts.push(location);
  else if (hasPoint) parts.push("Selected point");
  else parts.push("All locations");
  if (hasPoint) parts.push(`${params.get("radius") || "10"} km`);
  parts.push(labelFor(PROPERTY_TYPES, params.get("propertyType")));
  parts.push(labelFor(FURNISHING, params.get("furnishing")));
  return parts.join(" · ");
}

export default function SearchResults() {
  useDocumentTitle("Explore properties");
  const [params, setParams] = useSearchParams();
  const queryKey = params.toString();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");

  const hasPoint = Boolean(params.get("lat") && params.get("lng"));
  const sort = params.get("sort") || (hasPoint ? "distance" : "newest");
  const sorts = useMemo(() => {
    const options = [
      { value: "newest", label: "Newest" },
      { value: "rent_asc", label: "Rent: low to high" },
      { value: "rent_desc", label: "Rent: high to low" },
    ];
    if (hasPoint) options.unshift({ value: "distance", label: "Nearest" });
    return options;
  }, [hasPoint]);

  const searchInitial = useMemo(
    () => ({
      location: params.get("location") || "",
      propertyType: params.get("propertyType") || "",
      furnishing: params.get("furnishing") || "",
      lat: params.get("lat") || "",
      lng: params.get("lng") || "",
      radius: params.get("radius") || "10",
    }),
    [queryKey]
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const request = {
      location: params.get("location") || undefined,
      propertyType: params.get("propertyType") || undefined,
      furnishing: params.get("furnishing") || undefined,
      page: params.get("page") || undefined,
      sort: params.get("sort") || undefined,
      limit: 12,
    };
    if (params.get("lat") && params.get("lng")) {
      request.lat = params.get("lat");
      request.lng = params.get("lng");
      request.radius = params.get("radius") || "10";
    }
    searchProperties(request)
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err) => {
        if (active) {
          setData(null);
          setError(getErrorMessage(err, "Search could not be completed."));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [queryKey]);

  function updateParams(changes) {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") next.delete(key);
      else next.set(key, String(value));
    });
    setParams(next);
  }

  const properties = data?.properties || [];
  const page = data?.page || Number(params.get("page") || 1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="font-serif text-4xl">Explore properties</h1>
      <div className="mt-6">
        <SearchBar initial={searchInitial} />
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">{summary(params)}</p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-muted" htmlFor="sort">
            Sort
          </label>
          <select
            id="sort"
            className="field w-auto"
            value={sorts.some((option) => option.value === sort) ? sort : sorts[0].value}
            onChange={(event) => updateParams({ sort: event.target.value, page: "" })}
          >
            {sorts.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="flex rounded-full border border-line bg-white p-1">
            {["list", "map"].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setView(mode)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm capitalize",
                  view === mode ? "bg-forest-700 text-white" : "text-muted"
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        {loading && <PageLoader label="Searching homes" />}
        {!loading && error && <Alert>{error}</Alert>}
        {!loading && !error && properties.length === 0 && (
          <EmptyState
            title="No homes match this search"
            body="Try a wider radius, a different locality, or clear the property type and furnishing filters."
            actionLabel="Show all homes"
            actionTo="/explore"
          />
        )}
        {!loading && !error && properties.length > 0 && view === "map" && (
          <ResultsMap properties={properties} className="h-[420px] w-full sm:h-[520px]" />
        )}
        {!loading && !error && properties.length > 0 && view === "list" && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}
        {!loading && !error && (
          <Pagination page={page} totalPages={data?.totalPages || 0} onPage={(nextPage) => updateParams({ page: nextPage })} />
        )}
        {!loading && !error && data?.total > 0 && (
          <p className="mt-4 text-center text-xs text-muted">
            {data.total} available {data.total === 1 ? "home" : "homes"}
            {data.radiusKm ? ` within ${data.radiusKm} km` : ""}
          </p>
        )}
      </div>
    </div>
  );
}
