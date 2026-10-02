import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Map as MapIcon,
  Flag,
  Star,
  Anchor,
  Waves,
  Trees as Tree,
  Ship,
  Compass,
  Gift,
  User,
  TrendingUp,
  Layout,
  Maximize2,
} from 'lucide-react';
import { Cub } from '../types';

type JourneyTab = 'map' | 'profile' | 'progress' | 'tasks';

interface JourneyMapProps {
  cub?: Cub | null;
  cubs?: Cub[];
  activeCubId?: string;
  onClose?: () => void;
}

const AKELA_TIPS = [
  'تعاون مع سداسيك لتحقيق النصر!',
  'تذكر دائماً: كن مستعداً!',
  'النظافة من الإيمان، حافظ على بيئتك.',
  'الصدق هو شيمة الكشاف الحقيقي.',
  'ساعد الصغار واحترم الكبار.',
];

const PATH_D =
  'M 150 150 C 450 100 650 350 450 650 S 750 950 350 1250 S 650 1550 250 1850';

const JourneyMap: React.FC<JourneyMapProps> = ({
  cub,
  cubs = [],
  activeCubId,
  onClose,
}) => {
  const pathRef = useRef<SVGPathElement>(null);

  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [activeTab, setActiveTab] = useState<JourneyTab>('map');
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [randomTip] = useState(
    AKELA_TIPS[Math.floor(Math.random() * AKELA_TIPS.length)]
  );

  const activeCub = cub || cubs.find((c) => c.id === activeCubId) || null;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!pathRef.current) return;

      const length = pathRef.current.getTotalLength();
      if (length === 0) return;

      const newPoints: { x: number; y: number }[] = [];
      const totalSteps = 57;

      for (let i = 0; i <= totalSteps; i += 1) {
        const point = pathRef.current.getPointAtLength((i / totalSteps) * length);
        newPoints.push({ x: point.x, y: point.y });
      }

      setPoints(newPoints);
    }, 50);

    return () => window.clearTimeout(timer);
  }, []);

  if (!activeCub) {
    return (
      <div className="fixed inset-0 z-[200] bg-white flex items-center justify-center text-center font-black text-slate-500">
        لا يوجد شبل محدد لعرض خريطة المغامرة.
      </div>
    );
  }

  const currentStep = Math.min(Math.max(activeCub.currentStep || 1, 1), 57);

  const getStepColor = (step: number) => {
    if (step <= 20) return '#f97316';
    if (step <= 39) return '#16a34a';
    return '#2563eb';
  };

  const getLevelName = (step: number) => {
    if (step <= 20) return 'مرحلة المبتدئ';
    if (step <= 39) return 'مرحلة الثاني';
    return 'مرحلة الأول';
  };

  const isPresentationStep = (step: number) => [18, 37, 57].includes(step);

  const presentationNeeded =
    isPresentationStep(currentStep) &&
    Boolean((activeCub as Cub & { pendingPromotionStep?: number }).pendingPromotionStep);

  const cubName = activeCub.name || 'الشبل';

  const renderMap = () => (
    <div
      className="relative pt-24 pb-48"
      style={{ width: '800px', height: '2200px', margin: '0 auto' }}
    >
      <div className="absolute top-40 left-10 text-[#8b4513]/20">
        <Anchor size={80} />
      </div>

      <div className="absolute top-[600px] right-20 text-[#8b4513]/15">
        <Ship size={120} />
      </div>

      <div className="absolute top-[1100px] left-40 text-[#8b4513]/20 rotate-45">
        <Compass size={60} />
      </div>

      <div className="absolute bottom-[400px] right-20 text-[#8b4513]/10">
        <Waves size={100} />
      </div>

      <div className="absolute top-10 right-10 z-10">
        <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 via-yellow-600 to-yellow-800 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/30 ring-4 ring-yellow-600/20 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
            <Star fill="currentColor" className="w-full h-full scale-110" />
          </div>

          <div className="text-center">
            <span className="text-4xl block leading-none">🦁</span>
            <p className="text-[8px] font-black text-white uppercase mt-1">
              شعار الأشبال
            </p>
          </div>

          <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-blue-900 text-xs font-bold transform -rotate-12">
            ⚜️
          </div>

          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-blue-900 text-xs font-bold transform rotate-12">
            ⚜️
          </div>
        </div>
      </div>

      <svg
        width="800"
        height="2200"
        viewBox="0 0 800 2200"
        className="absolute inset-0"
      >
        <path
          ref={pathRef}
          d={PATH_D}
          fill="none"
          stroke="#8b4513"
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray="1 30"
          className="opacity-30"
        />

        {points.map((pt, i) => {
          const stepNum = i;
          if (stepNum === 0) return null;

          const isCompleted = currentStep > stepNum;
          const isActive = currentStep === stepNum;
          const color = getStepColor(stepNum);

          return (
            <g key={stepNum}>
              <circle
                cx={pt.x}
                cy={pt.y + 3}
                r={isActive ? 18 : 12}
                fill="rgba(60,30,10,0.2)"
              />

              <motion.circle
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                transition={{ delay: i * 0.01 }}
                onClick={() => setSelectedStep(stepNum)}
                cx={pt.x}
                cy={pt.y}
                r={isActive ? 18 : 12}
                fill={isCompleted || isActive ? color : 'rgba(139,69,19,0.1)'}
                stroke={isActive ? 'white' : '#8b4513'}
                strokeWidth={isActive ? 4 : 1}
                className="cursor-pointer"
              />

              <text
                x={pt.x}
                y={pt.y + 4}
                textAnchor="middle"
                fill={isActive || isCompleted ? 'white' : '#8b4513'}
                opacity={isActive || isCompleted ? 1 : 0.4}
                fontSize={isActive ? 12 : 8}
                fontWeight={900}
                pointerEvents="none"
              >
                {stepNum}
              </text>

              {stepNum === 20 && (
                <foreignObject x={pt.x - 20} y={pt.y - 60} width={40} height={40}>
                  <div title="رتبة المبتدئ" className="text-orange-600">
                    <Flag fill="currentColor" size={32} />
                  </div>
                </foreignObject>
              )}

              {stepNum === 39 && (
                <foreignObject x={pt.x - 20} y={pt.y - 60} width={40} height={40}>
                  <div title="كشاف ثاني" className="text-green-600">
                    <Tree fill="currentColor" size={32} />
                  </div>
                </foreignObject>
              )}

              {stepNum === 57 && (
                <foreignObject x={pt.x - 25} y={pt.y - 65} width={50} height={50}>
                  <div title="نهاية الرحلة" className="text-yellow-600 animate-pulse">
                    <span className="text-4xl">🎁</span>
                  </div>
                </foreignObject>
              )}
            </g>
          );
        })}

        {points[currentStep] && (
          <motion.g
            initial={false}
            animate={{
              x: points[currentStep].x,
              y: points[currentStep].y,
            }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          >
            <foreignObject
              x={-60}
              y={-140}
              width={120}
              height={150}
              className="overflow-visible"
            >
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="mb-1"
                >
                  <div className="bg-white/90 backdrop-blur-sm p-1 rounded-full shadow-lg border-2 border-orange-500">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />
                  </div>
                </motion.div>

                <motion.div
                  animate={{ rotate: [-3, 3, -3] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="relative w-24 h-24"
                >
                  <div className="relative w-full h-full bg-white rounded-full border-4 border-[#1a237e] shadow-[0_10px_30px_rgba(0,0,0,0.3)] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-200 to-white" />
                    <div className="absolute top-0 w-full h-10 bg-[#1a237e] rounded-b-2xl" />
                    <span className="relative z-10 text-6xl">👦</span>
                  </div>

                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-600 w-5 h-5 rounded-full border-2 border-white shadow-lg z-20" />

                  <div className="absolute top-0 right-0 bg-yellow-400 text-blue-900 w-8 h-8 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-sm font-black z-30">
                    ⚜️
                  </div>
                </motion.div>

                <div className="mt-3 bg-[#1a237e] text-white px-5 py-1.5 rounded-full text-[12px] font-black shadow-2xl ring-2 ring-white whitespace-nowrap">
                  {cubName}
                </div>
              </div>
            </foreignObject>
          </motion.g>
        )}
      </svg>

      {points[57] && (
        <div
          style={{ left: points[57].x - 40, top: points[57].y - 80 }}
          className="absolute group"
        >
          <div className="relative">
            <div className="absolute -inset-4 bg-yellow-400/30 blur-2xl rounded-full animate-pulse group-hover:bg-yellow-400/50 transition-all" />

            <div className="relative bg-gradient-to-br from-yellow-700 to-yellow-900 p-3 rounded-2xl border-4 border-yellow-500 shadow-2xl transform rotate-3 group-hover:rotate-0 transition-transform">
              <span className="text-4xl">📦</span>
              <p className="text-[10px] font-black text-yellow-100 text-center uppercase tracking-tighter mt-1">
                نهاية الرحلة
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPanel = () => {
    if (activeTab === 'profile') {
      return (
        <div className="max-w-xl mx-auto mt-20 bg-white/95 p-8 rounded-[32px] shadow-2xl border-4 border-[#ffd700] text-right">
          <h3 className="text-2xl font-black text-[#1a237e] mb-4">
            الحساب الشخصي
          </h3>
          <p className="font-black text-slate-700 mb-2">الاسم: {cubName}</p>
          <p className="font-black text-slate-700 mb-2">
            المرحلة: {getLevelName(currentStep)}
          </p>
          <p className="font-black text-slate-700">
            الخطوة الحالية: {currentStep} من 57
          </p>
        </div>
      );
    }

    if (activeTab === 'progress') {
      return (
        <div className="max-w-xl mx-auto mt-20 bg-white/95 p-8 rounded-[32px] shadow-2xl border-4 border-green-500 text-right">
          <h3 className="text-2xl font-black text-green-700 mb-4">
            تقدم الشبل
          </h3>

          <div className="h-5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 rounded-full"
              style={{ width: `${(currentStep / 57) * 100}%` }}
            />
          </div>

          <p className="mt-4 font-black text-slate-700">
            أنجز {currentStep} خطوة من أصل 57 خطوة.
          </p>
        </div>
      );
    }

    if (activeTab === 'tasks') {
      return (
        <div className="max-w-xl mx-auto mt-20 bg-white/95 p-8 rounded-[32px] shadow-2xl border-4 border-orange-500 text-right">
          <h3 className="text-2xl font-black text-orange-700 mb-4">المهام</h3>
          <p className="font-bold text-slate-600">
            أكمل نشاطك الحالي مع السداسي، ثم انتظر اعتماد القائد للانتقال للخطوة التالية.
          </p>
        </div>
      );
    }

    return renderMap();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#2c1e14] flex flex-col overflow-hidden font-sans select-none">
      <div className="h-16 bg-[#ffd700] flex items-center justify-between px-6 shadow-md z-[60] border-b-4 border-[#b8860b]">
        <div className="flex items-center gap-3">
          <div className="bg-[#1a237e] p-1.5 rounded-lg text-white shadow-inner">
            <span className="font-black text-[10px] tracking-tighter">
              SCOUTS
            </span>
          </div>

          <h2 className="text-base font-black text-[#1a237e] tracking-tight">
            مغامرة شبل الكشافة - خريطة مغامرة الأشبال: مصر
          </h2>
        </div>

        <button
          onClick={onClose}
          className="p-2 bg-[#1a237e] text-white rounded-lg hover:bg-[#283593] transition-all shadow-lg active:scale-95"
          title="إغلاق"
        >
          <Maximize2 size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-auto relative scrollbar-hide bg-[#f3e5ab] bg-[url('https://www.transparenttextures.com/patterns/pvc-map.png')]">
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(139,69,19,0.2)_100%)]" />
        {renderPanel()}
      </div>

      <AnimatePresence>
        {selectedStep !== null && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-28 left-6 z-[90] bg-white p-5 rounded-3xl shadow-2xl border-2 border-yellow-400 max-w-xs"
          >
            <h3 className="font-black text-sm text-blue-900">
              محطة رقم {selectedStep}
            </h3>

            <p className="text-xs font-bold text-slate-500 mt-2">
              {selectedStep < currentStep
                ? 'أحسنت! لقد أنهيت هذه المحطة بنجاح.'
                : selectedStep === currentStep
                  ? 'هذه محطتك الحالية. أكمل المطلوب لتتقدم في الرحلة.'
                  : 'هذه محطة قادمة، استعد لها قريبًا.'}
            </p>

            {isPresentationStep(selectedStep) && (
              <p className="text-xs font-black text-yellow-700 bg-yellow-50 mt-3 p-2 rounded-xl">
                هذه محطة ترقية مهمة.
              </p>
            )}

            <button
              onClick={() => setSelectedStep(null)}
              className="mt-3 px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-black"
            >
              إغلاق
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-24 right-6 z-[70] max-w-[280px] transition-all animate-in slide-in-from-right duration-500">
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-[28px] shadow-2xl border-2 border-[#8b4513]/20 flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center border-2 border-white shadow-lg overflow-hidden">
              <span className="text-4xl transform -scale-x-100">🐺</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-lg" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-black text-slate-800 text-xs">قائد أكيلا</h4>
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 rounded-full">
                متصل
              </span>
            </div>

            <p className="text-[10px] font-bold text-slate-500 italic leading-snug">
              &quot;نصيحة اليوم: {randomTip}&quot;
            </p>
          </div>
        </div>
      </div>

      <div className="h-20 bg-white border-t border-slate-200 flex items-center justify-around px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-[60]">
        {[
          { id: 'map' as const, label: 'الخريطة', icon: MapIcon },
          { id: 'profile' as const, label: 'الحساب الشخصي', icon: User },
          { id: 'progress' as const, label: 'التقدم', icon: TrendingUp },
          { id: 'tasks' as const, label: 'المهام', icon: Layout },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === item.id ? 'text-[#1a237e] scale-110' : 'text-slate-400'
              }`}
          >
            <div
              className={`p-2 rounded-xl transition-all ${activeTab === item.id ? 'bg-[#1a237e]/10' : 'bg-transparent'
                }`}
            >
              <item.icon size={22} strokeWidth={activeTab === item.id ? 3 : 2} />
            </div>

            <span className="text-[10px] font-black">{item.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {presentationNeeded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed inset-x-6 bottom-32 z-[80] p-6 bg-gradient-to-br from-[#1a237e] to-[#0d1642] text-white rounded-[32px] shadow-2xl border-4 border-[#ffd700] overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150">
              <Compass size={120} fill="currentColor" />
            </div>

            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
                <Gift size={32} className="text-[#ffd700]" />
              </div>

              <div>
                <h3 className="text-xl font-black mb-1">
                  توقف! حفل القبول مرتقب
                </h3>

                <p className="text-xs font-bold leading-relaxed opacity-90">
                  أهلاً يا بطل {cubName}، لقد وصلت لمحطة تقييم هامة، استعد للعرض
                  التقديمي لتنال ترقية القائد!
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JourneyMap;
