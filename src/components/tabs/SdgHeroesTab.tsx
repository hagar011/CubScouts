import React, { useState } from 'react';
import { Globe, Award, CheckCircle2, Sparkles, ArrowRight, Trophy, RotateCw, XCircle } from 'lucide-react';

interface SdgGoal {
  id: number;
  title: string;
  description: string;
  color: string;
  challenge: string;
  points: number;
}

interface CardChallenge {
  id: number;
  sdgNumber: number;
  sdgTitle: string;
  question: string;
  options: string[];
  correctIndex: number;
  points: number;
  color: string;
}

// قائمة أهداف التنمية المستدامة الـ 17 كاملة
const all17SdgGoals: SdgGoal[] = [
  { id: 1, title: "القضاء على الفقر", description: "إنهاء الفقر بجميع أشكاله في كل مكان.", color: "bg-red-600", challenge: "تبرع بأدوات مدرسية أو ملابس زائدة لجمعية خيرية.", points: 15 },
  { id: 2, title: "القضاء على الجوع", description: "القضاء على الجوع وتحقيق الأمن الغذائي وتجهيز الأغذية المغذية.", color: "bg-amber-500", challenge: "احرص على عدم إهدار الطعام في وجباتك اليومية وشارك الفائض.", points: 15 },
  { id: 3, title: "الصحة الجيدة والرفاه", description: "ضمان تمتع الجميع بأجواء صحية وعيشة كريمة في جميع الأعمار.", color: "bg-emerald-600", challenge: "مارس الرياضة الصباحية وشارك في تنظيف الملاعب والأماكن الكشفية.", points: 10 },
  { id: 4, title: "التعليم الجيد", description: "ضمان التعليم الجيد المنصف والشامل للجميع وتعزيز فرص التعلم.", color: "bg-red-700", challenge: "ساعد زعيماً أو صديقاً لك في فهم درس أو مهارة كشفية جديدة.", points: 15 },
  { id: 5, title: "المساواة بين الجنسين", description: "تحقيق المساواة بين الجنسين وتمكين كل النساء والفتيات.", color: "bg-orange-500", challenge: "وزع المهام القيادية في السداسية والمخيم بالعدل والمساواة بين الجميع.", points: 10 },
  { id: 6, title: "المياه النظيفة والنظافة الصحية", description: "ضمان توفر المياه وخدمات الصرف الصحي للجميع وبشكل مستدام.", color: "bg-cyan-500", challenge: "أغلق صنبور المياه جيداً أثناء غسيل الأسنان ووثق ذلك في المخيم.", points: 15 },
  { id: 7, title: "طاقة نظيفة وبأسعار معقولة", description: "ضمان حصول الجميع بتكلفة ميسورة على خدمات الطاقة الحديثة.", color: "bg-yellow-500", challenge: "أطفئ الأنوار والأجهزة الكهربائية غير المستخدمة في المقر والمنزل.", points: 10 },
  { id: 8, title: "العمل اللائق ونمو الاقتصاد", description: "تعزيز النمو الاقتصادي الشامل والمستدام وتوفير العمل اللائق.", color: "bg-rose-700", challenge: "اصنع حرفة أو منتج كشفي من خامات البيئة واعرضه في المعرض الكشفي.", points: 20 },
  { id: 9, title: "الصناعة والابتكار والبنية التحتية", description: "إقامة بنية تحتية صمودة وتحفيز الابتكار المستدام.", color: "bg-orange-600", challenge: "ابتكر فكرة جديدة أو نموذجاً مبسطاً لحل مشكلة بيئية داخل المقر.", points: 20 },
  { id: 10, title: "الحد من أوجه عدم المساواة", description: "الحد من عدم المساواة داخل البلدان وفيما بينها.", color: "bg-pink-600", challenge: "رحب بالأعضاء الجدد في الفرقة وتأكد من دمجه إيجابياً في الأنشطة.", points: 10 },
  { id: 11, title: "مدن ومجتمعات محلية مستدامة", description: "جعل المدن والمستوطنات البشرية شاملة للجميع وآمنة ومستدامة.", color: "bg-amber-600", challenge: "شارك في حملة لتنظيف وتشجير الحي أو الشارع المحيط بمقرك.", points: 20 },
  { id: 12, title: "الاستهلاك والإنتاج المسؤولان", description: "ضمان وجود أنماط استهلاك وإنتاج مستدامة وتدوير النفايات.", color: "bg-yellow-600", challenge: "قم بفرز النفايات البلاستيكية والورقية في مقرك الكشفي اليوم.", points: 20 },
  { id: 13, title: "العمل المناخي", description: "اتخاذ إجراءات عاجلة للتصدي لتغير المناخ وآثاره في العالم.", color: "bg-green-700", challenge: "ازرع نبتة صغيرة في حديقتك أو المقر وتابع نموها وتوثيقها.", points: 25 },
  { id: 14, title: "الحياة تحت الماء", description: "حفظ المحيطات والبحار والموارد البحرية واستخدامها بشكل مستدام.", color: "bg-blue-600", challenge: "تجنب استخدام الأكياس البلاستيكية أحادية الاستخدام لحماية الشواطئ والبحار.", points: 15 },
  { id: 15, title: "الحياة في البر", description: "حماية الأنظمة البيئية البرية وتصدي التدهور والتنوع البيولوجي.", color: "bg-emerald-500", challenge: "ضع وعاء ماء وطعام للطيور والحيوانات الأليفة في مكان آمن.", points: 10 },
  { id: 16, title: "السلام والعدل والمؤسسات القوية", description: "تشجيع وجود مجتمعات سلمية لا يهمش فيها أحد وإرساء السلام.", color: "bg-sky-700", challenge: "حل الخلافات بين زملائك في السداسية بروح كشفية وأخوية.", points: 15 },
  { id: 17, title: "عقد الشراكات لتحقيق الأهداف", description: "تعزيز وسائل التنفيذ وتنشيط الشراكة العالمية من أجل التنمية.", color: "bg-indigo-900", challenge: "شارِك في نشاط كشفي مشترك مع فرقة أخرى لنشر أهداف التنمية المستدامة.", points: 20 }
];

