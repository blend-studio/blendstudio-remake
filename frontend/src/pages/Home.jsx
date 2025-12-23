import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import PageTransition from "../components/Transition";
import { RevealText } from "../components/ui/RevealText";
import Marquee from "../components/ui/Marquee";
import { getProjects } from "../services/api";

// Import local logos
import neroBucato from "../assets/images/loghi partner/aran/NERO-BUCATO.svg";
import medirocca from "../assets/images/loghi partner/02-logo-vector-medirocca.svg";
import piacenzaNero from "../assets/images/loghi partner/PIACENZA_NERO.png";

const servicesShort = [
  { title: "Brand Identity", cat: "Visual", desc: "Creiamo identità visive uniche che rimangono impresse.", icon: "M12 2L2 7l10 10 10-5-10-10zM2 17l10 5 10-5M2 12l10 5 10-5" },
  { title: "Web Experience", cat: "Technology", desc: "Sviluppiamo ecosistemi digitali d'avanguardia e performanti.", icon: "M20 16V4a2 2 0 00-2-2H6a2 2 0 00-2 2v12m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0H4" },
  { title: "Digital Strategy", cat: "Foundation", desc: "Definiamo il percorso verso il successo del tuo brand.", icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" },
  { title: "UI/UX Design", cat: "Experience", desc: "Progettiamo interfacce che mettono l'emozione al centro.", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  { title: "Content Creation", cat: "Production", desc: "Raccontiamo la tua realtà attraverso storytelling video.", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
  { title: "Motion Design", cat: "Animation", desc: "Diamo vita alle tue idee con grafiche in movimento.", icon: "M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4" },
  { title: "SEO & Performance", cat: "Data", desc: "Scaliamo i risultati attraverso dati e ottimizzazione.", icon: "M16 8v8m-4-5v5m-4-2v2M4 21h16a2 2 0 002-2V5a2 2 0 00-2-2H4a2 2 0 00-2 2v14a2 2 0 002 2z" },
  { title: "3D Rendering", cat: "Future", desc: "Creiamo mondi tridimensionali e visioni fotorealistiche.", icon: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" }
];

const Home = () => {
  const [projects, setProjects] = useState([]);
  const scrollRef = React.useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -100]);

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

                      <div className="px-6 md:px-12 xl:px-20 flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 relative z-10 hide-scrollbar md:overflow-visible snap-x snap-mandatory pb-10 md:pb-0">
                         {servicesShort.map((service, i) => (
                           <motion.div                    key={i} 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.6 }}
                  whileHover={{ y: -15 }}
                  className="group flex-shrink-0 w-[85vw] md:w-auto snap-start relative p-8 md:p-10 bg-white border border-gray-100 hover:border-blend-light/30 hover:shadow-[0_30px_60px_-15px_rgba(47,101,128,0.15)] transition-all duration-700 rounded-[2.5rem] overflow-hidden"
                >
                   {/* Background Number */}
                   <span className="absolute -right-4 -top-4 text-9xl font-black text-blend/[0.03] group-hover:text-blend/[0.08] transition-colors duration-700 italic select-none">
                      0{i+1}
                   </span>

                   {/* Icon */}
                   <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-blend group-hover:text-white transition-all duration-500 shadow-inner">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-[15deg] group-hover:scale-110 transition-transform duration-500">
                         <path d={service.icon}></path>
                      </svg>
                   </div>

                   <h3 className="text-2xl md:text-3xl font-black text-blend uppercase tracking-tighter leading-tight group-hover:text-blend-light transition-colors mb-6">{service.title}</h3>
                   <p className="text-gray-400 group-hover:text-gray-600 transition-colors text-sm leading-relaxed mb-10 font-medium">
                      {service.desc}
                   </p>

                   <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-blend-light/60 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500">
                      <span>Inizia ora</span>
                      <div className="w-6 h-[1px] bg-blend-light"></div>
                   </div>
                </motion.div>
              ))}
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
                      className="w-14 h-14 !bg-[#2f6580] !text-white rounded-full flex items-center justify-center hover:!bg-[#4a8fa3] transition-all duration-500 group shadow-2xl pointer-events-auto"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                      </svg>
                    </button>
                    <button 
                      onClick={() => scroll('right')}
                      className="w-14 h-14 !bg-[#2f6580] !text-white rounded-full flex items-center justify-center hover:!bg-[#4a8fa3] transition-all duration-500 group shadow-2xl pointer-events-auto"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
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