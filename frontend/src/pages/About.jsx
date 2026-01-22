import React, { useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useVelocity, useAnimationFrame, useSpring } from "framer-motion";
import { Link } from "react-router-dom";
import PageTransition from "../components/Transition";
import { RevealText } from "../components/ui/RevealText";
import Marquee from "../components/ui/Marquee";

// --- CSS INJECTED FOR PERFORMANCE ---
const styles = `
  @keyframes blob-spin {
    0% { transform: rotate(0deg) scale(1); }
    50% { transform: rotate(180deg) scale(1.1); }
    100% { transform: rotate(360deg) scale(1); }
  }
  @keyframes blob-float {
    0% { transform: translate(0, 0); }
    33% { transform: translate(30px, -50px); }
    66% { transform: translate(-20px, 20px); }
    100% { transform: translate(0, 0); }
  }
  .animate-blob-spin {
    animation: blob-spin 40s linear infinite;
    will-change: transform;
  }
  .animate-blob-float {
    animation: blob-float 20s ease-in-out infinite;
    will-change: transform;
  }
`;

// --- UTILS ---
const wrap = (min, max, v) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

// 1. Onde Background Ottimizzate
const BlendWaves = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-blend-light/10 rounded-full blur-[80px] animate-blob-float" />
      <div className="absolute bottom-[-10%] left-[-20%] w-[80vw] h-[80vw] bg-blend/5 rounded-full blur-[100px] animate-blob-spin" />
    </div>
  );
};

// 2. Onde Interne Card
const CardWaves = ({ variant }) => {
    const isBlue = variant === 'blue';
    const bgClass1 = isBlue ? 'bg-white/5' : 'bg-blend/5';
    const bgClass2 = isBlue ? 'bg-blend-light/10' : 'bg-blend-light/5';

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 rounded-[3rem]">
            <div className={`absolute -bottom-[20%] -left-[20%] w-[90%] h-[90%] rounded-full blur-[80px] animate-blob-spin ${bgClass1}`} />
            <div className={`absolute top-[10%] -right-[10%] w-[70%] h-[70%] rounded-full blur-[60px] animate-blob-float ${bgClass2}`} />
        </div>
    );
};

// 3. Velocity Text
function ParallaxText({ children, baseVelocity = 100 }) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);
  const directionFactor = useRef(1);

  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    if (velocityFactor.get() < 0) directionFactor.current = -1;
    else if (velocityFactor.get() > 0) directionFactor.current = 1;
    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="overflow-hidden m-0 whitespace-nowrap flex flex-nowrap">
      <motion.div className="font-black text-[15vw] leading-[0.85] tracking-tighter uppercase flex flex-nowrap opacity-10 select-none will-change-transform" style={{ x }}>
        {[...Array(4)].map((_, i) => <span key={i} className="block mr-10">{children}</span>)}
      </motion.div>
    </div>
  );
}

// 4. Highlight Paragraph
const HighlightParagraph = ({ text }) => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 0.9", "start 0.5"]
  });

  return (
    <p ref={container} className="text-3xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tighter uppercase italic flex flex-wrap gap-x-3 relative z-10">
      {text.split(" ").map((word, i) => {
        const start = i / text.split(" ").length;
        const end = start + (1 / text.split(" ").length);
        const opacity = useTransform(scrollYProgress, [start, end], [0.15, 1]);
        return <motion.span key={i} style={{ opacity }} className="text-blend transition-colors duration-200">{word}</motion.span>;
      })}
    </p>
  );
};

// 5. CARD COMPONENT
const Card = ({ i, title, desc, progress, range, targetScale }) => {
  const scale = useTransform(progress, range, [1, targetScale]);
  const isBlueCard = i % 2 === 0;
  const bgColor = isBlueCard ? '#2f6580' : '#ffffff';
  const textColor = isBlueCard ? '#ffffff' : '#2f6580';

  return (
    <div className="h-screen sticky top-0 flex flex-col justify-start">
      <motion.div 
        style={{ scale, backgroundColor: bgColor, color: textColor }} 
        className="relative w-full h-full rounded-t-[3rem] shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col justify-center origin-top border-t border-white/10 will-change-transform"
      >
        <div className="relative z-20 container mx-auto px-6 md:px-20 flex flex-col h-full justify-center pointer-events-none">
            <div className="absolute top-8 left-6 right-6 md:left-20 md:right-20 flex justify-between items-center border-b border-current/20 pb-4 md:pb-6">
               <span className="text-sm md:text-xl font-bold tracking-widest uppercase opacity-60">Principio 0{i + 1}</span>
               <div className="h-2 w-2 rounded-full bg-current"></div>
            </div>
            <div className="mb-6 md:mb-10">
               <h2 className="text-[12vw] md:text-[9vw] font-black uppercase tracking-tighter leading-[0.85] italic">{title}</h2>
            </div>
            <div className="max-w-4xl">
               <p className="text-xl md:text-3xl font-medium leading-tight opacity-90">{desc}</p>
            </div>
            <div className="absolute bottom-8 left-6 md:left-20 opacity-40 text-xs font-bold tracking-widest uppercase">Blend Studio &copy; Values</div>
        </div>
        <CardWaves variant={isBlueCard ? 'blue' : 'white'} />
      </motion.div>
    </div>
  )
}

