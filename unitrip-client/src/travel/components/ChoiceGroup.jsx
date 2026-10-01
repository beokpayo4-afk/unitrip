import { cn } from "@/lib/utils";

export default function ChoiceGroup({ options, value, onChange, multiple = false }) {
  const selected = multiple ? value : [value];

  function choose(option) {
    if (!multiple) {
      onChange(option);
      return;
    }
    onChange(selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option]);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const item = typeof option === "string" ? { value: option, label: option } : option;
        const active = selected.includes(item.value);
        return (
          <button
            key={item.value}
            type="button"
            aria-pressed={active}
            onClick={() => choose(item.value)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold",
              active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-secondary"
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
