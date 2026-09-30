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

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="destinations" element={<Destinations />} />
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
        <Route path="logs" element={<AdminLogs />} />
      </Route>
    </Routes>
  );
}
