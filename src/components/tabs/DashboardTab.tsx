import React, { useState, useMemo } from 'react';
import {
  Users, Plus, Compass, Flame, Trophy,
  Map as MapIcon, Lock, Unlock,
  Search, Clock, AlertTriangle, Star, Tent, Trash2, Eye, ClipboardCheck, BarChart3, UserPlus,
} from 'lucide-react';
import { Cub, UserRole, Sextet, PendingPointRequest, GlobalTask, ParentCubRelationship } from '../../types';
import ParentChildrenPanel from '../linking/ParentChildrenPanel';
import LeaderLinksPanel from '../linking/LeaderLinksPanel';
import { Mascot } from '../UI/ScoutUI';
import { SEXTETS } from '../../constants/initialData';
import { SECRET_MISSION } from '../../constants/scoutData';
import { User as FirebaseUser } from 'firebase/auth';

type SortKey = 'pointsDesc' | 'pointsAsc' | 'name';

const STATUS_LABELS: Record<string, string> = {
  active: 'نشط',
  approved: 'معتمد',
  pending: 'قيد المراجعة',
};

function statusLabel(status: string): string {
  return STATUS_LABELS[status] || status;
}

function isImageSource(value: string): boolean {
  return /^(https?:|data:|\/)/.test(value);
}

interface CubCardProps {
  cub: Cub;
  sextetName: string;
  maxPoints: number;
  onView: () => void;
  onEvaluate: () => void;
  onDelete: () => void;
}

