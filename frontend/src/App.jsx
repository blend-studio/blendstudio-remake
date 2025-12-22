import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import SmoothScroll from "./components/SmoothScroll";
import Navbar from "./components/Navbar";

// Import delle pagine (crea dei file vuoti se non li hai ancora fatti)
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Careers from "./pages/Careers";

function App() {
  const location = useLocation();

  return (
    <SmoothScroll>
      <div className="bg-blend-bg min-h-screen text-blend-dark font-sans selection:bg-blend selection:text-white">
        <Navbar />
        
        {/* AnimatePresence serve per animare l'uscita del componente */}
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/careers" element={<Careers />} />
          </Routes>
        </AnimatePresence>
        
      </div>
    </SmoothScroll>
  );
}

export default App;