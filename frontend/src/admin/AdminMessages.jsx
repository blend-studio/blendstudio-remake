import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { deleteMessage, getMessages, getSignature, markMessageRead, replyMessage, uploadSignature } from '../services/api';
import { AdminDialog, AdminDialogHeader } from './AdminUI';

/* ─────────────────────────── Icons ─────────────────────────── */
const IcoInbox    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 4H9l-3-4H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z"/></svg>;
const IcoUnread   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IcoRead     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><polyline points="16,3 12,7 8,3"/></svg>;
const IcoToday    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoTrash    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const IcoReply    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>;
const IcoSend     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const IcoSearch   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoClose    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoRefresh  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
const IcoCopy     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const IcoPhone    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.2 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.72-.72a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IcoCheck    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoMarkUnread = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IcoSignature  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 19.5v.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8.5L18 5.5"/><path d="M15 2v4h4"/><path d="M8 18h1l6.25-6.25-1-1L8 17v1z"/></svg>;
const IcoUpload     = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
/* Formatting toolbar icons */
const IcoBold       = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>;
const IcoItalic     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>;
const IcoUnderline  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>;
const IcoUL         = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>;
const IcoOL         = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>;
const IcoLink       = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const IcoAlignL     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>;
const IcoAlignC     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>;
const IcoStrike     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" y1="12" x2="20" y2="12"/></svg>;
const IcoClearFmt   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h16v3"/><path d="M5 20h6"/><path d="M13 4 8 20"/><line x1="18" y1="12" x2="22" y2="16"/><line x1="22" y1="12" x2="18" y2="16"/></svg>;
const IcoH1         = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h8"/><path d="M4 6v12"/><path d="M12 6v12"/><path d="M17 10v6l3-1.5"/></svg>;
const IcoBlockquote = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>;

/* ─────────────────────────── Helpers ─────────────────────────── */
function fmtShort(d) {
  const date = new Date(d);
  const now  = new Date();
  const diff = Math.floor((now - date) / 86400000);
  if (diff === 0) return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  if (diff === 1) return 'Ieri';
  if (diff < 7)  return date.toLocaleDateString('it-IT', { weekday: 'short' });
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
}

