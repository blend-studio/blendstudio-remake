import React, { useRef, useState, useEffect } from "react";

const isMobileDevice = () => window.innerWidth < 768;

/**
 * LazyVideo — Loads the video source only when entering viewport (tablet+).
 * On mobile, uses `mobileSrc` (if provided) to serve a much lighter video.
 */
const LazyVideo = ({ src, mobileSrc, className, poster, ...props }) => {
  const ref = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  // Re-check on mount to be strictly accurate
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const isMob = isMobileDevice();
    setMobile(isMob);

    const el = ref.current;
    if (!el) return;

    // We do immediate load for mobile to ensure autoplay works immediately, 
    // or we can lazy load there too. Let's lazy load mobile as well!
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          // Trigger play after source is loaded
          setTimeout(() => el.play?.().catch(() => {}), 100);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const videoSrc = mobile && mobileSrc ? mobileSrc : src;

  return (
    <video ref={ref} className={className} preload="none" {...props}>
      {shouldLoad && <source src={videoSrc} type="video/mp4" />}
    </video>
  );
};

export default LazyVideo;