// أوراق لعبة الكروت التفاعلية
const cardsDeck: CardChallenge[] = [
  {
    id: 1,
    sdgNumber: 6,
    sdgTitle: "المياه النظيفة والنظافة الصحية",
    question: "لاحظت وجود صنبور مياه يقطر في المقر الكشفي، ما التصرف الاستدامي الأفضل؟",
    options: [
      "إغلاقه جيداً وإبلاغ القائد لإصلاح العطل",
      "تركه كما هو لأن القطرات قليلة",
      "وضع إناء تحته دون إصلاحه"
    ],
    correctIndex: 0,
    points: 15,
    color: "from-cyan-500 to-blue-600"
  },
  {
    id: 2,
    sdgNumber: 12,
    sdgTitle: "الاستهلاك والإنتاج المسؤولان",
    question: "لديك زجاجات بلاستيكية فارغة بعد المخيم، كيف تستغلها بطريقة مستدامة؟",
    options: [
      "رميها مع باقي القمامة العادية",
      "إعادة استخدامها لصنع زهارات أو قصصات نباتية",
      "حرقها للتخلص منها سريعاً"
    ],
    correctIndex: 1,
    points: 20,
    color: "from-amber-500 to-orange-600"
  },
  {
    id: 3,
    sdgNumber: 13,
    sdgTitle: "العمل المناخي",
    question: "أي من الأنشطة التالية يساعد بشكل مباشر في تقليل الانبعاثات وتلطيف المناخ؟",
    options: [
      "استخدام الأكياس البلاستيكية بكثرة",
      "تشجير المساحات الخالية وزراعة الشتلات",
      "ترك الأجهزة الكهربائية تعمل طوال الليل"
    ],
    correctIndex: 1,
    points: 25,
    color: "from-emerald-500 to-green-700"
  }
];

