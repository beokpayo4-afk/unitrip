import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BookOpen,
  ClipboardList,
  FolderTree,
  HelpCircle,
  Hotel,
  LayoutDashboard,
  LogOut,
  Luggage,
  MapPin,
  Menu,
  Package,
  Plane,
  Plus,
  Route,
  ScrollText,
  Sun,
  Train,
  X,
} from "lucide-react";
import { RequireAdmin } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const groups = [
  {
    label: "Overview",
    links: [{ to: "/admin", label: "Dashboard", end: true, icon: LayoutDashboard }],
  },
  {
    label: "Packages",
    links: [
      { to: "/admin/packages", label: "Packages", icon: Package },
      { to: "/admin/packages/new", label: "Add package", icon: Plus },
      { to: "/admin/categories", label: "Categories", icon: FolderTree },
      { to: "/admin/destinations", label: "Destinations", icon: MapPin },
      { to: "/admin/itineraries", label: "Itineraries", icon: Route },
      { to: "/admin/holiday-packages", label: "Holiday packages", icon: Sun },
    ],
  },
  {
    label: "Bookings",
    links: [
      { to: "/admin/bookings", label: "Experience bookings", end: true, icon: BookOpen },
      { to: "/admin/bookings/flights", label: "Flight bookings", icon: Plane },
      { to: "/admin/bookings/hotels", label: "Hotel bookings", icon: Hotel },
      { to: "/admin/bookings/trains", label: "Train bookings", icon: Train },
      { to: "/admin/bookings/holidays", label: "Holiday bookings", icon: Luggage },
    ],
  },
  {
    label: "Travel enquiries",
    links: [{ to: "/admin/trip-requests", label: "Custom travel requests", icon: ClipboardList }],
  },
  {
    label: "Other",
    links: [
      { to: "/admin/faqs", label: "Global FAQs", icon: HelpCircle },
      { to: "/admin/logs", label: "Logs", icon: ScrollText },
    ],
  },
];

function NavItems({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-4">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-sidebar-foreground/50">
            {group.label}
          </p>
          <div className="flex flex-col gap-1">
            {group.links.map((l) => {
              const Icon = l.icon;
              return (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive &&
                        "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_3px_0_0_0_var(--sidebar-primary)]"
                    )
                  }
                >
                  <Icon className="size-4 shrink-0 opacity-80" />
                  {l.label}
                </NavLink>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function SidebarBrand() {
  return (
    <div className="mb-5 border-b border-[color-mix(in_oklch,var(--accent)_45%,transparent)] pb-4">
      <Link to="/admin" className="flex items-center gap-2.5">
        <span className="grid size-8 place-items-center rounded-lg bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
          U
        </span>
        <div>
          <p className="font-display text-base font-bold leading-tight tracking-tight text-white">
            UNITRIP
          </p>
          <p className="text-[11px] font-medium tracking-wide text-sidebar-foreground/60">
            Admin console
          </p>
        </div>
      </Link>
    </div>
  );
}

function SidebarFooter({ onNavigate }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="mt-auto shrink-0 space-y-2 border-t border-sidebar-border pt-4">
      <Button asChild className="w-full justify-start gap-2" size="sm">
        <Link to="/admin/packages/new" onClick={onNavigate}>
          <Plus className="size-4" />
          New package
        </Link>
      </Button>
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        <Link to="/" onClick={onNavigate}>
          ← Back to site
        </Link>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        onClick={handleLogout}
      >
        <LogOut className="size-4" />
        Log out
      </Button>
    </div>
  );
}

function AdminShell() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-border bg-sidebar px-4 py-3 text-sidebar-foreground md:hidden no-print">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-md bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">
            U
          </span>
          <span className="font-display text-sm font-bold tracking-tight">UNITRIP Admin</span>
        </div>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </header>

      {/* Mobile drawer overlay */}
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-label="Close menu"
          onClick={close}
        />
      )}

      <div className="md:grid md:min-h-screen md:grid-cols-[240px_1fr]">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-sidebar p-4 text-sidebar-foreground transition-transform duration-200 no-print",
            "md:sticky md:top-0 md:z-30 md:h-svh md:translate-x-0 md:self-start",
            open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          <SidebarBrand />
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <NavItems onNavigate={close} />
          </div>
          <SidebarFooter onNavigate={close} />
        </aside>

        <main className="min-w-0 bg-background/80 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <RequireAdmin>
      <AdminShell />
    </RequireAdmin>
  );
}
