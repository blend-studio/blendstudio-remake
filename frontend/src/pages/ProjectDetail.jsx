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
      <div className="bg-white min-h-screen pb-20">
        
        {/* --- HERO IMAGE --- */}
        <div className="relative h-[80vh] w-full overflow-hidden">
           <div className="absolute inset-0 bg-black/30 z-10" />
           <motion.img 
             initial={{ scale: 1.1 }}
             animate={{ scale: 1 }}
             transition={{ duration: 1.5, ease: "easeOut" }}
             src={coverImage} 
             alt={project.title} 
             className="w-full h-full object-cover"
           />
           <div className="absolute bottom-0 left-0 w-full p-6 md:p-20 z-20 text-white">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <span className="block mb-4 text-sm font-bold uppercase tracking-widest opacity-80">
                    {project.services || project.cat || "Project"}
                </span>
                <h1 className="text-5xl md:text-8xl font-bold leading-tight tracking-tighter">
                    {project.title}
                </h1>
              </motion.div>
           </div>
        </div>

        {/* --- CONTENT --- */}
        <div className="px-6 md:px-20 py-20 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24">
                
                {/* Sidebar Info */}
                <div className="md:col-span-4 space-y-10">
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Cliente</h3>
                        <p className="text-xl font-medium text-blend">{project.client || "Cliente Confidenziale"}</p>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Data</h3>
                        <p className="text-xl font-medium text-blend">{project.project_date || "2024"}</p>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Servizi</h3>
                        <p className="text-xl font-medium text-blend">{project.services || "Web Design & Dev"}</p>
                    </div>
                </div>

                {/* Main Description */}
                <div className="md:col-span-8">
                    <h2 className="text-3xl md:text-5xl font-bold text-blend mb-10 leading-tight">
                        About the project
                    </h2>
                    <div className="text-lg md:text-xl text-gray-600 leading-relaxed space-y-6">
                        {project.description ? (
                            <p>{project.description}</p>
                        ) : (
                            <>
                                <p>
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                </p>
                                <p>
                                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
                                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* --- GALLERY --- */}
        {project.gallery_images && Array.isArray(project.gallery_images) && project.gallery_images.length > 0 && (
            <div className="px-6 md:px-20 py-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {project.gallery_images.map((img, i) => (
                        <div key={i} className={`overflow-hidden rounded-sm ${i % 3 === 0 ? "md:col-span-2 aspect-[2/1]" : "aspect-square"}`}>
                            <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- NEXT PROJECT CTA --- */}
        <div className="border-t border-gray-100 mt-20 py-32 text-center">
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-6">Next Project</p>
            <Link to="/projects" className="text-6xl md:text-8xl font-bold text-blend hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blend hover:to-blend-light transition-all">
                Discover More
            </Link>
        </div>

      </div>
    </PageTransition>
  );
};

export default ProjectDetail;
