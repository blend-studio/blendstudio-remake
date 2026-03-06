/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getAnalyticsStats, getAnalyticsTrends, getAnalyticsTopPages,
  getAnalyticsTopActions, getAnalyticsEvents,
  getAnalyticsScrollDepth, getAnalyticsHourly,
} from '../services/api';
import { fetchDeviceStats, fetchSessionStats, fetchReferrerStats, fetchFunnelStats } from '../hooks/useTelemetry';

/* ══════════════════════════════════════════
   COSTANTI
══════════════════════════════════════════ */
const ACTION_LABELS = {
  page_view:              'Visualizzazione pagina',
  scroll_depth:           'Profondità scroll',
  contact_form_start:     'Apertura form contatto',
  contact_form_submit:    'Invio form contatto',
  services_explore_click: 'Clic "Esplora servizi"',
  project_click:          'Clic su progetto',
  service_click:          'Clic su servizio',
  cta_click:              'Clic CTA',
  nav_click:              'Navigazione menu',
  logo_click:             'Clic logo',
  unknown:                'Azione sconosciuta',
};

const BAR_GRADIENTS = [
  ['#2f6580','#4a8fa3'],
  ['#667eea','#764ba2'],
  ['#11998e','#38ef7d'],
  ['#f093fb','#f5576c'],
  ['#f7971e','#ffd200'],
  ['#4facfe','#00f2fe'],
  ['#43e97b','#38f9d7'],
  ['#fa709a','#fee140'],
];

const TABS = [
  { id: 'panoramica',  label: 'Panoramica',  icon: '📊' },
  { id: 'contenuti',   label: 'Contenuti',   icon: '📄' },
  { id: 'audience',    label: 'Audience',    icon: '👥' },
  { id: 'conversione', label: 'Conversione', icon: '🎯' },
  { id: 'log',         label: 'Log eventi',  icon: '📋' },
];

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
function fmt(n) {
  if (n == null) return '—';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
function fmtDate(iso) {
  try { return new Date(iso).toLocaleString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
  catch { return iso; }
}
function pct(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }
function translateAction(a) {
  if (!a) return 'Sconosciuta';
  return ACTION_LABELS[a] ?? a.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
function smoothPath(pts) {
  if (pts.length < 2) return pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const cx = (pts[i - 1][0] + pts[i][0]) / 2;
    d += ` C${cx},${pts[i - 1][1]} ${cx},${pts[i][1]} ${pts[i][0]},${pts[i][1]}`;
  }
  return d;
}

/* ══════════════════════════════════════════
   ICONE SVG
══════════════════════════════════════════ */
const IcoRefresh = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
const IcoUsers   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoZap     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IcoCal     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoTrend   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IcoGlobe   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;

/* ══════════════════════════════════════════
   UI ATOMS
══════════════════════════════════════════ */

/** Titolo sezione con eyebrow e descrizione opzionale */
function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="mb-5">
      <p className="text-sm font-black uppercase tracking-[0.22em] text-slate-400 mb-0.5">{eyebrow}</p>
      <h3 className="text-xl font-black tracking-tight text-slate-900 mb-1.5">{title}</h3>
      {description && <p className="text-base text-slate-500 leading-relaxed">{description}</p>}
    </div>
  );
}

/** Avviso contestuale colorato */
function Insight({ type = 'info', children }) {
  const cfg = {
    info:    { bg: 'bg-sky-50',     border: 'border-sky-200',     text: 'text-sky-700',     ico: 'ℹ️' },
    warning: { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   ico: '⚠️' },
    success: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', ico: '✅' },
  }[type];
  return (
    <div className={`mt-4 flex items-start gap-2.5 rounded-xl border ${cfg.border} ${cfg.bg} px-3 py-2.5`}>
      <span className="shrink-0 text-base mt-px">{cfg.ico}</span>
      <p className={`text-base font-medium leading-relaxed ${cfg.text}`}>{children}</p>
    </div>
  );
}

/** Card con animazione ingresso */
function Card({ delay = 0, className = '', children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.38, ease: 'easeOut' }}
      className={`rounded-[28px] border border-slate-100 bg-white p-7 shadow-sm ${className}`}
    >
      {children}
    </motion.div>
  );
}

/** Spinner */
function Spin({ size = 5 }) {
  return (
    <div className={`w-${size} h-${size} rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin`} />
  );
}

