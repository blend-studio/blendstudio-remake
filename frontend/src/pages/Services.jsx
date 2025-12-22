import React from "react";
import PageTransition from "../components/Transition";

const Services = () => {
  return (
    <PageTransition>
      <div className="pt-32 px-6 md:px-20 min-h-screen bg-blend-bg">
        <h1 className="text-6xl md:text-8xl font-bold text-blend mb-10">Services</h1>
        <p className="text-xl text-blend-dark/70 max-w-2xl">
          Cosa possiamo fare per il tuo business.
        </p>
         <div className="mt-20 space-y-10">
            <div className="border-t border-blend/20 py-10">
                <h3 className="text-3xl font-bold text-blend">Web Design & Development</h3>
                <p className="mt-4 text-blend-dark/60">Siti web performanti, belli e funzionali.</p>
            </div>
            <div className="border-t border-blend/20 py-10">
                <h3 className="text-3xl font-bold text-blend">Branding & Identity</h3>
                <p className="mt-4 text-blend-dark/60">Costruiamo l'immagine del tuo brand.</p>
            </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Services;