import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Alert from "../components/common/Alert";
import Button from "../components/common/Button";
import { TextField } from "../components/common/Field";
import { useAuth } from "../context/AuthContext";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { getErrorMessage, safeRedirect } from "../utils/format";

export default function Login() {
  useDocumentTitle("Login");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = "Enter a valid email address.";
    if (!password) nextErrors.password = "Password is required.";
    setErrors(nextErrors);
    setServerError("");
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      const user = await login({ email: email.trim(), password });
      const fallback = user.role === "owner" ? "/owner" : "/tenant";
      navigate(safeRedirect(params.get("redirect"), fallback), { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err, "Invalid email or password."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <h1 className="font-serif text-4xl">Login</h1>
      <p className="mt-2 text-sm text-muted">Use the email and password for your NestFind account.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        {serverError && <Alert>{serverError}</Alert>}
        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          error={errors.email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          error={errors.password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Button type="submit" loading={submitting} className="w-full">
          Login
        </Button>
      </form>
      <p className="mt-4 text-sm text-muted">
        New to NestFind?{" "}
        <Link to={`/register${params.get("redirect") ? `?redirect=${encodeURIComponent(params.get("redirect"))}` : ""}`} className="text-forest-800">
          Sign up
        </Link>
      </p>
    </div>
  );
}