/** KPI card colorata */
function KpiCard({ label, value, sub, icon, gradient, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl p-6 text-white"
      style={{ background: gradient }}
    >
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="relative flex flex-col gap-3">
        <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">{icon}</div>
        <div>
          <p className="text-white/60 text-sm font-black uppercase tracking-[0.2em] mb-0.5">{label}</p>
          <p className="text-5xl font-black leading-none tabular-nums">{fmt(value)}</p>
          {sub && <p className="text-white/50 text-base mt-1">{sub}</p>}
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════
   GRAFICI
══════════════════════════════════════════ */

/** Grafico a linee con doppia serie (eventi + sessioni) */
function LineChart({ data, height = 148 }) {
  const [tip, setTip] = useState(null);
  if (!data?.length) return <div className="flex items-center justify-center h-28 text-slate-400 text-lg">Nessun dato</div>;
  const W = 600, H = height, PL = 22, PR = 6, PT = 14, PB = 22;
  const CW = W - PL - PR, CH = H - PT - PB;
  const evVals  = data.map(d => d.events);
  const sesVals = data.map(d => d.sessions ?? 0);
  const maxV    = Math.max(...evVals, ...sesVals, 1);
  const toX = i => PL + (i / (data.length - 1 || 1)) * CW;
  const toY = v => PT + (1 - v / maxV) * CH;
  const evPts  = evVals.map((v, i)  => [toX(i), toY(v)]);
  const sesPts = sesVals.map((v, i) => [toX(i), toY(v)]);
  const evPath  = smoothPath(evPts);
  const sesPath = smoothPath(sesPts);
  const evFill  = `${evPath} L${evPts.at(-1)[0]},${PT + CH} L${evPts[0][0]},${PT + CH} Z`;
  const sesFill = `${sesPath} L${sesPts.at(-1)[0]},${PT + CH} L${sesPts[0][0]},${PT + CH} Z`;
  const step    = Math.max(1, Math.floor(data.length / 7));
  return (
    <div className="relative select-none">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} onMouseLeave={() => setTip(null)}>
        <defs>
          <linearGradient id="lgEv"  x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2f6580" stopOpacity=".22"/><stop offset="100%" stopColor="#2f6580" stopOpacity="0"/></linearGradient>
          <linearGradient id="lgSes" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#764ba2" stopOpacity=".14"/><stop offset="100%" stopColor="#764ba2" stopOpacity="0"/></linearGradient>
        </defs>
        {[0,1,2,3,4].map(i => {
          const y = PT + (i / 4) * CH, v = Math.round(maxV * (1 - i / 4));
          return <g key={i}><line x1={PL} y1={y} x2={W - PR} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray={i === 4 ? '0' : '4 3'}/><text x={PL - 4} y={y + 3.5} textAnchor="end" fontSize="8" fill="#cbd5e1">{v > 0 ? v : ''}</text></g>;
        })}
        <path d={sesFill} fill="url(#lgSes)"/>
        <path d={sesPath} fill="none" stroke="#764ba2" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="5 3"/>
        <path d={evFill}  fill="url(#lgEv)"/>
        <path d={evPath}  fill="none" stroke="#2f6580" strokeWidth="2.5" strokeLinecap="round"/>
        {data.map((d, i) => i % step === 0 && <text key={i} x={toX(i)} y={H - 4} textAnchor="middle" fontSize="8.5" fill="#94a3b8">{d.date.slice(5)}</text>)}
        <circle cx={evPts.at(-1)[0]} cy={evPts.at(-1)[1]} r="4" fill="#2f6580" stroke="white" strokeWidth="1.5"/>
        {data.map((d, i) => <rect key={i} x={toX(i) - CW / data.length / 2} y={PT} width={CW / data.length} height={CH} fill="transparent" onMouseEnter={() => setTip({ x: toX(i), d })}/>)}
        {tip && <g>
          <line x1={tip.x} y1={PT} x2={tip.x} y2={PT + CH} stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2"/>
          <circle cx={tip.x} cy={toY(tip.d.events)}      r="3.5" fill="#2f6580" stroke="white" strokeWidth="1.5"/>
          <circle cx={tip.x} cy={toY(tip.d.sessions ?? 0)} r="3"   fill="#764ba2" stroke="white" strokeWidth="1.5"/>
        </g>}
      </svg>
      {tip && (
        <div className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-xl px-3 py-2 text-base font-semibold shadow-xl whitespace-nowrap z-10 flex items-center gap-3">
          <span className="text-slate-400">{tip.d.date}</span>
          <span style={{ color: '#6fb3cc' }}>● {tip.d.events} eventi</span>
          <span style={{ color: '#b39ddb' }}>● {tip.d.sessions ?? 0} sessioni</span>
        </div>
      )}
    </div>
  );
}

/** Barre orizzontali con gradiente */
function HBarChart({ data, labelKey = 'page', valueKey = 'views', translateLabel }) {
  if (!data?.length) return <div className="text-slate-400 text-lg py-6 text-center">Nessun dato</div>;
  const total = data.reduce((s, d) => s + d[valueKey], 0) || 1;
  const max   = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div className="space-y-3">
      {data.map((d, i) => {
        const [c0, c1] = BAR_GRADIENTS[i % BAR_GRADIENTS.length];
        const p = Math.round((d[valueKey] / total) * 100);
        const label = translateLabel ? translateLabel(d[labelKey]) : d[labelKey];
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="w-5 text-sm font-black shrink-0 text-right" style={{ color: c0 }}>{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-base font-semibold text-slate-700 truncate max-w-[72%]">{label}</span>
                <span className="text-base font-black shrink-0 ml-2 tabular-nums">
                  <span className="text-slate-500">{d[valueKey]}</span>
                  <span className="text-slate-300 mx-1">·</span>
                  <span style={{ color: c0 }}>{p}%</span>
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(d[valueKey] / max) * 100}%` }}
                  transition={{ duration: 0.65, delay: i * 0.05, ease: 'easeOut' }}
                  className="h-full rounded-full" style={{ background: `linear-gradient(90deg,${c0},${c1})` }}/>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Barre verticali con tooltip — usato per orario e scroll depth */
function VBarChart({ data, xKey = 'label', yKey = 'count', color = '#2f6580', peakColor = '#f7971e', height = 110, highlightPeak = false }) {
  const [tip, setTip] = useState(null);
  if (!data?.length) return <div className="flex items-center justify-center text-slate-400 text-lg" style={{ height }}>Nessun dato</div>;
  const max   = Math.max(...data.map(d => d[yKey]), 1);
  const W = 600, H = height, PL = 4, PR = 4, PT = 10, PB = 20;
  const bW  = (W - PL - PR) / data.length;
  const PAD = bW * 0.22;
  const peakIdx = data.reduce((pi, d, i) => d[yKey] > data[pi][yKey] ? i : pi, 0);
  return (
    <div className="relative select-none">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} onMouseLeave={() => setTip(null)}>
        <defs>
          {data.map((_, i) => {
            const isPeak = highlightPeak && i === peakIdx;
            const c = isPeak ? peakColor : color;
            return (
              <linearGradient key={i} id={`vb${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={c} stopOpacity=".95"/>
                <stop offset="100%" stopColor={c} stopOpacity=".45"/>
              </linearGradient>
            );
          })}
        </defs>
        {[0, 0.5, 1].map((f, i) => (
          <line key={i} x1={PL} y1={PT + f * (H - PT - PB)} x2={W - PR} y2={PT + f * (H - PT - PB)} stroke="#e2e8f0" strokeWidth="1" strokeDasharray={f === 1 ? '0' : '4 3'}/>
        ))}
        {data.map((d, i) => {
          const x  = PL + i * bW + PAD;
          const bw = bW - PAD * 2;
          const bh = (d[yKey] / max) * (H - PT - PB);
          const y  = PT + (H - PT - PB) - bh;
          return (
            <g key={i} onMouseEnter={() => setTip({ x: PL + i * bW + bW / 2, d })}>
              <rect x={x} y={y} width={bw} height={bh} rx="3" fill={`url(#vb${i})`}/>
              {(data.length <= 24 && i % Math.max(1, Math.floor(data.length / 12)) === 0) &&
                <text x={PL + i * bW + bW / 2} y={H - 4} textAnchor="middle" fontSize="7.5" fill="#94a3b8">{d[xKey]}</text>}
            </g>
          );
        })}
        {tip && <line x1={tip.x} y1={PT} x2={tip.x} y2={H - PB} stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2"/>}
      </svg>
      {tip && (
        <div className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-xl px-3 py-2 text-base font-semibold shadow-xl whitespace-nowrap z-10">
          <span className="text-slate-400 mr-2">{tip.d[xKey]}</span>
          <span style={{ color: '#6fb3cc' }}>{tip.d[yKey]} {yKey === 'sessions' ? 'sessioni' : 'eventi'}</span>
        </div>
      )}
    </div>
  );
}

/** Grafico a ciambella per i dispositivi */
function DonutChart({ segments }) {
  const [hov, setHov] = useState(null);
  if (!segments?.length) return <div className="text-slate-400 text-lg text-center py-4">Nessun dato</div>;
  const R = 80, r = 52, CX = 100, CY = 100;
  const total = segments.reduce((s, sg) => s + sg.value, 0) || 1;
  let angle = -Math.PI / 2;
  const arcs = segments.map(sg => {
    const sweep = (sg.value / total) * 2 * Math.PI;
    const a0 = angle, a1 = angle + sweep; angle = a1;
    const [x0, y0] = [CX + R * Math.cos(a0), CY + R * Math.sin(a0)];
    const [x1, y1] = [CX + R * Math.cos(a1), CY + R * Math.sin(a1)];
    const [ix0, iy0] = [CX + r * Math.cos(a0), CY + r * Math.sin(a0)];
    const [ix1, iy1] = [CX + r * Math.cos(a1), CY + r * Math.sin(a1)];
    const lg = sweep > Math.PI ? 1 : 0;
    const d = `M${x0},${y0} A${R},${R},0,${lg},1,${x1},${y1} L${ix1},${iy1} A${r},${r},0,${lg},0,${ix0},${iy0} Z`;
    return { ...sg, d, pct: Math.round((sg.value / total) * 100) };
  });
  const active = hov != null ? arcs[hov] : arcs[0];
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 200 200" className="w-36 h-36 shrink-0">
        {arcs.map((a, i) => (
          <path key={i} d={a.d} fill={a.color}
            opacity={hov === null || hov === i ? 1 : 0.38}
            style={{ cursor: 'pointer', transition: 'opacity .15s' }}
            onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}/>
        ))}
        <text x="100" y="97"  textAnchor="middle" fontSize="22" fontWeight="900" fill="#0f172a">{active?.pct}%</text>
        <text x="100" y="113" textAnchor="middle" fontSize="9"  fill="#94a3b8">{active?.label}</text>
      </svg>
      <div className="flex-1 space-y-2.5">
        {arcs.map((a, i) => (
          <div key={i} className="flex items-center justify-between gap-2"
            onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
            style={{ opacity: hov === null || hov === i ? 1 : 0.4, transition: 'opacity .15s', cursor: 'default' }}>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: a.color }}/>
              <span className="text-base font-semibold text-slate-700">{a.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base text-slate-400">{a.value}</span>
              <span className="text-base font-black tabular-nums" style={{ color: a.color }}>{a.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   TAB PAGES
══════════════════════════════════════════ */

/** TAB 1 — Panoramica: KPI + trend + picco orario */
function TabPanoramica({ data, loading, trendDays }) {
  const { stats, trends, hourlyTraffic } = data;
  const peakHour = hourlyTraffic.length
    ? hourlyTraffic.reduce((p, h) => h.count > p.count ? h : p, hourlyTraffic[0])
    : null;
  return (
    <div className="space-y-6">
      {/* KPI */}
      <div>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Numeri chiave</p>
        <p className="text-base text-slate-500 mb-4">I principali indicatori del sito. "Oggi" e "Questa settimana" cambiano in tempo reale con il traffico corrente.</p>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard label="Totale eventi"    value={stats?.total_events}    sub="dall'inizio dei tempi"     icon={<IcoZap />}   gradient="linear-gradient(135deg,#2f6580,#4a8fa3)" delay={0}    />
          <KpiCard label="Oggi"             value={stats?.today_events}    sub="ultime 24 ore"             icon={<IcoCal />}   gradient="linear-gradient(135deg,#667eea,#764ba2)" delay={0.07} />
          <KpiCard label="Questa settimana" value={stats?.week_events}     sub="ultimi 7 giorni"           icon={<IcoTrend />} gradient="linear-gradient(135deg,#11998e,#38ef7d)" delay={0.14} />
          <KpiCard label="Sessioni uniche"  value={stats?.unique_sessions} sub="utenti distinti tracciati" icon={<IcoUsers />} gradient="linear-gradient(135deg,#f093fb,#f5576c)" delay={0.21} />
        </div>
      </div>

      {/* Trend */}
      <Card delay={0.25}>
        <SectionTitle
          eyebrow="Andamento"
          title={`Traffico ultimi ${trendDays} giorni`}
          description="Ogni punto del grafico rappresenta un giorno. La linea continua sono gli eventi totali; quella tratteggiata le sessioni uniche. Passa il cursore per i dettagli."
        />
        <div className="flex items-center gap-4 text-base text-slate-400 mb-4">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: '#2f6580' }}/>Eventi</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-px w-5 border-t-2 border-dashed border-[#764ba2]"/>Sessioni</span>
        </div>
        {loading
          ? <div className="h-28 flex items-center justify-center"><Spin size={6}/></div>
          : <LineChart data={trends}/>}
      </Card>

      {/* Orario di punta — full width, più grande */}
      <Card delay={0.3}>
        <SectionTitle
          eyebrow="Orario di punta"
          title="Quando ci visitano"
          description="Distribuzione degli eventi nelle 24 ore (fuso Europa/Roma). La barra ambra indica il momento con più traffico."
        />
        {loading
          ? <div className="h-40 flex items-center justify-center"><Spin/></div>
          : <VBarChart data={hourlyTraffic} xKey="label" yKey="count" color="#4facfe" peakColor="#f7971e" height={200} highlightPeak/>}
        {!loading && peakHour && (
          <Insight type="info">
            Il picco di visite si registra alle <strong>{peakHour.label}</strong> con {peakHour.count} eventi.
            Pianifica post social o invii email in questa fascia oraria.
          </Insight>
        )}
      </Card>
    </div>
  );
}

/** TAB 2 — Contenuti: top pagine + top azioni + scroll depth */
function TabContenuti({ data, loading }) {
  const { topPages, topActions, scrollDepth } = data;
  const sdAt25  = scrollDepth.find(d => d.depth === 25);
  const sdAt50  = scrollDepth.find(d => d.depth === 50);
  const sdAt100 = scrollDepth.find(d => d.depth === 100);
  const sdTotal = sdAt25?.sessions ?? 0;
  const p50     = sdTotal > 0 && sdAt50  ? pct(sdAt50.sessions,  sdTotal) : null;
  const p100    = sdTotal > 0 && sdAt100 ? pct(sdAt100.sessions, sdTotal) : null;
  const noScrollData = scrollDepth.every(d => d.sessions === 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Top pages */}
        <Card delay={0.1}>
          <SectionTitle
            eyebrow="Pagine"
            title="Pagine più visitate"
            description="Classifica per numero di visualizzazioni. La percentuale indica la quota sul totale delle visite al sito."
          />
          {loading
            ? <div className="h-32 flex items-center justify-center"><Spin/></div>
            : <HBarChart data={topPages} labelKey="page" valueKey="views"/>}
        </Card>

        {/* Top actions */}
        <Card delay={0.15}>
          <SectionTitle
            eyebrow="Azioni"
            title="Cosa fanno gli utenti"
            description="Le interazioni più frequenti tracciate (scroll, clic, invio form). Ogni azione corrisponde a un comportamento preciso."
          />
          {loading ? (
            <div className="h-24 flex items-center justify-center"><Spin/></div>
          ) : topActions.length === 0 ? (
            <p className="text-slate-400 text-lg text-center py-6">Nessun dato</p>
          ) : (
            <div className="space-y-2">
              {topActions.map((a, i) => {
                const [c0, c1] = BAR_GRADIENTS[i % BAR_GRADIENTS.length];
                return (
                  <div key={i} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 px-3.5 py-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-lg flex items-center justify-center text-sm font-black text-white shrink-0"
                        style={{ background: `linear-gradient(135deg,${c0},${c1})` }}>{i + 1}</span>
                      <div className="min-w-0">
                        <p className="text-base font-bold text-slate-800 truncate">{translateAction(a.action)}</p>
                        <p className="text-sm font-mono text-slate-400 truncate">{a.action}</p>
                      </div>
                    </div>
                    <span className="text-lg font-black tabular-nums shrink-0" style={{ color: c0 }}>{a.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Scroll depth */}
      <Card delay={0.2}>
        <SectionTitle
          eyebrow="Scroll depth"
          title="Profondità di lettura"
          description="Quante sessioni hanno raggiunto il 25%, 50%, 75% e 100% della pagina. Un calo brusco tra il 25% e il 50% indica che la seconda metà della pagina non viene quasi mai letta."
        />
        {loading ? (
          <div className="h-28 flex items-center justify-center"><Spin/></div>
        ) : noScrollData ? (
          <p className="text-slate-400 text-lg text-center py-4">Dati di scroll non ancora disponibili — naviga il sito per generarli.</p>
        ) : (
          <>
            <VBarChart data={scrollDepth} xKey="label" yKey="sessions" color="#2f6580" height={120}/>
            <div className="grid grid-cols-4 gap-3 mt-4">
              {scrollDepth.map(d => (
                <div key={d.depth} className="rounded-2xl bg-slate-50 border border-slate-100 p-3 text-center">
                  <p className="text-3xl font-black text-slate-900 tabular-nums">{d.sessions}</p>
                  <p className="text-sm text-slate-400 font-semibold mt-0.5">{d.label}</p>
                  <p className="text-sm text-slate-300 mt-0.5">sessioni</p>
                </div>
              ))}
            </div>
          </>
        )}
        {!loading && p50 !== null && p50 < 40 && (
          <Insight type="warning">
            Solo il {p50}% degli utenti scorre oltre la metà della pagina.
            Considera di anticipare le call to action nel primo schermo visibile.
          </Insight>
        )}
        {!loading && p100 !== null && p100 > 30 && (
          <Insight type="success">
            Il {p100}% degli utenti raggiunge il fondo delle pagine — ottimo livello di engagement.
          </Insight>
        )}
      </Card>
    </div>
  );
}

/** TAB 3 — Audience: dispositivi + referrer + qualità sessione */
function TabAudience({ data, loading }) {
  const { deviceStats, sessionStats, referrerStats } = data;
  const bounceHigh = sessionStats && sessionStats.bounce_rate > 65;
  const bounceLow  = sessionStats && sessionStats.bounce_rate < 35;
  const deviceSegments = deviceStats ? [
    { label: 'Desktop', value: deviceStats.desktop?.count ?? 0, color: '#2f6580' },
    { label: 'Mobile',  value: deviceStats.mobile?.count  ?? 0, color: '#f5576c' },
    { label: 'Tablet',  value: deviceStats.tablet?.count  ?? 0, color: '#764ba2' },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Dispositivi */}
        <Card delay={0.1}>
          <SectionTitle
            eyebrow="Dispositivi"
            title="Con cosa ci visitano"
            description="Basata sulla larghezza dello schermo: mobile &lt;768 px, tablet 768–1023 px, desktop ≥1024 px. Alta quota mobile = design touch-first prioritario."
          />
          {loading || !deviceStats
            ? <div className="h-24 flex items-center justify-center"><Spin/></div>
            : <>
                <DonutChart segments={deviceSegments}/>
                {deviceStats.total_sessions > 0 && (
                  <p className="text-sm text-slate-400 mt-3">{deviceStats.total_sessions} sessioni analizzate</p>
                )}
                {(deviceStats.mobile?.pct ?? 0) > 60 && (
                  <Insight type="info">
                    Oltre il 60% degli utenti arriva da mobile.
                    Assicurati che tutti i componenti siano ottimizzati per schermi piccoli.
                  </Insight>
                )}
              </>}
        </Card>

        {/* Referrer */}
        <Card delay={0.15}>
          <SectionTitle
            eyebrow="Sorgenti di traffico"
            title="Da dove arrivano"
            description='"direct" indica chi digita l&apos;URL o usa i segnalibri. Gli altri valori mostrano i siti o canali che portano visitatori.'
          />
          {loading || !referrerStats.length
            ? <div className="h-28 flex items-center justify-center text-slate-400 text-lg">
                {loading ? <Spin/> : 'Nessun dato referrer'}
              </div>
            : <HBarChart data={referrerStats} labelKey="source" valueKey="count"/>}
        </Card>
      </div>

      {/* Qualità sessioni */}
      <Card delay={0.2}>
        <SectionTitle
          eyebrow="Qualità sessioni"
          title="Come si comportano gli utenti"
          description="Il bounce rate misura chi esce dopo una sola pagina. Sotto il 50% è un ottimo risultato per un sito portfolio. Le interazioni per sessione indicano quanto gli utenti sono 'attivi' durante la visita."
        />
        {loading || !sessionStats
          ? <div className="h-20 flex items-center justify-center"><Spin/></div>
          : <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    label: 'Bounce rate',
                    value: `${sessionStats.bounce_rate}%`,
                    sub: 'sessioni a pagina singola',
                    color: sessionStats.bounce_rate > 65 ? '#f5576c' : sessionStats.bounce_rate < 40 ? '#11998e' : '#f7971e',
                  },
                  { label: 'Interazioni / sessione', value: sessionStats.avg_events_per_session,  sub: 'azioni medie per visita', color: '#2f6580' },
                  { label: 'Pagine / sessione',      value: sessionStats.avg_pages_per_session,   sub: 'profondità media',       color: '#764ba2' },
                ].map((item, i) => (
                  <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
                    <p className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2 leading-tight">{item.label}</p>
                    <p className="text-5xl font-black tabular-nums" style={{ color: item.color }}>{item.value}</p>
                    <p className="text-sm text-slate-400 mt-1">{item.sub}</p>
                  </div>
                ))}
              </div>
              {bounceHigh && (
                <Insight type="warning">
                  Bounce rate elevato ({sessionStats.bounce_rate}%). Considera un A/B test sulla homepage o verifica i tempi di caricamento.
                </Insight>
              )}
              {bounceLow && (
                <Insight type="success">
                  Bounce rate ottimo ({sessionStats.bounce_rate}%). Gli utenti esplorano più pagine dopo l'atterraggio.
                </Insight>
              )}
            </>}
      </Card>
    </div>
  );
}

/** TAB 4 — Conversione: funnel contatti */
function TabConversione({ data, loading }) {
  const { funnelStats } = data;
  const STEP_DESC = [
    'Punto di partenza — tutti i visitatori del sito',
    'Hanno visitato la pagina contatti',
    'Hanno iniziato a compilare il form',
    'Hanno inviato il form → lead generato ✓',
  ];
  const STEP_COLORS = ['#2f6580', '#667eea', '#11998e', '#f093fb'];

  return (
    <div className="space-y-6">
      <Card delay={0.1}>
        <div className="flex items-start justify-between mb-6">
          <SectionTitle
            eyebrow="Funnel"
            title="Percorso di conversione"
            description="Quante sessioni uniche hanno raggiunto ciascuna fase del percorso dal primo accesso all'invio del form. Un calo brusco tra due step rivela un punto di attrito."
          />
          {funnelStats && (
            <div className="shrink-0 text-right ml-6">
              <p className="text-sm text-slate-400 uppercase tracking-wider mb-1">Conversion rate</p>
              <p className="text-6xl font-black tabular-nums leading-none"
                style={{ color: funnelStats.conversion_rate > 2 ? '#11998e' : '#f7971e' }}>
                {funnelStats.conversion_rate}%
              </p>
              <p className="text-sm text-slate-400 mt-1">visita → invio form</p>
            </div>
          )}
        </div>

        {loading || !funnelStats
          ? <div className="h-28 flex items-center justify-center"><Spin/></div>
          : <>
              <div className="space-y-5">
                {funnelStats.steps.map((step, i) => {
                  const c = STEP_COLORS[i] || '#2f6580';
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full text-sm font-black flex items-center justify-center text-white shrink-0" style={{ background: c }}>{i + 1}</span>
                          <div>
                            <p className="text-lg font-bold text-slate-800">{step.step}</p>
                            <p className="text-sm text-slate-400 mt-0.5">{STEP_DESC[i]}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="text-2xl font-black tabular-nums text-slate-800 leading-none">{step.count}</p>
                          <p className="text-base font-semibold mt-0.5" style={{ color: c }}>{step.rate}%</p>
                        </div>
                      </div>
                      <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${step.rate}%` }}
                          transition={{ duration: 0.7, delay: i * 0.12, ease: 'easeOut' }}
                          className="h-full rounded-full" style={{ background: c }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
              {funnelStats.conversion_rate < 1 && (
                <Insight type="warning">
                  Tasso di conversione molto basso. Verifica che il form sia facilmente raggiungibile dalla homepage e che la pagina /contact si carichi correttamente.
                </Insight>
              )}
              {funnelStats.conversion_rate >= 3 && (
                <Insight type="success">
                  Buon tasso di conversione ({funnelStats.conversion_rate}%). Il percorso verso il form di contatto è efficace.
                </Insight>
              )}
            </>}
      </Card>

      {/* Suggerimenti */}
      <Card delay={0.2}>
        <SectionTitle
          eyebrow="Come migliorare"
          title="Ottimizzare le conversioni"
          description="Consigli pratici per aumentare il numero di visitatori che diventano contatti."
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { ico: '🚀', title: 'CTA ben visibili', text: 'Il pulsante "Contattaci" deve essere visibile senza scorrere nella homepage.' },
            { ico: '⚡', title: 'Velocità di caricamento', text: 'Ogni secondo di ritardo riduce le conversioni del ~7%. Verifica Lighthouse.' },
            { ico: '📱', title: 'Form mobile-friendly', text: 'Assicurati che il form sia compilabile comodamente da smartphone.' },
          ].map((tip, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <span className="text-4xl mb-2 block">{tip.ico}</span>
              <p className="text-base font-black text-slate-800 mb-1">{tip.title}</p>
              <p className="text-base text-slate-500 leading-relaxed">{tip.text}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/** TAB 5 — Log eventi: tabella raw paginata */
function TabLog({ data, loading, eventsPage, setEventsPage, totalEventsPages }) {
  const { events } = data;
  return (
    <div className="space-y-4">
      <p className="text-base text-slate-500">
        Sequenza cronologica inversa degli ultimi eventi registrati. Utile per debug e per verificare che ogni tipo di tracciamento funzioni correttamente.
      </p>
      <Card delay={0.1} className="p-0! overflow-hidden">
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-slate-400 mb-0.5">Raw events</p>
            <h3 className="text-xl font-black tracking-tight text-slate-900">
              Ultimi eventi
              {events && <span className="ml-2 text-base font-semibold text-slate-400">({events.total} totali)</span>}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" disabled={eventsPage <= 1} onClick={() => setEventsPage(p => p - 1)}
              className="rounded-xl border border-slate-200 px-2.5 py-1.5 text-base font-black text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition">‹ Prec</button>
            <span className="text-base text-slate-400 font-semibold tabular-nums">{eventsPage}/{totalEventsPages}</span>
            <button type="button" disabled={eventsPage >= totalEventsPages} onClick={() => setEventsPage(p => p + 1)}
              className="rounded-xl border border-slate-200 px-2.5 py-1.5 text-base font-black text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition">Succ ›</button>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16"><Spin size={6}/></div>
        ) : !events?.data?.length ? (
          <div className="flex flex-col items-center py-16 text-slate-400">
            <span className="text-5xl mb-3">📭</span>
            <p className="text-lg font-semibold">Nessun evento registrato</p>
            <p className="text-base mt-1">Naviga il sito per generare dati</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 font-black text-slate-500 uppercase tracking-wider text-sm">Azione</th>
                  <th className="text-left px-3 py-3 font-black text-slate-500 uppercase tracking-wider text-sm">Pagina</th>
                  <th className="text-left px-3 py-3 font-black text-slate-500 uppercase tracking-wider text-sm hidden md:table-cell">Sessione</th>
                  <th className="text-left px-3 py-3 font-black text-slate-500 uppercase tracking-wider text-sm hidden lg:table-cell">Schermo</th>
                  <th className="text-right px-5 py-3 font-black text-slate-500 uppercase tracking-wider text-sm">Quando</th>
                </tr>
              </thead>
              <tbody>
                {events.data.map((ev, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3">
                      <span className="block text-base font-bold text-slate-800">{translateAction(ev.action)}</span>
                      <span className="block font-mono text-sm text-slate-400">{ev.action || '?'}</span>
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      <span className="flex items-center gap-1 truncate max-w-40"><IcoGlobe/>{ev.page || '/'}</span>
                    </td>
                    <td className="px-3 py-3 font-mono text-slate-400 text-sm hidden md:table-cell">{ev.sessionId ?? '—'}</td>
                    <td className="px-3 py-3 text-slate-400 hidden lg:table-cell">{ev.screenW && ev.screenH ? `${ev.screenW}×${ev.screenH}` : '—'}</td>
                    <td className="px-5 py-3 text-right text-slate-400 whitespace-nowrap">{fmtDate(ev.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════
   COMPONENTE PRINCIPALE
══════════════════════════════════════════ */
export default function AdminAnalytics() {
  const [activeTab,    setActiveTab]    = useState('panoramica');
  const [stats,        setStats]        = useState(null);
  const [trends,       setTrends]       = useState([]);
  const [topPages,     setTopPages]     = useState([]);
  const [topActions,   setTopActions]   = useState([]);
  const [events,       setEvents]       = useState(null);
  const [deviceStats,  setDeviceStats]  = useState(null);
  const [sessionStats, setSessionStats] = useState(null);
  const [referrerStats, setReferrerStats] = useState([]);
  const [funnelStats,  setFunnelStats]  = useState(null);
  const [scrollDepth,  setScrollDepth]  = useState([]);
  const [hourlyTraffic, setHourlyTraffic] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [trendDays,    setTrendDays]    = useState(30);
  const [eventsPage,   setEventsPage]   = useState(1);
  const EVENTS_LIMIT = 20;

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, tr, tp, ta, ev, ds, ss, rs, fn, sd, ht] = await Promise.allSettled([
        getAnalyticsStats(),
        getAnalyticsTrends(trendDays),
        getAnalyticsTopPages(10),
        getAnalyticsTopActions(8),
        getAnalyticsEvents(eventsPage, EVENTS_LIMIT),
        fetchDeviceStats(),
        fetchSessionStats(),
        fetchReferrerStats(8),
        fetchFunnelStats(),
        getAnalyticsScrollDepth(),
        getAnalyticsHourly(),
      ]);
      if (s.status  === 'fulfilled') setStats(s.value);          else setError('Servizio analytics non raggiungibile (porta 8001).');
      if (tr.status === 'fulfilled') setTrends(tr.value);
      if (tp.status === 'fulfilled') setTopPages(tp.value);
      if (ta.status === 'fulfilled') setTopActions(ta.value);
      if (ev.status === 'fulfilled') setEvents(ev.value);
      if (ds.status === 'fulfilled') setDeviceStats(ds.value);
      if (ss.status === 'fulfilled') setSessionStats(ss.value);
      if (rs.status === 'fulfilled') setReferrerStats(rs.value);
      if (fn.status === 'fulfilled') setFunnelStats(fn.value);
      if (sd.status === 'fulfilled') setScrollDepth(sd.value);
      if (ht.status === 'fulfilled') setHourlyTraffic(ht.value);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [trendDays, eventsPage]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const totalEventsPages = events ? Math.ceil(events.total / EVENTS_LIMIT) : 1;

  const sharedData = {
    stats, trends, topPages, topActions, events,
    deviceStats, sessionStats, referrerStats, funnelStats,
    scrollDepth, hourlyTraffic,
  };

  return (
    <div className="p-8 md:p-10 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <p className="text-base font-black uppercase tracking-[0.24em] text-slate-400 mb-1">Area riservata</p>
          <h1 className="text-5xl font-black tracking-[-0.04em] text-slate-950 leading-none">Analytics Hub</h1>
          <p className="text-slate-500 mt-1.5 text-lg">Dati reali dal sito · Python + MongoDB</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[7, 30, 90].map(d => (
            <button key={d} type="button" onClick={() => setTrendDays(d)}
              className={`rounded-2xl border px-3.5 py-2 text-base font-black transition ${trendDays === d ? 'border-slate-900 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
              {d}gg
            </button>
          ))}
          <button type="button" onClick={loadAll}
            className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-base font-black text-slate-600 hover:bg-slate-50 transition ml-1">
            <IcoRefresh/> Aggiorna
          </button>
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-lg font-medium text-amber-700 flex items-center gap-3 mb-6">
          ⚠️ {error}
          <span className="text-base text-amber-500 ml-auto">Avvia il container <code className="font-mono">blendstudio_analytics</code></span>
        </div>
      )}

      {/* ── Tab bar ── */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-2xl p-1 mb-8 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-base font-black whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}>
            {activeTab === tab.id && (
              <motion.span layoutId="tabIndicator" className="absolute inset-0 rounded-xl bg-white shadow-sm" style={{ zIndex: -1 }}/>
            )}
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}>
          {activeTab === 'panoramica'  && <TabPanoramica  data={sharedData} loading={loading} trendDays={trendDays}/>}
          {activeTab === 'contenuti'   && <TabContenuti   data={sharedData} loading={loading}/>}
          {activeTab === 'audience'    && <TabAudience    data={sharedData} loading={loading}/>}
          {activeTab === 'conversione' && <TabConversione data={sharedData} loading={loading}/>}
          {activeTab === 'log'         && (
            <TabLog data={sharedData} loading={loading}
              eventsPage={eventsPage} setEventsPage={setEventsPage}
              totalEventsPages={totalEventsPages}/>
          )}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
