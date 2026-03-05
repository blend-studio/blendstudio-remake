import React, { useEffect, useState } from 'react';
import { getMessages, markMessageRead, deleteMessage, replyMessage } from '../services/api';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dettaglio / risposta
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState(null);
  const [replySuccess, setReplySuccess] = useState(false);

  // Elimina
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMessages();
      setMessages(res.data ?? []);
    } catch {
      setError('Errore nel caricamento dei messaggi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const unread = messages.filter(m => !m.is_read).length;

  const openMessage = async (msg) => {
    setSelected(msg);
    setReplyText('');
    setReplyError(null);
    setReplySuccess(false);
    if (!msg.is_read) {
      try {
        await markMessageRead(msg.id);
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
      } catch { /* ignora */ }
    }
  };

  const closeDetail = () => {
    setSelected(null);
    setReplyText('');
    setReplyError(null);
    setReplySuccess(false);
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSending(true);
    setReplyError(null);
    setReplySuccess(false);
    try {
      await replyMessage(selected.id, replyText.trim());
      setReplySuccess(true);
      setReplyText('');
    } catch (err) {
      setReplyError(err?.response?.data?.message ?? 'Errore durante l\'invio.');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await deleteMessage(confirmDelete.id);
      setConfirmDelete(null);
      if (selected?.id === confirmDelete.id) closeDetail();
      await load();
    } catch {
      setConfirmDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Messaggi</h1>
          <p className="text-gray-400 mt-1">
            {messages.length} totali
            {unread > 0 && <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#1e4659' }}>{unread} non letti</span>}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: '#1e4659', borderTopColor: 'transparent' }} />
        </div>
      ) : error ? (
        <p className="text-red-500 text-center py-20">{error}</p>
      ) : messages.length === 0 ? (
        <p className="text-center text-gray-400 py-20 italic">Nessun messaggio ricevuto.</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          {messages.map((msg, idx) => (
            <div
              key={msg.id}
              onClick={() => openMessage(msg)}
              className={`flex items-start gap-4 px-6 py-4 cursor-pointer transition-colors ${idx !== 0 ? 'border-t border-gray-50' : ''} ${selected?.id === msg.id ? 'bg-blue-50' : msg.is_read ? 'hover:bg-gray-50' : 'bg-slate-50 hover:bg-slate-100'}`}
            >
              {/* Pallino non letto */}
              <div className="mt-1.5 flex-shrink-0">
                {!msg.is_read
                  ? <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#1e4659' }} />
                  : <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />}
              </div>

              <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <p className={`truncate ${!msg.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                    {msg.name}
                    <span className="ml-2 text-sm font-normal text-gray-400">&lt;{msg.email}&gt;</span>
                    {msg.phone && <span className="ml-2 text-xs text-gray-400">{msg.phone}</span>}
                  </p>
                  <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(msg.created_at)}</span>
                </div>
                <p className="text-sm text-gray-500 truncate mt-0.5">{msg.message}</p>
              </div>

              {/* Elimina rapido */}
              <button
                onClick={e => { e.stopPropagation(); setConfirmDelete(msg); }}
                className="flex-shrink-0 mt-0.5 w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pannello dettaglio */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Mittente</p>
                <p className="font-black text-lg">{selected.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <a href={`mailto:${selected.email}`} className="text-sm font-medium" style={{ color: '#1e4659' }}>{selected.email}</a>
                  {selected.phone && <span className="text-sm text-gray-500">{selected.phone}</span>}
                </div>
                <p className="text-xs text-gray-400 mt-1">{formatDate(selected.created_at)}</p>
              </div>
              <button onClick={closeDetail} className="text-gray-400 hover:text-gray-700 text-2xl leading-none flex-shrink-0">&times;</button>
            </div>

            {/* Messaggio */}
            <div className="px-6 py-5 flex-grow overflow-y-auto" data-lenis-prevent>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-3">Messaggio</p>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
            </div>

            {/* Form risposta */}
            <div className="px-6 py-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-3">Rispondi via email</p>

              {replySuccess && (
                <div className="mb-3 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">
                  ✓ Risposta inviata a {selected.email}
                </div>
              )}
              {replyError && (
                <div className="mb-3 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                  {replyError}
                </div>
              )}

              <form onSubmit={handleReply} className="space-y-3">
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  rows={4}
                  placeholder={`Scrivi una risposta a ${selected.name}…`}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2"
                  style={{ focusRingColor: '#1e4659' }}
                />
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(selected)}
                    className="text-sm font-bold text-red-400 hover:text-red-600 transition-colors"
                  >
                    Elimina messaggio
                  </button>
                  <button
                    type="submit"
                    disabled={sending || !replyText.trim()}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: '#1e4659', color: '#ffffff' }}
                  >
                    {sending ? 'Invio…' : 'Invia risposta'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modale conferma eliminazione */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-xl font-black mb-2">Elimina messaggio</h2>
            <p className="text-gray-500 mb-6">
              Eliminare il messaggio di <span className="font-bold text-gray-800">"{confirmDelete.name}"</span>? L'operazione è irreversibile.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors">
                Annulla
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="px-5 py-2.5 rounded-xl font-bold transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#ef4444', color: '#ffffff' }}>
                {deleting ? 'Eliminazione…' : 'Elimina'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
