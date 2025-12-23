import React from "react";
import { Link } from "react-router-dom";
import blendLogo from "../assets/images/blend-logo-blu.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10 px-6 md:px-20">
      <div className="max-w-[90rem] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          
          {/* Logo & Info */}
          <div className="md:col-span-4">
            <img src={blendLogo} alt="Blend Studio" className="h-12 w-auto mb-8 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" />
            <div className="space-y-2 text-gray-400 text-sm font-medium">
              <p>Via della Creatività, 12</p>
              <p>35100 Padova, IT</p>
              <p className="pt-4 uppercase tracking-widest text-[10px] font-black">P.IVA 01234567890</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blend mb-6">Menu</h4>
            <ul className="space-y-4 text-sm font-bold text-gray-500 uppercase tracking-widest">
              <li><Link to="/about" className="hover:text-blend transition-colors">Chi Siamo</Link></li>
              <li><Link to="/projects" className="hover:text-blend transition-colors">Progetti</Link></li>
              <li><Link to="/services" className="hover:text-blend transition-colors">Servizi</Link></li>
              <li><Link to="/contact" className="hover:text-blend transition-colors">Contatti</Link></li>
            </ul>
          </div>

          {/* Socials */}
          <div className="md:col-span-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blend mb-6">Social</h4>
            <ul className="space-y-4 text-sm font-bold text-gray-500 uppercase tracking-widest">
              <li><a href="#" className="hover:text-blend transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-blend transition-colors">LinkedIn</a></li>
              <li><a href="#" className="hover:text-blend transition-colors">Behance</a></li>
            </ul>
          </div>

          {/* Newsletter / CTA Placeholder */}
          <div className="md:col-span-4 flex flex-col items-start md:items-end justify-start">
             <p className="text-xl md:text-2xl font-black text-blend uppercase tracking-tighter italic mb-6 md:text-right">
                Ready to blend <br /> excellence with us?
             </p>
             <Link to="/contact" className="text-[10px] font-black uppercase tracking-[0.3em] text-blend border-b-2 border-blend pb-1 hover:text-blend-light hover:border-blend-light transition-colors">
                Let's work together
             </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-gray-50 flex flex-col md:row justify-between items-center gap-6">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
            © {currentYear} Blend Studio Srl — Tutti i diritti riservati.
          </p>
          <div className="flex gap-8 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
            <a href="#" className="hover:text-blend transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blend transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
