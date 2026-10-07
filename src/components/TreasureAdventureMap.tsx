import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion, type TargetAndTransition } from 'motion/react';
import {
  CheckCircle2,
  Flag,
  Gem,
  Home,
  Lock,
  MapPin,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Cub } from '../types';
import startAkela from '../assets/map/start-akela.webp';
import akelaMarker from '../assets/map/akela-marker.webp';
import boatImg from '../assets/map/boat.webp';
import lighthouseRock from '../assets/map/lighthouse-rock.webp';
import sharkImg from '../assets/map/shark.webp';
import island7 from '../assets/map/island-7.webp';
import island14 from '../assets/map/island-14.webp';
import island20 from '../assets/map/island-20.webp';
import island28 from '../assets/map/island-28.webp';
import island37 from '../assets/map/island-37.webp';
import island47 from '../assets/map/island-47.webp';
import island57 from '../assets/map/island-57.webp';

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

// البيانات كما هي (الأسماء والخطوات والتحديات والمكافآت). x/y فقط إحداثيات التوزيع البصري.
const ISLANDS: Island[] = [
  { id: 1, step: 1, title: 'ميناء البداية', subtitle: 'استعد يا بطل', icon: '⚓', color: '#2563eb', x: 110, y: 430, challenge: 'قل شعار الأشبال بصوت واضح مع سداسيك.', reward: 'شارة البداية' },
  { id: 2, step: 7, title: 'جزيرة الزي', subtitle: 'النظام والانضباط', icon: '👕', color: '#f97316', x: 385, y: 225, challenge: 'رتب زيك الكشفي واذكر 3 أشياء مهمة فيه.', reward: 'نجمة النظام' },
  { id: 3, step: 14, title: 'غابة العقد', subtitle: 'مهارة الكشاف', icon: '🌲', color: '#16a34a', x: 640, y: 195, challenge: 'نفذ عقدة بسيطة أو اشرح استخدام عقدة كشفية.', reward: 'شارة العقد' },
  { id: 4, step: 20, title: 'كهف الشجاعة', subtitle: 'مرحلة المبتدئ', icon: '🕯️', color: '#7c3aed', x: 895, y: 285, challenge: 'احكِ موقفًا تصرفت فيه بشجاعة أو صدق.', reward: 'ترقية المبتدئ' },
  { id: 5, step: 28, title: 'سفينة التعاون', subtitle: 'قوة السداسي', icon: '⛵', color: '#0891b2', x: 690, y: 440, challenge: 'نفذوا مهمة جماعية في دقيقة واحدة بدون فوضى.', reward: 'وسام التعاون' },
  { id: 6, step: 37, title: 'منارة الالتزام', subtitle: 'مرحلة الثاني', icon: '🗼', color: '#ca8a04', x: 435, y: 490, challenge: 'اذكر عادة جيدة ستلتزم بها هذا الأسبوع.', reward: 'ترقية الثاني' },
  { id: 7, step: 47, title: 'بحيرة الرفق', subtitle: 'أخلاق الشبل', icon: '🌊', color: '#0ea5e9', x: 215, y: 690, challenge: 'مثّل موقفًا يساعد فيه الشبل صديقه بلطف.', reward: 'شارة الرفق' },
  { id: 8, step: 57, title: 'قلعة الكنز', subtitle: 'الشبل الأول', icon: '🏰', color: '#dc2626', x: 900, y: 690, challenge: 'اجمع إنجازاتك واعرضها أمام القائد.', reward: 'كنز الشبل الأول' },
];

// ─── مقاييس التصميم ─────────────────────────────────────────────────────────
const MAP_W = 1100;
const MAP_H = 880;
const ISLAND_BOX_W = 240;
const ISLAND_BOX_H = 200;
const ISLAND_CX = 120; // مركز سطح الجزيرة داخل الـ SVG
const ISLAND_CY = 150;

const GOLD = '#e2b93b';
const GREEN_DARK = '#0f3d22';
const CREAM = '#fbf3dc';

