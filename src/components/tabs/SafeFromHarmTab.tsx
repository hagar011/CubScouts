import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Flame, ShieldAlert, Heart, Smile, Info, BookOpen } from 'lucide-react';
import { UserRole, Cub } from '../../types';
import { SAFE_FROM_HARM_SCENARIOS } from '../../constants/scoutData';

interface SafeFromHarmTabProps {
  role: UserRole;
  activeCub: Cub | null;
  onAddPoints?: (cubId: string, pts: number) => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function SafeFromHarmTab({ role, activeCub, onAddPoints, showToast }: SafeFromHarmTabProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, { optionIdx: number; isCorrect: boolean }>>({});
  const [completedScenarios, setCompletedScenarios] = useState<Set<string>>(new Set());

  const handleAnswerSelect = async (scenarioId: string, optionIdx: number, isCorrect: boolean) => {
    // Only register answer if not already submitted
    if (selectedAnswers[scenarioId]) return;

    setSelectedAnswers({
      ...selectedAnswers,
      [scenarioId]: { optionIdx, isCorrect }
    });

    if (isCorrect) {
      setCompletedScenarios(prev => {
        const next = new Set(prev);
        next.add(scenarioId);
        return next;
      });

      // Award points if logged in as cub
      if (role === UserRole.CUB && activeCub && onAddPoints) {
        try {
          await onAddPoints(activeCub.id, 15);
          showToast('أحسنت يا بطل! حصلت على 15 نقطة لتصرفك السليم والدخول الآمن! 🌟', 'success');
        } catch (err) {
          console.error(err);
        }
      } else {
        showToast('إجابة صحيحة وتصرف رائد للغاية! الكشاف أخ للكشاف ويبحث عن الأمان دائماً.', 'success');
      }
    } else {
      showToast('انتبه! ليس هذا أفضل خيار للأمان. تفكر جيداً وحاول الاختيار مجدداً 🛡️', 'warning');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-350 text-right font-sans" dir="rtl">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-700 text-white rounded-3xl p-6 md:p-8 shadow-xl border-4 border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none scale-150 rotate-12">
          <ShieldCheck size={120} />
        </div>
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🛡️</span>
            <div>
              <span className="text-[10px] bg-white/20 px-3 py-0.5 rounded-full block text-white/90">الحماية من الأذى والمخاطر للأشبال والقادة (Safe from Harm)</span>
              <h2 className="text-xl font-black mt-1">ركن المعسكر والبيئة الآمنة</h2>
            </div>
          </div>
          <p className="text-xs md:text-sm font-bold opacity-90 leading-relaxed max-w-2xl">
            سلامتكم هي أولويتنا الكبرى. توفر الحركة الكشفية دليلاً تفاعلياً مبسطاً لتعليم رفاقنا الأبطال كيف يحافظون على سلامتهم الجسدية والرقمية ومكافحة التنمر لبناء معسكر يسوده الفرح والتعاون الكشفي.
          </p>
        </div>
      </div>

      {/* Safety Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { 
            title: 'السلامة الشخصية بالخلاء 🌲', 
            icon: '⛺', 
            desc: 'ابقَ دوماً مع الفرقة الكشفية، ولا تغادر المخيم بمفردك دون إذن مسبق من القائد الحكيم، لتظل سداسيتك آمنة ومترابطة.' 
          },
          { 
            title: 'دِرع مكافحة التنمر والرعاية 🤝', 
            icon: '❤️', 
            desc: 'الكشاف أخ للكشاف. لا نسخر من تعثر زملائنا، بل نمسك بأيديهم، وننشر الكلمة الودودة لنكون قدوة أخلاقية دائماً.' 
          },
          { 
            title: 'أمان العالم الرقمي والأنترنت 💻', 
            icon: '🔒', 
            desc: 'لا تشارك كلمات المرور الخاصة بك أو بيانات بيتك مع الغرباء، وفي حال واجهت أمراً غامضاً أخبر أهلك أو معلمك فوراً.' 
          }
        ].map((item, i) => (
          <div key={i} className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-3xl bg-slate-50 h-12 w-12 flex items-center justify-center rounded-2xl border">{item.icon}</span>
              <h4 className="font-black text-sm text-slate-800">{item.title}</h4>
            </div>
            <p className="text-[10px] text-slate-500 font-bold leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Interactive scenarios Title */}
      <div className="space-y-1">
        <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5">
          <span>🎯</span> تحديات الأمان التفاعلية للأشبال (اختبر ذكاء الأمان لديك)
        </h3>
        <p className="text-xs text-slate-400 font-semibold">
          اقرأ المواقف الحقيقية في المخيم، واختر التصرف الكشفي الأسلم لتفوز بنقاط الأمان المعتمدة!
        </p>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SAFE_FROM_HARM_SCENARIOS.map((scenario) => {
          const answer = selectedAnswers[scenario.id];
          return (
            <div key={scenario.id} className="bg-white border-2 border-slate-100 rounded-[32px] p-6 shadow-sm space-y-4">
              <span className="text-xs bg-[#e2f0d9] text-[#385723] px-3 py-1 rounded-full font-black border border-[#c5e0b4]">
                موقف: {scenario.title}
              </span>
              <p className="text-xs font-black text-slate-800 leading-relaxed mt-2 p-3 bg-slate-50 rounded-2xl border">
                {scenario.question}
              </p>

              {/* Options */}
              <div className="space-y-2">
                {scenario.options.map((option, idx) => {
                  const isChosen = answer?.optionIdx === idx;
                  let btnStyle = 'bg-white border-slate-200 hover:border-slate-300';
                  if (isChosen) {
                    btnStyle = option.isCorrect 
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-800' 
                      : 'bg-red-50 border-red-300 text-red-700';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSelect(scenario.id, idx, option.isCorrect)}
                      disabled={!!answer && answer.isCorrect}
                      className={`w-full text-right p-4 rounded-xl border-2 transition-all flex items-center justify-between text-xs font-bold gap-3 ${btnStyle}`}
                    >
                      <span>{option.text}</span>
                      {isChosen ? (
                        option.isCorrect ? <ShieldCheck className="text-emerald-500" size={18} /> : <ShieldAlert className="text-red-500" size={18} />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {answer && answer.isCorrect && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs font-bold text-emerald-800 flex items-start gap-2.5 animate-in slide-in-from-bottom-2 duration-300"
                  >
                    <Info size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold text-emerald-950">أحسنت الاختيار!</p>
                      <p className="text-[11px] leading-relaxed mt-0.5">{scenario.feedback}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Code of conduct footer note */}
      <div className="p-6 bg-slate-900 text-white rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h4 className="text-sm font-black text-emerald-400">يثق بكم الكبار يا أبطال 🛡️</h4>
          <p className="text-[10px] opacity-70 mt-1 leading-normal">الأشبال دائماً يسيرون وفق مدونة السلوك الكشفية الصارمة لحماية الأطفال من التنمر أو الإهمال لضمان مجتمع واعد.</p>
        </div>
      </div>
    </div>
  );
}
