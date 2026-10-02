import React, { useEffect, useMemo, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { Copy, Link2, Trash2, Search } from 'lucide-react';
import { db } from '../../lib/firebase';
import { Cub, LinkCode, ParentCubRelationship } from '../../types';
import { useToast } from '../../utils/toast';
import {
  subscribeToAllRelationships, subscribeToMyActiveCodes, createLinkCode, revokeLinkCode,
  respondToRelationship, removeRelationship, isRequestExpired, isCodeExpired, tsMillis,
  RELATIONSHIP_LABELS,
} from '../../services/linkService';
import { useNow, formatRemaining } from './useNow';

interface LeaderLinksPanelProps {
  cubs: Cub[];
  leaderUid: string;
}

/** لوحة القائد: العلاقات بين الأشبال وأولياء الأمور، وإصدار أكواد الربط */
export default function LeaderLinksPanel({ cubs, leaderUid }: LeaderLinksPanelProps) {
  const { showToast, showConfirm } = useToast();
  const [rels, setRels] = useState<ParentCubRelationship[]>([]);
  const [codes, setCodes] = useState<LinkCode[]>([]);
  const [search, setSearch] = useState('');
  const [needsApproval, setNeedsApproval] = useState<Record<string, boolean>>({});
  const [phones, setPhones] = useState<Record<string, string>>({});
  const [busyCub, setBusyCub] = useState<string | null>(null);
  const now = useNow();

  useEffect(() => subscribeToAllRelationships(setRels), []);
  useEffect(() => subscribeToMyActiveCodes(leaderUid, setCodes), [leaderUid]);

  const pending = useMemo(() => rels.filter((r) => r.status === 'pending' && !isRequestExpired(r, now)), [rels, now]);

  const visibleCubs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cubs
      .filter((c) => c.status !== 'pending')
      .filter((c) => !q || (c.name || '').toLowerCase().includes(q));
  }, [cubs, search]);

  const handleCreateCode = async (cub: Cub) => {
    setBusyCub(cub.id);
    try {
      const old = codes.filter((c) => c.cubUid === cub.id);
      await Promise.all(old.map((c) => revokeLinkCode(c.code).catch(console.error)));
      await createLinkCode({
        cubUid: cub.id,
        cubName: cub.name,
        cubAvatar: cub.avatar,
        createdBy: leaderUid,
        requiresApproval: !!needsApproval[cub.id],
      });
    } catch (err) {
      console.error(err);
      showToast('تعذّر إنشاء كود الربط.', 'error');
    } finally {
      setBusyCub(null);
    }
  };

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      showToast('تم نسخ الكود.', 'success');
    } catch {
      showToast('تعذّر النسخ، انسخ الكود يدوياً.', 'warning');
    }
  };

  const handleRespond = async (rel: ParentCubRelationship, decision: 'approved' | 'rejected') => {
    try {
      await respondToRelationship(rel.id, decision, leaderUid);
      showToast(decision === 'approved' ? 'تم اعتماد الربط.' : 'تم رفض الطلب.', 'success');
    } catch (err) {
      console.error(err);
      showToast('تعذّر تنفيذ الإجراء.', 'error');
    }
  };

  const handleRemove = async (rel: ParentCubRelationship) => {
    const ok = await showConfirm(`هل تريد إزالة ربط ${rel.parentName} بالشبل ${rel.cubName}؟`);
    if (!ok) return;
    try {
      await removeRelationship(rel.id);
      showToast('تمت إزالة الربط.', 'info');
    } catch (err) {
      console.error(err);
      showToast('تعذّرت إزالة الربط.', 'error');
    }
  };

  const showContact = async (rel: ParentCubRelationship) => {
    try {
      const snap = await getDoc(doc(db, 'users', rel.parentUid));
      const phone = (snap.data()?.phone as string) || 'غير مسجّل';
      setPhones((p) => ({ ...p, [rel.parentUid]: phone }));
    } catch (err) {
      console.error(err);
      showToast('تعذّر جلب بيانات التواصل.', 'error');
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="bg-white rounded-[32px] border border-slate-200 p-6 space-y-3 shadow-sm">
        <h4 className="font-black text-sm text-scout-blue flex items-center gap-1.5">
          <span>🔔</span> طلبات ربط تنتظر الموافقة ({pending.length})
        </h4>
        {pending.length === 0 ? (
          <p className="text-[11px] font-bold text-slate-400 italic">لا توجد طلبات معلّقة.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {pending.map((rel) => (
              <div key={rel.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black text-slate-800">
                    {RELATIONSHIP_LABELS[rel.relationship]} {rel.parentName} ← {rel.cubName}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400">تأكد من هوية ولي الأمر قبل الاعتماد.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleRespond(rel, 'approved')} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] rounded-xl cursor-pointer">
                    اعتماد
                  </button>
                  <button onClick={() => handleRespond(rel, 'rejected')} className="px-4 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-black text-[11px] rounded-xl cursor-pointer">
                    رفض
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="font-black text-sm text-scout-blue flex items-center gap-1.5">
            <span>👨‍👩‍👦</span> أولياء الأمور وأكواد الربط
          </h4>
          <div className="relative">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن شبل..."
              className="bg-slate-50 border border-slate-200 rounded-xl py-2 pr-9 pl-3 text-xs font-bold outline-none"
            />
          </div>
        </div>
        <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
          الأشبال الذين ليس لهم حساب خاص يحتاجون كود ربط تصدره أنت وتسلّمه لولي الأمر. الكود يعمل ١٥ دقيقة ولمرة واحدة.
        </p>

        <div className="divide-y divide-slate-100">
          {visibleCubs.length === 0 && (
            <p className="py-6 text-center text-xs font-bold text-slate-400">لا يوجد أشبال مطابقون.</p>
          )}
          {visibleCubs.map((cub) => {
            const cubRels = rels.filter((r) => r.cubUid === cub.id);
            const code = codes.find((c) => c.cubUid === cub.id && !isCodeExpired(c, now));
            return (
              <div key={cub.id} className="py-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{cub.avatar || '🦁'}</span>
                    <div>
                      <p className="font-black text-sm text-slate-800">{cub.name}</p>
                      <p className="text-[10px] font-bold text-slate-400">
                        {cubRels.filter((r) => r.status === 'approved').length} ولي أمر مرتبط
                      </p>
                    </div>
                  </div>
                  {!code && (
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 text-[10px] font-bold text-slate-500 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!needsApproval[cub.id]}
                          onChange={(e) => setNeedsApproval({ ...needsApproval, [cub.id]: e.target.checked })}
                        />
                        يحتاج موافقتي
                      </label>
                      <button
                        onClick={() => handleCreateCode(cub)}
                        disabled={busyCub === cub.id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-scout-blue hover:bg-blue-800 disabled:opacity-50 text-white font-black text-[11px] rounded-xl cursor-pointer"
                      >
                        <Link2 size={13} /> إنشاء كود ربط
                      </button>
                    </div>
                  )}
                </div>

                {code && (
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border-2 border-dashed border-scout-blue/30 rounded-2xl p-3">
                    <div>
                      <p dir="ltr" className="font-mono text-lg font-black tracking-widest text-scout-blue select-all">{code.code}</p>
                      <p className="text-[10px] font-bold text-slate-500">
                        ينتهي بعد {formatRemaining(tsMillis(code.expiresAt) - now)}
                        {code.requiresApproval ? ' • يحتاج موافقتك' : ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleCopy(code.code)} className="inline-flex items-center gap-1 px-3 py-2 bg-scout-blue text-white font-black text-[11px] rounded-xl cursor-pointer">
                        <Copy size={13} /> نسخ
                      </button>
                      <button onClick={() => revokeLinkCode(code.code).catch(console.error)} className="px-3 py-2 bg-white text-red-600 border border-red-200 font-black text-[11px] rounded-xl cursor-pointer">
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}

                {cubRels.length > 0 && (
                  <div className="space-y-2">
                    {cubRels.map((rel) => {
                      const expired = isRequestExpired(rel, now);
                      const label =
                        rel.status === 'approved' ? '🟢 مرتبط'
                        : rel.status === 'rejected' ? '🔴 مرفوض'
                        : expired ? '⚪ منتهٍ'
                        : '🟡 بانتظار الموافقة';
                      return (
                        <div key={rel.id} className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 rounded-xl px-3 py-2">
                          <div>
                            <p className="text-xs font-black text-slate-700">
                              {rel.parentName} <span className="text-slate-400 font-bold">({RELATIONSHIP_LABELS[rel.relationship]})</span>
                            </p>
                            <p className="text-[10px] font-bold text-slate-500">
                              {label}
                              {phones[rel.parentUid] ? ` • هاتف: ${phones[rel.parentUid]}` : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {!phones[rel.parentUid] && rel.status === 'approved' && (
                              <button onClick={() => showContact(rel)} className="text-[10px] font-black text-scout-blue underline cursor-pointer">
                                وسيلة التواصل
                              </button>
                            )}
                            <button onClick={() => handleRemove(rel)} aria-label="إزالة الربط" className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
