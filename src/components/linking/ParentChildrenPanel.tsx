import React from 'react';
import { Link2, Star, Award, Trash2 } from 'lucide-react';
import { Cub, ParentCubRelationship } from '../../types';
import { useToast } from '../../utils/toast';
import { removeRelationship, isRequestExpired, RELATIONSHIP_LABELS } from '../../services/linkService';

interface ParentChildrenPanelProps {
  /** الأشبال المرتبطون بولي الأمر (علاقات معتمدة فقط) */
  kids: Cub[];
  /** كل علاقات ولي الأمر (معتمدة ومعلّقة ومرفوضة) */
  relationships: ParentCubRelationship[];
  activeCubId: string | null;
  onSelect: (cubId: string) => void;
  onLink: () => void;
}

/** "أبنائي": التبديل بين الأشبال وربط شبل جديد */
export default function ParentChildrenPanel({
  kids, relationships, activeCubId, onSelect, onLink,
}: ParentChildrenPanelProps) {
  const { showToast, showConfirm } = useToast();
  const others = relationships.filter((r) => r.status !== 'approved');

  const handleUnlink = async (cub: Cub) => {
    const rel = relationships.find((r) => r.cubUid === cub.id && r.status === 'approved');
    if (!rel) return;
    const ok = await showConfirm(`هل تريد إلغاء ربط حسابك بالشبل ${cub.name}؟ ستحتاج إلى كود جديد لإعادة الربط.`);
    if (!ok) return;
    try {
      await removeRelationship(rel.id);
      showToast('تم إلغاء الربط.', 'info');
    } catch (err) {
      console.error(err);
      showToast('تعذّر إلغاء الربط.', 'error');
    }
  };

  const handleDismiss = async (rel: ParentCubRelationship) => {
    try {
      await removeRelationship(rel.id);
    } catch (err) {
      console.error(err);
      showToast('تعذّر تنفيذ الإجراء.', 'error');
    }
  };

  if (kids.length === 0 && others.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="text-5xl">👨‍👩‍👦</div>
        <p className="text-sm font-black text-slate-700 dark:text-slate-200">لم يتم ربط أي شبل بحسابك بعد.</p>
        <button
          onClick={onLink}
          className="inline-flex items-center gap-2 bg-scout-blue hover:bg-blue-800 text-white font-black px-6 py-3 rounded-2xl text-sm cursor-pointer shadow"
        >
          <Link2 size={16} /> ربط شبل
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>👨‍👩‍👦</span> أبنائي
        </h3>
        <button
          onClick={onLink}
          className="inline-flex items-center gap-1.5 bg-scout-blue hover:bg-blue-800 text-white font-black px-4 py-2 rounded-xl text-xs cursor-pointer"
        >
          <Link2 size={14} /> ربط شبل
        </button>
      </div>

      {kids.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {kids.map((cub) => {
            const selected = cub.id === activeCubId;
            return (
              <div
                key={cub.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(cub.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(cub.id); }}
                className={`relative text-right p-4 rounded-3xl border-2 transition-all cursor-pointer bg-white dark:bg-slate-900 ${
                  selected
                    ? 'border-scout-blue shadow-md'
                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-2xl shrink-0">
                    {cub.avatar || '🦁'}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-black text-sm text-slate-800 dark:text-slate-100 truncate">{cub.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400">{cub.level}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs font-black">
                  <span className="flex items-center gap-1 text-amber-600">
                    <Star size={14} fill="currentColor" /> {cub.points || 0} نقطة
                  </span>
                  <span className="flex items-center gap-1 text-scout-blue">
                    <Award size={14} /> {cub.badges?.length || 0} شارات
                  </span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleUnlink(cub); }}
                  aria-label={`إلغاء ربط ${cub.name}`}
                  className="absolute top-3 left-3 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {others.length > 0 && (
        <div className="space-y-2">
          {others.map((rel) => {
            const expired = isRequestExpired(rel);
            const text =
              rel.status === 'rejected'
                ? 'تم رفض طلب الربط'
                : expired
                ? 'انتهت مهلة الطلب، اطلب كوداً جديداً'
                : 'بانتظار موافقة الشبل أو القائد ⏳';
            return (
              <div key={rel.id} className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-3">
                <div>
                  <p className="text-xs font-black text-slate-700 dark:text-slate-200">
                    {rel.cubName} <span className="text-slate-400 font-bold">({RELATIONSHIP_LABELS[rel.relationship]})</span>
                  </p>
                  <p className="text-[10px] font-bold text-slate-500">{text}</p>
                </div>
                {(rel.status === 'rejected' || expired) && (
                  <button
                    onClick={() => handleDismiss(rel)}
                    className="text-[10px] font-black text-slate-500 hover:text-red-500 underline cursor-pointer"
                  >
                    إخفاء
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
