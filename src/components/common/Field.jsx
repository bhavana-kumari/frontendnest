export function TextField({ id, label, error, hint, className = "", ...props }) {
  return (
    <label className={`block ${className}`} htmlFor={id}>
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input id={id} className="field" {...props} />
      {hint && !error && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
      {error && <span className="mt-1.5 block text-xs text-red-700">{error}</span>}
    </label>
  );
}

export function TextArea({ id, label, error, hint, className = "", ...props }) {
  return (
    <label className={`block ${className}`} htmlFor={id}>
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <textarea id={id} className="field min-h-32 resize-y" {...props} />
      {hint && !error && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
      {error && <span className="mt-1.5 block text-xs text-red-700">{error}</span>}
    </label>
  );
}

export function SelectField({ id, label, error, children, className = "", ...props }) {
  return (
    <label className={`block ${className}`} htmlFor={id}>
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <select id={id} className="field bg-white" {...props}>
        {children}
      </select>
      {error && <span className="mt-1.5 block text-xs text-red-700">{error}</span>}
    </label>
  );
}
