import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  Sparkles, 
  Info, 
  Lightbulb, 
  ArrowRight, 
  GraduationCap, 
  ChevronLeft,
  BookOpen
} from 'lucide-react';

interface InteractiveExplanation {
  title: string;
  intro: string;
  uses: { title: string; desc: string }[];
  howItWorks: { step: string; title: string; detail: string }[];
  interactiveCheck: {
    question: string;
    options: { text: string; isCorrect: boolean; feedback: string }[];
  };
}

interface KnotInteractiveWidgetProps {
  knot: {
    id: string;
    name: string;
    description: string;
    interactiveExplanation?: InteractiveExplanation;
  };
}

export const KnotInteractiveWidget: React.FC<KnotInteractiveWidgetProps> = ({ knot }) => {
  const explanation = knot.interactiveExplanation;

  if (!explanation) {
    return null;
  }

  const [activeSubTab, setActiveSubTab] = useState<'uses' | 'function' | 'quiz'>('uses');
  
  // States for interactive components
  const [selectedUseIndex, setSelectedUseIndex] = useState<number>(0);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);
  const [quizAnswer, setQuizAnswer] = useState<{ index: number; isCorrect: boolean; feedback: string } | null>(null);

  return (
    <div id={`knot-interactive-widget-${knot.id}`} className="bg-slate-50 rounded-[32px] p-6 border-2 border-orange-100 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
          <Sparkles size={24} className="animate-pulse" />
        </div>
        <div>
          <h4 className="font-black text-lg text-slate-800">{explanation.title}</h4>
          <p className="text-xs text-slate-500 font-bold">شرح تفاعلي وبسيط ومسلي لأشبالنا الأذكياء</p>
        </div>
      </div>

      <p className="bg-white p-4 rounded-2xl border border-slate-100 text-slate-600 text-xs font-bold leading-relaxed shadow-sm">
        {explanation.intro}
      </p>

      {/* Interactive Tabs */}
      <div className="flex bg-slate-200/60 p-1.5 rounded-2xl gap-2">
        <button
          onClick={() => setActiveSubTab('uses')}
          className={`flex-1 py-3 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'uses' 
              ? 'bg-orange-500 text-white shadow-md' 
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Compass size={16} />
          أين نستخدمها؟
        </button>
        <button
          onClick={() => setActiveSubTab('function')}
          className={`flex-1 py-3 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'function' 
              ? 'bg-orange-500 text-white shadow-md' 
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <BookOpen size={16} />
          كيف تعمل؟
        </button>
        <button
          onClick={() => setActiveSubTab('quiz')}
          className={`flex-1 py-3 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'quiz' 
              ? 'bg-orange-500 text-white shadow-md' 
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <HelpCircle size={16} />
          التحدي الذكي
        </button>
      </div>

      {/* Tabs Content Area */}
      <div className="min-h-[220px]">
        <AnimatePresence mode="wait">
          {activeSubTab === 'uses' && (
            <motion.div
              key="uses-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <p className="text-xs font-black text-slate-400">إليك أشهر المواقف والمهام الكشفية التي تحتاج فيها لهذه العقدة البطلة:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {explanation.uses.map((use, index) => {
                  const isSelected = selectedUseIndex === index;
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedUseIndex(index)}
                      className={`text-right p-4 rounded-2xl border-2 transition-all flex flex-col gap-1.5 ${
                        isSelected 
                          ? 'bg-white border-orange-500 shadow-md scale-[1.02]' 
                          : 'bg-white/50 border-slate-100 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <h5 className={`font-black text-xs ${isSelected ? 'text-orange-600' : 'text-slate-700'}`}>
                        {use.title}
                      </h5>
                      <span className="text-[10px] text-slate-400 font-bold">اضغط للتفاصيل</span>
                    </button>
                  );
                })}
              </div>

              {/* Show selected Use description in a gorgeous block */}
              <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100/60 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex gap-2.5 items-start">
                  <div className="p-1.5 bg-orange-100 rounded-lg text-orange-600 shrink-0 mt-0.5">
                    <Lightbulb size={16} />
                  </div>
                  <div>
                    <h6 className="font-black text-xs text-orange-850">
                      {explanation.uses[selectedUseIndex].title}
                    </h6>
                    <p className="text-[11px] font-bold text-slate-600 leading-relaxed mt-1">
                      {explanation.uses[selectedUseIndex].desc}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeSubTab === 'function' && (
            <motion.div
              key="function-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <p className="text-xs font-black text-slate-400">تابع مع الأصدقاء طريقتنا الثلاثية الكشفية الذكية:</p>
              
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                {explanation.howItWorks.map((step, index) => {
                  const isSelected = selectedStepIndex === index;
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedStepIndex(index)}
                      className={`p-3 rounded-2xl border-2 font-black text-xs flex items-center gap-2 shrink-0 transition-all ${
                        isSelected 
                          ? 'bg-white border-orange-500 text-orange-600 shadow-sm scale-105' 
                          : 'bg-white/50 border-slate-100 text-slate-500 hover:bg-white'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                        isSelected ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {step.step}
                      </span>
                      <span>{step.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Step info banner */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex gap-4 items-center">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-orange-400 font-extrabold text-xl shrink-0">
                  {explanation.howItWorks[selectedStepIndex].step}
                </div>
                <div>
                  <h6 className="font-black text-xs text-orange-400">
                    الخطوة: {explanation.howItWorks[selectedStepIndex].title}
                  </h6>
                  <p className="text-[11px] font-bold opacity-80 leading-relaxed mt-1">
                    {explanation.howItWorks[selectedStepIndex].detail}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeSubTab === 'quiz' && (
            <motion.div
              key="quiz-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 flex items-start gap-3">
                <HelpCircle size={20} className="text-orange-500 shrink-0 mt-0.5" />
                <p className="text-xs font-black text-slate-800 leading-relaxed">
                  {explanation.interactiveCheck.question}
                </p>
              </div>

              <div className="space-y-2">
                {explanation.interactiveCheck.options.map((option, index) => {
                  const isChecked = quizAnswer?.index === index;
                  return (
                    <button
                      key={index}
                      onClick={() => setQuizAnswer({
                        index,
                        isCorrect: option.isCorrect,
                        feedback: option.feedback
                      })}
                      className={`w-full text-right p-4 rounded-xl border-2 transition-all flex items-center justify-between text-xs font-bold gap-3 ${
                        isChecked 
                          ? option.isCorrect 
                            ? 'bg-scout-green/5 border-scout-green text-scout-green' 
                            : 'bg-red-50 border-red-300 text-red-650'
                          : 'bg-white border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <span>{option.text}</span>
                      {isChecked ? (
                        option.isCorrect ? <CheckCircle size={18} /> : <XCircle size={18} />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300" />
                      )}
                    </button>
                  );
                })}
              </div>

              {quizAnswer && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`p-4 rounded-2xl border text-xs font-bold flex items-start gap-3 ${
                    quizAnswer.isCorrect 
                      ? 'bg-scout-green/10 border-scout-green/30 text-scout-green/90' 
                      : 'bg-orange-50 border-orange-200 text-orange-700'
                  }`}
                >
                  <Info size={16} className="shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{quizAnswer.feedback}</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
