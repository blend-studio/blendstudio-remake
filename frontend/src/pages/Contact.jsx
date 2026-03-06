import React, { useState, useRef } from "react";
import PageTransition from "../components/Transition";
import { RevealText } from "../components/ui/RevealText";
import { motion } from "framer-motion";
import LazyVideo from "../components/ui/LazyVideo";
import usePageContent from "../hooks/usePageContent";
import { useTelemetry } from "../hooks/useTelemetry";

const DEFAULT_CONTACT = {
  hero: { eyebrow: "Contatti", line1: "LET'S", line2: "TALK", subtitle: "Hai un progetto visionario? O vuoi semplicemente dire ciao? Siamo pronti ad ascoltare." }
};

const Contact = () => {
  const { content } = usePageContent('contact', DEFAULT_CONTACT);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", budget: "", message: "" });
  const [status, setStatus] = useState(null);
  const { track } = useTelemetry();
  const formStarted = useRef(false);

  // Traccia il primo focus sul form (utente ha iniziato a compilare)
  const handleFormStart = () => {
    if (!formStarted.current) {
      formStarted.current = true;
      track('contact_form_start', { page: '/contact' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    track('contact_form_submit', { budget: formData.budget || 'non specificato' });
    setTimeout(() => setStatus("success"), 2000);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.76, 0, 0.24, 1] } }
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.15 } }
  };

  const budgetOptions = ["< €5.000", "€5.000 - €15.000", "€15.000 - €30.000", "> €30.000"];

  return (
    <PageTransition>
      <div className="w-full bg-white min-h-screen">
        
        {/* --- FULLSCREEN HERO --- */}
        <div className="relative h-screen flex flex-col justify-center px-6 md:px-20 overflow-hidden bg-black text-white nav-dark-section">
           <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-black">
              <LazyVideo 
                src={`${import.meta.env.BASE_URL}videos/sfondo.mp4`}
                mobileSrc={`${import.meta.env.BASE_URL}videos/sfondo-mobile.mp4`}
                autoPlay loop muted playsInline 
                className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover scale-[1.1] opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
           </div>
           
           <div className="max-w-[90rem] w-full z-10 relative pt-[15vh] pb-[12vh]">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="flex items-center gap-4 mb-6 md:mb-10"
              >
                <div className="h-[2px] w-12 bg-white/60"></div>
                <span className="text-white/80 font-bold uppercase tracking-[0.3em] text-[10px] md:text-sm">
                  {content.hero.eyebrow}
                </span>
              </motion.div>

              <div className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] xl:text-[12rem] font-extrabold leading-[0.85] tracking-tight text-white">
                <RevealText text={content.hero.line1} delay={0.2} />
                <div className="text-white/30">
                  <RevealText text={content.hero.line2} delay={0.4} />
                </div>
              </div>
              
              <div className="mt-12 md:mt-16 max-w-2xl overflow-hidden">
                <motion.p 
                  initial={{ opacity: 0, y: "100%" }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 1, ease: [0.76, 0, 0.24, 1] }}
                  className="text-xl md:text-3xl text-white/50 leading-tight font-medium"
                >
                  {content.hero.subtitle}
                </motion.p>
              </div>
           </div>

           <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 15, 0] }}
            transition={{ delay: 2, duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="hidden md:flex absolute bottom-10 left-6 md:left-20 flex-col items-center gap-3 z-10"
          >
            <span className="text-[9px] uppercase tracking-[0.3em] text-white/50 font-bold rotate-90 origin-left translate-x-3">Scroll</span>
            <div className="w-[1px] h-12 bg-white/30 mt-6"></div>
          </motion.div>
        </div>


        {/* ======================== */}
        {/* GIANT SOCIAL LINKS BAND */}
        {/* ======================== */}
        <div className="py-16 md:py-24 border-b border-gray-100 overflow-hidden">
          <motion.div 
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="max-w-[90rem] mx-auto px-6 md:px-20"
          >
            <motion.h3 variants={fadeUp} className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 mb-10">Seguici</motion.h3>
            <div className="flex flex-col md:flex-row gap-4 md:gap-16">
              {[
                { name: "Instagram", abbr: "IG", link: "#" },
                { name: "LinkedIn", abbr: "LI", link: "#" },
                { name: "Facebook", abbr: "FB", link: "#" },
              ].map((social, i) => (
                <motion.a
                  key={social.name}
                  href={social.link}
                  variants={fadeUp}
                  className="group flex items-center gap-6 py-4"
                  whileHover={{ x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-4xl md:text-7xl font-black text-blend tracking-tighter uppercase italic group-hover:text-blend-light transition-colors duration-300">
                    {social.name}
                  </span>
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-blend/30 group-hover:text-blend-light group-hover:translate-x-2 transition-all duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>


        {/* ======================== */}
        {/* MAIN FORM + INFO AREA   */}
        {/* ======================== */}
        <div className="relative">
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blend/3 rounded-full blur-[200px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blend-light/5 rounded-full blur-[150px] pointer-events-none"></div>

          <div className="max-w-[90rem] mx-auto px-6 md:px-20 py-32 md:py-48 relative z-10">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24">

              {/* ====== FORM (Dark Card) ====== */}
              <motion.div 
                className="lg:col-span-8"
                variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
              >
                <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-black text-blend tracking-tighter uppercase italic mb-10">Raccontaci il tuo progetto.</motion.h2>
                <div className="bg-blend-dark rounded-[2rem] p-8 md:p-16 relative overflow-hidden">
                  {/* Subtle glow */}
                  <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blend/20 rounded-full blur-[120px] pointer-events-none"></div>
                  
                  <form onSubmit={handleSubmit} className="relative z-10 space-y-0">
                    {/* Row 1: Name + Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-12">
                      <motion.div variants={fadeUp} className="border-b border-white/10 py-8 group">
                        <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-3 group-focus-within:text-white/60 transition-colors">Nome *</label>
                        <input 
                          type="text" 
                          placeholder="Il tuo nome"
                          className="w-full bg-transparent text-xl md:text-2xl text-white font-bold placeholder-white/15 focus:outline-none focus:placeholder-white/30 transition-colors"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          onFocus={handleFormStart}
                          required 
                        />
                      </motion.div>
                      <motion.div variants={fadeUp} className="border-b border-white/10 py-8 group">
                        <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-3 group-focus-within:text-white/60 transition-colors">Email *</label>
                        <input 
                          type="email" 
                          placeholder="La tua email"
                          className="w-full bg-transparent text-xl md:text-2xl text-white font-bold placeholder-white/15 focus:outline-none focus:placeholder-white/30 transition-colors"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          required 
                        />
                      </motion.div>
                    </div>

                    {/* Row 2: Phone */}
                    <motion.div variants={fadeUp} className="border-b border-white/10 py-8 group">
                      <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-3 group-focus-within:text-white/60 transition-colors">Telefono</label>
                      <input 
                        type="tel" 
                        placeholder="+39 ..."
                        className="w-full bg-transparent text-xl md:text-2xl text-white font-bold placeholder-white/15 focus:outline-none focus:placeholder-white/30 transition-colors"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </motion.div>

                    {/* Row 3: Budget Selector */}
                    <motion.div variants={fadeUp} className="border-b border-white/10 py-8">
                      <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-6">Budget indicativo</label>
                      <div className="flex flex-wrap gap-3">
                        {budgetOptions.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => { setFormData({...formData, budget: opt}); track('contact_budget_select', { budget: opt }); }}
                            className={`px-6 py-3 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer border ${
                              formData.budget === opt 
                                ? "!bg-white !text-blend-dark !border-white shadow-lg shadow-white/10" 
                                : "!bg-transparent !text-white/50 !border-white/10 hover:!border-white/30 hover:!text-white/80"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </motion.div>

                    {/* Row 4: Message */}
                    <motion.div variants={fadeUp} className="border-b border-white/10 py-8 group">
                      <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-3 group-focus-within:text-white/60 transition-colors">Il tuo progetto *</label>
                      <textarea 
                        rows="5"
                        placeholder="Raccontaci cosa hai in mente..."
                        className="w-full bg-transparent text-xl md:text-2xl text-white font-bold placeholder-white/15 focus:outline-none focus:placeholder-white/30 transition-colors resize-none"
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        required 
                      ></textarea>
                    </motion.div>

                    {/* Submit */}
                    <motion.div variants={fadeUp} className="pt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      <button 
                        type="submit" 
                        disabled={status === "sending" || status === "success"}
                        className={`group relative px-16 py-7 rounded-full font-black uppercase tracking-[0.2em] text-xs transition-all duration-500 cursor-pointer overflow-hidden ${
                          status === "success" 
                            ? "bg-green-400 text-black" 
                            : "bg-white text-blend-dark hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-[1.03]"
                        } disabled:opacity-70`}
                      >
                        <span className="relative z-10">
                          {status === "sending" ? "Invio in corso..." : status === "success" ? "✓ Messaggio Inviato!" : "Invia Messaggio →"}
                        </span>
                      </button>
                      <p className="text-white/20 text-[10px] uppercase tracking-widest font-bold max-w-[200px]">
                        Rispondiamo entro 24 ore lavorative
                      </p>
                    </motion.div>
                  </form>
                </div>
              </motion.div>

              {/* ====== INFO SIDEBAR ====== */}
              <motion.div 
                className="lg:col-span-4"
                variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
              >
                <div className="lg:sticky lg:top-32 space-y-12">

                  {/* Email */}
                  <motion.a variants={fadeUp} href="mailto:info@blendstudio.it" onClick={() => track('contact_email_click')} className="group block p-8 rounded-2xl border border-gray-100 hover:border-blend/20 hover:shadow-xl hover:shadow-blend/5 transition-all duration-500">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-blend/5 flex items-center justify-center text-blend group-hover:bg-blend group-hover:text-white transition-all duration-300">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Email</span>
                    </div>
                    <p className="text-2xl md:text-3xl font-black text-blend tracking-tight group-hover:text-blend-light transition-colors">info@blendstudio.it</p>
                  </motion.a>

                  {/* Phone */}
                  <motion.a variants={fadeUp} href="tel:+393520390732" onClick={() => track('contact_phone_click')} className="group block p-8 rounded-2xl border border-gray-100 hover:border-blend/20 hover:shadow-xl hover:shadow-blend/5 transition-all duration-500">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-blend/5 flex items-center justify-center text-blend group-hover:bg-blend group-hover:text-white transition-all duration-300">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Telefono</span>
                    </div>
                    <p className="text-2xl md:text-3xl font-black text-blend tracking-tight group-hover:text-blend-light transition-colors">+39 352 039 0732</p>
                  </motion.a>

                  {/* Address */}
                  <motion.div variants={fadeUp} className="p-8 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-blend/5 flex items-center justify-center text-blend">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Sede</span>
                    </div>
                    <p className="text-2xl md:text-3xl font-black text-blend tracking-tight mb-2">Strada Val Nure 16/I</p>
                    <p className="text-lg text-gray-400 font-medium">29122 Piacenza, Italia</p>
                  </motion.div>

                  {/* Hours */}
                  <motion.div variants={fadeUp} className="p-8 rounded-2xl bg-gray-50">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-blend/5 flex items-center justify-center text-blend">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Orari</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-blend uppercase tracking-wider">Lun — Ven</span>
                        <span className="text-sm font-black text-blend">09:00 — 18:00</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Sab — Dom</span>
                        <span className="text-sm font-black text-gray-400">Chiuso</span>
                      </div>
                    </div>
                  </motion.div>

                </div>
              </motion.div>

            </div>
          </div>
        </div>


        {/* ============================ */}
        {/* MAP SECTION                  */}
        {/* ============================ */}
        <section className="bg-black text-white py-32 md:py-48 overflow-hidden relative nav-dark-section">
           <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blend rounded-full blur-[150px] opacity-20 pointer-events-none"></div>
           <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blend-light rounded-full blur-[200px] opacity-10 pointer-events-none"></div>

           <div className="max-w-[90rem] mx-auto px-6 md:px-20 relative z-10">
              <motion.div 
                variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-10"
              >
                 <div>
                    <motion.h2 variants={fadeUp} className="text-5xl md:text-8xl font-black uppercase tracking-tighter italic">Base Operativa</motion.h2>
                    <motion.p variants={fadeUp} className="text-white/60 text-xl mt-4 max-w-lg">Dove le idee prendono forma. Vieni a trovarci per un caffè e due chiacchiere sul futuro.</motion.p>
                 </div>
                 <motion.div variants={fadeUp} className="flex items-center gap-4">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Piacenza, IT</span>
                    <div className="w-16 h-[1px] bg-white/30"></div>
                 </motion.div>
              </motion.div>

              <motion.div 
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="w-full h-[60vh] md:h-[75vh]"
              >
                  <div className="w-full h-full overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 group bg-[#1a1a1a] relative rounded-2xl">
                      <div className="w-full h-full relative">
                         <iframe 
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2819.78907623281!2d9.684598676588122!3d45.02920706235652!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4780c330d18c59c7%3A0x1980fc7c642a1922!2sBlend%20Studio%20%7C%20Mixed%20Creativity!5e0!3m2!1sit!2sit!4v1769083613436!5m2!1sit!2sit" 
                            width="100%" 
                            height="100%" 
                            style={{ border: 0 }} 
                            allowFullScreen="" 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                            className="grayscale contrast-[1.1] group-hover:grayscale-0 transition-all duration-1000 ease-in-out"
                         ></iframe>
                         
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none opacity-100 group-hover:opacity-0 transition-opacity duration-500">
                            <div className="absolute bottom-10 left-10">
                               <h3 className="text-3xl font-bold uppercase italic">Blend Studio</h3>
                               <p className="text-sm opacity-70">Mixed Creativity</p>
                            </div>
                         </div>
                      </div>
                  </div>
              </motion.div>
           </div>
        </section>

      </div>
    </PageTransition>
  );
};

export default Contact;