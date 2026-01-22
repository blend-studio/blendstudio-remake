import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SmoothScroll from "./components/SmoothScroll";
import ScrollToTop from "./components/ScrollToTop";
import GrainOverlay from "./components/ui/GrainOverlay";

// Pagine
import Home from "./pages/Home";
import About from "./pages/About";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Services from "./pages/Services";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/services" element={<Services />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </AnimatePresence>
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