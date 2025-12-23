import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageTransition from "../components/Transition";
import { RevealText } from "../components/ui/RevealText";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import TiltCard from "../components/ui/TiltCard";
import { getProjects } from "../services/api";
import liquidTexture from "../assets/images/blend-liquid-texture.jpg";
import backgroundVideo from "../assets/images/sfondo-blend.mp4";

const categories = ["All", "Web Design", "Branding", "Development", "Marketing"];

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getProjects();
        if (response.status === "success") {
            setProjects(response.data);
        }
      } catch (error) {
        console.error("Failed to load projects", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(p => filter === "All" || (p.services && p.services.includes(filter)) || p.cat === filter);

  return (
    <PageTransition>
      <div className="w-full bg-white min-h-screen">
        
        {/* --- FULLSCREEN HERO --- */}
        <div className="relative h-screen flex flex-col justify-center px-6 md:px-20 overflow-hidden bg-black nav-dark-section">
           {/* Background Video - Self Hosted */}
           <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-black">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline 
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
                  Selected Portfolio
                </span>
              </motion.div>

              <div className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] xl:text-[12rem] font-extrabold leading-[0.85] tracking-normal text-white">
                <RevealText text="CREATIVE" delay={0.2} />
                <div className="text-white/40">
                  <RevealText text="ARCHIVE" delay={0.4} />
                </div>
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

        <div className="py-20 md:py-40 px-6 md:px-20">
            {/* Filter Section */}
            <div className="mb-20">
                <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-gray-100 pb-10">
                   <div>
                      <h2 className="text-4xl font-bold text-blend uppercase tracking-tighter italic">Filtraggio</h2>
                      <p className="text-gray-400 mt-2">Esplora per categoria</p>
                   </div>
                   <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setFilter(cat)}
                          className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 cursor-pointer ${
                              filter === cat 
                              ? "!bg-[#4a8fa3] !text-white shadow-lg shadow-cyan-900/20 scale-105" 
                              : "!bg-[#2f6580] !text-white hover:!bg-[#4a8fa3] border-none shadow-md"
                          }`}
                        >
                        {cat}
                        </button>
                    ))}
                   </div>
                </div>
            </div>

            {/* Grid Progetti */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-40">
                   <div className="w-10 h-10 border-4 border-blend border-t-transparent rounded-full animate-spin mb-4"></div>
                   <p className="text-blend font-bold uppercase tracking-widest text-xs">Caricamento storie...</p>
                </div>
            ) : (
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
                <AnimatePresence mode="popLayout">
                    {filteredProjects.map((project, index) => (
                    <motion.div
                        key={project.id}
                        layout
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover="hover"
                        transition={{ duration: 0.6, delay: index % 2 * 0.1 }}
                        viewport={{ once: true }}
                        className="group"
                    >
                        <Link to={`/project/${project.id}`} className="block">
                          <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 rounded-3xl shadow-xl">
                              {/* Overlay on hover */}
                              <motion.div 
                                variants={{
                                  hover: { opacity: 1 }
                                }}
                                initial={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                className="absolute inset-0 bg-blend-dark/60 z-10 flex items-center justify-center backdrop-blur-[2px]"
                              >
                                 <motion.span 
                                   variants={{
                                     hover: { y: 0, opacity: 1 },
                                     initial: { y: 20, opacity: 0 }
                                   }}
                                   initial="initial"
                                   transition={{ duration: 0.4, delay: 0.1 }}
                                   className="px-10 py-4 bg-white text-blend font-black text-[10px] uppercase tracking-[0.3em] rounded-full shadow-2xl"
                                 >
                                   View Case Study
                                 </motion.span>
                              </motion.div>
                              
                              <motion.img
                                variants={{
                                  hover: { scale: 1.15, filter: "grayscale(0%)" }
                                }}
                                initial={{ scale: 1, filter: "grayscale(100%)" }}
                                transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1] }}
                                src={project.cover_image || project.img}
                                alt={project.title}
                                className="w-full h-full object-cover"
                              />
                              
                              {/* Numbering */}
                              <div className="absolute top-8 left-8 z-20">
                                 <span className="text-white font-black text-6xl opacity-20 italic block outline-text">
                                   0{index + 1}
                                 </span>
                              </div>
                          </div>
                          
                          <div className="mt-8 flex justify-between items-start">
                              <div className="max-w-[80%]">
                                <h3 className="text-2xl md:text-5xl font-bold text-blend tracking-tighter group-hover:text-blend-light transition-colors duration-300">
                                  {project.title}
                                </h3>
                                <div className="flex flex-wrap gap-3 mt-4">
                                   {(project.services || project.cat || "").split(",").map((s, i) => (
                                     <span key={i} className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 border-l-2 border-blend-light pl-2">
                                       {s.trim()}
                                     </span>
                                   ))}
                                </div>
                              </div>
                              <motion.div 
                                whileHover={{ rotate: 45 }}
                                className="w-14 h-14 border border-gray-200 rounded-full flex items-center justify-center text-blend group-hover:bg-blend group-hover:text-white group-hover:border-blend transition-all duration-500"
                              >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="7" y1="17" x2="17" y2="7"></line>
                                  <polyline points="7 7 17 7 17 17"></polyline>
                                </svg>
                              </motion.div>
                          </div>
                        </Link>
                    </motion.div>
                    ))}
                </AnimatePresence>
                </motion.div>
            )}

            {/* Load More */}
            <div className="mt-40 text-center">
                <Link to="/contact" className="group relative inline-block">
                    <span className="text-5xl md:text-8xl font-black text-blend/10 group-hover:text-blend/20 transition-colors uppercase tracking-tighter">
                       Your project here?
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-sm font-bold uppercase tracking-[0.4em] text-blend border-b-2 border-blend pb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                         Contattaci ora
                       </span>
                    </div>
                </Link>
            </div>
        </div>

      </div>
    </PageTransition>
  );
};

export default Projects;