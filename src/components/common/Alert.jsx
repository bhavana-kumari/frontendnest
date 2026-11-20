import { cn } from "../../utils/format";

export default function Alert({ tone = "error", children }) {
  const tones = {
    error: "border-red-200 bg-red-50 text-red-800",
    success: "border-forest-100 bg-forest-50 text-forest-900",
    info: "border-line bg-white text-muted",
  };
  return <div className={cn("rounded-2xl border px-4 py-3 text-sm", tones[tone])}>{children}</div>;
}
