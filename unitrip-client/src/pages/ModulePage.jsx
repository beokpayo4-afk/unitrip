export default function ModulePage({ title }) {
  return (
    <div className="container-page py-12">
      <h1 className="font-display text-4xl font-bold">{title}</h1>
      <p className="mt-2 text-muted-foreground">Browse {title.toLowerCase()} with UNITRIP.</p>
    </div>
  );
}
