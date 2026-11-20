import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Alert from "../components/common/Alert";
import { PageLoader } from "../components/common/Spinner";
import PropertyForm, { propertyToForm } from "../components/forms/PropertyForm";
import { useAuth } from "../context/AuthContext";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { getProperty, updateProperty } from "../services/propertyService";
import { getErrorMessage } from "../utils/format";

export default function EditProperty() {
  useDocumentTitle("Edit listing");
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getProperty(id)
      .then((property) => {
        if (!active) return;
        const ownerId = property.owner?._id || property.owner;
        if (!user || String(ownerId) !== String(user._id)) {
          setLoadError("You can only edit listings that belong to your account.");
          return;
        }
        setInitial(propertyToForm(property));
      })
      .catch((err) => {
        if (active) setLoadError(getErrorMessage(err, "This listing could not be loaded."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, user]);

  async function onSubmit(payload) {
    setSubmitting(true);
    setError("");
    try {
      const property = await updateProperty(id, payload);
      navigate(`/properties/${property._id}`);
    } catch (err) {
      setError(getErrorMessage(err, "The listing could not be updated."));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <PageLoader label="Loading listing" />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-4xl">Edit listing</h1>
      {loadError && (
        <div className="mt-6">
          <Alert>{loadError}</Alert>
        </div>
      )}
      {initial && (
        <div className="mt-6">
          <PropertyForm initial={initial} onSubmit={onSubmit} submitting={submitting} serverError={error} submitLabel="Save changes" />
        </div>
      )}
    </div>
  );
}
