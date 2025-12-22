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
].map(p => <span className="text-3xl font-bold text-blend/30 mx-8 uppercase">{p}</span>);

const Careers = () => {
  const [expanded, setExpanded] = useState(null);

  return (
    <PageTransition>
      <div className="pt-32 md:pt-48 pb-20 px-6 md:px-20 min-h-screen bg-white">
        
        <div className="max-w-5xl mx-auto mb-20 md:mb-32">
            <div className="text-center">
                <RevealText text="JOIN THE TEAM" className="text-6xl md:text-9xl font-bold text-blend mb-6 justify-center" />
                <p className="text-xl md:text-2xl text-blend-dark/70 max-w-2xl mx-auto leading-relaxed mt-8">
                    Siamo sempre alla ricerca di menti creative e talenti tecnici che vogliano sfidare lo status quo del web design.
                </p>
            </div>
        </div>

        {/* Perks Marquee */}
        <div className="py-12 border-y border-gray-100 mb-20 overflow-hidden">
             <Marquee items={perks} speed={30} />
        </div>

        <div className="max-w-5xl mx-auto">
            {/* Positions List */}
            <div className="bg-white rounded-sm">
                {positions.map((job, i) => (
                    <motion.div 
                        key={i} 
                        className="border-b border-gray-100 overflow-hidden"
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