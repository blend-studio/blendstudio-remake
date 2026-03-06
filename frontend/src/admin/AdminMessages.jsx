import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { deleteMessage, getMessages, markMessageRead, replyMessage } from '../services/api';
import { AdminDialog, AdminDialogHeader } from './AdminUI';

/* --------------------------- Icons --------------------------- */
function IcoInbox() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 4H9l-3-4H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
    </svg>
  );
}
function IcoTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
function IcoReply() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 17 4 12 9 7" />
      <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
    </svg>
  );
}
function IcoSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function IcoRefresh() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}
function IcoSend() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
function IcoClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/* --------------------------- Helpers --------------------------- */
function formatDateShort(d) {
  const date = new Date(d);
  const now = new Date();
  const diffDays = Math.floor((now - date) / 86400000);
  if (diffDays === 0) return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Ieri';
  if (diffDays < 7) return date.toLocaleDateString('it-IT', { weekday: 'short' });
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
}

function formatDateFull(d) {
  return new Date(d).toLocaleString('it-IT', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function getInitials(name) {
  return (name ?? '?').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

const AVATAR_COLORS = ['bg-violet-500', 'bg-amber-500', 'bg-sky-500', 'bg-rose-500', 'bg-emerald-500', 'bg-indigo-500'];
function avatarColor(name) {
  return AVATAR_COLORS[(name ?? '').charCodeAt(0) % AVATAR_COLORS.length];
}

/* --------------------------- Component --------------------------- */
export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [folder, setFolder] = useState('all');
  const [search, setSearch] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState(null);
  const [replySuccess, setReplySuccess] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMessages();
      setMessages(res.data ?? []);
    } catch {
      setError('Impossibile caricare i messaggi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const unread = useMemo(() => messages.filter((m) => !m.is_read).length, [messages]);

  const filtered = useMemo(() => {
    let list = messages;
    if (folder === 'unread') list = list.filter((m) => !m.is_read);
    if (folder === 'read') list = list.filter((m) => m.is_read);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) => m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q) || m.message?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [messages, folder, search]);

  const selectedMessage = useMemo(
    () => messages.find((m) => m.id === selected?.id) ?? selected,
    [messages, selected],
  );

  const openMessage = async (msg) => {
    setSelected(msg);
    setReplyBody('');
    setReplyError(null);
    setReplySuccess(false);
    setShowReply(false);
    if (!msg.is_read) {
      try {
        await markMessageRead(msg.id);
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m)));
      } catch { /* ignore */ }
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!selectedMessage || !replyBody.trim()) return;
    setSending(true);
    setReplyError(null);
    setReplySuccess(false);
    try {
      await replyMessage(selectedMessage.id, replyBody.trim());
      setReplySuccess(true);
      setReplyBody('');
      setShowReply(false);
    } catch (err) {
      setReplyError(err?.response?.data?.message ?? "Errore durante l'invio.");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await deleteMessage(confirmDelete.id);
      setMessages((prev) => prev.filter((m) => m.id !== confirmDelete.id));
      if (selectedMessage?.id === confirmDelete.id) setSelected(null);
      setConfirmDelete(null);
    } catch {
      setConfirmDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const folderTabs = [
    { id: 'all', label: 'Tutte le mail', count: messages.length },
    { id: 'unread', label: 'Non lette', count: unread },
    { id: 'read', label: 'Già lette', count: messages.length - unread },
  ];

  return (
    <div className="h-full flex flex-col">
      {error && (
        <div className="mb-3 shrink-0 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>
      )}

      {/* Mail client shell */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="flex-1 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.10)]"
      >
        <div className="flex h-full">

          {/* -- Left sidebar -- */}
          <aside className="flex w-[210px] shrink-0 flex-col border-r border-slate-800 bg-slate-950">
            <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400">
                <IcoInbox />
              </div>
              <div>
                <p className="text-sm font-black text-white">Mail</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">BlendStudio</p>
              </div>
            </div>

            <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
              <p className="px-2 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-slate-600">Cartelle</p>
              {folderTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFolder(tab.id)}
                  className={`flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                    folder === tab.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <IcoInbox />{tab.label}
                  </span>
                  {tab.count > 0 && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${tab.id === 'unread' && tab.count > 0 ? 'bg-amber-500 text-white' : 'bg-white/10 text-slate-400'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <div className="border-t border-slate-800 px-4 py-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">{messages.length} messaggi totali</p>
              <p className="mt-1 text-[10px] text-slate-700">{unread} non letti · {messages.length - unread} letti</p>
            </div>
          </aside>

          {/* -- Message list -- */}
          <div className="flex w-[300px] shrink-0 flex-col border-r border-slate-200 bg-slate-50/60">
            {/* Search */}
            <div className="border-b border-slate-200 px-4 py-3">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-100">
                <span className="text-slate-400"><IcoSearch /></span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cerca messaggi…"
                  className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
                {search && (
                  <button type="button" onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                    <IcoClose />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                  <div className="mb-4 text-4xl">??</div>
                  <p className="text-sm font-black text-slate-600">Nessun messaggio</p>
                  <p className="mt-1 text-xs text-slate-400">{search ? 'Nessun risultato.' : 'La cartella è vuota.'}</p>
                </div>
              ) : (
                <div>
                  {filtered.map((msg) => {
                    const active = selectedMessage?.id === msg.id;
                    return (
                      <button
                        key={msg.id}
                        type="button"
                        onClick={() => openMessage(msg)}
                        className={`group w-full border-b border-slate-200/70 px-4 py-4 text-left transition-colors ${
                          active ? 'bg-cyan-50 border-l-2 border-l-cyan-400' : 'hover:bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1.5 shrink-0">
                            {!msg.is_read
                              ? <span className="block h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.7)]" />
                              : <span className="block h-2.5 w-2.5 rounded-full bg-transparent" />}
                          </div>
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black text-white ${avatarColor(msg.name)}`}>
                            {getInitials(msg.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-2">
                              <p className={`truncate text-sm ${!msg.is_read ? 'font-black text-slate-900' : 'font-semibold text-slate-700'}`}>{msg.name}</p>
                              <span className="shrink-0 text-[11px] text-slate-400">{formatDateShort(msg.created_at)}</span>
                            </div>
                            <p className="mt-0.5 truncate text-xs text-slate-500">{msg.email}</p>
                            <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500">{msg.message}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* -- Reading pane -- */}
          <div className="flex flex-1 flex-col min-w-0">
            {!selectedMessage ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-5xl">??</div>
                <div>
                  <p className="text-lg font-black text-slate-700">Nessun messaggio selezionato</p>
                  <p className="mt-1 text-sm text-slate-400">Seleziona un contatto dalla lista per leggere e rispondere.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col overflow-hidden">

                {/* Email header bar */}
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-black text-white ${avatarColor(selectedMessage.name)}`}>
                      {getInitials(selectedMessage.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-black tracking-tight text-slate-900">{selectedMessage.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-3">
                        <a href={`mailto:${selectedMessage.email}`} className="text-sm font-semibold text-cyan-700 underline-offset-2 hover:underline">
                          {selectedMessage.email}
                        </a>
                        {selectedMessage.phone && <span className="text-sm text-slate-500">{selectedMessage.phone}</span>}
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-black ${selectedMessage.is_read ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {selectedMessage.is_read ? '? Letto' : '? Nuovo'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="hidden text-xs text-slate-400 lg:block">{formatDateFull(selectedMessage.created_at)}</span>
                    <button
                      type="button"
                      title="Rispondi"
                      onClick={() => setShowReply((v) => !v)}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${showReply ? 'border-cyan-300 bg-cyan-100 text-cyan-700' : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      <IcoReply />
                    </button>
                    <button
                      type="button"
                      title="Elimina"
                      onClick={() => setConfirmDelete(selectedMessage)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                    >
                      <IcoTrash />
                    </button>
                    <button
                      type="button"
                      title="Chiudi"
                      onClick={() => setSelected(null)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                    >
                      <IcoClose />
                    </button>
                  </div>
                </div>

                {/* Email body */}
                <div className="flex-1 overflow-y-auto px-6 py-6" data-lenis-prevent>
                  <div className="max-w-2xl space-y-6">
                    <div className="rounded-[22px] border border-slate-200 bg-white px-6 py-6 shadow-sm">
                      <p className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Messaggio ricevuto</p>
                      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{selectedMessage.message}</p>
                    </div>

                    {/* Reply composer */}
                    <AnimatePresence>
                      {showReply && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden rounded-[22px] border border-cyan-200 bg-cyan-50/60 shadow-sm"
                        >
                          <div className="flex items-center gap-3 border-b border-cyan-200/70 bg-cyan-50 px-5 py-3">
                            <span className="text-cyan-600"><IcoReply /></span>
                            <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-600">Risposta a</span>
                            <span className="rounded-full border border-slate-300 bg-white px-3 py-0.5 text-xs font-semibold text-slate-700">
                              {selectedMessage.name} &lt;{selectedMessage.email}&gt;
                            </span>
                          </div>

                          {replySuccess && (
                            <div className="mx-5 mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                              ? Risposta inviata a {selectedMessage.email}
                            </div>
                          )}
                          {replyError && (
                            <div className="mx-5 mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{replyError}</div>
                          )}

                          <form onSubmit={handleReply} className="space-y-4 p-5">
                            <textarea
                              value={replyBody}
                              onChange={(e) => setReplyBody(e.target.value)}
                              rows={7}
                              placeholder={`Scrivi la risposta per ${selectedMessage.name}…`}
                              className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                            />
                            <div className="flex items-center justify-between gap-3">
                              <button
                                type="button"
                                onClick={() => setShowReply(false)}
                                className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-200"
                              >
                                Annulla
                              </button>
                              <button
                                type="submit"
                                disabled={sending || !replyBody.trim()}
                                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45"
                              >
                                <IcoSend />{sending ? 'Invio…' : 'Invia risposta'}
                              </button>
                            </div>
                          </form>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Bottom action bar */}
                {!showReply && (
                  <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/80 px-6 py-3">
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(selectedMessage)}
                      className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-red-500 transition hover:border-red-200 hover:bg-red-50"
                    >
                      <IcoTrash /> Elimina
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReply(true)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-black text-white transition hover:bg-slate-800"
                    >
                      <IcoReply /> Rispondi
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </motion.div>

      {/* Delete confirm dialog */}
      {confirmDelete && (
        <AdminDialog onClose={() => setConfirmDelete(null)} maxWidth="max-w-md">
          <AdminDialogHeader
            title="Elimina messaggio"
            description="Conferma la rimozione definitiva del messaggio."
            onClose={() => setConfirmDelete(null)}
          />
          <div className="space-y-6 px-6 py-6">
            <p className="text-sm leading-6 text-slate-600">
              Stai per eliminare il messaggio di{' '}
              <span className="font-black text-slate-900">{confirmDelete.name}</span>. Questa azione non può essere annullata.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-200"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-2xl bg-red-500 px-4 py-2.5 text-sm font-black text-white transition hover:bg-red-600 disabled:opacity-45"
              >
                {deleting ? 'Eliminazione…' : 'Elimina'}
              </button>
            </div>
          </div>
        </AdminDialog>
      )}
    </div>
  );
}
