import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageTransition from "../components/Transition";
import { RevealText } from "../components/ui/RevealText";
import Marquee from "../components/ui/Marquee";

const About = () => {
  const galleryImages = [
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1000&auto=format&fit=crop"
  ].map((src, i) => (
    <div key={i} className="w-[300px] md:w-[500px] aspect-video overflow-hidden grayscale hover:grayscale-0 transition-all duration-500">
      <img src={src} alt="Studio Life" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
    </div>
  ));

  return (
    <PageTransition>
      <div className="w-full bg-white min-h-screen">
        
        {/* --- FULLSCREEN HERO --- */}
        <div className="relative h-screen flex flex-col justify-center px-6 md:px-20 overflow-hidden bg-blend-dark">
           {/* Visual background with overlay */}
           <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2670&auto=format&fit=crop" 
                alt="Studio Team" 
                className="w-full h-full object-cover opacity-30 grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blend-dark via-transparent to-transparent"></div>
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
                  The Studio
                </span>
              </motion.div>

              <div className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] xl:text-[12rem] font-extrabold leading-[0.85] tracking-tighter text-white">
                <RevealText text="DIGITAL" delay={0.2} />
                <div className="text-white/40">
                  <RevealText text="ARTISANS" delay={0.4} />
                </div>
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

        {/* --- INTRO TEXT --- */}
        <div className="py-32 md:py-48 px-6 md:px-20">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                <div className="md:col-span-8 md:col-start-4">
                   <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                   >
                     <span className="block text-blend-light font-bold uppercase tracking-[0.3em] text-xs mb-8">Manifesto</span>
                     <p className="text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.2] text-blend tracking-tight">
                       Siamo un collettivo di creativi, sviluppatori e strateghi. 
                       Crediamo che il digitale non sia solo codice, ma un'estensione dell'identità umana.
                     </p>
                   </motion.div>
                </div>
            </div>
        </div>

        {/* --- GALLERY MARQUEE --- */}
        <section className="py-20 -mx-6 md:-mx-20 overflow-hidden bg-gray-50 border-y border-gray-100">
            <Marquee items={galleryImages} speed={50} />
        </section>

        {/* --- PHILOSOPHY --- */}
        <section className="py-24 md:py-48 px-6 md:px-20">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
              <div>
                 <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-blend mb-8 md:mb-12 tracking-tighter uppercase italic">Il Metodo</h2>
                 <p className="text-gray-500 text-lg md:text-2xl leading-relaxed mb-10">
                    Uniamo la precisione ingegneristica e l'intuizione artistica. 
                    Ogni progetto nasce da una profonda analisi dei dati e fiorisce attraverso un design emotivo.
                 </p>
                 <div className="h-[2px] w-20 bg-blend"></div>
              </div>
              <div className="relative aspect-square lg:aspect-[4/5] bg-blend-bg overflow-hidden rounded-sm group">
                 <img 
                    src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop" 
                    alt="Abstract Blend" 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.5s]"
                 />
              </div>
           </div>
        </section>


        {/* --- VALUES --- */}
        <section className="py-20 md:py-32 px-6 md:px-20">
            <div className="flex flex-col gap-0 border-t border-gray-200">
                {["Innovazione", "Precisione", "Empatia", "Visione", "Qualità"].map((val, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 0.6 }}
                        className="group border-b border-gray-200 py-8 md:py-16 flex justify-between items-center hover:bg-blend transition-colors px-2 md:px-4 -mx-2 md:-mx-4"
                    >
                        <h3 className="text-3xl md:text-6xl lg:text-8xl font-bold text-transparent outline-text group-hover:text-white/20 transition-colors duration-500">
                            0{i + 1}
                        </h3>
                        <span className="text-lg md:text-3xl lg:text-5xl font-bold text-blend uppercase tracking-tighter group-hover:text-white group-hover:translate-x-[-20px] transition-all duration-500 text-right">
                            {val}
                        </span>
                    </motion.div>
                ))}
            </div>
        </section>


        {/* --- TEAM CTA --- */}
        <section className="py-40 md:py-60 bg-blend text-white px-6 md:px-20 text-center relative overflow-hidden">
           <div className="absolute inset-0 opacity-10 font-black text-[30vw] leading-none pointer-events-none select-none flex items-center justify-center">
              TEAM
           </div>
           <div className="relative z-10 max-w-4xl mx-auto">
              <h2 className="text-5xl md:text-8xl font-black mb-12 tracking-tighter uppercase">Le persone dietro il codice</h2>
              <Link to="/contact" className="inline-block px-14 py-6 bg-white !text-blend rounded-full font-black uppercase tracking-[0.3em] text-xs hover:scale-110 transition-transform shadow-2xl">
                  Unisciti a noi
              </Link>
           </div>
        </section>

      </div>
    </PageTransition>
  );
};

export default About;
