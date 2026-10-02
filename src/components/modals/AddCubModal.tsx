import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserPlus, CheckCircle, X } from 'lucide-react';
import { Sextet } from '../../types';

interface AddCubModalProps {
  isOpen: boolean;
  onClose: () => void;
  sextets: Sextet[];
  onAddCub: (cub: {
    name: string;
    sextetId: string;
    age: string;
    phone: string;
    email: string;
  }) => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function AddCubModal({
  isOpen,
  onClose,
  sextets,
  onAddCub,
  showToast,
}: AddCubModalProps) {
  const [form, setForm] = useState({
    name: '',
    sextetId: '',
    phone: '',
    age: '',
    email: '',
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.age.trim()) {
      showToast('يرجى إدخال الاسم والسن.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      await onAddCub(form);
      setForm({ name: '', sextetId: '', phone: '', age: '', email: '' });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 font-sans" dir="rtl">
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
          className="relative w-full max-w-lg bg-white rounded-[34px] shadow-[0_25px_80px_rgba(15,23,42,0.12)] overflow-hidden border-4 border-white"
        >
          <div className="bg-gradient-to-r from-scout-blue to-blue-700 p-7 text-white text-center relative border-b-4 border-scout-yellow/30">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full cursor-pointer"
            >
              <X size={24} />
            </button>
            <div className="w-20 h-20 bg-white/15 rounded-[28px] flex items-center justify-center mx-auto mb-4 border-2 border-white/30 shadow-lg shadow-blue-900/10">
              <UserPlus size={40} />
            </div>
            <h3 className="text-2xl font-black">إضافة شبل جديد</h3>
            <p className="text-sm text-blue-100 mt-1 font-bold">أضف بيانات الشبل بسهولة وسرعة</p>
          </div>

          <div className="p-7 space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500">اسم الشبل</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="اسم الشبل رباعياً"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-right font-bold focus:border-scout-blue outline-none shadow-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500">السداسي</label>
                <select
                  value={form.sextetId}
                  onChange={(e) => setForm({ ...form, sextetId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-right font-bold focus:border-scout-blue outline-none shadow-sm"
                >
                  <option value="">اختر السداسي</option>
                  {sextets.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500">السن</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  placeholder="السن"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-black focus:border-scout-blue outline-none text-left shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500">هاتف ولي الأمر</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="هاتف ولي الأمر"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-mono focus:border-scout-blue outline-none text-left shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500">البريد الإلكتروني</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="البريد الإلكتروني (اختياري)"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-mono focus:border-scout-blue outline-none text-left shadow-sm"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-[2] bg-gradient-to-r from-scout-blue to-blue-700 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-scout-blue transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle size={20} /> {submitting ? 'جاري الإضافة...' : 'تأكيد'}
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all cursor-pointer"
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