export default function SdgHeroesTab() {
  const [activeMode, setActiveMode] = useState<'grid' | 'game'>('grid');
  const [selectedGoal, setSelectedGoal] = useState<SdgGoal | null>(null);
  const [completedGoals, setCompletedGoals] = useState<number[]>([]);

  // لعبة الكروت
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  const currentCard = cardsDeck[currentCardIndex];

  const toggleComplete = (id: number) => {
    if (completedGoals.includes(id)) {
      setCompletedGoals(completedGoals.filter(goalId => goalId !== id));
    } else {
      setCompletedGoals([...completedGoals, id]);
    }
  };

  const handleSelectOption = (index: number) => {
    if (answered) return;
    setSelectedOption(index);
    setAnswered(true);
    if (index === currentCard.correctIndex) {
      setScore(prev => prev + currentCard.points);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setSelectedOption(null);
    setAnswered(false);
    setCurrentCardIndex((prev) => (prev + 1) % cardsDeck.length);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-350 text-right font-sans" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Globe size={24} className="text-emerald-500" /> أبطال التنمية المستدامة (Scouts for SDGs)
          </h2>
          <p className="text-xs text-slate-500 font-bold">17 هدفاً عالمياً لبناء عالم أفضل وأكثر استدامة للأشبال</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl border gap-2 shrink-0">
          <button
            onClick={() => setActiveMode('grid')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeMode === 'grid'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            الأهداف الـ 17 🌐
          </button>
          <button
            onClick={() => setActiveMode('game')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeMode === 'game'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            لعبة الكروت 🃏
          </button>
        </div>
      </div>

      {/* Grid Mode */}
      {activeMode === 'grid' && (
        <>
          {!selectedGoal ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {all17SdgGoals.map((goal) => {
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
                    <h3 className="font-black text-sm mb-1">{goal.title}</h3>
                    <p className="text-[11px] text-white/90 line-clamp-2 font-medium">{goal.description}</p>
                    <div className="mt-4 pt-3 border-t border-white/20 flex justify-between items-center text-[11px] font-bold">
                      <span>عرض التحدي</span>
                      <span className="bg-white/20 px-2 py-0.5 rounded-lg">+{goal.points} نقطة</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Selected Goal Detail */
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
                    : 'bg-emerald-600 text-white shadow-md hover:bg-emerald-700'
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
        </>
      )}

      {/* Game Mode */}
      {activeMode === 'game' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-3xl shadow-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="text-yellow-400 animate-pulse" size={20} />
              <h3 className="font-black text-sm">لعبة كروت أبطال التنمية</h3>
            </div>
            <div className="flex items-center gap-2 bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700">
              <Trophy className="text-amber-400" size={16} />
              <span className="text-xs font-black">النقاط: {score}</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center min-h-[340px]">
            {!isFlipped ? (
              <div
                onClick={() => setIsFlipped(true)}
                className="w-full max-w-sm h-80 bg-gradient-to-br from-indigo-600 via-purple-600 to-emerald-600 rounded-3xl p-6 text-white flex flex-col items-center justify-between shadow-2xl cursor-pointer hover:scale-105 transition-all border-4 border-white/20"
              >
                <div className="text-4xl">🌱</div>
                <div className="text-center space-y-2">
                  <h4 className="text-xl font-black">اكشف كارت التحدي!</h4>
                  <p className="text-xs text-white/80 font-bold">اضغط على الكارت لقلبه واستعراض السؤال المناخي</p>
                </div>
                <span className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-black backdrop-blur-md">
                  اضغط للفتح 🃏
                </span>
              </div>
            ) : (
              <div className={`w-full max-w-sm bg-gradient-to-br ${currentCard.color} rounded-3xl p-6 text-white shadow-2xl space-y-4 animate-in fade-in zoom-in duration-300`}>
                <div className="flex justify-between items-center border-b border-white/20 pb-3">
                  <span className="bg-white/20 px-3 py-1 rounded-xl font-black text-xs">
                    الهدف #{currentCard.sdgNumber}
                  </span>
                  <span className="text-xs font-bold">{currentCard.sdgTitle}</span>
                </div>

                <p className="font-black text-sm leading-relaxed min-h-[50px]">
                  {currentCard.question}
                </p>

                <div className="space-y-2">
                  {currentCard.options.map((option, idx) => {
                    let btnStyle = "bg-white/10 hover:bg-white/20 border-white/20 text-white";
                    if (answered) {
                      if (idx === currentCard.correctIndex) btnStyle = "bg-emerald-500 text-white border-emerald-300 font-bold";
                      else if (selectedOption === idx) btnStyle = "bg-rose-500 text-white border-rose-300";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={answered}
                        className={`w-full p-3 rounded-2xl text-xs text-right font-black transition-all border flex justify-between items-center ${btnStyle}`}
                      >
                        <span>{option}</span>
                        {answered && idx === currentCard.correctIndex && <CheckCircle2 size={16} />}
                        {answered && selectedOption === idx && idx !== currentCard.correctIndex && <XCircle size={16} />}
                      </button>
                    );
                  })}
                </div>

                {answered && (
                  <button
                    onClick={nextCard}
                    className="w-full py-3 bg-white text-slate-900 rounded-2xl font-black text-xs shadow-lg hover:bg-slate-100 flex items-center justify-center gap-2 mt-2"
                  >
                    <RotateCw size={14} /> الكارت التالي (+{currentCard.points} نقطة)
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}