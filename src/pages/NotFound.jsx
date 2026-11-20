import { Link } from "react-router-dom";
import Button from "../components/common/Button";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function NotFound() {
  useDocumentTitle("Page not found");

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <p className="text-sm font-medium uppercase tracking-[0.16em] text-forest-700">404</p>
      <h1 className="mt-3 font-serif text-4xl">This page is not part of NestFind.</h1>
      <p className="mt-3 text-sm leading-6 text-muted">The address may be mistyped, or the page may have moved.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link to="/">
          <Button>Home</Button>
        </Link>
        <Link to="/explore">
          <Button variant="secondary">Explore properties</Button>
        </Link>
      </div>
    </div>
  );
}
