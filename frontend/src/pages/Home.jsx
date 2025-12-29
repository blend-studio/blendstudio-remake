import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useLenis } from 'lenis/react';
import PageTransition from "../components/Transition";
import { RevealText } from "../components/ui/RevealText";
import Marquee from "../components/ui/Marquee";
import { getProjects } from "../services/api";

// Import local logos
import neroBucato from "../assets/images/loghi partner/aran/NERO-BUCATO.svg";
import medirocca from "../assets/images/loghi partner/02-logo-vector-medirocca.svg";
import piacenzaNero from "../assets/images/loghi partner/PIACENZA_NERO.png";

const servicesShort = [
  { 
    title: "Brand Identity", 
    cat: "Visual", 
    desc: "Creiamo identità visive uniche che rimangono impresse.", 
    details: "Dallo studio del logo alla definizione della palette cromatica e della tipografia, costruiamo un'identità visiva coerente e memorabile che comunica i valori del tuo brand in ogni punto di contatto.",
    features: ["Logo Design", "Brand Guidelines", "Visual Strategy", "Rebranding"],
    icon: "M12 2L2 7l10 10 10-5-10-10zM2 17l10 5 10-5M2 12l10 5 10-5" 
  },
  { 
    title: "Web Experience", 
    cat: "Technology", 
    desc: "Sviluppiamo ecosistemi digitali d'avanguardia e performanti.", 
    details: "Progettiamo e sviluppiamo siti web e applicazioni web che uniscono design emozionale e performance tecniche impeccabili. Soluzioni scalabili, sicure e ottimizzate per convertire i visitatori in clienti.",
    features: ["Custom Development", "Frontend & Backend", "CMS Integration", "Web Apps"],
    icon: "M20 16V4a2 2 0 00-2-2H6a2 2 0 00-2 2v12m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0H4" 
  },
  { 
    title: "Digital Strategy", 
    cat: "Foundation", 
    desc: "Definiamo il percorso verso il successo del tuo brand.", 
    details: "Analizziamo il mercato, i competitor e il tuo target per definire una strategia digitale su misura. Trasformiamo gli obiettivi di business in piani d'azione concreti e misurabili.",
    features: ["Market Analysis", "Brand Positioning", "Digital Roadmap", "Growth Hacking"],
    icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" 
  },
  { 
    title: "UI/UX Design", 
    cat: "Experience", 
    desc: "Progettiamo interfacce che mettono l'emozione al centro.", 
    details: "Creiamo esperienze utente intuitive e coinvolgenti. Attraverso wireframing, prototipazione e user testing, disegniamo interfacce che non sono solo belle da vedere, ma facili e piacevoli da usare.",
    features: ["User Research", "Wireframing", "Prototyping", "Design Systems"],
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
  },
  { 
    title: "Content Creation", 
    cat: "Production", 
    desc: "Raccontiamo la tua realtà attraverso storytelling video.", 
    details: "Produciamo contenuti multimediali di alta qualità che catturano l'attenzione. Dallo storytelling video alla fotografia, creiamo asset visivi che potenziano la comunicazione del tuo brand.",
    features: ["Video Production", "Photography", "Copywriting", "Art Direction"],
    icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
  },
  { 
    title: "Motion Design", 
    cat: "Animation", 
    desc: "Diamo vita alle tue idee con grafiche in movimento.", 
    details: "Aggiungiamo una dimensione dinamica alla tua comunicazione. Animazioni 2D e 3D che spiegano concetti complessi, arricchiscono l'interfaccia utente e rendono i tuoi contenuti social impossibili da ignorare.",
    features: ["2D Animation", "3D Motion", "Micro-interactions", "Explainer Videos"],
    icon: "M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4" 
  },
  { 
    title: "SEO & Performance", 
    cat: "Data", 
    desc: "Scaliamo i risultati attraverso dati e ottimizzazione.", 
    details: "Ottimizziamo la tua presenza online per garantire la massima visibilità sui motori di ricerca. Miglioriamo le performance tecniche del sito per offrire un'esperienza utente veloce e fluida.",
    features: ["Technical SEO", "On-page Optimization", "Performance Tuning", "Analytics"],
    icon: "M16 8v8m-4-5v5m-4-2v2M4 21h16a2 2 0 002-2V5a2 2 0 00-2-2H4a2 2 0 00-2 2v14a2 2 0 002 2z" 
  },
  { 
    title: "3D Rendering", 
    cat: "Future", 
    desc: "Creiamo mondi tridimensionali e visioni fotorealistiche.", 
    details: "Realizziamo visualizzazioni 3D fotorealistiche per prodotti, architettura e concept design. Trasformiamo le tue idee in immagini tangibili prima ancora che esistano nella realtà.",
    features: ["Product Visualization", "Architectural Viz", "3D Modeling", "Virtual Environments"],
    icon: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" 
  }
];

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [activeService, setActiveService] = useState(null);
  const scrollRef = React.useRef(null);
  const servicesScrollRef = React.useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const lenis = useLenis();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getProjects();
        if (response.status === "success") {
          setProjects(response.data);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);

  // Lock body scroll and force navbar white when modal is open (Mobile Only)
  useEffect(() => {
    const handleState = () => {
      const isMobile = window.innerWidth < 1024;
      
      // 1. Scroll Lock
      if (activeService !== null && isMobile) {
        document.body.style.overflow = 'hidden';
        lenis?.stop();
      } else {
        document.body.style.overflow = 'auto';
        lenis?.start();
      }

      // 2. Navbar Color Force
      if (activeService !== null && isMobile) {
        window.dispatchEvent(new CustomEvent("nav-force-white", { detail: true }));
      } else {
        window.dispatchEvent(new CustomEvent("nav-force-white", { detail: false }));
      }
    };

    handleState();
    window.addEventListener('resize', handleState);

    return () => {
      document.body.style.overflow = 'auto';
      lenis?.start();
      window.dispatchEvent(new CustomEvent("nav-force-white", { detail: false }));
      window.removeEventListener('resize', handleState);
    };
  }, [activeService, lenis]);

  const handleMouseMoveSection = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.6;
      const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const scrollServices = (direction) => {
    if (servicesScrollRef.current) {
        const { scrollLeft, clientWidth } = servicesScrollRef.current;
        const scrollAmount = clientWidth * 0.7; // Scroll 70% of view
        const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
        servicesScrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const clientLogos = [
    "https://blendstudio.it/wp-content/uploads/2023/08/emilia-wine-experience-1.jpg",
    "https://blendstudio.it/wp-content/uploads/2024/01/cucine-da-incubo-logo2-1.jpg",
    "https://blendstudio.it/wp-content/uploads/2021/11/onestigroup-02.png",
    neroBucato,
    medirocca,
    piacenzaNero
  ];

  const clients = clientLogos.map((logo, index) => (
    <div 
      key={index} 
      className="group flex items-center justify-center h-24 w-40 md:w-64 mx-8 md:mx-12 cursor-pointer"
    >
      <img 
        src={logo} 
        alt={`Client ${index}`} 
        className="max-h-full max-w-full object-contain grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" 
      />
    </div>
  ));

  return (
    <PageTransition>
      <div className="w-full overflow-hidden bg-white">
        
        {/* --- HERO SECTION --- */}
        <header className="relative h-screen flex flex-col justify-center px-6 md:px-20 overflow-hidden nav-dark-section">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover z-0"
          >
            <source src="https://blendstudio.it/wp-content/uploads/2024/01/Blend-Showreel_V5.mp4" type="video/mp4" />
          </video>
          
          <div className="absolute inset-0 bg-black/40 z-0"></div>

          <div className="max-w-[90rem] mt-10 md:mt-0 z-10 relative pb-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex items-center gap-4 mb-6 md:mb-10"
            >
              <div className="h-[2px] w-12 bg-white"></div>
              <span className="text-white/90 font-bold uppercase tracking-[0.2em] text-xs md:text-sm">
                Digital Creative Experience
              </span>
            </motion.div>

            <div className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] xl:text-[12rem] font-extrabold leading-[0.85] tracking-normal text-white">
              <div className="mb-2"><RevealText text="WE CRAFT" delay={0.2} /></div>
              <div className="text-white/80 mb-2">
                <RevealText text="DIGITAL" delay={0.4} />
              </div>
              <RevealText text="EMOTIONS" delay={0.6} />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
            className="absolute bottom-6 md:bottom-10 left-6 md:left-20 flex flex-col items-center gap-2 z-10"
          >
            <span className="text-[10px] uppercase tracking-widest text-white font-bold rotate-90 origin-left translate-x-4">Scroll</span>
            <div className="w-[1px] h-10 md:h-16 bg-white/50 mt-8"></div>
          </motion.div>
        </header>


        {/* --- STATEMENT SECTION --- */}
        <section className="py-32 md:py-48 px-6 md:px-20 bg-white relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
            <div className="md:col-span-4 sticky top-32">
              <span className="block w-3 h-3 bg-blend rounded-full mb-4"></span>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Lo Studio</h3>
            </div>
            <div className="md:col-span-8">
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                <p className="text-4xl md:text-6xl lg:text-7xl font-black text-blend leading-[1.1] mb-12 tracking-tighter uppercase italic">
                  Non creiamo solo siti web. <br />
                  <span className="text-blend-light/60">Costruiamo ecosistemi</span> digitali.
                </p>
                <p className="text-xl md:text-2xl text-gray-500 leading-relaxed max-w-2xl font-medium">
                  In un mondo rumoroso, il silenzio del buon design è l'unico modo per farsi ascoltare. 
                  Lavoriamo all'intersezione tra estetica e funzionalità.
                </p>
              </motion.div>
            </div>
          </div>
        </section>


        {/* --- SERVICES PREVIEW (Ultra-Modern Redesign) --- */}
        <section 
          className="py-32 md:py-60 bg-white border-y border-gray-100 relative overflow-hidden group/section"
          onMouseMove={handleMouseMoveSection}
        >
           {/* Dynamic Spotlight Effect */}
           <motion.div 
             className="absolute pointer-events-none z-0 w-[600px] h-[600px] bg-blend-light/10 rounded-full blur-[120px] hidden lg:block"
             animate={{ 
               x: mousePos.x - 300, 
               y: mousePos.y - 300 
             }}
             transition={{ type: "spring", stiffness: 150, damping: 30, mass: 0.2 }}
           />

           <div className="px-6 md:px-20 mb-32 flex flex-col md:flex-row justify-between items-end gap-10 relative z-10">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                 <h2 className="text-6xl md:text-8xl lg:text-[9rem] font-black text-blend uppercase tracking-tighter italic leading-none">Services</h2>
                 <div className="flex items-center gap-4 mt-6">
                    <div className="h-[2px] w-12 bg-blend-light"></div>
                    <p className="text-blend-light font-black uppercase tracking-[0.4em] text-xs md:text-sm">Innovazione & Design</p>
                 </div>
              </motion.div>
              <Link to="/services" className="group/btn flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.5em] text-blend relative z-10">
                 <span className="border-b-2 border-blend pb-2 group-hover/btn:border-blend-light transition-colors">Esplora expertise</span>
                 <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center group-hover/btn:bg-blend group-hover/btn:text-white transition-all">→</div>
              </Link>
           </div>

           <div className="px-6 md:px-12 xl:px-20 relative z-10 min-h-[600px]">
             {/* Mobile/Tablet Arrows for Services */}
             <div className="absolute top-[20%] -translate-y-1/2 left-0 w-full z-20 flex justify-between px-2 pointer-events-none lg:hidden">
                <button 
                  onClick={() => scrollServices('left')}
                  className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-lg pointer-events-auto border border-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
                  </svg>
                </button>
                <button 
                  onClick={() => scrollServices('right')}
                  className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-lg pointer-events-auto border border-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                  </svg>
                </button>
             </div>
             
             <LayoutGroup>
               <AnimatePresence>
                 {activeService === null ? (
                   <motion.div 
                     layout
                     ref={servicesScrollRef}
               className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 hide-scrollbar md:overflow-visible snap-x snap-mandatory pb-10 md:pb-0"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     transition={{ duration: 0.5 }}
                   >
                     {servicesShort.map((service, i) => (
                       <motion.div
                         layoutId={`card-${i}`}
                         key={i}
                         onClick={() => setActiveService(i)}
                         initial={{ opacity: 0, y: 40 }}
                         whileInView={{ opacity: 1, y: 0 }}
                         viewport={{ once: true }}
                         transition={{ delay: i * 0.05, duration: 0.6 }}
                         whileHover={{ y: -15, transition: { duration: 0.3 } }}
                         className="group flex-shrink-0 w-[85vw] md:w-auto snap-start relative p-8 md:p-10 bg-white border border-gray-100 hover:border-blend-light/30 hover:shadow-[0_30px_60px_-15px_rgba(47,101,128,0.15)] rounded-[2.5rem] overflow-hidden cursor-pointer"
                       >
                         {/* Background Number */}
                         <motion.span 
                           layoutId={`number-${i}`}
                           className="absolute -right-4 -top-4 text-9xl font-black text-blend/[0.03] group-hover:text-blend/[0.08] transition-colors duration-700 italic select-none"
                         >
                            0{i+1}
                         </motion.span>

                         {/* Icon */}
                         <motion.div 
                           layoutId={`icon-${i}`}
                           className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-blend group-hover:text-white transition-colors duration-500 shadow-inner"
                         >
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-[15deg] group-hover:scale-110 transition-transform duration-500">
                               <path d={service.icon}></path>
                            </svg>
                         </motion.div>

                         <motion.h3 
                           layoutId={`title-${i}`}
                           className="text-2xl md:text-3xl font-black text-blend uppercase tracking-tighter leading-tight group-hover:text-blend-light transition-colors mb-6"
                         >
                           {service.title}
                         </motion.h3>
                         
                         <motion.p 
                           layoutId={`desc-${i}`}
                           className="text-gray-400 group-hover:text-gray-600 transition-colors text-sm leading-relaxed mb-10 font-medium"
                         >
                            {service.desc}
                         </motion.p>

                         <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-blend-light/60 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500">
                            <span>Scopri di più</span>
                            <div className="w-6 h-[1px] bg-blend-light"></div>
                         </div>
                       </motion.div>
                     ))}
                   </motion.div>
                 ) : (
                   <motion.div
                     layoutId={`card-${activeService}`}
                     className="fixed inset-0 z-[9999] w-full h-full overflow-y-auto bg-[#2f6580] rounded-none lg:relative lg:inset-auto lg:w-full lg:h-auto lg:rounded-[3rem] lg:overflow-hidden lg:z-20 cursor-default"
                     initial={{ borderRadius: "2.5rem" }}
                     animate={{ borderRadius: window.innerWidth >= 1024 ? "3rem" : "0px" }}
                     transition={{ type: "spring", stiffness: 300, damping: 30 }}
                   >
                     {/* Close Button - Top Level */}
                     <motion.button 
                       initial={{ opacity: 0, scale: 0.8 }}
                       animate={{ opacity: 1, scale: 1 }}
                       transition={{ delay: 0.3 }}
                       onClick={(e) => { e.stopPropagation(); setActiveService(null); }}
                       whileHover={{ scale: 1.1, rotate: 90, backgroundColor: "#f3f4f6" }}
                       whileTap={{ scale: 0.9 }}
                       className="fixed top-28 right-6 lg:absolute lg:top-10 lg:right-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white text-[#2f6580] flex items-center justify-center transition-all duration-300 z-[10000] shadow-2xl border-none"
                     >
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 md:w-7 md:h-7">
                         <line x1="18" y1="6" x2="6" y2="18"></line>
                         <line x1="6" y1="6" x2="18" y2="18"></line>
                       </svg>
                     </motion.button>
                     <div className="grid grid-cols-1 lg:grid-cols-2 min-h-0 lg:min-h-[600px] pb-60 lg:pb-0">
                        {/* Left Side - Visual & Title */}
                        <div className="p-6 pt-24 md:p-20 flex flex-col justify-between relative overflow-hidden">
                           {/* Decorative Blob */}
                           <motion.div 
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                              className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] pointer-events-none"
                           />
                           
                           <div className="relative z-10">
                              <motion.div 
                                layoutId={`icon-${activeService}`}
                                className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mb-6 md:mb-10 text-white border border-white/20 shadow-lg"
                              >
                                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d={servicesShort[activeService].icon}></path>
                                  </svg>
                              </motion.div>
                              
                              <motion.span 
                                layoutId={`number-${activeService}`}
                                className="text-lg md:text-xl font-black text-blend-light mb-2 md:mb-4 block tracking-widest"
                              >
                                0{activeService + 1}
                              </motion.span>
                              
                              <motion.h3 
                                layoutId={`title-${activeService}`}
                                className="text-2xl md:text-7xl font-black text-white uppercase tracking-tighter italic leading-[0.9] mb-4 md:mb-6"
                              >
                                {servicesShort[activeService].title}
                              </motion.h3>
                              
                              <motion.p 
                                layoutId={`desc-${activeService}`}
                                className="text-white/70 text-xs md:text-xl font-medium max-w-md"
                              >
                                {servicesShort[activeService].cat}
                              </motion.p>
                           </div>

                           <motion.div 
                             initial={{ opacity: 0, y: 20 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: 0.4, duration: 0.6 }}
                             className="mt-8 md:mt-12 relative z-10 hidden md:block"
                           >
                             <div className="h-[1px] w-20 bg-white/20 mb-6"></div>
                             <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.3em]">
                               Blend Studio Services
                             </p>
                           </motion.div>
                        </div>

                        {/* Right Side - Details */}
                        <div className="bg-white/5 backdrop-blur-sm p-6 pb-40 md:p-20 flex flex-col justify-start lg:justify-center relative border-l border-white/5">
                           {/* Content... */}
                           <motion.div
                             initial={{ opacity: 0, x: 30 }}
                             animate={{ opacity: 1, x: 0 }}
                             transition={{ delay: 0.2, type: "spring", stiffness: 50 }}
                           >
                              <h4 className="text-base md:text-2xl text-white font-bold mb-2 md:mb-8 mt-2 md:mt-0">What we do</h4>
                              <p className="text-white/90 text-[13px] md:text-2xl leading-relaxed mb-4 md:mb-12 font-medium">
                                {servicesShort[activeService].details}
                              </p>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 md:gap-y-6 mb-6 md:mb-12">
                                {servicesShort[activeService].features?.map((feature, idx) => (
                                  <motion.div 
                                    key={idx} 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + (idx * 0.1) }}
                                    className="flex items-center gap-3"
                                  >
                                     <div className="w-2 h-2 bg-blend-light rounded-full shadow-[0_0_10px_rgba(47,101,128,0.8)]"></div>
                                     <span className="text-white font-medium text-[12px] md:text-base">{feature}</span>
                                  </motion.div>
                                ))}
                              </div>

                              <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="mt-4 md:mt-14"
                              >
                                 <Link to="/contact" className="group/modal-btn inline-flex items-center gap-4 px-6 py-3 md:px-8 md:py-4 bg-white text-blend font-black text-[10px] md:text-xs uppercase tracking-[0.2em] rounded-full hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300">
                                   <span>Start Project</span>
                                   <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-blend/10 flex items-center justify-center group-hover/modal-btn:bg-blend group-hover/modal-btn:text-white transition-all duration-300">
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="md:w-4 md:h-4 group-hover/modal-btn:translate-x-0.5 transition-transform">
                                         <line x1="5" y1="12" x2="19" y2="12"></line>
                                         <polyline points="12 5 19 12 12 19"></polyline>
                                      </svg>
                                   </div>
                                 </Link>
                              </motion.div>
                              
                              {/* Extra spacer for small mobiles */}
                              <div className="h-24 lg:hidden"></div>
                           </motion.div>
                        </div>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
             </LayoutGroup>
           </div>
        </section>


        {/* --- PROJECTS SLIDER --- */}
        <section className="py-32 md:py-48 bg-white overflow-hidden relative group/slider-section">
            <div className="px-6 md:px-20 mb-20 flex flex-col md:flex-row justify-between items-end gap-10">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                    <h2 className="text-5xl md:text-8xl font-black text-blend uppercase tracking-tighter italic">Works</h2>
                    <p className="text-gray-400 mt-4 text-xl font-medium">L'eccellenza in ogni pixel.</p>
                </motion.div>
            </div>

            {/* Container centrato per lo slider - Allargato per card più grandi */}
            <div className="max-w-[110rem] mx-auto px-6 md:px-10 lg:px-20 relative">
                
                {/* Navigation Arrows at Edges */}
                <div className="absolute top-[35%] -translate-y-1/2 left-0 xl:-left-12 z-30 pointer-events-none w-full xl:w-[calc(100%+6rem)] hidden lg:flex justify-between px-4 xl:px-0">
                    <button 
                      onClick={() => scroll('left')}
                      className="w-14 h-14 !bg-white !text-[#2f6580] rounded-full flex items-center justify-center hover:!bg-gray-100 transition-all duration-500 group shadow-2xl pointer-events-auto"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform !stroke-[#2f6580]">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                      </svg>
                    </button>
                    <button 
                      onClick={() => scroll('right')}
                      className="w-14 h-14 !bg-white !text-[#2f6580] rounded-full flex items-center justify-center hover:!bg-gray-100 transition-all duration-500 group shadow-2xl pointer-events-auto"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform !stroke-[#2f6580]">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </button>
                </div>

                <div 
                  ref={scrollRef}
                  className="flex overflow-x-auto hide-scrollbar gap-8 md:gap-12 snap-x snap-mandatory relative z-10 pb-10"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                   {projects.map((project, index) => (
                      <div key={project.id || index} className="flex-shrink-0 w-[85vw] md:w-[calc(50%-1.5rem)] lg:w-[calc(33.333%-2rem)] snap-start group/card relative">
                        <Link to={`/project/${project.id}`} className="block">
                          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-gray-100 shadow-lg">
                            <motion.img 
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.6 }}
                              src={project.cover_image || project.img} 
                              alt={project.title} 
                              className="w-full h-full object-cover xl:grayscale xl:group-hover/card:grayscale-0 transition-all duration-500"
                            />
                            <div className="absolute inset-0 bg-blend-dark/20 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
                               <span className="px-8 py-3 bg-white text-blend font-black text-[10px] uppercase tracking-[0.3em] rounded-full shadow-2xl">Explore Case</span>
                            </div>
                          </div>
                          <div className="mt-8 px-2">
                            <h3 className="text-2xl md:text-3xl font-black text-blend tracking-tighter uppercase italic">{project.title}</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-4 border-l-2 border-blend-light pl-4">
                              {project.services || project.cat}
                            </p>
                          </div>
                        </Link>
                      </div>
                   ))}
                </div>
            </div>
        </section>


        {/* --- PARTNERS SECTION --- */}
        <section className="py-32 md:py-48 bg-white text-blend overflow-hidden border-t border-gray-100">
           <div className="px-6 md:px-20 mb-20 flex flex-col md:flex-row justify-between items-end gap-10">
              <div>
                  <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic mb-6">Partners</h2>
                  <p className="text-gray-400 text-xl font-medium max-w-md leading-relaxed">
                      Collaboriamo con brand ambiziosi per ridefinire i confini del possibile.
                  </p>
              </div>
              <div className="hidden md:block h-[1px] flex-grow bg-gray-200 mx-10 mb-4"></div>
           </div>
           
           <div className="w-full">
               {/* Mobile: Manual Scroll */}
               <div className="flex overflow-x-auto md:hidden hide-scrollbar gap-8 px-6 snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                   {clients.map((client, i) => (
                       <div key={i} className="flex-shrink-0 w-40 snap-start">
                           {client}
                       </div>
                   ))}
               </div>

               {/* Desktop: Auto Scroll Marquee */}
               <div className="hidden md:block">
                   <Marquee items={clients} speed={20} pauseOnHover={true} />
               </div>
           </div>
        </section>

        {/* --- BIG CTA SECTION (Now at the very bottom) --- */}
        <section className="py-32 md:py-60 bg-blend text-white flex flex-col items-center justify-center text-center overflow-hidden relative nav-dark-section">
            <div className="absolute inset-0 opacity-10 font-black text-[25vw] leading-none pointer-events-none select-none flex items-center justify-center text-white">
              TALK
            </div>

            <p className="text-xs md:text-sm font-black uppercase tracking-[0.4em] opacity-70 mb-12 relative z-10">Hai un progetto in mente?</p>
            
            <Link to="/contact" className="group relative z-10">
                <h2 className="text-6xl md:text-[10rem] font-black tracking-tighter hover:italic transition-all duration-500 uppercase">
                    LET'S TALK
                </h2>
                <div className="h-1 w-0 bg-white group-hover:w-full transition-all duration-500 mt-4"></div>
            </Link>
        </section>

      </div>
    </PageTransition>
  );
};

export default Home;