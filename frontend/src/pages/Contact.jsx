import React, { useState } from "react";
import PageTransition from "../components/Transition";
import { RevealText } from "../components/ui/RevealText";
import { motion } from "framer-motion";

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
      <div className="pt-32 md:pt-48 pb-20 px-6 md:px-20 min-h-screen bg-white text-blend relative overflow-hidden">
        
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blend/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 relative z-10">
            
            {/* Left Column: Info & Socials */}
            <div>
                <RevealText text="LET'S TALK" className="text-6xl md:text-9xl font-bold mb-10 text-blend leading-none" />
                <p className="text-xl md:text-2xl text-gray-500 max-w-md mb-20 leading-relaxed font-medium">
                    Hai un progetto visionario? O vuoi semplicemente dire ciao? 
                    Siamo pronti ad ascoltare.
                </p>

                <div className="flex flex-col gap-6 mb-20">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-blend/40 mb-2">Connect</h3>
                    {socials.map((social, i) => (
                        <motion.a 
                            key={social.name} 
                            href={social.link} 
                            initial={{ x: 0, opacity: 0.8 }}
                            whileHover={{ x: 20, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="text-4xl md:text-6xl font-bold hover:text-blend-light transition-colors duration-300 w-fit text-blend"
                        >
                            {social.name}
                        </motion.a>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-blend/40 mb-4">Contact Info</h3>
                        <p className="text-xl font-medium mb-1 text-blend">hello@blendstudio.it</p>
                        <p className="text-xl font-medium text-blend">+39 049 123 4567</p>
                     </div>
                     <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-blend/40 mb-4">Visit Us</h3>
                        <p className="text-xl font-medium mb-1 text-blend">Via della Creatività, 12</p>
                        <p className="text-xl font-medium text-blend">35100 Padova, IT</p>
                     </div>
                </div>
            </div>


            {/* Right Column: Form */}
            <div className="lg:mt-10">
                <div className="bg-gray-50 p-8 md:p-14 rounded-2xl border border-gray-100 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="relative group">
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 group-focus-within:text-blend transition-colors">Nome</label>
                            <input 
                                type="text" 
                                className="w-full bg-transparent border-b border-gray-200 py-3 text-xl text-blend placeholder-gray-300 focus:outline-none focus:border-blend transition-colors"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required 
                            />
                        </div>
                        
                        <div className="relative group">
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 group-focus-within:text-blend transition-colors">Email</label>
                            <input 
                                type="email" 
                                className="w-full bg-transparent border-b border-gray-200 py-3 text-xl text-blend placeholder-gray-300 focus:outline-none focus:border-blend transition-colors"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                required 
                            />
                        </div>

                        <div className="relative group">
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 group-focus-within:text-blend transition-colors">Messaggio</label>
                            <textarea 
                                rows="5"
                                className="w-full bg-transparent border-b border-gray-200 py-3 text-xl text-blend placeholder-gray-300 focus:outline-none focus:border-blend transition-colors resize-none"
                                value={formData.message}
                                onChange={(e) => setFormData({...formData, message: e.target.value})}
                                required 
                            ></textarea>
                        </div>

                        <div className="pt-6">
                            <button 
                                type="submit" 
                                disabled={status === "sending" || status === "success"}
                                className="w-full py-5 bg-blend text-white font-bold uppercase tracking-widest rounded-full hover:bg-blend-dark transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-1"
                            >
                                {status === "sending" ? "Invio in corso..." : status === "success" ? "Messaggio Inviato!" : "Invia Messaggio"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

        </div>

      </div>
    </PageTransition>
  );
};

export default Contact;