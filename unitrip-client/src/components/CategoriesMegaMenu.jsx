import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  Car,
  ChevronDown,
  Landmark,
  Mountain,
  Plane,
  PackageSearch,
  Globe2,
  Ship,
  Train,
  Waves,
  ArrowRight,
} from "lucide-react";
import { catalogApi } from "@/api/client";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS = {
  "city-cultural-tours": Camera,
  "car-charters": Car,
  "water-sports": Waves,
  "attractions-tickets": Landmark,
  "private-transfers": Car,
  "luxury-rail": Train,
  "air-tours": Plane,
  "adventure-safari": Mountain,
  "international-tours": Ship,
};

const EXTRA_LINKS = [
  {
    key: "international",
    to: "/packages?scope=international",
    title: "International",
    subtitle: "Tours beyond India",
    Icon: Globe2,
  },
  {
    key: "track-order",
    to: "/track",
    title: "Track order",
    subtitle: "Find your booking & ticket",
    Icon: PackageSearch,
  },
];

function iconFor(slug) {
  return CATEGORY_ICONS[slug] || Landmark;
}

export default function CategoriesMegaMenu({ mobile = false, onNavigate }) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const rootRef = useRef(null);

  useEffect(() => {
    catalogApi.categories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (mobile) return;
    function onDocClick(e) {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [mobile]);

  function close() {
    setOpen(false);
    onNavigate?.();
  }

  const panel = (
    <div
      className={cn(
        "overflow-hidden border border-border bg-card shadow-lg",
        mobile
          ? "mt-2 rounded-xl"
          : "absolute left-1/2 top-full z-50 mt-2 w-[min(40rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border-t-2 border-t-accent"
      )}
    >
      <div className="grid gap-1 p-3 sm:grid-cols-2">
        {categories.map((cat) => {
          const Icon = iconFor(cat.slug);
          return (
            <Link
              key={cat._id}
              to={`/packages?categorySlug=${encodeURIComponent(cat.slug)}`}
              onClick={close}
              className="group flex items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-muted/70"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent/35 text-accent-foreground ring-1 ring-accent/40">
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-foreground group-hover:text-primary">
                  {cat.name}
                </span>
                <span className="mt-0.5 block font-mono text-[11px] tracking-wide text-muted-foreground">
                  Explore the collection
                </span>
              </span>
            </Link>
          );
        })}
        {EXTRA_LINKS.map(({ key, to, title, subtitle, Icon }) => (
          <Link
            key={key}
            to={to}
            onClick={close}
            className="group flex items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-muted/70"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent/35 text-accent-foreground ring-1 ring-accent/40">
              <Icon className="size-4" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block font-semibold text-foreground group-hover:text-primary">
                {title}
              </span>
              <span className="mt-0.5 block font-mono text-[11px] tracking-wide text-muted-foreground">
                {subtitle}
              </span>
            </span>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
        <Link
          to="/#best-sellers"
          onClick={close}
          className="text-[11px] font-bold tracking-[0.14em] text-accent-foreground uppercase"
        >
          Best sellers
        </Link>
        <Link
          to="/packages"
          onClick={close}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
        >
          Browse everything
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  );

  if (mobile) {
    return (
      <div>
        <button
          type="button"
          className="flex w-full items-center justify-between font-medium"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          Categories
          <ChevronDown
            className={cn("size-4 transition-transform", open && "rotate-180")}
          />
        </button>
        {open && panel}
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors hover:text-primary",
          open && "bg-accent/40 text-accent-foreground"
        )}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
      >
        Categories
        <ChevronDown
          className={cn("size-3.5 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && panel}
    </div>
  );
}
