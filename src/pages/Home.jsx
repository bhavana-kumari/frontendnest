import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Home as HomeIcon, MapPinned, ShieldCheck } from "lucide-react";
import Alert from "../components/common/Alert";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import Photo from "../components/common/Photo";
import { PageLoader } from "../components/common/Spinner";
import PropertyCard from "../components/property/PropertyCard";
import SearchBar from "../components/search/SearchBar";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { searchProperties } from "../services/propertyService";
import { PROPERTY_TYPES } from "../utils/constants";
import { getErrorMessage } from "../utils/format";

const scenes = [
  {
    src: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    alt: "Sunlit living room with a sofa and plants",
    className: "col-span-2 h-56 sm:h-72",
  },
  {
    src: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
    alt: "Kitchen with a wooden counter",
    className: "h-36 sm:h-44",
  },
  {
    src: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
    alt: "Bedroom with linen bedding",
    className: "h-36 sm:h-44",
  },
];

const steps = [
  {
    icon: MapPinned,
    title: "Search a place",
    body: "Look by city or locality, or start from your current location and a radius.",
  },
  {
    icon: ShieldCheck,
    title: "Read the arrangement",
    body: "Kitchen, washroom, and entrance are marked private, shared, or unavailable.",
  },
  {
    icon: HomeIcon,
    title: "Enquire directly",
    body: "Save a home and send one message to the owner. There is no chat thread to manage.",
  },
];

const reasons = [
  {
    title: "The important details are on the listing",
    body: "Rent, furnishing, and how the home is shared are structured fields, not a paragraph you have to decode.",
  },
  {
    title: "Exact pins stay private by default",
    body: "Public visitors see the locality and an approximate map point unless the owner chooses to share the precise location.",
  },
  {
    title: "Nearby places are labelled as the owner stated them",
    body: "A park or hospital on a listing is information from the owner. NestFind does not claim those distances were measured.",
  },
];

export default function Home() {
  useDocumentTitle("");
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    searchProperties({ limit: 6, sort: "newest" })
      .then((data) => {
        if (active) setFeatured(data.properties || []);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err, "Featured homes could not be loaded."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-6 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pt-16">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-forest-700">Homes, flats, and floors</p>
          <h1 className="mt-3 max-w-xl font-serif text-4xl leading-[1.1] text-ink sm:text-5xl">
            Find affordable accommodation without guessing what is shared.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted">
            NestFind connects people with a house, apartment, or complete floor available to tenants who want the rent, privacy, and location in one place.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {scenes.map((scene) => (
            <Photo
              key={scene.src}
              src={scene.src}
              alt={scene.alt}
              className={`w-full rounded-3xl object-cover ${scene.className}`}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <SearchBar />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl">Featured homes</h2>
            <p className="mt-2 text-sm text-muted">Available listings from the database, newest first.</p>
          </div>
          <Link to="/explore" className="hidden text-sm text-forest-800 sm:inline">
            Explore all
          </Link>
        </div>
        {loading && <PageLoader label="Loading homes" />}
        {!loading && error && <Alert>{error}</Alert>}
        {!loading && !error && featured.length === 0 && (
          <EmptyState
            title="No homes listed yet"
            body="When an owner publishes a listing, it will appear here. You can still open search and check again later."
            actionLabel="Explore properties"
            actionTo="/explore"
          />
        )}
        {!loading && !error && featured.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-line bg-card/70">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.title}>
              <step.icon className="h-5 w-5 text-forest-700" />
              <h2 className="mt-3 font-serif text-2xl">{step.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-serif text-3xl">Why NestFind</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {reasons.map((reason) => (
            <article key={reason.title} className="rounded-3xl border border-line bg-card p-5 shadow-soft">
              <h3 className="font-serif text-xl">{reason.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{reason.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="font-serif text-3xl">Property categories</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {PROPERTY_TYPES.map((type) => (
            <Link
              key={type.value}
              to={`/explore?propertyType=${type.value}`}
              className="rounded-3xl border border-line bg-white p-5 transition hover:shadow-card"
            >
              <h3 className="font-serif text-2xl">{type.label}</h3>
              <p className="mt-2 text-sm text-muted">See available {type.label.toLowerCase()} listings.</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-forest-800 px-6 py-8 text-paper sm:flex-row sm:items-center sm:px-8">
          <div>
            <h2 className="font-serif text-3xl">Have a floor, flat, or house available?</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-forest-100">
              List the rent, the map pin, and whether the kitchen, washroom, and entrance are private.
            </p>
          </div>
          <Link to="/register?role=owner">
            <Button className="bg-paper text-forest-900 hover:bg-white">List your property</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
