import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SmoothScroll from "./components/SmoothScroll";
import ScrollToTop from "./components/ScrollToTop";
import GrainOverlay from "./components/ui/GrainOverlay";

// Lazy-loaded pages — each page is a separate JS chunk
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Services = lazy(() => import("./pages/Services"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail"));
const Careers = lazy(() => import("./pages/Careers"));
const Contact = lazy(() => import("./pages/Contact"));

// Minimal loading fallback
const PageLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-white">
    <div className="w-8 h-8 border-4 border-[#2f6580] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <SmoothScroll>
        <ScrollToTop />
        <GrainOverlay />
        
        <div className="antialiased text-gray-900 bg-white min-h-screen selection:bg-blend-light selection:text-white">
          <Navbar />
          <AnimatedRoutes />
          <Footer />
        </div>
      </SmoothScroll>
    </Router>
  );
}

export default App;