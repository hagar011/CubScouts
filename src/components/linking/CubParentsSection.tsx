import React, { useEffect, useState } from 'react';
import { Link2, Copy, Trash2, ShieldCheck, Clock } from 'lucide-react';
import { LinkCode, ParentCubRelationship } from '../../types';
import { useToast } from '../../utils/toast';
import {
  subscribeToCubRelationships, subscribeToMyActiveCodes, createLinkCode, revokeLinkCode,
  respondToRelationship, removeRelationship, isRequestExpired, isCodeExpired, tsMillis,
  RELATIONSHIP_LABELS,
} from '../../services/linkService';
import { useNow, formatRemaining } from './useNow';

interface CubParentsSectionProps {
  cubUid: string;
  cubName: string;
  cubAvatar?: string;
}

/** قسم "ولي الأمر" داخل الملف الشخصي للشبل */
export default function CubParentsSection({ cubUid, cubName, cubAvatar }: CubParentsSectionProps) {
  const { showToast, showConfirm } = useToast();
  const [rels, setRels] = useState<ParentCubRelationship[]>([]);
  const [codes, setCodes] = useState<LinkCode[]>([]);
  const [requireApproval, setRequireApproval] = useState(false);
  const [busy, setBusy] = useState(false);
  const now = useNow();

  useEffect(() => subscribeToCubRelationships(cubUid, setRels), [cubUid]);
  useEffect(() => subscribeToMyActiveCodes(cubUid, setCodes), [cubUid]);

  const approved = rels.filter((r) => r.status === 'approved');
  const pending = rels.filter((r) => r.status === 'pending' && !isRequestExpired(r, now));
  const activeCode = codes.find((c) => c.cubUid === cubUid && !isCodeExpired(c, now));

  const handleCreateCode = async () => {
    setBusy(true);
    try {
      // كود واحد نشط فقط: نلغي القديم أولاً
      await Promise.all(codes.map((c) => revokeLinkCode(c.code).catch(console.error)));
      await createLinkCode({ cubUid, cubName, cubAvatar, createdBy: cubUid, requiresApproval: requireApproval });
    } catch (err) {
      console.error(err);
      showToast('تعذّر إنشاء كود الربط. تأكد من ضبط الساعة في جهازك وحاول مرة أخرى.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      showToast('تم نسخ الكود.', 'success');
    } catch {
      showToast('تعذّر النسخ، اكتب الكود يدوياً.', 'warning');
    }
  };

  const handleRevoke = async (code: string) => {
    try {
      await revokeLinkCode(code);
    } catch (err) {
      console.error(err);
      showToast('تعذّر إلغاء الكود.', 'error');
    }
  };

  const handleRespond = async (rel: ParentCubRelationship, decision: 'approved' | 'rejected') => {
    try {
      await respondToRelationship(rel.id, decision, cubUid);
      showToast(decision === 'approved' ? 'تم قبول طلب الربط.' : 'تم رفض طلب الربط.', 'success');
    } catch (err) {
      console.error(err);
      showToast('تعذّر تنفيذ الإجراء.', 'error');
    }
  };

  const handleRemove = async (rel: ParentCubRelationship) => {
    const ok = await showConfirm(`هل تريد إزالة ربط ${rel.parentName} بحسابك؟ لن يتمكن من متابعة بياناتك بعد ذلك.`);
    if (!ok) return;
    try {
      await removeRelationship(rel.id);
      showToast('تمت إزالة الربط.', 'info');
    } catch (err) {
      console.error(err);
      showToast('تعذّرت إزالة الربط.', 'error');
    }
  };

  return (
    <div className="mt-6 pt-6 border-t-2 border-slate-100 dark:border-slate-800 space-y-4">
      <h3 className="text-sm font-black text-scout-blue dark:text-scout-yellow flex items-center gap-2">
        <span>👨‍👩‍👦</span> ولي الأمر
      </h3>

      {approved.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-700">
            <span>🟢</span> مرتبط
          </div>
          {approved.map((rel) => (
            <div key={rel.id} className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-3">
              <div>
                <p className="text-xs font-black text-slate-800 dark:text-slate-100">{rel.parentName}</p>
                <p className="text-[10px] font-bold text-slate-400">{RELATIONSHIP_LABELS[rel.relationship]}</p>
              </div>
              <button
                onClick={() => handleRemove(rel)}
                aria-label="إزالة الربط"
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11px] font-bold text-slate-400">لم يتم ربط ولي أمر بحسابك بعد.</p>
      )}

      {pending.map((rel) => (
        <div key={rel.id} className="bg-amber-50 border border-amber-100 rounded-2xl p-3 space-y-2">
          <p className="text-xs font-black text-amber-900 flex items-center gap-1.5">
            <span>🔔</span> طلب ربط جديد
          </p>
          <p className="text-[11px] font-bold text-amber-800 leading-relaxed">
            {RELATIONSHIP_LABELS[rel.relationship]} {rel.parentName} يريد ربط حسابه بحسابك.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleRespond(rel, 'approved')}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2 rounded-xl text-xs cursor-pointer"
            >
              قبول
            </button>
            <button
              onClick={() => handleRespond(rel, 'rejected')}
              className="flex-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-black py-2 rounded-xl text-xs cursor-pointer"
            >
              رفض
            </button>
          </div>
        </div>
      ))}

      {/* إضافة ولي أمر */}
      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 space-y-3">
        <h4 className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
          <Link2 size={14} /> إضافة ولي أمر
        </h4>

        {activeCode ? (
          <div className="space-y-3">
            <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
              أعطِ هذا الكود لوليّ أمرك ليدخله في حسابه. لا تشاركه مع أي شخص آخر.
            </p>
            <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-scout-blue/40 rounded-2xl p-4 text-center space-y-2">
              <p dir="ltr" className="font-mono text-2xl font-black tracking-widest text-scout-blue dark:text-scout-yellow select-all">
                {activeCode.code}
              </p>
              <p className="text-[11px] font-black text-slate-500 flex items-center justify-center gap-1">
                <Clock size={12} /> ينتهي بعد {formatRemaining(tsMillis(activeCode.expiresAt) - now)}
              </p>
              {activeCode.requiresApproval && (
                <p className="text-[10px] font-bold text-amber-700">سيصلك طلب للموافقة قبل تفعيل الربط</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(activeCode.code)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-scout-blue hover:bg-blue-800 text-white font-black py-2 rounded-xl text-xs cursor-pointer"
              >
                <Copy size={14} /> نسخ
              </button>
              <button
                onClick={() => handleRevoke(activeCode.code)}
                className="flex-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-black py-2 rounded-xl text-xs cursor-pointer"
              >
                إلغاء الكود
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="flex items-start gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-300 leading-relaxed cursor-pointer">
              <input
                type="checkbox"
                checked={requireApproval}
                onChange={(e) => setRequireApproval(e.target.checked)}
                className="mt-0.5"
              />
              <span>أريد مراجعة الطلب والموافقة عليه قبل تفعيل الربط (أكثر أماناً)</span>
            </label>
            <button
              onClick={handleCreateCode}
              disabled={busy}
              className="w-full flex items-center justify-center gap-1.5 bg-scout-blue hover:bg-blue-800 disabled:opacity-50 text-white font-black py-2.5 rounded-xl text-xs cursor-pointer"
            >
              <ShieldCheck size={14} /> {busy ? 'جاري الإنشاء...' : 'إنشاء كود ربط'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
