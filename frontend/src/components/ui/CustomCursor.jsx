import React, { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  // Separate springs for dot (fast) and glow (smooth/trail)
  const dotSpringConfig = { damping: 30, stiffness: 250, mass: 0.5 };
  const glowSpringConfig = { damping: 25, stiffness: 120, mass: 0.8 };

  const dotX = useSpring(0, dotSpringConfig);
  const dotY = useSpring(0, dotSpringConfig);
  const glowX = useSpring(0, glowSpringConfig);
  const glowY = useSpring(0, glowSpringConfig);

  useEffect(() => {
    const checkDevice = () => {
      const hasHover = window.matchMedia("(hover: hover)").matches;
      const isLarge = window.innerWidth >= 1024;
      setIsEnabled(hasHover && isLarge);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    const mouseMove = (e) => {
      const { clientX, clientY } = e;
      
      // Update springs directly without triggering React state for coordinates
      dotX.set(clientX - 16);
      dotY.set(clientY - 16);
      glowX.set(clientX - 16);
      glowY.set(clientY - 16);
      
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (target.closest("a, button, .cursor-pointer, [role='button']")) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("resize", checkDevice);
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [dotX, dotY, glowX, glowY, isVisible]);

  if (!isEnabled || !isVisible) return null;

  return (
    <>
      {/* Principal Cursor (Fast & Precise) */}
      <motion.div
        className="custom-cursor fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] mix-blend-difference bg-white"
        style={{
          x: dotX,
          y: dotY,
          scale: isHovering ? 2 : 1,
        }}
      />
      
      {/* Glow Effect (Smooth & Lagging) */}
      <motion.div
        className="custom-cursor fixed top-0 left-0 w-32 h-32 rounded-full pointer-events-none z-[9998] blur-3xl opacity-20 bg-[#4a8fa3]"
        style={{
          x: glowX,
          y: glowY,
          translateX: "-35%",
          translateY: "-35%",
          scale: isHovering ? 1.5 : 1,
        }}
      />
    </>
  );
};

export default CustomCursor;
