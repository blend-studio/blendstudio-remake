import React, { useState } from "react";
import { Link } from "react-router-dom";
import PageTransition from "../components/Transition";
import { RevealText } from "../components/ui/RevealText";
import { motion, AnimatePresence } from "framer-motion";

const projectsData = [
  { id: 1, title: "Architettura Srl", cat: "Web Design", img: "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=1000", size: "large" },
  { id: 2, title: "Minimalist Brand", cat: "Branding", img: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1000", size: "small" },
  { id: 3, title: "Future Tech", cat: "Development", img: "https://images.unsplash.com/photo-1481487484168-9b930d55206d?q=80&w=1000", size: "small" },
  { id: 4, title: "Luxury Hotel", cat: "Marketing", img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000", size: "large" },
  { id: 5, title: "E-Commerce Pro", cat: "Development", img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1000", size: "small" },
  { id: 6, title: "Art Gallery", cat: "Web Design", img: "https://images.unsplash.com/photo-1577720580479-7d839d829c73?q=80&w=1000", size: "small" },
];

const categories = ["All", "Web Design", "Branding", "Development", "Marketing"];

const Projects = () => {
  const [filter, setFilter] = useState("All");

  const filteredProjects = projectsData.filter(p => filter === "All" || p.cat === filter);

  return (
    <PageTransition>
      <div className="pt-32 md:pt-48 pb-20 px-6 md:px-20 bg-blend-bg min-h-screen">
        
        {/* Header */}
        <div className="mb-20 md:mb-32 text-center">
          <RevealText text="OUR WORK" className="text-6xl md:text-9xl lg:text-[12rem] font-bold text-blend mb-6 justify-center" />
          <p className="text-xl md:text-2xl text-blend-dark/60 max-w-2xl mx-auto mt-10">
            Esplora una selezione dei nostri progetti più recenti. 
            Ogni pixel è pensato per performare.
          </p>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-20">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
                filter === cat 
                  ? "bg-blend text-white scale-110" 
                  : "bg-white text-blend hover:bg-blend/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid Progetti */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20">
          <AnimatePresence>
            {filteredProjects.map((project, index) => (
              <motion.div
                layout
                key={project.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className={`group block ${project.size === "large" ? "md:col-span-2" : "md:col-span-1"}`}
              >
                <Link to={`/project/${project.id}`} className="block">
                  <div className={`overflow-hidden rounded-sm relative bg-gray-200 ${project.size === "large" ? "aspect-[2/1]" : "aspect-[4/5]"}`}>
                    <div className="absolute inset-0 bg-blend/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.7 }}
                      src={project.img}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-6 flex justify-between items-center">
                    <div>
                      <h3 className="text-3xl md:text-4xl font-bold text-blend">{project.title}</h3>
                      <p className="text-sm uppercase tracking-widest text-gray-500 mt-2">{project.cat}</p>
                    </div>
                    <div className="w-12 h-12 border border-blend rounded-full flex items-center justify-center text-blend opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:bg-blend group-hover:text-white">
                      ↗
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Load More (Fake) */}
        <div className="mt-32 text-center">
             <button className="text-blend font-bold uppercase tracking-widest border-b-2 border-blend pb-1 hover:text-blend-light hover:border-blend-light transition-colors">
                Carica altri progetti
             </button>
        </div>

      </div>
    </PageTransition>
  );
};

export default Projects;