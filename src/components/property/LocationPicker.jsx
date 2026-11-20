import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import Button from "../common/Button";
import { TextField } from "../common/Field";
import { reversePlace, searchPlaces } from "../../services/geoService";
import { getErrorMessage } from "../../utils/format";
import "../../utils/leaflet";

function Recenter({ latitude, longitude }) {
  const map = useMap();
  useEffect(() => {
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      map.setView([latitude, longitude], 15);
    }
  }, [latitude, longitude, map]);
  return null;
}

function ClickCatcher({ onPick }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({ value, onChange }) {
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setPlaces([]);
      return undefined;
    }
    const timer = setTimeout(async () => {
      try {
        setPlaces(await searchPlaces(query.trim()));
      } catch (err) {
        setPlaces([]);
        setError(getErrorMessage(err));
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  async function apply(lat, lng) {
    setBusy(true);
    setError("");
    try {
      onChange(await reversePlace(lat, lng));
    } catch (err) {
      onChange({
        latitude: lat,
        longitude: lng,
        city: "",
        locality: "",
        label: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      });
      setError(getErrorMessage(err, "The point was saved. Type the city and locality if they were not filled in."));
    } finally {
      setBusy(false);
    }
  }

  function useCurrent() {
    if (!navigator.geolocation) {
      setError("This browser cannot share your current location.");
      return;
    }
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await apply(position.coords.latitude, position.coords.longitude);
        setLocating(false);
      },
      () => {
        setLocating(false);
        setError("Location permission was denied. Search or click the map instead.");
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

  const center = value ? [value.latitude, value.longitude] : [20.5937, 78.9629];

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <TextField
            id="map-search"
            label="Search for a place"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Neighbourhood, area, or city"
            autoComplete="off"
          />
          {places.length > 0 && (
            <ul className="absolute left-0 right-0 top-full z-30 mt-1 max-h-48 overflow-auto rounded-2xl border border-line bg-white shadow-card">
              {places.map((place) => (
                <li key={place.id}>
                  <button
                    type="button"
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-paper"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      setQuery(place.label);
                      setPlaces([]);
                      apply(place.latitude, place.longitude);
                    }}
                  >
                    {place.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Button type="button" variant="secondary" onClick={useCurrent} loading={locating}>
          Current location
        </Button>
      </div>
      <p className="text-xs text-muted">
        {busy ? "Finding that place…" : "Click the map to place the pin. Your current location is only used if you allow it."}
      </p>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="overflow-hidden rounded-2xl border border-line">
        <MapContainer center={center} zoom={value ? 14 : 5} scrollWheelZoom className="h-72 w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickCatcher onPick={apply} />
          {value && <Recenter latitude={value.latitude} longitude={value.longitude} />}
          {value && <Marker position={[value.latitude, value.longitude]} />}
        </MapContainer>
      </div>
      {value && (
        <p className="text-sm text-muted">
          Selected: {Number(value.latitude).toFixed(5)}, {Number(value.longitude).toFixed(5)}
          {value.label ? ` · ${value.label}` : ""}
        </p>
      )}
    </div>
  );
}
