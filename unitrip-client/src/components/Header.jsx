import { Link, NavLink } from "react-router-dom";
import { Menu, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import CategoriesMegaMenu from "@/components/CategoriesMegaMenu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Header() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md no-print">
      <div className="container-page flex items-center justify-between gap-4 py-3">
        <Link
          to="/"
          className="font-display flex items-center gap-2.5 text-lg font-bold tracking-tight"
          onClick={() => setOpen(false)}
        >
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-sm text-primary-foreground">
            U
          </span>
          UNITRIP
        </Link>

        <nav className="hidden items-center gap-1 text-sm font-medium lg:flex">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              cn(
                "rounded-lg px-2.5 py-1.5 hover:text-primary",
                isActive && "text-primary underline decoration-accent decoration-2 underline-offset-8"
              )
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/destinations"
            className={({ isActive }) =>
              cn("rounded-lg px-2.5 py-1.5 hover:text-primary", isActive && "text-primary")
            }
          >
            Destinations
          </NavLink>
          <CategoriesMegaMenu />
          <NavLink
            to="/#best-sellers"
            className="rounded-lg px-2.5 py-1.5 hover:text-primary"
          >
            Best Sellers
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              cn("rounded-lg px-2.5 py-1.5 hover:text-primary", isActive && "text-primary")
            }
          >
            About
          </NavLink>
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                cn("rounded-lg px-2.5 py-1.5 hover:text-primary", isActive && "text-primary")
              }
            >
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {!isAdmin && (
            <Button asChild variant="outline" size="sm" className="relative">
              <Link to="/cart">
                <ShoppingCart className="size-4" />
                <span className="hidden sm:inline">Cart</span>
                {count > 0 && (
                  <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </Link>
            </Button>
          )}
          {isAuthenticated ? (
            <>
              {!isAdmin && (
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Link to="/my-bookings">{user?.name || "My bookings"}</Link>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={logout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline" size="sm">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {open && (
        <nav className="container-page flex flex-col gap-3 border-t border-border py-4 lg:hidden">
          <NavLink to="/" end onClick={() => setOpen(false)} className="font-medium">
            Home
          </NavLink>
          <NavLink to="/destinations" onClick={() => setOpen(false)} className="font-medium">
            Destinations
          </NavLink>
          <CategoriesMegaMenu mobile onNavigate={() => setOpen(false)} />
          <NavLink to="/#best-sellers" onClick={() => setOpen(false)} className="font-medium">
            Best Sellers
          </NavLink>
          <NavLink to="/about" onClick={() => setOpen(false)} className="font-medium">
            About
          </NavLink>
          {!isAdmin && (
            <NavLink to="/cart" onClick={() => setOpen(false)} className="font-medium">
              Cart ({count})
            </NavLink>
          )}
          {isAuthenticated && !isAdmin && (
            <NavLink to="/my-bookings" onClick={() => setOpen(false)} className="font-medium">
              My bookings
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" onClick={() => setOpen(false)} className="font-medium">
              Admin
            </NavLink>
          )}
        </nav>
      )}
    </header>
  );
}
