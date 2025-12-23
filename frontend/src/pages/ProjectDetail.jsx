import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProjectById } from "../services/api";
import PageTransition from "../components/Transition";
import { RevealText } from "../components/ui/RevealText";
import { motion } from "framer-motion";

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await getProjectById(id);
        if (response.status === "success") {
          setProject(response.data);
        } else {
          setError("Project not found");
        }
      } catch (err) {
        setError("Error fetching project details");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-blend text-xl font-bold animate-pulse">Loading Project...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center px-6">
        <h1 className="text-4xl font-bold text-blend mb-4">Oops!</h1>
        <p className="text-gray-500 mb-8">{error || "Progetto non trovato."}</p>
        <Link to="/projects" className="px-8 py-3 bg-blend text-white rounded-full font-bold uppercase tracking-widest hover:bg-blend-dark transition-colors">
          Torna ai Progetti
        </Link>
      </div>
    );
  }

  // Helper per convertire la stringa JSON dei servizi/immagini se necessario
  // Se il backend restituisce già l'array, bene. Se è una stringa, facciamo un controllo safe.
  // Nel controller PHP abbiamo fatto json_decode, quindi dovrebbe essere un array o null.
  // Ma se usiamo i dati mock (nel DB non abbiamo ancora dati veri), attenzione.
  
  // Immagine di copertina
  const coverImage = project.cover_image || "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2668&auto=format&fit=crop";

  return (
    <PageTransition>
      <div className="bg-white min-h-screen">
        
        {/* --- FULLSCREEN HERO --- */}
        <div className="relative h-screen w-full overflow-hidden bg-blend-dark">
           <div className="absolute inset-0 z-0">
              <motion.img 
                initial={{ scale: 1.1, opacity: 0.4 }}
                animate={{ scale: 1, opacity: 0.3 }}
                transition={{ duration: 2, ease: "easeOut" }}
                src={coverImage} 
                alt={project.title} 
                className="w-full h-full object-cover grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blend-dark via-transparent to-transparent" />
           </div>

           <div className="max-w-[90rem] w-full z-10 relative mt-20 px-6 md:px-20 h-full flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="flex items-center gap-4 mb-6 md:mb-10"
              >
                <div className="h-[2px] w-12 bg-white/60"></div>
                <span className="text-white/80 font-bold uppercase tracking-[0.2em] text-xs md:text-sm">
                  Case Study
                </span>
              </motion.div>

              <div className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] xl:text-[12rem] font-extrabold leading-[0.85] tracking-tighter text-white">
                <div className="max-w-[15ch]">
                   <RevealText text={project.title.toUpperCase()} delay={0.2} />
                </div>
              </div>
              
              <div className="mt-16 max-w-2xl">
                <p className="text-xl md:text-3xl text-white/60 leading-tight font-medium uppercase italic tracking-tighter">
                  {project.services || project.cat || "Digital Experience"}
                </p>
              </div>
           </div>

           <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
            className="absolute bottom-10 left-6 md:left-20 flex flex-col items-center gap-2 z-10"
          >
            <span className="text-[10px] uppercase tracking-widest text-white font-bold rotate-90 origin-left translate-x-4">Scroll</span>
            <div className="w-[1px] h-16 bg-white/30 mt-8"></div>
          </motion.div>
        </div>

        {/* --- CONTENT --- */}
        <div className="px-6 md:px-20 py-32 md:py-48">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-32">
                
                {/* Sidebar Info */}
                <div className="lg:col-span-4 space-y-12 order-2 lg:order-1 border-t lg:border-t-0 border-gray-100 pt-16 lg:pt-0">
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blend-light/60 mb-4">Cliente</h3>
                        <p className="text-3xl font-black text-blend uppercase tracking-tighter italic">{project.client || "Confidential"}</p>
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blend-light/60 mb-4">Anno</h3>
                        <p className="text-3xl font-black text-blend uppercase tracking-tighter italic">{project.project_date || "2024"}</p>
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blend-light/60 mb-4">Expertise</h3>
                        <div className="flex flex-wrap gap-2 mt-4">
                           {(project.services || project.cat || "").split(",").map((s, i) => (
                             <span key={i} className="px-4 py-2 border border-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest text-blend-light">
                               {s.trim()}
                             </span>
                           ))}
                        </div>
                    </div>
                </div>

                {/* Main Description */}
                <div className="lg:col-span-8 order-1 lg:order-2">
                    <h2 className="text-4xl md:text-7xl font-black text-blend mb-12 tracking-tighter uppercase italic">
                        The Project
                    </h2>
                    <div className="text-xl md:text-3xl text-gray-500 leading-[1.3] font-medium tracking-tight space-y-8">
                        {project.description ? (
                            <p>{project.description}</p>
                        ) : (
                            <p>Costruiamo ecosistemi digitali che trasformano la percezione del brand e guidano risultati misurabili attraverso un design d'avanguardia.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* --- GALLERY --- */}
        {project.gallery_images && Array.isArray(project.gallery_images) && project.gallery_images.length > 0 && (
            <div className="px-6 md:px-20 pb-32 md:pb-48">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                    {project.gallery_images.map((img, i) => (
                        <motion.div 
                          key={i} 
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: (i % 2) * 0.1 }}
                          className={`overflow-hidden rounded-sm group bg-gray-50 ${i % 3 === 0 ? "md:col-span-2 aspect-[16/9]" : "aspect-[4/5] md:aspect-square"}`}
                        >
                            <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.5s] ease-out" />
                        </motion.div>
                    ))}
                </div>
            </div>
        )}

        {/* --- NEXT PROJECT CTA --- */}
        <div className="bg-blend py-40 md:py-60 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 font-black text-[30vw] leading-none pointer-events-none select-none flex items-center justify-center text-white">
              NEXT
           </div>
            <p className="text-white/40 text-sm font-black uppercase tracking-[0.4em] mb-8 relative z-10">Ready for more?</p>
            <Link to="/projects" className="text-5xl md:text-9xl font-black text-white hover:italic transition-all uppercase tracking-tighter relative z-10">
                Discover More
            </Link>
        </div>

      </div>
    </PageTransition>
  );
};

   

export default ProjectDetail;
