import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Button from "../common/Button";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/explore", label: "Explore Properties" },
  { to: "/about", label: "About" },
];

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-700 text-paper">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path d="M4 11.2 12 4l8 7.2V20a1 1 0 0 1-1 1h-5.2v-5.2H10.2V21H5a1 1 0 0 1-1-1v-8.8Z" fill="currentColor" />
        </svg>
      </span>
      <span className="font-serif text-xl tracking-tight">NestFind</span>
    </Link>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const listHref = !user ? "/register?role=owner" : "/owner/listings/new";

  async function handleLogout() {
    await logout();
    setOpen(false);
    navigate("/");
  }

  const linkClass = ({ isActive }) =>
    `text-sm ${isActive ? "text-forest-800" : "text-muted hover:text-ink"}`;

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Brand />
        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              <Link to={user.role === "owner" ? "/owner" : "/tenant"} className="px-3 text-sm text-muted hover:text-ink">
                Dashboard
              </Link>
              <Link to="/profile" className="px-3 text-sm text-muted hover:text-ink">
                {user.name.split(" ")[0]}
              </Link>
              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary">Sign Up</Button>
              </Link>
            </>
          )}
          <Link to={listHref}>
            <Button>List Your Property</Button>
          </Link>
        </div>
        <button className="rounded-full p-2 lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="space-y-3 border-t border-line px-4 py-4 lg:hidden">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className="block text-sm" onClick={() => setOpen(false)}>
              {link.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <Link to={user.role === "owner" ? "/owner" : "/tenant"} className="block text-sm" onClick={() => setOpen(false)}>
                Dashboard
              </Link>
              <Link to="/profile" className="block text-sm" onClick={() => setOpen(false)}>
                Profile
              </Link>
              <Button variant="secondary" className="w-full" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link to="/login" onClick={() => setOpen(false)}>
                <Button variant="secondary" className="w-full">
                  Login
                </Button>
              </Link>
              <Link to="/register" onClick={() => setOpen(false)}>
                <Button variant="secondary" className="w-full">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
          <Link to={listHref} onClick={() => setOpen(false)}>
            <Button className="w-full">List Your Property</Button>
          </Link>
        </div>
      )}
    </header>
  );
}
