import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClipboardCheck, Star, Users, CheckCircle, Flame, Calendar, Award } from 'lucide-react';
import { Cub, EvaluationCriteria, ConductCriteria, CubLevel, UserRole } from '../../types';
import { CURRICULUM_FIELDS, CONDUCT_FIELDS } from '../../constants/scoutData';

interface EvaluateTabProps {
  cubs: Cub[];
  onUpdateEvaluation: (
    id: string, criteria: EvaluationCriteria, conduct?: ConductCriteria,
    level?: CubLevel, sextetId?: string, date?: string,
    overrideLastChecked?: string, earnedPoints?: number
  ) => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  setView: (view: any) => void;
  /** اختياري: شبل محدد مسبقًا (يأتي من أزرار لوحة القائد). */
  initialCubId?: string;
}

export default function EvaluateTab({ cubs, onUpdateEvaluation, showToast, setView, initialCubId }: EvaluateTabProps) {
  const [selectedCubId, setSelectedCubId] = useState(initialCubId || '');
  const [evaluationDate, setEvaluationDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeSubTab, setActiveSubTab] = useState<'curriculum' | 'conduct'>('curriculum');
  const [searchQuery, setSearchQuery] = useState('');

  // Draft ratings inside evaluation state
  const [criteriaScores, setCriteriaScores] = useState<Record<string, number>>({
    religion: 5, discovery: 5, talents: 5, health: 5, family: 5,
    nation: 5, world: 5, scouting: 5, artistic: 5
  });

  const [conductScores, setConductScores] = useState<Record<string, number>>({
    uniform: 5, punctuality: 5, tasks: 5, prayer: 5, behavior: 5
  });

  const [bonusPoints, setBonusPoints] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prefill when selected cub changes
  useEffect(() => {
    if (selectedCubId) {
      const selectedCub = cubs.find(c => c.id === selectedCubId);
      if (selectedCub) {
        if (selectedCub.evaluation) {
          setCriteriaScores({
            religion: selectedCub.evaluation.religion || 5,
            discovery: selectedCub.evaluation.discovery || 5,
            talents: selectedCub.evaluation.talents || 5,
            health: selectedCub.evaluation.health || 5,
            family: selectedCub.evaluation.family || 5,
            nation: selectedCub.evaluation.nation || 5,
            world: selectedCub.evaluation.world || 5,
            scouting: selectedCub.evaluation.scouting || 5,
            artistic: selectedCub.evaluation.artistic || 5
          });
        }
        if (selectedCub.conduct) {
          setConductScores({
            uniform: selectedCub.conduct.uniform || 5,
            punctuality: selectedCub.conduct.punctuality || 5,
            tasks: selectedCub.conduct.tasks || 5,
            prayer: selectedCub.conduct.prayer || 5,
            behavior: selectedCub.conduct.behavior || 5
          });
        }
      }
    }
  }, [selectedCubId, cubs]);

  const handleScoreChange = (fieldId: string, score: number, type: 'curriculum' | 'conduct') => {
    if (type === 'curriculum') {
      setCriteriaScores(prev => ({ ...prev, [fieldId]: score }));
    } else {
      setConductScores(prev => ({ ...prev, [fieldId]: score }));
    }
  };

  const handleApplyEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCubId) {
      showToast('يرجى اختيار شبل لتقييمه أولاً!', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedCub = cubs.find(c => c.id === selectedCubId);
      if (!selectedCub) return;

      // Call raw Firestore update trigger
      await onUpdateEvaluation(
        selectedCubId,
        criteriaScores as unknown as EvaluationCriteria,
        conductScores as unknown as ConductCriteria,
        selectedCub.level,
        selectedCub.sextetId || '',
        evaluationDate,
        evaluationDate,
        Number(bonusPoints)
      );

      showToast(`تم تحديث تقييم ورصد الشبل "${selectedCub.name}" بنجاح!`, 'success');
      setView('dashboard');
    } catch (err) {
      showToast('فشل في رصد التقييمات يرجى التحقق من المدخلات.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter cubs by name search
  const filteredCubs = cubs.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-350 text-right font-sans" dir="rtl">
      <div className="rounded-[30px] bg-gradient-to-r from-scout-blue via-blue-700 to-scout-green px-5 py-4 text-white shadow-[0_18px_40px_rgba(37,99,235,0.22)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black tracking-[0.24em] text-blue-100">EVALUATION</p>
            <h2 className="mt-1 text-xl font-black">منصة تقييم الأشبال</h2>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
            <ClipboardCheck className="text-scout-yellow" size={22} />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <ClipboardCheck className="text-scout-blue animate-pulse" size={24} /> منصة رصد التقييمات والتحفيز السلوكي للأشبال
        </h2>
        <p className="text-xs text-slate-500 font-bold mt-2">بصفتك القائد المربي الحكيم، يمكنك تثبيت نقاط الأنشطة وتقييم سلوكيات غابة الأشبال يوماً بيوم.</p>
      </div>

      <form onSubmit={handleApplyEvaluation} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 bg-white p-6 rounded-[32px] border border-slate-200 space-y-4 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">١. تحديد المستفيد وتفاصيل الجلسة</h3>

          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-500">البحث السريع عن شبل</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="اكتب اسم الشبل المبحوث عنه..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-scout-blue rounded-xl py-2 px-3 font-semibold text-xs outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-500 block mb-1">اختر الشبل المراد تقييمه</label>
            <select
              required
              value={selectedCubId}
              onChange={(e) => setSelectedCubId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-scout-blue rounded-xl py-3 px-3 font-bold text-xs outline-none"
            >
              <option value="">-- حدد الشبل --</option>
              {filteredCubs.map((cub) => (
                <option key={cub.id} value={cub.id}>
                  {cub.name} - سداسي {cub.sextetId || 'غير محدد'}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-500 block mb-1">تاريخ رصد التقييم</label>
            <div className="relative">
              <input
                type="date"
                required
                value={evaluationDate}
                onChange={(e) => setEvaluationDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-scout-blue rounded-xl py-2.5 px-3 font-bold text-xs outline-none"
              />
            </div>
          </div>

          <div className="space-y-1 pt-4 border-t">
            <label className="text-[11px] font-black text-slate-500 block mb-1">نقاط الحافز المكتسبة عن الجلسة</label>
            <input
              type="number"
              min={0}
              max={100}
              required
              value={bonusPoints}
              onChange={(e) => setBonusPoints(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 focus:border-scout-blue rounded-xl py-3 px-3 font-bold text-xs outline-none"
            />
            <span className="text-[9px] text-slate-400 font-bold block mt-1">
              سيتم إضافة هذه النقاط تلقائياً لرصيد الشبل بعد اعتماد التقييم.
            </span>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-[32px] border border-slate-200 space-y-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
          <div className="flex border-b pb-2 gap-4">
            <button
              type="button"
              onClick={() => setActiveSubTab('curriculum')}
              className={`pb-2.5 border-b-4 font-black text-xs transition-all ${
                activeSubTab === 'curriculum'
                  ? 'text-scout-blue border-scout-blue'
                  : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}
            >
              📖 مجالات المنهج والأوسمة التسعة
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('conduct')}
              className={`pb-2.5 border-b-4 font-black text-xs transition-all ${
                activeSubTab === 'conduct'
                  ? 'text-scout-blue border-scout-blue'
                  : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}
            >
              🤝 السلوكيات والحضور والالتزام
            </button>
          </div>

          <p className="text-[10px] text-slate-500 font-bold">
            رتب النجوم والتقييم من ١ (في البداية) إلى ٥ (مستكشف متمكن ومتحرك) لحفز مهارات الأشبال:
          </p>

          <AnimatePresence mode="wait">
            {activeSubTab === 'curriculum' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CURRICULUM_FIELDS.map((val) => {
                  const currentScore = criteriaScores[val.id] || 5;
                  return (
                    <div key={val.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="p-2 bg-slate-200 text-slate-600 rounded-lg shrink-0">
                          {val.icon}
                        </span>
                        <h4 className="font-black text-xs text-slate-800">{val.label}</h4>
                      </div>

                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((starIdx) => (
                          <button
                            key={starIdx}
                            type="button"
                            onClick={() => handleScoreChange(val.id, starIdx, 'curriculum')}
                            className={`p-0.5 rounded-full hover:scale-110 transition-transform ${
                              starIdx <= currentScore ? 'text-scout-yellow' : 'text-slate-300'
                            }`}
                          >
                            <Star size={18} fill="currentColor" />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CONDUCT_FIELDS.map((val) => {
                  const currentScore = conductScores[val.id] || 5;
                  return (
                    <div key={val.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="p-2 bg-slate-200 text-slate-600 rounded-lg shrink-0">
                          {val.icon}
                        </span>
                        <h4 className="font-black text-xs text-slate-800">{val.label}</h4>
                      </div>

                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((starIdx) => (
                          <button
                            key={starIdx}
                            type="button"
                            onClick={() => handleScoreChange(val.id, starIdx, 'conduct')}
                            className={`p-0.5 rounded-full hover:scale-110 transition-transform ${
                              starIdx <= currentScore ? 'text-scout-yellow' : 'text-slate-300'
                            }`}
                          >
                            <Star size={18} fill="currentColor" />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>

          <div className="pt-4 border-t flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSubmitting || !selectedCubId}
              className="px-6 py-3 bg-gradient-to-r from-scout-blue to-blue-700 hover:from-blue-700 hover:to-scout-blue disabled:bg-slate-300 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              {isSubmitting ? 'جاري حفظ رصد الاستمارات...' : 'حفظ واعتماد التقييم رسمياً ✓'}
            </button>
            <button
              type="button"
              onClick={() => setView('dashboard')}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl"
            >
              إلغاء التغييرات
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
