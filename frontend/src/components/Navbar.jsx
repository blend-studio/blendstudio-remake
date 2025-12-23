import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import blendLogo from "../assets/images/blend-logo-blu.png";
import Magnetic from "./ui/Magnetic";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Calcoliamo se siamo ancora nella Hero (altezza 100vh)
      // Usiamo una tolleranza di 80px (altezza circa della navbar)
      const heroHeight = window.innerHeight - 80;
      setIsScrolled(window.scrollY > heroHeight);
    };
    
    // Eseguiamo al caricamento e ad ogni scroll
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuVariants = {
    initial: { x: "100%" },
    animate: { x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
    exit: { x: "100%", transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };

  const linkVariants = {
    initial: { x: 80, opacity: 0 },
    animate: (i) => ({
      x: 0,
      opacity: 1,
      transition: { duration: 0.75, ease: [0.76, 0, 0.24, 1], delay: 0.05 * i },
    }),
    exit: { x: 80, opacity: 0, transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] } },
  };

  const navLinks = [
    { title: "Home", href: "/" },
    { title: "Chi siamo", href: "/about" },
    { title: "Progetti", href: "/projects" },
    { title: "Servizi", href: "/services" },
    { title: "Lavora con noi", href: "/careers" },
    { title: "Contatti", href: "/contact" },
  ];

  // Determiniamo se gli elementi devono essere bianchi (su Hero o Menu Aperto) o Blu
  const isWhite = !isScrolled || isOpen;
  const navColorClass = isWhite ? "brightness-0 invert" : "";
  const burgerColorClass = isWhite ? "bg-white" : "bg-[#2f6580]";

  return (
    <>
      <nav className="fixed top-0 left-0 w-full p-6 md:px-20 md:py-10 flex justify-between items-center z-50 pointer-events-none transition-colors duration-500">
        {/* Background della Navbar che appare solo se scrollato (opzionale, per leggibilità) */}
        {/* <div className={`absolute inset-0 bg-white transition-opacity duration-500 -z-10 ${isScrolled ? "opacity-90 backdrop-blur-md" : "opacity-0"}`} /> */}

        {/* Logo */}
        <Link to="/" className="z-50 hover:opacity-80 transition-opacity block pointer-events-auto">
          <img 
            src={blendLogo} 
            alt="Blend Studio" 
            className={`h-12 md:h-16 w-auto transition-all duration-500 ease-in-out ${navColorClass}`}
          />
        </Link>

        {/* Menu Toggle */}
        <div className="pointer-events-auto">
          <Magnetic strength={60}>
            <button
              onClick={toggleMenu}
              className="z-50 cursor-pointer p-0 m-0 focus:outline-none !bg-transparent border-none !shadow-none hover:!bg-transparent active:!bg-transparent group"
              style={{ background: 'none', border: 'none', boxShadow: 'none', outline: 'none', borderRadius: '0' }}
              aria-label={isOpen ? "Chiudi Menu" : "Apri Menu"}
            >
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full flex flex-col justify-center items-center gap-1.5 transition-all duration-300 group-hover:scale-110">
                <span
                  className={`block w-6 md:w-8 h-1 transition-all duration-500 ease-in-out ${
                    isOpen ? "bg-white rotate-45 translate-y-2.5" : `${burgerColorClass}`
                  }`}
                ></span>
                <span
                  className={`block w-6 md:w-8 h-1 transition-all duration-500 ease-in-out ${
                    isOpen ? "opacity-0" : `${burgerColorClass} opacity-100`
                  }`}
                ></span>
                <span
                  className={`block w-6 md:w-8 h-1 transition-all duration-500 ease-in-out ${
                    isOpen ? "bg-white -rotate-45 -translate-y-2.5" : `${burgerColorClass}`
                  }`}
                ></span>
              </div>
            </button>
          </Magnetic>
        </div>
      </nav>
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed top-0 left-0 w-full h-screen bg-[#2f6580] text-white z-40 flex flex-col justify-between p-6 md:p-20 overflow-hidden"
          >
            {/* Header placeholder */}
            <div className="h-[20px]"></div>

            {/* Main Links */}
            <div className="flex flex-col gap-2 md:gap-4 mt-20">
              {navLinks.map((link, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={linkVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <Link
                    to={link.href}
                    onClick={toggleMenu}
                    className="text-5xl md:text-7xl font-bold tracking-tighter text-white !text-white hover:opacity-70 transition-opacity block w-fit"
                  >
                    {link.title}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Footer Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
              exit={{ opacity: 0, y: 20 }}
              className="flex flex-col md:flex-row justify-between items-end text-sm text-white uppercase tracking-widest gap-6"
            >
              <div className="flex flex-col gap-2">
                <span className="text-white">Blend Studio Borders</span>
                <span className="text-white">Blend Studio Lens</span>
                <span className="text-white">Lavora con noi</span>
              </div>
              <div className="flex gap-6">
                <a href="#" className="text-white !text-white hover:opacity-70 transition-opacity">Instagram</a>
                <a href="#" className="text-white !text-white hover:opacity-70 transition-opacity">Linkedin</a>
                <a href="#" className="text-white !text-white hover:opacity-70 transition-opacity">Facebook</a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;