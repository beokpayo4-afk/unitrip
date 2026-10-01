export function SampleTrainNotice({ children }) {
  return (
    <p className="rounded-xl border border-accent/50 bg-accent/25 px-4 py-3 text-sm text-accent-foreground">
      {children ||
        "Sample timetable for this demo. Availability is not live, and no railway seat or PNR is reserved."}
    </p>
  );
}
