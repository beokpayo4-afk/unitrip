import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { HolidayBookingProvider } from "@/holidays/context/HolidayBookingProvider";

export default function HolidayLayout() {
  return (
    <HolidayBookingProvider>
      <Suspense fallback={<div className="container-page py-10 text-muted-foreground">Loading packages…</div>}>
        <Outlet />
      </Suspense>
    </HolidayBookingProvider>
  );
}
