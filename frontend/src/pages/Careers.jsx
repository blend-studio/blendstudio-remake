import React from "react";
import PageTransition from "../components/Transition";
import { RevealText } from "../components/ui/RevealText";
import { Link } from "react-router-dom";

const positions = [
  { role: "Frontend Developer (React)", type: "Full Time", loc: "Remote / Hybrid" },
  { role: "UI/UX Designer", type: "Full Time", loc: "On Site" },
  { role: "Backend Developer (PHP/Node)", type: "Freelance", loc: "Remote" },
];

const Careers = () => {
  return (
    <PageTransition>
      <div className="pt-32 md:pt-48 pb-20 px-6 md:px-20 min-h-screen bg-blend-bg">
        
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20">
                <RevealText text="JOIN THE TEAM" className="text-5xl md:text-8xl font-bold text-blend mb-6 justify-center" />
                <p className="text-xl text-blend-dark/70 max-w-2xl mx-auto leading-relaxed">
                    Siamo sempre alla ricerca di menti creative e talenti tecnici che vogliano sfidare lo status quo del web design.
                </p>
            </div>

            {/* Positions List */}
            <div className="bg-white rounded-sm shadow-xl shadow-blend/5 overflow-hidden">
                {positions.map((job, i) => (
                    <div key={i} className="border-b border-gray-100 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-gray-50 transition-colors group cursor-pointer">
                        <div>
                            <h3 className="text-2xl font-bold text-blend group-hover:text-blend-light transition-colors">{job.role}</h3>
                            <div className="flex gap-4 mt-2 text-sm text-gray-500 font-medium uppercase tracking-wider">
                                <span>{job.type}</span> • <span>{job.loc}</span>
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0 px-6 py-3 border border-blend text-blend rounded-full text-xs font-bold uppercase tracking-widest group-hover:bg-blend group-hover:text-white transition-all">
                            Applica
                        </div>
                    </div>
                ))}
            </div>

            {/* Candidatura Spontanea */}
            <div className="mt-20 text-center">
                <p className="text-blend-dark mb-6 font-medium">Non vedi la tua posizione?</p>
                <Link to="/contact" className="inline-block text-blend font-bold uppercase tracking-widest border-b-2 border-blend pb-1 hover:text-blend-light hover:border-blend-light transition-colors">
                    Invia candidatura spontanea
                </Link>
            </div>

        </div>

      </div>
    </PageTransition>
  );
};

export default Careers;