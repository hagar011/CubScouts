import React, { useState, useMemo } from 'react';
import {
  Users, Plus, Compass, Flame, Trophy,
  Map as MapIcon, Lock, Unlock,
} from 'lucide-react';
import { Cub, UserRole, Sextet, PendingPointRequest, GlobalTask, ParentCubRelationship } from '../../types';
import ParentChildrenPanel from '../linking/ParentChildrenPanel';
import LeaderLinksPanel from '../linking/LeaderLinksPanel';
import { Mascot } from '../UI/ScoutUI';
import { SEXTETS } from '../../constants/initialData';
import { SECRET_MISSION } from '../../constants/scoutData';
import { User as FirebaseUser } from 'firebase/auth';

interface DashboardTabProps {
  role: UserRole;
  currentUser: FirebaseUser | null;
  userProfile: Record<string, unknown> | null;
  activeCub: Cub | null;
  cubs: Cub[];
  sextets: Sextet[];
  pendingPoints: PendingPointRequest[];
  globalTasks: GlobalTask[];
  safetyReports: Record<string, unknown>[];
  onDeleteCub: (id: string) => void;
  onSelectCub: (id: string | null) => void;
  onWeeklyEvaluation: (id: string) => Promise<void>;
  onSaveMonthlyReport: (id: string) => Promise<void>;
  onApprovePendingCub: (cubId: string, name: string, selectedSextetId: string) => Promise<void>;
  onRejectPendingCub: (cubId: string, name: string) => Promise<void>;
  onApproveUser: (uid: string) => Promise<void>;
  onRejectUser: (uid: string) => Promise<void>;
  onApproveRequest: (requestId: string) => Promise<void>;
  onApprovePromotion: (cubId: string, stepNumber: number) => Promise<void>;
  onToggleGamesLocked: () => Promise<void>;
  gamesLocked: boolean;
  setShowAddCubModal: (show: boolean) => void;
  setShowAddLeaderModal: (show: boolean) => void;
  setShowMap: (show: boolean) => void;
  showMap: boolean;
  setView: (view: 'dashboard' | 'evaluate' | 'game' | 'progress' | 'law' | 'badges' | 'meetings' | 'safeFromHarm' | 'leaderboard' | 'activities') => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  showConfirm: (msg: string) => Promise<boolean>;
  onConfirmTaskByParent: (cubId: string, taskName: string) => Promise<void>;
  parentChildren?: Cub[];
  parentRelationships?: ParentCubRelationship[];
  onSelectChild?: (cubId: string) => void;
  onOpenLinkModal?: () => void;
}

