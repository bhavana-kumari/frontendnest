import { Loader2 } from "lucide-react";
import { cn } from "../../utils/format";

const variants = {
  primary: "bg-forest-700 text-white hover:bg-forest-800",
  secondary: "border border-line bg-white text-ink hover:bg-paper",
  ghost: "text-ink hover:bg-black/5",
  danger: "border border-red-200 bg-white text-red-800 hover:bg-red-50",
};

export default function Button({
  children,
  variant = "primary",
  loading = false,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
