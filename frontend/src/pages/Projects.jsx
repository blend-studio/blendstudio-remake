import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageTransition from "../components/Transition";
import { RevealText } from "../components/ui/RevealText";
import { motion, AnimatePresence } from "framer-motion";
import TiltCard from "../components/ui/TiltCard";
import { getProjects } from "../services/api";

const categories = ["All", "Web Design", "Branding", "Development", "Marketing"];

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

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
  const featuredProject = projects.length > 0 ? projects[0] : null;

  return (
    <PageTransition>
      <div className="w-full bg-white min-h-screen">
        
        {/* --- COMPACT HERO --- */}
        <div className="relative h-[60vh] flex items-center justify-center px-6 md:px-20 overflow-hidden bg-black text-white">
           {featuredProject && (
               <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-black/60 z-10" />
                  <img 
                    src={featuredProject.cover_image || featuredProject.img} 
                    alt="Featured Project" 
                    className="w-full h-full object-cover grayscale"
                  />
               </div>
           )}

           <div className="relative z-20 text-center">
              <motion.span 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="block mb-4 text-xs font-bold uppercase tracking-widest text-white/60"
              >
                Our Portfolio
              </motion.span>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold leading-none tracking-tighter mb-6">
                <RevealText text="OUR WORK" />
              </h1>
           </div>
        </div>

        <div className="py-20 px-6 md:px-20">
            {/* Filter */}
            <div className="flex flex-wrap justify-center gap-3 mb-16">
            {categories.map((cat) => (
                <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                    filter === cat 
                    ? "bg-blend text-white" 
                    : "bg-gray-50 text-blend hover:bg-blend/10 border border-gray-100"
                }`}
                >
                {cat}
                </button>
            ))}
            </div>

            {/* Grid Progetti - 3 Columns */}
            {loading ? (
                <div className="text-center py-20 text-gray-400">Loading projects...</div>
            ) : (
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                <AnimatePresence>
                    {filteredProjects.map((project) => (
                    <TiltCard key={project.id} className="h-full">
                    <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                        className="group block h-full"
                    >
                        <Link to={`/project/${project.id}`} className="block h-full">
                        <div className="overflow-hidden rounded-sm relative bg-gray-100 aspect-square">
                            <div className="absolute inset-0 bg-blend/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
                            <motion.img
                            whileHover={{ scale: 1.08 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            src={project.cover_image || project.img} // Fallback for transition
                            alt={project.title}
                            className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="mt-5 flex justify-between items-start">
                            <div>
                            <h3 className="text-xl md:text-2xl font-bold text-blend leading-tight">{project.title}</h3>
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1 font-bold">{project.services || project.cat}</p>
                            </div>
                            <div className="w-8 h-8 border border-gray-200 rounded-full flex items-center justify-center text-blend opacity-0 group-hover:opacity-100 group-hover:bg-blend group-hover:text-white group-hover:border-blend transition-all duration-300 text-xs">
                            ↗
                            </div>
                        </div>
                        </Link>
                    </motion.div>
                    </TiltCard>
                    ))}
                </AnimatePresence>
                </motion.div>
            )}

            {/* Load More */}
            <div className="mt-24 text-center">
                <button className="text-xs font-bold uppercase tracking-[0.2em] text-blend border-b border-blend pb-1 hover:text-blend-light hover:border-blend-light transition-colors">
                    Esplora Altri Progetti
                </button>
            </div>
        </div>

      </div>
    </PageTransition>
  );
};

export default Projects;