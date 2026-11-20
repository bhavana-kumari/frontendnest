import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-serif text-xl">NestFind</p>
          <p className="mt-2 max-w-xs text-sm leading-6 text-muted">
            A clearer way to find a house, flat, or floor, with privacy and shared facilities written out before you enquire.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-medium">Explore</p>
          <div className="mt-3 flex flex-col gap-2 text-muted">
            <Link to="/explore" className="hover:text-ink">
              All homes
            </Link>
            <Link to="/explore?propertyType=independent_house" className="hover:text-ink">
              Independent houses
            </Link>
            <Link to="/explore?propertyType=apartment" className="hover:text-ink">
              Apartments and flats
            </Link>
            <Link to="/explore?propertyType=complete_floor" className="hover:text-ink">
              Complete floors
            </Link>
          </div>
        </div>
        <div className="text-sm">
          <p className="font-medium">Account</p>
          <div className="mt-3 flex flex-col gap-2 text-muted">
            <Link to="/about" className="hover:text-ink">
              About
            </Link>
            <Link to="/login" className="hover:text-ink">
              Login
            </Link>
            <Link to="/register" className="hover:text-ink">
              Sign up
            </Link>
            <Link to="/register?role=owner" className="hover:text-ink">
              List a property
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-line/80 px-4 py-4 text-center text-xs text-muted">NestFind {new Date().getFullYear()}</div>
    </footer>
  );
}
