import React, { useState, useMemo } from 'react';
import { Trophy, Users, PlusCircle, CheckCircle } from 'lucide-react';
import { Cub, Sextet } from '../../types';
import { Podium } from '../Podium';

interface LeaderboardTabProps {
  cubs: Cub[];
  sextets: Sextet[];
  onAddPoints?: (cubId: string, pts: number) => void;
}

export default function LeaderboardTab({ cubs, sextets, onAddPoints }: LeaderboardTabProps) {
  const [activeLeaderboard, setActiveLeaderboard] = useState<'sextets' | 'cubs'>('cubs');
  const [selectedCub, setSelectedCub] = useState<Cub | null>(null);
  const [pointsToAdd, setPointsToAdd] = useState(10);
  const [reason, setReason] = useState('التزام ونشاط كشفي');

  const sortedCubs = useMemo(() => {
    return [...cubs].sort((a, b) => (b.points || 0) - (a.points || 0));
  }, [cubs]);

  const sortedSextets = useMemo(() => {
    return [...sextets].sort(
      (a, b) => (b.totalPoints || b.points || 0) - (a.totalPoints || a.points || 0)
    );
  }, [sextets]);

  const handleConfirmPoints = () => {
    if (selectedCub && onAddPoints) {
      onAddPoints(selectedCub.id, pointsToAdd);
    }
    setSelectedCub(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-350 text-right font-sans" dir="rtl">
      {/* Header and Tab Switcher */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Trophy size={22} className="text-scout-yellow animate-bounce" /> سجل شرف المتصدرين والأبطال الكشفيين
          </h2>
          <p className="text-xs text-slate-500 font-bold">كل إنجاز تسجله في الميدان يرفع ترتيبك وسداسيتك نحو القمة!</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl border gap-2 shrink-0">
          <button
            onClick={() => setActiveLeaderboard('cubs')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeLeaderboard === 'cubs'
                ? 'bg-scout-blue text-white shadow'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            الأشبال الفردي 🧑‍🚀
          </button>
          <button
            onClick={() => setActiveLeaderboard('sextets')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeLeaderboard === 'sextets'
                ? 'bg-scout-blue text-white shadow'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            السداسيات (الفرق) 🤝
          </button>
        </div>
      </div>

      {/* Cubs Leaderboard View */}
      {activeLeaderboard === 'cubs' ? (
        <div className="space-y-6">
          {sortedCubs.length > 0 ? (
            <div>
              <Podium items={sortedCubs} type="cubs" />
              {sortedCubs.length > 3 && (
                <div className="bg-white rounded-[32px] border border-slate-200 p-6 space-y-3 shadow-inner">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wide">ترتيب باقي الأشبال في الفرقة</h4>
                  <div className="divide-y divide-slate-100">
                    {sortedCubs.slice(3).map((cub, idx) => (
                      <div key={cub.id} className="flex items-center justify-between py-4 select-none">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-extrabold text-xs flex items-center justify-center">
                            #{idx + 4}
                          </span>
                          <span className="text-2xl">{cub.avatar || '🦁'}</span>
                          <div>
                            <h5 className="font-black text-sm text-slate-800">{cub.name}</h5>
                            <p className="text-[10px] text-slate-400 font-bold">{cub.level || 'شبل'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-scout-blue/5 border text-[11px] font-black text-scout-blue rounded-full">
                            {cub.points || 0} نقطة
                          </span>
                          {onAddPoints && (
                            <button
                              onClick={() => setSelectedCub(cub)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                              title="إضافة نقاط للشبل"
                            >
                              <PlusCircle size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 font-black italic">
              لا توجد بيانات أشبال مسجلة لعرض الترتيب حالياً.
            </div>
          )}
        </div>
      ) : (
        /* Sextets Leaderboard View */
        <div className="space-y-6">
          {sortedSextets.length > 0 ? (
            <div>
              <Podium items={sortedSextets} type="sextets" />
              {sortedSextets.length > 3 && (
                <div className="bg-white rounded-[32px] border border-slate-200 p-6 space-y-3 shadow-inner">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wide">ترتيب باقي المجموعات والسداسيات</h4>
                  <div className="divide-y divide-slate-100">
                    {sortedSextets.slice(3).map((sex, idx) => (
                      <div key={sex.id} className="flex items-center justify-between py-4 select-none">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-extrabold text-xs flex items-center justify-center">
                            #{idx + 4}
                          </span>
                          <div className={`w-10 h-10 ${sex.color || 'bg-slate-500'} rounded-2xl flex items-center justify-center text-white text-lg`}>
                            <Users size={20} />
                          </div>
                          <div>
                            <h5 className="font-black text-sm text-slate-800">{sex.name}</h5>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-scout-blue/5 border text-[11px] font-black text-scout-blue rounded-full">
                          {sex.totalPoints || sex.points || 0} نقطة
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 font-black italic">
              لا توجد بيانات سداسيات مسجلة لعرض الترتيب حالياً.
            </div>
          )}
        </div>
      )}

      {/* Quick Add Points Modal */}
      {selectedCub && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-black text-sm text-slate-800 border-b pb-3">
              إضافة نقاط مباشرة للشبل: <span className="text-scout-blue">{selectedCub.name}</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">اختر عدد النقاط:</label>
                <div className="flex gap-2">
                  {[5, 10, 15, 20, 25].map((pts) => (
                    <button
                      key={pts}
                      type="button"
                      onClick={() => setPointsToAdd(pts)}
                      className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all ${
                        pointsToAdd === pts
                          ? 'bg-scout-blue text-white border-scout-blue'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      +{pts}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">سبب التقدير / النشاط:</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none text-slate-800"
                >
                  <option>التزام ونشاط كشفي</option>
                  <option>تحدي التنمية المستدامة (SDGs)</option>
                  <option>سلوك متميز وحماية من الأذى</option>
                  <option>تفوق في حفل السمر والمسابقات</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleConfirmPoints}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs shadow transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <CheckCircle size={15} /> تأكيد الإضافة
              </button>
              <button
                type="button"
                onClick={() => setSelectedCub(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black text-xs transition-all cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}