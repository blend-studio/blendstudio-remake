import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full p-6 md:p-10 flex justify-between items-center z-50 mix-blend-difference text-white">
      {/* Logo */}
      <Link to="/" className="text-2xl font-bold tracking-tighter hover:scale-105 transition-transform">
        BLEND STUDIO
      </Link>

      {/* Menu Desktop */}
      <div className="hidden md:flex gap-10 text-xs font-bold uppercase tracking-widest">
        <Link to="/projects" className="hover:text-blend-light transition-colors">Progetti</Link>
        <Link to="/services" className="hover:text-blend-light transition-colors">Servizi</Link>
        <Link to="/careers" className="hover:text-blend-light transition-colors">Lavora con noi</Link>
        <Link to="/contact" className="hover:text-blend-light transition-colors">Contatti</Link>
      </div>

      {/* Qui in futuro metteremo l'Hamburger Menu per il mobile */}
      <div className="md:hidden">MENU</div>
    </nav>
  );
};

export default Navbar;