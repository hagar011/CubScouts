import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Award, X } from 'lucide-react';
import { BadgeIconDisplay } from '../UI/ScoutUI';
import { Badge } from '../../badges';

interface BadgeCelebrationModalProps {
  celebratingBadge: { badge: Badge; cubName: string } | null;
  onClose: () => void;
}

export default function BadgeCelebrationModal({
  celebratingBadge,
  onClose,
}: BadgeCelebrationModalProps) {
  if (!celebratingBadge) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 font-sans" dir="rtl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
          onClick={onClose}
        />

        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative z-10 bg-white rounded-[38px] p-6 sm:p-10 shadow-[0_25px_90px_rgba(15,23,42,0.22)] max-w-sm w-full text-center border-4 border-scout-yellow/30 overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-scout-blue via-blue-600 to-scout-green opacity-90" />
          <button
            onClick={onClose}
            className="absolute top-4 left-4 z-20 p-2 rounded-full bg-white/15 hover:bg-white/20 text-white cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="relative z-10 pt-4">
            <div className="mb-6 flex items-center justify-center gap-2 text-scout-yellow">
              <Sparkles size={18} className="fill-current" />
              <span className="text-[10px] font-black tracking-[0.22em] text-white/90">ACHIEVEMENT</span>
              <Sparkles size={18} className="fill-current" />
            </div>

            <div className="rounded-[28px] bg-gradient-to-br from-scout-yellow/30 via-white to-scout-blue/10 p-5 shadow-inner">
              <BadgeIconDisplay
                badge={celebratingBadge.badge}
                size="lg"
                animate
                className="mx-auto border-4 border-white shadow-lg"
              />
            </div>

            <h2 className="text-3xl font-black text-scout-blue mt-6">وسام جديد! ⚜️</h2>
            <p className="text-scout-green font-black text-xl mt-2">
              مبروك يا بطل: {celebratingBadge.cubName}
            </p>

            <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3">
              <Award size={18} className="text-scout-yellow" />
              <p className="text-gray-600 font-bold text-sm leading-relaxed">
                حصلت على{' '}
                <span className="text-scout-blue underline decoration-scout-yellow underline-offset-4 font-black">
                  {celebratingBadge.badge.name}
                </span>
              </p>
            </div>

            <button
              onClick={onClose}
              className="scout-btn bg-gradient-to-r from-scout-green to-emerald-700 hover:from-emerald-700 hover:to-scout-green text-white w-full h-14 text-lg font-black shadow-lg shadow-emerald-500/20 mt-6 rounded-2xl cursor-pointer transition-all active:scale-95"
            >
              رائع جداً! 🌟
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
