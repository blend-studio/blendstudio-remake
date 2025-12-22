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
      <div className="pt-32 md:pt-48 pb-20 px-6 md:px-20 min-h-screen bg-blend text-white">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            
            {/* Left Column: Info & Socials */}
            <div>
                <RevealText text="LET'S TALK" className="text-6xl md:text-9xl font-bold mb-10 text-white" />
                <p className="text-xl md:text-2xl text-white/70 max-w-md mb-20 leading-relaxed">
                    Hai un progetto visionario? O vuoi semplicemente dire ciao? 
                    Siamo pronti ad ascoltare.
                </p>

                <div className="flex flex-col gap-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">Connect</h3>
                    {socials.map((social) => (
                        <a 
                            key={social.name} 
                            href={social.link} 
                            className="text-4xl md:text-6xl font-bold hover:text-blend-light hover:translate-x-4 transition-all duration-300"
                        >
                            {social.name}
                        </a>
                    ))}
                </div>

                <div className="mt-20">
                     <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">Contact Info</h3>
                     <p className="text-xl font-medium">hello@blendstudio.it</p>
                     <p className="text-xl font-medium">+39 049 123 4567</p>
                </div>
            </div>


            {/* Right Column: Form */}
            <div className="bg-white/5 p-10 md:p-16 rounded-sm backdrop-blur-sm">
                <form onSubmit={handleSubmit} className="space-y-12">
                    <div className="relative group">
                        <input 
                            type="text" 
                            placeholder="Il tuo nome" 
                            className="w-full bg-transparent border-b border-white/20 py-4 text-xl md:text-2xl text-white placeholder-white/30 focus:outline-none focus:border-white transition-colors"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required 
                        />
                    </div>
                    
                    <div className="relative group">
                        <input 
                            type="email" 
                            placeholder="La tua email" 
                            className="w-full bg-transparent border-b border-white/20 py-4 text-xl md:text-2xl text-white placeholder-white/30 focus:outline-none focus:border-white transition-colors"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required 
                        />
                    </div>

                    <div className="relative group">
                        <textarea 
                            rows="4"
                            placeholder="Raccontaci la tua idea..." 
                            className="w-full bg-transparent border-b border-white/20 py-4 text-xl md:text-2xl text-white placeholder-white/30 focus:outline-none focus:border-white transition-colors resize-none"
                            value={formData.message}
                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                            required 
                        ></textarea>
                    </div>

                    <div className="pt-10">
                        <button 
                            type="submit" 
                            disabled={status === "sending" || status === "success"}
                            className="w-full md:w-auto px-12 py-5 bg-white text-blend font-bold uppercase tracking-widest rounded-full hover:bg-blend-light hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {status === "sending" ? "Invio in corso..." : status === "success" ? "Messaggio Inviato!" : "Invia Messaggio"}
                        </button>
                    </div>
                </form>
            </div>

        </div>

      </div>
    </PageTransition>
  );
};

export default Contact;