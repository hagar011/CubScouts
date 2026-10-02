import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Printer, 
  Award, 
  Sparkles, 
  Star, 
  Calendar, 
  CheckCircle,
  TrendingUp,
  Heart,
  Share2,
  Bookmark,
  Copy,
  Check
} from 'lucide-react';
import { 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip
} from 'recharts';
import { Cub, MonthlyReport } from '../types.ts';
import { CubAvatar } from './UI/ScoutUI.tsx';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  cub: Cub | null;
  report: MonthlyReport | null;
  sextetName?: string;
  onShareWithParent?: () => void;
  isSharingInProgress?: boolean;
}

const CURRICULUM_FIELDS = [
  { id: 'religion', label: 'القيم الدينية والأخلاقية' },
  { id: 'discovery', label: 'اكتشف ما حولك' },
  { id: 'talents', label: 'المواهب والمهارات' },
  { id: 'health', label: 'صحة الجسم' },
  { id: 'family', label: 'الأسرة والمجتمع' },
  { id: 'nation', label: 'الوطن' },
  { id: 'world', label: 'العالم' },
  { id: 'scouting', label: 'المهارات الكشفية' },
  { id: 'artistic', label: 'التعبيرات الفنية والهوايات' }
];

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({
  isOpen,
  onClose,
  cub,
  report,
  sextetName = 'غير محدد',
  onShareWithParent,
  isSharingInProgress = false
}) => {
  if (!isOpen || !cub || !report) return null;

  const [copied, setCopied] = React.useState(false);

  // Calculate dynamic monthly average/percentage based on parameters
  const maxScore = 28; // 8 attendance + 10 technical + 10 external
  const actualScore = (report.attendanceContinuity || 0) + (report.technicalScoutingAspect || 0) + (report.externalActivities || 0);
  const monthlyPercent = Math.min(100, Math.round((actualScore / maxScore) * 100));

  // Determine a scout status badge title based on their monthly score percentage
  const getScoutStatus = (percent: number) => {
    if (percent >= 90) return 'الشبل الذهبي الخارق 👑';
    if (percent >= 75) return 'الشبل الفضي المتميز 🌟';
    if (percent >= 50) return 'الشبل المبادر النشيط ⚜️';
    return 'الشبل الطموح الصاعد 🏔️';
  };

  const getShareLink = () => {
    return `${window.location.origin}?report=monthly&cubId=${cub.id}&month=${encodeURIComponent(report.month || '')}`;
  };

  const getShareText = () => {
    return `أنا فخور جداً بإنجازات الشبل البطل "${cub.name}" في منصة الأشبال الذكية الكشفية ⚜️⛺! لقد حقق نسبة تميز قدرها ${monthlyPercent}% وحصل على تقدير [${getScoutStatus(monthlyPercent)}] لشهادة شهر ${report.month || 'مايو'} 🏆.`;
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `شهادة إنجاز الشبل البطل ${cub.name}`,
          text: getShareText(),
          url: getShareLink()
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleShareWhatsApp = () => {
    const text = `${getShareText()}\n\nرابط الشهادة والتقرير التفاعلي: ${getShareLink()}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareLink())}`;
    window.open(url, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${getShareText()}\n\nشاهد تقرير التميز التفاعلي للبطل: ${getShareLink()}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Convert current curriculum scores for the radar chart
  const radarData = CURRICULUM_FIELDS.map(f => ({
    subject: f.label,
    score: (cub.evaluation as any)?.[f.id] || 0,
    fullMark: 5
  }));

  // Trigger browser's native vector print engine
  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-md">
        {/* Backdrop listener */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 no-print"
        />

        {/* Modal Outer Shell */}
        <motion.div
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 30, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 180 }}
          className="relative w-full max-w-4xl bg-gradient-to-tr from-slate-50 to-indigo-50/30 rounded-[40px] shadow-2xl overflow-hidden border-4 border-white z-10 flex flex-col my-8 max-h-[90vh]"
        >
          {/* Action Bar (Header Actions) */}
          <div className="flex items-center justify-between p-6 bg-white border-b border-slate-100 no-print">
            <div className="flex items-center gap-3">
              <Award className="text-scout-blue animate-bounce" size={28} />
              <div>
                <h3 className="text-xl font-black text-scout-blue">معاينة التقرير الشهري للأشبال 📑</h3>
                <p className="text-xs font-bold text-slate-400">راجع البيانات الخاصة بالوثيقة أو قم بحفظها كملف PDF رقمي</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {onShareWithParent && (
                <button
                  onClick={onShareWithParent}
                  disabled={isSharingInProgress}
                  className="px-5 py-2.5 bg-scout-green text-white rounded-2xl font-black text-xs hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 border-b-2 border-green-700 shadow-md shadow-scout-green/10"
                >
                  <Share2 size={16} />
                  <span>{isSharingInProgress ? 'جاري المشاركة...' : 'حفظ ومشاركة مع الوالدين'}</span>
                </button>
              )}
              
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 bg-scout-blue text-white rounded-2xl font-black text-xs hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 border-b-2 border-blue-750 shadow-md shadow-scout-blue/10"
              >
                <Printer size={16} />
                <span>تحميل كـ PDF / طباعة 📄</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
                title="إغلاق المعاينة"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Modal Printable Content Body */}
          <div className="p-8 md:p-12 overflow-y-auto flex-1 bg-white" id="printable-scout-certificate">
            
            {/* Parent Sharing Hub (hidden during print) */}
            <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-indigo-100/40 rounded-[2rem] border border-indigo-100 no-print flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-right flex-1">
                <span className="text-[10px] font-black text-indigo-600 block uppercase tracking-wider mb-1">ركن أولياء الأمور وفخر المشاركة الرقمية الكشفية 📣</span>
                <span className="text-sm font-black text-slate-800">شارك شهادة تفوق الشبل البطل "{cub.name}" مباشرة على واتساب وفيسبوك بضغطة زر واحدة!</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                {/* Web Share API Native Share */}
                {typeof navigator !== 'undefined' && navigator.share && (
                  <button
                    onClick={handleShareNative}
                    type="button"
                    className="px-4 py-2.5 bg-scout-blue hover:bg-scout-blue/90 text-white rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer border-b-2 border-indigo-900"
                  >
                    <Share2 size={14} />
                    <span>مشاركة الجوال 📱</span>
                  </button>
                )}

                {/* WhatsApp Share */}
                <button
                  onClick={handleShareWhatsApp}
                  type="button"
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer border-b-2 border-emerald-700"
                >
                  <span className="text-sm">💬</span>
                  <span>واتساب</span>
                </button>

                {/* Facebook Share */}
                <button
                  onClick={handleShareFacebook}
                  type="button"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer border-b-2 border-blue-800"
                >
                  <span className="text-xs font-bold bg-white text-blue-600 w-4 h-4 rounded-full flex items-center justify-center font-sans">f</span>
                  <span>فيسبوك</span>
                </button>

                {/* Copy Link to Clipboard */}
                <button
                  onClick={handleCopyLink}
                  type="button"
                  className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-sm border active:scale-95 transition-all cursor-pointer ${
                    copied 
                      ? 'bg-scout-green border-scout-green text-white border-b-2 border-green-700' 
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 border-b-2'
                  }`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'تم نسخ التقدير الكشفي! ✓' : 'نسخ الرابط والتقرير 🔗'}</span>
                </button>
              </div>
            </div>

            {/* The decorative Scout Certificate Frame */}
            <div className="relative border-8 border-double border-scout-blue/30 rounded-[32px] p-6 md:p-10 bg-white shadow-inner overflow-hidden min-h-[500px]">
              
              {/* Top-Right and Bottom-Left Scout Double Corner Accents */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-scout-yellow/10 rounded-bl-[100px] border-b-4 border-l-4 border-dashed border-scout-yellow/40 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-scout-blue/10 rounded-tr-[100px] border-t-4 border-r-4 border-dashed border-scout-blue/40 pointer-events-none" />
              
              {/* Background Watermark Crest */}
              <div className="absolute inset-0 opacity-[0.03] select-none pointer-events-none flex items-center justify-center">
                <span className="text-[240px] rotate-12">⚜️</span>
              </div>

              {/* Certificate Header Row */}
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b-2 border-dashed border-slate-100">
                <div className="text-center md:text-right">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5">
                    <span className="text-3xl">⛺</span>
                    <span className="text-xl font-extrabold text-slate-800">الـمديرية العامة للمرشدات والأشبال</span>
                  </div>
                  <h2 className="text-sm font-bold text-slate-400">شعارنا الأبدي: مستعدون دائماً لبناء الغد 🌲</h2>
                </div>

                <div className="text-center">
                  <div className="w-14 h-14 bg-scout-blue/5 border-2 border-scout-blue text-scout-blue rounded-[1.5rem] flex items-center justify-center text-2xl mx-auto mb-2 shadow-sm font-black">
                     ⚜️
                  </div>
                  <span className="text-xs bg-scout-blue/10 text-scout-blue px-3 py-1 rounded-full font-black">منصة الأشبال الذكية للتطوير الرقمي</span>
                </div>

                <div className="text-center md:text-left">
                  <span className="bg-scout-yellow text-slate-800 px-4 py-1.5 rounded-full text-xs font-black tracking-wide border-2 border-white shadow-sm inline-block">
                     التقرير الدوري المعتمد 🏆
                  </span>
                  <div className="text-xs font-black text-slate-500 mt-2">
                     شهر الصدور: <span className="text-scout-blue font-extrabold">{report.month || 'مايو 2026'}</span>
                  </div>
                </div>
              </div>

              {/* Ideal Hero Feature (Star of the Month Seal overlay) */}
              {report.isStarOfMonth && (
                <div className="absolute top-28 left-4 md:left-12 z-20">
                  <motion.div
                    initial={{ rotate: -15, scale: 0.8 }}
                    animate={{ rotate: -15, scale: 1 }}
                    className="relative flex flex-col items-center justify-center w-28 h-28 bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 rounded-full border-4 border-white shadow-xl text-white transform -rotate-12 hover:scale-105 transition-all"
                  >
                    {/* Star bursts and shines */}
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-yellow-200/55 animate-spin-slow" />
                    <Star size={32} fill="currentColor" className="text-white animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-center px-1 leading-normal text-slate-900 mt-1">نجم الشهر المتميز 🌟</span>
                    <div className="absolute -bottom-1.5 bg-slate-900 text-scout-yellow text-[8px] px-2.5 py-0.5 rounded-full font-black border border-scout-yellow">بطل الفرقة</div>
                  </motion.div>
                </div>
              )}

              {/* Cub Identity Summary Block */}
              <div className="mt-8 bg-slate-50/80 p-6 rounded-[2.5rem] border border-slate-100/70 relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
                  <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-right">
                    <CubAvatar emoji={cub.avatar || '🦁'} size="lg" ring />
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">شبل فرقتنا البطل</span>
                      <h3 className="text-2xl font-black text-slate-800 mt-0.5 leading-tight">{cub.name}</h3>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                        <span className="bg-scout-blue/10 text-scout-blue px-3 py-1 rounded-full text-xs font-black border border-scout-blue/20">
                           رتبة: {cub.level}
                        </span>
                        <span className="bg-scout-yellow/10 text-slate-800 px-3 py-1 rounded-full text-xs font-black border border-scout-yellow/20">
                           سداسي: {sextetName}
                        </span>
                        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-black border border-indigo-100">
                           الرصيد العام: {cub.points} نقطة
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center md:text-left min-w-[140px] px-6 py-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <div className="text-[10px] font-black text-slate-400 uppercase">التقدير التقييمي للشهر</div>
                    <div className="text-2xl font-extrabold text-indigo-600 mt-1">{monthlyPercent}%</div>
                    <div className="text-[9px] font-black text-slate-500 mt-1 leading-relaxed bg-slate-50 p-1.5 rounded-lg border">
                      {getScoutStatus(monthlyPercent)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Sub-Scores Metrics */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                
                {/* 1. Attendance score */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4 hover:border-scout-green/30 transition-colors">
                  <div className="w-12 h-12 bg-scout-green/10 text-scout-green rounded-2xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={22} fill="currentColor" className="text-white" />
                  </div>
                  <div className="text-right flex-1 min-w-0">
                    <p className="text-[10px] text-slate-400 font-extrabold leading-normal">الحضور الاستمراري للقاءات</p>
                    <p className="text-lg font-black text-slate-800 mt-0.5">{report.attendanceContinuity || 0} / 8 اجتماع</p>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2.5">
                       <div className="bg-scout-green h-full rounded-full" style={{ width: `${Math.min(100, ((report.attendanceContinuity || 0) / 8) * 100)}%` }} />
                    </div>
                  </div>
                </div>

                {/* 2. Technical Scout evaluation */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4 hover:border-scout-blue/30 transition-colors">
                  <div className="w-12 h-12 bg-scout-blue/10 text-scout-blue rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Award size={22} />
                  </div>
                  <div className="text-right flex-1 min-w-0">
                    <p className="text-[10px] text-slate-400 font-extrabold leading-normal">النشاط والجانب الفني الكشفي</p>
                    <p className="text-lg font-black text-slate-800 mt-0.5">{report.technicalScoutingAspect || 0} / 10 درجات</p>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2.5">
                       <div className="bg-scout-blue h-full rounded-full" style={{ width: `${Math.min(100, ((report.technicalScoutingAspect || 0) / 10) * 100)}%` }} />
                    </div>
                  </div>
                </div>

                {/* 3. External Activities */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4 hover:border-scout-yellow/40 transition-colors">
                  <div className="w-12 h-12 bg-scout-yellow/10 text-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <TrendingUp size={22} />
                  </div>
                  <div className="text-right flex-1 min-w-0">
                    <p className="text-[10px] text-slate-400 font-extrabold leading-normal">الأنشطة الخارجية التطوعية</p>
                    <p className="text-lg font-black text-slate-800 mt-0.5">{report.externalActivities || 0} / 10 درجات</p>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2.5">
                       <div className="bg-scout-yellow h-full rounded-full" style={{ width: `${Math.min(100, ((report.externalActivities || 0) / 10) * 100)}%` }} />
                    </div>
                  </div>
                </div>

              </div>

              {/* Radar Assessment profile for 9 fields */}
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
                {/* Descriptive Profile text */}
                <div className="space-y-4">
                  <h4 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <Sparkles className="text-scout-yellow animate-spin-slow" size={20} /> خريطة تطور مهارات المنهج التسعة
                  </h4>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">
                    يعرض هذا المخطط توازناً شاملاً للمهارات والسمات الشخصية للشبل المسجلة تلقائياً بمرور الوقت عبر أنشطة الميدان للعلامات الدينية، التربوية، الأسرية، الكشفية والرياضية. تمثل المساحة المظللة الاتزان المتميز لشخصية البطل.
                  </p>
                  
                  <div className="p-4 bg-scout-sand/40 rounded-2xl border border-scout-yellow/10">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase mb-2">أكاديمية شارات الشبل التراكمية المعتمدة</h5>
                    {cub.badges && cub.badges.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 max-h-[70px] overflow-hidden">
                        {cub.badges.map((bName, i) => (
                          <span key={i} className="bg-white/80 border text-[9px] font-black px-2 py-1 rounded-xl text-slate-700 shadow-sm flex items-center gap-1">
                             ✨ {bName}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">الشبل يسعى بإيجابية لامتلاك وتجميع شارات تميزه الأولى قريبًا!</p>
                    )}
                  </div>
                </div>

                {/* Recharts radar chart inside modal */}
                <div className="w-full h-[280px] bg-slate-200/5 border border-dashed rounded-[2rem] flex items-center justify-center p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="62%" data={radarData}>
                      <PolarGrid stroke="#cbd5e1" strokeWidth={1} />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: '#334155', fontSize: 8, fontWeight: '850', fontFamily: 'sans-serif' }} 
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 5]} 
                        tick={{ fill: '#94a3b8', fontSize: 8 }} 
                      />
                      <Radar 
                        name="تمكن الشبل" 
                        dataKey="score" 
                        stroke="#1e3a8a" 
                        fill="#3b82f6" 
                        fillOpacity={0.25} 
                      />
                      <Tooltip 
                        formatter={(value) => [`${value} / 5`, 'التقييم']}
                        contentStyle={{ borderRadius: '16px', direction: 'rtl', fontFamily: 'sans-serif', fontSize: '11px', textAlign: 'right' }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Encouragement from Leader and mascot advice */}
              <div className="mt-8 bg-indigo-50/40 p-6 rounded-3xl border border-indigo-100 flex items-start gap-4 relative z-10">
                <div className="w-12 h-12 bg-white text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm text-2xl">
                   ✍️
                </div>
                <div className="text-right">
                  <h4 className="text-xs font-black text-indigo-800 uppercase tracking-wider mb-1">الكلمة التوجيهية الكشفية للقائد المربي</h4>
                  <p className="text-sm font-bold text-slate-700 leading-relaxed italic bg-white/70 p-4 rounded-2xl border border-slate-100">
                    "{report.encouragementWord || 'شبل متميز مفعم بالنشاط. تعاون البطل وسماته القيادية الواعدة تثلج صدورنا في القبيلة الكشفية. استمر في رعي القيم وجمع المغامرات الكشفية الذكية!'}"
                  </p>
                </div>
              </div>

              {/* Signatures footer for formal look */}
              <div className="mt-12 pt-8 border-t-2 border-dashed border-slate-100 grid grid-cols-3 gap-4 text-center justify-items-center relative z-10">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black text-slate-400">توقيع قائد فرقة الأشبال</span>
                  <div className="h-12 w-32 border-b-2 border-slate-300 border-dotted mt-2"></div>
                  <span className="text-xs font-black text-slate-700 mt-1">القائد لؤي بدير</span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black text-slate-400">توقيع قائد السداسي</span>
                  <div className="h-12 w-32 border-b-2 border-slate-300 border-dotted mt-2"></div>
                  <span className="text-xs font-black text-slate-700 mt-1">عريف الطليعة</span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black text-slate-400">توقيع ولي الأمر الفاضل</span>
                  <div className="h-12 w-32 border-b-2 border-slate-300 border-dotted mt-2"></div>
                  <span className="text-xs font-black text-slate-700 mt-1">مسؤول الرعاية الأسرية</span>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mt-8 text-center text-[10px] text-slate-300 font-medium">
                 صدرت هذه الشهادة إلكترونياً من "منصة الأشبال الذكية" ⚜️ جميع الحقوق محفوظة لفرق الكشافة الكبرى ٢٠٢٦
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
