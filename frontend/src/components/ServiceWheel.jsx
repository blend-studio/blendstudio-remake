import React from "react";
import { motion } from "framer-motion";

const ITEM_HEIGHT = 96; // px, controls wheel spacing

const ServiceWheel = ({ services, index, setIndex }) => {
  const count = services.length;
  const handleUp = () => setIndex((i) => (i - 1 + count) % count);
  const handleDown = () => setIndex((i) => (i + 1) % count);

  return (
    <div className="hidden md:block">
      <div className="sticky top-24 z-40">
        {/* rotating decorative ring */}
        <motion.div
          aria-hidden
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 48, ease: "linear" }}
          className="absolute -left-12 -top-20 w-[28rem] h-[28rem] rounded-full pointer-events-none opacity-20"
          style={{ background: "radial-gradient(circle at 30% 30%, rgba(59,130,246,0.12), transparent 30%), radial-gradient(circle at 70% 70%, rgba(59,130,246,0.08), transparent 30%)" }}
        />

        <div className="flex flex-col items-center gap-6">
          <button
            onClick={handleUp}
            aria-label="Up"
            className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#1e40af] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          >
            ▲
          </button>

          <div className="relative w-72 h-[30rem] overflow-hidden rounded-3xl shadow-2xl">
            {/* main blue panel */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1e40af 0%, #2563eb 45%, #60a5fa 70%, #ffffff 100%)" }} />

            {/* top/bottom white fade overlays */}
            <div className="absolute top-0 left-0 right-0 h-20 pointer-events-none" style={{ background: "linear-gradient(to bottom, white 0%, rgba(255,255,255,0) 100%)" }} />
            <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none" style={{ background: "linear-gradient(to top, white 0%, rgba(255,255,255,0) 100%)" }} />

            {/* subtle inner glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-56 rounded-full bg-white/6 blur-2xl opacity-30" />
            </div>

            <motion.ul
              initial={false}
              animate={{ y: -index * ITEM_HEIGHT }}
              transition={{ type: "spring", stiffness: 100, damping: 18, mass: 0.6 }}
              className="relative list-none m-0 p-0"
              style={{ willChange: "transform" }}
            >
              {services.map((s, i) => (
                <li
                  key={i}
                  className={`flex items-center justify-center text-center px-6 transition-transform duration-300 ${
                    i === index ? "scale-110" : "scale-95"
                  }`}
                  style={{ height: `${ITEM_HEIGHT}px` }}
                >
                  <motion.div
                    animate={i === index ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                    transition={{ duration: 2, repeat: i === index ? Infinity : 0 }}
                    className="uppercase font-black tracking-widest text-base text-white"
                  >
                    {s.title}
                  </motion.div>
                </li>
              ))}
            </motion.ul>
          </div>

          <button
            onClick={handleDown}
            aria-label="Down"
            className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#1e40af] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          >
            ▼
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceWheel;
