import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import { formatRent, placeLabel } from "../../utils/format";
import "../../utils/leaflet";

function Fit({ positions }) {
  const map = useMap();
  const key = positions.map((position) => position.join(",")).join("|");
  useEffect(() => {
    if (!positions.length) return;
    if (positions.length === 1) {
      map.setView(positions[0], 14);
      return;
    }
    map.fitBounds(positions, { padding: [32, 32] });
    // key tracks coordinate changes without refitting on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);
  return null;
}

export default function ResultsMap({ properties, className = "h-[420px] w-full" }) {
  const markers = properties
    .map((property) => {
      const coords = property.location?.coordinates;
      if (!Array.isArray(coords) || coords.length !== 2) return null;
      const lat = Number(coords[1]);
      const lng = Number(coords[0]);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      return { property, position: [lat, lng] };
    })
    .filter(Boolean);

  if (!markers.length) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-card px-6 py-16 text-center text-sm text-muted">
        These results do not include a map point.
      </div>
    );
  }

  const positions = markers.map((marker) => marker.position);

  return (
    <div className="overflow-hidden rounded-3xl border border-line">
      <MapContainer center={positions[0]} zoom={12} scrollWheelZoom className={className}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Fit positions={positions} />
        {markers.map(({ property, position }) => (
          <Marker key={property._id} position={position}>
            <Popup>
              <Link to={`/properties/${property._id}`} className="font-medium text-ink">
                {property.title}
              </Link>
              <p className="mt-1 text-xs text-muted">{placeLabel(property)}</p>
              <p className="text-xs">₹{formatRent(property.rent)}</p>
              {property.locationApproximate && <p className="mt-1 text-xs text-muted">Approximate area</p>}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
