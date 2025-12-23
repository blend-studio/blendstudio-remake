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
  { title: "Brand Identity", cat: "Visual", desc: "Creiamo identità visive uniche che rimangono impresse." },
  { title: "Web Experience", cat: "Technology", desc: "Sviluppiamo ecosistemi digitali d'avanguardia e performanti." },
  { title: "Digital Strategy", cat: "Foundation", desc: "Definiamo il percorso verso il successo del tuo brand." },
  { title: "UI/UX Design", cat: "Experience", desc: "Progettiamo interfacce che mettono l'emozione al centro." },
  { title: "Content Creation", cat: "Production", desc: "Raccontiamo la tua realtà attraverso storytelling video." },
  { title: "Motion Design", cat: "Animation", desc: "Diamo vita alle tue idee con grafiche in movimento." },
  { title: "SEO & Performance", cat: "Data", desc: "Scaliamo i risultati attraverso dati e ottimizzazione." },
  { title: "3D Rendering", cat: "Future", desc: "Creiamo mondi tridimensionali e visioni fotorealistiche." }
];

const Home = () => {
  const [projects, setProjects] = useState([]);
  const scrollRef = React.useRef(null);
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


        {/* --- SERVICES PREVIEW (Redesigned) --- */}
        <section className="py-24 md:py-48 bg-blend-bg border-y border-gray-100 relative overflow-hidden">
           {/* Animated Background Glows */}
           <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
              <motion.div 
                animate={{ x: [0, 50, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 15, repeat: Infinity }}
                className="absolute top-0 -left-20 w-[600px] h-[600px] bg-blend-light rounded-full blur-[120px]"
              />
           </div>

           <div className="px-6 md:px-20 mb-24 flex flex-col md:flex-row justify-between items-end gap-10 relative z-10">
              <div>
                 <h2 className="text-5xl md:text-8xl font-black text-blend uppercase tracking-tighter italic">Services</h2>
                 <p className="text-blend-light/60 mt-4 text-xl font-bold uppercase tracking-widest">Expertise & Innovation</p>
              </div>
              <Link to="/services" className="text-[10px] font-black uppercase tracking-[0.4em] text-blend border-b-2 border-blend pb-2 hover:text-blend-light hover:border-blend-light transition-all">
                 View all services
              </Link>
           </div>

           <div className="px-6 md:px-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 relative z-10">
              {servicesShort.map((service, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative p-8 bg-white/50 backdrop-blur-sm border border-gray-100 hover:bg-white hover:shadow-2xl transition-all duration-500 rounded-3xl"
                >
                   <div className="absolute top-0 left-0 w-1 h-0 bg-blend group-hover:h-full transition-all duration-500 rounded-full"></div>
                   <span className="text-[10px] font-black text-blend-light uppercase tracking-widest mb-6 block opacity-40 group-hover:opacity-100 transition-opacity">0{i+1} — {service.cat}</span>
                   <h3 className="text-2xl md:text-3xl font-black text-blend uppercase tracking-tighter group-hover:text-blend-light transition-colors mb-6">{service.title}</h3>
                   <p className="text-gray-400 group-hover:text-gray-600 transition-colors text-sm leading-relaxed mb-8">{service.desc}</p>
                   <Link to="/services" className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-blend hover:text-blend-light transition-all">
                      <span>Scopri di più</span>
                      <div className="w-8 h-[1px] bg-blend group-hover:w-12 transition-all"></div>
                   </Link>
                </motion.div>
              ))}
           </div>
        </section>


        {/* --- PROJECTS SLIDER --- */}
        <section className="py-32 md:py-48 bg-white overflow-hidden relative">
            <div className="px-6 md:px-20 mb-20 flex flex-col md:flex-row justify-between items-end gap-10">
                <div>
                    <h2 className="text-5xl md:text-8xl font-black text-blend uppercase tracking-tighter italic">Works</h2>
                    <p className="text-gray-400 mt-4 text-xl font-medium">L'eccellenza in ogni pixel.</p>
                </div>
                <div className="flex gap-4">
                    <button 
                      onClick={() => scroll('left')}
                      className="w-14 h-14 !bg-[#2f6580] !text-white rounded-full flex items-center justify-center hover:!bg-[#4a8fa3] transition-all duration-500 group shadow-lg"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                      </svg>
                    </button>
                    <button 
                      onClick={() => scroll('right')}
                      className="w-14 h-14 !bg-[#2f6580] !text-white rounded-full flex items-center justify-center hover:!bg-[#4a8fa3] transition-all duration-500 group shadow-lg"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </button>
                </div>
            </div>

            <div 
              ref={scrollRef}
              className="flex overflow-x-auto hide-scrollbar gap-8 px-6 md:px-20 snap-x snap-mandatory relative z-10"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
               {projects.map((project, index) => (
                  <div key={project.id || index} className="flex-shrink-0 w-[85vw] md:w-[600px] snap-start group/card relative">
                    <Link to={`/project/${project.id}`} className="block">
                      <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-gray-100 shadow-lg">
                        <motion.img 
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.6 }}
                          src={project.cover_image || project.img} 
                          alt={project.title} 
                          className="w-full h-full object-cover grayscale group-hover/card:grayscale-0 transition-all duration-500"
                        />
                        <div className="absolute inset-0 bg-blend-dark/20 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
                           <span className="px-8 py-3 bg-white text-blend font-black text-[10px] uppercase tracking-[0.3em] rounded-full shadow-2xl">Explore Case</span>
                        </div>
                      </div>
                      <div className="mt-8">
                        <h3 className="text-2xl md:text-4xl font-black text-blend tracking-tighter uppercase italic">{project.title}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-4 border-l-2 border-blend-light pl-4">
                          {project.services || project.cat}
                        </p>
                      </div>
                    </Link>
                  </div>
               ))}
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
               <Marquee items={clients} speed={20} pauseOnHover={true} />
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