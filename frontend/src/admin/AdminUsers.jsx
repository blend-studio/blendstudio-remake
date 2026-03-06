import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getUsers, createUser, changeUserPassword, deleteUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  AdminBadge,
  AdminButton,
  AdminDialog,
  AdminDialogHeader,
  AdminEmptyState,
  AdminField,
  AdminInput,
  AdminKpiCard,
  AdminNotice,
  AdminPage,
  AdminPanel,
} from './AdminUI';

function IcoUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IcoShield() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  );
}

function IcoKey() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m21 2-9.6 9.6" />
      <path d="m15.5 7.5 3 3L22 7l-3-3" />
    </svg>
  );
}

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingPwd, setEditingPwd] = useState(null);
  const [newEmail, setNewEmail] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [pwdValue, setPwdValue] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

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

  useEffect(() => {
    load();
  }, [load]);

  const flash = (msg, isError = false) => {
    if (isError) {
      setError(msg);
      setTimeout(() => setError(null), 4000);
    } else {
      setSuccess(msg);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newEmail || !newPwd) {
      flash('Email e password obbligatorie', true);
      return;
    }

    setSaving(true);
    try {
      const res = await createUser(newEmail, newPwd);
      setUsers((prev) => [...prev, res.data]);
      setShowCreate(false);
      setNewEmail('');
      setNewPwd('');
      flash('Utente creato con successo');
    } catch (err) {
      flash(err?.response?.data?.message ?? 'Errore nella creazione', true);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (id) => {
    if (!pwdValue) {
      flash('Inserisci la nuova password', true);
      return;
    }

    setSaving(true);
    try {
      await changeUserPassword(id, pwdValue);
      setEditingPwd(null);
      setPwdValue('');
      flash('Password aggiornata');
    } catch (err) {
      flash(err?.response?.data?.message ?? 'Errore aggiornamento password', true);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setSaving(true);
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setDeleteConfirm(null);
      flash('Utente eliminato');
    } catch (err) {
      flash(err?.response?.data?.message ?? 'Errore eliminazione', true);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });

  const currentUserCount = users.filter((u) => u.email === currentUser?.email).length;

  return (
    <AdminPage
      eyebrow="Area riservata / Utenti"
      title="Gestione amministratori"
      description="Una schermata più pulita per governare accessi, credenziali e account attivi della piattaforma amministrativa."
      stats={[
        { label: 'Utenti totali', value: users.length },
        { label: 'Il tuo account', value: currentUserCount ? 'Attivo' : '—', meta: currentUser?.email ?? 'nessun utente' },
        { label: 'Sicurezza', value: 'Presidiata', meta: 'gestione password interna' },
      ]}
      actions={
        <>
          <AdminBadge tone="emerald">Accesso protetto</AdminBadge>
          <AdminButton
            type="button"
            variant="dark"
            onClick={() => {
              setShowCreate(true);
              setError(null);
            }}
          >
            + Nuovo utente
          </AdminButton>
        </>
      }
    >
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <AdminNotice tone="danger">{error}</AdminNotice>
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <AdminNotice tone="success">{success}</AdminNotice>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AdminKpiCard label="Admin attivi" value={users.length} subtitle="Account registrati nel backend" tone="cyan" icon={<IcoUsers />} />
        <AdminKpiCard label="Protezione" value="100%" subtitle="Cambio password dedicato" tone="violet" icon={<IcoShield />} />
        <AdminKpiCard label="Credenziali" value={editingPwd ? 'Update' : 'Stabili'} subtitle="Modifica rapida inline" tone="amber" icon={<IcoKey />} />
      </div>

      <AdminPanel
        title="Account amministratori"
        description="Elenco completo degli utenti con badge, data di creazione e strumenti rapidi per la manutenzione delle credenziali."
        action={<AdminButton type="button" variant="secondary" onClick={load}>Ricarica elenco</AdminButton>}
      >
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          </div>
        ) : users.length === 0 ? (
          <AdminEmptyState
            icon="👥"
            title="Nessun utente trovato"
            description="Crea il primo account amministratore per iniziare a gestire l’area riservata con il nuovo layout." 
            action={<AdminButton type="button" onClick={() => setShowCreate(true)}>Crea primo utente</AdminButton>}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {users.map((u) => {
              const isSelf = u.email === currentUser?.email;
              const isEditingPassword = editingPwd === u.id;

              return (
                <div
                  key={u.id}
                  className="rounded-[28px] border border-slate-200 bg-linear-to-br from-white via-white to-slate-50 px-5 py-5 shadow-[0_16px_42px_rgba(15,23,42,0.06)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)]">
                        {u.email[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-base font-black text-slate-900">{u.email}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {isSelf && <AdminBadge tone="cyan">Tu</AdminBadge>}
                          <AdminBadge tone="slate">Creato {formatDate(u.createdAt)}</AdminBadge>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => !isSelf && setDeleteConfirm(u.id)}
                      disabled={isSelf}
                      title={isSelf ? 'Non puoi eliminare il tuo account' : 'Elimina utente'}
                      className="flex h-10 w-10 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-lg text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-300"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Password</p>
                      {!isEditingPassword && (
                        <AdminButton
                          type="button"
                          variant="secondary"
                          className="px-3 py-2 text-xs"
                          onClick={() => {
                            setEditingPwd(u.id);
                            setPwdValue('');
                          }}
                        >
                          Cambia password
                        </AdminButton>
                      )}
                    </div>

                    {isEditingPassword ? (
                      <div className="space-y-3">
                        <AdminInput
                          type="password"
                          autoFocus
                          value={pwdValue}
                          onChange={(e) => setPwdValue(e.target.value)}
                          placeholder="Inserisci la nuova password"
                        />
                        <div className="flex flex-wrap justify-end gap-3">
                          <AdminButton
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              setEditingPwd(null);
                              setPwdValue('');
                            }}
                          >
                            Annulla
                          </AdminButton>
                          <AdminButton type="button" onClick={() => handleChangePassword(u.id)} disabled={saving}>
                            {saving ? 'Salvataggio…' : 'Salva password'}
                          </AdminButton>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm leading-6 text-slate-500">
                        Mantieni aggiornate le credenziali per garantire l’accesso sicuro al team amministrativo.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AdminPanel>

      <AnimatePresence>
        {showCreate && (
          <AdminDialog onClose={() => setShowCreate(false)} maxWidth="max-w-lg">
            <AdminDialogHeader
              title="Crea nuovo utente"
              description="Aggiungi un nuovo amministratore con credenziali dedicate."
              onClose={() => setShowCreate(false)}
            />
            <form onSubmit={handleCreate} className="space-y-5 px-6 py-6">
              <AdminField label="Email">
                <AdminInput
                  type="email"
                  required
                  autoFocus
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="nome@blendstudio.it"
                />
              </AdminField>

              <AdminField label="Password" hint="Usa una password forte e unica per il nuovo account.">
                <AdminInput
                  type="password"
                  required
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="Minimo 8 caratteri"
                />
              </AdminField>

              <div className="flex justify-end gap-3 pt-2">
                <AdminButton type="button" variant="secondary" onClick={() => setShowCreate(false)}>
                  Annulla
                </AdminButton>
                <AdminButton type="submit" disabled={saving}>
                  {saving ? 'Creazione…' : 'Crea utente'}
                </AdminButton>
              </div>
            </form>
          </AdminDialog>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirm !== null && (
          <AdminDialog onClose={() => setDeleteConfirm(null)} maxWidth="max-w-md">
            <AdminDialogHeader
              title="Elimina utente"
              description="Rimuovi definitivamente l’account selezionato."
              onClose={() => setDeleteConfirm(null)}
            />
            <div className="space-y-6 px-6 py-6">
              <p className="text-sm leading-6 text-slate-600">
                Stai per eliminare <span className="font-black text-slate-900">{users.find((u) => u.id === deleteConfirm)?.email}</span>. L’operazione è irreversibile.
              </p>
              <div className="flex justify-end gap-3">
                <AdminButton type="button" variant="secondary" onClick={() => setDeleteConfirm(null)}>
                  Annulla
                </AdminButton>
                <AdminButton type="button" variant="danger" onClick={() => handleDelete(deleteConfirm)} disabled={saving}>
                  {saving ? 'Eliminazione…' : 'Elimina'}
                </AdminButton>
              </div>
            </div>
          </AdminDialog>
        )}
      </AnimatePresence>
    </AdminPage>
  );
}
