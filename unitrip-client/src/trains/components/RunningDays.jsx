import { cn } from "@/lib/utils";

const ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function RunningDays({ days }) {
  return (
    <p className="text-xs text-muted-foreground">
      Runs{" "}
      {ORDER.map((day) => (
        <span
          key={day}
          className={cn("mr-1 font-semibold", days.includes(day) ? "text-foreground" : "text-border")}
        >
          {day[0]}
        </span>
      ))}
    </p>
  );
}
