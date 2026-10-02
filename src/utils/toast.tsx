/**
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextProps {
  showToast: (message: string, type?: ToastType) => void;
  showConfirm: (message: string) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    message: string;
    resolve: (value: boolean) => void;
  } | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const showConfirm = useCallback((message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmDialog({ message, resolve });
    });
  }, []);

  const handleConfirmClose = (value: boolean) => {
    if (confirmDialog) {
      confirmDialog.resolve(value);
      setConfirmDialog(null);
    }
  };

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-950/80 border-green-200 dark:border-green-900',
          text: 'text-green-800 dark:text-green-200',
          icon: <CheckCircle className="text-green-500 w-5 h-5 flex-shrink-0" />,
        };
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-950/80 border-red-200 dark:border-red-900',
          text: 'text-red-800 dark:text-red-200',
          icon: <AlertCircle className="text-red-500 w-5 h-5 flex-shrink-0" />,
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-900',
          text: 'text-amber-800 dark:text-amber-200',
          icon: <AlertTriangle className="text-amber-500 w-5 h-5 flex-shrink-0" />,
        };
      case 'info':
      default:
        return {
          bg: 'bg-sky-50 dark:bg-sky-950/80 border-sky-200 dark:border-sky-900',
          text: 'text-sky-800 dark:text-sky-100',
          icon: <Info className="text-sky-500 w-5 h-5 flex-shrink-0" />,
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, showConfirm }}>
      {children}
      
      {/* Toast Notifications List */}
      <div className="fixed top-4 right-4 z-9999 max-w-sm w-full space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const styles = getToastStyles(toast.type);
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`p-4 rounded-2xl border shadow-lg flex items-start gap-3 pointer-events-auto backdrop-blur-md ${styles.bg} ${styles.text} text-right`}
                dir="rtl"
              >
                {styles.icon}
                <div className="flex-1 text-xs font-black leading-relaxed">
                  {toast.message}
                </div>
                <button
                  onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Confirmation Dialog Component */}
      <AnimatePresence>
        {confirmDialog && (
          <div className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 flex items-center justify-center p-4 z-9999 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-md w-full rounded-[2.5rem] p-8 shadow-2xl overflow-hidden text-right relative"
            >
              {/* Decorative design */}
              <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-scout-yellow via-scout-green to-scout-blue"></div>
              
              <div className="flex items-start gap-4 mt-2">
                <div className="p-3 bg-amber-50 dark:bg-amber-955/20 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                  <AlertTriangle className="text-amber-500 w-8 h-8" />
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">تأكيد الإجراء الكشفي ⛺</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
                    {confirmDialog.message}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => handleConfirmClose(false)}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-black py-2.5 px-6 rounded-xl text-xs cursor-pointer transition-all"
                >
                  تراجع
                </button>
                <button
                  onClick={() => handleConfirmClose(true)}
                  className="bg-scout-green hover:bg-green-700 text-white font-black py-2.5 px-6 rounded-xl text-xs cursor-pointer transition-all shadow-md active:scale-95"
                >
                  استمرار وبدء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};
