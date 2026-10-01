import { cn } from "@/lib/utils";

const TONES = [
  "bg-primary text-primary-foreground",
  "bg-accent text-accent-foreground",
  "bg-sidebar text-sidebar-foreground",
  "bg-secondary text-secondary-foreground",
];

export function AirlineLogo({ airline, className }) {
  const tone = TONES[(airline.code || "A").charCodeAt(0) % TONES.length];
  return (
    <span
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-lg text-xs font-bold tracking-wide",
        tone,
        className
      )}
      aria-hidden
    >
      {airline.code}
    </span>
  );
}
