import { Link } from "react-router-dom";
import Button from "../components/common/Button";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function About() {
  useDocumentTitle("About");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-sm font-medium uppercase tracking-[0.16em] text-forest-700">About</p>
      <h1 className="mt-3 font-serif text-4xl">A direct way to match a home with a tenant.</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-muted">
        <p>
          NestFind is for owners who have an independent house, an apartment or flat, or a complete floor to rent, and for tenants looking in a city or locality.
        </p>
        <p>
          Accounts are either tenant or owner. That choice is made at registration and decides which dashboard and actions are available. An owner publishes and manages listings. A tenant searches, saves homes, and sends enquiries.
        </p>
        <p>
          Public pages show the locality and city. The map uses an approximate point unless the owner explicitly shares the exact location. Owners always see their own precise pin.
        </p>
        <p>
          Amenities such as a nearby park, market, hospital, school, or public transport are stored as the owner selected them. They are labelled as owner-provided information and are not distance-checked by NestFind.
        </p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/explore">
          <Button>Explore properties</Button>
        </Link>
        <Link to="/register">
          <Button variant="secondary">Create an account</Button>
        </Link>
      </div>
    </div>
  );
}
