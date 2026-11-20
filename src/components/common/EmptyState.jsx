import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "./Button";

export default function EmptyState({ title, body, actionLabel, actionTo, onAction }) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-card px-6 py-14 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-forest-50 text-forest-800">
        <Search className="h-5 w-5" />
      </div>
      <h2 className="font-serif text-2xl text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{body}</p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="mt-6 inline-block">
          <Button>{actionLabel}</Button>
        </Link>
      )}
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
    </div>
  );
}
