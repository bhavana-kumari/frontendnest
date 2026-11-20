import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { safeRedirect } from "../../utils/format";
import Button from "./Button";
import { PageLoader } from "./Spinner";

export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }
  if (role && user.role !== role) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-forest-700">Account type</p>
        <h1 className="mt-3 font-serif text-4xl">This page is for {role === "owner" ? "owners" : "tenants"}.</h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          You are signed in as {user.name}, with a {user.role} account. Listing and enquiry tools stay with the role
          chosen at registration. A second account with a different email can use the other role.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to={user.role === "owner" ? "/owner" : "/tenant"}>
            <Button>Go to your dashboard</Button>
          </Link>
          <Link to="/explore">
            <Button variant="secondary">Explore homes</Button>
          </Link>
        </div>
      </div>
    );
  }
  return children;
}

export function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (user) {
    const redirect = new URLSearchParams(location.search).get("redirect");
    const fallback = user.role === "owner" ? "/owner" : "/tenant";
    return <Navigate to={redirect ? safeRedirect(redirect, fallback) : fallback} replace />;
  }
  return children;
}
