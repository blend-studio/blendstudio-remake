import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// Animated counter
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    if (typeof value !== 'number') { setDisplay(value); return; }
    const start = prev.current;
    const end = value;
    const duration = 800;
    const startTime = performance.now();
    const tick = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(start + (end - start) * ease));
      if (t < 1) requestAnimationFrame(tick);
      else prev.current = end;
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <>{display}</>;
}

// Mini sparkline bars
function Sparkline({ values, color = '#fff' }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-[3px] h-8">
      {values.map((v, i) => (
        <motion.div
          key={i}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: i * 0.04, duration: 0.4, ease: 'easeOut' }}
          style={{ height: `${(v / max) * 100}%`, background: color, originY: 1 }}
          className="w-[5px] rounded-full opacity-60"
        />
      ))}
    </div>
  );
}

// Animated bar chart
function BarChart({ data, color = '#2f6580' }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end justify-between gap-2 h-32 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.4 + i * 0.06, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ height: `${(d.value / max) * 100}%`, background: color, originY: 1 }}
            className="w-full rounded-t-xl min-h-[4px]"
          />
          <span className="text-[9px] font-bold text-gray-400 uppercase">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buongiorno';
  if (h < 18) return 'Buon pomeriggio';
  return 'Buonasera';
}

const QUICK_ACTIONS = [
  { label: 'Nuovo progetto', to: '/admin/projects', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>, color: '#2f6580' },
  { label: 'Leggi messaggi', to: '/admin/messages', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, color: '#11998e' },
  { label: 'Gestisci utenti', to: '/admin/users', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, color: '#764ba2' },
  { label: 'Modifica contenuti', to: '/admin/content', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>, color: '#f093fb' },
];

