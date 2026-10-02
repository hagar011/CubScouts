import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Sparkles, BookOpen, HelpCircle, Laptop, Check, X, ShieldAlert, Zap } from 'lucide-react';
import { UserRole, Cub } from '../../types';
import { KNOT_CATEGORIES, KNOTS, BACKPACK_ITEMS, SCOUT_QUIZZES } from '../../constants/scoutData';
import { KnotInteractiveWidget } from '../KnotInteractiveWidget';
import ChessGame from '../ChessGame';

interface ActivitiesTabProps {
  role: UserRole;
  activeCub: Cub | null;
  onAddPoints?: (cubId: string, pts: number) => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function ActivitiesTab({ role, activeCub, onAddPoints, showToast }: ActivitiesTabProps) {
  const [activeActivity, setActiveActivity] = useState<'knots' | 'backpack' | 'quizzes' | 'chess'>('knots');

  // Knot game state
  const [selectedKnotId, setSelectedKnotId] = useState<string>('reef');

  // Backpack game state
  const [backpackSelectedItems, setBackpackSelectedItems] = useState<Set<string>>(new Set());
  const [backpackChecked, setBackpackChecked] = useState(false);
  const [backpackScore, setBackpackScore] = useState<number | null>(null);

  // Quizzes state
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const activeKnot = KNOTS.find((k) => k.id === selectedKnotId) || KNOTS[0];

  // Backpack packing toggle
  const toggleBackpackItem = (itemId: string) => {
    if (backpackChecked) return; // Locked once evaluated
    setBackpackSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleCheckBackpack = async () => {
    let correctCount = 0;
    let wrongCount = 0;

    BACKPACK_ITEMS.forEach((item) => {
      const isSelected = backpackSelectedItems.has(item.id);
      if (isSelected && item.isCorrect) {
        correctCount++;
      } else if (isSelected && !item.isCorrect) {
        wrongCount++;
      } else if (!isSelected && item.isCorrect) {
        wrongCount++;
      }
    });

    const totalTargetCorrect = BACKPACK_ITEMS.filter((item) => item.isCorrect).length;
    const isSuccess = correctCount === totalTargetCorrect && wrongCount === 0;

    setBackpackChecked(true);
    setBackpackScore(correctCount);

    if (isSuccess) {
      if (role === UserRole.CUB && activeCub && onAddPoints) {
        try {
          await onAddPoints(activeCub.id, 20);
          showToast('أحسنت يا بطل! رتبت الحقيبة بنجاح وحصلت على 20 نقطة! 🎒✨', 'success');
        } catch (err) {
          console.error(err);
        }
      } else {
        showToast('مذهل للغاية! رتبت حقيبة ظهرك الكشفية باحترافية كاملة!', 'success');
      }
    } else {
      showToast('انتبه! هناك أخطاء في ترتيب حقائب الظهر. أفرغها وجرب الربط والترتيب السليم مجدداً ⛺', 'warning');
    }
  };

  const handleResetBackpack = () => {
    setBackpackSelectedItems(new Set());
    setBackpackChecked(false);
    setBackpackScore(null);
  };

  // Quizzes handlers
  const handleStartQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    setCurrentQuestionIdx(0);
    setQuizScore(0);
    setSelectedAnswerIdx(null);
    setShowAnswerFeedback(false);
    setQuizFinished(false);
  };

  const handleSelectAnswer = (ansIdx: number) => {
    if (selectedAnswerIdx !== null) return;
    setSelectedAnswerIdx(ansIdx);
    setShowAnswerFeedback(true);

    const activeQuiz = SCOUT_QUIZZES.find((q) => q.id === selectedQuizId);
    if (activeQuiz && activeQuiz.questions[currentQuestionIdx].correct === ansIdx) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    const activeQuiz = SCOUT_QUIZZES.find((q) => q.id === selectedQuizId);
    if (!activeQuiz) return;

    setSelectedAnswerIdx(null);
    setShowAnswerFeedback(false);

    if (currentQuestionIdx + 1 < activeQuiz.questions.length) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      setQuizFinished(true);
      handleFinishQuiz(activeQuiz.questions.length);
    }
  };

