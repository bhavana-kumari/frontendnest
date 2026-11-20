import { useState } from "react";
import Alert from "../common/Alert";
import Button from "../common/Button";
import { TextArea, TextField } from "../common/Field";
import Photo from "../common/Photo";
import LocationPicker from "../property/LocationPicker";
import { uploadImages } from "../../services/propertyService";
import {
  AMENITIES,
  FURNISHING,
  PRIVACY_FIELDS,
  PROPERTY_TYPES,
  STEPS,
  emptyAmenities,
  labelFor,
  privacyLabel,
} from "../../utils/constants";
import { cn, formatRent, getErrorMessage } from "../../utils/format";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function blankForm() {
  return {
    title: "",
    description: "",
    propertyType: "independent_house",
    furnishing: "furnished",
    rent: "",
    city: "",
    locality: "",
    latitude: "",
    longitude: "",
    shareExactLocation: false,
    privacy: {
      kitchen: "private",
      washroom: "private",
      entrance: "not_specified",
      additionalDetails: "",
    },
    amenities: emptyAmenities(),
    photos: [],
  };
}

export function propertyToForm(property) {
  const [lng, lat] = property.location?.coordinates || [];
  return {
    title: property.title || "",
    description: property.description || "",
    propertyType: property.propertyType,
    furnishing: property.furnishing,
    rent: property.rent ?? "",
    city: property.city || "",
    locality: property.locality || "",
    latitude: lat ?? "",
    longitude: lng ?? "",
    shareExactLocation: Boolean(property.shareExactLocation),
    privacy: {
      kitchen: property.privacy?.kitchen || "private",
      washroom: property.privacy?.washroom || "private",
      entrance: property.privacy?.entrance || "not_specified",
      additionalDetails: property.privacy?.additionalDetails || "",
    },
    amenities: { ...emptyAmenities(), ...property.amenities },
    photos: (property.photos || []).map((photo) => ({
      url: photo.url,
      publicId: photo.publicId,
      provider: photo.provider,
    })),
  };
}

function validateStep(step, form) {
  const errors = {};
  if (step === 0) {
    if (form.title.trim().length < 5 || form.title.trim().length > 120) {
      errors.title = "Title must be between 5 and 120 characters.";
    }
    if (form.description.trim().length < 20 || form.description.trim().length > 4000) {
      errors.description = "Description must be between 20 and 4000 characters.";
    }
    if (!PROPERTY_TYPES.some((item) => item.value === form.propertyType)) {
      errors.propertyType = "Choose a property type.";
    }
    if (!FURNISHING.some((item) => item.value === form.furnishing)) {
      errors.furnishing = "Choose furnished or unfurnished.";
    }
    const rent = Number(form.rent);
    if (!Number.isFinite(rent) || rent <= 0 || rent > 10000000) {
      errors.rent = "Monthly rent must be greater than 0.";
    }
  }
  if (step === 1) {
    if (form.city.trim().length < 2) errors.city = "City is required.";
    if (form.locality.trim().length < 2) errors.locality = "Locality is required.";
    const lat = Number(form.latitude);
    const lng = Number(form.longitude);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
      errors.location = "Choose the property location on the map.";
    }
  }
  if (step === 4) {
    if (!form.photos.length) errors.photos = "Add at least one photo.";
    if (form.photos.length > 8) errors.photos = "You can add up to 8 photos.";
  }
  return errors;
}

function toPayload(form) {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    propertyType: form.propertyType,
    furnishing: form.furnishing,
    rent: Number(form.rent),
    city: form.city.trim(),
    locality: form.locality.trim(),
    location: {
      type: "Point",
      coordinates: [Number(form.longitude), Number(form.latitude)],
    },
    shareExactLocation: Boolean(form.shareExactLocation),
    privacy: {
      kitchen: form.privacy.kitchen,
      washroom: form.privacy.washroom,
      entrance: form.privacy.entrance,
      additionalDetails: form.privacy.additionalDetails.trim(),
    },
    amenities: form.amenities,
    photos: form.photos.map((photo) => ({
      url: photo.url,
      publicId: photo.publicId,
      provider: photo.provider,
    })),
  };
}

function Choice({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm transition",
        active ? "border-forest-700 bg-forest-50 text-forest-800" : "border-line bg-white text-ink hover:bg-paper"
      )}
    >
      {children}
    </button>
  );
}

