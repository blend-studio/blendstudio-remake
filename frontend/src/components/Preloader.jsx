import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Preloader = ({ setLoading }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev === 100) {
          clearInterval(timer);
          setTimeout(() => setLoading(false), 800); // Ritardo finale per fluidità
          return 100;
        }
        // Incremento variabile per sembrare più naturale
        const jump = Math.floor(Math.random() * 10) + 1;
        return Math.min(prev + jump, 100);
      });
    }, 150);

    return () => clearInterval(timer);
  }, [setLoading]);

  return (
    <motion.div
      initial={{ y: 0 }}
      exit={{ y: "-100%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
      className="fixed inset-0 z-[10000] bg-blend flex items-center justify-center text-white overflow-hidden"
    >
      <div className="relative w-full px-10 md:px-20">
         {/* Counter Gigante */}
         <div className="flex justify-between items-end border-b border-white/20 pb-4">
            <h1 className="text-[15vw] leading-none font-black tracking-tighter">
                {count}%
            </h1>
            <div className="text-right pb-2 md:pb-6">
                <p className="text-sm md:text-xl font-bold uppercase tracking-widest">Blend Studio</p>
                <p className="text-xs md:text-sm opacity-60 mt-1">Digital Experience &copy;2025</p>
            </div>
         </div>
      </div>
    </motion.div>
  );
};

export default Preloader;