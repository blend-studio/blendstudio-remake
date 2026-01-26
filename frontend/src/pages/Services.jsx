import React, { useState, useEffect, useRef } from "react";
import { motion, useSpring, useInView } from "framer-motion";
import PageTransition from "../components/Transition";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { RevealText } from "../components/ui/RevealText";
import backgroundVideo from "../assets/images/sfondo-blend.mp4";

// --- DATI SERVIZI ---
const services = [
  {
    id: 1,
    title: "Strategy",
    cat: "Foundation",
    description: "Definiamo il percorso verso il successo attraverso analisi di mercato, posizionamento di marca e strategie digitali su misura.",
    tags: ["Market Analysis", "Brand Positioning", "Roadmap", "KPIs"]
  },
  {
    id: 2,
    title: "Brand Identity",
    cat: "Visual",
    description: "Creiamo identità visive uniche che raccontano la tua storia e rimangono impresse nella mente del tuo pubblico.",
    tags: ["Logo Design", "Visual System", "Rebranding", "Guidelines"]
  },
  {
    id: 3,
    title: "Web Development",
    cat: "Technology",
    description: "Sviluppiamo ecosistemi digitali performanti, sicuri e scalabili, utilizzando le tecnologie più all'avanguardia.",
    tags: ["Frontend", "Backend", "React/Vue", "Scalability"]
  },
  {
    id: 4,
    title: "UI/UX Design",
    cat: "Experience",
    description: "Progettiamo interfacce intuitive e percorsi utente memorabili che mettono l'emozione al centro dell'interazione.",
    tags: ["Wireframing", "Prototyping", "User Testing", "Interface"]
  },
  {
    id: 5,
    title: "E-commerce",
    cat: "Conversion",
    description: "Realizziamo shop online ottimizzati per la vendita, focalizzati sulla massimizzazione delle conversioni e della CX.",
    tags: ["Shopify", "WooCommerce", "Custom Checkout", "CRO"]
  },
  {
    id: 6,
    title: "Graphic Design",
    cat: "Visual",
    description: "Trasformiamo concetti complessi in immagini iconiche attraverso un design grafico pulito e illustrazioni originali.",
    tags: ["Editorial", "Packaging", "Illustration", "Print"]
  },
  {
    id: 7,
    title: "Advertising",
    cat: "Growth",
    description: "Massimizziamo la visibilità del tuo brand attraverso campagne creative e data-driven sui principali canali digitali.",
    tags: ["Meta Ads", "Google Ads", "LinkedIn Ads", "Retargeting"]
  },
  {
    id: 8,
    title: "Social Media",
    cat: "Engagement",
    description: "Gestiamo la tua presenza sui social media creando contenuti coinvolgenti e costruendo community fedeli.",
    tags: ["Content Strategy", "Community Management", "Reels/TikTok", "Copywriting"]
  },
  {
    id: 9,
    title: "SEO & Performance",
    cat: "Data",
    description: "Scaliamo i risultati attraverso l'ottimizzazione per i motori di ricerca e il monitoraggio costante delle performance.",
    tags: ["On-Page SEO", "Technical Audit", "Speed Opt", "Analytics"]
  },
  {
    id: 10,
    title: "Foto e Video",
    cat: "Content",
    description: "Raccontiamo la tua realtà attraverso produzioni multimediali di alta qualità, dallo shooting allo storytelling video.",
    tags: ["Shooting", "Corporate Video", "Editing", "Color Grading"]
  },
  {
    id: 11,
    title: "Motion Design",
    cat: "Animation",
    description: "Diamo vita alle tue idee con animazioni fluide e grafiche in movimento che catturano l'attenzione.",
    tags: ["2D Animation", "3D Motion", "Micro-interactions", "Lottie"]
  },
  {
    id: 12,
    title: "3D Rendering",
    cat: "Future",
    description: "Creiamo mondi digitali tridimensionali e visualizzazioni fotorealistiche per prodotti e architetture d'avanguardia.",
    tags: ["Product Viz", "Architectural", "3D Assets", "Virtual Sets"]
  }
];

