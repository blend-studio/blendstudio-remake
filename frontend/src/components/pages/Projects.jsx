import React from "react";
import { Link } from "react-router-dom";
import PageTransition from "../components/Transition";
import { RevealText } from "../components/ui/RevealText";
import { motion } from "framer-motion";

// Dati Simulati (Presto arriveranno dal Backend)
const projectsData = [
  { id: 1, title: "Architettura Srl", cat: "Web Design", img: "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=1000" },
  { id: 2, title: "Minimalist Brand", cat: "Branding", img: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1000" },
  { id: 3, title: "Future Tech", cat: "Development", img: "https://images.unsplash.com/photo-1481487484168-9b930d55206d?q=80&w=1000" },
  { id: 4, title: "Luxury Hotel", cat: "Marketing", img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000" },
];

const Projects = () => {
  return (
    <PageTransition>
      <div className="pt-32 md:pt-48 pb-20 px-6 md:px-20 bg-blend-bg min-h-screen">
        
        {/* Header */}
        <div className="mb-20 md:mb-32">
          <RevealText text="OUR WORK" className="text-6xl md:text-9xl font-bold text-blend mb-6" />
          <div className="h-[1px] w-full bg-blend/20 mt-10"></div>
          <div className="flex justify-between mt-4 text-xs font-bold uppercase tracking-widest text-blend/60">
            <span>Portfolio 2023-24</span>
            <span>{projectsData.length} Projects</span>
          </div>
        </div>

        {/* Grid Progetti */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-20 md:gap-y-40">
          {projectsData.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              className={`group block ${index % 2 !== 0 ? "md:mt-32" : ""}`} // Sfalsiamo la seconda colonna
            >
              <Link to={`/project/${project.id}`} className="block">
                <div className="overflow-hidden bg-gray-200 aspect-[4/5] relative">
                  <div className="absolute inset-0 bg-blend/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                  <img
                    src={project.img}
                    alt={project.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[1s] ease-out"
                  />
                </div>
                <div className="mt-6 border-t border-blend/20 pt-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-blend">{project.title}</h3>
                    <p className="text-sm uppercase tracking-widest text-gray-500 mt-1">{project.cat}</p>
                  </div>
                  <div className="w-10 h-10 border border-blend rounded-full flex items-center justify-center text-blend opacity-0 group-hover:opacity-100 transition-all duration-300">
                    ↗
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </PageTransition>
  );
};

export default Projects;