import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

export const Toast: React.FC = () => {
  const { activeToast, clearToast } = useApp();

  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        clearToast();
      }, 4000); // Auto-dismiss after 4 seconds
      return () => clearTimeout(timer);
    }
  }, [activeToast, clearToast]);

  if (!activeToast) return null;

  const { message, type } = activeToast;

  const colors = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/85 dark:border-emerald-800 dark:text-emerald-200',
    error: 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/85 dark:border-rose-800 dark:text-rose-200',
    warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/85 dark:border-amber-800 dark:text-amber-200',
    info: 'bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-indigo-950/85 dark:border-indigo-800 dark:text-indigo-200'
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    info: <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
  };

  return (
    <div id="app-toast" className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-fade-in-down">
      <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 ${colors[type]}`}>
        <div className="shrink-0 mt-0.5">{icons[type]}</div>
        <div className="flex-1 text-sm font-medium leading-relaxed">{message}</div>
        <button
          onClick={clearToast}
          className="shrink-0 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors text-current/60 hover:text-current"
          aria-label="Dismiss Notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