// --- COMPONENTE SINGOLO DETTAGLIO (SCROLL SPY) ---
const ServiceDetailItem = ({ service, index, setActiveIndex }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-50% 0px -50% 0px" });

  useEffect(() => {
    if (isInView) {
      setActiveIndex(index);
    }
  }, [isInView, index, setActiveIndex]);

  return (
    <div 
      ref={ref} 
      className="min-h-screen w-full flex flex-col justify-center px-8 md:px-20 py-20 border-l border-gray-100/50 bg-white"
    >
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: false, margin: "-20%" }} 
        >
            {/* Numero Sfondo Gigante */}
            <div className="text-[8rem] md:text-[12rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-gray-50 to-white stroke-text-light opacity-60 select-none mb-[-40px] md:mb-[-60px] ml-[-10px]">
                {index + 1 < 10 ? `0${index + 1}` : index + 1}
            </div>

            <div className="relative z-10 pl-4">
                <div className="flex items-center gap-4 mb-6">
                    <span className="px-4 py-2 bg-blend/5 text-blend font-bold text-[10px] uppercase tracking-[0.2em] rounded-full border border-blend/10">
                        {service.cat}
                    </span>
                </div>

                <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-blend mb-8 tracking-tighter uppercase italic leading-[0.95]">
                    {service.title}
                </h2>

                <div className="w-24 h-1.5 bg-gradient-to-r from-blend to-blend-light mb-10 rounded-full"></div>

                <p className="text-xl md:text-2xl font-medium text-gray-800 mb-8 leading-tight max-w-xl">
                    {service.description}
                </p>

                <div className="flex flex-wrap gap-3 mb-12">
                    {service.tags.map((tag, i) => (
                        <span key={i} className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 hover:border-blend/20 transition-colors cursor-default">
                            <span className="w-1.5 h-1.5 bg-blend-light rounded-full"></span>
                            {tag}
                        </span>
                    ))}
                </div>

                {/* BUTTON: Avvia Progetto (Scritta Bianca) */}
                <Link to="/contact" className="group inline-flex items-center gap-4 px-10 py-5 bg-blend text-white font-black uppercase tracking-[0.15em] text-xs rounded-full hover:bg-blend-dark hover:shadow-xl transition-all duration-300">
                    <span>Avvia Progetto</span>
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-blend transition-colors">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </div>
                </Link>
            </div>
        </motion.div>
    </div>
  );
};


