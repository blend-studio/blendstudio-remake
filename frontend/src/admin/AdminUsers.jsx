import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUsers, createUser, changeUserPassword, deleteUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingPwd, setEditingPwd] = useState(null); // user id
  const [newEmail, setNewEmail]     = useState('');
  const [newPwd, setNewPwd]         = useState('');
  const [pwdValue, setPwdValue]     = useState('');
  const [error, setError]           = useState(null);
  const [success, setSuccess]       = useState(null);
  const [saving, setSaving]         = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // user id

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      setUsers(res.data ?? []);
    } catch {
      setError('Impossibile caricare gli utenti.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const flash = (msg, isError = false) => {
    if (isError) { setError(msg); setTimeout(() => setError(null), 4000); }
    else { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newEmail || !newPwd) { flash('Email e password obbligatorie', true); return; }
    setSaving(true);
    try {
      const res = await createUser(newEmail, newPwd);
      setUsers(prev => [...prev, res.data]);
      setShowCreate(false);
      setNewEmail(''); setNewPwd('');
      flash('Utente creato con successo');
    } catch (err) {
      flash(err?.response?.data?.message ?? 'Errore nella creazione', true);
    } finally { setSaving(false); }
  };

  const handleChangePassword = async (id) => {
    if (!pwdValue) { flash('Inserisci la nuova password', true); return; }
    setSaving(true);
    try {
      await changeUserPassword(id, pwdValue);
      setEditingPwd(null); setPwdValue('');
      flash('Password aggiornata');
    } catch (err) {
      flash(err?.response?.data?.message ?? 'Errore aggiornamento password', true);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    setSaving(true);
    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      setDeleteConfirm(null);
      flash('Utente eliminato');
    } catch (err) {
      flash(err?.response?.data?.message ?? 'Errore eliminazione', true);
    } finally { setSaving(false); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Utenti</h1>
          <p className="text-gray-400 mt-1 text-sm">Gestisci gli account amministratori.</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setError(null); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#1e4659' }}
        >
          + Nuovo utente
        </button>
      </div>

      {/* Notifiche */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
            &#x26A0;&#xFE0F; {error}
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-bold">
            &#x2713; {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modale crea utente */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowCreate(false)}
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm mx-4"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-black tracking-tighter mb-6">Crea nuovo utente</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Email</label>
                  <input
                    type="email" required autoFocus
                    value={newEmail} onChange={e => setNewEmail(e.target.value)}
                    placeholder="nome@blendstudio.it"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Password</label>
                  <input
                    type="password" required
                    value={newPwd} onChange={e => setNewPwd(e.target.value)}
                    placeholder="min. 8 caratteri"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreate(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors">
                    Annulla
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-2.5 rounded-xl text-sm font-black text-white disabled:opacity-40 transition-opacity"
                    style={{ backgroundColor: '#1e4659' }}>
                    {saving ? 'Creazione...' : 'Crea utente'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modale conferma elimina */}
      <AnimatePresence>
        {deleteConfirm !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm mx-4 text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-5xl mb-4">&#x1F6AB;</div>
              <h2 className="text-xl font-black tracking-tighter mb-2">Elimina utente?</h2>
              <p className="text-gray-400 text-sm mb-6">
                Stai per eliminare <strong>{users.find(u => u.id === deleteConfirm)?.email}</strong>. L&apos;operazione &egrave; irreversibile.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors">
                  Annulla
                </button>
                <button onClick={() => handleDelete(deleteConfirm)} disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-black text-white bg-red-500 hover:bg-red-600 disabled:opacity-40 transition-colors">
                  {saving ? 'Eliminazione...' : 'Elimina'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabella utenti */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: '#1e4659', borderTopColor: 'transparent' }} />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">&#x1F465;</div>
          <p className="font-medium">Nessun utente trovato</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Utente</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Creato il</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Password</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => {
                const isSelf = u.email === currentUser?.email;
                return (
                  <tr key={u.id} className={`border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50/50 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-black text-white"
                          style={{ backgroundColor: '#1e4659' }}>
                          {u.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{u.email}</p>
                          {isSelf && <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Tu</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{formatDate(u.createdAt)}</td>
                    <td className="px-6 py-4">
                      {editingPwd === u.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="password" autoFocus
                            value={pwdValue} onChange={e => setPwdValue(e.target.value)}
                            placeholder="Nuova password"
                            className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 w-40"
                          />
                          <button onClick={() => handleChangePassword(u.id)} disabled={saving}
                            className="px-3 py-1.5 rounded-xl text-xs font-black text-white disabled:opacity-40"
                            style={{ backgroundColor: '#1e4659' }}>
                            Salva
                          </button>
                          <button onClick={() => { setEditingPwd(null); setPwdValue(''); }}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors">
                            &#x2715;
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingPwd(u.id); setPwdValue(''); }}
                          className="text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors">
                          Cambia password
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => !isSelf && setDeleteConfirm(u.id)}
                        disabled={isSelf}
                        title={isSelf ? 'Non puoi eliminare il tuo account' : 'Elimina utente'}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ml-auto flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{ borderColor: '#fca5a5', color: '#ef4444' }}
                        onMouseEnter={e => { if (!isSelf) e.currentTarget.style.backgroundColor = '#fef2f2'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        Elimina
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
