import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle2, AlertTriangle, Info, AlertCircle } from 'lucide-react';

const DURATION = 4000;

const styles = {
  success: { icon: CheckCircle2, tint: 'text-emerald-500', bar: 'bg-emerald-500', ring: 'ring-emerald-500/20' },
  error: { icon: AlertCircle, tint: 'text-rose-500', bar: 'bg-rose-500', ring: 'ring-rose-500/20' },
  warning: { icon: AlertTriangle, tint: 'text-amber-500', bar: 'bg-amber-500', ring: 'ring-amber-500/20' },
  info: { icon: Info, tint: 'text-violet-500', bar: 'bg-violet-500', ring: 'ring-violet-500/20' },
} as const;

export const Toast: React.FC = () => {
  const { activeToast, clearToast } = useApp();

  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => clearToast(), DURATION);
      return () => clearTimeout(timer);
    }
  }, [activeToast, clearToast]);

  const s = activeToast ? styles[activeToast.type] : null;

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-[380px] z-[60] pointer-events-none" aria-live="polite">
      <AnimatePresence>
        {activeToast && s && (
          <motion.div
            key={activeToast.message + activeToast.type}
            id="app-toast"
            role="status"
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, transition: { duration: 0.18 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className={`pointer-events-auto relative overflow-hidden flex items-start gap-3 p-4 pr-3 rounded-2xl bg-brand-surface/95 backdrop-blur-xl ring-1 ring-brand-border shadow-lift`}
          >
            <div className={`shrink-0 grid place-items-center w-8 h-8 rounded-full ring-4 ${s.ring} ${s.tint}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="flex-1 text-sm font-medium leading-relaxed text-brand-text-primary pt-1">
              {activeToast.message}
            </p>
            <button
              onClick={clearToast}
              className="shrink-0 grid place-items-center w-7 h-7 rounded-full text-brand-text-tertiary hover:text-brand-text-primary hover:bg-brand-border-light transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
            <motion.span
              className={`absolute bottom-0 left-0 h-0.5 ${s.bar} opacity-70`}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: DURATION / 1000, ease: 'linear' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
