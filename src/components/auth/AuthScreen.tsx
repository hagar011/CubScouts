import React, { useState } from 'react';
import { ShieldCheck, Compass, Users, Tent, AlertCircle } from 'lucide-react';
import { UserRole, Cub } from '../../types';

interface AuthScreenProps {
  authError: string;
  onSignIn: (email: string, pass: string) => Promise<void>;
  onSignUp: (data: {
    name: string;
    email: string;
    pass: string;
    phone: string;
    role: UserRole;
    age: string;
    stage: string;
    photo: string;
  }) => Promise<void>;
  cubs: Cub[];
}

export default function AuthScreen({
  authError,
  onSignIn,
  onSignUp,
}: AuthScreenProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [localError, setLocalError] = useState('');

  // Login inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register inputs
  const [regRole, setRegRole] = useState<UserRole>(UserRole.CUB);
  const [regRoleSelected, setRegRoleSelected] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAge, setRegAge] = useState('');
  const [regStage, setRegStage] = useState('شبل مبتدئ');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayError = localError || authError;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLocalError('يرجى كتابة البريد وكلمة المرور.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSignIn(loginEmail.trim(), loginPassword);
    } catch (err: unknown) {
      setLocalError((err as Error).message || 'فشل تسجيل الدخول');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim() || !regPhone.trim()) {
      setLocalError('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }
    if (regPassword.length < 6) {
      setLocalError('كلمة المرور يجب أن تكون ٦ خانات على الأقل.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSignUp({
        name: regName.trim(),
        email: regEmail.trim(),
        pass: regPassword,
        phone: regPhone.trim(),
        role: regRole,
        age: regAge.trim(),
        stage: regStage,
        photo: '🦁',
      });
    } catch (err: unknown) {
      setLocalError((err as Error).message || 'فشل التسجيل');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#0f172a_0%,#0b1f3a_28%,#0a1225_100%)] flex items-center justify-center p-4 sm:p-6 text-right font-sans" dir="rtl">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_15%_20%,rgba(250,204,21,0.2)_0_2px,transparent_3px),radial-gradient(circle_at_80%_35%,rgba(59,130,246,0.22)_0_2px,transparent_3px),radial-gradient(circle_at_60%_75%,rgba(16,185,129,0.18)_0_2px,transparent_3px)] bg-[length:140px_140px]" />

      <div className="relative max-w-5xl w-full grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-8 bg-white/8 backdrop-blur-xl rounded-[46px] p-5 md:p-8 border border-white/10 shadow-[0_30px_90px_rgba(2,6,23,0.6)]">
        <div className="flex flex-col justify-between space-y-6 text-white rounded-[28px] bg-white/5 p-5 md:p-6 border border-white/10">
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-scout-yellow/30 to-amber-400/20 w-16 h-16 rounded-[22px] flex items-center justify-center text-scout-yellow border border-scout-yellow/25 shadow-lg shadow-yellow-400/10">
              <Tent size={36} />
            </div>
            <div>
              <p className="text-xs font-black text-scout-yellow/80 tracking-[0.2em]">SCOUT PORTAL</p>
              <h1 className="text-3xl md:text-4xl font-black leading-tight mt-2">منصة الأشبال الذكية ⚜️</h1>
            </div>
            <p className="text-sm text-white/75 leading-relaxed font-bold">
              بوابة كشفية تربوية تفاعلية تدعم القادة والأشبال وأولياء الأمور في رحلة النمو والإنجاز.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: <ShieldCheck size={18} />, title: 'نظام القائد الذكي', desc: 'توجيه السداسيات ورصد الحضور والتقييم.' },
              { icon: <Compass size={18} />, title: 'بوابة المغامرات', desc: 'مسابقات في عقد الكشافة والألعاب التفاعلية.' },
              { icon: <Users size={18} />, title: 'ركن أولياء الأمور', desc: 'متابعة إنجازات الشبل والتقييم المنزلي.' },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3 bg-slate-950/20 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                <span className="text-scout-yellow mt-1 shrink-0">{f.icon}</span>
                <div>
                  <h4 className="font-black text-sm">{f.title}</h4>
                  <p className="text-[10px] text-white/70 mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[34px] p-5 md:p-7 shadow-[0_25px_80px_rgba(15,23,42,0.12)] flex flex-col border-4 border-scout-yellow/15">
          <div className="flex border-b-2 border-slate-100 pb-3 mb-6">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setAuthMode(m); setLocalError(''); }}
                className={`flex-1 text-center py-2.5 font-black text-sm transition-all cursor-pointer rounded-t-xl ${
                  authMode === m
                    ? 'text-scout-blue bg-scout-blue/5 border-b-4 border-scout-blue'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {m === 'login' ? 'تسجيل الدخول' : 'حساب جديد'}
              </button>
            ))}
          </div>

          {displayError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-2xl text-xs font-black border border-red-100 flex items-center gap-2 mb-4 leading-relaxed">
              <AlertCircle size={16} className="shrink-0" />
              <span>{displayError}</span>
            </div>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 flex-1">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">البريد الإلكتروني</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="scout@example.com"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-scout-blue rounded-2xl py-3 px-4 font-black outline-none text-sm text-left shadow-sm transition"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">كلمة المرور</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-scout-blue rounded-2xl py-3 px-4 font-black outline-none text-sm text-left shadow-sm transition"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-scout-blue to-blue-700 hover:from-blue-700 hover:to-scout-blue text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 text-sm cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'جاري التحقق...' : 'تسجيل الدخول'}
              </button>
            </form>
          ) : (
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[420px] pr-1">
              {!regRoleSelected ? (
                <div className="space-y-4">
                  <p className="text-xs font-black text-slate-500 text-right">اختر نوع الحساب أولاً</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { role: UserRole.CUB, label: '🏕️', title: 'شبل', desc: 'مغامر صغير' },
                      { role: UserRole.PARENT, label: '🤝', title: 'ولي أمر', desc: 'أب/أم الشبل' },
                      { role: UserRole.LEADER, label: '⚜️', title: 'قائد', desc: 'إدارة الفرقة' },
                    ].map((item) => (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => setRegRole(item.role)}
                        className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                          regRole === item.role
                            ? 'border-scout-blue bg-scout-blue/6 text-scout-blue font-black shadow-md scale-[1.02]'
                            : 'border-slate-100 bg-slate-50 text-slate-500 font-bold'
                        }`}
                      >
                        <span className="text-xl">{item.label}</span>
                        <span className="text-xs mt-1">{item.title}</span>
                        <span className="text-[9px] opacity-75 mt-1">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setRegRoleSelected(true)}
                    className="w-full bg-gradient-to-r from-scout-blue to-blue-700 text-white font-black py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 text-xs cursor-pointer"
                  >
                    متابعة ➡️
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-2xl border border-slate-100 mb-1">
                    <span className="text-[11px] font-black text-slate-600">
                      الحساب:{' '}
                      <span className="text-scout-blue bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                        {regRole === UserRole.LEADER
                          ? '⚜️ قائد'
                          : regRole === UserRole.PARENT
                          ? '🤝 ولي أمر'
                          : '🏕️ شبل'}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setRegRoleSelected(false)}
                      className="text-[10px] font-black text-red-500 underline cursor-pointer"
                    >
                      تغيير 🔄
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="الاسم الكامل"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-scout-blue rounded-2xl py-2.5 px-3 font-black outline-none text-xs text-right shadow-sm"
                  />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="البريد الإلكتروني"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-scout-blue rounded-2xl py-2.5 px-3 font-black outline-none text-xs text-left shadow-sm"
                  />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="كلمة المرور (٦ خانات+)"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-scout-blue rounded-2xl py-2.5 px-3 font-black outline-none text-xs text-left shadow-sm"
                  />
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="رقم الهاتف"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-scout-blue rounded-2xl py-2.5 px-3 font-black outline-none text-xs text-left font-mono shadow-sm"
                  />
                  {regRole === UserRole.CUB && (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={regAge}
                        onChange={(e) => setRegAge(e.target.value)}
                        placeholder="السن"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-3 font-black outline-none text-xs text-left font-mono shadow-sm"
                      />
                      <select
                        value={regStage}
                        onChange={(e) => setRegStage(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-3 font-black outline-none text-xs text-right shadow-sm"
                      >
                        {['مرحلة القبول', 'شبل مبتدئ', 'شبل ثاني', 'شبل أول'].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {regRole === UserRole.PARENT && (
                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed bg-slate-50 border border-slate-100 rounded-xl p-3">
                      بعد إنشاء الحساب ستربط حسابك بحساب الشبل بكود ربط آمن يصدره الشبل من ملفه الشخصي أو قائد الفرقة.
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-700 hover:from-green-700 hover:to-emerald-500 text-white font-black py-3 rounded-2xl shadow-lg shadow-green-500/20 transition-all active:scale-95 text-xs cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'جاري التسجيل...' : 'تسجيل الحساب 🎉'}
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="text-center text-[10px] text-slate-400 font-bold border-t border-slate-100 pt-3 mt-4">
            بوابة الحماية من الأذى مفعلة • ٢٠٢٦
          </div>
        </div>
      </div>
    </div>
  );
}
