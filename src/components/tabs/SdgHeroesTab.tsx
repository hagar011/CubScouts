import React, { useState } from 'react';
import { Globe, Award, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

interface SdgGoal {
  id: number;
  title: string;
  description: string;
  color: string;
  challenge: string;
  points: number;
}

const sdgGoalsData: SdgGoal[] = [
  {
    id: 6,
    title: "المياه النظيفة والنظافة الصحية",
    description: "ضمان توفر المياه وخدمات الصرف الصحي للجميع وبشكل مستدام.",
    color: "bg-cyan-500",
    challenge: "تأكد من إغلاق صنبور المياه جيداً أثناء غسيل الأسنان ووثق ذلك!",
    points: 15
  },
  {
    id: 12,
    title: "الاستهلاك والإنتاج المسؤولان",
    description: "الحد من الهدر وإعادة تدوير المخلفات للحفاظ على الموارد.",
    color: "bg-amber-600",
    challenge: "قم بفرز النفايات البلاستيكية والورقية في مقرك أو منزلك اليوم.",
    points: 20
  },
  {
    id: 13,
    title: "العمل المناخي",
    description: "اتخاذ إجراءات عاجلة للتصدي لتغير المناخ وآثاره.",
    color: "bg-emerald-600",
    challenge: "ازرع نبتة صغيرة في حديقتك أو في المقر الكشفي وتابع نموها.",
    points: 25
  },
  {
    id: 15,
    title: "الحياة في البر",
    description: "حماية الأنظمة البيئية البرية والغابات وإعادتها إلى نصابها.",
    color: "bg-green-500",
    challenge: "ضع وعاء ماء للطيور والحيوانات في مكان آمن.",
    points: 10
  }
];

export default function SdgTab() {
  const [selectedGoal, setSelectedGoal] = useState<SdgGoal | null>(null);
  const [completedGoals, setCompletedGoals] = useState<number[]>([]);

  const toggleComplete = (id: number) => {
    if (completedGoals.includes(id)) {
      setCompletedGoals(completedGoals.filter(goalId => goalId !== id));
    } else {
      setCompletedGoals([...completedGoals, id]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-350 text-right font-sans" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Globe size={24} className="text-emerald-500 animate-spin-slow" /> أبطال التنمية المستدامة (Scouts for SDGs)
          </h2>
          <p className="text-xs text-slate-500 font-bold">نفذ التحديات البيئية والمجتمعية واحصل على أوسمة التنمية!</p>
        </div>
      </div>

      {/* Grid of SDGs */}
      {!selectedGoal ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sdgGoalsData.map((goal) => {
            const isCompleted = completedGoals.includes(goal.id);
            return (
              <div
                key={goal.id}
                onClick={() => setSelectedGoal(goal)}
                className={`cursor-pointer rounded-3xl p-5 text-white shadow-md transition-all hover:scale-105 relative overflow-hidden ${goal.color}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-2xl font-black bg-white/20 px-3 py-1 rounded-2xl backdrop-blur-md">
                    #{goal.id}
                  </span>
                  {isCompleted && (
                    <span className="bg-white text-emerald-600 rounded-full p-1 shadow">
                      <CheckCircle2 size={20} />
                    </span>
                  )}
                </div>
                <h3 className="font-black text-base mb-1">{goal.title}</h3>
                <p className="text-xs text-white/90 line-clamp-2 font-medium">{goal.description}</p>
                <div className="mt-4 pt-3 border-t border-white/20 flex justify-between items-center text-xs font-bold">
                  <span>تحدي الهدف</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-lg">+{goal.points} نقطة</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Goal Details View */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <button
            onClick={() => setSelectedGoal(null)}
            className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowRight size={16} /> العودة لكل الأهداف
          </button>

          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl ${selectedGoal.color} text-white font-black text-xl flex items-center justify-center shadow`}>
              #{selectedGoal.id}
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">{selectedGoal.title}</h3>
              <p className="text-xs text-slate-500 font-bold">{selectedGoal.description}</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
            <h4 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <Sparkles className="text-amber-500" size={16} /> التحدي الميداني المطلوب:
            </h4>
            <p className="text-sm font-extrabold text-slate-800">{selectedGoal.challenge}</p>
          </div>

          <button
            onClick={() => toggleComplete(selectedGoal.id)}
            className={`w-full py-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
              completedGoals.includes(selectedGoal.id)
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                : 'bg-scout-blue text-white shadow-md hover:bg-blue-700'
            }`}
          >
            {completedGoals.includes(selectedGoal.id) ? (
              <>
                <CheckCircle2 size={18} /> تم إنجاز التحدي بنجاح!
              </>
            ) : (
              <>
                <Award size={18} /> إتمام التحدي والحصول على +{selectedGoal.points} نقطة
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}