function CubCard({ cub, sextetName, maxPoints, onView, onEvaluate, onDelete }: CubCardProps) {
  const points = cub.points || 0;
  const pct = maxPoints > 0 ? Math.min(100, Math.round((points / maxPoints) * 100)) : 0;
  const avatar = cub.avatar || '🦁';
  const status = cub.status ? String(cub.status) : '';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 hover:border-scout-blue/40 hover:shadow-md transition-all min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
            {isImageSource(String(avatar)) ? (
              <img src={String(avatar)} alt={cub.name} className="h-full w-full object-cover" />
            ) : (
              avatar
            )}
          </span>
          <div className="min-w-0">
            <h5 className="font-black text-sm text-slate-800 truncate">{cub.name}</h5>
            <p className="text-[11px] text-slate-500 font-bold truncate">{cub.level || 'شبل مبتدئ'}</p>
          </div>
        </div>
        {status && (
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black shrink-0">
            {statusLabel(status)}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
        <span className="flex items-center gap-1 min-w-0">
          <Tent size={12} className="shrink-0" />
          <span className="truncate">سداسي {sextetName}</span>
        </span>
        <span className="flex items-center gap-1 text-amber-700 font-black shrink-0">
          <Star size={12} /> {points} نقطة
        </span>
      </div>

      <div className="space-y-1">
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-l from-scout-green to-scout-blue transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[10px] text-slate-400 font-bold">{pct}% من نقاط أعلى شبل في الفرقة</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onView}
          className="flex-1 px-3 py-2 bg-slate-100 hover:bg-scout-blue hover:text-white rounded-lg text-[11px] font-black transition-colors flex items-center justify-center gap-1"
        >
          <Eye size={13} /> عرض الملف
        </button>
        <button
          onClick={onEvaluate}
          className="flex-1 px-3 py-2 bg-slate-100 hover:bg-scout-green hover:text-white rounded-lg text-[11px] font-black transition-colors flex items-center justify-center gap-1"
        >
          <ClipboardCheck size={13} /> تقييم
        </button>
        <button
          onClick={onDelete}
          title="حذف الشبل"
          aria-label={`حذف الشبل ${cub.name}`}
          className="p-2 border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

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
  /** Optional: lets the Add Cub modal pre-select a sextet. Pass null to clear it. */
  setAddCubPresetSextetId?: (sextetId: string | null) => void;
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
  setAddCubPresetSextetId,
}: DashboardTabProps) {
  const [leaderSubTab, setLeaderSubTab] = useState<'roster' | 'approvals' | 'links' | 'security'>('roster');
  const [assignedSextets, setAssignedSextets] = useState<Record<string, string>>({});
  const [parentSuccessMessage, setParentSuccessMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sextetFilter, setSextetFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortKey>('pointsDesc');

  const isLeader = role === UserRole.LEADER;
  const isCub = role === UserRole.CUB;
  const isParent = role === UserRole.PARENT;

  const pendingCubsList = useMemo(() => {
    return cubs.filter(c => c.status === 'pending');
  }, [cubs]);

  const stats = useMemo(() => {
    const totalCubs = cubs.filter(c => c.status !== 'pending').length;

    const totalSextets = sextets.length;

    const approvedCubs = cubs.filter(c => c.status !== 'pending');

    const totalPoints = approvedCubs.reduce(
      (acc, c) => acc + (c.points || 0),
      0
    );

    const avgScore =
      totalCubs > 0
        ? Math.round(totalPoints / totalCubs)
        : 0;

    const topCub =
      approvedCubs.length > 0
        ? [...approvedCubs].sort(
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

  const activeCubs = useMemo(() => cubs.filter(c => c.status !== 'pending'), [cubs]);

  const pendingPointsList = useMemo(
    () => pendingPoints.filter(p => p.status === 'pending'),
    [pendingPoints]
  );
  const pendingTotal = pendingCubsList.length + pendingPointsList.length;

  const maxPoints = useMemo(
    () => activeCubs.reduce((m, c) => Math.max(m, c.points || 0), 0),
    [activeCubs]
  );

  const levelOptions = useMemo(
    () => Array.from(new Set(activeCubs.map(c => c.level).filter((l): l is string => Boolean(l)))),
    [activeCubs]
  );
  const statusOptions = useMemo(
    () => Array.from(new Set(activeCubs.map(c => (c.status ? String(c.status) : '')).filter(Boolean))),
    [activeCubs]
  );

  const query = search.trim().toLowerCase();
  const filtersActive =
    query !== '' || sextetFilter !== 'all' || levelFilter !== 'all' || statusFilter !== 'all';

  const visibleCubs = useMemo(() => {
    const filtered = activeCubs.filter(c => {
      if (query && !String(c.name || '').toLowerCase().includes(query)) return false;
      if (sextetFilter !== 'all' && String(c.sextetId || '') !== sextetFilter) return false;
      if (levelFilter !== 'all' && (c.level || '') !== levelFilter) return false;
      if (statusFilter !== 'all' && String(c.status || '') !== statusFilter) return false;
      return true;
    });
    return filtered.sort((a, b) => {
      if (sortBy === 'pointsDesc') return (b.points || 0) - (a.points || 0);
      if (sortBy === 'pointsAsc') return (a.points || 0) - (b.points || 0);
      return String(a.name || '').localeCompare(String(b.name || ''), 'ar');
    });
  }, [activeCubs, query, sextetFilter, levelFilter, statusFilter, sortBy]);

  const sextetGroups = useMemo(
    () =>
      SEXTETS.map(sex => {
        const sameSextet = (c: Cub) => String(c.sextetId || '') === String(sex.id);
        const all = activeCubs.filter(sameSextet);
        const total = all.reduce((acc, c) => acc + (c.points || 0), 0);
        const top =
          all.length > 0 ? [...all].sort((a, b) => (b.points || 0) - (a.points || 0))[0] : null;
        return {
          sex,
          shown: visibleCubs.filter(sameSextet),
          count: all.length,
          total,
          avg: all.length > 0 ? Math.round(total / all.length) : 0,
          top,
        };
      }),
    [activeCubs, visibleCubs]
  );

  const unassigned = useMemo(
    () => visibleCubs.filter(c => !SEXTETS.some(s => String(s.id) === String(c.sextetId || ''))),
    [visibleCubs]
  );

  const attention = useMemo(() => {
    const pendingIds = new Set(pendingPointsList.map(p => p.cubId));
    return activeCubs.flatMap(c => {
      const reasons: string[] = [];
      if (pendingIds.has(c.id)) reasons.push('لديه طلب نقاط معلق');
      if (stats.avgScore > 0 && (c.points || 0) < stats.avgScore * 0.5) {
        reasons.push('نقاطه أقل من نصف المتوسط');
      }
      return reasons.length > 0 ? [{ cub: c, reasons }] : [];
    });
  }, [activeCubs, pendingPointsList, stats.avgScore]);

  const resetFilters = () => {
    setSearch('');
    setSextetFilter('all');
    setLevelFilter('all');
    setStatusFilter('all');
  };

  const openAddCub = (sextetId: string | null) => {
    setAddCubPresetSextetId?.(sextetId);
    setShowAddCubModal(true);
  };

  const handleView = (cub: Cub) => {
    onSelectCub(cub.id);
    setView('progress');
  };

  const handleEvaluate = (cub: Cub) => {
    onSelectCub(cub.id);
    setView('evaluate');
  };

  const handleDeleteCub = async (cub: Cub) => {
    const ok = await showConfirm(`هل تريد بالتأكيد حذف الشبل "${cub.name}" وسحب كامل سجلاته؟`);
    if (ok) onDeleteCub(cub.id);
  };

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
      {!isLeader && (
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
      )}

      {isLeader && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="flex items-start gap-4 min-w-0">
                <span className="p-3 bg-scout-blue text-white rounded-2xl shrink-0">
                  <Users size={24} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-800">لوحة قيادة الفرقة</h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 font-bold leading-relaxed">
                    تابع الأشبال والسداسيات والإنجازات والطلبات من مكان واحد.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => openAddCub(null)}
                  className="px-4 py-2.5 bg-scout-blue hover:bg-blue-800 text-white rounded-xl text-xs font-black transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Plus size={14} /> إضافة شبل
                </button>
                <button
                  onClick={() => setShowAddLeaderModal(true)}
                  className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5"
                >
                  <Plus size={14} /> إضافة قائد مساعد
                </button>
                <button
                  onClick={() => setShowMap(true)}
                  className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5"
                >
                  <MapIcon size={14} className="text-scout-green" /> خريطة المغامرة
                </button>
                <button
                  onClick={onToggleGamesLocked}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black border transition-colors flex items-center gap-1.5 ${gamesLocked
                    ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                    }`}
                >
                  {gamesLocked ? <Lock size={14} /> : <Unlock size={14} />}
                  {gamesLocked ? 'الألعاب مقفلة — اضغط للفتح' : 'الألعاب مفتوحة — اضغط للقفل'}
                </button>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 2xl:grid-cols-7 gap-3">
            {[
              { label: 'إجمالي الأشبال', value: String(stats.totalCubs), desc: 'الأشبال المعتمدون', icon: <Users size={18} />, tone: 'bg-scout-blue/10 text-scout-blue' },
              { label: 'إجمالي السداسيات', value: String(stats.totalSextets), desc: 'سداسيات الفرقة', icon: <Tent size={18} />, tone: 'bg-scout-green/10 text-scout-green' },
              { label: 'إجمالي النقاط', value: String(stats.totalPoints), desc: 'مجموع نقاط الأشبال', icon: <Flame size={18} />, tone: 'bg-amber-100 text-amber-700' },
              { label: 'أفضل شبل', value: stats.topCub ? stats.topCub.name : 'لا يوجد', desc: stats.topCub ? `${stats.topCub.points || 0} نقطة` : 'لم يبدأ التقييم بعد', icon: <Trophy size={18} />, tone: 'bg-scout-yellow/20 text-amber-700' },
              { label: 'أفضل سداسي', value: stats.topSextet ? stats.topSextet.name : 'لا يوجد', desc: stats.topSextet ? `${stats.topSextet.totalPoints || stats.topSextet.points || 0} نقطة` : 'لا توجد نقاط بعد', icon: <Compass size={18} />, tone: 'bg-scout-blue/10 text-scout-blue' },
              { label: 'متوسط النقاط', value: String(stats.avgScore), desc: 'لكل شبل', icon: <BarChart3 size={18} />, tone: 'bg-scout-green/10 text-scout-green' },
              { label: 'الطلبات المعلقة', value: String(pendingTotal), desc: 'بانتظار قرارك', icon: <Clock size={18} />, tone: pendingTotal > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500' },
            ].map((st) => (
              <div
                key={st.label}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-[0_8px_20px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)] transition-shadow min-w-0"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${st.tone}`}>{st.icon}</span>
                  <span className="text-[11px] font-black text-slate-500 truncate">{st.label}</span>
                </div>
                <p className="mt-3 text-xl font-black text-slate-800 truncate" title={st.value}>{st.value}</p>
                <p className="text-[10px] text-slate-400 font-bold truncate">{st.desc}</p>
              </div>
            ))}
          </div>

          {/* Needs attention */}
          {attention.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 space-y-3">
              <h4 className="font-black text-sm text-amber-900 flex items-center gap-2">
                <AlertTriangle size={16} /> يحتاج إلى متابعة ({attention.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {attention.map(({ cub, reasons }) => (
                  <div key={cub.id} className="bg-white rounded-2xl border border-amber-100 p-3 flex items-center justify-between gap-3 min-w-0">
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-800 truncate">{cub.name}</p>
                      <p className="text-[10px] text-amber-700 font-bold leading-snug">{reasons.join(' • ')}</p>
                    </div>
                    <button
                      onClick={() => handleEvaluate(cub)}
                      className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[10px] font-black transition-colors shrink-0"
                    >
                      تقييم
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub tabs */}
          <div className="flex border-b border-slate-200 gap-5 overflow-x-auto">
            <button
              onClick={() => setLeaderSubTab('roster')}
              className={`pb-3 border-b-4 font-black text-xs whitespace-nowrap transition-colors ${leaderSubTab === 'roster' ? 'text-scout-blue border-scout-blue' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
            >
              السداسيات والأشبال ({stats.totalCubs})
            </button>
            <button
              onClick={() => setLeaderSubTab('approvals')}
              className={`pb-3 border-b-4 font-black text-xs whitespace-nowrap transition-colors relative ${leaderSubTab === 'approvals' ? 'text-scout-blue border-scout-blue' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
            >
              طلبات الانضمام والموافقة
              {pendingTotal > 0 && (
                <span className="absolute -top-1 -left-3 bg-rose-500 text-white font-extrabold h-4 min-w-4 px-1 rounded-full text-[8px] flex items-center justify-center">
                  {pendingTotal}
                </span>
              )}
            </button>
            <button
              onClick={() => setLeaderSubTab('links')}
              className={`pb-3 border-b-4 font-black text-xs whitespace-nowrap transition-colors ${leaderSubTab === 'links' ? 'text-scout-blue border-scout-blue' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
            >
              ربط أولياء الأمور
            </button>
          </div>

          {/* Tab: Links (parents ↔ cubs) */}
          {leaderSubTab === 'links' && currentUser && (
            <LeaderLinksPanel cubs={cubs} leaderUid={currentUser.uid} />
          )}

          {/* Tab: Roster */}
          {leaderSubTab === 'roster' && (
            <div className="space-y-5">
              {/* Search / filters / sorting */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                <div className="relative">
                  <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="البحث عن شبل..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-scout-blue focus:bg-white rounded-xl py-2.5 pr-10 pl-3 text-xs font-bold outline-none transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <label className="space-y-1 min-w-0">
                    <span className="text-[10px] font-black text-slate-400">السداسي</span>
                    <select
                      value={sextetFilter}
                      onChange={(e) => setSextetFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[11px] font-bold outline-none"
                    >
                      <option value="all">الكل</option>
                      {SEXTETS.map((s) => (
                        <option key={s.id} value={String(s.id)}>سداسي {s.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1 min-w-0">
                    <span className="text-[10px] font-black text-slate-400">المستوى</span>
                    <select
                      value={levelFilter}
                      onChange={(e) => setLevelFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[11px] font-bold outline-none"
                    >
                      <option value="all">الكل</option>
                      {levelOptions.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1 min-w-0">
                    <span className="text-[10px] font-black text-slate-400">الحالة</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[11px] font-bold outline-none"
                    >
                      <option value="all">الكل</option>
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>{statusLabel(s)}</option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1 min-w-0">
                    <span className="text-[10px] font-black text-slate-400">الترتيب</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortKey)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[11px] font-bold outline-none"
                    >
                      <option value="pointsDesc">الأعلى نقاطًا</option>
                      <option value="pointsAsc">الأقل نقاطًا</option>
                      <option value="name">الاسم أبجديًا</option>
                    </select>
                  </label>
                </div>
                {filtersActive && (
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>النتائج: {visibleCubs.length} شبل</span>
                    <button onClick={resetFilters} className="text-scout-blue hover:underline font-black">
                      إعادة ضبط البحث والفلاتر
                    </button>
                  </div>
                )}
              </div>

              {/* Sextet cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5 items-start">
                {sextetGroups
                  .filter((g) => !filtersActive || g.shown.length > 0)
                  .map((g) => (
                    <div
                      key={g.sex.id}
                      className="bg-white rounded-3xl border border-slate-200 shadow-[0_12px_28px_rgba(15,23,42,0.05)] overflow-hidden min-w-0"
                    >
                      <div className="p-5 border-b border-slate-100 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`w-10 h-10 rounded-2xl ${g.sex.color} flex items-center justify-center text-white shrink-0`}>
                              <Tent size={20} />
                            </span>
                            <h4 className="font-black text-base text-slate-800 truncate">سداسي {g.sex.name}</h4>
                          </div>
                          <button
                            onClick={() => openAddCub(String(g.sex.id))}
                            className="px-3 py-2 bg-scout-blue/10 hover:bg-scout-blue hover:text-white text-scout-blue rounded-xl text-[11px] font-black transition-colors flex items-center gap-1 shrink-0"
                          >
                            <UserPlus size={14} /> إضافة شبل
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-slate-50 rounded-xl py-2">
                            <p className="text-sm font-black text-slate-800">{g.count}</p>
                            <p className="text-[10px] font-bold text-slate-400">أشبال</p>
                          </div>
                          <div className="bg-slate-50 rounded-xl py-2">
                            <p className="text-sm font-black text-slate-800">{g.total}</p>
                            <p className="text-[10px] font-bold text-slate-400">مجموع النقاط</p>
                          </div>
                          <div className="bg-slate-50 rounded-xl py-2">
                            <p className="text-sm font-black text-slate-800">{g.avg}</p>
                            <p className="text-[10px] font-bold text-slate-400">المتوسط</p>
                          </div>
                        </div>
                        {g.top && (
                          <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 min-w-0">
                            <Trophy size={13} className="text-amber-500 shrink-0" />
                            <span className="truncate">أفضل شبل: <span className="text-slate-800 font-black">{g.top.name}</span> ({g.top.points || 0} نقطة)</span>
                          </p>
                        )}
                      </div>

                      <div className="p-4 space-y-3 bg-slate-50/50">
                        {g.shown.length > 0 ? (
                          g.shown.map((cub) => (
                            <CubCard
                              key={cub.id}
                              cub={cub}
                              sextetName={g.sex.name}
                              maxPoints={maxPoints}
                              onView={() => handleView(cub)}
                              onEvaluate={() => handleEvaluate(cub)}
                              onDelete={() => handleDeleteCub(cub)}
                            />
                          ))
                        ) : (
                          <p className="text-[11px] text-slate-400 font-bold py-4 text-center">
                            {g.count === 0 ? 'لا يوجد أشبال في هذا السداسي بعد.' : 'لا توجد نتائج مطابقة.'}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                {unassigned.length > 0 && (
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_12px_28px_rgba(15,23,42,0.05)] overflow-hidden min-w-0">
                    <div className="p-5 border-b border-slate-100">
                      <h4 className="font-black text-base text-slate-800">أشبال بدون سداسي ({unassigned.length})</h4>
                    </div>
                    <div className="p-4 space-y-3 bg-slate-50/50">
                      {unassigned.map((cub) => (
                        <CubCard
                          key={cub.id}
                          cub={cub}
                          sextetName="غير محدد"
                          maxPoints={maxPoints}
                          onView={() => handleView(cub)}
                          onEvaluate={() => handleEvaluate(cub)}
                          onDelete={() => handleDeleteCub(cub)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {filtersActive && visibleCubs.length === 0 && (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-xs font-bold text-slate-400">
                  لا يوجد أشبال مطابقون للبحث أو الفلاتر الحالية.
                </div>
              )}
            </div>
          )}

          {/* Tab: Approvals */}
          {leaderSubTab === 'approvals' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
                <div>
                  <h4 className="font-black text-sm text-scout-blue">طلبات النقاط من أولياء الأمور</h4>
                  <p className="text-[11px] text-slate-400 font-bold leading-relaxed mt-1">
                    يسجّل أولياء الأمور المهام والسلوكيات المنزلية المتميزة. راجع الطلب ثم اعتمده لمنح النقاط.
                  </p>
                </div>
                {pendingPointsList.length > 0 ? (
                  <div className="space-y-3">
                    {pendingPointsList.map((req) => {
                      const cubName = cubs.find((c) => c.id === req.cubId)?.name || 'شبل مجهول';
                      return (
                        <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
                          <div className="space-y-1 min-w-0">
                            <h5 className="font-black text-xs text-slate-800 break-words">
                              {req.type === 'parent_task' ? 'مهمة منزلية' : 'نشاط'}: "{req.taskName || req.reason || '—'}"
                            </h5>
                            <p className="text-[11px] text-slate-500 font-bold">
                              الشبل <span className="text-scout-blue">{cubName}</span> • النقاط المقترحة: {req.points}
                            </p>
                          </div>
                          <button
                            onClick={() => onApproveRequest(req.id)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] rounded-xl transition-colors shrink-0"
                          >
                            اعتماد ومنح النقاط
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 font-bold py-3">لا توجد طلبات نقاط معلقة حاليًا.</p>
                )}
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
                <h4 className="font-black text-sm text-scout-blue">طلبات الانضمام</h4>
                {pendingCubsList.length > 0 ? (
                  <div className="space-y-3">
                    {pendingCubsList.map((cub) => {
                      const selSextet = assignedSextets[cub.id] || '';
                      return (
                        <div key={cub.id} className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                          <div className="space-y-1 min-w-0">
                            <h5 className="font-black text-xs text-slate-800">{cub.name}</h5>
                            <p className="text-[11px] text-slate-500 font-bold break-all">{cub.email} • الهاتف: {cub.phone || 'غير مسجل'}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              required
                              value={selSextet}
                              onChange={(e) => setAssignedSextets({ ...assignedSextets, [cub.id]: e.target.value })}
                              className="bg-white border border-slate-200 py-2 px-3 rounded-xl font-bold text-[11px] outline-none"
                            >
                              <option value="">-- حدد السداسي --</option>
                              {SEXTETS.map((s) => (
                                <option key={s.id} value={s.id}>سداسي {s.name}</option>
                              ))}
                            </select>
                            <button
                              disabled={!selSextet}
                              onClick={() => onApprovePendingCub(cub.id, cub.name, selSextet)}
                              className="px-4 py-2 bg-scout-blue hover:bg-blue-800 text-white font-black text-[11px] rounded-xl transition-colors disabled:bg-slate-200 disabled:text-slate-400 shrink-0"
                            >
                              قبول وتعيين السداسي
                            </button>
                            <button
                              onClick={() => onRejectPendingCub(cub.id, cub.name)}
                              className="px-3 py-2 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-500 rounded-xl font-black text-[11px] transition-colors"
                            >
                              رفض
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 font-bold py-3">لا توجد طلبات انضمام معلقة حاليًا.</p>
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