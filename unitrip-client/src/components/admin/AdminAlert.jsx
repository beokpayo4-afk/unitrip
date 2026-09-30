import { cn } from "@/lib/utils";

export default function AdminAlert({ variant = "error", children, className }) {
  if (!children) return null;
  return (
    <div
      role="alert"
      className={cn(
        "mb-4 rounded-lg border px-3.5 py-2.5 text-sm",
        variant === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-destructive/30 bg-destructive/5 text-destructive",
        className
      )}
    >
      {children}
    </div>
  );
}