export default function DashboardTab({
  role,
  currentUser,
  userProfile,
  activeCub,
  cubs,
  sextets,
  pendingPoints,
  globalTasks,
  safetyReports,
  onDeleteCub,
  onSelectCub,
  onWeeklyEvaluation,
  onSaveMonthlyReport,
  onApprovePendingCub,
  onRejectPendingCub,
  onApproveUser,
  onRejectUser,
  onApproveRequest,
  onApprovePromotion,
  onToggleGamesLocked,
  gamesLocked,
  setShowAddCubModal,
  setShowAddLeaderModal,
  setShowMap,
  showMap,
  setView,
  showToast,
  showConfirm,
  onConfirmTaskByParent,
  parentChildren = [],
  parentRelationships = [],
  onSelectChild,
  onOpenLinkModal,
}: DashboardTabProps) {
  const [leaderSubTab, setLeaderSubTab] = useState<'roster' | 'approvals' | 'links' | 'security'>('roster');
  const [assignedSextets, setAssignedSextets] = useState<Record<string, string>>({});
  const [parentSuccessMessage, setParentSuccessMessage] = useState<string | null>(null);

  const isLeader = role === UserRole.LEADER;
  const isCub = role === UserRole.CUB;
  const isParent = role === UserRole.PARENT;

  const pendingCubsList = useMemo(() => {
    return cubs.filter(c => c.status === 'pending');
  }, [cubs]);

  const stats = useMemo(() => {
    const totalCubs = cubs.filter(c => c.status !== 'pending').length;

    const totalSextets = sextets.length;

    const totalPoints = cubs.reduce(
      (acc, c) => acc + (c.points || 0),
      0
    );

    const avgScore =
      totalCubs > 0
        ? Math.round(totalPoints / totalCubs)
        : 0;

    const topCub =
      cubs.length > 0
        ? [...cubs].sort(
          (a, b) => (b.points || 0) - (a.points || 0)
        )[0]
        : null;

    const topSextet =
      sextets.length > 0
        ? [...sextets].sort(
          (a, b) =>
            (b.totalPoints || b.points || 0) -
            (a.totalPoints || a.points || 0)
        )[0]
        : null;

    return {
      totalCubs,
      totalSextets,
      totalPoints,
      avgScore,
      topCub,
      topSextet,
    };
  }, [cubs, sextets]);

  const handleParentDeedSubmit = async (taskName: string) => {
    if (!activeCub) {
      showToast('خطأ: لا يوجد شبل مرتبط بحسابك حالياً!', 'error');
      return;
    }
    try {
      await onConfirmTaskByParent(activeCub.id, taskName);
      setParentSuccessMessage(`تم إرسال إشعار تفعيل مهمة "${taskName}" لقائد الفرقة لمراجعة النقاط! ⚜️`);
      setTimeout(() => setParentSuccessMessage(null), 5000);
    } catch {
      showToast('تعذر إرسال الطلب، يرجى إعادة المحاولة.', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-350 text-right font-sans" dir="rtl">
      <div className="rounded-[30px] bg-gradient-to-r from-scout-blue via-blue-700 to-scout-green px-5 py-4 text-white shadow-[0_18px_40px_rgba(37,99,235,0.22)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black tracking-[0.24em] text-blue-100">DASHBOARD</p>
            <h3 className="mt-1 text-xl font-black">لوحة قيادة الفرقة</h3>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
            <Users className="text-scout-yellow" size={22} />
          </div>
        </div>
      </div>

      {isLeader && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            {[
              {
                label: 'إجمالي الأشبال 🦁',
                value: stats.totalCubs,
                icon: <Users size={22} />,
                desc: 'الأشبال المعتمدون حاليًا'
              },
              {
                label: 'إجمالي النقاط ⭐',
                value: `${stats.totalPoints} نقطة`,
                icon: <Flame size={22} />,
                desc: 'مجموع نقاط كل الأشبال'
              },
              {
                label: 'أفضل شبل 🏆',
                value: stats.topCub ? stats.topCub.name : 'لا يوجد',
                icon: <Trophy size={22} />,
                desc: stats.topCub ? `${stats.topCub.points || 0} نقطة` : 'لم يبدأ التقييم بعد'
              },
              {
                label: 'أفضل سداسي ⛺',
                value: stats.topSextet ? stats.topSextet.name : 'لا يوجد',
                icon: <Compass size={22} />,
                desc: stats.topSextet
                  ? `${stats.topSextet.totalPoints || stats.topSextet.points || 0} نقطة`
                  : 'لا توجد نقاط بعد'
              },
              {
                label: 'متوسط النقاط 📊',
                value: `${stats.avgScore} نقطة`,
                icon: <Flame size={22} />,
                desc: 'متوسط أداء الأشبال'
              },
            ].map((st, i) => (
              <div key={i} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-[0_12px_28px_rgba(15,23,42,0.04)] flex items-start gap-4">
                <span className="p-3 bg-scout-blue/5 text-scout-blue rounded-2xl h-12 w-12 flex items-center justify-center shrink-0">
                  {st.icon}
                </span>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 block">{st.label}</span>
                  <span className="text-xl font-black text-slate-800 block">{st.value}</span>
                  <span className="text-[9px] text-slate-500 block leading-tight">{st.desc}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 bg-slate-50 p-4 rounded-3xl border border-slate-200">
            <button
              onClick={() => setShowAddCubModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-scout-blue to-blue-700 text-white rounded-xl text-xs font-black hover:from-blue-700 hover:to-scout-blue transition-all shadow-lg shadow-blue-500/20 flex items-center gap-1"
            >
              <Plus size={14} /> إضافة شبل جديد يدوياً
            </button>
            <button
              onClick={() => setShowAddLeaderModal(true)}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black hover:bg-slate-50 transition-colors flex items-center gap-1"
            >
              <Plus size={14} /> تسجيل قائد مساعد
            </button>
            <button
              onClick={onToggleGamesLocked}
              className={`px-5 py-2.5 rounded-xl text-xs font-black shadow transition-all flex items-center gap-1.5 ${gamesLocked
                  ? 'bg-amber-100 border border-amber-300 text-amber-800'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                }`}
            >
              {gamesLocked ? <Lock size={14} /> : <Unlock size={14} />}
              <span>{gamesLocked ? 'ألعاب الأشبال (مغلقة ومؤمنة)' : 'ألعاب الأشبال (مفتوحة حالياً)'}</span>
            </button>
          </div>

          <div className="flex border-b border-slate-200 gap-4 mt-8">
            <button
              onClick={() => setLeaderSubTab('roster')}
              className={`pb-3 border-b-4 font-black text-xs transition-colors ${leaderSubTab === 'roster' ? 'text-scout-blue border-scout-blue' : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              👥 السجلات والسداسيات الكشفية ({stats.totalCubs})
            </button>
            <button
              onClick={() => setLeaderSubTab('approvals')}
              className={`pb-3 border-b-4 font-black text-xs transition-colors relative ${leaderSubTab === 'approvals' ? 'text-scout-blue border-scout-blue' : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              🛡️ طلبات الانضمام والموافقة
              {(pendingCubsList.length + pendingPoints.filter(p => p.status === 'pending').length) > 0 && (
                <span className="absolute -top-1 -left-2 bg-rose-500 text-white font-extrabold h-4 w-4 rounded-full text-[8px] flex items-center justify-center animate-pulse">
                  {pendingCubsList.length + pendingPoints.filter(p => p.status === 'pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setLeaderSubTab('links')}
              className={`pb-3 border-b-4 font-black text-xs transition-colors ${leaderSubTab === 'links' ? 'text-scout-blue border-scout-blue' : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              🔗 ربط أولياء الأمور
            </button>
          </div>

          {/* Tab: Links (parents ↔ cubs) */}
          {leaderSubTab === 'links' && currentUser && (
            <LeaderLinksPanel cubs={cubs} leaderUid={currentUser.uid} />
          )}

          {/* Tab: Roster */}
          {leaderSubTab === 'roster' && (
            <div className="space-y-6">
              {SEXTETS.map((sex) => {
                const sexCubs = cubs.filter(
                  (c) =>
                    String(c.sextetId || '') === String(sex.id) &&
                    c.status !== 'pending'
                );
                return (
                  <div key={sex.id} className="bg-white rounded-[32px] border border-slate-200 p-6 space-y-4 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full ${sex.color} flex items-center justify-center text-white text-sm`}>
                          ⛺
                        </span>
                        <div>
                          <h4 className="font-black text-sm text-slate-800">{sex.name}</h4>
                          <span className="text-[10px] text-slate-400 font-bold">ثقافة المآثر والمودة المتبادلة</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                        القوة: {sexCubs.length} أشبال
                      </span>
                    </div>

                    {sexCubs.length > 0 ? (
                      <div className="divide-y divide-slate-100 select-none">
                        {sexCubs.map((cub) => (
                          <div key={cub.id} className="flex flex-wrap items-center justify-between py-4 gap-4">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl bg-slate-50 rounded-2xl h-12 w-12 flex items-center justify-center border">
                                {cub.avatar || '🦁'}
                              </span>
                              <div>
                                <h5 className="font-black text-xs text-slate-800">{cub.name}</h5>
                                <p className="text-[9px] text-slate-400 font-bold">{cub.level || 'شبل مبتدئ'} • {cub.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="px-2.5 py-1 bg-amber-500/10 text-amber-700 text-[10px] font-black rounded-lg">
                                🌟 {cub.points} نقطة
                              </span>
                              <button
                                onClick={() => setView('evaluate')}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-scout-blue hover:text-white rounded-lg text-[10px] font-black transition-colors"
                              >
                                تقييم العضو 📋
                              </button>
                              <button
                                onClick={async () => {
                                  const ok = confirm(`هل تريد بالتأكيد حذف الشبل "${cub.name}" وسحب كامل سجلاته؟`);
                                  if (ok) onDeleteCub(cub.id);
                                }}
                                className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors border"
                                title="حذف الشبل"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-405 font-bold italic py-4">لا يوجد أشبال مقيدين في هذا السداسي حالياً.</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab: Approvals */}
          {leaderSubTab === 'approvals' && (
            <div className="space-y-6">
              <div className="bg-white rounded-[32px] border border-slate-200 p-6 space-y-4 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
                <h4 className="font-black text-xs text-scout-blue flex items-center gap-1.5">
                  <span>🏡</span> تقارير إشعار أولياء الأمور (المهام المنزلية)
                </h4>
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed mb-4">
                  يقوم الآباء بإتاحة تسجيل المهام والسلوكيات المنزلية المتميزة. كقائد، قم بتقدير هذه السلوكيات والمصادقة لمنح شعلات الحافز المناسبة لدعم التعاون التربوي.
                </p>
                {pendingPoints.filter(p => p.status === 'pending').length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {pendingPoints.filter(p => p.status === 'pending').map((req) => {
                      const cubName = cubs.find(c => c.id === req.cubId)?.name || 'شبل مجهول';
                      return (
                        <div key={req.id} className="flex items-center justify-between py-4">
                          <div className="space-y-1">
                            <h5 className="font-black text-xs text-slate-800">{req.type === 'parent_task' ? 'مهمة منزلية' : 'نشاط'}: "{req.taskName || req.reason || '—'}"</h5>
                            <p className="text-[10px] text-slate-400 font-bold">
                              المستفيد: الشبل <span className="text-scout-blue">{cubName}</span> • الاستحقاق المقترح: ({req.points} نقطة)
                            </p>
                          </div>
                          <button
                            onClick={() => onApproveRequest(req.id)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] rounded-xl shadow"
                          >
                            اعتماد ومنح النقاط ✓
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 font-bold italic py-4">لا توجد طلبات معلقة من أولياء الأمور حالياً.</p>
                )}
              </div>

              {/* Cub sign-up requests */}
              <div className="bg-white rounded-[32px] border border-slate-200 p-6 space-y-4 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
                <h4 className="font-black text-xs text-scout-blue flex items-center gap-1.5">
                  <span>⛺</span> طلبات تسجيل العضوية المباشرة للأشبال
                </h4>
                {pendingCubsList.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {pendingCubsList.map((cub) => {
                      const selSextet = assignedSextets[cub.id] || '';
                      return (
                        <div key={cub.id} className="flex flex-col md:flex-row md:items-center justify-between py-5 gap-4">
                          <div className="space-y-1">
                            <h5 className="font-black text-xs text-slate-800">{cub.name}</h5>
                            <p className="text-[10px] text-slate-400 font-bold">{cub.email} • الهاتف: {cub.phone || 'غير مسجل'}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <select
                              required
                              value={selSextet}
                              onChange={(e) => setAssignedSextets({ ...assignedSextets, [cub.id]: e.target.value })}
                              className="bg-slate-50 border border-slate-200 py-2 px-3 rounded-xl font-bold text-[10px] outline-none"
                            >
                              <option value="">-- حدد السداسي --</option>
                              {SEXTETS.map(s => (
                                <option key={s.id} value={s.id}>سداسي {s.name}</option>
                              ))}
                            </select>
                            <button
                              disabled={!selSextet}
                              onClick={() => onApprovePendingCub(cub.id, cub.name, selSextet)}
                              className="px-4 py-2 bg-scout-blue hover:bg-blue-800 text-white font-black text-[10px] rounded-xl disabled:bg-slate-200 shrink-0"
                            >
                              قبول وتعيين السداسي ✓
                            </button>
                            <button
                              onClick={() => onRejectPendingCub(cub.id, cub.name)}
                              className="px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl font-black text-[10px]"
                            >
                              رفض الطلب
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 font-bold italic py-4">لا توجد طلبات معلقة لتسجيل الأشبال حالياً.</p>
                )}
              </div>

            </div>
          )}

        </div>
      )}

      {/* ─── 2. CUB DASHBOARD ─── */}
      {isCub && activeCub && (
        <div className="space-y-8">

          {/* Welcome Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2 bg-gradient-to-r from-scout-blue to-blue-900 rounded-[38px] p-6 text-white border-4 border-scout-yellow/20 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 shadow-[0_18px_40px_rgba(37,99,235,0.22)]">
              <div className="text-5xl filter drop-shadow bg-white/10 rounded-2xl h-16 w-16 flex items-center justify-center shrink-0">
                ⭐
              </div>
              <div className="space-y-2 text-center md:text-right">
                <span className="text-[10px] bg-scout-yellow/20 text-scout-yellow px-3 py-0.5 rounded-full font-black">
                  ركن الشبل المغامر ⛺⚜️
                </span>
                <h2 className="text-xl font-black">أهلاً بك يا بطل الفرقة، الشبل {activeCub.name}!</h2>
                <p className="text-xs opacity-80 leading-relaxed max-w-md">
                  نشاطك الدؤوب والالتزام بالزي والصلاة يمنحك الترقية الكبرى! رصيد نقاطك الحالي هو{' '}
                  <span className="font-extrabold text-scout-yellow">{activeCub.points || 0}</span> نقطة.
                </p>
              </div>
            </div>
            <div className="lg:col-span-1 bg-white p-5 rounded-[32px] border border-slate-200 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
              <Mascot name="أكيلا" />
            </div>
          </div>

          {/* Journey Map */}
          <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-[0_16px_40px_rgba(15,23,42,0.04)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-black text-sm text-slate-800 flex items-center gap-1.5">
                  <MapIcon size={18} className="text-emerald-600" />
                  خريطة المغامرة والمرتبة المنهجية
                </h4>
                <p className="text-[10px] text-slate-500 font-bold leading-normal mt-1">
                  تتبع رحلة صعودك في فرقة الأشبال من "القبول" وحتى رتبة "الشبل الأول المتميز"!
                </p>
              </div>
              <button
                onClick={() => setShowMap(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow hover:scale-[1.03] transition-transform cursor-pointer"
              >
                عرض خريطة المغامرة الكبرى 🗺️
              </button>
            </div>
          </div>

          {/* Home tasks & Secret mission */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

            <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-[0_16px_40px_rgba(15,23,42,0.04)] space-y-4">
              <h4 className="font-black text-xs text-scout-blue flex items-center gap-1.5">
                <span>🏡</span> المهام المنزلية التشاركية للأسبوع الحالي
              </h4>
              <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                اعمل مع والديك بالمنزل، وحقق المهام التالية، ثم اطلب من ولي أمرك تأكيد السلوك بالزر المخصص لمشاركة الإنجاز مع القائد للفوز بـ 40 شعلة حافز!
              </p>
              <div className="space-y-2 mt-4 select-none">
                {[
                  { name: 'المحافظة على الصلاة في وقتها الجماعي', points: '40' },
                  { name: 'ترتيب سريري وغرفتي قبل التوجه للمدرسة', points: '40' },
                  { name: 'قراءة قصة هادفة والمناقشة مع أبي أو أمي', points: '40' },
                  { name: 'مساعدة الوالدين في تزيين أو ري حديقة البيت', points: '40' },
                ].map((challenge, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-2xl border flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800 block">{challenge.name}</span>
                      <span className="text-[9px] text-scout-yellow font-black block">حافز المهمة: +{challenge.points} شعلة</span>
                    </div>
                    <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs">🏠</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent rounded-[32px] p-6 border-2 border-amber-500/20 space-y-4">
              <span className="text-4xl">🕵️</span>
              <h4 className="font-black text-sm text-amber-900">المهمة الاستكشافية السرية الأسبوعية!</h4>
              <div className="space-y-2 bg-white/70 p-4 rounded-2xl border leading-relaxed">
                <span className="text-[10px] bg-amber-500 text-white font-extrabold px-2 py-0.5 rounded uppercase font-sans tracking-wide">
                  الرمز السري للأدغال
                </span>
                <p className="text-xs font-black text-slate-800 mt-2">
                  {typeof SECRET_MISSION === 'string' ? SECRET_MISSION : SECRET_MISSION.title}
                </p>
                {typeof SECRET_MISSION !== 'string' && (
                  <p className="text-[10px] text-slate-500 font-bold mt-1">{SECRET_MISSION.description}</p>
                )}
              </div>
              <p className="text-[9px] text-slate-500 font-bold">
                تذكر يا بطل، الكشافة أخلاق وعمل في صمت. حقق هذه المهمة بحكمة الخفاء وسيعرف أكيلا الحكيم تفاصيلها دائماً!
              </p>
            </div>

          </div>
        </div>
      )}

      {/* ─── 3. PARENT DASHBOARD ─── */}
      {isParent && (
        <div className="space-y-8">
          <ParentChildrenPanel
            kids={parentChildren}
            relationships={parentRelationships}
            activeCubId={activeCub?.id || null}
            onSelect={(id) => onSelectChild?.(id)}
            onLink={() => onOpenLinkModal?.()}
          />

          {activeCub ? (
            <div className="space-y-6">

              {/* Banner */}
              <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-6 md:p-8 rounded-[38px] text-white border-2 border-slate-200/15 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_20px_45px_rgba(30,41,59,0.28)]">
                <div className="flex items-center gap-4">
                  <span className="text-4xl bg-white/10 rounded-2xl h-14 w-14 flex items-center justify-center">🤝</span>
                  <div>
                    <span className="text-[10px] bg-scout-blue px-3 py-0.5 rounded-full block text-white font-black w-fit">بوابة أولياء الأمور للشراكة التربوية⚜️</span>
                    <h2 className="text-xl font-black mt-2">والد/والدة الشبل: {activeCub.name}</h2>
                    <p className="text-[10px] opacity-75 mt-1 font-bold">
                      الشبل مقيد حالياً بسداسي: <span className="text-scout-yellow">سداسي {activeCub.sextetId || 'غير محدد'}</span>
                    </p>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center shrink-0 min-w-[140px]">
                  <span className="text-[10px] font-black text-slate-400 block">مجموع نقاط الشبل</span>
                  <span className="text-2xl font-black text-scout-yellow block mt-0.5">{activeCub.points} نقطة</span>
                  <span className="text-[9px] text-scout-green block mt-1 font-extrabold">{activeCub.level}</span>
                </div>
              </div>

              {parentSuccessMessage && (
                <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-black animate-in slide-in-from-top-2 duration-300">
                  {parentSuccessMessage}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Deed confirmation */}
                <div className="lg:col-span-2 bg-white rounded-[32px] border border-slate-200 p-6 space-y-4 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
                  <h4 className="font-black text-xs text-scout-blue flex items-center gap-1.5">
                    <span>💡</span> لوحة الإبلاغ عن إنجاز وسلوكيات الشبل في المنزل
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold leading-relaxed mb-4">
                    يسعدنا جداً مشاركتكم غابة الأشبال للتأثير التربوي. إذا قام الشبل بأي من السلوكيات الرائدة بالمنزل الموصى بها كشفياً، انقر على تفعيل المهمة ليتم رصدها تلقائياً لدى قائد الفرقة كطلب معلق للنقاط!
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 select-none">
                    {[
                      'المحافظة على الصلاة في وقتها الجماعي',
                      'ترتيب السرير والغرف قبل التوجه للمدرسة',
                      'قراءة قصة هادفة والمناقشة مع الأهل',
                      'التعاون في المهام وتلبية أوامر الوالدين بحب وبشاشة',
                    ].map((deed, i) => (
                      <button
                        key={i}
                        onClick={() => handleParentDeedSubmit(deed)}
                        className="p-4 text-right bg-slate-50 hover:bg-slate-100 hover:border-scout-blue/30 rounded-2xl border border-slate-200 transition-all flex items-center justify-between text-xs font-black gap-4"
                      >
                        <span className="text-slate-800">{deed}</span>
                        <span className="text-scout-blue text-xs font-serif shrink-0">←</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Monthly reports */}
                <div className="lg:col-span-1 bg-white rounded-[32px] border border-slate-200 p-6 space-y-4 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
                  <h4 className="font-black text-xs text-slate-800 flex items-center gap-1.5">
                    <span>📑</span> تقارير الشبل والنشاط الشهري
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                    من خلال هذه المساحة، يرفع لكم قادة الفرقة ملخص التقييم الشهري، مستوى المواظبة، والاستحقاقات الأكاديمية للشبل.
                  </p>
                  {activeCub.monthlyReports && activeCub.monthlyReports.length > 0 ? (
                    <div className="space-y-2 mt-4">
                      {activeCub.monthlyReports.map((rep, index) => (
                        <div key={index} className="p-3 bg-slate-50 border rounded-2xl flex items-center justify-between text-xs font-black">
                          <span className="text-slate-800">تقرير شهر: {rep.month}</span>
                          <span className="px-2.5 py-1 bg-scout-blue/10 text-scout-blue rounded-lg text-[9px]">
                            {rep.isStarOfMonth ? '🌟 شبل الشهر المتميز' : 'معتمد'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 font-bold italic py-4">لا توجد تقارير دورية معتمدة للشبل هذا الشهر بعد.</p>
                  )}
                </div>

              </div>
            </div>
          ) : null}
        </div>
      )}

    </div>
  );
}