const Services = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const totalItems = services.length;
  const anglePerItem = 360 / totalItems; 

  const rotation = useSpring(0, { stiffness: 40, damping: 20, mass: 1.5 });

  useEffect(() => {
    const targetRotation = -activeIndex * anglePerItem;
    rotation.set(targetRotation);
  }, [activeIndex, anglePerItem, rotation]);

  return (
    <PageTransition>
      <div className="w-full bg-white min-h-screen">
        
        {/* --- FULLSCREEN HERO --- */}
        <div className="relative h-screen flex flex-col justify-center px-6 md:px-20 overflow-hidden bg-black text-white nav-dark-section">
           <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-black">
             <video 
               autoPlay loop muted playsInline 
               className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover scale-[1.1] opacity-60"
             >
               <source src={backgroundVideo} type="video/mp4" />
             </video>
           </div>

           <div className="max-w-[90rem] w-full z-10 relative mt-10 md:mt-0 pb-20">
             <motion.div
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.5, duration: 0.8 }}
               className="flex items-center gap-4 mb-6 md:mb-10"
             >
               <div className="h-[2px] w-12 bg-white/60"></div>
               <span className="text-white/80 font-bold uppercase tracking-[0.2em] text-xs md:text-sm">
                 Our Expertise
               </span>
             </motion.div>

             <div className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] xl:text-[12rem] font-extrabold leading-[0.85] tracking-normal text-white">
               <RevealText text="ELEVATING" delay={0.2} />
               <div className="text-white/40">
                 <RevealText text="BRANDS" delay={0.4} />
               </div>
             </div>

             <div className="mt-16 max-w-2xl">
               <p className="text-xl md:text-3xl text-white/60 leading-tight font-medium">
                 Soluzioni digitali integrate per aziende ambiziose. 
                 Dalla strategia alla produzione d'eccellenza.
               </p>
             </div>
           </div>

           <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ delay: 1, duration: 2, repeat: Infinity }}
            className="absolute bottom-6 md:bottom-10 left-6 md:left-20 flex flex-col items-center gap-2 z-10"
          >
            <span className="text-[10px] uppercase tracking-widest text-white font-bold rotate-90 origin-left translate-x-4">Scroll</span>
            <div className="w-[1px] h-10 md:h-16 bg-white/30 mt-8"></div>
          </motion.div>
        </div>

        {/* --- MAIN CONTENT: STICKY WHEEL + LONG SCROLL --- */}
        <div className="relative w-full bg-white">
            <div className="flex flex-col lg:flex-row">
                
                {/* 1. LEFT: STICKY WHEEL */}
                <div className="hidden lg:flex w-1/2 h-screen sticky top-0 items-center justify-start overflow-hidden z-20 border-r border-gray-100">
                    
                    <div className="absolute -left-[20%] w-[80%] h-[80%] bg-blend/5 rounded-full blur-[100px] pointer-events-none"></div>

                    <motion.div 
                        style={{ rotate: rotation }}
                        className="absolute -left-[55vh] w-[110vh] h-[110vh] rounded-full bg-gradient-to-br from-[#2f6580] to-[#1a3b4b] flex items-center justify-center shadow-[50px_0_80px_-20px_rgba(47,101,128,0.4)] border-[1px] border-white/10 origin-center"
                    >
                        <div className="absolute inset-0 rounded-full border border-white/5 m-24"></div>
                        <div className="absolute inset-0 rounded-full border border-white/5 m-48 border-dashed opacity-30"></div>
                        
                        <div className="absolute w-[20vh] h-[20vh] rounded-full bg-[#1a3b4b] shadow-inner flex items-center justify-center border border-white/10 z-20">
                            <div className="w-[8vh] h-[8vh] rounded-full bg-[#2f6580] flex items-center justify-center shadow-[0_0_30px_rgba(47,101,128,0.8)]">
                                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                            </div>
                        </div>

                        {services.map((service, i) => {
                            const angle = i * anglePerItem;
                            const isActive = i === activeIndex;

                            return (
                            <motion.div
                                key={service.id}
                                className="absolute top-1/2 left-1/2 w-[55vh] h-[80px] flex items-center justify-end origin-left z-30"
                                style={{
                                    transform: `translateY(-50%) rotate(${angle}deg)`, 
                                }}
                            >
                                <div 
                                    className="flex items-center gap-6 pr-12 cursor-pointer group w-full justify-end h-full hover:bg-white/5 transition-colors rounded-l-full"
                                    onClick={() => {
                                        document.getElementById(`service-${i}`)?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                >
                                    <motion.span 
                                        className={`uppercase font-bold tracking-[0.15em] text-sm transition-all duration-500 ease-out ${isActive ? 'text-white translate-x-2' : 'text-white/30 group-hover:text-white/60'}`}
                                    >
                                        {service.title}
                                    </motion.span>
                                    
                                    <div className="relative">
                                        {isActive && (
                                            <motion.div 
                                                layoutId="activeGlow"
                                                className="absolute inset-0 bg-white blur-md rounded-full"
                                                transition={{ duration: 0.3 }}
                                            />
                                        )}
                                        <div className={`relative w-3 h-3 rounded-full transition-all duration-500 border border-white/20 ${isActive ? 'bg-white scale-125' : 'bg-[#1a3b4b]'}`}></div>
                                    </div>

                                    <motion.div 
                                        className={`absolute right-0 top-1/2 h-[1px] bg-white origin-right transition-all duration-500 ${isActive ? 'w-12 opacity-100' : 'w-0 opacity-0'}`}
                                    />
                                </div>
                            </motion.div>
                            );
                        })}
                    </motion.div>

                    <div className="absolute left-[54vh] top-1/2 -translate-y-1/2 z-30 pointer-events-none text-blend drop-shadow-md">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="transform -rotate-90"><path d="M12 2L2 22h20L12 2z"/></svg>
                    </div>
                </div>

                {/* 2. RIGHT: SCROLLABLE DETAILS */}
                <div className="w-full lg:w-1/2 relative z-10 bg-white">
                    <div className="lg:hidden px-8 pt-20 pb-10">
                        <h2 className="text-4xl font-black text-blend uppercase italic">Services</h2>
                    </div>

                    {services.map((service, index) => (
                        <div key={service.id} id={`service-${index}`}>
                            <ServiceDetailItem 
                                service={service} 
                                index={index} 
                                setActiveIndex={setActiveIndex} 
                            />
                        </div>
                    ))}
                </div>

            </div>
        </div>


       {/* --- CTA / FOOTER SECTION (SCRITTA BIANCA) --- */}
        <div className="py-40 md:py-60 bg-blend text-white text-center overflow-hidden relative nav-dark-section">
           <div className="absolute inset-0 opacity-10 font-black text-[30vw] leading-none pointer-events-none select-none flex items-center justify-center">
              PROJECT
           </div>
           <motion.div 
             animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
             transition={{ duration: 10, repeat: Infinity }}
             className="absolute -top-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-[100px]" 
           />
           <h2 className="text-5xl md:text-9xl font-black mb-12 tracking-tighter uppercase italic relative z-10">Let's create.</h2>
           <div className="relative z-10">
              <Link to="/contact" className="inline-block px-14 py-6 bg-transparent border-2 border-white text-white rounded-full font-black uppercase tracking-[0.3em] text-xs hover:bg-white hover:text-blend transition-all duration-300 shadow-2xl hover:scale-105">
                  Avvia un progetto
              </Link>
           </div>
        </div>

      </div>
    </PageTransition>
  );
};

export default Services;