import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { addFavorite, removeFavorite } from "../../services/favoriteService";
import { cn, getErrorMessage } from "../../utils/format";

export default function FavoriteButton({ propertyId, saved = false, onChange, className = "" }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState(saved);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setActive(saved);
  }, [saved, propertyId]);

  if (user?.role === "owner") return null;

  async function toggle(event) {
    event.preventDefault();
    event.stopPropagation();
    setError("");
    if (!user) {
      const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
      navigate(`/login?redirect=${redirect}`);
      return;
    }
    setLoading(true);
    try {
      if (active) {
        await removeFavorite(propertyId);
        setActive(false);
        onChange?.(false);
      } else {
        await addFavorite(propertyId);
        setActive(true);
        onChange?.(true);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Could not update saved homes."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        aria-pressed={active}
        aria-label={active ? "Remove saved home" : "Save home"}
        title={error || (active ? "Saved" : "Save")}
        className="rounded-full bg-white/95 p-2 text-ink shadow-soft transition hover:bg-white disabled:opacity-60"
      >
        <Heart className={cn("h-4 w-4", active && "fill-forest-700 text-forest-700")} />
      </button>
      {error && <span className="sr-only">{error}</span>}
    </div>
  );
}
