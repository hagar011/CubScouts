import React, { useState } from 'react';
import { User, RefreshCw, LogOut } from 'lucide-react';
import { UserRole } from '../../types';
import { User as FirebaseUser } from 'firebase/auth';

interface ProfileSetupModalProps {
  currentUser: FirebaseUser;
  onSubmit: (data: {
    name: string;
    phone: string;
    email: string;
    role: UserRole;
    age: string;
    stage: string;
  }) => Promise<void>;
  onLogout: () => void;
  submitting: boolean;
  isLeaderEmail: (email?: string | null) => boolean;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function ProfileSetupModal({
  currentUser,
  onSubmit,
  onLogout,
  submitting,
  isLeaderEmail,
  showToast,
}: ProfileSetupModalProps) {
  const [setupRole, setSetupRole] = useState<UserRole>(UserRole.CUB);
  const [setupRoleSelected, setSetupRoleSelected] = useState(false);
  const [setupName, setSetupName] = useState(currentUser.displayName || '');
  const [setupPhone, setSetupPhone] = useState('');
  const [setupEmail, setSetupEmail] = useState(currentUser.email || '');
  const [setupAge, setSetupAge] = useState('');
  const [setupStage, setSetupStage] = useState('شبل مبتدئ');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupName.trim()) {
      showToast('يرجى إدخال الاسم.', 'warning');
      return;
    }
    if (!setupPhone.trim()) {
      showToast('يرجى إدخال رقم الهاتف.', 'warning');
      return;
    }
    if (setupRole === UserRole.LEADER && !isLeaderEmail(setupEmail.trim())) {
      showToast('لا يمكن التسجيل كقائد بهذا البريد الإلكتروني.', 'error');
      return;
    }

    await onSubmit({
      name: setupName.trim(),
      phone: setupPhone.trim(),
      email: setupEmail.trim(),
      role: setupRole,
      age: setupAge.trim(),
      stage: setupStage,
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#0f172a_0%,#0b1f3a_28%,#0a1225_100%)] flex items-center justify-center p-6 text-right font-sans" dir="rtl">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_15%_20%,rgba(250,204,21,0.2)_0_2px,transparent_3px),radial-gradient(circle_at_80%_35%,rgba(59,130,246,0.2)_0_2px,transparent_3px),radial-gradient(circle_at_60%_75%,rgba(16,185,129,0.2)_0_2px,transparent_3px)] bg-[length:140px_140px]" />

      <div className="relative max-w-md w-full bg-white rounded-[34px] p-6 md:p-7 shadow-[0_30px_90px_rgba(2,6,23,0.45)] border-4 border-scout-yellow/20 space-y-6">
        <div className="text-center space-y-3">
          <div className="bg-gradient-to-br from-scout-blue to-blue-700 w-16 h-16 rounded-[22px] flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/25">
            <User size={32} />
          </div>
          <div>
            <p className="text-xs font-black text-scout-blue tracking-[0.18em]">PROFILE SETUP</p>
            <h2 className="text-2xl font-black text-slate-800 mt-2">إكمال ملفك الكشفي ⛺</h2>
          </div>
          <p className="text-slate-500 font-bold text-xs leading-relaxed">
            مرحباً <span className="text-scout-blue font-black">{currentUser.displayName || currentUser.email}</span>! أكمل بياناتك لتفعيل حسابك.
          </p>
        </div>

        {!setupRoleSelected ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {[
                { role: UserRole.CUB, label: '🏕️', title: 'شبل' },
                { role: UserRole.PARENT, label: '🤝', title: 'ولي أمر' },
                { role: UserRole.LEADER, label: '⚜️', title: 'قائد' },
              ].map((item) => (
                <button
                  key={item.role}
                  onClick={() => setSetupRole(item.role)}
                  className={`p-3 rounded-2xl border-2 font-black text-sm transition-all cursor-pointer ${
                    setupRole === item.role
                      ? 'border-scout-blue bg-scout-blue/6 text-scout-blue shadow-md scale-[1.02]'
                      : 'border-slate-100 bg-slate-50 text-slate-500'
                  }`}
                >
                  <div className="text-xl">{item.label}</div>
                  <div className="text-[10px] mt-1">{item.title}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setSetupRoleSelected(true)}
              className="w-full bg-gradient-to-r from-scout-blue to-blue-700 text-white font-black py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 text-xs cursor-pointer"
            >
              متابعة ➡️
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-black text-slate-600">
                الدور:{' '}
                <span className="text-scout-blue font-bold">
                  {setupRole === UserRole.LEADER
                    ? '⚜️ قائد'
                    : setupRole === UserRole.PARENT
                    ? '🤝 ولي أمر'
                    : '🏕️ شبل'}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setSetupRoleSelected(false)}
                className="text-[10px] text-red-500 font-black underline cursor-pointer"
              >
                تغيير
              </button>
            </div>
            <input
              type="text"
              required
              value={setupName}
              onChange={(e) => setSetupName(e.target.value)}
              placeholder="الاسم الكامل"
              className="w-full bg-slate-50 border border-slate-200 focus:border-scout-blue rounded-2xl py-2.5 px-3 font-black outline-none text-xs text-right shadow-sm"
            />
            <input
              type="tel"
              required
              value={setupPhone}
              onChange={(e) => setSetupPhone(e.target.value)}
              placeholder="رقم الهاتف"
              className="w-full bg-slate-50 border border-slate-200 focus:border-scout-blue rounded-2xl py-2.5 px-3 font-black outline-none text-xs text-left font-mono shadow-sm"
            />
            <input
              type="email"
              required
              value={setupEmail}
              onChange={(e) => setSetupEmail(e.target.value)}
              placeholder="البريد الإلكتروني"
              className="w-full bg-slate-50 border border-slate-200 focus:border-scout-blue rounded-2xl py-2.5 px-3 font-black outline-none text-xs text-left shadow-sm"
            />
            {setupRole === UserRole.CUB && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={setupAge}
                  onChange={(e) => setSetupAge(e.target.value)}
                  placeholder="السن"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-3 font-black outline-none text-xs text-left font-mono shadow-sm"
                />
                <select
                  value={setupStage}
                  onChange={(e) => setSetupStage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-3 font-black outline-none text-xs text-right shadow-sm"
                >
                  {['مرحلة القبول', 'شبل مبتدئ', 'شبل ثاني', 'شبل أول'].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}
            {setupRole === UserRole.PARENT && (
              <p className="text-[10px] font-bold text-slate-500 leading-relaxed bg-slate-50 border border-slate-100 rounded-xl p-3">
                بعد إكمال البيانات ستربط حسابك بحساب الشبل بكود ربط آمن يصدره الشبل من ملفه الشخصي أو قائد الفرقة.
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-700 text-white font-black py-3 rounded-2xl shadow-lg shadow-green-500/20 transition-all active:scale-95 text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw className="animate-spin" size={16} /> جاري الحفظ...
                </>
              ) : (
                'إكمال التسجيل 🎉'
              )}
            </button>
          </form>
        )}

        <button
          onClick={onLogout}
          className="w-full text-xs font-black text-red-500 hover:text-red-700 flex items-center justify-center gap-1 cursor-pointer"
        >
          <LogOut size={14} /> تسجيل الخروج
        </button>
      </div>
    </div>
  );
}
