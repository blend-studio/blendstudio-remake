import React, { useState } from "react";
import PageTransition from "../components/Transition";
import { RevealText } from "../components/ui/RevealText";
import { Link } from "react-router-dom";
import Marquee from "../components/ui/Marquee";
import { motion, AnimatePresence } from "framer-motion";

const positions = [
  { role: "Frontend Developer (React)", type: "Full Time", loc: "Remote / Hybrid", desc: "Cerchiamo un esperto React con occhio per il design e passione per le animazioni (Framer Motion, GSAP)." },
  { role: "UI/UX Designer", type: "Full Time", loc: "On Site", desc: "Sei ossessionato dalla tipografia e dallo spazio bianco? Stiamo cercando te per definire il visual language dei nostri progetti." },
  { role: "Backend Developer (PHP/Node)", type: "Freelance", loc: "Remote", desc: "Sviluppo di API robuste, integrazioni complesse e architetture scalabili. Laravel e Node.js sono il tuo pane quotidiano." },
];

const perks = [
  "Lavoro Remoto", "MacBook Pro M3", "Formazione Continua", "Caffè Illimitato", "Team Retreats", "Bonus Performance", "Assicurazione Sanitaria"
].map((p, i) => <span key={i} className="text-3xl font-bold text-blend/30 mx-8 uppercase">{p}</span>);

const Careers = () => {
  const [expanded, setExpanded] = useState(null);

  return (
    <PageTransition>
      <div className="w-full bg-white min-h-screen">
        
        {/* --- CAREERS HERO --- */}
        <div className="relative h-screen flex flex-col justify-center px-6 md:px-20 overflow-hidden bg-black text-white">
           <div className="absolute inset-0 opacity-70">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop" 
                alt="Team Collaboration" 
                className="w-full h-full object-cover"
              />
           </div>
           
           <div className="relative z-10 text-center">
              <motion.span 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="block mb-6 text-sm font-bold uppercase tracking-widest text-white/80"
              >
                Careers
              </motion.span>
              
              <h1 className="text-6xl md:text-9xl font-bold tracking-tighter mb-6 text-white">
                <RevealText text="JOIN THE TEAM" className="justify-center" />
              </h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed mt-8"
              >
                  Siamo sempre alla ricerca di menti creative e talenti tecnici che vogliano sfidare lo status quo.
              </motion.p>
           </div>

           <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
          >
            <span className="text-[10px] uppercase tracking-widest text-white font-bold">Scroll</span>
            <div className="w-[1px] h-12 bg-white/50"></div>
          </motion.div>
        </div>

        {/* Perks Marquee */}
        <div className="py-16 border-b border-gray-100 mb-20 overflow-hidden bg-gray-50">
             <Marquee items={perks} speed={30} />
        </div>

        <div className="max-w-5xl mx-auto pb-20 px-6">
            <h2 className="text-3xl font-bold text-blend mb-10">Posizioni Aperte</h2>
            {/* Positions List */}
            <div className="bg-white rounded-sm border border-gray-100 shadow-sm">
                {positions.map((job, i) => (
                    <motion.div 
                        key={i} 
                        className="border-b border-gray-100 overflow-hidden last:border-0"
                        initial={false}
                    >
                        <div 
                            className="p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group"
                            onClick={() => setExpanded(expanded === i ? null : i)}
                        >
                            <div>
                                <h3 className="text-3xl font-bold text-blend group-hover:text-blend-light transition-colors">{job.role}</h3>
                                <div className="flex gap-4 mt-2 text-sm text-gray-500 font-medium uppercase tracking-wider">
                                    <span>{job.type}</span> • <span>{job.loc}</span>
                                </div>
                            </div>
                            <div className="mt-4 md:mt-0 px-6 py-3 border border-blend text-blend rounded-full text-xs font-bold uppercase tracking-widest group-hover:bg-blend group-hover:text-white transition-all">
                                {expanded === i ? "Chiudi" : "Dettagli"}
                            </div>
                        </div>
                        
                        <AnimatePresence>
                            {expanded === i && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="px-8 md:px-10 pb-10 text-lg text-gray-600 leading-relaxed max-w-3xl">
                                        <p>{job.desc}</p>
                                        <button className="mt-6 text-blend font-bold uppercase tracking-widest border-b-2 border-blend pb-1 hover:text-blend-light hover:border-blend-light transition-colors">
                                            Invia Candidatura →
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>

            {/* Candidatura Spontanea */}
            <div className="mt-20 text-center">
                <p className="text-blend-dark mb-6 font-medium text-lg">Non vedi la tua posizione?</p>
                <Link to="/contact" className="inline-block px-10 py-4 border border-blend rounded-full text-blend font-bold uppercase tracking-widest hover:bg-blend hover:text-white transition-colors">
                    Invia candidatura spontanea
                </Link>
            </div>

        </div>

      </div>
    </PageTransition>
  );
};

export default Careers;