import React from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import PageTransition from "../components/Transition";
import { RevealText } from "../components/ui/RevealText";
import Marquee from "../components/ui/Marquee";

const Home = () => {
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const clients = [
    "Google", "Nike", "Spotify", "Tesla", "Airbnb", "Vogue", "Prada", "SpaceX"
  ].map(client => (
    <span className="text-4xl md:text-6xl font-bold uppercase text-transparent stroke-text opacity-30 hover:opacity-100 transition-opacity duration-300 cursor-default">
      {client}
    </span>
  ));

  return (
    <PageTransition>
      <div className="w-full overflow-hidden bg-white">
        
        {/* --- HERO SECTION --- */}
        <header className="relative h-screen flex flex-col justify-center px-6 md:px-20 overflow-hidden">
          {/* Video Background */}
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover z-0"
          >
            <source src="https://blendstudio.it/wp-content/uploads/2024/01/Blend-Showreel_V5.mp4" type="video/mp4" />
          </video>
          
          <div className="absolute inset-0 bg-black/40 z-0"></div>

          <div className="max-w-[90rem] mt-10 md:mt-20 z-10 relative">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex items-center gap-4 mb-6 md:mb-10"
            >
              <div className="h-[2px] w-12 bg-white"></div>
              <span className="text-white/90 font-bold uppercase tracking-[0.2em] text-xs md:text-sm">
                Digital Creative Experience
              </span>
            </motion.div>

            <div className="text-6xl md:text-8xl lg:text-[10rem] font-extrabold leading-[0.85] tracking-tighter text-white">
              <RevealText text="WE CRAFT" delay={0.2} />
              <div className="text-white/80">
                <RevealText text="DIGITAL" delay={0.4} />
              </div>
              <RevealText text="EMOTIONS" delay={0.6} />
            </div>

            <div className="hidden md:flex justify-end mt-16 pr-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="max-w-md text-lg md:text-xl font-medium leading-relaxed text-white/80"
              >
                Trasformiamo le idee in esperienze digitali fluide. 
                Design minimale, tecnologia solida, impatto reale.
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
            className="absolute bottom-10 left-6 md:left-20 flex flex-col items-center gap-2 z-10"
          >
            <span className="text-[10px] uppercase tracking-widest text-white font-bold rotate-90 origin-left translate-x-4">Scroll</span>
            <div className="w-[1px] h-16 bg-white/50 mt-8"></div>
          </motion.div>
        </header>


        {/* --- MARQUEE CLIENTS --- */}
        <section className="py-12 bg-black border-b border-white/10 overflow-hidden">
           <Marquee items={clients} speed={40} className="text-white" />
        </section>


        {/* --- STATEMENT SECTION --- */}
        <section className="py-20 md:py-40 px-6 md:px-20 bg-white relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
            <div className="md:col-span-4 sticky top-32">
              <span className="block w-3 h-3 bg-blend rounded-full mb-4"></span>
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Lo Studio</h3>
            </div>
            <div className="md:col-span-8">
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                <p className="text-3xl md:text-5xl lg:text-6xl font-bold text-blend leading-tight mb-10">
                  Non creiamo solo siti web. <br />
                  <span className="text-blend-light">Costruiamo ecosistemi digitali</span> che raccontano la tua storia.
                </p>
                <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl">
                  In un mondo rumoroso, il silenzio del buon design è l'unico modo per farsi ascoltare. 
                  Lavoriamo all'intersezione tra estetica e funzionalità per garantire risultati misurabili e memorabili.
                </p>
              </motion.div>
              
              <div className="mt-16">
                 <Link to="/services" className="group inline-flex items-center gap-4 text-blend font-bold uppercase tracking-widest hover:text-blend-light transition-all">
                    <span className="border-b-2 border-blend pb-1 group-hover:border-blend-light transition-all">Scopri i servizi</span>
                    <span className="group-hover:translate-x-2 transition-transform">→</span>
                 </Link>
              </div>
            </div>
          </div>
        </section>


        {/* --- SELECTED WORKS (Parallax Grid) --- */}
        <section className="py-20 px-6 md:px-20 bg-blend-bg overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 md:mb-32">
                <div className="max-w-2xl">
                    <RevealText text="SELECTED WORKS" className="text-5xl md:text-8xl font-bold text-blend leading-none" />
                    <p className="mt-6 text-blend-dark/60 text-lg">Una selezione dei nostri progetti più recenti.</p>
                </div>
                <Link to="/projects" className="hidden md:block px-8 py-4 border border-blend rounded-full text-blend hover:bg-blend hover:text-white transition-all duration-300 uppercase text-xs font-bold tracking-widest">
                    Tutti i progetti
                </Link>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-32 w-full">
                
                {/* Project 01 */}
                <Link to="/projects" className="group cursor-pointer block">
                    <motion.div 
                        whileHover={{ scale: 0.98 }}
                        transition={{ duration: 0.5 }}
                        className="overflow-hidden rounded-sm relative aspect-[4/5]"
                    >
                        <motion.img 
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.7 }}
                            src="https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2668&auto=format&fit=crop" 
                            alt="Project One" 
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                    <div className="mt-6 flex justify-between items-start">
                        <div>
                            <h3 className="text-3xl font-bold text-blend group-hover:translate-x-2 transition-transform duration-300">Architettura Srl</h3>
                            <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider">Web Design / Branding</p>
                        </div>
                    </div>
                </Link>

                {/* Project 02 (Offset) */}
                <Link to="/projects" className="group cursor-pointer block md:mt-40">
                    <motion.div 
                         whileHover={{ scale: 0.98 }}
                         transition={{ duration: 0.5 }}
                         className="overflow-hidden rounded-sm relative aspect-[4/5]"
                    >
                        <motion.img 
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.7 }}
                            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2668&auto=format&fit=crop" 
                            alt="Project Two" 
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                    <div className="mt-6 flex justify-between items-start">
                        <div>
                            <h3 className="text-3xl font-bold text-blend group-hover:translate-x-2 transition-transform duration-300">Minimalist Rebrand</h3>
                            <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider">Strategy / Art Direction</p>
                        </div>
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
        <section className="py-32 md:py-60 px-6 md:px-20 bg-blend text-white flex flex-col items-center justify-center text-center overflow-hidden relative">
            <motion.div style={{ y: yParallax }} className="absolute inset-0 opacity-10 pointer-events-none">
                 <h1 className="text-[20vw] font-bold leading-none text-white whitespace-nowrap absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    CREATIVITY
                 </h1>
            </motion.div>

            <p className="text-sm md:text-base font-bold uppercase tracking-widest opacity-70 mb-8 relative z-10">Hai un progetto in mente?</p>
            
            <Link to="/contact" className="group relative z-10">
                <h2 className="text-6xl md:text-9xl font-extrabold tracking-tighter hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-white hover:to-gray-400 transition-all duration-500">
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