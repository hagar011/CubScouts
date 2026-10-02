import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Cub } from '../../types';

interface DeleteConfirmModalProps {
  cubToDelete: string | null;
  cubs: Cub[];
  onConfirm: (cubId: string) => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  cubToDelete,
  cubs,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  if (!cubToDelete) return null;
  const cub = cubs.find((c) => c.id === cubToDelete);
  if (!cub) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 font-sans" dir="rtl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
          onClick={onCancel}
        />

        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 18 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 18 }}
          className="relative z-10 bg-white rounded-[34px] p-6 sm:p-8 shadow-[0_25px_80px_rgba(15,23,42,0.18)] max-w-sm w-full text-center border-4 border-red-50 overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-red-500 via-rose-500 to-orange-400" />
          <button
            onClick={onCancel}
            className="absolute top-4 left-4 z-20 p-2 rounded-full bg-white/15 hover:bg-white/20 text-white cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="relative z-10 pt-6">
            <div className="w-20 h-20 mx-auto rounded-[28px] bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center mb-6 text-red-500 shadow-inner">
              <Trash2 size={40} />
            </div>

            <div className="flex items-center justify-center gap-2 text-red-500 mb-2">
              <AlertTriangle size={18} />
              <span className="text-[10px] font-black tracking-[0.22em]">WARNING</span>
            </div>

            <h2 className="text-2xl font-black text-slate-800 mb-2">حذف {cub.name}؟</h2>
            <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed">
              هذا الإجراء لا يمكن التراجع عنه وسيحذف كافة سجلات ونقاط الشبل.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => onConfirm(cub.id)}
                className="bg-gradient-to-r from-red-500 to-rose-600 text-white w-full py-4 rounded-2xl font-black hover:from-red-600 hover:to-rose-700 transition-all active:scale-[0.99] cursor-pointer shadow-lg shadow-red-500/20"
              >
                نعم، أحذف
              </button>
              <button
                onClick={onCancel}
                className="bg-slate-100 text-slate-600 w-full py-4 rounded-2xl font-black hover:bg-slate-200 transition-all cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
