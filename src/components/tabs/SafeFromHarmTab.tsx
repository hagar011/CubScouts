import React, { useState, useMemo } from 'react';
import { Trophy, Users } from 'lucide-react';
import { Cub, Sextet } from '../../types';
import { Podium } from '../Podium';

interface LeaderboardTabProps {
  cubs: Cub[];
  sextets: Sextet[];
}

export default function LeaderboardTab({ cubs, sextets }: LeaderboardTabProps) {
  const [activeLeaderboard, setActiveLeaderboard] = useState<'sextets' | 'cubs'>('cubs');

  const sortedCubs = useMemo(() => {
    return [...cubs].sort((a, b) => (b.points || 0) - (a.points || 0));
  }, [cubs]);

  const sortedSextets = useMemo(() => {
    return [...sextets].sort(
      (a, b) => (b.totalPoints || b.points || 0) - (a.totalPoints || a.points || 0)
    );
  }, [sextets]);

  return (
    <div className="space-y-6 animate-in fade-in duration-350 text-right font-sans" dir="rtl">
      {/* Tab Select Header */}
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
                            <p className="text-[10px] text-slate-400 font-bold">{cub.level}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-scout-blue/5 border text-[11px] font-black text-scout-blue rounded-full">
                          {cub.points} نقطة
                        </span>
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
    </div>
  );
}