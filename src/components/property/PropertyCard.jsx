import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Badge from "../common/Badge";
import Button from "../common/Button";
import Photo from "../common/Photo";
import { AMENITIES, amenityHighlights, labelFor, privacyHighlights, FURNISHING, PROPERTY_TYPES } from "../../utils/constants";
import { formatDistance, formatRent, placeLabel } from "../../utils/format";
import FavoriteButton from "./FavoriteButton";

export default function PropertyCard({ property, onFavoriteChange }) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(Boolean(property.isFavorite));

  useEffect(() => {
    setSaved(Boolean(property.isFavorite));
  }, [property._id, property.isFavorite]);

  const privacy = privacyHighlights(property.privacy);
  const amenities = amenityHighlights(property.amenities).map((item) => {
    const known = AMENITIES.find((amenity) => amenity.key === item.key);
    return known?.nearby ? `${item.label} (owner-stated)` : item.label;
  });
  const highlights = [...privacy, ...amenities].slice(0, 4);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-card shadow-soft transition hover:shadow-card">
      <div className="relative">
        <Link to={`/properties/${property._id}`} className="block">
          <Photo src={property.photos?.[0]?.url} alt={property.title} className="h-52 w-full object-cover" />
        </Link>
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {property.sample && <Badge tone="sample">Sample</Badge>}
          {property.availabilityStatus === "unavailable" && <Badge>Unavailable</Badge>}
        </div>
        <FavoriteButton
          className="absolute right-3 top-3"
          propertyId={property._id}
          saved={saved}
          onChange={(next) => {
            setSaved(next);
            onFavoriteChange?.(next);
          }}
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl leading-snug">
              <Link to={`/properties/${property._id}`} className="hover:text-forest-800">
                {property.title}
              </Link>
            </h3>
            <p className="mt-1 text-sm text-muted">{placeLabel(property)}</p>
          </div>
          <p className="shrink-0 text-sm font-medium">₹{formatRent(property.rent)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>{labelFor(PROPERTY_TYPES, property.propertyType)}</Badge>
          <Badge tone="forest">{labelFor(FURNISHING, property.furnishing)}</Badge>
        </div>
        {property.distanceKm != null && <p className="text-xs text-muted">{formatDistance(property.distanceKm)}</p>}
        {highlights.length > 0 && (
          <ul className="flex flex-wrap gap-2 text-xs text-muted">
            {highlights.map((item) => (
              <li key={item} className="rounded-full bg-paper px-2.5 py-1">
                {item}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto pt-2">
          <Button variant="secondary" className="w-full" onClick={() => navigate(`/properties/${property._id}`)}>
            View details
          </Button>
        </div>
      </div>
    </article>
  );
}
