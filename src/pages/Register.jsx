import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Alert from "../components/common/Alert";
import Button from "../components/common/Button";
import { TextField } from "../components/common/Field";
import { useAuth } from "../context/AuthContext";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { cn, getErrorMessage, safeRedirect } from "../utils/format";

const roles = [
  { value: "tenant", label: "Tenant", hint: "Search homes, save them, and send enquiries." },
  { value: "owner", label: "Owner", hint: "List a house, flat, or floor and manage enquiries." },
];

function validate(form) {
  const errors = {};
  if (form.name.trim().length < 2 || form.name.trim().length > 80) {
    errors.name = "Name must be between 2 and 80 characters.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (form.phone.trim() && !/^[0-9+\-\s()]{7,20}$/.test(form.phone.trim())) {
    errors.phone = "Enter a valid phone number.";
  }
  if (form.password.length < 8 || form.password.length > 72) {
    errors.password = "Password must be between 8 and 72 characters.";
  } else if (!/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
    errors.password = "Password must include a letter and a number.";
  }
  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = "Passwords do not match.";
  }
  if (form.role !== "tenant" && form.role !== "owner") {
    errors.role = "Choose tenant or owner.";
  }
  return errors;
}

export default function Register() {
  useDocumentTitle("Sign up");
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialRole = params.get("role") === "owner" ? "owner" : "tenant";
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: initialRole,
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const redirectQuery = useMemo(() => {
    const redirect = params.get("redirect");
    return redirect ? `?redirect=${encodeURIComponent(redirect)}` : "";
  }, [params]);

  function patch(partial) {
    setForm((current) => ({ ...current, ...partial }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    setServerError("");
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      const user = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        role: form.role,
      });
      const fallback = user.role === "owner" ? "/owner" : "/tenant";
      navigate(safeRedirect(params.get("redirect"), fallback), { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <h1 className="font-serif text-4xl">Create an account</h1>
      <p className="mt-2 text-sm leading-6 text-muted">Choose tenant or owner. The role stays with this email.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        {serverError && <Alert>{serverError}</Alert>}
        <TextField id="name" label="Full name" value={form.name} error={errors.name} onChange={(event) => patch({ name: event.target.value })} />
        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          error={errors.email}
          onChange={(event) => patch({ email: event.target.value })}
        />
        <TextField
          id="phone"
          label="Phone number"
          hint="Optional. Owners can see it on an enquiry you send."
          value={form.phone}
          error={errors.phone}
          onChange={(event) => patch({ phone: event.target.value })}
        />
        <div>
          <p className="mb-2 text-sm font-medium">I am joining as</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {roles.map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() => patch({ role: role.value })}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-left",
                  form.role === role.value ? "border-forest-700 bg-forest-50" : "border-line bg-white"
                )}
              >
                <span className="block text-sm font-medium">{role.label}</span>
                <span className="mt-1 block text-xs leading-5 text-muted">{role.hint}</span>
              </button>
            ))}
          </div>
          {errors.role && <p className="mt-1.5 text-xs text-red-700">{errors.role}</p>}
        </div>
        <TextField
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters, with a letter and a number."
          value={form.password}
          error={errors.password}
          onChange={(event) => patch({ password: event.target.value })}
        />
        <TextField
          id="confirm-password"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={form.confirmPassword}
          error={errors.confirmPassword}
          onChange={(event) => patch({ confirmPassword: event.target.value })}
        />
        <Button type="submit" loading={submitting} className="w-full">
          Sign up
        </Button>
      </form>
      <p className="mt-4 text-sm text-muted">
        Already have an account?{" "}
        <Link to={`/login${redirectQuery}`} className="text-forest-800">
          Login
        </Link>
      </p>
    </div>
  );
}
