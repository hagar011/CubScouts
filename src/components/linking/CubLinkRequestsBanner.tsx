import React, { useEffect, useState } from 'react';
import { ParentCubRelationship } from '../../types';
import { useToast } from '../../utils/toast';
import {
  subscribeToCubRelationships, respondToRelationship, isRequestExpired, RELATIONSHIP_LABELS,
} from '../../services/linkService';

/** تنبيه ظاهر في كل الشاشات للشبل عندما يصله طلب ربط جديد */
export default function CubLinkRequestsBanner({ cubUid }: { cubUid: string }) {
  const { showToast } = useToast();
  const [rels, setRels] = useState<ParentCubRelationship[]>([]);

  useEffect(() => subscribeToCubRelationships(cubUid, setRels), [cubUid]);

  const pending = rels.filter((r) => r.status === 'pending' && !isRequestExpired(r));
  if (pending.length === 0) return null;

  const respond = async (rel: ParentCubRelationship, decision: 'approved' | 'rejected') => {
    try {
      await respondToRelationship(rel.id, decision, cubUid);
      showToast(decision === 'approved' ? 'تم قبول طلب الربط.' : 'تم رفض طلب الربط.', 'success');
    } catch (err) {
      console.error(err);
      showToast('تعذّر تنفيذ الإجراء.', 'error');
    }
  };

  return (
    <div className="space-y-3 mb-6" dir="rtl">
      {pending.map((rel) => (
        <div key={rel.id} className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-4 space-y-3 shadow-sm">
          <p className="text-sm font-black text-amber-900 flex items-center gap-2">
            <span>🔔</span> طلب ربط جديد
          </p>
          <p className="text-xs font-bold text-amber-800 leading-relaxed">
            {RELATIONSHIP_LABELS[rel.relationship]} {rel.parentName} يريد ربط حسابه بحسابك.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => respond(rel, 'approved')}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl text-xs cursor-pointer"
            >
              قبول
            </button>
            <button
              onClick={() => respond(rel, 'rejected')}
              className="flex-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-black py-2.5 rounded-xl text-xs cursor-pointer"
            >
              رفض
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
