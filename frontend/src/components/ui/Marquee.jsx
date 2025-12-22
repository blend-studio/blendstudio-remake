import React from "react";
import { motion } from "framer-motion";

const Marquee = ({ items, direction = "left", speed = 20, className = "" }) => {
  return (
    <div className={`flex overflow-hidden whitespace-nowrap ${className}`}>
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: direction === "left" ? "-50%" : "50%" }}
        transition={{ ease: "linear", duration: speed, repeat: Infinity }}
        className="flex gap-10 md:gap-20 min-w-full"
      >
        {[...items, ...items, ...items, ...items].map((item, index) => (
          <div key={index} className="flex-shrink-0">
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default Marquee;