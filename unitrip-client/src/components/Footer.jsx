import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="mt-auto bg-sidebar text-sidebar-foreground no-print">
      <div className="container-page grid gap-8 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <div className="font-display mb-3 flex items-center gap-2.5 text-lg font-bold tracking-tight text-white">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-sm text-primary-foreground">
              U
            </span>
            UNITRIP
          </div>
          <p className="max-w-[28ch] text-sm text-sidebar-foreground/75">
            Handpicked tours and transfers across India and international destinations —
            transparent pricing from UNITRIP TRAVELS PRIVATE LIMITED, Delhi.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <h4 className="font-semibold text-white">Explore</h4>
          <Link className="block opacity-80 hover:opacity-100 hover:text-accent" to="/destinations">Destinations</Link>
          <Link className="block opacity-80 hover:opacity-100 hover:text-accent" to="/packages">Experiences</Link>
          <Link className="block opacity-80 hover:opacity-100 hover:text-accent" to="/packages?scope=international">International</Link>
          <Link className="block opacity-80 hover:opacity-100 hover:text-accent" to="/track">Track order</Link>
        </div>
        <div className="space-y-2 text-sm">
          <h4 className="font-semibold text-white">Help</h4>
          <Link className="block opacity-80 hover:opacity-100 hover:text-accent" to="/about">About</Link>
          <Link className="block opacity-80 hover:opacity-100 hover:text-accent" to="/contact">Contact</Link>
          <Link className="block opacity-80 hover:opacity-100 hover:text-accent" to="/track">Find my order</Link>
        </div>
        <div className="space-y-2 text-sm">
          <h4 className="font-semibold text-white">Legal</h4>
          <Link className="block opacity-80 hover:opacity-100 hover:text-accent" to="/privacy">Privacy Policy</Link>
          <Link className="block opacity-80 hover:opacity-100 hover:text-accent" to="/terms">Terms & Conditions</Link>
          <Link className="block opacity-80 hover:opacity-100 hover:text-accent" to="/refunds">Refund & Cancellation</Link>
        </div>
      </div>
      <div className="container-page">
        <Separator className="bg-sidebar-border" />
        <p className="py-5 text-xs text-sidebar-foreground/65">
          © {new Date().getFullYear()} UNITRIP TRAVELS PRIVATE LIMITED. All rights reserved. ·
          Registered office: Delhi · Governing law: India
        </p>
      </div>
    </footer>
  );
}
