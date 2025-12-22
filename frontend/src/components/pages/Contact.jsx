import React from "react";
import PageTransition from "../components/Transition";

const Contact = () => {
  return (
    <PageTransition>
      <div className="pt-32 px-6 md:px-20 min-h-screen bg-blend-bg">
        <h1 className="text-6xl md:text-8xl font-bold text-blend mb-10">Contact</h1>
        <p className="text-xl text-blend-dark/70 max-w-2xl">
          Parliamo del tuo prossimo progetto.
        </p>
        <form className="mt-20 max-w-lg space-y-6">
            <div>
                <label className="block text-sm font-bold text-blend uppercase tracking-wider mb-2">Nome</label>
                <input type="text" className="w-full bg-transparent border-b border-blend/30 focus:border-blend outline-none py-2 text-blend" />
            </div>
            <div>
                <label className="block text-sm font-bold text-blend uppercase tracking-wider mb-2">Email</label>
                <input type="email" className="w-full bg-transparent border-b border-blend/30 focus:border-blend outline-none py-2 text-blend" />
            </div>
             <div>
                <label className="block text-sm font-bold text-blend uppercase tracking-wider mb-2">Messaggio</label>
                <textarea className="w-full bg-transparent border-b border-blend/30 focus:border-blend outline-none py-2 text-blend h-32"></textarea>
            </div>
            <button className="px-8 py-4 bg-blend text-white font-bold uppercase tracking-widest hover:bg-blend-dark transition-colors">Invia</button>
        </form>
      </div>
    </PageTransition>
  );
};

export default Contact;