// زنبق الكشافة (Fleur-de-lis) بسيط
const Fleur: React.FC<{ x?: number; y?: number; s?: number; fill?: string }> = ({ x = 0, y = 0, s = 1, fill = '#ffe08a' }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
    <path d="M0 -14 C6 -8 6 2 0 8 C-6 2 -6 -8 0 -14Z" />
    <path d="M-3 4 C-14 -8 -20 0 -14 8 C-10 12 -4 10 -2 6Z" />
    <path d="M3 4 C14 -8 20 0 14 8 C10 12 4 10 2 6Z" />
    <rect x="-10" y="8" width="20" height="3.5" rx="1.2" />
    <path d="M-4 11 L-6 17 L0 14 L6 17 L4 11Z" />
  </g>
);

// ─── عناصر الخريطة (صور شفافة مقتطعة من التصميم المرجعي) ──────────────────────
// w/h: أبعاد الصورة الأصلية. cx/cy: موضع بطاقة المرحلة بالنسبة للصورة. ax/ay: مركز سطح الجزيرة.
type Art = { src: string; w: number; h: number; ax: number; ay: number; cx: number; cy: number };
const ART: Record<number, Art> = {
  2: { src: island7, w: 216, h: 170, ax: 108, ay: 105, cx: 23, cy: 146 },
  3: { src: island14, w: 234, h: 209, ax: 117, ay: 130, cx: 28, cy: 205 },
  4: { src: island20, w: 256, h: 235, ax: 128, ay: 146, cx: 21, cy: 203 },
  5: { src: island28, w: 262, h: 223, ax: 131, ay: 138, cx: 26, cy: 220 },
  6: { src: island37, w: 266, h: 282, ax: 133, ay: 175, cx: 38, cy: 265 },
  7: { src: island47, w: 322, h: 239, ax: 161, ay: 148, cx: 70, cy: 236 },
  8: { src: island57, w: 331, h: 327, ax: 165, ay: 203, cx: 65, cy: 296 },
};
const BOAT_ART: Art = { src: boatImg, w: 141, h: 128, ax: 70, ay: 80, cx: 8, cy: 112 };
const START_ART: Art = { src: startAkela, w: 451, h: 541, ax: 175, ay: 385, cx: 292, cy: 492 };
const ISLAND_SCALE = 0.92;
const START_SCALE = 0.62;
const MARKER = { src: akelaMarker, w: 435, h: 430, feetX: 156, feetY: 424, scale: 0.46 };

// ─── مكونات مساعدة للـ HUD ─────────────────────────────────────────────────
const WAVE_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='110'%3E%3Cpath d='M0 24 q30 -16 60 0 t60 0 t60 0 t60 0' fill='none' stroke='white' stroke-opacity='.16' stroke-width='3' stroke-linecap='round'/%3E%3Cpath d='M-40 78 q30 -16 60 0 t60 0 t60 0 t60 0 t60 0' fill='none' stroke='white' stroke-opacity='.1' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E\")";

const HudChip: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode; compact?: boolean }> = ({ icon, label, value, compact }) => (
  <div
    className={`flex items-center gap-2 rounded-xl border-2 shadow-[inset_0_1px_0_rgba(255,255,255,.12),0_3px_8px_rgba(0,0,0,.35)] ${compact ? 'px-2.5 py-1' : 'px-3 py-1.5'}`}
    style={{ background: 'linear-gradient(180deg,#1f4a2c,#0d2a18)', borderColor: '#b8892b' }}
  >
    <span className="shrink-0 flex items-center justify-center">{icon}</span>
    <span dir="rtl" className="text-right leading-tight">
      <span className="block text-[10px] font-bold text-[#e8d9a8]">{label}</span>
      <b className={`block font-black text-[#fff4c9] whitespace-nowrap ${compact ? 'text-sm' : 'text-lg'}`}>{value}</b>
    </span>
  </div>
);

const RoundBtn: React.FC<{ onClick?: () => void; title: string; children: React.ReactNode }> = ({ onClick, title, children }) => (
  <button
    onClick={onClick}
    title={title}
    aria-label={title}
    className="w-11 h-11 rounded-full flex items-center justify-center text-[#ffe9a3] border-[3px] shadow-[0_4px_10px_rgba(0,0,0,.45),inset_0_2px_0_rgba(255,255,255,.18)] transition hover:scale-105 active:scale-95"
    style={{ background: 'radial-gradient(circle at 35% 30%,#2f7a43,#0f3d22)', borderColor: '#d7a62b' }}
  >
    {children}
  </button>
);

