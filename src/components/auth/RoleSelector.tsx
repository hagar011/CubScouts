import React from 'react';
import { motion } from 'motion/react';
import { Tent, ShieldCheck, Compass, Users, Lock } from 'lucide-react';
import { UserRole } from '../../types';
import { User as FirebaseUser } from 'firebase/auth';

interface RoleSelectorProps {
  currentUser: FirebaseUser;
  onSelectRole: (role: UserRole) => void;
  onLogout: () => void;
  isLeaderEmail: (email?: string | null) => boolean;
}

export default function RoleSelector({
  currentUser,
  onSelectRole,
  onLogout,
  isLeaderEmail,
}: RoleSelectorProps) {
  const isAllowedLeader = isLeaderEmail(currentUser.email);

  return (
    <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,#0f172a_0%,#0b1f3a_28%,#0a1225_100%)] z-[100] flex items-center justify-center p-6 overflow-y-auto font-sans" dir="rtl">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_15%_20%,rgba(250,204,21,0.2)_0_2px,transparent_3px),radial-gradient(circle_at_80%_35%,rgba(59,130,246,0.2)_0_2px,transparent_3px),radial-gradient(circle_at_60%_75%,rgba(16,185,129,0.2)_0_2px,transparent_3px)] bg-[length:140px_140px]" />

      <div className="relative max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 py-10">
        <div className="text-center md:col-span-3 mb-6 space-y-4 text-white">
          <div className="bg-gradient-to-br from-scout-blue to-blue-700 w-20 h-20 rounded-[28px] flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-500/20">
            <Tent size={40} />
          </div>
          <div>
            <p className="text-xs font-black text-scout-yellow tracking-[0.18em]">SCOUT ACCESS</p>
            <h1 className="text-4xl font-black text-white mt-2">مرحباً بك يا بطل! ⚜️</h1>
          </div>
          <p className="text-emerald-200 font-bold text-lg">اختر دورك الكشفي</p>
          <div className="text-slate-300 text-xs font-bold">
            مسجل كـ: <span className="text-white underline font-black">{currentUser.email}</span>
          </div>
        </div>

        <motion.button
          whileHover={isAllowedLeader ? { y: -8 } : {}}
          onClick={() => {
            if (isAllowedLeader) onSelectRole(UserRole.LEADER);
          }}
          disabled={!isAllowedLeader}
          className={`relative bg-white/95 p-7 flex flex-col items-center text-center gap-6 border-b-8 shadow-[0_18px_40px_rgba(15,23,42,0.15)] rounded-[32px] backdrop-blur-sm ${
            isAllowedLeader
              ? 'border-scout-blue cursor-pointer'
              : 'border-slate-300 opacity-60 cursor-not-allowed'
          }`}
        >
          {!isAllowedLeader && (
            <div className="absolute top-4 right-4 bg-orange-100 text-orange-600 p-2 rounded-xl border border-orange-200 shadow-sm">
              <Lock size={16} />
            </div>
          )}
          <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center ${isAllowedLeader ? 'bg-scout-blue/10 text-scout-blue' : 'bg-slate-100 text-slate-400'}`}>
            <ShieldCheck size={40} />
          </div>
          <div>
            <h3 className={`text-xl font-black ${isAllowedLeader ? 'text-scout-blue' : 'text-slate-400'}`}>
              دخول القائد
            </h3>
            <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
              إدارة الفرقة، تسجيل التقييمات، ومتابعة التقدم الكشفي.
            </p>
          </div>
          <span className={`px-6 py-2 rounded-2xl font-black text-xs shadow-lg ${isAllowedLeader ? 'bg-scout-blue text-white' : 'bg-slate-100 text-slate-400'}`}>
            {isAllowedLeader ? 'دخول المشرفين' : 'مغلق'}
          </span>
        </motion.button>

        <motion.button
          whileHover={{ y: -8 }}
          onClick={() => onSelectRole(UserRole.CUB)}
          className="bg-white/95 p-7 flex flex-col items-center text-center gap-6 border-b-8 border-scout-yellow shadow-[0_18px_40px_rgba(15,23,42,0.15)] cursor-pointer rounded-[32px] backdrop-blur-sm"
        >
          <div className="w-20 h-20 bg-scout-yellow/10 rounded-[28px] flex items-center justify-center text-scout-yellow">
            <Compass size={40} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">بوابة الشبل</h3>
            <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
              ابدأ مغامرتك الكشفية، العب الألعاب، واجمع الأوسمة.
            </p>
          </div>
          <span className="bg-scout-yellow text-slate-800 px-6 py-2 rounded-2xl font-black text-xs shadow-lg">
            أنا شبل مغامر
          </span>
        </motion.button>

        <motion.button
          whileHover={{ y: -8 }}
          onClick={() => onSelectRole(UserRole.PARENT)}
          className="bg-white/95 p-7 flex flex-col items-center text-center gap-6 border-b-8 border-emerald-500 shadow-[0_18px_40px_rgba(15,23,42,0.15)] cursor-pointer rounded-[32px] backdrop-blur-sm"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-[28px] flex items-center justify-center text-emerald-600">
            <Users size={40} />
          </div>
          <div>
            <h3 className="text-xl font-black text-emerald-600">دخول ولي الأمر</h3>
            <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
              متابعة إنجازات طفلك، التقييم المنزلي، ورؤية الأوسمة.
            </p>
          </div>
          <span className="bg-emerald-500 text-white px-6 py-2 rounded-2xl font-black text-xs shadow-lg">
            متابعة الأبناء
          </span>
        </motion.button>

        <div className="text-center md:col-span-3 mt-4">
          <button
            onClick={onLogout}
            className="text-slate-200 font-bold hover:text-red-400 transition-colors flex items-center gap-2 mx-auto cursor-pointer"
          >
            تسجيل الخروج 🚪
          </button>
        </div>
      </div>
    </div>
  );
}
