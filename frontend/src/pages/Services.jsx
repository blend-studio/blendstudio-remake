import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageTransition from "../components/Transition";
import { RevealText } from "../components/ui/RevealText";
import backgroundVideo from "../assets/images/sfondo-blend.mp4";

const services = [
  {
    title: "Strategy",
    cat: "Foundation",
    description: "Definiamo il percorso verso il successo attraverso analisi di mercato, posizionamento di marca e strategie digitali su misura."
  },
  {
    title: "Brand Identity",
    cat: "Visual",
    description: "Creiamo identità visive uniche che raccontano la tua storia e rimangono impresse nella mente del tuo pubblico."
  },
  {
    title: "Web Development",
    cat: "Technology",
    description: "Sviluppiamo ecosistemi digitali performanti, sicuri e scalabili, utilizzando le tecnologie più all'avanguardia."
  },
  {
    title: "UI/UX Design",
    cat: "Experience",
    description: "Progettiamo interfacce intuitive e percorsi utente memorabili che mettono l'emozione al centro dell'interazione."
  },
  {
    title: "E-commerce",
    cat: "Conversion",
    description: "Realizziamo shop online ottimizzati per la vendita, focalizzati sulla massimizzazione delle conversioni e della CX."
  },
  {
    title: "Graphic Design",
    cat: "Visual",
    description: "Trasformiamo concetti complessi in immagini iconiche attraverso un design grafico pulito e illustrazioni originali."
  },
  {
    title: "Advertising",
    cat: "Growth",
    description: "Massimizziamo la visibilità del tuo brand attraverso campagne creative e data-driven sui principali canali digitali."
  },
  {
    title: "Social Media",
    cat: "Engagement",
    description: "Gestiamo la tua presenza sui social media creando contenuti coinvolgenti e costruendo community fedeli."
  },
  {
    title: "SEO & Performance",
    cat: "Data",
    description: "Scaliamo i risultati attraverso l'ottimizzazione per i motori di ricerca e il monitoraggio costante delle performance."
  },
  {
    title: "Foto e Video",
    cat: "Content",
    description: "Raccontiamo la tua realtà attraverso produzioni multimediali di alta qualità, dallo shooting allo storytelling video."
  },
  {
    title: "Motion Design",
    cat: "Animation",
    description: "Diamo vita alle tue idee con animazioni fluide e grafiche in movimento che catturano l'attenzione."
  },
  {
    title: "3D Rendering",
    cat: "Future",
    description: "Creiamo mondi digitali tridimensionali e visualizzazioni fotorealistiche per prodotti e architetture d'avanguardia."
  }
];

const Services = () => {
  return (
    <PageTransition>
      <div className="w-full bg-white min-h-screen">
        
        {/* --- FULLSCREEN HERO --- */}
        <div className="relative h-screen flex flex-col justify-center px-6 md:px-20 overflow-hidden bg-black text-white nav-dark-section">
           {/* Background Video - Self Hosted */}
           <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-black">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover scale-[1.1] opacity-60"
              >
                <source src={backgroundVideo} type="video/mp4" />
              </video>
           </div>

           <div className="max-w-[90rem] w-full z-10 relative mt-10 md:mt-0 pb-20">
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

              <div className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] xl:text-[12rem] font-extrabold leading-[0.85] tracking-normal text-white">
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
            className="absolute bottom-6 md:bottom-10 left-6 md:left-20 flex flex-col items-center gap-2 z-10"
          >
            <span className="text-[10px] uppercase tracking-widest text-white font-bold rotate-90 origin-left translate-x-4">Scroll</span>
            <div className="w-[1px] h-10 md:h-16 bg-white/30 mt-8"></div>
          </motion.div>
        </div>

        {/* --- MODERN SERVICES GRID --- */}
        <section className="py-24 md:py-48 px-6 md:px-20 bg-white relative overflow-hidden">
          
          {/* Animated Background Glows */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
             <motion.div 
               animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
               transition={{ duration: 20, repeat: Infinity }}
               className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-blend-light rounded-full blur-[150px]"
             />
             <motion.div 
               animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
               transition={{ duration: 25, repeat: Infinity }}
               className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-blend rounded-full blur-[180px]"
             />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-12 relative z-10">
            {services.map((service, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: (i % 3) * 0.1, duration: 0.8 }}
                whileHover={{ y: -10 }}
                className="group relative p-10 md:p-14 bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500"
              >
                {/* Background Glow on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blend/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-blend-light/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700" />

                <div className="relative z-10">
                   <div className="flex justify-between items-start mb-12">
                      <span className="text-[10px] font-black text-blend-light uppercase tracking-[0.3em] border-b-2 border-blend-light/20 pb-2">
                        {service.cat}
                      </span>
                      <span className="text-4xl font-black text-blend/10 group-hover:text-blend/30 transition-colors duration-500 italic">
                        0{i + 1}
                      </span>
                   </div>

                   <h3 className="text-3xl md:text-4xl font-black text-blend mb-8 tracking-tighter uppercase italic group-hover:translate-x-2 transition-transform duration-500">
                     {service.title}
                   </h3>
                   
                   <p className="text-gray-500 text-lg md:text-xl leading-relaxed mb-12 min-h-[100px]">
                     {service.description}
                   </p>

                   <Link to="/contact" className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-blend hover:text-blend-light transition-all">
                      <span>Inizia un progetto</span>
                      <div className="w-8 h-[1px] bg-blend group-hover:w-12 transition-all"></div>
                   </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="py-40 md:py-60 bg-blend text-white text-center overflow-hidden relative nav-dark-section">
           <div className="absolute inset-0 opacity-10 font-black text-[30vw] leading-none pointer-events-none select-none flex items-center justify-center">
              PROJECT
           </div>
           <motion.div 
             animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
             transition={{ duration: 10, repeat: Infinity }}
             className="absolute -top-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-[100px]" 
           />
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