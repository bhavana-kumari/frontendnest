import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Alert from "../components/common/Alert";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import Photo from "../components/common/Photo";
import { PageLoader } from "../components/common/Spinner";
import { TextArea } from "../components/common/Field";
import FavoriteButton from "../components/property/FavoriteButton";
import ResultsMap from "../components/property/ResultsMap";
import { useAuth } from "../context/AuthContext";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { createEnquiry } from "../services/enquiryService";
import { getProperty } from "../services/propertyService";
import { AMENITIES, FURNISHING, PROPERTY_TYPES, labelFor, privacyLabel } from "../utils/constants";
import { formatMonth, formatRent, getErrorMessage, placeLabel } from "../utils/format";

export default function PropertyDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [enquiryError, setEnquiryError] = useState("");
  const [enquirySuccess, setEnquirySuccess] = useState("");
  const [sending, setSending] = useState(false);

  useDocumentTitle(property?.title || "Property");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setPhotoIndex(0);
    getProperty(id)
      .then((next) => {
        if (active) setProperty(next);
      })
      .catch((err) => {
        if (active) {
          setProperty(null);
          setError(getErrorMessage(err, "This home could not be loaded."));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function sendEnquiry(event) {
    event.preventDefault();
    setEnquiryError("");
    setEnquirySuccess("");
    if (message.trim().length < 10) {
      setEnquiryError("Message must be at least 10 characters.");
      return;
    }
    setSending(true);
    try {
      await createEnquiry({ propertyId: property._id, message: message.trim() });
      setMessage("");
      setEnquirySuccess("Your enquiry was sent. You can follow it from your dashboard.");
    } catch (err) {
      setEnquiryError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  if (loading) return <PageLoader label="Loading home" />;
  if (!property) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <EmptyState title="Home not found" body={error || "This listing is not available."} actionLabel="Explore properties" actionTo="/explore" />
      </div>
    );
  }

  const photos = property.photos || [];
  const activePhoto = photos[photoIndex] || photos[0];
  const ownerId = property.owner?._id || property.owner;
  const isOwner = Boolean(user && ownerId && String(ownerId) === String(user._id));
  const amenities = AMENITIES.filter((item) => property.amenities?.[item.key]);
  const redirect = encodeURIComponent(`/properties/${property._id}`);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div>
          <div className="overflow-hidden rounded-3xl border border-line bg-card">
            <Photo src={activePhoto?.url} alt={property.title} className="h-72 w-full object-cover sm:h-96" />
          </div>
          {photos.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {photos.map((photo, index) => (
                <button
                  key={photo.publicId || photo.url}
                  type="button"
                  onClick={() => setPhotoIndex(index)}
                  className={`overflow-hidden rounded-2xl border ${index === photoIndex ? "border-forest-700" : "border-line"}`}
                >
                  <Photo src={photo.url} alt="" className="h-16 w-20 object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2">
                {property.sample && <Badge tone="sample">Sample</Badge>}
                {property.availabilityStatus === "unavailable" && <Badge>Unavailable</Badge>}
              </div>
              <h1 className="mt-3 font-serif text-4xl">{property.title}</h1>
              <p className="mt-2 text-sm text-muted">{placeLabel(property)}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-medium">₹{formatRent(property.rent)}</p>
              <div className="mt-2 flex justify-end">
                <FavoriteButton propertyId={property._id} saved={Boolean(property.isFavorite)} />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>{labelFor(PROPERTY_TYPES, property.propertyType)}</Badge>
            <Badge tone="forest">{labelFor(FURNISHING, property.furnishing)}</Badge>
          </div>

          <section className="mt-8">
            <h2 className="font-serif text-2xl">Description</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted">{property.description}</p>
          </section>

          <section className="mt-8">
            <h2 className="font-serif text-2xl">Privacy</h2>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-2xl border border-line bg-card p-4">
                <dt className="text-muted">Kitchen</dt>
                <dd className="mt-1 font-medium">{privacyLabel("kitchen", property.privacy?.kitchen)}</dd>
              </div>
              <div className="rounded-2xl border border-line bg-card p-4">
                <dt className="text-muted">Washroom</dt>
                <dd className="mt-1 font-medium">{privacyLabel("washroom", property.privacy?.washroom)}</dd>
              </div>
              <div className="rounded-2xl border border-line bg-card p-4">
                <dt className="text-muted">Entrance</dt>
                <dd className="mt-1 font-medium">{privacyLabel("entrance", property.privacy?.entrance)}</dd>
              </div>
            </dl>
            {property.privacy?.additionalDetails && (
              <p className="mt-3 text-sm leading-6 text-muted">{property.privacy.additionalDetails}</p>
            )}
          </section>

          <section className="mt-8">
            <h2 className="font-serif text-2xl">Amenities</h2>
            {amenities.length === 0 ? (
              <p className="mt-3 text-sm text-muted">The owner did not select any amenities.</p>
            ) : (
              <ul className="mt-3 flex flex-wrap gap-2">
                {amenities.map((item) => (
                  <li key={item.key} className="rounded-full bg-card px-3 py-1.5 text-sm">
                    {item.label}
                    {item.nearby ? " · owner-stated" : ""}
                  </li>
                ))}
              </ul>
            )}
            {amenities.some((item) => item.nearby) && (
              <p className="mt-3 text-xs leading-5 text-muted">
                Nearby places are information provided by the owner. Distances are not verified.
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-3xl border border-line bg-card p-5">
            <h2 className="font-serif text-2xl">Location</h2>
            <p className="mt-2 text-sm text-muted">{placeLabel(property)}</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              {property.locationApproximate
                ? "The map shows an approximate area. The exact address is not published."
                : isOwner
                  ? "You are viewing the precise pin saved on your listing."
                  : "The owner has chosen to share this location."}
            </p>
            <div className="mt-4">
              <ResultsMap properties={[property]} className="h-64 w-full" />
            </div>
          </section>

          <section className="rounded-3xl border border-line bg-card p-5">
            <h2 className="font-serif text-2xl">Owner</h2>
            <p className="mt-2 text-sm font-medium">{property.owner?.name || "Owner"}</p>
            {property.owner?.createdAt && (
              <p className="mt-1 text-xs text-muted">On NestFind since {formatMonth(property.owner.createdAt)}</p>
            )}
            {isOwner && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/owner/listings/${property._id}/edit`}>
                  <Button>Edit listing</Button>
                </Link>
                <Link to="/owner">
                  <Button variant="secondary">Dashboard</Button>
                </Link>
              </div>
            )}
          </section>

          {!isOwner && (
            <section className="rounded-3xl border border-line bg-card p-5">
              <h2 className="font-serif text-2xl">Enquire</h2>
              {property.availabilityStatus !== "available" && (
                <p className="mt-2 text-sm text-muted">This home is marked unavailable and is not accepting enquiries.</p>
              )}
              {property.availabilityStatus === "available" && !user && (
                <div className="mt-3">
                  <p className="text-sm leading-6 text-muted">Sign in as a tenant to send a message to the owner.</p>
                  <Link to={`/login?redirect=${redirect}`} className="mt-3 inline-block">
                    <Button>Login to enquire</Button>
                  </Link>
                </div>
              )}
              {property.availabilityStatus === "available" && user?.role === "owner" && (
                <p className="mt-2 text-sm leading-6 text-muted">
                  Enquiries are sent from a tenant account. This owner account can manage its own listings instead.
                </p>
              )}
              {property.availabilityStatus === "available" && user?.role === "tenant" && (
                <form onSubmit={sendEnquiry} className="mt-3 space-y-3">
                  {enquiryError && <Alert>{enquiryError}</Alert>}
                  {enquirySuccess && <Alert tone="success">{enquirySuccess}</Alert>}
                  <TextArea
                    id="enquiry-message"
                    label="Message"
                    value={message}
                    maxLength={1000}
                    placeholder="Introduce yourself and say when you would like to visit."
                    onChange={(event) => setMessage(event.target.value)}
                  />
                  <Button type="submit" loading={sending}>
                    Send enquiry
                  </Button>
                </form>
              )}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
