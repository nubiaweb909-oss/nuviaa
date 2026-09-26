import { Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingWhatsApp from "@/components/features/FloatingWhatsApp";

const HomePage = lazy(() => import("@/pages/HomePage"));
const MarketplacePage = lazy(() => import("@/pages/MarketplacePage"));
const ProductDetailPage = lazy(() => import("@/pages/ProductDetailPage"));
const RentalMarketplacePage = lazy(() => import("@/pages/RentalMarketplacePage"));
const RentalProductDetailPage = lazy(() => import("@/pages/RentalProductDetailPage"));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage"));
const PaymentCallbackPage = lazy(() => import("@/pages/PaymentCallbackPage"));
const DomainsPage = lazy(() => import("@/pages/DomainsPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

const SignInPage = lazy(() => import("@/pages/auth/SignInPage"));
const SignUpPage = lazy(() => import("@/pages/auth/SignUpPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"));

const DashboardOverviewPage = lazy(() => import("@/pages/dashboard/DashboardOverviewPage"));
const PurchasesPage = lazy(() => import("@/pages/dashboard/PurchasesPage"));
const ProfilePage = lazy(() => import("@/pages/dashboard/ProfilePage"));
const SubscriptionsPage = lazy(() => import("@/pages/dashboard/SubscriptionsPage"));

const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage"));
const AdminProductsPage = lazy(() => import("@/pages/admin/AdminProductsPage"));
const AdminProductFormPage = lazy(() => import("@/pages/admin/AdminProductFormPage"));
const AdminOrdersPage = lazy(() => import("@/pages/admin/AdminOrdersPage"));
const AdminDomainsPage = lazy(() => import("@/pages/admin/AdminDomainsPage"));
const AdminCategoriesPage = lazy(() => import("@/pages/admin/AdminCategoriesPage"));
const AdminUsersPage = lazy(() => import("@/pages/admin/AdminUsersPage"));
const AdminReviewsPage = lazy(() => import("@/pages/admin/AdminReviewsPage"));
const AdminSettingsPage = lazy(() => import("@/pages/admin/AdminSettingsPage"));
const AdminRentalProductsPage = lazy(() => import("@/pages/admin/AdminRentalProductsPage"));
const AdminRentalProductFormPage = lazy(() => import("@/pages/admin/AdminRentalProductFormPage"));
const AdminRentalSubscriptionsPage = lazy(() => import("@/pages/admin/AdminRentalSubscriptionsPage"));

const PageLoader = () => (
  <div className="min-h-screen bg-nuvia-cream flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-nuvia-forest/20 border-t-nuvia-espresso rounded-full animate-spin" />
  </div>
);

const ADMIN_PATH = "/admin";
const AUTH_PATH = "/auth";

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith(ADMIN_PATH);
  const isAuth = location.pathname.startsWith(AUTH_PATH);
  const showNavbar = !isAdmin;
  const showFooter = !isAdmin && !isAuth;

  return (
    <>
      {showNavbar && <Navbar />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/rent" element={<RentalMarketplacePage />} />
          <Route path="/rent/:slug" element={<RentalProductDetailPage />} />
          <Route path="/domains" element={<DomainsPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Auth */}
          <Route path="/auth/sign-in" element={<SignInPage />} />
          <Route path="/auth/sign-up" element={<SignUpPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

          {/* Protected */}
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment/callback" element={<PaymentCallbackPage />} />
          <Route path="/dashboard" element={<DashboardOverviewPage />} />
          <Route path="/dashboard/purchases" element={<PurchasesPage />} />
          <Route path="/dashboard/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/dashboard/profile" element={<ProfilePage />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/products/new" element={<AdminProductFormPage />} />
          <Route path="/admin/products/:id/edit" element={<AdminProductFormPage />} />
          <Route path="/admin/rental-products" element={<AdminRentalProductsPage />} />
          <Route path="/admin/rental-products/new" element={<AdminRentalProductFormPage />} />
          <Route path="/admin/rental-products/:id/edit" element={<AdminRentalProductFormPage />} />
          <Route path="/admin/rental-subscriptions" element={<AdminRentalSubscriptionsPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/domains" element={<AdminDomainsPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/reviews" element={<AdminReviewsPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      {showFooter && <Footer />}
      {showNavbar && <FloatingWhatsApp />}
    </>
  );
}

export default function App() {
  return <AppContent />;
}
