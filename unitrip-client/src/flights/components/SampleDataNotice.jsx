export function SampleDataNotice({ children }) {
  return (
    <p className="rounded-xl border border-accent/50 bg-accent/25 px-4 py-3 text-sm text-accent-foreground">
      {children ||
        "Sample itineraries for this demo. This is not live airline availability, and no seat is held."}
    </p>
  );
}