// --- DATA ---
const galleryImages = [
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1000&auto=format&fit=crop"
];

const values = [
  { title: "Innovazione", desc: "Sfidiamo lo status quo ogni giorno. Non seguiamo i trend, li anticipiamo con coraggio creativo." },
  { title: "Precisione", desc: "Il dettaglio non è un dettaglio. È l'essenza del design che fa la differenza." },
  { title: "Empatia", desc: "Design umano per esseri umani. Mettiamo le emozioni reali al centro di ogni pixel." },
  { title: "Visione", desc: "Guardiamo oltre l'orizzonte digitale per anticipare il futuro." },
  { title: "Qualità", desc: "L'eccellenza è la nostra unica metrica di successo. Senza compromessi." }
];

const About = () => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end']
  });

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 800], [0, 200]);
  const heroScale = useTransform(scrollY, [0, 800], [1, 1.05]);

  return (
    <PageTransition>
      <style>{styles}</style>
      <div className="w-full bg-white min-h-screen relative overflow-hidden">
        
        <BlendWaves />

        {/* --- HERO SECTION --- */}
        <div className="relative h-screen flex flex-col justify-center px-6 md:px-20 overflow-hidden nav-dark-section bg-blend-dark">
           <motion.div style={{ scale: heroScale }} className="absolute inset-0 z-0 will-change-transform">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2670&auto=format&fit=crop" 
                alt="Studio Team" 
                className="w-full h-full object-cover opacity-50 mix-blend-overlay" 
                loading="eager"
              />
              <div className="absolute inset-0 bg-blend-dark/80 mix-blend-multiply"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-blend-dark via-transparent to-transparent"></div>
           </motion.div>
           
           <motion.div style={{ y: heroY }} className="max-w-[100rem] w-full z-10 relative mt-10 md:mt-0 pb-20 will-change-transform">
             <div className="flex items-center gap-4 mb-6 md:mb-10">
               <div className="h-[2px] w-12 bg-white"></div>
               <span className="text-white/90 font-bold uppercase tracking-[0.3em] text-xs md:text-sm">The Studio</span>
             </div>
             <div className="text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] font-black leading-[0.85] tracking-tighter text-white">
               <div className="overflow-hidden"><RevealText text="DIGITAL" delay={0.1} /></div>
               <div className="overflow-hidden text-white/50"><RevealText text="ARTISANS" delay={0.3} /></div>
             </div>
           </motion.div>

           <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 15, 0] }}
            transition={{ delay: 1.5, duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-10 left-10 md:left-20 flex flex-col items-center gap-4 z-10 mix-blend-difference"
          >
            <span className="text-[10px] uppercase tracking-widest text-white font-bold -rotate-90">Scroll</span>
            <div className="w-[1px] h-16 bg-white/60"></div>
          </motion.div>
        </div>

        {/* --- MANIFESTO --- */}
        <div className="py-32 md:py-48 px-6 md:px-20 relative z-10 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                <div className="md:col-span-3 sticky top-40 h-fit">
                   <div className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-blend rounded-full animate-pulse"></span>
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Manifesto</span>
                   </div>
                </div>
                <div className="md:col-span-9">
                   <HighlightParagraph text="Siamo un collettivo di creativi, sviluppatori e strateghi. Crediamo che il digitale non sia solo codice, ma un'estensione dell'identità umana." />
                   <p className="mt-12 text-lg md:text-xl text-gray-500 max-w-2xl font-medium leading-relaxed">
                     Non ci accontentiamo del "funzionale". Cerchiamo il memorabile. Ogni pixel è posizionato con intenzione, ogni interazione è progettata per evocare un'emozione. Siamo gli architetti della tua presenza digitale.
                   </p>
                </div>
            </div>
        </div>

        {/* --- GALLERY MARQUEE --- */}
        <section className="py-20 bg-white border-y border-gray-100 relative z-10">
            <Marquee 
              speed={40} 
              items={galleryImages.map((src, i) => (
                <div key={i} className="w-[300px] md:w-[450px] aspect-[4/3] overflow-hidden rounded-2xl mx-4 grayscale hover:grayscale-0 transition-all duration-700 group cursor-pointer relative shadow-lg">
                  <img src={src} alt="Studio Life" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" loading="lazy" />
                  <div className="absolute inset-0 bg-blend/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              ))} 
            />
        </section>

        {/* --- PHILOSOPHY --- */}
        <section className="py-32 md:py-48 px-6 md:px-20 bg-white relative z-10">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
             <motion.div 
               initial={{ opacity: 0, x: -30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8 }}
             >
                 <h2 className="text-6xl md:text-8xl font-black text-blend mb-8 tracking-tighter uppercase italic">Il Metodo</h2>
                 <div className="h-1 w-20 bg-blend mb-8"></div>
                 <p className="text-gray-500 text-xl md:text-2xl leading-relaxed mb-8 font-medium">
                    Uniamo la precisione ingegneristica e l'intuizione artistica. 
                    Ogni progetto nasce da una profonda analisi dei dati e fiorisce attraverso un design emotivo.
                 </p>
                 <ul className="space-y-4">
                    {["Ricerca & Strategia", "Design & Prototipazione", "Sviluppo & Tuning", "Lancio & Crescita"].map((step, i) => (
                      <li key={i} className="flex items-center gap-4 text-blend font-bold uppercase tracking-widest text-xs md:text-sm">
                        <span className="w-6 h-6 border border-blend rounded-full flex items-center justify-center text-[10px]">{i+1}</span>
                        {step}
                      </li>
                    ))}
                 </ul>
             </motion.div>
             <motion.div 
               className="relative aspect-[4/5] bg-gray-100 overflow-hidden rounded-[2rem] shadow-xl"
               initial={{ clipPath: "inset(100% 0 0 0)" }}
               whileInView={{ clipPath: "inset(0 0 0 0)" }}
               viewport={{ once: true }}
               transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
             >
                 <img 
                   src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop" 
                   alt="Abstract Blend" 
                   className="w-full h-full object-cover hover:scale-110 transition-all duration-[1.5s]"
                   loading="lazy"
                 />
             </motion.div>
           </div>
        </section>

        {/* --- VALUES 3D DECK --- */}
        <section ref={container} className="relative z-10 bg-white">
            <div className="pt-20 pb-10 text-center bg-white relative z-20">
               <h2 className="text-sm font-bold uppercase tracking-[0.4em] text-gray-400 mb-4">Core Values</h2>
               <p className="text-6xl md:text-8xl lg:text-[7rem] font-black text-blend uppercase tracking-tighter">Ciò in cui crediamo</p>
            </div>
            
            <div className="pb-20">
              {values.map((val, i) => {
                 const targetScale = 1 - ( (values.length - i) * 0.04 );
                 return <Card key={i} i={i} {...val} progress={scrollYProgress} range={[i * .25, 1]} targetScale={targetScale} />
              })}
            </div>
        </section>

        {/* --- TEAM CTA (BUTTON VETRO/DARK) --- */}
        <section className="py-40 md:py-60 bg-blend text-white text-center overflow-hidden relative nav-dark-section z-10">
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 select-none">
              <ParallaxText baseVelocity={-2}>JOIN THE TEAM JOIN THE TEAM</ParallaxText>
           </div>
           
           <div className="relative z-10 max-w-4xl mx-auto px-6">
              <h2 className="text-5xl md:text-8xl font-black mb-12 tracking-tighter uppercase">Le persone dietro il codice</h2>
              
              {/* BUTTON MODIFICATO: Glassmorphism / Non bianco solido */}
              <Link 
                to="/contact" 
                className="group relative inline-flex items-center gap-4 px-14 py-6 bg-white/5 backdrop-blur-lg border border-white/20 text-white rounded-full font-black uppercase tracking-[0.2em] text-xs hover:bg-white/10 transition-all duration-500 hover:shadow-[0_0_24px_rgba(255,255,255,0.12)]"
                style={{ forcedColorAdjust: 'none' }}
              >
                  <span className="relative z-10">Unisciti a noi</span>
                  <span className="relative z-10 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
           </div>
        </section>

      </div>
    </PageTransition>
  );
};

export default About;