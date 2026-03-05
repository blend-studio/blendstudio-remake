import React, { useRef, useState, useEffect } from "react";

const isMobileDevice = () => typeof window !== 'undefined' && window.innerWidth < 768;

/**
 * LazyVideo — Skips video entirely on mobile (<768px) for performance.
 * On larger screens, loads the video source only when entering viewport.
 */
const LazyVideo = ({ src, className, ...props }) => {
  const ref = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const mobile = isMobileDevice(); // Sync check — no flash

  useEffect(() => {
    if (mobile) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "50px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [mobile]);

  // On mobile, render nothing
  if (mobile) return null;

  return (
    <video ref={ref} className={className} {...props}>
      {shouldLoad && <source src={src} type="video/mp4" />}
    </video>
  );
};

export default LazyVideo;
