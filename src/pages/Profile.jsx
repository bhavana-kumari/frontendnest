import { useState } from "react";
import Alert from "../components/common/Alert";
import Button from "../components/common/Button";
import { TextField } from "../components/common/Field";
import { useAuth } from "../context/AuthContext";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { updateProfile } from "../services/userService";
import { getErrorMessage } from "../utils/format";

export default function Profile() {
  useDocumentTitle("Profile");
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const next = {};
    if (name.trim().length < 2 || name.trim().length > 80) {
      next.name = "Name must be between 2 and 80 characters.";
    }
    if (phone.trim() && !/^[0-9+\-\s()]{7,20}$/.test(phone.trim())) {
      next.phone = "Enter a valid phone number.";
    }
    return next;
  }

  async function onSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setServerError("");
    setSuccess("");
    if (Object.keys(nextErrors).length) return;
    setSubmitting(true);
    try {
      const nextUser = await updateProfile({ name: name.trim(), phone: phone.trim() });
      setUser(nextUser);
      setSuccess("Profile saved.");
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <h1 className="font-serif text-4xl">Profile</h1>
      <p className="mt-2 text-sm text-muted">
        Signed in as a {user.role}. Email and role stay with this account.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        {serverError && <Alert>{serverError}</Alert>}
        {success && <Alert tone="success">{success}</Alert>}
        <TextField id="name" label="Full name" value={name} error={errors.name} onChange={(event) => setName(event.target.value)} />
        <TextField id="phone" label="Phone number" hint="Optional." value={phone} error={errors.phone} onChange={(event) => setPhone(event.target.value)} />
        <div className="rounded-2xl border border-line bg-card px-4 py-3 text-sm">
          <p>
            <span className="text-muted">Email</span>
            <span className="mt-1 block font-medium">{user.email}</span>
          </p>
          <p className="mt-3">
            <span className="text-muted">Role</span>
            <span className="mt-1 block font-medium capitalize">{user.role}</span>
          </p>
        </div>
        <Button type="submit" loading={submitting}>
          Save profile
        </Button>
      </form>
    </div>
  );
}
