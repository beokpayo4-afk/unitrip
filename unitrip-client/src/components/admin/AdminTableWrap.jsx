export default function AdminTableWrap({ children }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
