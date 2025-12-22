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
        
        {/* --- GEOMETRIC HERO --- */}
        <div className="relative h-screen flex flex-col justify-center px-6 md:px-20 overflow-hidden bg-blend-dark text-white">
           
           {/* Abstract Shapes */}
           <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
             className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] border-[1px] border-white/10 rounded-full z-0"
           />
           <motion.div 
             animate={{ rotate: -360 }}
             transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
             className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] border-[1px] border-white/10 rounded-full z-0"
           />
           <div className="absolute inset-0 bg-gradient-to-br from-blend to-blend-dark opacity-50 z-0" />

           <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4 mb-8"
              >
                <div className="h-[2px] w-12 bg-white"></div>
                <span className="font-bold uppercase tracking-[0.2em] text-xs md:text-sm text-white/80">
                  I Nostri Servizi
                </span>
              </motion.div>
              
              <h1 className="text-6xl md:text-9xl lg:text-[11rem] font-extrabold tracking-tighter leading-[0.9]">
                <RevealText text="ELEVATING" delay={0.1} />
                <span className="text-blend-light/80">
                    <RevealText text="BRANDS" delay={0.3} />
                </span>
              </h1>
              
              <div className="mt-16 md:mt-24 max-w-2xl">
                <p className="text-xl md:text-2xl text-white/70 leading-relaxed font-medium">
                  Offriamo soluzioni digitali integrate per aziende che non si accontentano. 
                  Dalla strategia alla produzione, siamo il tuo partner creativo.
                </p>
              </div>
           </div>
        </div>

        {/* Services List */}
        <div className="py-20 md:py-32 px-6 md:px-20 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 md:gap-y-24">
          {services.map((service, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="group border-t border-gray-100 pt-10"
            >
              <span className="text-xs font-bold text-blend-light/60 uppercase tracking-widest block mb-4">
                0{i + 1}
              </span>
              <h3 className="text-3xl md:text-4xl font-bold text-blend mb-6 group-hover:text-blend-light transition-colors">
                {service.title}
              </h3>
              <p className="text-gray-500 text-lg leading-relaxed max-w-md">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-0 md:mt-20 text-center bg-blend p-12 md:p-24 text-white overflow-hidden relative">
           <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
              className="absolute -right-20 -top-20 w-80 h-80 border border-white/10 rounded-full"
           />
           <h2 className="text-4xl md:text-6xl font-bold mb-8 relative z-10">Pronto a trasformare la tua visione?</h2>
           <div className="relative z-10">
              <Link to="/contact" className="inline-block px-10 py-4 bg-white !text-[#2f6580] rounded-full font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors">
                  Inizia un progetto
              </Link>
           </div>
        </div>

      </div>
    </PageTransition>
  );
};

export default Services;