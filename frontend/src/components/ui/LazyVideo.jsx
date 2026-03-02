import React, { useRef, useState, useEffect } from "react";

/**
 * LazyVideo — Skips video entirely on mobile (<768px) for performance.
 * On larger screens, loads the video source only when entering viewport.
 */
const LazyVideo = ({ src, className, ...props }) => {
  const ref = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check once on mount
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    
    if (mobile) return; // Don't even setup observer on mobile

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // On mobile, render nothing (parent bg-black shows through)
  if (isMobile) return null;

  return (
    <video ref={ref} className={className} {...props}>
      {shouldLoad && <source src={src} type="video/mp4" />}
    </video>
  );
};

export default LazyVideo;
