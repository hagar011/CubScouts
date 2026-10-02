import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Sparkles, CheckCircle, X, BellRing } from 'lucide-react';
import { Cub } from '../../types';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCub: Cub | null;
  onMarkAllRead: () => Promise<void>;
}

export default function NotificationCenterModal({
  isOpen,
  onClose,
  activeCub,
  onMarkAllRead,
}: NotificationCenterModalProps) {
  if (!isOpen || !activeCub) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4 font-sans" dir="rtl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />

        <motion.div
          initial={{ scale: 0.92, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.92, y: 20, opacity: 0 }}
          className="relative w-full max-w-lg bg-white rounded-[34px] shadow-[0_25px_80px_rgba(15,23,42,0.12)] overflow-hidden flex flex-col max-h-[80vh] border-4 border-white"
        >
          <div className="bg-gradient-to-r from-scout-blue to-blue-700 p-6 text-white flex justify-between items-center border-b-4 border-scout-yellow/30">
            <div className="flex items-center gap-3">
              <div className="bg-white/15 p-2.5 rounded-2xl">
                <BellRing className="text-scout-yellow" size={20} />
              </div>
              <h3 className="text-xl font-black">التنبيهات</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl cursor-pointer"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-50 via-white to-scout-sand/30">
            {!activeCub.notifications?.length ? (
              <div className="py-16 text-center">
                <div className="bg-white rounded-[28px] p-6 shadow-sm border border-slate-100">
                  <Sparkles className="mx-auto text-slate-300 mb-3" size={48} />
                  <p className="text-slate-400 font-black">لا توجد تنبيهات جديدة</p>
                </div>
              </div>
            ) : (
              activeCub.notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border flex gap-3 shadow-sm ${
                    n.read
                      ? 'bg-white border-slate-100'
                      : 'bg-amber-50/80 border-scout-yellow/40 shadow-amber-100/50'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      n.type === 'success'
                        ? 'bg-green-100 text-green-600'
                        : n.type === 'warning'
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-scout-blue/10 text-scout-blue'
                    }`}
                  >
                    {n.type === 'success' ? <CheckCircle size={20} /> : <MessageSquare size={20} />}
                  </div>
                  <div className="flex-1 text-right">
                    <p className={`text-sm font-bold leading-relaxed ${n.read ? 'text-slate-500' : 'text-slate-800'}`}>
                      {n.message}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold">
                      {new Date(n.timestamp).toLocaleString('ar-EG')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t bg-white flex gap-3">
            <button
              onClick={onMarkAllRead}
              className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all cursor-pointer"
            >
              تحديد كمقروء
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gradient-to-r from-scout-blue to-blue-700 text-white rounded-2xl font-black text-sm hover:from-blue-700 hover:to-scout-blue transition-all cursor-pointer shadow-lg shadow-blue-500/20"
            >
              إغلاق
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