// ─── المكوّن الرئيسي ───────────────────────────────────────────────────────
const TreasureAdventureMap: React.FC<TreasureAdventureMapProps> = ({ cub, cubs = [], activeCubId, onClose }) => {
  const [selectedIsland, setSelectedIsland] = useState<Island | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [scale, setScale] = useState(1);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const scrollRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const activeCub = cub || cubs.find((c) => c.id === activeCubId) || null;

  const currentStep = Math.min(Math.max(activeCub?.currentStep || 1, 1), 57);

  const currentIsland = useMemo(() => {
    return [...ISLANDS].reverse().find((island) => currentStep >= island.step) || ISLANDS[0];
  }, [currentStep]);

  // ملاءمة الخريطة للشاشة: تتكيّف على الشاشات الكبيرة، وتصبح قابلة للتمرير على الموبايل بدل أن تصغر أكثر من اللازم
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      setViewport({ w, h });
      setScale(Math.min(1.3, Math.max(0.6, Math.min(w / MAP_W, h / MAP_H))));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [!!activeCub]);

  // ابدأ التمرير عند موضع الشبل الحالي
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !viewport.w) return;
    el.scrollTo({
      left: currentIsland.x * scale - viewport.w / 2,
      top: currentIsland.y * scale - viewport.h / 2,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport.w, viewport.h, currentIsland.id]);

  if (!activeCub) {
    return (
      <div className="fixed inset-0 z-[200] bg-white flex items-center justify-center text-center font-black text-slate-500">
        لا يوجد شبل محدد لعرض خريطة المغامرة.
      </div>
    );
  }

  const cubName = activeCub.name || 'الشبل';
  const progressPercent = Math.round((currentStep / 57) * 100);
  const badgesCount = Array.isArray(activeCub.badges) ? activeCub.badges.length : 0;
  const pointsCount = activeCub.points || 0;
  const rankLabel = activeCub.level || 'مبتدئ';
  const isUnlocked = (island: Island) => currentStep >= island.step;
  const isCurrent = (island: Island) => currentIsland.id === island.id;
  const isMobile = viewport.w > 0 && viewport.w < 700;

  // مقاطع المسار الذهبي بين الجزر
  const segments = ISLANDS.slice(0, -1).map((a, i) => {
    const b = ISLANDS[i + 1];
    const ax = a.x;
    const ay = a.y + 28;
    const bx = b.x;
    const by = b.y + 28;
    const dx = bx - ax;
    const dy = by - ay;
    const len = Math.hypot(dx, dy) || 1;
    const k = len * 0.2 * (i % 2 === 0 ? -1 : 1);
    const cx = (ax + bx) / 2 + (-dy / len) * k;
    const cy = (ay + by) / 2 + (dx / len) * k;
    return { id: `${a.id}-${b.id}`, d: `M ${ax} ${ay} Q ${cx} ${cy} ${bx} ${by}`, done: isUnlocked(b) };
  });

  const loop = (animate: TargetAndTransition, duration: number, delay = 0) =>
    reduceMotion ? {} : { animate, transition: { repeat: Infinity, duration, delay, ease: 'easeInOut' as const } };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col overflow-hidden font-sans select-none text-right" style={{ background: '#0b4a94' }}>

      {/* ═════════ HUD ═════════ */}
      <header
        dir="ltr"
        className="relative z-50 shrink-0 border-b-[3px] shadow-[0_6px_18px_rgba(0,0,0,.45)]"
        style={{ background: `linear-gradient(180deg,#14532d 0%,${GREEN_DARK} 100%)`, borderColor: GOLD }}
      >
        <div className="relative flex items-center justify-between gap-2 px-2 sm:px-4 h-[64px] md:h-[78px]">
          <div className="flex items-center gap-2 sm:gap-3 z-10">
            <RoundBtn onClick={onClose} title="الرئيسية / إغلاق الخريطة">
              <Home size={22} />
            </RoundBtn>
            <div className="hidden md:flex items-center gap-3">
              <HudChip label="الشارات" value={badgesCount} icon={<svg width="34" height="34" viewBox="-22 -20 44 44"><Fleur fill="#f5c542" s={1.15} /></svg>} />
              <HudChip label="النقاط" value={pointsCount} icon={<span className="w-8 h-8 rounded-full flex items-center justify-center text-[#7a4b00] text-lg font-black border-2 border-[#fff1a8]" style={{ background: 'radial-gradient(circle at 35% 30%,#fff1a8,#e0a400)' }}>★</span>} />
            </div>
          </div>

          {/* اللوحة الوسطى */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-0 z-20 text-center px-8 pt-1 pb-3 rounded-b-[34px] border-[3px] border-t-0 shadow-[0_8px_18px_rgba(0,0,0,.5)] min-w-[190px] md:min-w-[300px]"
            style={{ background: `linear-gradient(180deg,#1c6a3a,${GREEN_DARK})`, borderColor: GOLD }}
          >
            <h1
              dir="rtl"
              className="font-black leading-none text-[34px] md:text-[46px] pt-1"
              style={{
                backgroundImage: 'linear-gradient(180deg,#fff3b0,#f2b705 60%,#b87a00)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                filter: 'drop-shadow(0 2px 0 rgba(60,30,0,.7))',
              }}
            >
              أكيلا
            </h1>
            <p dir="rtl" className="text-[11px] md:text-sm font-black text-[#f5ebc8] mt-0.5">رحلة الشبل نحو القمة</p>
          </div>

          <div className="hidden md:flex items-center gap-3 z-10">
            <HudChip label="الرتبة" value={rankLabel} icon={<svg width="32" height="32" viewBox="-22 -20 44 44"><Fleur fill="#f5ebc8" s={1.1} /></svg>} />
            <HudChip label="الخطوة الحالية" value={`${currentStep} من 57`} icon={<MapPin size={30} className="text-red-500" fill="#ef4444" stroke="#7f1d1d" />} />
          </div>
          <div className="md:hidden w-11" />
        </div>

        {/* صف الإحصائيات للشاشات الصغيرة */}
        <div className="md:hidden flex items-center justify-between gap-1.5 px-2 pb-1.5 pt-6 -mt-3 overflow-x-auto">
          <HudChip compact label="الشارات" value={badgesCount} icon={<svg width="20" height="20" viewBox="-22 -20 44 44"><Fleur fill="#f5c542" s={1.15} /></svg>} />
          <HudChip compact label="النقاط" value={pointsCount} icon={<span className="text-[#f5c542] text-base font-black">★</span>} />
          <HudChip compact label="الرتبة" value={rankLabel} icon={<svg width="20" height="20" viewBox="-22 -20 44 44"><Fleur fill="#f5ebc8" s={1.1} /></svg>} />
          <HudChip compact label="الخطوة" value={`${currentStep}/57`} icon={<MapPin size={18} className="text-red-500" fill="#ef4444" stroke="#7f1d1d" />} />
        </div>
      </header>

      {/* ═════════ منطقة الخريطة ═════════ */}
      <div className="relative flex-1 min-h-0">
        {/* المحيط */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 20% 15%,rgba(60,170,235,.55) 0%,transparent 45%),radial-gradient(ellipse at 85% 70%,rgba(8,60,130,.55) 0%,transparent 50%),linear-gradient(180deg,#1b82cc 0%,#1168b4 45%,#0a4d93 100%)' }} />
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: WAVE_PATTERN, backgroundSize: '240px 110px' }}
          {...(reduceMotion ? {} : { animate: { backgroundPositionX: ['0px', '240px'] }, transition: { repeat: Infinity, duration: 24, ease: 'linear' } })}
        />
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 140px rgba(2,22,60,.55)' }} />

        <div ref={scrollRef} dir="ltr" className="absolute inset-0 overflow-auto flex">
          <div
            className="relative shrink-0 m-auto"
            style={{ width: MAP_W * scale, height: MAP_H * scale + (isMobile ? 130 : 0) }}
          >
            <div className="absolute left-0 top-0 origin-top-left" style={{ width: MAP_W, height: MAP_H, transform: `scale(${scale})` }} dir="ltr">
              {/* زخارف: بوصلة وسحب وطيور */}
              <svg className="absolute pointer-events-none" style={{ left: 28, top: 34 }} width="110" height="110" viewBox="-55 -55 110 110">
                <circle r="40" fill="#0b2f5e" fillOpacity=".55" stroke="#8fb8e8" strokeWidth="2" />
                <circle r="30" fill="none" stroke="#8fb8e8" strokeOpacity=".5" />
                <path d="M0 -38 L7 0 L0 38 L-7 0Z" fill="#cfe4ff" fillOpacity=".85" />
                <path d="M-38 0 L0 -7 L38 0 L0 7Z" fill="#8fb8e8" fillOpacity=".7" />
                <path d="M0 -38 L7 0 L-7 0Z" fill="#e5484d" />
                {[['N', 0, -46], ['S', 0, 52], ['E', 48, 4], ['W', -48, 4]].map(([t, x, y]) => (
                  <text key={t as string} x={x as number} y={y as number} textAnchor="middle" fontSize="11" fontWeight="800" fill="#dbeafe">{t}</text>
                ))}
              </svg>

              {[{ x: 840, y: 40, s: 1.2, d: 26 }, { x: 560, y: 70, s: 0.8, d: 32 }, { x: 960, y: 150, s: 0.7, d: 38 }].map((c, i) => (
                <motion.svg
                  key={i}
                  className="absolute pointer-events-none"
                  style={{ left: c.x, top: c.y }}
                  width={170 * c.s}
                  height={70 * c.s}
                  viewBox="0 0 170 70"
                  {...loop({ x: [0, 26, 0] }, c.d)}
                >
                  <g fill="#fff" opacity=".92">
                    <ellipse cx="50" cy="48" rx="46" ry="16" />
                    <circle cx="62" cy="30" r="22" />
                    <circle cx="94" cy="34" r="26" />
                    <ellipse cx="124" cy="48" rx="40" ry="15" />
                  </g>
                  <ellipse cx="85" cy="58" rx="70" ry="8" fill="#cfe4f7" opacity=".5" />
                </motion.svg>
              ))}

              <motion.svg className="absolute pointer-events-none" style={{ left: 470, top: 120 }} width="60" height="30" viewBox="0 0 60 30" {...loop({ x: [0, 14, 0], y: [0, -4, 0] }, 7)}>
                <path d="M2 16 Q10 4 18 14 Q24 4 32 16" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M34 22 Q40 14 46 21 Q51 14 57 23" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </motion.svg>

              {/* عناصر زخرفية */}
              <motion.img src={lighthouseRock} alt="" draggable={false} className="absolute pointer-events-none" style={{ left: 735, top: 30, width: 135 }} {...loop({ y: [0, -4, 0] }, 5.5)} />
              <motion.img src={boatImg} alt="" draggable={false} className="absolute pointer-events-none" style={{ left: 175, top: 42, width: 104 }} {...loop({ y: [0, -5, 0], rotate: [-1.5, 1.5, -1.5] }, 4.5)} />
              <motion.img src={sharkImg} alt="" draggable={false} className="absolute pointer-events-none" style={{ left: 300, top: 800, width: 62 }} {...loop({ x: [0, 22, 0] }, 9)} />

              {/* المسار الذهبي */}
              <svg className="absolute inset-0 pointer-events-none z-10" width={MAP_W} height={MAP_H} viewBox={`0 0 ${MAP_W} ${MAP_H}`}>
                <defs>
                  <filter id="tm-blur" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" />
                  </filter>
                </defs>
                {segments.map((s) => (
                  <g key={s.id}>
                    {s.done && <path d={s.d} fill="none" stroke="#ffd23f" strokeOpacity=".55" strokeWidth="22" strokeLinecap="round" filter="url(#tm-blur)" />}
                    <path d={s.d} fill="none" stroke={s.done ? '#9a6a08' : '#0b2f5e'} strokeOpacity={s.done ? 1 : 0.5} strokeWidth={s.done ? 17 : 14} strokeLinecap="round" strokeDasharray="0 27" />
                    <motion.path
                      d={s.d}
                      fill="none"
                      stroke={s.done ? '#ffd54a' : '#cfe4f7'}
                      strokeOpacity={s.done ? 1 : 0.8}
                      strokeWidth={s.done ? 12.5 : 10}
                      strokeLinecap="round"
                      strokeDasharray="0 27"
                      {...(s.done && !reduceMotion ? { animate: { strokeDashoffset: [0, -27] }, transition: { repeat: Infinity, duration: 2.2, ease: 'linear' } } : {})}
                    />
                    <path d={s.d} fill="none" stroke="#fff8c9" strokeOpacity={s.done ? 0.9 : 0} strokeWidth="4" strokeLinecap="round" strokeDasharray="0 27" transform="translate(-2 -2)" />
                  </g>
                ))}
              </svg>

              {/* الجزر والمراحل */}
              {ISLANDS.map((island) => {
                const unlocked = isUnlocked(island);
                const current = isCurrent(island);
                const isFinal = island.step === 57;
                const isStart = island.id === 1;
                // الجزيرة الأولى: أكيلا على منصته إن كان هو المكان الحالي، وإلا ميناء بمركب
                const art = isStart ? (current ? START_ART : BOAT_ART) : ART[island.id];
                const sc = isStart && current ? START_SCALE : ISLAND_SCALE;
                const boxW = art.w * sc;
                const boxH = art.h * sc;
                const ax = art.ax * sc;
                const ay = art.ay * sc;
                const cardLeft = art.cx * sc;
                const cardTop = art.cy * sc;
                const showMarker = current && !isStart;
                return (
                  <motion.button
                    key={island.id}
                    onClick={() => setSelectedIsland(island)}
                    aria-label={`${island.title} - خطوة ${island.step}`}
                    className={`absolute text-right group ${current ? 'z-30' : 'z-20'} hover:z-30`}
                    style={{ left: island.x - ax, top: island.y - ay, width: boxW, height: boxH }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.04 }}
                    transition={{ delay: island.id * 0.07, type: 'spring' }}
                  >
                    {/* توهج الجزيرة الحالية / الوجهة النهائية */}
                    {(current && !isStart) && (
                      <motion.div
                        className="absolute pointer-events-none rounded-full"
                        style={{ left: ax - 120, top: ay - 36, width: 240, height: 110, background: 'radial-gradient(ellipse,rgba(255,226,92,.75),rgba(255,200,40,0) 68%)' }}
                        {...loop({ opacity: [0.55, 1, 0.55], scale: [0.94, 1.06, 0.94] }, 2.2)}
                      />
                    )}
                    {isFinal && (
                      <motion.div className="absolute pointer-events-none rounded-full" style={{ left: ax - 190, top: ay - 190, width: 380, height: 360, background: 'radial-gradient(circle,rgba(255,230,120,.5),rgba(255,210,60,0) 62%)' }} {...loop({ opacity: [0.45, 1, 0.45] }, 3)} />
                    )}

                    <motion.div className="absolute inset-0" {...loop({ y: [0, -6, 0] }, 4 + (island.id % 3) * 0.7, island.id * 0.3)}>
                      <img
                        src={art.src}
                        alt=""
                        draggable={false}
                        className="absolute inset-0 w-full h-full drop-shadow-[0_12px_10px_rgba(0,25,70,.4)]"
                        style={{ filter: unlocked ? undefined : isFinal ? 'saturate(.9) brightness(.94)' : 'grayscale(.22) brightness(.94) saturate(.9)' }}
                      />
                    </motion.div>

                    {/* أكيلا فوق الجزيرة الحالية */}
                    {showMarker && (
                      <motion.div className="absolute z-40 pointer-events-none" style={{ left: isFinal ? ax - 150 : ax - 30, top: isFinal ? ay + 30 : ay + 8 }} {...loop({ y: [0, -6, 0] }, 2.6)}>
                        <div className="absolute rounded-full" style={{ left: -MARKER.feetX * MARKER.scale + 12, top: -22, width: 150, height: 44, border: '4px solid #ffd54a', boxShadow: '0 0 18px 4px rgba(255,214,64,.85), inset 0 0 14px rgba(255,214,64,.7)', background: 'radial-gradient(ellipse,rgba(255,236,150,.55),rgba(120,160,40,.35))', transform: 'translateX(-4px)' }} />
                        <img
                          src={MARKER.src}
                          alt="أكيلا"
                          draggable={false}
                          className="absolute max-w-none"
                          style={{ width: MARKER.w * MARKER.scale, height: MARKER.h * MARKER.scale, left: -MARKER.feetX * MARKER.scale, top: -MARKER.feetY * MARKER.scale + 2, filter: 'drop-shadow(0 6px 5px rgba(0,20,50,.45))' }}
                        />
                      </motion.div>
                    )}

                    {/* أنت هنا */}
                    {current && (
                      <div
                        className="absolute z-50 px-6 py-1 rounded-xl text-sm font-black text-[#fff4c9] border-2 shadow-lg whitespace-nowrap"
                        style={isStart ? { left: 101 * sc, top: 488 * sc, background: 'linear-gradient(180deg,#1c6a3a,#0f3d22)', borderColor: GOLD } : { left: cardLeft + 4, top: cardTop - 30, background: 'linear-gradient(180deg,#1c6a3a,#0f3d22)', borderColor: GOLD }}
                        dir="rtl"
                      >
                        أنت هنا
                      </div>
                    )}

                    {/* بطاقة المرحلة */}
                    <div
                      dir="ltr"
                      className="absolute flex items-center gap-2 rounded-2xl border-2 py-1.5 pl-1.5 pr-3 transition-shadow"
                      style={{
                        left: isStart && current ? art.cx * sc : cardLeft,
                        top: isStart && current ? art.cy * sc : cardTop,
                        background: isFinal && unlocked ? 'linear-gradient(180deg,#ffe98a,#f5c93a)' : `linear-gradient(180deg,#fffaf0,${CREAM})`,
                        borderColor: unlocked ? GOLD : '#7b6a47',
                        opacity: unlocked ? 1 : 0.9,
                        boxShadow: current
                          ? '0 0 0 3px rgba(255,214,64,.55),0 0 22px rgba(255,214,64,.85),0 6px 12px rgba(0,0,0,.35)'
                          : '0 5px 10px rgba(0,0,0,.35)',
                      }}
                    >
                      <span
                        className="relative w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-black text-lg border-[3px]"
                        style={{
                          color: unlocked ? '#ffeaa0' : '#cbd5e1',
                          borderColor: unlocked ? GOLD : '#64748b',
                          background: unlocked ? 'radial-gradient(circle at 35% 30%,#2f7a43,#0f3d22)' : 'radial-gradient(circle at 35% 30%,#475569,#1e293b)',
                        }}
                      >
                        {island.step}
                        {unlocked && !current && <CheckCircle2 className="absolute -bottom-1.5 -right-1.5 text-green-600 bg-white rounded-full" size={17} />}
                        {!unlocked && <Lock className="absolute -bottom-1.5 -right-1.5 p-[3px] text-[#ffe9a3] bg-[#14301f] border border-[#d7a62b] rounded-full" size={18} />}
                      </span>
                      <span dir="rtl" className="text-right leading-tight whitespace-nowrap">
                        <b className="block text-sm font-black text-[#3b2a14]">{island.title}</b>
                        <small className="block text-[11px] font-bold text-[#6b5a3a]">{isFinal ? 'الخطوة الأخيرة' : `خطوة ${island.step}`}</small>
                      </span>
                    </div>
                  </motion.button>
                );
              })}

              {/* قلعة الكنز: نص الوجهة النهائية (كان شريط قلعة الكنز السفلي) */}
              <div
                dir="rtl"
                className="absolute z-20 px-4 py-1.5 rounded-xl border-2 text-xs font-black text-[#3b2a14] shadow-lg text-center"
                style={{ left: 390, top: 812, width: 320, background: 'linear-gradient(180deg,#fff3b8,#f2cf5b)', borderColor: GOLD }}
              >
                🏰 افتح جميع الجزر واجمع الشارات لتحصل على لقب <span className="text-[#8a5a00]">الشبل الأول ⚜️</span>
              </div>
            </div>
          </div>
        </div>

        {/* زر الصوت (واجهة فقط) */}
        <div className="absolute top-3 right-3 z-40">
          <RoundBtn onClick={() => setSoundOn((v) => !v)} title={soundOn ? 'كتم الصوت' : 'تشغيل الصوت'}>
            {soundOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
          </RoundBtn>
        </div>

        {/* بطاقة الشبل والتقدم */}
        <div
          dir="rtl"
          className="hidden sm:block absolute bottom-3 left-3 z-40 rounded-2xl border-2 px-4 py-3 shadow-xl w-60"
          style={{ background: `linear-gradient(180deg,#fffaf0,${CREAM})`, borderColor: GOLD }}
        >
          <p className="font-black text-[#0f3d22] text-sm truncate">{cubName}</p>
          <p className="text-[11px] font-bold text-[#6b5a3a] mb-2 truncate">جزيرته الحالية: {currentIsland.title}</p>
          <div className="flex justify-between text-[11px] font-black text-[#6b5a3a] mb-1"><span>{progressPercent}%</span><span>التقدم</span></div>
          <div className="h-3 rounded-full bg-[#d8c99c] overflow-hidden border border-[#b8892b]/60">
            <motion.div className="h-full" style={{ background: 'linear-gradient(90deg,#ffd23f,#4caf50)' }} initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.8 }} />
          </div>
        </div>

        {/* نصيحة أكيلا */}
        <div
          dir="rtl"
          className="absolute bottom-3 right-3 z-40 flex items-center gap-3 rounded-2xl border-2 p-2.5 sm:p-3 shadow-xl w-[min(330px,68vw)]"
          style={{ background: 'linear-gradient(180deg,#f7f3ea,#e9e4d6)', borderColor: '#d9d2bd' }}
        >
          <div
            className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-white shadow-md"
            style={{ backgroundColor: '#dbe7f0', backgroundImage: `url(${akelaMarker})`, backgroundSize: '244px auto', backgroundPosition: '-54px -12px', backgroundRepeat: 'no-repeat' }}
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-black text-[#1f5f33] text-sm">نصيحة أكيلا</h4>
            <p className="font-black text-slate-800 text-[11px] sm:text-xs">كن شجاعاً، متعاوناً، ملتزماً</p>
            <p className="font-bold text-slate-600 text-[10px] sm:text-[11px] leading-snug">كل خطوة تقربك من أن تصبح شبلاً حقيقياً!</p>
          </div>
          <span className="hidden sm:block text-[#2f7d3a] text-2xl">🐾</span>
        </div>
      </div>

      {/* ═════════ تفاصيل المرحلة ═════════ */}
      <AnimatePresence>
        {selectedIsland && (
          <motion.div className="fixed inset-0 z-[300] bg-[#031a3a]/70 backdrop-blur-sm flex items-center justify-center p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedIsland(null)}>
            <motion.div
              className="max-w-md w-full rounded-[30px] overflow-hidden shadow-2xl border-4 text-right"
              style={{ background: `linear-gradient(180deg,#fffaf0,${CREAM})`, borderColor: GOLD }}
              initial={{ scale: 0.85, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 40 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 p-5" style={{ background: `linear-gradient(180deg,#1c6a3a,${GREEN_DARK})` }}>
                <div className="w-20 h-20 shrink-0 rounded-full flex items-center justify-center text-5xl shadow-lg border-4" style={{ backgroundColor: isUnlocked(selectedIsland) ? selectedIsland.color : '#64748b', borderColor: GOLD }}>
                  {isUnlocked(selectedIsland) ? selectedIsland.icon : '🔒'}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#ffe9a3]">{selectedIsland.title}</h2>
                  <p className="font-black text-[#e8f5e9] text-sm">{selectedIsland.subtitle} • خطوة {selectedIsland.step}</p>
                </div>
              </div>

              <div className="space-y-3 p-5">
                <div className="rounded-3xl p-4 border-2 border-[#cfe0f2] bg-[#eef6fd]">
                  <div className="flex items-center gap-2 font-black text-[#0f3d22] mb-2"><Flag size={18} />التحدي</div>
                  <p className="font-bold text-slate-700 leading-relaxed">{isUnlocked(selectedIsland) ? selectedIsland.challenge : 'هذه الجزيرة مغلقة الآن. أكمل الخطوات السابقة لتفتحها.'}</p>
                </div>

                <div className="rounded-3xl p-4 border-2 border-[#ecd48e] bg-[#fff6d6]">
                  <div className="flex items-center gap-2 font-black text-yellow-800 mb-2"><Gem size={18} />المكافأة</div>
                  <p className="font-bold text-slate-700">{selectedIsland.reward}</p>
                </div>

                {isCurrent(selectedIsland) && (
                  <div className="rounded-3xl p-4 border-2 border-green-200 bg-green-50">
                    <div className="flex items-center gap-2 font-black text-green-700"><Sparkles size={18} />هذه هي محطتك الحالية يا بطل!</div>
                  </div>
                )}

                <button onClick={() => setSelectedIsland(null)} className="w-full rounded-2xl py-3 font-black text-[#ffe9a3] border-2 transition hover:brightness-110 active:scale-[.98]" style={{ background: `linear-gradient(180deg,#1c6a3a,${GREEN_DARK})`, borderColor: GOLD }}>
                  إغلاق
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TreasureAdventureMap;
