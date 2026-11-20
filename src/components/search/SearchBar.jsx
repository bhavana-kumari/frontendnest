import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../common/Button";
import { SelectField, TextField } from "../common/Field";
import LocationPicker from "../property/LocationPicker";
import { reversePlace, searchPlaces } from "../../services/geoService";
import { FURNISHING, PROPERTY_TYPES, RADII } from "../../utils/constants";
import { getErrorMessage } from "../../utils/format";

export default function SearchBar({ initial }) {
  const navigate = useNavigate();
  const skipLookup = useRef(false);
  const lookupReady = useRef(false);
  const synced = useRef(false);
  const [location, setLocation] = useState(initial?.location || "");
  const [propertyType, setPropertyType] = useState(initial?.propertyType || "");
  const [furnishing, setFurnishing] = useState(initial?.furnishing || "");
  const [radius, setRadius] = useState(initial?.radius || "10");
  const [point, setPoint] = useState(
    initial?.lat && initial?.lng ? { lat: Number(initial.lat), lng: Number(initial.lng) } : null
  );
  const [places, setPlaces] = useState([]);
  const [mapOpen, setMapOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState("");

  useEffect(() => {
    if (!synced.current) {
      synced.current = true;
      return;
    }
    skipLookup.current = true;
    setLocation(initial?.location || "");
    setPropertyType(initial?.propertyType || "");
    setFurnishing(initial?.furnishing || "");
    setRadius(initial?.radius || "10");
    setPoint(initial?.lat && initial?.lng ? { lat: Number(initial.lat), lng: Number(initial.lng) } : null);
  }, [initial?.location, initial?.propertyType, initial?.furnishing, initial?.lat, initial?.lng, initial?.radius]);

  useEffect(() => {
    if (!lookupReady.current) {
      lookupReady.current = true;
      return undefined;
    }
    if (skipLookup.current) {
      skipLookup.current = false;
      return undefined;
    }
    if (location.trim().length < 2) {
      setPlaces([]);
      return undefined;
    }
    const timer = setTimeout(async () => {
      try {
        setPlaces(await searchPlaces(location.trim()));
        setGeoError("");
      } catch (err) {
        setPlaces([]);
        setGeoError(getErrorMessage(err));
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [location]);

  function choosePlace(place) {
    skipLookup.current = true;
    setLocation(place.label);
    setPoint({ lat: place.latitude, lng: place.longitude });
    setPlaces([]);
    setGeoError("");
  }

  function onMapPlace(place) {
    skipLookup.current = true;
    setLocation(place.label || place.city || "Selected on map");
    setPoint({ lat: place.latitude, lng: place.longitude });
    setPlaces([]);
    setGeoError("");
  }

  function useCurrent() {
    if (!navigator.geolocation) {
      setGeoError("This browser cannot share your current location.");
      return;
    }
    setLocating(true);
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const place = await reversePlace(position.coords.latitude, position.coords.longitude);
          choosePlace(place);
        } catch (err) {
          skipLookup.current = true;
          setPoint({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLocation("Current location");
          setGeoError(getErrorMessage(err, "Using your coordinates without a place name."));
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setGeoError("Location permission was denied. Search by city or pick a point on the map.");
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

  function submit(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set("location", location.trim());
    if (point && Number.isFinite(point.lat) && Number.isFinite(point.lng)) {
      params.set("lat", String(point.lat));
      params.set("lng", String(point.lng));
      params.set("radius", radius || "10");
    }
    if (propertyType) params.set("propertyType", propertyType);
    if (furnishing) params.set("furnishing", furnishing);
    navigate(`/explore?${params.toString()}`);
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-line bg-white p-4 shadow-card sm:p-5">
      <div className="grid gap-4 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-4">
          <div className="relative">
            <TextField
              id="search-location"
              label="Location"
              value={location}
              onChange={(event) => {
                setLocation(event.target.value);
                setPoint(null);
                setGeoError("");
              }}
              placeholder="City or locality"
              autoComplete="off"
            />
            {places.length > 0 && (
              <ul className="absolute left-0 right-0 top-full z-30 mt-1 max-h-52 overflow-auto rounded-2xl border border-line bg-white shadow-card">
                {places.map((place) => (
                  <li key={place.id}>
                    <button
                      type="button"
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-paper"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        choosePlace(place);
                      }}
                    >
                      {place.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={useCurrent} loading={locating}>
              Current location
            </Button>
            <Button type="button" variant="secondary" onClick={() => setMapOpen((open) => !open)}>
              {mapOpen ? "Hide map" : "Pick on map"}
            </Button>
          </div>
        </div>
        <div className="lg:col-span-2">
          <SelectField
            id="search-type"
            label="Property type"
            value={propertyType}
            onChange={(event) => setPropertyType(event.target.value)}
          >
            <option value="">Any</option>
            {PROPERTY_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="lg:col-span-2">
          <SelectField
            id="search-furnishing"
            label="Furnishing"
            value={furnishing}
            onChange={(event) => setFurnishing(event.target.value)}
          >
            <option value="">Any</option>
            {FURNISHING.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="lg:col-span-2">
          <SelectField
            id="search-radius"
            label="Radius"
            value={radius}
            disabled={!point}
            onChange={(event) => setRadius(event.target.value)}
          >
            {RADII.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </SelectField>
          <p className="mt-1.5 text-xs text-muted">
            {point ? "Applies to the selected point." : "Used after a point or current location is chosen."}
          </p>
        </div>
        <div className="lg:col-span-2">
          <Button type="submit" className="w-full">
            Search
          </Button>
        </div>
      </div>
      {geoError && <p className="mt-3 text-sm text-red-700">{geoError}</p>}
      {mapOpen && (
        <div className="mt-4">
          <LocationPicker
            value={point ? { latitude: point.lat, longitude: point.lng } : null}
            onChange={onMapPlace}
          />
        </div>
      )}
    </form>
  );
}
