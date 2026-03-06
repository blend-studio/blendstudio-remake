import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SmoothScroll from "./components/SmoothScroll";
import ScrollToTop from "./components/ScrollToTop";
import GrainOverlay from "./components/ui/GrainOverlay";
import { useTelemetry } from "./hooks/useTelemetry";

// Lazy-loaded pages — each page is a separate JS chunk
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Services = lazy(() => import("./pages/Services"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail"));
const Careers = lazy(() => import("./pages/Careers"));
const Contact = lazy(() => import("./pages/Contact"));

import { AuthProvider } from "./context/AuthContext";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminProjects from "./admin/AdminProjects";
import AdminMessages from "./admin/AdminMessages";
import AdminContent from "./admin/AdminContent";
import AdminUsers from "./admin/AdminUsers";
import AdminAnalytics from "./admin/AdminAnalytics";
import Login from "./pages/Login";

// Minimal loading fallback
const PageLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-white">
    <div className="w-8 h-8 border-4 border-blend border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Attiva il tracking automatico delle page view (solo pagine pubbliche)
function TelemetryTracker() {
  useTelemetry(); // il hook ignora internamente le route /admin e /login
  return null;
}

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <Suspense fallback={<PageLoader />}>
      <TelemetryTracker />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

const PublicLayout = ({ children }) => {
  const location = useLocation();
  const isAdminOrLogin = location.pathname.startsWith("/admin") || location.pathname === "/login";

  return (
    <div className="antialiased text-gray-900 bg-white min-h-screen selection:bg-blend-light selection:text-white">
      {!isAdminOrLogin && <Navbar />}
      {children}
      {!isAdminOrLogin && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <SmoothScroll>
          <ScrollToTop />
          <GrainOverlay />
          <PublicLayout>
            <AnimatedRoutes />
          </PublicLayout>
        </SmoothScroll>
      </AuthProvider>
    </Router>
  );
}

export default App;