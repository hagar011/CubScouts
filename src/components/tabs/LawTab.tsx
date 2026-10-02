import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Map } from 'lucide-react';
import { SCOUT_LAWS, SCOUT_PROMISE } from '../../constants/scoutData';

export default function LawTab() {
  const [activeLawId, setActiveLawId] = useState<string | null>(null);

  // Simple icon selector matching law IDs
  const getLawEmoji = (id: string) => {
    switch (id) {
      case 'honest': return '💬';
      case 'loyal': return '🤝';
      case 'useful': return '⛺';
      case 'friendly': return '❤️';
      case 'polite': return '✨';
      case 'animal_lover': return '🦊';
      case 'obedient': return '🫡';
      case 'cheerful': return '☀️';
      case 'thrifty': return '🪙';
      case 'clean': return '💧';
      default: return '⚜️';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-350 text-right font-sans" dir="rtl">
      {/* Promise Section */}
      <div className="bg-gradient-to-r from-scout-blue to-blue-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border-4 border-scout-yellow/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none scale-150 rotate-12">
          <Map size={120} />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🧭</span>
            <div>
              <span className="text-[10px] bg-white/20 px-3 py-0.5 rounded-full block text-white/90">الوعد والعهد الكشفي المقدس للأشبال ⚜️</span>
              <h3 className="text-lg font-black mt-1">وعد وأقسم الأشبال</h3>
            </div>
          </div>
          <p className="text-sm md:text-base font-black leading-relaxed border-r-4 border-scout-yellow pr-4 bg-white/5 py-4 rounded-l-2xl">
            &ldquo;{SCOUT_PROMISE}&rdquo;
          </p>
        </div>
      </div>

      {/* Law Intro */}
      <div className="space-y-2">
        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <span>📜</span> قانون الأشبال العشرة (الحلقات الكشفية السلوكية)
        </h3>
        <p className="text-xs text-slate-500 font-bold leading-relaxed">
          قوانين الكشافة هي المعيار الأخلاقي والسلوكي لكل مغامر ذكي! اضغط على أي بند لقراءة القصة التربوية الملهمة المرتبطة به.
        </p>
      </div>

      {/* Laws Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {SCOUT_LAWS.map((law, idx) => {
          const isActive = activeLawId === law.id;
          return (
            <div
              key={law.id}
              onClick={() => setActiveLawId(isActive ? null : law.id)}
              className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[160px] relative overflow-hidden group ${
                isActive 
                  ? 'bg-scout-blue border-scout-blue text-white shadow-lg' 
                  : 'bg-white border-slate-100 hover:border-scout-blue/40 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  {/* Law Number Indicator */}
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-scout-blue/5 group-hover:text-scout-blue'
                  }`}>
                    البند {idx + 1}
                  </span>
                  <span className="text-2xl">{getLawEmoji(law.id)}</span>
                </div>
                <h4 className={`text-base font-black ${isActive ? 'text-scout-yellow' : 'text-slate-800'}`}>
                  الشبل {law.title}
                </h4>
              </div>

              {!isActive && (
                <div className="text-[9px] text-slate-400 font-bold flex items-center gap-1 mt-4 group-hover:text-scout-blue transition-colors">
                  <span>اقرأ القصة الكاملة</span>
                  <span className="text-xs font-serif">←</span>
                </div>
              )}

              {/* Expand story inline with AnimatePresence */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 text-[10px] text-slate-200 font-bold leading-relaxed border-t border-white/20 pt-3"
                  >
                    {law.story}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Golden rules banner */}
      <div className="p-6 bg-amber-500/5 rounded-3xl border-2 border-dashed border-amber-500/20 flex gap-4 items-center">
        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm">
          🦁
        </div>
        <div>
          <h4 className="text-xs font-black text-amber-800">مبدأ الأدغال والتربية الكشفية</h4>
          <p className="text-[10px] text-slate-500 font-bold mt-1 leading-relaxed">
            الشبل ينعم بصدق اللسان، ويؤاخي رفاق السداسية، ويلتزم بأوامر أكيلا الحكيمة لتظل فرقة الأشبال درعاً حصيناً لحب الأوطان.
          </p>
        </div>
      </div>
    </div>
  );
}
