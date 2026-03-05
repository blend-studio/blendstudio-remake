import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, data.token);
        navigate('/admin');
      } else {
        setError(data.message || 'Errore durante il login');
      }
    } catch (err) {
      setError('Errore di connessione al server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blend-dark p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="bg-blend p-10 text-center text-white">
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">Blend Admin</h1>
          <p className="mt-2 text-white/60 font-medium">BENVENUTO NELL'AREA RISERVATA</p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-500 rounded-2xl text-sm font-bold border border-red-100 italic">
               ⚠️ {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-2">Email</label>
            <input 
              type="email" 
              required
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blend/20 transition-all font-bold"
              placeholder="admin@blendstudio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-2">Password</label>
            <input 
              type="password" 
              required
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blend/20 transition-all font-bold"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 text-white rounded-full font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-blend)' }}
          >
            {loading ? 'ACCESSO IN CORSO...' : 'ACCEDI ORA'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
