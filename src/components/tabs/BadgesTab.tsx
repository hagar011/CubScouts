import React, { useState } from 'react';
import { Sparkles, Trophy, Star, ShieldCheck, HelpCircle } from 'lucide-react';
import { Cub, UserRole } from '../../types';
import { AVAILABLE_BADGES, checkNewBadges, Badge } from '../../badges';
import { LEADERSHIP_BADGES } from '../../constants/scoutData';
import { BadgeTooltip, BadgeIconDisplay } from '../UI/ScoutUI';

interface BadgesTabProps {
  role: UserRole;
  activeCub: Cub | null;
  cubs: Cub[];
  onToggleBadge: (cubId: string, badgeName: string) => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function BadgesTab({ role, activeCub, cubs, onToggleBadge, showToast }: BadgesTabProps) {
  const [selectedCubId, setSelectedCubId] = useState<string>('');
  const [selectedBadgeName, setSelectedBadgeName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLeader = role === UserRole.LEADER;

  // Handles leader issuing/revoking a badge manually
  const handleSubmitBadgeAward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCubId || !selectedBadgeName) {
      showToast('يرجى تحديد الشبل والشارة المراد منحها!', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      await onToggleBadge(selectedCubId, selectedBadgeName);
      setSelectedBadgeName('');
    } catch (err) {
      showToast('فشل منح الشارة، يرجى المحاولة لاحقاً', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine which badges the current cub has earned
  const earnedBadgesSet = new Set(activeCub?.badges || []);

  return (
    <div className="space-y-8 animate-in fade-in duration-350 text-right font-sans" dir="rtl">
      <div className="rounded-[30px] bg-gradient-to-r from-scout-blue via-blue-700 to-scout-green px-5 py-4 text-white shadow-[0_18px_40px_rgba(37,99,235,0.22)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black tracking-[0.24em] text-blue-100">BADGES</p>
            <h2 className="mt-1 text-xl font-black">سجل الأوسمة والشارات</h2>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
            <Trophy className="text-scout-yellow" size={22} />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <Star className="text-scout-yellow animate-spin-slow" size={24} fill="currentColor" /> سجل الأوسمة والشارات التقديرية للأشبال
        </h2>
        <p className="text-xs text-slate-500 font-bold mt-2">
          {isLeader 
            ? 'بصفتك القائد المربي، يمكنك رصد ومتابعة الشارات المعتمدة ومنحها يدوياً للأشبال المتميزين.'
            : `الشبل البطل ${activeCub?.name || ''} يمتلك ${earnedBadgesSet.size} أوسمة مسجلة حالياً في أكاديميته الكشفية.`}
        </p>
      </div>

      {isLeader && (
        <form onSubmit={handleSubmitBadgeAward} className="p-6 bg-white border-2 border-scout-yellow/30 rounded-[32px] shadow-[0_16px_40px_rgba(15,23,42,0.04)] space-y-4">
          <h3 className="text-sm font-black text-scout-blue flex items-center gap-1.5">
            <span>🎖️</span> لوحة القائد لمنح/استرداد الأوسمة والشارات
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500">اختر الشبل المتميز</label>
              <select
                required
                value={selectedCubId}
                onChange={(e) => setSelectedCubId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-bold outline-none text-xs"
              >
                <option value="">-- حدد شبل من الفرقة --</option>
                {cubs.map((cub) => (
                  <option key={cub.id} value={cub.id}>
                    {cub.name} ({cub.level}) - سداسي {cub.sextetId || 'غير محدد'}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500">الشارة أو الوسام المشمول</label>
              <select
                required
                value={selectedBadgeName}
                onChange={(e) => setSelectedBadgeName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-bold outline-none text-xs"
              >
                <option value="">-- اختر وسام الفئة المطلوبة --</option>
                {AVAILABLE_BADGES.map((b) => {
                  const hasSelectedCubEarned = selectedCubId 
                    ? cubs.find(c => c.id === selectedCubId)?.badges?.includes(b.name) 
                    : false;
                  return (
                    <option key={b.id} value={b.name}>
                      {b.name} - ({b.category}) {hasSelectedCubEarned ? '✓ [ممنوحة بالفعل]' : '[غير ممنوحة]'}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-scout-blue to-blue-700 hover:from-blue-700 hover:to-scout-blue text-white font-black text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            {isSubmitting ? 'جاري تحديث سجل الشارات...' : 'اعتماد وتغيير حالة الشارة ✓'}
          </button>
        </form>
      )}

      <div className="space-y-4">
        <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5">
          <span>🏅</span> شارات وأوسمة الأنشطة المنهجية المعتمدة
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {AVAILABLE_BADGES.map((badge) => {
            const isEarned = isLeader ? false : earnedBadgesSet.has(badge.name);
            return (
              <BadgeTooltip
                key={badge.id}
                title={badge.name}
                description={badge.description}
                category={badge.category}
              >
                <div className="flex flex-col items-center bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:scale-[1.03] transition-all relative select-none">
                  <BadgeIconDisplay badge={badge} size="md" isEarned={isLeader ? true : isEarned} />
                  <span className="font-black text-xs text-slate-800 text-center mt-3 truncate w-full">
                    {badge.name}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold mt-1 text-center bg-slate-50 px-2 py-0.5 rounded">
                    {badge.category}
                  </span>

                  {!isLeader && isEarned && (
                    <div className="absolute top-2 right-2 bg-scout-green text-white p-1 rounded-full border border-white h-5 w-5 flex items-center justify-center text-[10px] font-black">
                      ✓
                    </div>
                  )}
                </div>
              </BadgeTooltip>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5">
          <span>🪵</span> ألقاب ودروع الكرامة الرعوية والريادية
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {LEADERSHIP_BADGES.map((lBadge, idx) => (
            <div key={idx} className="p-5 rounded-3xl bg-slate-50 border border-slate-200 flex items-start gap-4 shadow-sm hover:border-scout-blue/20 transition-all select-none">
              <span className="text-4xl filter drop-shadow bg-white rounded-2xl h-14 w-14 flex items-center justify-center border shrink-0">
                {lBadge.icon}
              </span>
              <div className="space-y-1">
                <h4 className="font-black text-sm text-slate-800">{lBadge.title}</h4>
                <p className="text-[10px] text-slate-500 font-bold leading-normal">{lBadge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
