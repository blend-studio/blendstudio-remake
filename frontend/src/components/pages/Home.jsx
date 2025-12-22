import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageTransition from "../components/Transition";
import { RevealText } from "../components/ui/RevealText";

const Home = () => {
  return (
    <PageTransition>
      <div className="w-full overflow-hidden">
        
        {/* --- HERO SECTION --- */}
        <header className="relative h-screen flex flex-col justify-center px-6 md:px-20 overflow-hidden bg-blend-bg">
          
          {/* Elemento decorativo animato (Background Blob) */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -right-[10%] top-[10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-blend/5 rounded-full blur-[100px] -z-10"
          />

          <div className="max-w-[90rem] mt-10 md:mt-20 z-10">
            {/* Label Introduttiva */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex items-center gap-4 mb-6 md:mb-10"
            >
              <div className="h-[2px] w-12 bg-blend"></div>
              <span className="text-blend font-bold uppercase tracking-[0.2em] text-xs md:text-sm">
                Digital Creative Experience
              </span>
            </motion.div>

            {/* Titolo Gigante */}
            <div className="text-6xl md:text-8xl lg:text-[10rem] font-extrabold leading-[0.85] tracking-tighter text-blend mix-blend-multiply">
              <RevealText text="WE CRAFT" delay={0.2} />
              {/* 'DIGITAL' in outline/stroke effect se volessimo, qui usiamo un colore leggermente diverso */}
              <div className="text-blend-light/80">
                <RevealText text="DIGITAL" delay={0.4} />
              </div>
              <RevealText text="EMOTIONS" delay={0.6} />
            </div>

            {/* Descrizione laterale (Desktop only) */}
            <div className="hidden md:flex justify-end mt-16 pr-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="max-w-md text-lg md:text-xl font-medium leading-relaxed text-blend-dark/70"
              >
                Trasformiamo le idee in esperienze digitali fluide. 
                Design minimale, tecnologia solida, impatto reale.
              </motion.div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
            className="absolute bottom-10 left-6 md:left-20 flex flex-col items-center gap-2"
          >
            <span className="text-[10px] uppercase tracking-widest text-blend font-bold rotate-90 origin-left translate-x-4">Scroll</span>
            <div className="w-[1px] h-16 bg-blend/30 mt-8"></div>
          </motion.div>
        </header>


        {/* --- STATEMENT SECTION --- */}
        <section className="py-20 md:py-40 px-6 md:px-20 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-4">
              <span className="block w-3 h-3 bg-blend rounded-full mb-4"></span>
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Lo Studio</h3>
            </div>
            <div className="md:col-span-8">
              <motion.p 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-3xl md:text-5xl font-bold text-blend leading-tight"
              >
                Non creiamo solo siti web. <span className="text-blend-light">Costruiamo ecosistemi digitali</span> che raccontano la tua storia attraverso performance tecniche eccellenti e un design senza tempo.
              </motion.p>
              
              <div className="mt-12">
                 <Link to="/services" className="inline-block border-b-2 border-blend pb-1 text-blend font-bold uppercase tracking-widest hover:text-blend-light hover:border-blend-light transition-all">
                    Scopri i servizi
                 </Link>
              </div>
            </div>
          </div>
        </section>


        {/* --- SELECTED WORKS (Griglia Asimmetrica) --- */}
        <section className="py-20 px-6 md:px-20 bg-blend-bg">
            <div className="flex justify-between items-end mb-20">
                <RevealText text="SELECTED WORKS" className="text-5xl md:text-8xl font-bold text-blend" />
                <Link to="/projects" className="hidden md:block px-8 py-4 border border-blend rounded-full text-blend hover:bg-blend hover:text-white transition-all duration-300 uppercase text-xs font-bold tracking-widest">
                    Tutti i progetti
                </Link>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-32 w-full">
                
                {/* Project 01 (Sinistra - Alto) */}
                <Link to="/projects" className="group cursor-pointer block">
                    <div className="overflow-hidden rounded-sm relative aspect-[4/5]">
                        <div className="absolute inset-0 bg-blend/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                        <img 
                            src="https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2668&auto=format&fit=crop" 
                            alt="Project One" 
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[1.2s] ease-[0.25,1,0.5,1]"
                        />
                    </div>
                    <div className="mt-6 flex justify-between items-start">
                        <div>
                            <h3 className="text-2xl font-bold text-blend group-hover:translate-x-2 transition-transform duration-300">Architettura Srl</h3>
                            <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider">Web Design / Branding</p>
                        </div>
                        <span className="text-blend opacity-0 group-hover:opacity-100 transition-opacity duration-300">↗</span>
                    </div>
                </Link>

                {/* Project 02 (Destra - Basso - Margin Top) */}
                <Link to="/projects" className="group cursor-pointer block md:mt-40">
                    <div className="overflow-hidden rounded-sm relative aspect-[4/5]">
                        <div className="absolute inset-0 bg-blend/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                        <img 
                            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2668&auto=format&fit=crop" 
                            alt="Project Two" 
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[1.2s] ease-[0.25,1,0.5,1]"
                        />
                    </div>
                    <div className="mt-6 flex justify-between items-start">
                        <div>
                            <h3 className="text-2xl font-bold text-blend group-hover:translate-x-2 transition-transform duration-300">Minimalist Rebrand</h3>
                            <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider">Strategy / Art Direction</p>
                        </div>
                        <span className="text-blend opacity-0 group-hover:opacity-100 transition-opacity duration-300">↗</span>
                    </div>
                </Link>

            </div>
            
            <div className="mt-20 text-center md:hidden">
                <Link to="/projects" className="inline-block px-8 py-4 border border-blend rounded-full text-blend uppercase text-xs font-bold tracking-widest">
                    Vedi tutto
                </Link>
            </div>
        </section>


        {/* --- BIG CTA SECTION --- */}
        <section className="py-32 md:py-60 px-6 md:px-20 bg-blend text-white flex flex-col items-center justify-center text-center">
            <p className="text-sm md:text-base font-bold uppercase tracking-widest opacity-70 mb-8">Hai un progetto in mente?</p>
            
            <Link to="/contact" className="group relative">
                <h2 className="text-6xl md:text-9xl font-extrabold tracking-tighter hover:text-blend-bg transition-colors duration-500">
                    LET'S TALK
                </h2>
                <div className="h-1 w-0 bg-white group-hover:w-full transition-all duration-500 mt-2"></div>
            </Link>
        </section>

      </div>
    </PageTransition>
  );
};

export default Home;