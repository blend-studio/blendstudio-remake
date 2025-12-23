import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageTransition from "../components/Transition";
import { RevealText } from "../components/ui/RevealText";

const services = [
  {
    title: "Strategy",
    description: "Definiamo il percorso verso il successo attraverso analisi di mercato, posizionamento di marca e strategie digitali su misura."
  },
  {
    title: "Brand Identity",
    description: "Creiamo identità visive uniche che raccontano la tua storia e rimangono impresse nella mente del tuo pubblico."
  },
  {
    title: "Web Development",
    description: "Sviluppiamo ecosistemi digitali performanti, sicuri e scalabili, utilizzando le tecnologie più all'avanguardia."
  },
  {
    title: "Graphic Design & Illustration",
    description: "Trasformiamo concetti complessi in immagini iconiche attraverso un design grafico pulito e illustrazioni originali."
  },
  {
    title: "Advertising",
    description: "Massimizziamo la visibilità del tuo brand attraverso campagne creative e data-driven sui principali canali digitali."
  },
  {
    title: "Foto e Video",
    description: "Raccontiamo la tua realtà attraverso produzioni multimediali di alta qualità, dallo shooting fotografico alla produzione video."
  },
  {
    title: "Social Media Management",
    description: "Gestiamo la tua presenza sui social media creando contenuti coinvolgenti e costruendo community fedeli."
  },
  {
    title: "Motion Design",
    description: "Diamo vita alle tue idee con animazioni fluide e grafiche in movimento che catturano l'attenzione."
  }
];

const Services = () => {
  return (
    <PageTransition>
      <div className="w-full bg-white min-h-screen">
        
        {/* --- FULLSCREEN HERO --- */}
        <div className="relative h-screen flex flex-col justify-center px-6 md:px-20 overflow-hidden bg-blend-dark text-white">
           {/* Abstract Shapes - Optimized */}
           <div className="absolute inset-0 z-0 opacity-20">
              <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] border-[1px] border-white/20 rounded-full" />
              <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] border-[1px] border-white/20 rounded-full" />
              <div className="absolute inset-0 bg-gradient-to-br from-blend/40 to-transparent" />
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
                  Our Expertise
                </span>
              </motion.div>

              <div className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] xl:text-[12rem] font-extrabold leading-[0.85] tracking-tighter text-white">
                <RevealText text="ELEVATING" delay={0.2} />
                <div className="text-white/40">
                  <RevealText text="BRANDS" delay={0.4} />
                </div>
              </div>

              <div className="mt-16 max-w-2xl">
                <p className="text-xl md:text-3xl text-white/60 leading-tight font-medium">
                  Soluzioni digitali integrate per aziende ambiziose. 
                  Dalla strategia alla produzione d'eccellenza.
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

        {/* Services List */}
        <div className="py-24 md:py-48 px-6 md:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 xl:gap-x-32 gap-y-24 md:gap-y-32">
            {services.map((service, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i % 2 * 0.1, duration: 0.8 }}
                className="group"
              >
                <div className="flex items-end justify-between border-b border-gray-100 pb-6 mb-8 md:mb-10">
                   <span className="text-xs font-black text-blend-light uppercase tracking-[0.3em]">
                     0{i + 1}
                   </span>
                   <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-blend group-hover:text-white transition-all duration-500">
                      →
                   </div>
                </div>
                <h3 className="text-3xl md:text-5xl lg:text-6xl font-black text-blend mb-6 md:mb-8 tracking-tighter uppercase italic group-hover:text-blend-light transition-colors">
                  {service.title}
                </h3>
                <p className="text-lg md:text-2xl text-gray-500 leading-relaxed lg:max-w-lg">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="py-40 md:py-60 bg-blend text-white text-center overflow-hidden relative">
           <div className="absolute inset-0 opacity-10 font-black text-[30vw] leading-none pointer-events-none select-none flex items-center justify-center">
              PROJECT
           </div>
           <h2 className="text-5xl md:text-9xl font-black mb-12 tracking-tighter uppercase italic relative z-10">Let's create.</h2>
           <div className="relative z-10">
              <Link to="/contact" className="inline-block px-14 py-6 bg-white !text-blend rounded-full font-black uppercase tracking-[0.3em] text-xs hover:scale-110 transition-transform shadow-2xl">
                  Inizia un progetto
              </Link>
           </div>
        </div>

      </div>
    </PageTransition>
  );
};

export default Services;
