import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../components/common/Alert";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import { PageLoader } from "../components/common/Spinner";
import PropertyCard from "../components/property/PropertyCard";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { myEnquiries, updateEnquiryStatus } from "../services/enquiryService";
import { listFavorites } from "../services/favoriteService";
import { formatDate, formatRent, getErrorMessage, placeLabel } from "../utils/format";

export default function TenantDashboard() {
  useDocumentTitle("Tenant dashboard");
  const [favorites, setFavorites] = useState(null);
  const [enquiries, setEnquiries] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([listFavorites(), myEnquiries()])
      .then(([saved, sent]) => {
        if (!active) return;
        setFavorites(saved);
        setEnquiries(sent);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err, "The dashboard could not be loaded."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function unsave(propertyId, saved) {
    if (saved) return;
    setFavorites((current) => ({
      ...current,
      properties: current.properties.filter((item) => item._id !== propertyId),
      total: Math.max(0, current.total - 1),
    }));
  }

  async function closeEnquiry(enquiry) {
    setBusyId(enquiry._id);
    setActionError("");
    try {
      const updated = await updateEnquiryStatus(enquiry._id, "closed");
      setEnquiries((current) => {
        const next = current.enquiries.map((item) =>
          item._id === enquiry._id ? { ...item, status: updated.status } : item
        );
        return {
          ...current,
          enquiries: next,
          pending: next.filter((item) => item.status === "pending").length,
        };
      });
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusyId("");
    }
  }

  if (loading) return <PageLoader label="Loading dashboard" />;

  const saved = favorites?.properties || [];
  const sent = enquiries?.enquiries || [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-4xl">Tenant dashboard</h1>
          <p className="mt-2 text-sm text-muted">Homes you saved and messages you sent to owners.</p>
        </div>
        <Link to="/explore">
          <Button>Search properties</Button>
        </Link>
      </div>

      {error && (
        <div className="mt-6">
          <Alert>{error}</Alert>
        </div>
      )}
      {actionError && (
        <div className="mt-4">
          <Alert>{actionError}</Alert>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Saved homes", favorites?.total ?? 0],
          ["Enquiries", enquiries?.total ?? 0],
          ["Pending", enquiries?.pending ?? 0],
        ].map(([label, value]) => (
          <div key={label} className="rounded-3xl border border-line bg-card p-5">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 font-serif text-3xl">{value}</p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">Saved properties</h2>
        {saved.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No saved homes"
              body="Use the heart on a listing to keep it here. Saving requires a tenant account, which you already have."
              actionLabel="Search properties"
              actionTo="/explore"
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((property) => (
              <PropertyCard key={property._id} property={property} onFavoriteChange={(next) => unsave(property._id, next)} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">My enquiries</h2>
        {sent.length === 0 ? (
          <p className="mt-3 text-sm text-muted">You have not contacted an owner yet. Open a home and send a short message.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {sent.map((enquiry) => (
              <article key={enquiry._id} className="rounded-3xl border border-line bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link to={enquiry.property?._id ? `/properties/${enquiry.property._id}` : "/explore"} className="font-medium hover:text-forest-800">
                      {enquiry.property?.title || "Listing removed"}
                    </Link>
                    {enquiry.property && (
                      <p className="mt-1 text-sm text-muted">
                        {placeLabel(enquiry.property)}
                        {enquiry.property.rent ? ` · ₹${formatRent(enquiry.property.rent)}` : ""}
                      </p>
                    )}
                  </div>
                  <Badge tone={enquiry.status === "pending" ? "amber" : enquiry.status === "responded" ? "forest" : "neutral"}>
                    {enquiry.status}
                  </Badge>
                </div>
                <p className="mt-3 text-sm leading-6">{enquiry.message}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-muted">{formatDate(enquiry.createdAt)}</p>
                  {enquiry.status !== "closed" && (
                    <Button variant="secondary" loading={busyId === enquiry._id} onClick={() => closeEnquiry(enquiry)}>
                      Close enquiry
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