export default function PropertyForm({ initial, onSubmit, submitting = false, serverError = "", submitLabel = "Save and submit" }) {
  const [form, setForm] = useState(initial || blankForm());
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(initial ? STEPS.length - 1 : 0);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  function patch(partial) {
    setForm((current) => ({ ...current, ...partial }));
  }

  function goNext() {
    const nextErrors = validateStep(step, form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const next = Math.min(step + 1, STEPS.length - 1);
    setMaxReached((current) => Math.max(current, next));
    setStep(next);
  }

  function submit(event) {
    event.preventDefault();
    if (step < STEPS.length - 1) {
      goNext();
      return;
    }
    const nextErrors = { ...validateStep(0, form), ...validateStep(1, form), ...validateStep(4, form) };
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      if (nextErrors.title || nextErrors.description || nextErrors.rent || nextErrors.propertyType || nextErrors.furnishing) {
        setStep(0);
      } else if (nextErrors.city || nextErrors.locality || nextErrors.location) {
        setStep(1);
      } else {
        setStep(4);
      }
      return;
    }
    onSubmit(toPayload(form));
  }

  async function onFiles(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    setUploadError("");
    if (!files.length) return;
    if (form.photos.length + files.length > 8) {
      setUploadError("You can add up to 8 photos.");
      return;
    }
    const invalid = files.find((file) => !IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_BYTES);
    if (invalid) {
      setUploadError("Use JPEG, PNG, or WebP images, each 5 MB or smaller.");
      return;
    }
    setUploading(true);
    try {
      const photos = await uploadImages(files);
      setForm((current) => ({ ...current, photos: [...current.photos, ...photos] }));
    } catch (err) {
      setUploadError(getErrorMessage(err, "The photos could not be uploaded."));
    } finally {
      setUploading(false);
    }
  }

  const selectedAmenities = AMENITIES.filter((item) => form.amenities[item.key]);
  const point =
    form.latitude !== "" && form.longitude !== ""
      ? { latitude: Number(form.latitude), longitude: Number(form.longitude) }
      : null;

  return (
    <form onSubmit={submit} className="space-y-6">
      {serverError && <Alert>{serverError}</Alert>}
      <ol className="flex gap-2 overflow-x-auto pb-1">
        {STEPS.map((label, index) => (
          <li key={label}>
            <button
              type="button"
              disabled={index > maxReached}
              onClick={() => setStep(index)}
              className={cn(
                "whitespace-nowrap rounded-full border px-3 py-1.5 text-sm",
                index === step ? "border-forest-700 bg-forest-700 text-white" : "border-line bg-white text-muted",
                index > maxReached && "opacity-50"
              )}
            >
              {index + 1}. {label}
            </button>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <section className="space-y-4 rounded-3xl border border-line bg-card p-5">
          <h2 className="font-serif text-2xl">Basic information</h2>
          <TextField
            id="title"
            label="Property title"
            value={form.title}
            error={errors.title}
            maxLength={120}
            onChange={(event) => patch({ title: event.target.value })}
          />
          <div>
            <p className="mb-2 text-sm font-medium">Property type</p>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((item) => (
                <Choice key={item.value} active={form.propertyType === item.value} onClick={() => patch({ propertyType: item.value })}>
                  {item.label}
                </Choice>
              ))}
            </div>
            {errors.propertyType && <p className="mt-1.5 text-xs text-red-700">{errors.propertyType}</p>}
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Furnishing</p>
            <div className="flex flex-wrap gap-2">
              {FURNISHING.map((item) => (
                <Choice key={item.value} active={form.furnishing === item.value} onClick={() => patch({ furnishing: item.value })}>
                  {item.label}
                </Choice>
              ))}
            </div>
          </div>
          <TextField
            id="rent"
            label="Monthly rent (₹)"
            type="number"
            min="1"
            step="1"
            value={form.rent}
            error={errors.rent}
            onChange={(event) => patch({ rent: event.target.value })}
          />
          <TextArea
            id="description"
            label="Description"
            value={form.description}
            error={errors.description}
            maxLength={4000}
            onChange={(event) => patch({ description: event.target.value })}
          />
        </section>
      )}

      {step === 1 && (
        <section className="space-y-4 rounded-3xl border border-line bg-card p-5">
          <h2 className="font-serif text-2xl">Location</h2>
          <p className="text-sm leading-6 text-muted">
            The pin is the property, not necessarily where you are now. Visitors see the locality unless you choose to share the exact point.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField id="city" label="City" value={form.city} error={errors.city} onChange={(event) => patch({ city: event.target.value })} />
            <TextField
              id="locality"
              label="Locality / area"
              value={form.locality}
              error={errors.locality}
              onChange={(event) => patch({ locality: event.target.value })}
            />
          </div>
          <LocationPicker
            value={point}
            onChange={(place) =>
              setForm((current) => ({
                ...current,
                latitude: place.latitude,
                longitude: place.longitude,
                city: place.city || current.city,
                locality: place.locality || current.locality,
              }))
            }
          />
          {errors.location && <p className="text-xs text-red-700">{errors.location}</p>}
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={form.shareExactLocation}
              onChange={(event) => patch({ shareExactLocation: event.target.checked })}
            />
            <span>
              <span className="font-medium">Share the exact location</span>
              <span className="mt-1 block text-muted">
                Leave this off to publish the surrounding area. The precise pin stays on your listing either way.
              </span>
            </span>
          </label>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-4 rounded-3xl border border-line bg-card p-5">
          <h2 className="font-serif text-2xl">Privacy and shared facilities</h2>
          <p className="text-sm text-muted">Say what the tenant gets. Extra detail is optional.</p>
          {PRIVACY_FIELDS.map((field) => (
            <div key={field.key}>
              <p className="mb-2 text-sm font-medium">{field.label}</p>
              <div className="flex flex-wrap gap-2">
                {field.options.map((option) => (
                  <Choice
                    key={option.value}
                    active={form.privacy[field.key] === option.value}
                    onClick={() => patch({ privacy: { ...form.privacy, [field.key]: option.value } })}
                  >
                    {option.label}
                  </Choice>
                ))}
              </div>
            </div>
          ))}
          <TextArea
            id="privacy-notes"
            label="Other arrangements"
            hint="For example: separate entrance, kitchen shared with the owner, or an attached washroom."
            value={form.privacy.additionalDetails}
            maxLength={1000}
            onChange={(event) => patch({ privacy: { ...form.privacy, additionalDetails: event.target.value } })}
          />
        </section>
      )}

      {step === 3 && (
        <section className="space-y-4 rounded-3xl border border-line bg-card p-5">
          <h2 className="font-serif text-2xl">Amenities</h2>
          <p className="text-sm leading-6 text-muted">
            Select what applies. Nearby places are stored as information you provide. NestFind does not verify those distances.
          </p>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map((item) => (
              <Choice
                key={item.key}
                active={Boolean(form.amenities[item.key])}
                onClick={() => patch({ amenities: { ...form.amenities, [item.key]: !form.amenities[item.key] } })}
              >
                {item.label}
                {item.nearby ? " · nearby" : ""}
              </Choice>
            ))}
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="space-y-4 rounded-3xl border border-line bg-card p-5">
          <h2 className="font-serif text-2xl">Photos</h2>
          <p className="text-sm text-muted">JPEG, PNG, or WebP. Up to 8 images, 5 MB each.</p>
          <input
            id="photos"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={onFiles}
            className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-forest-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-forest-800"
          />
          {uploading && <p className="text-sm text-muted">Uploading…</p>}
          {(uploadError || errors.photos) && <p className="text-sm text-red-700">{uploadError || errors.photos}</p>}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {form.photos.map((photo) => (
              <div key={photo.publicId} className="relative overflow-hidden rounded-2xl border border-line">
                <Photo src={photo.url} alt="" className="h-28 w-full object-cover" />
                <button
                  type="button"
                  className="absolute right-2 top-2 rounded-full bg-white px-2 py-1 text-xs"
                  onClick={() => patch({ photos: form.photos.filter((item) => item.publicId !== photo.publicId) })}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {step === 5 && (
        <section className="space-y-4 rounded-3xl border border-line bg-card p-5">
          <h2 className="font-serif text-2xl">Review</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">Title</dt>
              <dd>{form.title}</dd>
            </div>
            <div>
              <dt className="text-muted">Rent</dt>
              <dd>₹{formatRent(Number(form.rent))}</dd>
            </div>
            <div>
              <dt className="text-muted">Type</dt>
              <dd>{labelFor(PROPERTY_TYPES, form.propertyType)}</dd>
            </div>
            <div>
              <dt className="text-muted">Furnishing</dt>
              <dd>{labelFor(FURNISHING, form.furnishing)}</dd>
            </div>
            <div>
              <dt className="text-muted">Place</dt>
              <dd>
                {form.locality}, {form.city}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Public map</dt>
              <dd>{form.shareExactLocation ? "Exact pin" : "Approximate area"}</dd>
            </div>
            <div>
              <dt className="text-muted">Kitchen</dt>
              <dd>{privacyLabel("kitchen", form.privacy.kitchen)}</dd>
            </div>
            <div>
              <dt className="text-muted">Washroom</dt>
              <dd>{privacyLabel("washroom", form.privacy.washroom)}</dd>
            </div>
            <div>
              <dt className="text-muted">Entrance</dt>
              <dd>{privacyLabel("entrance", form.privacy.entrance)}</dd>
            </div>
            <div>
              <dt className="text-muted">Photos</dt>
              <dd>{form.photos.length}</dd>
            </div>
          </dl>
          {form.privacy.additionalDetails && <p className="text-sm leading-6 text-muted">{form.privacy.additionalDetails}</p>}
          <p className="text-sm text-muted">
            {selectedAmenities.length
              ? selectedAmenities.map((item) => item.label).join(", ")
              : "No amenities selected."}
          </p>
        </section>
      )}

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="secondary" disabled={step === 0 || submitting} onClick={() => setStep((current) => current - 1)}>
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={goNext} disabled={uploading}>
            Continue
          </Button>
        ) : (
          <Button type="submit" loading={submitting} disabled={uploading}>
            {submitLabel}
          </Button>
        )}
      </div>
    </form>
  );
}
