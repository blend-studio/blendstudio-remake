import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const DetailCard = ({ service, index }) => {
  if (!service) return null;
  return (
    <AnimatePresence mode="wait">
      <motion.section
        key={index}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full min-h-screen flex items-center"
      >
        <div className="max-w-4xl w-full mx-auto p-8 md:p-16 bg-white/90 rounded-3xl border border-gray-100 shadow-2xl">
          <div className="flex justify-between items-start mb-6">
            <span className="text-[10px] font-black text-blend-light uppercase tracking-[0.3em] border-b-2 border-blend-light/20 pb-2">
              {service.cat}
            </span>
            <span className="text-4xl font-black text-blend/10 italic">
              {`0${index + 1}`}
            </span>
          </div>

          <h3 className="text-4xl md:text-6xl font-black text-blend mb-6 tracking-tighter uppercase italic leading-tight">
            {service.title}
          </h3>

          <p className="text-gray-700 text-xl md:text-2xl leading-relaxed">
            {service.description}
          </p>

          <div className="mt-10">
            <a href="/contact" className="inline-flex items-center gap-4 px-6 py-3 bg-blend text-white font-black uppercase tracking-[0.2em] rounded-full shadow-lg hover:scale-105 transition-transform">
              Inizia un progetto
            </a>
          </div>
        </div>

        {/* large ghost text behind */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-5 select-none">
          <div className="font-black text-[20vw] leading-none text-blend">{service.title}</div>
        </div>
      </motion.section>
    </AnimatePresence>
  );
};

export default DetailCard;
