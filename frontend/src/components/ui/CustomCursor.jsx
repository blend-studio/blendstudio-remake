import React, { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  const springConfig = { damping: 25, stiffness: 150 };
  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);

  useEffect(() => {
    // Controllo rigoroso: solo se supporta hover (mouse) e schermo > 1024px
    const checkDevice = () => {
      const hasHover = window.matchMedia("(hover: hover)").matches;
      const isLarge = window.innerWidth >= 1024;
      setIsEnabled(hasHover && isLarge);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    const mouseMove = (e) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e) => {
      if (e.target.closest("a, button, .cursor-pointer")) {
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
  }, [cursorX, cursorY, isVisible]);

  // Se siamo su mobile/tablet o il mouse non si è ancora mosso, non renderizziamo nulla
  if (!isEnabled || !isVisible) return null;

  return (
    <>
      <motion.div
        className="custom-cursor fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: cursorX,
          y: cursorY,
          backgroundColor: "white",
          scale: isHovering ? 2.5 : 1,
        }}
      />
      <motion.div
        className="custom-cursor fixed top-0 left-0 w-32 h-32 rounded-full pointer-events-none z-[9998] blur-3xl opacity-20"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-35%",
          translateY: "-35%",
          backgroundColor: "#4a8fa3",
          scale: isHovering ? 1.5 : 1,
        }}
      />
    </>
  );
};

export default CustomCursor;