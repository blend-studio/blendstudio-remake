import React, { useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import PageTransition from "../components/Transition";
import { RevealText } from "../components/ui/RevealText";
import { servicesData } from "../data/servicesData";

const ServiceDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // Trova il servizio tramite slug
  const service = servicesData.find((s) => s.slug === slug);

  useEffect(() => {
    // Se lo slug non è valido, reindirizza alla pagina servizi principale
    if (!service) {
      navigate('/services', { replace: true });
    }
  }, [service, navigate]);

  // Parallax setup for Hero
  const { scrollY } = useScroll();
  const yImage = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacityImage = useTransform(scrollY, [0, 800], [0.3, 0]);
  const yText = useTransform(scrollY, [0, 1000], [0, 150]);

  // Parallax setup for CTA
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const ctaYText = useTransform(scrollYProgress, [0.7, 1], ["20%", "-20%"]);

  if (!service) return null; // Attende il redirect

  // Immagine di copertina (placeholder evocativo)
  const coverImage = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop"; 

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
  };

  const cardVariant = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
    }
  };

  return (
    <PageTransition>
      <div className="bg-white min-h-screen" ref={containerRef}>
        
        {/* --- FULLSCREEN HERO --- */}
        <div className="relative h-screen w-full overflow-hidden bg-blend-dark nav-dark-section">
           <motion.div 
             className="absolute inset-0 z-0 origin-bottom"
             style={{ y: yImage, opacity: opacityImage }}
           >
              <motion.img 
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 2.5, ease: "easeOut" }}
                src={coverImage} 
                alt={service.title} 
                className="w-full h-full object-cover grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
           </motion.div>
           {/* Fixed overlay independent from parallax */}
           <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

           <motion.div 
             style={{ y: yText }}
             className="max-w-[90rem] w-full z-10 relative px-6 md:px-20 h-full flex flex-col justify-center pt-[15vh] pb-[12vh]"
           >
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                className="flex items-center gap-4 mb-6 md:mb-10"
              >
                <div className="h-[2px] w-12 bg-white/60"></div>
                <span className="text-white/80 font-bold uppercase tracking-[0.3em] text-[10px] md:text-sm">
                  {service.cat}
                </span>
              </motion.div>

              <div className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] xl:text-[12rem] font-extrabold leading-[0.85] tracking-tight text-white mix-blend-difference">
                <div className="max-w-[15ch] overflow-hidden py-4">
                   <RevealText text={service.title.toUpperCase()} delay={0.2} />
                </div>
              </div>
              
              <div className="mt-12 md:mt-16 max-w-2xl overflow-hidden">
                <motion.p 
                  initial={{ opacity: 0, y: "100%" }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 1, ease: [0.76, 0, 0.24, 1] }}
                  className="text-xl md:text-3xl text-white/60 leading-tight font-medium uppercase italic tracking-tighter"
                >
                  {service.description}
                </motion.p>
              </div>
           </motion.div>

           <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 15, 0] }}
            transition={{ delay: 2, duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-10 left-6 md:left-20 flex flex-col items-center gap-3 z-10"
          >
            <span className="text-[9px] uppercase tracking-[0.3em] text-white/50 font-bold rotate-90 origin-left translate-x-3 selection:bg-transparent">Scroll</span>
            <div className="w-[1px] h-12 bg-white/30 mt-6"></div>
          </motion.div>
        </div>

        {/* --- MAIN CONTENT & EXTENDED DESCRIPTION --- */}
        <div className="px-6 md:px-20 pt-32 pb-16 md:pt-48 md:pb-32 bg-white relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-32">
                
                {/* Sidebar Info (Tags) */}
                <div className="lg:col-span-4 space-y-12 order-2 lg:order-1 border-t lg:border-t-0 border-gray-100 pt-16 lg:pt-0">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} variants={staggerContainer}>
                        <motion.h3 variants={fadeUpVariant} className="text-[10px] font-black uppercase tracking-[0.4em] text-blend-light/60 mb-8 border-b border-gray-100 pb-4">Area di competenza</motion.h3>
                        <div className="flex flex-col gap-6 mt-8">
                           {service.tags.map((tag, i) => (
                             <motion.div key={i} variants={fadeUpVariant} className="flex items-center gap-6 group cursor-default">
                               <div className="w-1.5 h-1.5 bg-blend-light rounded-full group-hover:scale-150 transition-transform"></div>
                               <span className="text-blend font-bold text-lg md:text-xl">{tag}</span>
                             </motion.div>
                           ))}
                        </div>
                    </motion.div>
                </div>

                {/* Extended Description */}
                <div className="lg:col-span-8 order-1 lg:order-2">
                    <motion.h2 
                      variants={fadeUpVariant} 
                      initial="hidden" 
                      whileInView="visible" 
                      viewport={{ once: true, margin: "-20%" }} 
                      className="text-4xl md:text-7xl font-black text-blend mb-12 tracking-tighter uppercase italic drop-shadow-sm"
                    >
                        L'Approccio
                    </motion.h2>
                    <motion.div 
                      variants={fadeUpVariant} 
                      initial="hidden" 
                      whileInView="visible" 
                      viewport={{ once: true, margin: "-15%" }} 
                      className="text-xl md:text-3xl text-gray-500 leading-[1.5] font-medium tracking-tight space-y-8 max-w-4xl"
                    >
                        <p className="text-blend font-black">{service.extendedDescription}</p>
                    </motion.div>
                </div>
            </div>
        </div>

        {/* --- BENEFITS SECTION --- */}
        {service.benefits && (
          <div className="px-6 md:px-20 py-32 md:py-48 bg-gray-50 relative z-10 overflow-hidden">
            <motion.h2 variants={fadeUpVariant} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-5xl md:text-8xl font-black uppercase tracking-tighter italic text-blend mb-16 md:mb-24">I Vantaggi per te</motion.h2>
            <motion.div 
               variants={staggerContainer} 
               initial="hidden" 
               whileInView="visible" 
               viewport={{ once: true, margin: "-10%" }} 
               className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
            >
              {service.benefits.map((benefit, i) => (
                 <motion.div 
                    key={i} 
                    variants={cardVariant} 
                    whileHover={{ y: -10, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)" }}
                    className="bg-white p-10 md:p-12 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-start transition-shadow duration-500"
                 >
                    <div className="w-16 h-16 rounded-full bg-blend/5 flex items-center justify-center text-blend font-black mb-8 border border-blend/10">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <p className="text-blend font-bold text-xl md:text-2xl leading-snug">{benefit}</p>
                 </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* --- PROCESS SECTION --- */}
        {service.process && (
          <div className="px-6 md:px-20 py-32 md:py-48 bg-white relative z-10 border-t border-gray-100">
             <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <motion.h2 variants={fadeUpVariant} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-5xl md:text-8xl font-black text-blend uppercase tracking-tighter italic m-0 line-clamp-1">Il Metodo</motion.h2>
                <div className="hidden md:block w-32 h-[2px] bg-blend/10 mb-4 flex-grow mx-8"></div>
             </div>
             <motion.div 
                variants={staggerContainer} 
                initial="hidden" 
                whileInView="visible" 
                viewport={{ once: true, margin: "-10%" }} 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 lg:gap-8 border-y border-gray-100 divide-y md:divide-y-0 md:divide-x divide-gray-100 py-16"
             >
               {service.process.map((p, i) => (
                  <motion.div key={i} variants={fadeUpVariant} className="group flex flex-col py-12 lg:py-0 px-0 lg:px-8 xl:px-12 first:pt-0 last:pb-0 first:lg:pl-0 last:lg:pr-0 cursor-default">
                     <div className="overflow-hidden mb-6 md:mb-10">
                        <motion.span 
                          className="block text-7xl md:text-9xl font-black text-blend/5 italic group-hover:text-blend/10 group-hover:translate-x-4 transition-all duration-500 origin-left"
                        >
                          {p.step}
                        </motion.span>
                     </div>
                     <h4 className="text-2xl md:text-3xl font-black text-blend mb-4 group-hover:text-blend-light transition-colors duration-300">{p.name}</h4>
                     <p className="text-gray-500 font-medium text-lg leading-relaxed">{p.desc}</p>
                  </motion.div>
               ))}
             </motion.div>
          </div>
        )}

        {/* --- CTA --- */}
        <div className="bg-blend py-40 md:py-60 text-center relative overflow-hidden nav-dark-section">
            <motion.div 
               style={{ y: ctaYText }}
               className="absolute inset-0 font-black text-[18vw] leading-none pointer-events-none select-none flex items-center justify-center text-white/5 text-center whitespace-nowrap"
            >
              ELEVATE
            </motion.div>
            
            <motion.div
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true, margin: "-20%" }}
               variants={staggerContainer}
               className="relative z-10"
            >
              <motion.p variants={fadeUpVariant} className="text-white/40 text-xs font-black uppercase tracking-[0.5em] mb-10">Hai bisogno di {service.title}?</motion.p>
              <motion.div variants={fadeUpVariant}>
                <Link to="/contact" className="group text-5xl sm:text-7xl md:text-9xl font-black !text-white hover:italic transition-all duration-500 uppercase tracking-tighter px-6 inline-block">
                    Let's Talk
                    <div className="h-[4px] md:h-[8px] w-0 bg-white group-hover:w-full transition-all duration-700 ease-[0.76,0,0.24,1] mt-2"></div>
                </Link>
              </motion.div>
            </motion.div>
        </div>

      </div>
    </PageTransition>
  );
};

export default ServiceDetail;