const CARDS = [
  {
    title: 'Azioni tracciate',
    key: 'total_events',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    spark: [4, 7, 5, 9, 6, 11, 8, 14, 10, 13],
    trend: '+18%',
    trendUp: true,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  },
  {
    title: 'Progetti attivi',
    key: 'projects',
    gradient: 'linear-gradient(135deg, #2f6580 0%, #4a8fa3 100%)',
    spark: [8, 8, 9, 10, 10, 12, 14, 14, 15, 16],
    trend: '+2',
    trendUp: true,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  },
  {
    title: 'Messaggi ricevuti',
    key: 'messages',
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    spark: [1, 0, 2, 1, 3, 2, 1, 4, 2, 1],
    trend: 'Questo mese',
    trendUp: null,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
  {
    title: 'Previsione flusso',
    key: 'forecast',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    spark: [5, 6, 7, 6, 8, 9, 8, 10, 11, 12],
    trend: 'vs mese scorso',
    trendUp: true,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  },
];

const MONTHLY_DATA = [
  { label: 'Set', value: 28 },
  { label: 'Ott', value: 42 },
  { label: 'Nov', value: 35 },
  { label: 'Dic', value: 51 },
  { label: 'Gen', value: 46 },
  { label: 'Feb', value: 63 },
  { label: 'Mar', value: 58 },
];

const STATUS_ITEMS = [
  { label: 'Backend API', status: 'online', detail: '.NET 10 · localhost:5051' },
  { label: 'MongoDB', status: 'online', detail: 'blendstudio_mongo' },
  { label: 'Analytics ML', status: 'warning', detail: 'Servizio non avviato' },
  { label: 'MLflow', status: 'warning', detail: 'Tracking server offline' },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total_events: 0, projects: null, messages: null, forecast: '+12%' });

  useEffect(() => {
    const token = localStorage.getItem('blend_admin_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    const base = import.meta.env.VITE_API_BASE_URL;

    Promise.allSettled([
      fetch(`${base}/api/telemetry/stats`, { headers }).then(r => r.ok ? r.json() : null),
      fetch(`${base}/api/projects`).then(r => r.ok ? r.json() : null),
      fetch(`${base}/api/admin/messages`, { headers }).then(r => r.ok ? r.json() : null),
    ]).then(([telemetry, projects, messages]) => {
      setStats({
        total_events: telemetry.value?.total_events ?? 0,
        projects: projects.value?.data?.length ?? 0,
        messages: messages.value?.data?.length ?? 0,
        forecast: '+12%',
      });
    });
  }, []);

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const cardAnim = {
    hidden: { opacity: 0, y: 24, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  };

  return (
    <div className="h-full overflow-auto p-8 md:p-10">
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* ═══ Header ═══ */}
      <motion.div
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400 mb-1">
            {new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h1 className="text-4xl font-black tracking-[-0.04em] text-slate-950 leading-none">
            {getGreeting()} 👋
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Panoramica del sito BlendStudio.</p>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2 sm:justify-end">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-black text-slate-700 shadow-sm transition hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <span style={{ color: a.color }}>{a.icon}</span>
              {a.label}
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ═══ Stat cards ═══ */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {CARDS.map((card) => (
          <motion.div
            key={card.key}
            variants={cardAnim}
            whileHover={{ y: -5, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
            className="relative overflow-hidden rounded-[28px] p-6 text-white shadow-lg cursor-default"
            style={{ background: card.gradient }}
          >
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-black/10 blur-xl pointer-events-none" />
            <div className="relative flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  {card.icon}
                </div>
                {card.trendUp !== null && (
                  <span className={`text-[10px] font-black px-2 py-1 rounded-full ${card.trendUp ? 'bg-white/20' : 'bg-black/20'}`}>
                    {card.trendUp ? '↑' : '↓'} {card.trend}
                  </span>
                )}
              </div>
              <div>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{card.title}</p>
                <p className="text-4xl font-black leading-none tabular-nums">
                  {typeof stats[card.key] === 'number'
                    ? <AnimatedNumber value={stats[card.key]} />
                    : stats[card.key] ?? '…'
                  }
                </p>
              </div>
              <Sparkline values={card.spark} color="rgba(255,255,255,0.7)" />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ═══ Middle row: chart + status ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Traffico mensile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
          className="lg:col-span-2 bg-white rounded-[28px] border border-slate-100 shadow-sm p-7"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-0.5">Ultimi 7 mesi</p>
              <h3 className="text-lg font-black tracking-tight text-slate-900">Traffico mensile</h3>
            </div>
            <span className="rounded-2xl bg-slate-50 border border-slate-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">Visite stimate</span>
          </div>
          <BarChart data={MONTHLY_DATA} color="url(#barGrad)" />
          <svg width="0" height="0">
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2f6580" />
                <stop offset="100%" stopColor="#4a8fa3" stopOpacity="0.5" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Stato servizi */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38, duration: 0.4 }}
          className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-7 flex flex-col"
        >
          <div className="mb-5">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-0.5">Infrastruttura</p>
            <h3 className="text-lg font-black tracking-tight text-slate-900">Stato servizi</h3>
          </div>
          <div className="flex flex-col gap-3 flex-1">
            {STATUS_ITEMS.map((s) => (
              <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.status === 'online' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'} animate-pulse`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-slate-800 truncate">{s.label}</p>
                  <p className="text-[10px] text-slate-400 truncate">{s.detail}</p>
                </div>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${s.status === 'online' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                  {s.status === 'online' ? 'OK' : 'OFF'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ═══ Bottom row: AI + accesso rapido ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pb-4">

        {/* AI card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.4 }}
          className="rounded-[28px] p-8 text-white relative overflow-hidden shadow-xl"
          style={{ background: 'linear-gradient(160deg, #0d1117 0%, #1e4659 100%)' }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ x: [0, 10, 0], y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
              className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(74,143,163,0.35) 0%, transparent 70%)' }}
            />
            <motion.div
              animate={{ x: [0, -8, 0], y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut', delay: 1 }}
              className="absolute -top-8 -left-8 w-32 h-32 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(102,126,234,0.25) 0%, transparent 70%)' }}
            />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">AI Live</p>
            </div>
            <h3 className="text-xl font-black tracking-tighter mb-2">AI Intelligence</h3>
            <p className="text-white/45 text-sm leading-relaxed mb-5">
              Il modello ML analizza i dati storici per prevedere il traffico futuro.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm text-center">
                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Trend atteso</p>
                <motion.p animate={{ opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 2 }} className="text-xl font-black text-green-400">+8.5%</motion.p>
              </div>
              <div className="p-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm text-center">
                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Confidenza</p>
                <p className="text-xl font-black text-cyan-400">87%</p>
              </div>
            </div>
            <Link to="/admin/analytics" className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/8 px-4 py-2.5 text-xs font-black text-white/70 transition hover:bg-white/15 hover:text-white">
              Apri Analytics
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          </div>
        </motion.div>

        {/* Accesso rapido sezioni */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52, duration: 0.4 }}
          className="lg:col-span-2 bg-white rounded-[28px] border border-slate-100 shadow-sm p-7"
        >
          <div className="mb-5">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-0.5">Navigazione</p>
            <h3 className="text-lg font-black tracking-tight text-slate-900">Accesso rapido</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: '/admin/projects', label: 'Progetti', desc: `${stats.projects ?? '…'} attivi`, gradient: 'linear-gradient(135deg, #2f6580, #4a8fa3)', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> },
              { to: '/admin/messages', label: 'Messaggi', desc: `${stats.messages ?? '…'} ricevuti`, gradient: 'linear-gradient(135deg, #11998e, #38ef7d)', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
              { to: '/admin/content', label: 'Contenuti', desc: '6 pagine gestite', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
              { to: '/admin/users', label: 'Utenti', desc: 'Gestione accessi', gradient: 'linear-gradient(135deg, #667eea, #764ba2)', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group relative overflow-hidden rounded-[22px] border border-slate-100 p-5 transition hover:border-slate-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity" style={{ background: item.gradient }} />
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg" style={{ background: item.gradient }}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">{item.label}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{item.desc}</p>
                  </div>
                  <svg className="ml-auto text-slate-300 group-hover:text-slate-500 transition-colors" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
    </div>
  );
};

export default AdminDashboard;
