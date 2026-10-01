export function SampleStayNotice({ children }) {
  return (
    <p className="rounded-xl border border-accent/50 bg-accent/25 px-4 py-3 text-sm text-accent-foreground">
      {children ||
        "Sample stays for this demo. This is not live hotel availability, and no room is held."}
    </p>
  );
}
