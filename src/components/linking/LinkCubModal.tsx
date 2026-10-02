import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Link2, CheckCircle, Clock } from 'lucide-react';
import { LinkCode, ParentCubRelationship, RelationshipType } from '../../types';
import {
  lookupLinkCode, redeemLinkCode, removeRelationship,
  isRequestExpired, RELATIONSHIP_LABELS, LOOKUP_ERRORS,
} from '../../services/linkService';

interface LinkCubModalProps {
  /** intro: يبدأ بسؤال "هل لديك شبل مسجل؟" (بعد التسجيل). code: يبدأ بإدخال الكود مباشرة. */
  mode: 'intro' | 'code';
  parentUid: string;
  parentName: string;
  existing: ParentCubRelationship[];
  onClose: () => void;
}

type Step = 'intro' | 'code' | 'confirm' | 'done';

export default function LinkCubModal({ mode, parentUid, parentName, existing, onClose }: LinkCubModalProps) {
  const [step, setStep] = useState<Step>(mode);
  const [rawCode, setRawCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [found, setFound] = useState<LinkCode | null>(null);
  const [relationship, setRelationship] = useState<RelationshipType>('father');
  const [result, setResult] = useState<'approved' | 'pending' | null>(null);

  const handleLookup = async () => {
    setError('');
    if (!rawCode.trim()) {
      setError('اكتب كود الربط أولاً.');
      return;
    }
    setBusy(true);
    const res = await lookupLinkCode(rawCode);
    setBusy(false);
    if (!res.ok || !res.code) {
      setError(LOOKUP_ERRORS[res.reason || 'error']);
      return;
    }
    const current = existing.find((r) => r.cubUid === res.code!.cubUid);
    if (current?.status === 'approved') {
      setError('حسابك مرتبط بهذا الشبل بالفعل.');
      return;
    }
    if (current?.status === 'pending' && !isRequestExpired(current)) {
      setError('لديك طلب ربط بانتظار الموافقة لهذا الشبل.');
      return;
    }
    setFound(res.code);
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (!found) return;
    setBusy(true);
    setError('');
    try {
      // طلب قديم مرفوض أو منتهٍ لنفس الشبل: نزيله ثم ننشئ العلاقة الجديدة
      const old = existing.find((r) => r.cubUid === found.cubUid);
      if (old) await removeRelationship(old.id);
      const status = await redeemLinkCode({ code: found, parentUid, parentName, relationship });
      setResult(status);
      setStep('done');
    } catch (err) {
      console.error(err);
      setError('تعذّر إتمام الربط. ربما انتهى الكود أو استُخدم. اطلب كوداً جديداً وحاول مرة أخرى.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 font-sans" dir="rtl">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden border-4 border-white"
      >
        <div className="bg-scout-blue p-6 text-white text-center relative">
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full cursor-pointer"
          >
            <X size={20} />
          </button>
          <div className="w-14 h-14 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-2">
            <Link2 size={28} />
          </div>
          <h3 className="text-xl font-black">ربط حساب شبل</h3>
        </div>

        <div className="p-6 space-y-4 text-right">
          {error && (
            <div className="bg-red-50 text-red-700 border border-red-100 p-3 rounded-2xl text-xs font-black leading-relaxed">
              {error}
            </div>
          )}

          {step === 'intro' && (
            <div className="space-y-4">
              <h4 className="text-base font-black text-slate-800">هل لديك شبل مسجل بالفعل؟</h4>
              <p className="text-xs font-bold text-slate-500 leading-relaxed">
                يمكنك ربط حسابك بحساب ابنك الآن بكود ربط آمن، أو تفعيل الربط لاحقاً من صفحتك الرئيسية.
              </p>
              <button
                onClick={() => setStep('code')}
                className="w-full bg-scout-blue hover:bg-blue-800 text-white font-black py-3 rounded-xl text-sm cursor-pointer"
              >
                نعم، أريد ربط حساب شبل
              </button>
              <button
                onClick={onClose}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-3 rounded-xl text-sm cursor-pointer"
              >
                لاحقاً
              </button>
            </div>
          )}

          {step === 'code' && (
            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-500 leading-relaxed">
                اطلب من الشبل (من ملفه الشخصي ← ولي الأمر ← إنشاء كود ربط) أو من قائد الفرقة كود ربط، ثم اكتبه هنا.
                الكود يعمل لمدة ١٥ دقيقة ولمرة واحدة فقط.
              </p>
              <input
                type="text"
                dir="ltr"
                autoCapitalize="characters"
                autoComplete="off"
                value={rawCode}
                onChange={(e) => setRawCode(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleLookup(); }}
                placeholder="CUB-XXXX-XXXX"
                className="w-full bg-slate-50 border-2 border-slate-100 focus:border-scout-blue rounded-2xl px-5 py-3 text-center font-mono text-lg font-black tracking-widest outline-none"
              />
              <button
                onClick={handleLookup}
                disabled={busy}
                className="w-full bg-scout-blue hover:bg-blue-800 disabled:opacity-50 text-white font-black py-3 rounded-xl text-sm cursor-pointer"
              >
                {busy ? 'جاري التحقق...' : 'متابعة'}
              </button>
            </div>
          )}

          {step === 'confirm' && found && (
            <div className="space-y-4">
              <p className="text-sm font-black text-slate-800 text-center">هل تريد ربط حسابك بهذا الشبل؟</p>
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <span className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-3xl shrink-0">
                  {found.cubAvatar || '🦁'}
                </span>
                <div>
                  <h4 className="font-black text-base text-slate-800">{found.cubName}</h4>
                  <p className="text-[10px] font-bold text-slate-400">شبل في فرقة الأشبال</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">صلتك بالشبل</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(RELATIONSHIP_LABELS) as RelationshipType[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRelationship(r)}
                      className={`py-2 rounded-xl border-2 text-xs font-black cursor-pointer ${
                        relationship === r
                          ? 'border-scout-blue bg-scout-blue/5 text-scout-blue'
                          : 'border-slate-100 bg-slate-50 text-slate-500'
                      }`}
                    >
                      {RELATIONSHIP_LABELS[r]}
                    </button>
                  ))}
                </div>
              </div>

              {found.requiresApproval && (
                <div className="flex gap-2 bg-amber-50 border border-amber-100 text-amber-800 rounded-2xl p-3 text-[11px] font-bold leading-relaxed">
                  <Clock size={16} className="shrink-0 mt-0.5" />
                  <span>سيصل طلبك إلى الشبل أو القائد، ويبدأ الربط بعد موافقته.</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleConfirm}
                  disabled={busy}
                  className="flex-[2] bg-scout-green hover:bg-green-700 disabled:opacity-50 text-white font-black py-3 rounded-xl text-sm cursor-pointer"
                >
                  {busy ? 'جاري الربط...' : 'تأكيد الربط'}
                </button>
                <button
                  onClick={() => { setStep('code'); setFound(null); setError(''); }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-3 rounded-xl text-sm cursor-pointer"
                >
                  رجوع
                </button>
              </div>
            </div>
          )}

          {step === 'done' && found && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto">
                <CheckCircle size={36} />
              </div>
              <h4 className="text-lg font-black text-slate-800">
                {result === 'approved' ? `تم ربط حسابك بالشبل ${found.cubName}` : 'تم إرسال طلب الربط'}
              </h4>
              <p className="text-xs font-bold text-slate-500 leading-relaxed">
                {result === 'approved'
                  ? 'يمكنك الآن متابعة نقاطه وشاراته وتقييماته من صفحتك الرئيسية.'
                  : 'سيظهر الشبل في صفحتك بعد موافقة الشبل أو القائد على الطلب.'}
              </p>
              <button
                onClick={onClose}
                className="w-full bg-scout-blue hover:bg-blue-800 text-white font-black py-3 rounded-xl text-sm cursor-pointer"
              >
                متابعة
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
