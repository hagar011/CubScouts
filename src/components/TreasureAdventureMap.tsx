import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Anchor,
  Award,
  CheckCircle2,
  Compass,
  Flag,
  Gem,
  Gift,
  Lock,
  Map as MapIcon,
  Maximize2,
  Sailboat,
  ShipWheel,
  Sparkles,
  Star,
  Trophy,
  Waves,
  Trees as Tree,
} from 'lucide-react';
import { Cub } from '../types';

interface TreasureAdventureMapProps {
  cub?: Cub | null;
  cubs?: Cub[];
  activeCubId?: string;
  onClose?: () => void;
}

type Island = {
  id: number;
  step: number;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  x: number;
  y: number;
  challenge: string;
  reward: string;
};

const ISLANDS: Island[] = [
  { id: 1, step: 1, title: 'ميناء البداية', subtitle: 'استعد يا بطل', icon: '⚓', color: '#2563eb', x: 110, y: 390, challenge: 'قل شعار الأشبال بصوت واضح مع سداسيك.', reward: 'شارة البداية' },
  { id: 2, step: 7, title: 'جزيرة الزي', subtitle: 'النظام والانضباط', icon: '👕', color: '#f97316', x: 260, y: 260, challenge: 'رتب زيك الكشفي واذكر 3 أشياء مهمة فيه.', reward: 'نجمة النظام' },
  { id: 3, step: 14, title: 'غابة العقد', subtitle: 'مهارة الكشاف', icon: '🌲', color: '#16a34a', x: 445, y: 355, challenge: 'نفذ عقدة بسيطة أو اشرح استخدام عقدة كشفية.', reward: 'شارة العقد' },
  { id: 4, step: 20, title: 'كهف الشجاعة', subtitle: 'مرحلة المبتدئ', icon: '🕯️', color: '#7c3aed', x: 590, y: 530, challenge: 'احكِ موقفًا تصرفت فيه بشجاعة أو صدق.', reward: 'ترقية المبتدئ' },
  { id: 5, step: 28, title: 'سفينة التعاون', subtitle: 'قوة السداسي', icon: '⛵', color: '#0891b2', x: 420, y: 720, challenge: 'نفذوا مهمة جماعية في دقيقة واحدة بدون فوضى.', reward: 'وسام التعاون' },
  { id: 6, step: 37, title: 'منارة الالتزام', subtitle: 'مرحلة الثاني', icon: '🗼', color: '#ca8a04', x: 210, y: 650, challenge: 'اذكر عادة جيدة ستلتزم بها هذا الأسبوع.', reward: 'ترقية الثاني' },
  { id: 7, step: 47, title: 'بحيرة الرفق', subtitle: 'أخلاق الشبل', icon: '🌊', color: '#0ea5e9', x: 155, y: 910, challenge: 'مثّل موقفًا يساعد فيه الشبل صديقه بلطف.', reward: 'شارة الرفق' },
  { id: 8, step: 57, title: 'قلعة الكنز', subtitle: 'الشبل الأول', icon: '🏰', color: '#dc2626', x: 520, y: 980, challenge: 'اجمع إنجازاتك واعرضها أمام القائد.', reward: 'كنز الشبل الأول' },
];

