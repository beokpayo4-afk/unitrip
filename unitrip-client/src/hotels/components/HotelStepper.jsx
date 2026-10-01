import { cn } from "@/lib/utils";

const STEPS = ["Search", "Results", "Details", "Room", "Guests", "Summary", "Payment", "Done"];

export function HotelStepper({ current }) {
  const active = STEPS.indexOf(current);
  return (
    <ol className="mb-8 flex gap-3 overflow-x-auto pb-1 text-xs font-semibold">
      {STEPS.map((label, index) => {
        const reached = index <= active;
        return (
          <li
            key={label}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap",
              index === active ? "text-primary" : reached ? "text-foreground" : "text-muted-foreground"
            )}
            aria-current={index === active ? "step" : undefined}
          >
            <span
              className={cn(
                "grid size-6 place-items-center rounded-full border text-[11px]",
                reached
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card"
              )}
            >
              {index + 1}
            </span>
            {label}
          </li>
        );
      })}
    </ol>
  );
}
