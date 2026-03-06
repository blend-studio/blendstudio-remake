import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  getAnalyticsStats, getAnalyticsTrends, getAnalyticsTopPages,
  getAnalyticsTopActions, getAnalyticsEvents,
  getAnalyticsScrollDepth, getAnalyticsHourly,
} from '../services/api';
import { fetchDeviceStats, fetchSessionStats, fetchReferrerStats, fetchFunnelStats } from '../hooks/useTelemetry';

/* â”€â”€â”€ Icons â”€â”€â”€ */
function IcoRefresh() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
}
function IcoUsers() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function IcoZap() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
}
function IcoCalendar() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function IcoTrend() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
}
function IcoGlobe() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
}

/* â”€â”€â”€ Action label translations â”€â”€â”€ */
const ACTION_LABELS = {
  page_view:              'Visualizzazione pagina',
  scroll_depth:           'ProfonditÃ  scroll',
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
function translateAction(action) {
  if (!action) return 'Sconosciuta';
  return ACTION_LABELS[action] ?? action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/* â”€â”€â”€ Bar gradient palette â”€â”€â”€ */
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

/* â”€â”€â”€ Helpers â”€â”€â”€ */
function fmt(n) {
  if (n == null) return 'â€”';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}

/* â”€â”€â”€ Smooth cubic bezier path helper â”€â”€â”€ */
function smoothPath(pts) {
  if (pts.length < 2) return pts.map(([x,y],i) => `${i===0?'M':'L'}${x},${y}`).join(' ');
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  return d;
}

/* â”€â”€â”€ Line chart SVG â”€â”€â”€ */
function LineChart({ data, height = 148 }) {
  const [tooltip, setTooltip] = React.useState(null);
  if (!data || data.length === 0) return <div className="flex items-center justify-center h-28 text-slate-400 text-sm">Nessun dato</div>;

  const W = 600; const H = height;
  const PAD_L = 18; const PAD_R = 6; const PAD_T = 14; const PAD_B = 22;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const evVals  = data.map(d => d.events);
  const sesVals = data.map(d => d.sessions ?? 0);
  const maxVal  = Math.max(...evVals, ...sesVals, 1);
  const GRID    = 4;

  const toX = i => PAD_L + (i / (data.length - 1 || 1)) * chartW;
  const toY = v => PAD_T + (1 - v / maxVal) * chartH;

  const evPts  = evVals.map((v, i)  => [toX(i), toY(v)]);
  const sesPts = sesVals.map((v, i) => [toX(i), toY(v)]);

  const evPathD  = smoothPath(evPts);
  const sePathD  = smoothPath(sesPts);
  const evFillD  = `${evPathD} L${evPts[evPts.length-1][0]},${PAD_T+chartH} L${evPts[0][0]},${PAD_T+chartH} Z`;
  const sesFillD = `${sePathD} L${sesPts[sesPts.length-1][0]},${PAD_T+chartH} L${sesPts[0][0]},${PAD_T+chartH} Z`;

  const labelStep = Math.max(1, Math.floor(data.length / 7));

  return (
    <div className="relative select-none">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}
        onMouseLeave={() => setTooltip(null)}>
        <defs>
          <linearGradient id="evGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#2f6580" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#2f6580" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="sesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#764ba2" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#764ba2" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {Array.from({length: GRID + 1}).map((_, i) => {
          const y   = PAD_T + (i / GRID) * chartH;
          const val = Math.round(maxVal * (1 - i / GRID));
          return (
            <g key={i}>
              <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y}
                stroke="#e2e8f0" strokeWidth="1" strokeDasharray={i === GRID ? '0' : '4 3'} />
              <text x={PAD_L - 4} y={y + 3.5} textAnchor="end" fontSize="8" fill="#cbd5e1">
                {val > 0 ? val : ''}
              </text>
            </g>
          );
        })}

        {/* Sessions fill + dashed line */}
        <path d={sesFillD} fill="url(#sesGrad)" />
        <path d={sePathD} fill="none" stroke="#764ba2" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 3" />

        {/* Events fill + solid line */}
        <path d={evFillD} fill="url(#evGrad)" />
        <path d={evPathD} fill="none" stroke="#2f6580" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" />

        {/* Date labels */}
        {data.map((d, i) => i % labelStep === 0 && (
          <text key={i} x={toX(i)} y={H - 4} textAnchor="middle" fontSize="8.5" fill="#94a3b8">
            {d.date.slice(5)}
          </text>
        ))}

        {/* Last dot */}
        <circle cx={evPts[evPts.length-1][0]} cy={evPts[evPts.length-1][1]}
          r="4" fill="#2f6580" stroke="white" strokeWidth="1.5" />

        {/* Hover zones */}
        {data.map((d, i) => (
          <rect key={i}
            x={toX(i) - chartW / data.length / 2}
            y={PAD_T} width={chartW / data.length} height={chartH}
            fill="transparent"
            onMouseEnter={() => setTooltip({ i, x: toX(i), d })}
          />
        ))}

        {/* Crosshair */}
        {tooltip && (
          <g>
            <line x1={tooltip.x} y1={PAD_T} x2={tooltip.x} y2={PAD_T + chartH}
              stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" />
            <circle cx={tooltip.x} cy={toY(tooltip.d.events)} r="3.5" fill="#2f6580" stroke="white" strokeWidth="1.5" />
            <circle cx={tooltip.x} cy={toY(tooltip.d.sessions ?? 0)} r="3" fill="#764ba2" stroke="white" strokeWidth="1.5" />
          </g>
        )}
      </svg>

      {/* Tooltip box */}
      {tooltip && (
        <div className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-xl px-3 py-2 text-[11px] font-semibold shadow-xl whitespace-nowrap z-10 flex items-center gap-3">
          <span className="text-slate-400">{tooltip.d.date}</span>
          <span style={{ color: '#6fb3cc' }}>â— {tooltip.d.events} eventi</span>
          <span style={{ color: '#b39ddb' }}>â— {tooltip.d.sessions ?? 0} sessioni</span>
        </div>
      )}
    </div>
  );
}

