import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../components/common/Alert";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import Photo from "../components/common/Photo";
import { PageLoader } from "../components/common/Spinner";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { receivedEnquiries, updateEnquiryStatus } from "../services/enquiryService";
import { deleteProperty, myListings, updatePropertyStatus } from "../services/propertyService";
import { FURNISHING, PROPERTY_TYPES, labelFor } from "../utils/constants";
import { formatDate, formatRent, getErrorMessage, placeLabel } from "../utils/format";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "listings", label: "My listings" },
  { id: "enquiries", label: "Enquiries" },
];

function statusTone(status) {
  if (status === "pending") return "amber";
  if (status === "responded") return "forest";
  return "neutral";
}

export default function OwnerDashboard() {
  useDocumentTitle("Owner dashboard");
  const [tab, setTab] = useState("overview");
  const [listings, setListings] = useState(null);
  const [enquiries, setEnquiries] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([myListings(), receivedEnquiries()])
      .then(([listingData, enquiryData]) => {
        if (!active) return;
        setListings(listingData);
        setEnquiries(enquiryData);
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

  async function changeStatus(property) {
    const next = property.availabilityStatus === "available" ? "unavailable" : "available";
    setBusyId(`status-${property._id}`);
    setActionError("");
    try {
      const updated = await updatePropertyStatus(property._id, next);
      setListings((current) => {
        const properties = current.properties.map((item) => (item._id === updated._id ? updated : item));
        const wasAvailable = property.availabilityStatus === "available";
        const nowAvailable = updated.availabilityStatus === "available";
        let available = current.available;
        if (wasAvailable && !nowAvailable) available -= 1;
        if (!wasAvailable && nowAvailable) available += 1;
        return {
          ...current,
          properties,
          available,
          unavailable: current.total - available,
        };
      });
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusyId("");
    }
  }

  async function removeListing(property) {
    const confirmed = window.confirm(`Delete “${property.title}”? This cannot be undone.`);
    if (!confirmed) return;
    setBusyId(`delete-${property._id}`);
    setActionError("");
    try {
      await deleteProperty(property._id);
      setListings((current) => {
        const wasAvailable = property.availabilityStatus === "available";
        const available = current.available - (wasAvailable ? 1 : 0);
        const total = current.total - 1;
        return {
          ...current,
          properties: current.properties.filter((item) => item._id !== property._id),
          total,
          available,
          unavailable: total - available,
        };
      });
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusyId("");
    }
  }

  async function changeEnquiry(enquiry, status) {
    setBusyId(enquiry._id);
    setActionError("");
    try {
      const updated = await updateEnquiryStatus(enquiry._id, status);
      setEnquiries((current) => {
        const next = current.enquiries.map((item) =>
          item._id === enquiry._id ? { ...item, status: updated.status } : item
        );
        const pending = next.filter((item) => item.status === "pending").length;
        return { ...current, enquiries: next, pending, total: current.total };
      });
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusyId("");
    }
  }

  if (loading) return <PageLoader label="Loading dashboard" />;

  const properties = listings?.properties || [];
  const received = enquiries?.enquiries || [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-4xl">Owner dashboard</h1>
          <p className="mt-2 text-sm text-muted">Listings you have published and enquiries sent to them.</p>
        </div>
        <Link to="/owner/listings/new">
          <Button>Add property</Button>
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

      <div className="mt-6 flex gap-2 overflow-x-auto">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-full px-4 py-2 text-sm ${tab === item.id ? "bg-forest-700 text-white" : "bg-white text-muted"}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "overview" && listings && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ["Listings", listings.total],
            ["Available", listings.available],
            ["Pending enquiries", enquiries?.pending ?? 0],
          ].map(([label, value]) => (
            <div key={label} className="rounded-3xl border border-line bg-card p-5">
              <p className="text-sm text-muted">{label}</p>
              <p className="mt-2 font-serif text-3xl">{value}</p>
            </div>
          ))}
        </div>
      )}

      {(tab === "overview" || tab === "listings") && (
        <section className="mt-8">
          {tab === "listings" && <h2 className="font-serif text-2xl">My listings</h2>}
          {properties.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="You have not listed a home yet"
                body="Add a house, apartment, or complete floor when you are ready. It will show here with its status."
                actionLabel="Add property"
                actionTo="/owner/listings/new"
              />
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {(tab === "overview" ? properties.slice(0, 3) : properties).map((property) => (
                <article key={property._id} className="flex flex-col gap-4 rounded-3xl border border-line bg-card p-4 sm:flex-row">
                  <Photo src={property.photos?.[0]?.url} alt="" className="h-36 w-full rounded-2xl object-cover sm:w-44" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-serif text-xl">{property.title}</h3>
                      <Badge tone={property.availabilityStatus === "available" ? "forest" : "neutral"}>
                        {property.availabilityStatus === "available" ? "Available" : "Unavailable"}
                      </Badge>
                      {property.sample && <Badge tone="sample">Sample</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {placeLabel(property)} · {labelFor(PROPERTY_TYPES, property.propertyType)} · {labelFor(FURNISHING, property.furnishing)}
                    </p>
                    <p className="mt-1 text-sm">₹{formatRent(property.rent)}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link to={`/properties/${property._id}`}>
                        <Button variant="secondary">View</Button>
                      </Link>
                      <Link to={`/owner/listings/${property._id}/edit`}>
                        <Button variant="secondary">Edit</Button>
                      </Link>
                      <Button variant="secondary" loading={busyId === `status-${property._id}`} onClick={() => changeStatus(property)}>
                        Mark {property.availabilityStatus === "available" ? "unavailable" : "available"}
                      </Button>
                      <Button variant="danger" loading={busyId === `delete-${property._id}`} onClick={() => removeListing(property)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {(tab === "overview" || tab === "enquiries") && (
        <section className="mt-8">
          <h2 className="font-serif text-2xl">Enquiries received</h2>
          {received.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No enquiries yet. They appear here when a tenant writes about one of your listings.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {(tab === "overview" ? received.slice(0, 3) : received).map((enquiry) => (
                <article key={enquiry._id} className="rounded-3xl border border-line bg-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{enquiry.property?.title || "Listing"}</p>
                      <p className="text-sm text-muted">
                        {enquiry.tenant?.name || "Tenant"}
                        {enquiry.tenant?.email ? ` · ${enquiry.tenant.email}` : ""}
                        {enquiry.tenant?.phone ? ` · ${enquiry.tenant.phone}` : ""}
                      </p>
                    </div>
                    <Badge tone={statusTone(enquiry.status)}>{enquiry.status}</Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6">{enquiry.message}</p>
                  <p className="mt-2 text-xs text-muted">{formatDate(enquiry.createdAt)}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["pending", "responded", "closed"].map((status) => (
                      <Button
                        key={status}
                        variant={enquiry.status === status ? "primary" : "secondary"}
                        disabled={busyId === enquiry._id || enquiry.status === status}
                        onClick={() => changeEnquiry(enquiry, status)}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
