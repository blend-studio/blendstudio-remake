import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function AdminPage({ eyebrow = 'Area riservata', title, description, actions, stats = [], children }) {
  return (
    <div className="space-y-6 lg:space-y-8">
      <motion.section
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-4xl border border-slate-800/70 bg-slate-950 px-6 py-7 text-white shadow-[0_24px_80px_rgba(15,23,42,0.35)] sm:px-8 sm:py-8"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.24),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(45,212,191,0.20),transparent_28%),linear-gradient(135deg,rgba(15,23,42,0.9),rgba(12,74,110,0.86)_52%,rgba(47,101,128,0.92))]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-size-[24px_24px] opacity-20" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-cyan-100/90 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.85)]" />
              {eyebrow}
            </div>
            <h1 className="text-3xl font-black tracking-[-0.04em] text-balance sm:text-4xl">{title}</h1>
            {description && (
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200/75 sm:text-[15px]">{description}</p>
            )}

            {stats.length > 0 && (
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/10 bg-white/8 px-4 py-4 backdrop-blur-md"
                  >
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-300/80">{stat.label}</p>
                    <div className="mt-2 flex items-end gap-2">
                      <p className="text-2xl font-black tracking-tight text-white">{stat.value}</p>
                      {stat.meta && <span className="pb-1 text-xs font-semibold text-cyan-100/70">{stat.meta}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {actions && <div className="relative flex w-full flex-wrap items-center gap-3 xl:w-auto xl:justify-end">{actions}</div>}
        </div>
      </motion.section>

      <div className="space-y-6">{children}</div>
    </div>
  );
}

export function AdminPanel({ title, description, action, children, className = '', contentClassName = '' }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cx(
        'overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]',
        className,
      )}
    >
      {(title || description || action) && (
        <div className="flex flex-col gap-4 border-b border-slate-200/70 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div>
            {title && <h2 className="text-lg font-black tracking-tight text-slate-900">{title}</h2>}
            {description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={cx('px-5 py-5 sm:px-6', contentClassName)}>{children}</div>
    </motion.section>
  );
}

const BUTTON_VARIANTS = {
  primary: 'border-transparent bg-slate-950 text-white hover:bg-slate-800 shadow-[0_12px_25px_rgba(15,23,42,0.16)]',
  secondary: 'border-slate-300 bg-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-300',
  ghost: 'border-slate-300 bg-slate-200 text-slate-600 hover:bg-slate-300 hover:border-slate-400',
  danger: 'border-red-200 bg-red-100 text-red-600 hover:bg-red-200 hover:border-red-300',
  dark: 'border-white/20 bg-white/18 text-white hover:bg-white/25 backdrop-blur-sm',
};

export function AdminButton({ as: Component = 'button', variant = 'primary', className = '', children, ...props }) {
  return (
    <Component
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-black tracking-tight transition-all disabled:cursor-not-allowed disabled:opacity-45',
        BUTTON_VARIANTS[variant] ?? BUTTON_VARIANTS.primary,
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function AdminBadge({ children, tone = 'slate', className = '' }) {
  const tones = {
    slate: 'border-slate-200 bg-slate-100 text-slate-600',
    cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    red: 'border-red-200 bg-red-50 text-red-600',
    violet: 'border-violet-200 bg-violet-50 text-violet-700',
  };

  return (
    <span className={cx('inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]', tones[tone] ?? tones.slate, className)}>
      {children}
    </span>
  );
}

export function AdminField({ label, hint, children, className = '' }) {
  return (
    <label className={cx('flex flex-col gap-2', className)}>
      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</span>
      {children}
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

export function AdminInput({ className = '', ...props }) {
  return (
    <input
      className={cx(
        'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-300 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100',
        className,
      )}
      {...props}
    />
  );
}

export function AdminTextarea({ className = '', ...props }) {
  return (
    <textarea
      className={cx(
        'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-300 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100',
        className,
      )}
      {...props}
    />
  );
}

export function AdminSelect({ className = '', children, ...props }) {
  return (
    <select
      className={cx(
        'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function AdminNotice({ tone = 'info', children }) {
  const tones = {
    info: 'border-cyan-200 bg-cyan-50 text-cyan-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    danger: 'border-red-200 bg-red-50 text-red-600',
  };

  return (
    <div className={cx('rounded-2xl border px-4 py-3 text-sm font-medium', tones[tone] ?? tones.info)}>
      {children}
    </div>
  );
}

export function AdminEmptyState({ icon, title, description, action }) {
  return (
    <div className="flex min-h-70 flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-white/70 px-6 py-12 text-center shadow-[0_18px_50px_rgba(15,23,42,0.05)] backdrop-blur-sm">
      <div className="mb-5 flex h-18 w-18 items-center justify-center rounded-3xl bg-slate-950 text-4xl text-white shadow-[0_16px_40px_rgba(15,23,42,0.22)]">
        {icon}
      </div>
      <h3 className="text-xl font-black tracking-tight text-slate-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function AdminDialog({ children, onClose, maxWidth = 'max-w-2xl', overlayClassName = '', panelClassName = '' }) {
  return createPortal(
    <motion.div
      className={cx('fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6', overlayClassName)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm" />

      <motion.div
        className={cx(
          'relative max-h-[92vh] w-full overflow-hidden rounded-[32px] border border-white/10 bg-white shadow-[0_40px_120px_rgba(15,23,42,0.45)]',
          maxWidth,
          panelClassName,
        )}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.75 }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>,
    document.body,
  );
}

export function AdminDialogHeader({ title, description, onClose }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-200/70 px-6 py-5">
      <div>
        <h3 className="text-xl font-black tracking-tight text-slate-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
      >
        ×
      </button>
    </div>
  );
}

export function AdminKpiCard({ label, value, icon, tone = 'cyan', subtitle }) {
  const tones = {
    cyan: 'from-cyan-500/15 via-sky-500/8 to-transparent text-cyan-700 ring-cyan-100',
    emerald: 'from-emerald-500/15 via-teal-500/8 to-transparent text-emerald-700 ring-emerald-100',
    violet: 'from-violet-500/15 via-fuchsia-500/8 to-transparent text-violet-700 ring-violet-100',
    amber: 'from-amber-500/15 via-orange-500/8 to-transparent text-amber-700 ring-amber-100',
    slate: 'from-slate-500/15 via-slate-500/8 to-transparent text-slate-700 ring-slate-100',
  };

  return (
    <div className={cx('rounded-[26px] border border-slate-200 bg-linear-to-br px-5 py-5 shadow-[0_14px_36px_rgba(15,23,42,0.06)] ring-1', tones[tone] ?? tones.cyan)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">{value}</p>
          {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {icon && <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-slate-700 shadow-sm">{icon}</div>}
      </div>
    </div>
  );
}
