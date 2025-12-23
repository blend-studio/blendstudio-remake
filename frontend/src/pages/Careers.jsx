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

const Careers = () => {
  const [expanded, setExpanded] = useState(null);

  const perks = [
    "Lavoro Remoto", "MacBook Pro M3", "Formazione Continua", "Caffè Illimitato", "Team Retreats", "Bonus Performance", "Assicurazione Sanitaria"
  ].map((p, i) => <span key={i} className="text-4xl md:text-6xl font-black text-blend/10 mx-12 uppercase italic">{p}</span>);

  return (
    <PageTransition>
      <div className="w-full bg-white min-h-screen">
        
        {/* --- FULLSCREEN HERO --- */}
        <div className="relative h-screen flex flex-col justify-center px-6 md:px-20 overflow-hidden bg-blend-dark text-white">
           <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop" 
                alt="Team Collaboration" 
                className="w-full h-full object-cover opacity-20 grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blend-dark to-transparent"></div>
           </div>
           
           <div className="max-w-[90rem] w-full z-10 relative mt-20">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="flex items-center gap-4 mb-6 md:mb-10"
              >
                <div className="h-[2px] w-12 bg-white/60"></div>
                <span className="text-white/80 font-bold uppercase tracking-[0.2em] text-xs md:text-sm">
                  Careers
                </span>
              </motion.div>

              <div className="text-6xl md:text-8xl lg:text-[10rem] xl:text-[12rem] font-extrabold leading-[0.85] tracking-tighter text-white">
                <RevealText text="JOIN THE" delay={0.2} />
                <div className="text-white/40">
                  <RevealText text="TEAM" delay={0.4} />
                </div>
              </div>
              
              <div className="mt-16 max-w-2xl">
                <p className="text-xl md:text-3xl text-white/60 leading-tight font-medium">
                  Sempre alla ricerca di talenti tecnici e creativi che vogliano sfidare lo status quo digitale.
                </p>
              </div>
           </div>

           <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ delay: 1, duration: 2, repeat: Infinity }}
            className="absolute bottom-10 left-6 md:left-20 flex flex-col items-center gap-2 z-10"
          >
            <span className="text-[10px] uppercase tracking-widest text-white font-bold rotate-90 origin-left translate-x-4">Scroll</span>
            <div className="w-[1px] h-16 bg-white/30 mt-8"></div>
          </motion.div>
        </div>

        {/* Perks Marquee */}
        <div className="py-20 border-b border-gray-100 overflow-hidden bg-gray-50">
             <Marquee items={perks} speed={40} />
        </div>

        <div className="py-32 md:py-48 px-6 md:px-20">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-20">
                <div className="md:col-span-4">
                    <h2 className="text-5xl md:text-7xl font-black text-blend tracking-tighter uppercase italic">Open Roles</h2>
                </div>
                <div className="md:col-span-8">
                    <p className="text-gray-400 text-xl font-medium">Nessun ego, solo grandi idee. Siamo un team distribuito unito dalla stessa passione per l'eccellenza.</p>
                </div>
            </div>

            <div className="space-y-4">
                {positions.map((job, i) => (
                    <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="border border-gray-100 overflow-hidden rounded-sm bg-white"
                    >
                        <div 
                            className="p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-gray-50 transition-all cursor-none group"
                            onClick={() => setExpanded(expanded === i ? null : i)}
                        >
                            <div className="max-w-2xl">
                                <h3 className="text-3xl md:text-5xl font-black text-blend tracking-tighter uppercase group-hover:text-blend-light transition-colors">{job.role}</h3>
                                <div className="flex gap-6 mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-blend-light/60">
                                    <span className="border-l-2 border-blend-light pl-2">{job.type}</span>
                                    <span className="border-l-2 border-blend-light pl-2">{job.loc}</span>
                                </div>
                            </div>
                            <div className="mt-8 md:mt-0 flex items-center gap-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-blend group-hover:translate-x-[-10px] transition-transform">
                                   {expanded === i ? "Chiudi" : "Dettagli"}
                                </span>
                                <div className={`w-14 h-14 border border-gray-200 rounded-full flex items-center justify-center text-blend group-hover:bg-blend group-hover:text-white transition-all duration-500 ${expanded === i ? "bg-blend text-white rotate-45" : ""}`}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <line x1="12" y1="5" x2="12" y2="19"></line>
                                      <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        
                        <AnimatePresence>
                            {expanded === i && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    <div className="px-8 md:px-12 pb-12 pt-0">
                                        <p className="text-xl md:text-2xl text-gray-500 leading-relaxed max-w-3xl border-t border-gray-100 pt-10">
                                            {job.desc}
                                        </p>
                                        <button className="mt-12 inline-block px-10 py-5 bg-blend !text-white rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:scale-105 transition-transform shadow-xl">
                                            Invia Candidatura Ora
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>

            {/* Spontaneous */}
            <div className="mt-32 text-center p-20 bg-gray-50 rounded-sm">
                <h3 className="text-4xl md:text-6xl font-black text-blend uppercase tracking-tighter italic mb-8">Non vedi il tuo ruolo?</h3>
                <Link to="/contact" className="text-sm font-black uppercase tracking-[0.4em] text-blend border-b-2 border-blend pb-2 hover:text-blend-light hover:border-blend-light transition-all">
                    Invia candidatura spontanea
                </Link>
            </div>
        </div>

      </div>
    </PageTransition>
  );
};

export default Careers;