function fmtFull(d) {
  return new Date(d).toLocaleString('it-IT', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
}

function fmtTime(d) {
  return new Date(d).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}

function isToday(d) {
  const date = new Date(d);
  const now  = new Date();
  return (
    date.getDate()     === now.getDate()     &&
    date.getMonth()    === now.getMonth()    &&
    date.getFullYear() === now.getFullYear()
  );
}

function getInitials(name) {
  return (name ?? '?').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

const AVATAR_COLORS = [
  'bg-violet-500', 'bg-amber-500', 'bg-sky-500',
  'bg-rose-500',   'bg-emerald-500', 'bg-indigo-500',
  'bg-pink-500',   'bg-teal-500',
];
function avatarColor(name) {
  return AVATAR_COLORS[(name ?? '').charCodeAt(0) % AVATAR_COLORS.length];
}

function previewText(text, len = 88) {
  if (!text) return '';
  return text.length > len ? text.slice(0, len) + '…' : text;
}

function readingTime(text) {
  const words = (text ?? '').split(/\s+/).filter(Boolean).length;
  return Math.ceil(words / 3);
}

function htmlToPlainText(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.innerText || tmp.textContent || '';
}

/* ─────────────────────────── Reply templates ─────────────────────────── */
const REPLY_TEMPLATES = [
  {
    label: 'Conferma ricezione',
    html: '<p>Gentile <strong>{name}</strong>,</p><p>Grazie per averci contattato. Abbiamo ricevuto il tuo messaggio e ti risponderemo al più presto.</p><p>A presto,<br><strong>Team Blend Studio</strong></p>',
  },
  {
    label: 'Proposta chiamata',
    html: '<p>Gentile <strong>{name}</strong>,</p><p>Grazie per il tuo interesse. Sarebbe un piacere fissare una call conoscitiva.</p><p>Sei disponibile questa settimana per una videochiamata di 30 minuti? Fammi sapere giorno e orario preferiti.</p><p>A presto,<br><strong>Team Blend Studio</strong></p>',
  },
  {
    label: 'Richiesta info',
    html: '<p>Gentile <strong>{name}</strong>,</p><p>Grazie per averci scritto! Per prepararti una proposta, ci servirebbero alcune informazioni aggiuntive:</p><ul><li>Qual è il tuo obiettivo principale?</li><li>Hai già un sito esistente?</li><li>Hai una data di lancio in mente?</li></ul><p>A presto,<br><strong>Team Blend Studio</strong></p>',
  },
];

/* ─────────────────────────── Defaults ─────────────────────────── */
const DEFAULT_SIGNATURE_HTML = '<p><br></p><hr style="border:none;border-top:1px solid #e2e8f0;margin:12px 0"><p style="margin:0;font-size:13px;color:#64748b"><strong style="color:#0f172a">Team Blend Studio</strong><br><a href="https://blendstudio.it" style="color:#0891b2">blendstudio.it</a></p>';

/* ─────────────────────────── Stat card ─────────────────────────── */
function StatCard({ label, value, sub, accent }) {
  return (
    <div className={`flex flex-col gap-1 rounded-2xl border px-5 py-4 ${accent ?? 'border-slate-200 bg-white'}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="text-2xl font-black leading-none text-slate-900">{value}</p>
      {sub && <p className="mt-1 text-[11px] text-slate-500">{sub}</p>}
    </div>
  );
}

/* ─────────────────────────── Copy button ─────────────────────────── */
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        });
      }}
      title="Copia negli appunti"
      className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
    >
      {copied ? <IcoCheck /> : <IcoCopy />}
    </button>
  );
}

/* ─────────────────────────── Email tag input ─────────────────────────── */
function isValidEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
}

function EmailTagInput({ label, emails, setEmails, input, setInput, placeholder }) {
  const addEmail = (raw) => {
    const val = raw.trim().replace(/,+$/, '');
    if (val && isValidEmail(val) && !emails.includes(val)) {
      setEmails((prev) => [...prev, val]);
    }
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addEmail(input); }
    if (e.key === 'Backspace' && !input && emails.length) setEmails((prev) => prev.slice(0, -1));
  };

  return (
    <div className="flex items-start gap-2">
      <span className="w-8 shrink-0 pt-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <div className="flex flex-1 flex-wrap items-center gap-1.5 min-h-9 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-100 transition">
        {emails.map((e) => (
          <span key={e} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
            {e}
            <button type="button" onClick={() => setEmails((prev) => prev.filter((x) => x !== e))}
              className="ml-0.5 flex items-center text-slate-400 transition hover:text-red-500">
              <IcoClose />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (input) addEmail(input); }}
          placeholder={!emails.length ? placeholder : 'Aggiungi email…'}
          className="min-w-30 flex-1 bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}

/* ─────────────────────────── Toolbar button ─────────────────────────── */
function TBtn({ onClick, title, active, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
        active
          ? 'bg-cyan-100 text-cyan-700 ring-1 ring-cyan-300'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
      }`}
    >
      {children}
    </button>
  );
}

/* ─────────────────────────── Rich text editor ─────────────────────────── */
function RichEditor({ editorRef, onChange, placeholder }) {
  const [activeFormats, setActiveFormats] = useState({});

  const exec = (cmd, value = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    updateFormats();
    onChange();
  };

  const updateFormats = () => {
    setActiveFormats({
      bold:          document.queryCommandState('bold'),
      italic:        document.queryCommandState('italic'),
      underline:     document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList:   document.queryCommandState('insertOrderedList'),
      justifyLeft:   document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
    });
  };

  const insertLink = () => {
    const url = window.prompt('URL del link:');
    if (url) exec('createLink', url.startsWith('http') ? url : 'https://' + url);
  };

  const TOOLBAR_GROUPS = [
    [
      { cmd: 'bold',          icon: <IcoBold />,       title: 'Grassetto (Ctrl+B)' },
      { cmd: 'italic',        icon: <IcoItalic />,     title: 'Corsivo (Ctrl+I)' },
      { cmd: 'underline',     icon: <IcoUnderline />,  title: 'Sottolineato (Ctrl+U)' },
      { cmd: 'strikeThrough', icon: <IcoStrike />,     title: 'Barrato' },
    ],
    [
      { cmd: 'formatBlock',   value: 'h3', icon: <IcoH1 />,         title: 'Titolo' },
      { cmd: 'formatBlock',   value: 'blockquote', icon: <IcoBlockquote />, title: 'Citazione' },
    ],
    [
      { cmd: 'insertUnorderedList', icon: <IcoUL />, title: 'Lista puntata' },
      { cmd: 'insertOrderedList',   icon: <IcoOL />, title: 'Lista numerata' },
    ],
    [
      { cmd: 'justifyLeft',   icon: <IcoAlignL />, title: 'Allinea sinistra' },
      { cmd: 'justifyCenter', icon: <IcoAlignC />, title: 'Allinea centro' },
    ],
    [
      { special: 'link',        icon: <IcoLink />,     title: 'Inserisci link' },
      { cmd: 'removeFormat',    icon: <IcoClearFmt />, title: 'Rimuovi formattazione' },
    ],
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-100 transition">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 bg-slate-50 px-2 py-1.5">
        {TOOLBAR_GROUPS.map((group, gi) => (
          <React.Fragment key={gi}>
            {gi > 0 && <span className="mx-0.5 h-5 w-px bg-slate-200" />}
            {group.map((btn) => {
              if (btn.special === 'link') {
                return (
                  <TBtn key="link" onClick={insertLink} title={btn.title}>
                    {btn.icon}
                  </TBtn>
                );
              }
              const isActive = btn.value
                ? false
                : activeFormats[btn.cmd];
              return (
                <TBtn
                  key={btn.cmd + (btn.value ?? '')}
                  onClick={() => exec(btn.cmd, btn.value ?? null)}
                  title={btn.title}
                  active={isActive}
                >
                  {btn.icon}
                </TBtn>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={onChange}
        onKeyUp={updateFormats}
        onMouseUp={updateFormats}
        data-placeholder={placeholder}
        className="prose prose-sm max-w-none min-h-45 px-4 py-3 text-sm leading-7 text-slate-800 outline-none [&>h3]:text-base [&>h3]:font-black [&>h3]:text-slate-900 [&>blockquote]:border-l-4 [&>blockquote]:border-cyan-300 [&>blockquote]:pl-3 [&>blockquote]:text-slate-500 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none"
        style={{ minHeight: '180px' }}
      />
    </div>
  );
}

/* ════════════════════════════════════ Main component ════════════════════════════════════ */
export default function AdminMessages() {
  const [messages, setMessages]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [selected, setSelected]         = useState(null);
  const [folder, setFolder]             = useState('all');
  const [search, setSearch]             = useState('');
  const [editorEmpty, setEditorEmpty]   = useState(true);
  const [sending, setSending]           = useState(false);
  const [replyError, setReplyError]     = useState(null);
  const [replySuccess, setReplySuccess] = useState(false);
  const [showReply, setShowReply]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting]         = useState(false);
  const [refreshing, setRefreshing]     = useState(false);
  /* ── Recipient fields ── */
  const [toEmails,     setToEmails]     = useState([]);
  const [ccEmails,     setCcEmails]     = useState([]);
  const [bccEmails,    setBccEmails]    = useState([]);
  const [toInput,      setToInput]      = useState('');
  const [ccInput,      setCcInput]      = useState('');
  const [bccInput,     setBccInput]     = useState('');
  const [showCc,       setShowCc]       = useState(false);
  const [showBcc,      setShowBcc]      = useState(false);
  const [useSignature, setUseSignature] = useState(true);
  const [signatureHtml, setSignatureHtml] = useState(DEFAULT_SIGNATURE_HTML);
  const [sigUploading, setSigUploading]   = useState(false);
  const editorRef  = useRef(null);
  const sigFileRef = useRef(null);

  /* ── Load ── */
  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const res = await getMessages();
      setMessages(res.data ?? []);
    } catch {
      setError('Impossibile caricare i messaggi. Verifica la connessione al backend.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    getSignature().then((res) => {
      if (res?.content) setSignatureHtml(res.content);
    }).catch(() => {});
  }, [load]);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const handler = (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || e.target.isContentEditable) return;
      if (e.key === 'Escape') setSelected(null);
      if (e.key === 'r' && selected) openReply();
      if (e.key === 'd' && selected) setConfirmDelete(selected);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selected]); // eslint-disable-line

  /* ── Derived stats ── */
  const unread     = useMemo(() => messages.filter((m) => !m.is_read).length, [messages]);
  const todayCount = useMemo(() => messages.filter((m) => isToday(m.created_at)).length, [messages]);
  const readRate   = messages.length > 0
    ? Math.round(((messages.length - unread) / messages.length) * 100)
    : 0;

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    let list = [...messages].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (folder === 'unread') list = list.filter((m) => !m.is_read);
    if (folder === 'read')   list = list.filter((m) => m.is_read);
    if (folder === 'today')  list = list.filter((m) => isToday(m.created_at));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.name?.toLowerCase().includes(q)    ||
          m.email?.toLowerCase().includes(q)   ||
          m.message?.toLowerCase().includes(q) ||
          m.phone?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [messages, folder, search]);

  const selectedMsg = useMemo(
    () => messages.find((m) => m.id === selected?.id) ?? selected,
    [messages, selected],
  );

  /* ── Open message ── */
  const openMessage = async (msg) => {
    setSelected(msg);
    setReplyError(null);
    setReplySuccess(false);
    setShowReply(false);
    if (editorRef.current) editorRef.current.innerHTML = '';
    setEditorEmpty(true);
    setToEmails([]);
    setCcEmails([]);
    setBccEmails([]);
    setToInput('');
    setCcInput('');
    setBccInput('');
    setShowCc(false);
    setShowBcc(false);
    if (!msg.is_read) {
      try {
        await markMessageRead(msg.id);
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m)),
        );
      } catch { /* silently ignore */ }
    }
  };

  /* ── Open reply (with focus) ── */
  const openReply = () => {
    setShowReply(true);
    setTimeout(() => {
      const el = editorRef.current;
      if (!el) return;
      if (!el.innerHTML.trim() && useSignature) {
        el.innerHTML = signatureHtml;
        /* Sposta cursore all'inizio */
        try {
          const range = document.createRange();
          range.setStart(el, 0);
          range.collapse(true);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
        } catch { /* ignore */ }
        setEditorEmpty(false);
      }
      el.focus();
    }, 60);
    setToEmails((prev) => (prev.length === 0 && selectedMsg ? [selectedMsg.email] : prev));
  };

  /* ── Mark as unread (local only) ── */
  const markUnread = () => {
    if (!selectedMsg) return;
    setMessages((prev) =>
      prev.map((m) => (m.id === selectedMsg.id ? { ...m, is_read: false } : m)),
    );
    setSelected((prev) => prev ? { ...prev, is_read: false } : prev);
  };

  /* ── Apply template ── */
  const applyTemplate = (tpl) => {
    const html = tpl.html.replace(/\{name\}/g, selectedMsg?.name ?? '');
    if (editorRef.current) {
      editorRef.current.innerHTML = html + (useSignature ? signatureHtml : '');
      setEditorEmpty(false);
    }
    setToEmails((prev) => (prev.length === 0 && selectedMsg ? [selectedMsg.email] : prev));
    setShowReply(true);
    setTimeout(() => editorRef.current?.focus(), 60);
  };

  /* ── Editor change handler ── */
  const onEditorChange = () => {
    const content = editorRef.current?.innerHTML ?? '';
    const plain   = htmlToPlainText(content).trim();
    setEditorEmpty(!plain);
  };

  /* ── Reply ── */
  const handleReply = async (e) => {
    e.preventDefault();
    if (!selectedMsg || editorEmpty) return;
    setSending(true);
    setReplyError(null);
    setReplySuccess(false);
    const htmlContent = editorRef.current?.innerHTML ?? '';
    if (toEmails.length === 0) {
      setReplyError('Aggiungi almeno un destinatario nel campo A.');
      setSending(false);
      return;
    }
    try {
      await replyMessage(selectedMsg.id, {
        body: htmlContent,
        to:  toEmails,
        cc:  ccEmails,
        bcc: bccEmails,
      });
      setReplySuccess(true);
      if (editorRef.current) editorRef.current.innerHTML = '';
      setEditorEmpty(true);
      setShowReply(false);
      setMessages((prev) =>
        prev.map((m) => (m.id === selectedMsg.id ? { ...m, is_read: true } : m)),
      );
    } catch (err) {
      setReplyError(err?.response?.data?.message ?? "Errore durante l'invio della risposta.");
    } finally {
      setSending(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await deleteMessage(confirmDelete.id);
      setMessages((prev) => prev.filter((m) => m.id !== confirmDelete.id));
      if (selectedMsg?.id === confirmDelete.id) setSelected(null);
      setConfirmDelete(null);
    } catch {
      setConfirmDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  /* ── Folder tabs ── */
  const folderTabs = [
    { id: 'all',    label: 'Tutti',      icon: <IcoInbox />,  count: messages.length },
    { id: 'unread', label: 'Non letti',  icon: <IcoUnread />, count: unread },
    { id: 'today',  label: 'Oggi',       icon: <IcoToday />,  count: todayCount },
    { id: 'read',   label: 'Letti',      icon: <IcoRead />,   count: messages.length - unread },
  ];

  /* ════════════════ RENDER ════════════════ */
  return (
    <div className="flex h-full flex-col overflow-hidden p-4 md:p-5">

      {error && (
        <div className="shrink-0 mb-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* ── Mail client shell ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-0 flex-1 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
      >
        <div className="flex h-full">

          {/* ────── Sidebar ────── */}
          <aside className="flex w-47.5 shrink-0 flex-col border-r border-slate-800 bg-slate-950">
            <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-400">
                <IcoInbox />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white">Mail</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  BlendStudio
                </p>
              </div>
              <button
                type="button"
                onClick={() => load(true)}
                disabled={refreshing}
                title="Aggiorna"
                className="flex h-7 w-7 items-center justify-center rounded-xl text-slate-500 hover:bg-white/10 hover:text-slate-300 transition disabled:opacity-40"
              >
                <span className={refreshing ? 'animate-spin' : ''}><IcoRefresh /></span>
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
              <p className="px-2 pb-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-600">
                Cartelle
              </p>
              {folderTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFolder(tab.id)}
                  className={`flex items-center justify-between rounded-2xl px-3 py-2.5 text-xs font-semibold transition ${
                    folder === tab.id
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2">{tab.icon}{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                      tab.id === 'unread' && tab.count > 0
                        ? 'bg-amber-500 text-white'
                        : 'bg-white/10 text-slate-500'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <div className="border-t border-slate-800 px-4 py-4 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-600">Riepilogo</p>
              <p className="text-[11px] text-slate-500">{messages.length} messaggi totali</p>
              <p className="text-[11px] text-slate-500">{unread} non letti</p>
              <p className="text-[11px] text-slate-500">{todayCount} oggi</p>
            </div>
          </aside>

          {/* ────── Message list ────── */}
          <div className="flex w-72.5 shrink-0 flex-col border-r border-slate-200">
            <div className="border-b border-slate-200 px-4 py-3">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-100 transition">
                <span className="text-slate-400"><IcoSearch /></span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cerca per nome, email…"
                  className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
                {search && (
                  <button type="button" onClick={() => setSearch('')} className="text-slate-400 transition hover:text-slate-600">
                    <IcoClose />
                  </button>
                )}
              </div>
              <p className="mt-1.5 pl-1 text-[10px] text-slate-400">
                {filtered.length} {filtered.length === 1 ? 'messaggio' : 'messaggi'}
                {search ? ' trovati' : ' in questa vista'}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto" data-lenis-prevent>
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                    <IcoInbox />
                  </div>
                  <p className="text-sm font-black text-slate-600">Nessun messaggio</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {search ? 'Nessun risultato per questa ricerca.' : 'La cartella è vuota.'}
                  </p>
                </div>
              ) : (
                filtered.map((msg) => {
                  const active = selectedMsg?.id === msg.id;
                  return (
                    <button
                      key={msg.id}
                      type="button"
                      onClick={() => openMessage(msg)}
                      className={`group w-full border-b border-slate-100 px-4 py-3.5 text-left transition-colors ${
                        active ? 'border-l-2 border-l-cyan-400 bg-cyan-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-2 w-2 shrink-0">
                          {!msg.is_read
                            ? <span className="block h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
                            : <span className="block h-2 w-2 rounded-full" />}
                        </div>
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black text-white ${avatarColor(msg.name)}`}>
                          {getInitials(msg.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-1">
                            <p className={`truncate text-sm ${!msg.is_read ? 'font-black text-slate-900' : 'font-semibold text-slate-600'}`}>
                              {msg.name}
                            </p>
                            <span className="shrink-0 text-[10px] text-slate-400">
                              {fmtShort(msg.created_at)}
                            </span>
                          </div>
                          <p className="truncate text-xs text-slate-400">{msg.email}</p>
                          <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-500">
                            {previewText(msg.message)}
                          </p>
                          {msg.phone && (
                            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                              <IcoPhone />{msg.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ────── Reading pane ────── */}
          <div className="flex flex-1 min-w-0 flex-col overflow-hidden">
            {!selectedMsg ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-slate-300">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div>
                  <p className="text-base font-black text-slate-600">Nessun messaggio selezionato</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Seleziona un contatto dalla lista per leggere e rispondere.
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap justify-center gap-4 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <kbd className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-slate-600">R</kbd> Rispondi
                  </span>
                  <span className="flex items-center gap-1.5">
                    <kbd className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-slate-600">D</kbd> Elimina
                  </span>
                  <span className="flex items-center gap-1.5">
                    <kbd className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-slate-600">Esc</kbd> Chiudi
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col overflow-hidden">

                {/* ── Header bar ── */}
                <div className="shrink-0 border-b border-slate-200 bg-white px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-black text-white shadow-md ${avatarColor(selectedMsg.name)}`}>
                        {getInitials(selectedMsg.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-lg font-black leading-tight text-slate-900">
                          {selectedMsg.name}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <a href={`mailto:${selectedMsg.email}`}
                            className="flex items-center gap-1 text-sm font-semibold text-cyan-700 underline-offset-2 hover:underline">
                            {selectedMsg.email}
                          </a>
                          <CopyBtn text={selectedMsg.email} />
                          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-black ${
                            selectedMsg.is_read
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                          }`}>
                            {selectedMsg.is_read ? 'Letto' : '● Nuovo'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      {selectedMsg.is_read && (
                        <button type="button" onClick={markUnread} title="Segna come non letto"
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-amber-50 hover:text-amber-600">
                          <IcoMarkUnread />
                        </button>
                      )}
                      <button type="button" onClick={openReply} title="Rispondi (R)"
                        className={`flex h-8 w-8 items-center justify-center rounded-xl border transition ${
                          showReply
                            ? 'border-cyan-300 bg-cyan-100 text-cyan-700'
                            : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                        }`}>
                        <IcoReply />
                      </button>
                      <button type="button" onClick={() => setConfirmDelete(selectedMsg)} title="Elimina (D)"
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500">
                        <IcoTrash />
                      </button>
                      <button type="button" onClick={() => setSelected(null)} title="Chiudi (Esc)"
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100">
                        <IcoClose />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Scrollable body ── */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5" data-lenis-prevent>

                  {/* Metadata grid */}
                  <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Data</p>
                      <p className="mt-1 text-xs font-semibold text-slate-700">{fmtDate(selectedMsg.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Ora</p>
                      <p className="mt-1 text-xs font-semibold text-slate-700">{fmtTime(selectedMsg.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Telefono</p>
                      {selectedMsg.phone ? (
                        <a href={`tel:${selectedMsg.phone}`}
                          className="mt-1 flex items-center gap-1 text-xs font-semibold text-cyan-700 hover:underline">
                          <IcoPhone />{selectedMsg.phone}
                        </a>
                      ) : (
                        <p className="mt-1 text-xs text-slate-400">Non fornito</p>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Lettura stimata</p>
                      <p className="mt-1 text-xs font-semibold text-slate-700">~{readingTime(selectedMsg.message)}s</p>
                    </div>
                  </div>

                  {/* Message body */}
                  <div className="rounded-[22px] border border-slate-200 bg-white px-6 py-5 shadow-sm">
                    <p className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Messaggio</p>
                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                      {selectedMsg.message}
                    </p>
                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <p className="text-[11px] text-slate-400">
                        {selectedMsg.message?.length ?? 0} caratteri ·{' '}
                        {(selectedMsg.message ?? '').split(/\s+/).filter(Boolean).length} parole
                      </p>
                      <p className="text-[11px] text-slate-400">{fmtFull(selectedMsg.created_at)}</p>
                    </div>
                  </div>

                  {/* Reply success */}
                  <AnimatePresence>
                    {replySuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3"
                      >
                        <span className="text-emerald-600"><IcoCheck /></span>
                        <p className="text-sm font-semibold text-emerald-700">
                          Risposta inviata a <strong>{selectedMsg.email}</strong>
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── Reply composer ── */}
                  <AnimatePresence>
                    {showReply && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden rounded-[22px] border border-cyan-200 bg-cyan-50/40 shadow-sm"
                      >
                        {/* Composer header */}
                        <div className="flex items-center justify-between border-b border-cyan-200/70 bg-cyan-50 px-5 py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-cyan-600"><IcoReply /></span>
                            <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-600">Nuova risposta</span>
                          </div>
                          <button type="button" onClick={() => setShowReply(false)}
                            className="text-slate-400 transition hover:text-slate-600">
                            <IcoClose />
                          </button>
                        </div>

                        {/* Recipient fields grid */}
                        <div className="space-y-2 border-b border-cyan-100 bg-white/70 px-5 py-3">
                          <EmailTagInput
                            label="A"
                            emails={toEmails}
                            setEmails={setToEmails}
                            input={toInput}
                            setInput={setToInput}
                            placeholder="Destinatari (Invio o virgola per aggiungere)…"
                          />
                          <AnimatePresence>
                            {showCc && (
                              <motion.div
                                key="cc"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.15 }}
                                className="overflow-hidden"
                              >
                                <EmailTagInput
                                  label="CC"
                                  emails={ccEmails}
                                  setEmails={setCcEmails}
                                  input={ccInput}
                                  setInput={setCcInput}
                                  placeholder="In copia…"
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <AnimatePresence>
                            {showBcc && (
                              <motion.div
                                key="bcc"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.15 }}
                                className="overflow-hidden"
                              >
                                <EmailTagInput
                                  label="CCN"
                                  emails={bccEmails}
                                  setEmails={setBccEmails}
                                  input={bccInput}
                                  setInput={setBccInput}
                                  placeholder="In copia nascosta…"
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <div className="flex items-center gap-2 pl-10">
                            {!showCc && (
                              <button type="button" onClick={() => setShowCc(true)}
                                className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700">
                                + CC
                              </button>
                            )}
                            {!showBcc && (
                              <button type="button" onClick={() => setShowBcc(true)}
                                className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700">
                                + CCN
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Template quick picks */}
                        <div className="flex flex-wrap items-center gap-2 border-b border-cyan-100 bg-white/60 px-5 py-2.5">
                          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                            Template:
                          </span>
                          {REPLY_TEMPLATES.map((tpl) => (
                            <button key={tpl.label} type="button" onClick={() => applyTemplate(tpl)}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700">
                              {tpl.label}
                            </button>
                          ))}
                        </div>

                        {replyError && (
                          <div className="mx-5 mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                            {replyError}
                          </div>
                        )}

                        <form onSubmit={handleReply} className="space-y-4 p-5">
                          {/* Rich text editor */}
                          <RichEditor
                            editorRef={editorRef}
                            onChange={onEditorChange}
                            placeholder={`Scrivi la risposta per ${selectedMsg.name}…`}
                          />

                          {/* Signature toggle */}
                          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <div className="flex min-w-0 items-center gap-2 text-slate-500">
                              <IcoSignature />
                              <span className="text-[11px] font-semibold text-slate-600">Firma</span>
                              <span className="truncate text-[11px] text-slate-400">
                                {signatureHtml === DEFAULT_SIGNATURE_HTML ? '— predefinita' : '— personalizzata'}
                              </span>
                              {/* Hidden file input */}
                              <input
                                ref={sigFileRef}
                                type="file"
                                accept=".html,.htm"
                                className="hidden"
                                onChange={async (ev) => {
                                  const f = ev.target.files?.[0];
                                  if (!f) return;
                                  setSigUploading(true);
                                  try {
                                    const res = await uploadSignature(f);
                                    if (res?.content) setSignatureHtml(res.content);
                                  } catch { /* ignore */ } finally {
                                    setSigUploading(false);
                                    ev.target.value = '';
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => sigFileRef.current?.click()}
                                disabled={sigUploading}
                                title="Carica file firma HTML"
                                className="ml-1 flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 disabled:opacity-50"
                              >
                                {sigUploading ? '…' : <><IcoUpload />&nbsp;Carica</>}
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setUseSignature((v) => {
                                  const next = !v;
                                  const el = editorRef.current;
                                  if (!el) return next;
                                  if (next) {
                                    el.innerHTML = el.innerHTML + signatureHtml;
                                  } else {
                                    const tmp = document.createElement('div');
                                    tmp.innerHTML = el.innerHTML;
                                    tmp.querySelectorAll('hr + p, hr').forEach((n) => n.remove());
                                    el.innerHTML = tmp.innerHTML;
                                  }
                                  return next;
                                });
                              }}
                              className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
                                useSignature ? 'bg-cyan-500' : 'bg-slate-300'
                              }`}
                            >
                              <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                                useSignature ? 'translate-x-4' : 'translate-x-0'
                              }`} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                              <span>A:</span>
                              {toEmails.map((e) => (
                                <span key={e} className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">{e}</span>
                              ))}
                              {ccEmails.length > 0 && (
                                <><span className="text-slate-300">·</span><span>CC: {ccEmails.join(', ')}</span></>
                              )}
                              {bccEmails.length > 0 && (
                                <><span className="text-slate-300">·</span><span>CCN: {bccEmails.length} dest.</span></>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => setShowReply(false)}
                                className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-black text-slate-600 transition hover:bg-slate-100">
                                Annulla
              </button>
                              <button type="submit" disabled={sending || editorEmpty || toEmails.length === 0}
                                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-2.5 text-xs font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45">
                                <IcoSend />
                                {sending ? 'Invio in corso…' : 'Invia risposta'}
                              </button>
                            </div>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ── Bottom action bar ── */}
                {!showReply && (
                  <div className="shrink-0 flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/80 px-6 py-3">
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setConfirmDelete(selectedMsg)}
                        className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-red-500 transition hover:border-red-200 hover:bg-red-50">
                        <IcoTrash /> Elimina
                      </button>
                      {selectedMsg.is_read && (
                        <button type="button" onClick={markUnread}
                          className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100">
                          <IcoMarkUnread /> Segna non letto
                        </button>
                      )}
                    </div>
                    <button type="button" onClick={openReply}
                      className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-2.5 text-xs font-black text-white transition hover:bg-slate-800">
                      <IcoReply /> Rispondi
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Delete confirm dialog ── */}
      {confirmDelete && (
        <AdminDialog onClose={() => setConfirmDelete(null)} maxWidth="max-w-md">
          <AdminDialogHeader
            title="Elimina messaggio"
            description="L'operazione non può essere annullata."
            onClose={() => setConfirmDelete(null)}
          />
          <div className="space-y-5 px-6 py-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-black text-white ${avatarColor(confirmDelete.name)}`}>
                  {getInitials(confirmDelete.name)}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{confirmDelete.name}</p>
                  <p className="text-xs text-slate-500">{confirmDelete.email}</p>
                </div>
              </div>
              <p className="line-clamp-3 text-sm leading-6 text-slate-600">{confirmDelete.message}</p>
            </div>
            <p className="text-sm text-slate-600">
              Stai per eliminare definitivamente questo messaggio. Non sarà più possibile recuperarlo.
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmDelete(null)}
                className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-200">
                Annulla
              </button>
              <button type="button" onClick={handleDelete} disabled={deleting}
                className="rounded-2xl bg-red-500 px-4 py-2.5 text-sm font-black text-white transition hover:bg-red-600 disabled:opacity-45">
                {deleting ? 'Eliminazione…' : 'Sì, elimina'}
              </button>
            </div>
          </div>
        </AdminDialog>
      )}
    </div>
  );
}