const TreasureAdventureMap: React.FC<TreasureAdventureMapProps> = ({ cub, cubs = [], activeCubId, onClose }) => {
  const [selectedIsland, setSelectedIsland] = useState<Island | null>(null);
  const activeCub = cub || cubs.find((c) => c.id === activeCubId) || null;

  if (!activeCub) {
    return (
      <div className="fixed inset-0 z-[200] bg-white flex items-center justify-center text-center font-black text-slate-500">
        لا يوجد شبل محدد لعرض خريطة المغامرة.
      </div>
    );
  }

  const currentStep = Math.min(Math.max(activeCub.currentStep || 1, 1), 57);
  const cubName = activeCub.name || 'الشبل';

  const currentIsland = useMemo(() => {
    return [...ISLANDS].reverse().find((island) => currentStep >= island.step) || ISLANDS[0];
  }, [currentStep]);

  const progressPercent = Math.round((currentStep / 57) * 100);
  const isUnlocked = (island: Island) => currentStep >= island.step;
  const isCurrent = (island: Island) => currentIsland.id === island.id;

  return (
    <div className="fixed inset-0 z-[200] bg-[#edf7ff] overflow-hidden font-sans select-none text-right">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eff6ff_32%,#dff7f3_100%)]" />
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.12)_0_2px,transparent_3px),radial-gradient(circle_at_70%_60%,rgba(16,185,129,0.1)_0_2px,transparent_3px)] bg-[length:90px_90px]" />

      <div className="relative h-16 bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 flex items-center justify-between px-6 shadow-lg border-b-4 border-yellow-500 z-50">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-blue-950 rounded-2xl flex items-center justify-center text-yellow-300 shadow-inner">
            <MapIcon size={24} />
          </div>
          <div>
            <h2 className="font-black text-blue-950 leading-tight">خريطة كنز الأشبال البحرية</h2>
            <p className="text-[11px] font-black text-blue-900">{cubName} • الخطوة {currentStep} من 57</p>
          </div>
        </div>

        <button onClick={onClose} className="p-2 bg-blue-950 text-white rounded-xl hover:bg-blue-800 transition active:scale-95" title="إغلاق">
          <Maximize2 size={20} />
        </button>
      </div>

      <div className="relative h-[calc(100vh-4rem)] overflow-auto">
        <div className="relative mx-auto" style={{ width: 760, height: 1220 }}>
          <div className="absolute top-10 left-8 bg-white/90 backdrop-blur-xl rounded-[28px] p-5 shadow-2xl border-4 border-yellow-300 z-30 w-64">
            <div className="flex items-center gap-3 text-right">
              <div className="w-14 h-14 rounded-2xl bg-blue-950 text-white flex items-center justify-center text-3xl shadow-lg">🦁</div>
              <div>
                <p className="font-black text-blue-950">{cubName}</p>
                <p className="text-xs font-black text-slate-500">جزيرته الحالية: {currentIsland.title}</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs font-black text-slate-600 mb-1"><span>{progressPercent}%</span><span>التقدم</span></div>
              <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-yellow-400 to-green-500" initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.8 }} />
              </div>
            </div>
          </div>

          <div className="absolute top-24 right-8 text-sky-200/60"><Compass size={120} /></div>
          <div className="absolute top-[470px] left-10 text-sky-200/50 rotate-12"><ShipWheel size={110} /></div>
          <div className="absolute top-[760px] right-16 text-sky-200/60"><Waves size={150} /></div>
          <div className="absolute top-[850px] left-40 text-sky-200/50"><Anchor size={95} /></div>

          <svg className="absolute inset-0" width="760" height="1220" viewBox="0 0 760 1220">
            <path d="M110 390 C160 270 235 260 260 260 C340 250 410 315 445 355 C530 445 610 475 590 530 C560 635 475 655 420 720 C315 825 230 725 210 650 C175 760 130 820 155 910 C220 1040 410 1015 520 980" fill="none" stroke="rgba(59,130,246,0.35)" strokeWidth={8} strokeLinecap="round" strokeDasharray="14 20" />
            <path d="M110 390 C160 270 235 260 260 260 C340 250 410 315 445 355 C530 445 610 475 590 530 C560 635 475 655 420 720 C315 825 230 725 210 650 C175 760 130 820 155 910 C220 1040 410 1015 520 980" fill="none" stroke="rgba(250,204,21,0.28)" strokeWidth={16} strokeLinecap="round" strokeDasharray="2 28" />
          </svg>

          {ISLANDS.map((island) => {
            const unlocked = isUnlocked(island);
            const current = isCurrent(island);

            return (
              <motion.button key={island.id} onClick={() => setSelectedIsland(island)} className="absolute z-20 -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: island.x, top: island.y }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: island.id * 0.08, type: 'spring' }}>
                <motion.div animate={current ? { y: [0, -10, 0] } : {}} transition={{ repeat: Infinity, duration: 1.4 }} className={`relative w-40 h-36 rounded-[36px] border-4 shadow-2xl flex flex-col items-center justify-center ${unlocked ? 'bg-green-100 border-green-300' : 'bg-slate-300 border-slate-400 grayscale opacity-80'}`}>
                  <div className="absolute -inset-2 rounded-[40px] blur-xl opacity-35" style={{ backgroundColor: island.color }} />

                  {current && (
                   <>
                   <div className="absolute -inset-4 rounded-[40px] bg-yellow-400/30 blur-xl animate-pulse" />
                   <div className="absolute -top-8 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-1 rounded-full text-[11px] font-black shadow-2xl border-2 border-white animate-bounce">
                   ✨ أنت هنا
                  </div>
                  </>
                )}

                <div 
                  className={`relative rounded-3xl flex items-center justify-center text-4xl shadow-lg border-4 border-white transition-all duration-300 ${
                    current ? 'w-20 h-20 scale-110' : 'w-16 h-16'
                 }`}
                style={{
                  backgroundColor: unlocked ? island.color : '#64748b'
                }}
               >
                 {unlocked ? island.icon : <Lock className="text-white" size={28} />}
               </div>
                  
                 <p className="relative mt-2 font-black text-blue-950 text-sm">
                    {island.title}
                 </p>

                  <p className="relative text-[10px] font-black text-slate-500">
                  خطوة {island.step}
                 </p>

                {current && (
                   <div className="mt-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black">
                     ⚜️ المهمة الحالية
                    </div>
                  )}

                  {unlocked && !current && <CheckCircle2 className="absolute -bottom-3 -right-3 bg-white rounded-full text-green-600" size={30} fill="white" />}
                </motion.div>
              </motion.button>
            );
          })}

          <motion.div className="absolute z-40" style={{ left: currentIsland.x - 48, top: currentIsland.y - 155 }} animate={{ y: [0, -8, 0], rotate: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 2 }}>
            <div className="relative">
              <div className="absolute -inset-5 bg-yellow-300/30 blur-2xl rounded-full" />
              <div className="relative w-20 h-20 rounded-full border-4 border-white shadow-xl flex items-center justify-center bg-gradient-to-br from-amber-200 via-yellow-300 to-orange-400 text-4xl">
                <span aria-label="أكيلا">🐺</span>
                <div className="absolute -right-2 -top-2 w-9 h-9 rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center text-base">⚜️</div>
                <div className="absolute -bottom-3 bg-emerald-500 w-7 h-7 rounded-full border-4 border-white" />
              </div>
              <div className="mt-3 bg-emerald-700 text-yellow-100 px-4 py-2 rounded-full text-xs font-black shadow-md text-center border border-yellow-200">
                أكيلا
              </div>
            </div>
          </motion.div>

         <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur rounded-[34px] px-8 py-5 shadow-2xl border-4 border-yellow-300 flex items-center gap-5 z-30">
  
         <motion.div
          animate={{
           scale: [1, 1.15, 1],
           rotate: [-3, 3, -3]
         }}
         transition={{
           repeat: Infinity,
           duration: 2
         }}
         className="relative"
       >
        <div className="absolute -inset-3 bg-yellow-300/40 blur-xl rounded-full animate-pulse" />

        <div className="relative w-20 h-20 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-yellow-200">
          <Trophy className="text-yellow-950" size={40} />
       </div>
      </motion.div>

       <div>
        <h3 className="font-black text-blue-950 text-lg">
         🏰 قلعة الكنز
       </h3>

        <p className="text-sm font-black text-slate-600">
        افتح جميع الجزر واجمع الشارات لتحصل على لقب
        <span className="text-yellow-600"> الشبل الأول ⚜️</span>
       </p>
     </div>
    </div>
   </div>
 </div>
      <AnimatePresence>
        {selectedIsland && (
          <motion.div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedIsland(null)}>
            <motion.div className="bg-white rounded-[36px] p-7 max-w-md w-full shadow-2xl border-4 border-yellow-300 text-right" initial={{ scale: 0.85, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 40 }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-5xl shadow-lg border-4 border-white" style={{ backgroundColor: isUnlocked(selectedIsland) ? selectedIsland.color : '#64748b' }}>
                  {isUnlocked(selectedIsland) ? selectedIsland.icon : '🔒'}
                </div>
                <div><h2 className="text-2xl font-black text-blue-950">{selectedIsland.title}</h2><p className="font-black text-slate-500">{selectedIsland.subtitle} • خطوة {selectedIsland.step}</p></div>
              </div>

              <div className="space-y-3">
                <div className="bg-blue-50 rounded-3xl p-4 border border-blue-100">
                  <div className="flex items-center gap-2 font-black text-blue-900 mb-2"><Flag size={18} />التحدي</div>
                  <p className="font-bold text-slate-700 leading-relaxed">{isUnlocked(selectedIsland) ? selectedIsland.challenge : 'هذه الجزيرة مغلقة الآن. أكمل الخطوات السابقة لتفتحها.'}</p>
                </div>

                <div className="bg-yellow-50 rounded-3xl p-4 border border-yellow-100">
                  <div className="flex items-center gap-2 font-black text-yellow-800 mb-2"><Gem size={18} />المكافأة</div>
                  <p className="font-bold text-slate-700">{selectedIsland.reward}</p>
                </div>

                {isCurrent(selectedIsland) && <div className="bg-green-50 rounded-3xl p-4 border border-green-100"><div className="flex items-center gap-2 font-black text-green-700"><Sparkles size={18} />هذه هي محطتك الحالية يا بطل!</div></div>}
              </div>

              <button onClick={() => setSelectedIsland(null)} className="mt-5 w-full bg-blue-950 text-white rounded-2xl py-3 font-black hover:bg-blue-800 transition">إغلاق</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-5 right-5 bg-white/95 backdrop-blur rounded-[28px] shadow-2xl border-2 border-yellow-300 p-4 z-40 max-w-xs">
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-4xl">🐺</div>
          <div><h4 className="font-black text-slate-900 text-sm">نصيحة أكيلا</h4><p className="font-bold text-slate-500 text-xs leading-relaxed">اضغط على أي جزيرة لتعرف التحدي والمكافأة. اجمع الشارات وافتح الكنز!</p></div>
        </div>
      </div>

      <div className="fixed bottom-5 left-5 flex gap-3 z-40">
        <div className="bg-white/95 rounded-2xl px-4 py-3 shadow-xl border border-white flex items-center gap-2"><Award className="text-yellow-600" size={20} /><span className="font-black text-blue-950 text-sm">{progressPercent}%</span></div>
        <div className="bg-white/95 rounded-2xl px-4 py-3 shadow-xl border border-white flex items-center gap-2"><Sailboat className="text-blue-700" size={20} /><span className="font-black text-blue-950 text-sm">{currentIsland.title}</span></div>
      </div>
    </div>
  );
};

export default TreasureAdventureMap;
