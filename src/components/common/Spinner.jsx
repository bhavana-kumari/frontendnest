import { Loader2 } from "lucide-react";

export default function Spinner({ className = "h-5 w-5" }) {
  return <Loader2 className={`animate-spin text-forest-700 ${className}`} />;
}

export function PageLoader({ label = "Loading" }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-muted">
      <Spinner className="h-6 w-6" />
      <p>{label}</p>
    </div>
  );
}
