import React, { useState } from "react";
import PageTransition from "../components/Transition";
import { RevealText } from "../components/ui/RevealText";
import { motion } from "framer-motion";
import liquidTexture from "../assets/images/blend-liquid-texture.jpg";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    // Simulazione invio
    setTimeout(() => setStatus("success"), 2000);
  };

  const socials = [
    { name: "Instagram", link: "#" },
    { name: "LinkedIn", link: "#" },
    { name: "Behance", link: "#" },
    { name: "Facebook", link: "#" },
  ];

  return (
    <PageTransition>
      <div className="w-full bg-white min-h-screen">
        
        {/* --- FULLSCREEN HERO --- */}
        <div className="relative h-screen flex flex-col justify-center px-6 md:px-20 overflow-hidden bg-blend-dark text-white">
           {/* Texture only - 0 overlay */}
           <div className="absolute inset-0 z-0">
              <img 
                src={liquidTexture} 
                alt="Background Texture" 
                className="w-full h-full object-cover"
              />
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
                  Contact Us
                </span>
              </motion.div>

              <div className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] xl:text-[12rem] font-extrabold leading-[0.85] tracking-tighter text-white">
                <RevealText text="LET'S" delay={0.2} />
                <div className="text-white/40">
                  <RevealText text="TALK" delay={0.4} />
                </div>
              </div>
              
              <div className="mt-16 max-w-2xl">
                <p className="text-xl md:text-3xl text-white/60 leading-tight font-medium">
                  Hai un progetto visionario? O vuoi semplicemente dire ciao? 
                  Siamo pronti ad ascoltare.
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

        <div className="py-32 md:py-48 px-6 md:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 md:gap-32">
              
              {/* Left Column: Info & Socials */}
              <div className="space-y-24">
                  <div className="flex flex-col gap-8">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blend-light/60 border-b border-gray-100 pb-4">Connect</h3>
                      <div className="flex flex-col gap-6">
                        {socials.map((social, i) => (
                            <motion.a 
                                key={social.name} 
                                href={social.link} 
                                initial={{ x: 0, opacity: 0.5 }}
                                whileHover={{ x: 20, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="text-4xl md:text-8xl font-black text-blend tracking-tighter uppercase italic hover:text-blend-light transition-colors duration-300 w-fit"
                            >
                                {social.name}
                            </motion.a>
                        ))}
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16 border-t border-gray-100 pt-16">
                       <div>
                          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blend-light/60 mb-6">Contact Info</h3>
                          <p className="text-2xl font-black text-blend uppercase tracking-tighter italic mb-2">hello@blendstudio.it</p>
                          <p className="text-2xl font-black text-blend uppercase tracking-tighter italic">+39 049 123 4567</p>
                       </div>
                       <div>
                          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blend-light/60 mb-6">Visit Us</h3>
                          <p className="text-2xl font-black text-blend uppercase tracking-tighter italic mb-2">Via della Creatività, 12</p>
                          <p className="text-2xl font-black text-blend uppercase tracking-tighter italic">35100 Padova, IT</p>
                       </div>
                  </div>
              </div>


              {/* Right Column: Form */}
              <div className="relative">
                  <div className="sticky top-32 bg-white p-8 md:p-16 border border-gray-100 shadow-2xl rounded-sm">
                      <h3 className="text-3xl font-black text-blend uppercase tracking-tighter italic mb-12">Drop a message</h3>
                      <form onSubmit={handleSubmit} className="space-y-12">
                          <div className="relative group">
                              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-blend transition-colors">Nome</label>
                              <input 
                                  type="text" 
                                  className="w-full bg-transparent border-b border-gray-100 py-4 text-2xl text-blend font-bold placeholder-gray-200 focus:outline-none focus:border-blend transition-colors"
                                  value={formData.name}
                                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                                  required 
                              />
                          </div>
                          
                          <div className="relative group">
                              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-blend transition-colors">Email</label>
                              <input 
                                  type="email" 
                                  className="w-full bg-transparent border-b border-gray-100 py-4 text-2xl text-blend font-bold placeholder-gray-200 focus:outline-none focus:border-blend transition-colors"
                                  value={formData.email}
                                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                                  required 
                              />
                          </div>

                          <div className="relative group">
                              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-blend transition-colors">Messaggio</label>
                              <textarea 
                                  rows="4"
                                  className="w-full bg-transparent border-b border-gray-100 py-4 text-2xl text-blend font-bold placeholder-gray-200 focus:outline-none focus:border-blend transition-colors resize-none"
                                  value={formData.message}
                                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                                  required 
                              ></textarea>
                          </div>

                          <div className="pt-8">
                              <button 
                                  type="submit" 
                                  disabled={status === "sending" || status === "success"}
                                  className="w-full py-6 bg-blend text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-full hover:scale-[1.02] transition-all disabled:opacity-70 shadow-xl"
                              >
                                  {status === "sending" ? "Invio in corso..." : status === "success" ? "Messaggio Inviato!" : "Invia Messaggio"}
                              </button>
                          </div>
                      </form>
                  </div>
              </div>

          </div>
        </div>

      </div>
    </PageTransition>
  );
};

export default Contact;