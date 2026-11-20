import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropertyForm from "../components/forms/PropertyForm";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { createProperty } from "../services/propertyService";
import { getErrorMessage } from "../utils/format";

export default function AddProperty() {
  useDocumentTitle("List a property");
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(payload) {
    setSubmitting(true);
    setError("");
    try {
      const property = await createProperty(payload);
      navigate(`/properties/${property._id}`);
    } catch (err) {
      setError(getErrorMessage(err, "The listing could not be saved."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-4xl">List your property</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Add the basics, pin the home on the map, and describe what is private. Photos upload before you submit.
      </p>
      <div className="mt-6">
        <PropertyForm onSubmit={onSubmit} submitting={submitting} serverError={error} submitLabel="Save and submit" />
      </div>
    </div>
  );
}