  const handleFinishQuiz = async (totalQuestions: number) => {
    if (quizScore >= Math.ceil(totalQuestions / 2)) {
      if (role === UserRole.CUB && activeCub && onAddPoints) {
        try {
          await onAddPoints(activeCub.id, 30);
          showToast(`تهانينا يا بطل الفرقة! اجتزت الاختبار وحصلت على 30 نقطة! 🏆`, 'success');
        } catch (err) {
          console.error(err);
        }
      } else {
        showToast('مبارك! لقد اجتزت اختبار الثقافة العشائرية والكشفية بتميز!', 'success');
      }
    } else {
      showToast('لم تحقق درجة النجاح الكافية هذه المرة. ابقَ مستعداً وراجع القوانين وحاول مجدداً 🔍', 'warning');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-350 text-right font-sans" dir="rtl">
      <div className="rounded-[30px] bg-gradient-to-r from-scout-blue via-blue-700 to-scout-green px-5 py-4 text-white shadow-[0_18px_40px_rgba(37,99,235,0.22)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black tracking-[0.24em] text-blue-100">ACTIVITIES</p>
            <h3 className="mt-1 text-xl font-black">أنشطة الأشبال التعليمية</h3>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
            <Compass className="text-scout-yellow" size={22} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap bg-slate-100/80 p-1.5 rounded-[28px] gap-2 border border-slate-200 shadow-inner">
        <button
          onClick={() => setActiveActivity('knots')}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
            activeActivity === 'knots'
              ? 'bg-gradient-to-r from-scout-blue to-blue-700 text-white shadow-lg shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-800 hover:bg-white'
          }`}
        >
          🪢 عقد كشفية
        </button>
        <button
          onClick={() => setActiveActivity('backpack')}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
            activeActivity === 'backpack'
              ? 'bg-gradient-to-r from-scout-blue to-blue-700 text-white shadow-lg shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-800 hover:bg-white'
          }`}
        >
          🎒 حقيبة الظهر
        </button>
        <button
          onClick={() => setActiveActivity('quizzes')}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
            activeActivity === 'quizzes'
              ? 'bg-gradient-to-r from-scout-blue to-blue-700 text-white shadow-lg shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-800 hover:bg-white'
          }`}
        >
          🎯 مسابقات
        </button>
        <button
          onClick={() => setActiveActivity('chess')}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
            activeActivity === 'chess'
              ? 'bg-gradient-to-r from-scout-blue to-blue-700 text-white shadow-lg shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-800 hover:bg-white'
          }`}
        >
          ♟️ شطرنج
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* KNOTS CONTROLLER PAGE */}
        {activeActivity === 'knots' && (
          <motion.div
            key="knots-activity"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left selector menu */}
            <div className="lg:col-span-1 bg-white p-6 rounded-[32px] border border-slate-200 shadow-[0_16px_40px_rgba(15,23,42,0.05)] space-y-4">
              <span className="inline-flex items-center gap-2 text-[10px] bg-scout-blue/10 text-scout-blue px-3 py-1 rounded-full font-black border border-blue-100">
                <Sparkles size={12} /> مجلس الريادة والربطات
              </span>
              <h3 className="font-black text-sm text-slate-800">قائمة العقد والتربيطات الكشفية</h3>

              <div className="space-y-2 mt-4 max-h-[380px] overflow-y-auto pr-1">
                {KNOTS.map((knot) => (
                  <button
                    key={knot.id}
                    onClick={() => setSelectedKnotId(knot.id)}
                    className={`w-full text-right p-4 rounded-2xl border-2 transition-all flex flex-col gap-1 ${
                      selectedKnotId === knot.id
                        ? 'bg-orange-50 border-orange-400 text-orange-950 shadow-sm font-black'
                        : 'bg-white border-slate-100 hover:border-slate-200 text-slate-600 font-bold'
                    }`}
                  >
                    <span className="text-xs font-black">{knot.name}</span>
                    <span className="text-[9px] opacity-70 leading-relaxed font-semibold">{knot.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Interactive Widget rendering */}
            <div className="lg:col-span-2 space-y-4">
              {activeKnot ? (
                <div className="space-y-4">
                  {/* Web URL details if any */}
                  {activeKnot.externalUrl && (
                    <div className="bg-white p-4 rounded-2xl border flex items-center justify-between shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400">راجع الرسوم الهيكلية ثلاثية الأبعاد</span>
                      <a
                        href={activeKnot.externalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-scout-blue font-black flex items-center gap-1 hover:underline"
                      >
                        رابط Knots3D الخارجي ↗
                      </a>
                    </div>
                  )}

                  <KnotInteractiveWidget knot={activeKnot} />
                </div>
              ) : (
                <div className="text-center py-20 text-slate-400 font-black italic">
                  اختر وساماً من القائمة الكشفية لبدء العرض التفاعلي.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* BACKPACK MATCHING GAME */}
        {activeActivity === 'backpack' && (
          <motion.div
            key="backpack-activity"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col lg:flex-row gap-8"
          >
            {/* Packing space (Interactive select grid) */}
            <div className="flex-1 bg-white p-6 rounded-[32px] border border-slate-200 shadow-[0_16px_40px_rgba(15,23,42,0.05)] space-y-4">
              <div>
                <span className="inline-flex items-center gap-2 text-[10px] bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full font-black border border-emerald-100">
                  <BookOpen size={12} /> ركن الرحلة الاستكشافية
                </span>
                <h3 className="font-black text-sm text-slate-800 mt-2">تحدي إعداد وتجهيزات حقيبة المعسكر</h3>
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed mt-1">
                  استعد للمغامرة في غابة الأشبال! اضغط على كافة الأدوات الهامة التي ستلزمك بالمعسكر فقط، وتجنب الهوايات أو الأموال الزائدة لتخفيف الوزن على ظهرك.
                </p>
              </div>

              {/* Grid block */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {BACKPACK_ITEMS.map((item) => {
                  const isSelected = backpackSelectedItems.has(item.id);
                  let itemStyle = 'border-slate-100 bg-slate-50 hover:border-slate-300';
                  if (isSelected) {
                    itemStyle = backpackChecked
                      ? item.isCorrect 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-black' 
                        : 'border-red-400 bg-red-50 text-red-750 font-black'
                      : 'border-scout-blue bg-scout-blue/5 text-scout-blue font-black scale-98 shadow-sm';
                  }

                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleBackpackItem(item.id)}
                      disabled={backpackChecked}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 select-none ${itemStyle}`}
                    >
                      <span className="text-4xl filter drop-shadow-sm">{item.emoji}</span>
                      <span className="text-xs">{item.name}</span>
                      
                      {backpackChecked && isSelected && (
                        <span className="text-[9px] mt-1 font-bold">
                          {item.isCorrect ? '✓ صحيح' : '⛌ غير مناسب'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Game Action Controllers */}
              <div className="pt-4 border-t flex flex-wrap gap-2">
                {!backpackChecked ? (
                  <button
                    onClick={handleCheckBackpack}
                    className="px-6 py-3 bg-scout-blue hover:bg-blue-800 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95"
                  >
                    رأيت حقيبتي مطابقة ومستعدة ✓
                  </button>
                ) : (
                  <button
                    onClick={handleResetBackpack}
                    className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-black text-xs rounded-xl shadow transition-all active:scale-95"
                  >
                    إفراغ الحقيبة وإعادة التحدي 🔄
                  </button>
                )}
              </div>
            </div>

            {/* Simulated Canvas side list */}
            <div className="w-full lg:w-[280px] bg-slate-50 border border-slate-100 rounded-[32px] p-6 space-y-4 shadow-inner">
              <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wide">حقيبتك المعبأة حالياً 🎒</h4>
              {backpackSelectedItems.size > 0 ? (
                <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto">
                  {Array.from(backpackSelectedItems).map((itemId) => {
                    const found = BACKPACK_ITEMS.find((b) => b.id === itemId);
                    return found ? (
                      <div key={itemId} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm text-xs select-none">
                        <span>{found.emoji}</span>
                        <span className="font-bold">{found.name}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 font-bold italic leading-relaxed text-center py-10">
                  انقر على الأمتعة الميسرة على اليسار لنفردها ونعبئها داخل مجسم حقيبتك!
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* KNOWLEDGE QUIZZES SECTION */}
        {activeActivity === 'quizzes' && (
          <motion.div
            key="quizzes-activity"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* If no quiz selected, let user choose a category */}
            {selectedQuizId === null ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SCOUT_QUIZZES.map((quiz) => (
                  <div
                    key={quiz.id}
                    onClick={() => handleStartQuiz(quiz.id)}
                    className={`p-6 rounded-[32px] border-2 bg-white cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md flex items-start gap-4 hover:border-scout-blue/40`}
                  >
                    <span className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 bg-slate-50 border">
                      {quiz.icon}
                    </span>
                    <div className="space-y-1">
                      <h4 className="font-black text-sm text-slate-800">{quiz.title}</h4>
                      <p className="text-[10px] text-slate-500 font-bold leading-normal">{quiz.description}</p>
                      <span className="inline-block text-[9px] font-black text-scout-blue bg-scout-blue/5 px-2 py-0.5 rounded-full mt-2">
                        ابدأ المسابقة (5 أسئلة) ✨
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Inside active quiz sheet */
              (() => {
                const quiz = SCOUT_QUIZZES.find((q) => q.id === selectedQuizId);
                if (!quiz) return null;

                const q = quiz.questions[currentQuestionIdx];
                const totalQuestions = quiz.questions.length;

                return (
                  <div className="bg-white border-2 border-slate-100 rounded-[32px] p-6 md:p-8 shadow-sm space-y-6 relative max-w-2xl mx-auto">
                    {/* Header bar */}
                    <div className="flex items-center justify-between border-b pb-3 select-none">
                      <h4 className="font-black text-xs text-scout-blue">{quiz.title}</h4>
                      <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                        السؤال {currentQuestionIdx + 1} / {totalQuestions}
                      </span>
                    </div>

                    {!quizFinished ? (
                      <div className="space-y-4">
                        {/* Question Text */}
                        <p className="text-sm font-black text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-2xl border">
                          {q.question}
                        </p>

                        {/* Question Options */}
                        <div className="space-y-2">
                          {q.options.map((option, idx) => {
                            const isSelected = selectedAnswerIdx === idx;
                            const isCorrect = q.correct === idx;

                            let optStyle = 'border-slate-100 bg-white hover:border-slate-300';
                            if (showAnswerFeedback) {
                              if (isCorrect) {
                                optStyle = 'border-emerald-400 bg-emerald-50 text-emerald-800 font-black';
                              } else if (isSelected) {
                                optStyle = 'border-red-300 bg-red-50 text-red-700 font-black';
                              }
                            }

                            return (
                              <button
                                key={idx}
                                onClick={() => handleSelectAnswer(idx)}
                                disabled={showAnswerFeedback}
                                className={`w-full text-right p-4 rounded-xl border-2 transition-all flex items-center justify-between text-xs font-bold gap-3 ${optStyle}`}
                              >
                                <span>{option}</span>
                                {showAnswerFeedback ? (
                                  isCorrect ? <Check className="text-emerald-500" size={18} /> : isSelected ? <X className="text-red-500" size={18} /> : null
                                ) : (
                                  <div className="w-4 h-4 rounded-full border border-slate-300" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Hint box */}
                        {showAnswerFeedback && q.hint && (
                          <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200 text-xs font-bold text-orange-800">
                            💡 معلومة كشفية: {q.hint}
                          </div>
                        )}

                        {/* Actions */}
                        {showAnswerFeedback && (
                          <button
                            onClick={handleNextQuizQuestion}
                            className="px-6 py-2.5 bg-scout-blue hover:bg-blue-800 text-white font-black text-xs rounded-xl shadow transition-all active:scale-95"
                          >
                            {currentQuestionIdx + 1 < totalQuestions ? 'السؤال التالي ➡️' : 'عرض النتيجة النهائية 🏆'}
                          </button>
                        )}
                      </div>
                    ) : (
                      /* Final Results summary sheet */
                      <div className="text-center py-8 space-y-4">
                        <span className="text-5xl">🏆</span>
                        <h4 className="text-base font-black text-slate-800">انتهت مسابقة: {quiz.title}</h4>
                        <p className="text-sm font-bold text-slate-600">
                          لقد أجبت إجابة صحيحة على <span className="font-black text-scout-yellow">{quizScore}</span> من أصل {totalQuestions} أسئلة!
                        </p>
                        
                        <div className="py-2">
                          {quizScore >= Math.ceil(totalQuestions / 2) ? (
                            <span className="bg-emerald-50 text-emerald-800 border px-4 py-2 rounded-full font-black text-xs">
                              نجحت! تم الحصول على ٣٠ شعلة حافز 💥
                            </span>
                          ) : (
                            <span className="bg-rose-50 text-rose-800 border px-4 py-2 rounded-full font-black text-xs">
                              تحتاج لإعادة المسابقة لتحسين المعلومات ومحاولة تجميع شعلات النجاح.
                            </span>
                          )}
                        </div>

                        <div className="pt-4 flex justify-center gap-2">
                          <button
                            onClick={() => handleStartQuiz(quiz.id)}
                            className="px-5 py-2 border rounded-xl font-black text-xs hover:bg-slate-50"
                          >
                            إعادة المسابقة 🔄
                          </button>
                          <button
                            onClick={() => setSelectedQuizId(null)}
                            className="px-5 py-2 bg-slate-900 text-white rounded-xl font-black text-xs"
                          >
                            الرجوع لقائمة المسابقات
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </motion.div>
        )}

        {/* CHESS GAME ACTIVITY */}
        {activeActivity === 'chess' && (
          <motion.div
            key="chess-activity"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ChessGame
              role={role}
              onAwardPoints={async (pts) => {
                if (role === UserRole.CUB && activeCub && onAddPoints) {
                  try {
                    await onAddPoints(activeCub.id, pts);
                    showToast(`رائع جداً يا شبل! تم رصد وتفعيل شحن ${pts} شعلة بنجاح لحسابك! 🏆✨`, 'success');
                  } catch (err) {
                    console.error(err);
                  }
                } else {
                  showToast(`أحسنت الاختراق التكتيكي ودفاع الملك! حصلت افتراضياً على ${pts} نقطة.`, 'success');
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
