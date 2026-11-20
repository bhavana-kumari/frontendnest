import { cn } from "../../utils/format";

export default function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-paper text-ink",
    forest: "bg-forest-50 text-forest-800",
    amber: "bg-amber-50 text-amber-900",
    sample: "bg-amber-100 text-amber-950",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", tones[tone])}>
      {children}
    </span>
  );
}