/* â”€â”€â”€ Horizontal bar chart â”€â”€â”€ */
function HBarChart({ data, labelKey = 'page', valueKey = 'views', translateLabel }) {
  if (!data || data.length === 0) return <div className="text-slate-400 text-sm py-6 text-center">Nessun dato</div>;
  const total = data.reduce((s, d) => s + d[valueKey], 0) || 1;
  const max   = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div className="space-y-3">
      {data.map((d, i) => {
        const [c0, c1] = BAR_GRADIENTS[i % BAR_GRADIENTS.length];
        const pct   = Math.round((d[valueKey] / total) * 100);
        const label = translateLabel ? translateLabel(d[labelKey]) : d[labelKey];
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="w-5 text-[10px] font-black shrink-0 text-right" style={{ color: c0 }}>{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-700 truncate max-w-[72%]">{label}</span>
                <span className="text-xs font-black text-slate-500 shrink-0 ml-2 tabular-nums">
                  {d[valueKey]} <span className="text-slate-300">Â·</span> <span style={{ color: c0 }}>{pct}%</span>
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(d[valueKey] / max) * 100}%` }}
                  transition={{ duration: 0.65, delay: i * 0.05, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg,${c0},${c1})` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* â”€â”€â”€ KPI Card â”€â”€â”€ */
function KpiCard({ label, value, sub, icon, gradient, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-[24px] p-6 text-white"
      style={{ background: gradient }}
    >
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="relative flex flex-col gap-3">
        <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">{icon}</div>
        <div>
          <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-0.5">{label}</p>
          <p className="text-3xl font-black leading-none tabular-nums">{fmt(value)}</p>
          {sub != null && <p className="text-white/50 text-xs mt-1">{sub}</p>}
        </div>
      </div>
    </motion.div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   SECTION HEADER â€” titolo + descrizione
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="mb-5">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-0.5">{eyebrow}</p>
      <h3 className="text-base font-black tracking-tight text-slate-900 mb-1.5">{title}</h3>
      {description && <p className="text-xs text-slate-500 leading-relaxed">{description}</p>}
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   INSIGHT CALLOUT â€” avvisi contestuali
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function InsightCallout({ type = 'info', children }) {
  const styles = {
    info:    { bg: 'bg-sky-50',     border: 'border-sky-200',     text: 'text-sky-700',     icon: 'â„¹ï¸' },
    warning: { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   icon: 'âš ï¸' },
    success: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'âœ…' },
  };
  const s = styles[type];
  return (
    <div className={`mt-4 flex items-start gap-2 rounded-xl border ${s.border} ${s.bg} px-3 py-2.5`}>
      <span className="mt-0.5 shrink-0 text-[13px]">{s.icon}</span>
      <p className={`text-[11px] font-medium leading-relaxed ${s.text}`}>{children}</p>
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   VERTICAL BAR CHART â€” orario / scroll depth
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function VBarChart({ data, xKey = 'label', yKey = 'count', color = '#2f6580', color2, height = 110, highlightPeak = false }) {
  const [tip, setTip] = React.useState(null);
  if (!data?.length) return <div className="flex items-center justify-center text-slate-400 text-sm" style={{ height }}>Nessun dato</div>;
  const max   = Math.max(...data.map(d => d[yKey]), 1);
  const W = 600, H = height, PL = 4, PR = 4, PT = 10, PB = 20;
  const barW  = (W - PL - PR) / data.length;
  const BAR_PAD = barW * 0.22;
  const peakIdx = data.reduce((pi, d, i) => d[yKey] > data[pi][yKey] ? i : pi, 0);
  return (
    <div className="relative select-none">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} onMouseLeave={() => setTip(null)}>
        <defs>
          {data.map((_, i) => {
            const peak = highlightPeak && i === peakIdx;
            const c0 = peak ? (color2 || '#f7971e') : color;
            const c1 = peak ? '#ffd200' : (color2 || color);
            return (
              <linearGradient key={i} id={`vbg${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={c0} stopOpacity="0.95" />
                <stop offset="100%" stopColor={c1} stopOpacity="0.5"  />
              </linearGradient>
            );
          })}
        </defs>
        {[0, 0.5, 1].map((f, i) => (
          <line key={i} x1={PL} y1={PT + f * (H - PT - PB)} x2={W - PR} y2={PT + f * (H - PT - PB)}
            stroke="#e2e8f0" strokeWidth="1" strokeDasharray={f === 1 ? '0' : '4 3'} />
        ))}
        {data.map((d, i) => {
          const x  = PL + i * barW + BAR_PAD;
          const bw = barW - BAR_PAD * 2;
          const bh = (d[yKey] / max) * (H - PT - PB);
          const y  = PT + (H - PT - PB) - bh;
          return (
            <g key={i} onMouseEnter={() => setTip({ i, x: PL + i * barW + barW / 2, d })}>
              <rect x={x} y={y} width={bw} height={bh} rx="3" fill={`url(#vbg${i})`} />
              {(data.length <= 24 && i % Math.max(1, Math.floor(data.length / 12)) === 0) &&
                <text x={PL + i * barW + barW / 2} y={H - 4} textAnchor="middle" fontSize="7.5" fill="#94a3b8">{d[xKey]}</text>}
            </g>
          );
        })}
        {tip && <line x1={tip.x} y1={PT} x2={tip.x} y2={H - PB} stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" />}
      </svg>
      {tip && (
        <div className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-xl px-3 py-2 text-[11px] font-semibold shadow-xl whitespace-nowrap z-10">
          <span className="text-slate-400 mr-2">{tip.d[xKey]}</span>
          <span style={{ color: '#6fb3cc' }}>{tip.d[yKey]} {yKey === 'sessions' ? 'sessioni' : 'eventi'}</span>
        </div>
      )}
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   DONUT CHART â€” ripartizione dispositivi
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function DonutChart({ segments }) {
  const [hovered, setHovered] = React.useState(null);
  if (!segments?.length) return <div className="text-slate-400 text-sm text-center py-4">Nessun dato</div>;
  const R = 80, r = 52, CX = 100, CY = 100;
  const total = segments.reduce((s, sg) => s + sg.value, 0) || 1;
  let angle = -Math.PI / 2;
  const arcs = segments.map(sg => {
    const sweep = (sg.value / total) * 2 * Math.PI;
    const a0 = angle, a1 = angle + sweep; angle = a1;
    const [x0,y0] = [CX+R*Math.cos(a0), CY+R*Math.sin(a0)];
    const [x1,y1] = [CX+R*Math.cos(a1), CY+R*Math.sin(a1)];
    const [ix0,iy0] = [CX+r*Math.cos(a0), CY+r*Math.sin(a0)];
    const [ix1,iy1] = [CX+r*Math.cos(a1), CY+r*Math.sin(a1)];
    const lg = sweep > Math.PI ? 1 : 0;
    const d = `M${x0},${y0} A${R},${R},0,${lg},1,${x1},${y1} L${ix1},${iy1} A${r},${r},0,${lg},0,${ix0},${iy0} Z`;
    return { ...sg, d, pct: Math.round((sg.value / total) * 100) };
  });
  const active = hovered != null ? arcs[hovered] : arcs[0];
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 200 200" className="w-36 h-36 shrink-0">
        {arcs.map((a, i) => (
          <path key={i} d={a.d} fill={a.color}
            opacity={hovered === null || hovered === i ? 1 : 0.4}
            style={{ cursor: 'pointer', transition: 'opacity .15s' }}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} />
        ))}
        <text x="100" y="97"  textAnchor="middle" fontSize="22" fontWeight="900" fill="#0f172a">{active?.pct}%</text>
        <text x="100" y="113" textAnchor="middle" fontSize="9"  fill="#94a3b8">{active?.label}</text>
      </svg>
      <div className="flex-1 space-y-2.5">
        {arcs.map((a, i) => (
          <div key={i} className="flex items-center justify-between gap-2"
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
            style={{ opacity: hovered === null || hovered === i ? 1 : 0.45, transition: 'opacity .15s', cursor: 'default' }}>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: a.color }} />
              <span className="text-xs font-semibold text-slate-700">{a.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{a.value}</span>
              <span className="text-xs font-black tabular-nums" style={{ color: a.color }}>{a.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* â”€â”€ Card wrapper â”€â”€ */
function Card({ delay = 0, className = '', children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
      className={`rounded-[28px] border border-slate-100 bg-white p-7 shadow-sm ${className}`}>
      {children}
    </motion.div>
  );
}

/* â”€â”€â”€ Main component â”€â”€â”€ */
export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [topActions, setTopActions] = useState([]);
  const [events, setEvents] = useState(null);
  const [deviceStats, setDeviceStats] = useState(null);
  const [sessionStats, setSessionStats] = useState(null);
  const [referrerStats, setReferrerStats] = useState([]);
  const [funnelStats, setFunnelStats] = useState(null);
  const [scrollDepth, setScrollDepth] = useState([]);
  const [hourlyTraffic, setHourlyTraffic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trendDays, setTrendDays] = useState(30);
  const [eventsPage, setEventsPage] = useState(1);
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
      if (s.status === 'fulfilled') setStats(s.value);
      else setError('Servizio analytics non raggiungibile (porta 8001).');
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

  // Derived insights
  const bounceHigh     = sessionStats && sessionStats.bounce_rate > 65;
  const bounceLow      = sessionStats && sessionStats.bounce_rate < 35;
  const peakHour       = hourlyTraffic.length ? hourlyTraffic.reduce((p, h) => h.count > p.count ? h : p, hourlyTraffic[0]) : null;
  const sdAt25         = scrollDepth.find(d => d.depth === 25);
  const sdAt50         = scrollDepth.find(d => d.depth === 50);
  const sdAt100        = scrollDepth.find(d => d.depth === 100);
  const sdTotal        = sdAt25?.sessions ?? 0;
  const pct50          = sdTotal > 0 && sdAt50 ? Math.round((sdAt50.sessions / sdTotal) * 100) : null;
  const pct100         = sdTotal > 0 && sdAt100 ? Math.round((sdAt100.sessions / sdTotal) * 100) : null;
  const deviceSegments = deviceStats ? [
    { label: 'Desktop', value: deviceStats.desktop?.count ?? 0, color: '#2f6580' },
    { label: 'Mobile',  value: deviceStats.mobile?.count  ?? 0, color: '#f5576c' },
    { label: 'Tablet',  value: deviceStats.tablet?.count  ?? 0, color: '#764ba2' },
  ] : [];

  return (
    <div className="p-8 md:p-10 space-y-10 max-w-7xl mx-auto">

      {/* â”€â”€ Header â”€â”€ */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400 mb-1">Area riservata / Analytics</p>
          <h1 className="text-3xl font-black tracking-[-0.04em] text-slate-950 leading-none">Analytics Hub</h1>
          <p className="text-slate-500 mt-1.5 text-sm">Traffico reale dal sito Â· servizio Python + MongoDB</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[7, 30, 90].map(d => (
            <button key={d} type="button" onClick={() => setTrendDays(d)}
              className={`rounded-2xl border px-3.5 py-2 text-xs font-black transition ${trendDays === d ? 'border-slate-900 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
              {d}gg
            </button>
          ))}
          <button type="button" onClick={loadAll}
            className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-black text-slate-600 hover:bg-slate-50 transition ml-1">
            <IcoRefresh /> Aggiorna
          </button>
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 flex items-center gap-3">
          âš ï¸ {error}
          <span className="text-xs text-amber-500 ml-auto">Controlla che il container <code className="font-mono">blendstudio_analytics</code> sia attivo</span>
        </div>
      )}

      {/* â•â•â•â• Â§ 1 PANORAMICA â•â•â•â• */}
      <section>
        <div className="mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Â§ 1 Â· Panoramica</p>
          <p className="text-xs text-slate-500 mt-0.5">I numeri chiave del sito in un colpo d'occhio. "Oggi" e "Questa settimana" si aggiornano in tempo reale.</p>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard label="Totale eventi"    value={stats?.total_events}    sub="dall'inizio dei tempi"     icon={<IcoZap />}      gradient="linear-gradient(135deg,#2f6580,#4a8fa3)" delay={0}    />
          <KpiCard label="Oggi"             value={stats?.today_events}    sub="ultime 24 ore"             icon={<IcoCalendar />} gradient="linear-gradient(135deg,#667eea,#764ba2)" delay={0.07} />
          <KpiCard label="Questa settimana" value={stats?.week_events}     sub="ultimi 7 giorni"           icon={<IcoTrend />}    gradient="linear-gradient(135deg,#11998e,#38ef7d)" delay={0.14} />
          <KpiCard label="Sessioni uniche"  value={stats?.unique_sessions} sub="utenti distinti tracciati" icon={<IcoUsers />}    gradient="linear-gradient(135deg,#f093fb,#f5576c)" delay={0.21} />
        </div>
      </section>

      {/* â•â•â•â• Â§ 2 ANDAMENTO â•â•â•â• */}
      <section>
        <div className="mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Â§ 2 Â· Andamento nel tempo</p>
          <p className="text-xs text-slate-500 mt-0.5">Quanti eventi e sessioni sono stati registrati giorno per giorno. Un picco indica traffico maggiore; un calo puÃ² segnalare problemi tecnici o campagne terminate.</p>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_310px] gap-5">

          {/* Trend */}
          <Card delay={0.25}>
            <div className="flex items-center justify-between mb-5">
              <SectionHeader eyebrow="Trend" title={`Traffico ultimi ${trendDays} giorni`}
                description="Linea continua = eventi totali Â· tratteggiata = sessioni uniche. Passa il cursore per i dettagli." />
              <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0 mb-auto">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#2f6580]" />Eventi</span>
                <span className="flex items-center gap-1.5"><span className="inline-block h-px w-5 border-t-2 border-dashed border-[#764ba2]" />Sessioni</span>
              </div>
            </div>
            {loading
              ? <div className="h-28 flex items-center justify-center"><div className="w-6 h-6 rounded-full border-2 border-[#2f6580] border-t-transparent animate-spin" /></div>
              : <LineChart data={trends} />}
          </Card>

          {/* Orario */}
          <Card delay={0.3}>
            <SectionHeader eyebrow="Orario di punta" title="Quando ci visitano"
              description="Distribuzione degli eventi nelle 24 ore (fuso Europa/Roma). La barra ambra indica il picco." />
            {loading
              ? <div className="h-28 flex items-center justify-center"><div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" /></div>
              : <VBarChart data={hourlyTraffic} xKey="label" yKey="count" color="#4facfe" color2="#f7971e" height={110} highlightPeak />}
            {!loading && peakHour && (
              <InsightCallout type="info">
                Le visite si concentrano alle <strong>{peakHour.label}</strong> ({peakHour.count} eventi). Pianifica post sui social o invii email in questa fascia.
              </InsightCallout>
            )}
          </Card>
        </div>
      </section>

      {/* â•â•â•â• Â§ 3 CONTENUTI â•â•â•â• */}
      <section>
        <div className="mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Â§ 3 Â· Contenuti piÃ¹ efficaci</p>
          <p className="text-xs text-slate-500 mt-0.5">Quali pagine attraggono piÃ¹ attenzione e quali azioni compiono gli utenti. Utile per capire dove concentrare gli aggiornamenti.</p>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          {/* Top pages */}
          <Card delay={0.35}>
            <SectionHeader eyebrow="Pagine" title="Pagine piÃ¹ visitate"
              description="Classifica per numero di visualizzazioni. La percentuale indica la quota sul totale delle visite al sito." />
            {loading
              ? <div className="h-32 flex items-center justify-center"><div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" /></div>
              : <HBarChart data={topPages} labelKey="page" valueKey="views" />}
          </Card>

          {/* Top actions */}
          <Card delay={0.4}>
            <SectionHeader eyebrow="Azioni" title="Cosa fanno gli utenti"
              description="Le interazioni piÃ¹ frequenti tracciate (scroll, clic, invio form). Ogni azione corrisponde a un comportamento preciso." />
            {loading ? (
              <div className="h-24 flex items-center justify-center"><div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" /></div>
            ) : topActions.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">Nessun dato</p>
            ) : (
              <div className="space-y-2">
                {topActions.map((a, i) => {
                  const [c0, c1] = BAR_GRADIENTS[i % BAR_GRADIENTS.length];
                  return (
                    <div key={i} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 px-3.5 py-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-black text-white shrink-0"
                          style={{ background: `linear-gradient(135deg,${c0},${c1})` }}>{i + 1}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{translateAction(a.action)}</p>
                          <p className="text-[9px] font-mono text-slate-400 truncate">{a.action}</p>
                        </div>
                      </div>
                      <span className="text-sm font-black tabular-nums shrink-0" style={{ color: c0 }}>{a.count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* â•â•â•â• Â§ 4 COINVOLGIMENTO â•â•â•â• */}
      <section>
        <div className="mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Â§ 4 Â· Coinvolgimento</p>
          <p className="text-xs text-slate-500 mt-0.5">Quanto leggono davvero le pagine? I dati di scroll rivelano se i contenuti nella parte bassa della pagina vengono effettivamente visti.</p>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">

          {/* Scroll depth */}
          <Card delay={0.45}>
            <SectionHeader eyebrow="Scroll depth" title="ProfonditÃ  di lettura"
              description="Numero di sessioni che hanno raggiunto il 25%, 50%, 75% e 100% della pagina. Un calo ripido tra il 25% e il 50% indica che i contenuti dopo il primo schermo non vengono letti." />
            {loading ? (
              <div className="h-28 flex items-center justify-center"><div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" /></div>
            ) : scrollDepth.every(d => d.sessions === 0) ? (
              <p className="text-slate-400 text-sm text-center py-4">Dati di scroll non ancora disponibili â€” naviga il sito per generarli.</p>
            ) : (
              <div className="mt-2">
                <VBarChart data={scrollDepth} xKey="label" yKey="sessions" color="#2f6580" color2="#4a8fa3" height={120} />
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {scrollDepth.map(d => (
                    <div key={d.depth} className="rounded-2xl bg-slate-50 border border-slate-100 p-3 text-center">
                      <p className="text-lg font-black text-slate-900 tabular-nums">{d.sessions}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{d.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!loading && pct50 !== null && pct50 < 40 && (
              <InsightCallout type="warning">
                Solo il {pct50}% degli utenti scorre oltre la metÃ  della pagina. Considera di anticipare le call to action nel primo schermo.
              </InsightCallout>
            )}
            {!loading && pct100 !== null && pct100 > 30 && (
              <InsightCallout type="success">
                Il {pct100}% degli utenti arriva in fondo alle pagine â€” contenuto di alta qualitÃ  e ottimo engagement.
              </InsightCallout>
            )}
          </Card>

          {/* Session quality */}
          <Card delay={0.48}>
            <SectionHeader eyebrow="QualitÃ  sessioni" title="Come si comportano"
              description="Il bounce rate misura quanti utenti abbandonano dopo una sola pagina. Sotto il 50% Ã¨ un buon risultato per un sito portfolio/servizi." />
            {loading || !sessionStats ? (
              <div className="h-20 flex items-center justify-center"><div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" /></div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { label: 'Bounce rate',         value: `${sessionStats.bounce_rate}%`,        sub: 'sessioni a 1 pagina', color: sessionStats.bounce_rate > 65 ? '#f5576c' : sessionStats.bounce_rate < 40 ? '#11998e' : '#f7971e' },
                    { label: 'Interaz./sessione',   value: sessionStats.avg_events_per_session,   sub: 'azioni per visita',   color: '#2f6580' },
                    { label: 'Pagine/sessione',      value: sessionStats.avg_pages_per_session,    sub: 'profonditÃ  media',    color: '#764ba2' },
                  ].map((item, i) => (
                    <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{item.sub}</p>
                      </div>
                      <p className="text-2xl font-black tabular-nums" style={{ color: item.color }}>{item.value}</p>
                    </div>
                  ))}
                </div>
                {bounceHigh && <InsightCallout type="warning">Bounce rate elevato ({sessionStats.bounce_rate}%): molti utenti escono senza esplorare. Considera A/B test sulla homepage o migliora il tempo di caricamento.</InsightCallout>}
                {bounceLow  && <InsightCallout type="success">Bounce rate ottimo ({sessionStats.bounce_rate}%): gli utenti esplorano piÃ¹ pagine dopo l'atterraggio.</InsightCallout>}
              </>
            )}
          </Card>
        </div>
      </section>

      {/* â•â•â•â• Â§ 5 AUDIENCE â•â•â•â• */}
      <section>
        <div className="mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Â§ 5 Â· Audience</p>
          <p className="text-xs text-slate-500 mt-0.5">Chi sono i visitatori: con quale dispositivo arrivano e da quale sito/canale provengono.</p>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          {/* Devices donut */}
          <Card delay={0.5}>
            <SectionHeader eyebrow="Dispositivi" title="Ripartizione device"
              description="Basata sulla larghezza dello schermo: mobile &lt;768px, tablet 768â€“1023px, desktop â‰¥1024px. Un'alta quota mobile richiede design ottimizzato per touch." />
            {loading || !deviceStats ? (
              <div className="h-24 flex items-center justify-center"><div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" /></div>
            ) : (
              <>
                <DonutChart segments={deviceSegments} />
                {deviceStats.total_sessions > 0 && <p className="text-[10px] text-slate-400 mt-3">{deviceStats.total_sessions} sessioni analizzate</p>}
                {(deviceStats.mobile?.pct ?? 0) > 60 && (
                  <InsightCallout type="info">Oltre il 60% degli utenti visita da mobile. Verifica che tutti i componenti siano ottimizzati per schermi piccoli.</InsightCallout>
                )}
              </>
            )}
          </Card>

          {/* Referrers */}
          <Card delay={0.53}>
            <SectionHeader eyebrow="Sorgenti di traffico" title="Da dove arrivano"
              description={'"direct" indica chi inserisce l\'URL direttamente o usa i segnalibri. Le altre voci mostrano i canali che portano traffico verso il sito.'} />
            {loading || referrerStats.length === 0 ? (
              <div className="h-28 flex items-center justify-center text-slate-400 text-sm">
                {loading ? <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" /> : 'Nessun dato referrer'}
              </div>
            ) : (
              <HBarChart data={referrerStats} labelKey="source" valueKey="count" />
            )}
          </Card>
        </div>
      </section>

      {/* â•â•â•â• Â§ 6 CONVERSIONE â•â•â•â• */}
      <section>
        <div className="mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Â§ 6 Â· Conversione</p>
          <p className="text-xs text-slate-500 mt-0.5">Quanti visitatori arrivano a contattarvi? Il funnel traccia il percorso dalla visita all'invio del form di contatto.</p>
        </div>
        <Card delay={0.56}>
          <div className="flex items-start justify-between mb-5">
            <SectionHeader eyebrow="Funnel" title="Percorso di conversione"
              description="Ogni step mostra le sessioni uniche che hanno raggiunto quella fase. Un calo brusco tra due step indica un punto di attrito da migliorare." />
            {funnelStats && (
              <div className="shrink-0 text-right ml-4">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Conversion rate</p>
                <p className="text-2xl font-black tabular-nums" style={{ color: funnelStats.conversion_rate > 2 ? '#11998e' : '#f7971e' }}>{funnelStats.conversion_rate}%</p>
                <p className="text-[10px] text-slate-400">visita â†’ invio</p>
              </div>
            )}
          </div>
          {loading || !funnelStats ? (
            <div className="h-28 flex items-center justify-center"><div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" /></div>
          ) : (
            <>
              <div className="space-y-3">
                {funnelStats.steps.map((step, i) => {
                  const colors = ['#2f6580', '#667eea', '#11998e', '#f093fb'];
                  const c = colors[i] || '#2f6580';
                  const descs = ['Punto di partenza â€” tutti i visitatori', 'Hanno visitato la pagina contatti', 'Hanno iniziato a compilare il form', 'Hanno inviato il form â†’ lead generato'];
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full text-[9px] font-black flex items-center justify-center text-white shrink-0" style={{ background: c }}>{i + 1}</span>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{step.step}</p>
                            <p className="text-[10px] text-slate-400">{descs[i]}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="text-sm font-black tabular-nums text-slate-800">{step.count}</p>
                          <p className="text-[10px] font-semibold" style={{ color: c }}>{step.rate}%</p>
                        </div>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${step.rate}%` }}
                          transition={{ duration: 0.7, delay: i * 0.12, ease: 'easeOut' }}
                          className="h-full rounded-full" style={{ background: c }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              {funnelStats.conversion_rate < 1 && <InsightCallout type="warning">Tasso di conversione molto basso. Verifica che il form sia facilmente raggiungibile e che la pagina /contact si carichi correttamente.</InsightCallout>}
              {funnelStats.conversion_rate >= 3 && <InsightCallout type="success">Buon tasso di conversione ({funnelStats.conversion_rate}%). Il percorso verso il form Ã¨ efficace.</InsightCallout>}
            </>
          )}
        </Card>
      </section>

      {/* â•â•â•â• Â§ 7 LOG EVENTI â•â•â•â• */}
      <section>
        <div className="mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Â§ 7 Â· Log eventi</p>
          <p className="text-xs text-slate-500 mt-0.5">Sequenza cronologica inversa degli ultimi eventi registrati. Utile per debug e per verificare che il tracciamento funzioni correttamente.</p>
        </div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.4 }}
          className="rounded-[28px] border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-0.5">Log</p>
              <h3 className="text-base font-black tracking-tight text-slate-900">
                Ultimi eventi
                {events && <span className="ml-2 text-[11px] font-semibold text-slate-400">({events.total} totali)</span>}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" disabled={eventsPage <= 1} onClick={() => setEventsPage(p => p - 1)}
                className="rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-black text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition">â€¹ Prec</button>
              <span className="text-xs text-slate-400 font-semibold">{eventsPage}/{totalEventsPages}</span>
              <button type="button" disabled={eventsPage >= totalEventsPages} onClick={() => setEventsPage(p => p + 1)}
                className="rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-black text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition">Succ â€º</button>
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16"><div className="w-6 h-6 rounded-full border-2 border-[#2f6580] border-t-transparent animate-spin" /></div>
          ) : !events || events.data?.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-slate-400">
              <span className="text-3xl mb-3">ðŸ“­</span>
              <p className="text-sm font-semibold">Nessun evento registrato</p>
              <p className="text-xs mt-1">Naviga sul sito per generare dati</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-5 py-3 font-black text-slate-500 uppercase tracking-wider text-[10px]">Azione</th>
                    <th className="text-left px-3 py-3 font-black text-slate-500 uppercase tracking-wider text-[10px]">Pagina</th>
                    <th className="text-left px-3 py-3 font-black text-slate-500 uppercase tracking-wider text-[10px] hidden md:table-cell">Sessione</th>
                    <th className="text-left px-3 py-3 font-black text-slate-500 uppercase tracking-wider text-[10px] hidden lg:table-cell">Schermo</th>
                    <th className="text-right px-5 py-3 font-black text-slate-500 uppercase tracking-wider text-[10px]">Quando</th>
                  </tr>
                </thead>
                <tbody>
                  {events.data.map((ev, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3">
                        <span className="block text-[11px] font-bold text-slate-800">{translateAction(ev.action)}</span>
                        <span className="block font-mono text-[9px] text-slate-400">{ev.action || '?'}</span>
                      </td>
                      <td className="px-3 py-3 text-slate-600 max-w-[160px] truncate">
                        <span className="flex items-center gap-1"><IcoGlobe />{ev.page || '/'}</span>
                      </td>
                      <td className="px-3 py-3 font-mono text-slate-400 text-[10px] hidden md:table-cell">{ev.sessionId ?? 'â€”'}</td>
                      <td className="px-3 py-3 text-slate-400 hidden lg:table-cell">{ev.screenW && ev.screenH ? `${ev.screenW}Ã—${ev.screenH}` : 'â€”'}</td>
                      <td className="px-5 py-3 text-right text-slate-400 whitespace-nowrap">{fmtDate(ev.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </section>

    </div>
  );
}
