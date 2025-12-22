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
        
        {/* --- VISUAL HERO --- */}
        <div className="relative h-[80vh] md:h-screen flex items-center justify-center px-6 md:px-20 overflow-hidden bg-black">
           {/* Background Visual */}
           <div className="absolute inset-0 opacity-60">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2670&auto=format&fit=crop" 
                alt="Studio Team" 
                className="w-full h-full object-cover"
              />
           </div>
           
           <div className="relative z-10 text-center text-white">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-4 mb-8"
              >
                <div className="h-[2px] w-12 bg-white"></div>
                <span className="font-bold uppercase tracking-[0.2em] text-xs md:text-sm">
                  Chi Siamo
                </span>
                <div className="h-[2px] w-12 bg-white"></div>
              </motion.div>

              <h1 className="text-6xl md:text-9xl lg:text-[10rem] font-extrabold tracking-tighter leading-[0.9] text-white">
                <div className="overflow-hidden"><RevealText text="DIGITAL" /></div>
                <div className="overflow-hidden text-white/80"><RevealText text="ARTISANS" delay={0.2} /></div>
              </h1>
           </div>
        </div>

        {/* --- INTRO TEXT --- */}
        <div className="py-20 md:py-32 px-6 md:px-20 grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-8 md:col-start-3 text-center">
               <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-2xl md:text-4xl font-medium leading-relaxed text-blend-dark"
               >
                 Siamo un collettivo di creativi, sviluppatori e strateghi. 
                 Crediamo che il digitale non sia solo codice, ma un'estensione dell'identità umana.
               </motion.p>
            </div>
        </div>

        {/* --- GALLERY MARQUEE --- */}
        <section className="py-20 -mx-6 md:-mx-20 overflow-hidden bg-gray-50">
            <Marquee items={galleryImages} speed={50} />
        </section>

        {/* --- PHILOSOPHY --- */}
        <section className="py-20 px-6 md:px-20">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                 <h2 className="text-4xl md:text-6xl font-bold text-blend mb-8">Il Metodo Blend</h2>
                 <p className="text-gray-500 text-lg md:text-xl leading-relaxed">
                    Uniamo (Blend) due mondi spesso distanti: la precisione ingegneristica e l'intuizione artistica. 
                    Ogni progetto nasce da una profonda analisi dei dati e fiorisce attraverso un design emotivo.
                    Non seguiamo i trend, cerchiamo di definire quelli di domani.
                 </p>
              </div>
              <div className="relative h-[600px] bg-blend-bg overflow-hidden rounded-sm">
                 <img 
                    src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop" 
                    alt="Abstract Blend" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-[1.5s]"
                 />
              </div>
           </div>
        </section>


        {/* --- VALUES --- */}
        <section className="py-20 md:py-32 px-6 md:px-20">
            <div className="flex flex-col gap-0">
                {["Innovazione", "Precisione", "Empatia", "Visione"].map((val, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 0.6 }}
                        className="group border-b border-gray-200 py-10 md:py-16 flex justify-between items-center cursor-default hover:bg-gray-50 transition-colors px-4 -mx-4"
                    >
                        <h3 className="text-5xl md:text-8xl font-bold text-transparent stroke-text group-hover:text-blend transition-colors duration-500">
                            0{i + 1}
                        </h3>
                        <span className="text-3xl md:text-6xl font-bold text-blend uppercase tracking-widest group-hover:translate-x-[-20px] transition-transform duration-500">
                            {val}
                        </span>
                    </motion.div>
                ))}
            </div>
        </section>


        {/* --- TEAM --- */}
        <section className="py-20 md:py-40 bg-blend text-white px-6 md:px-20">
           <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-bold mb-10">Le persone dietro il codice</h2>
              <p className="text-xl md:text-2xl text-white/70 mb-12">
                 Siamo un team distribuito ma unito dalla stessa passione per l'eccellenza.
                 Nessun ego, solo grandi idee.
              </p>
              <Link to="/contact" className="inline-block px-12 py-5 bg-white text-blend rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform">
                  Unisciti a noi
              </Link>
           </div>
        </section>

      </div>
    </PageTransition>
  );
};

export default About;