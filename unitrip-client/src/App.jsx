import { Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Destinations from "@/pages/Destinations";
import Packages from "@/pages/Packages";
import PackageDetail from "@/pages/PackageDetail";
import TrackOrder from "@/pages/TrackOrder";
import Cart from "@/pages/Cart";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import MyBookings from "@/pages/MyBookings";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import LegalPage from "@/pages/LegalPage";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminPackages from "@/pages/admin/AdminPackages";
import AdminPackageForm from "@/pages/admin/AdminPackageForm";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminFaqs from "@/pages/admin/AdminFaqs";
import AdminBookings from "@/pages/admin/AdminBookings";
import AdminLogs from "@/pages/admin/AdminLogs";
import FlightLayout from "@/pages/flights/FlightLayout";
import FlightSearchPage from "@/pages/flights/FlightSearchPage";
import FlightResultsPage from "@/pages/flights/FlightResultsPage";
import FlightDetailsPage from "@/pages/flights/FlightDetailsPage";
import PassengerDetailsPage from "@/pages/flights/PassengerDetailsPage";
import BookingSummaryPage from "@/pages/flights/BookingSummaryPage";
import FlightPaymentPage from "@/pages/flights/FlightPaymentPage";
import FlightConfirmationPage from "@/pages/flights/FlightConfirmationPage";
import FlightBookingsPage from "@/pages/flights/FlightBookingsPage";
import HotelLayout from "@/pages/hotels/HotelLayout";
import HotelSearchPage from "@/pages/hotels/HotelSearchPage";
import HotelResultsPage from "@/pages/hotels/HotelResultsPage";
import HotelDetailsPage from "@/pages/hotels/HotelDetailsPage";
import RoomSelectionPage from "@/pages/hotels/RoomSelectionPage";
import GuestDetailsPage from "@/pages/hotels/GuestDetailsPage";
import HotelSummaryPage from "@/pages/hotels/HotelSummaryPage";
import HotelPaymentPage from "@/pages/hotels/HotelPaymentPage";
import HotelConfirmationPage from "@/pages/hotels/HotelConfirmationPage";
import HotelBookingsPage from "@/pages/hotels/HotelBookingsPage";
import TrainLayout from "@/pages/trains/TrainLayout";
import TrainSearchPage from "@/pages/trains/TrainSearchPage";
import TrainResultsPage from "@/pages/trains/TrainResultsPage";
import TrainDetailsPage from "@/pages/trains/TrainDetailsPage";
import TrainPassengersPage from "@/pages/trains/TrainPassengersPage";
import TrainSummaryPage from "@/pages/trains/TrainSummaryPage";
import TrainPaymentPage from "@/pages/trains/TrainPaymentPage";
import TrainConfirmationPage from "@/pages/trains/TrainConfirmationPage";
import TrainBookingsPage from "@/pages/trains/TrainBookingsPage";
import HolidayLayout from "@/pages/holidays/HolidayLayout";
import HolidayListPage from "@/pages/holidays/HolidayListPage";
import HolidayDetailPage from "@/pages/holidays/HolidayDetailPage";
import HolidayBookPage from "@/pages/holidays/HolidayBookPage";
import HolidaySummaryPage from "@/pages/holidays/HolidaySummaryPage";
import HolidayConfirmationPage from "@/pages/holidays/HolidayConfirmationPage";
import HolidayEnquiryPage from "@/pages/holidays/HolidayEnquiryPage";
import HolidayBookingsPage from "@/pages/holidays/HolidayBookingsPage";
import TravelLayout from "@/pages/travel/TravelLayout";
import TravelPlannerPage from "@/pages/travel/TravelPlannerPage";
import TravelConfirmationPage from "@/pages/travel/TravelConfirmationPage";
import AdminTripEnquiries from "@/pages/admin/AdminTripEnquiries";
import AdminTripEnquiryDetail from "@/pages/admin/AdminTripEnquiryDetail";
import AdminModuleBookings from "@/pages/admin/AdminModuleBookings";
import AdminModuleBookingDetail from "@/pages/admin/AdminModuleBookingDetail";
import AdminHolidayPackages from "@/pages/admin/AdminHolidayPackages";
import AdminHolidayPackageForm from "@/pages/admin/AdminHolidayPackageForm";
import AdminDestinations from "@/pages/admin/AdminDestinations";
import AdminItineraries from "@/pages/admin/AdminItineraries";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="destinations" element={<Destinations />} />
        <Route path="flights" element={<FlightLayout />}>
          <Route index element={<FlightSearchPage />} />
          <Route path="results" element={<FlightResultsPage />} />
          <Route path="details" element={<FlightDetailsPage />} />
          <Route path="passengers" element={<PassengerDetailsPage />} />
          <Route path="summary" element={<BookingSummaryPage />} />
          <Route path="payment" element={<FlightPaymentPage />} />
          <Route path="confirmation/:reference" element={<FlightConfirmationPage />} />
          <Route path="bookings" element={<FlightBookingsPage />} />
        </Route>
        <Route path="hotels" element={<HotelLayout />}>
          <Route index element={<HotelSearchPage />} />
          <Route path="results" element={<HotelResultsPage />} />
          <Route path="details" element={<HotelDetailsPage />} />
          <Route path="rooms" element={<RoomSelectionPage />} />
          <Route path="guests" element={<GuestDetailsPage />} />
          <Route path="summary" element={<HotelSummaryPage />} />
          <Route path="payment" element={<HotelPaymentPage />} />
          <Route path="confirmation/:reference" element={<HotelConfirmationPage />} />
          <Route path="bookings" element={<HotelBookingsPage />} />
        </Route>
        <Route path="trains" element={<TrainLayout />}>
          <Route index element={<TrainSearchPage />} />
          <Route path="results" element={<TrainResultsPage />} />
          <Route path="details" element={<TrainDetailsPage />} />
          <Route path="passengers" element={<TrainPassengersPage />} />
          <Route path="summary" element={<TrainSummaryPage />} />
          <Route path="payment" element={<TrainPaymentPage />} />
          <Route path="confirmation/:reference" element={<TrainConfirmationPage />} />
          <Route path="bookings" element={<TrainBookingsPage />} />
        </Route>
        <Route path="holiday-packages" element={<HolidayLayout />}>
          <Route index element={<HolidayListPage />} />
          <Route path="bookings" element={<HolidayBookingsPage />} />
          <Route path="confirmation/:reference" element={<HolidayConfirmationPage />} />
          <Route path=":slug" element={<HolidayDetailPage />} />
          <Route path=":slug/book" element={<HolidayBookPage />} />
          <Route path=":slug/summary" element={<HolidaySummaryPage />} />
          <Route path=":slug/enquiry" element={<HolidayEnquiryPage />} />
        </Route>
        <Route path="travel-packages" element={<TravelLayout />}>
          <Route index element={<TravelPlannerPage />} />
          <Route path="confirmation/:reference" element={<TravelConfirmationPage />} />
        </Route>
        <Route path="packages" element={<Packages />} />
        <Route path="packages/:slug" element={<PackageDetail />} />
        <Route path="track" element={<TrackOrder />} />
        <Route path="cart" element={<Cart />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="my-bookings" element={<MyBookings />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy" element={<LegalPage title="Privacy Policy" />} />
        <Route path="terms" element={<LegalPage title="Terms & Conditions" />} />
        <Route path="refunds" element={<LegalPage title="Refund & Cancellation" />} />
      </Route>

      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="packages" element={<AdminPackages />} />
        <Route path="packages/new" element={<AdminPackageForm />} />
        <Route path="packages/:id" element={<AdminPackageForm />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="faqs" element={<AdminFaqs />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="bookings/:type" element={<AdminModuleBookings />} />
        <Route path="module-bookings/:id" element={<AdminModuleBookingDetail />} />
        <Route path="trip-requests" element={<AdminTripEnquiries />} />
        <Route path="trip-requests/:id" element={<AdminTripEnquiryDetail />} />
        <Route path="holiday-packages" element={<AdminHolidayPackages />} />
        <Route path="holiday-packages/new" element={<AdminHolidayPackageForm />} />
        <Route path="holiday-packages/:id" element={<AdminHolidayPackageForm />} />
        <Route path="destinations" element={<AdminDestinations />} />
        <Route path="itineraries" element={<AdminItineraries />} />
        <Route path="logs" element={<AdminLogs />} />
      </Route>
    </Routes>
  );
}
