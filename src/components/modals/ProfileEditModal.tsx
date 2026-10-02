import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Check, LogOut, UserCog, ShieldCheck } from 'lucide-react';
import { Cub, CubLevel, UserRole } from '../../types';
import { AVATARS } from '../../constants/scoutData';
import { User as FirebaseUser } from 'firebase/auth';
import CubParentsSection from '../linking/CubParentsSection';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  userProfile: Record<string, unknown> | null;
  role: UserRole | null;
  activeCub: Cub | null;
  onSaveProfile: (updates: {
    displayName: string;
    phone: string;
    photoURL: string;
    age: string;
    stage: string;
  }) => Promise<void>;
  onLogout: () => void;
}

export default function ProfileEditModal({
  isOpen,
  onClose,
  currentUser,
  userProfile,
  role,
  activeCub,
  onSaveProfile,
  onLogout,
}: ProfileEditModalProps) {
  const [profileEditName, setProfileEditName] = useState(
    (userProfile?.displayName as string) || currentUser?.displayName || ''
  );
  const [profileEditPhone, setProfileEditPhone] = useState(
    (userProfile?.phone as string) || ''
  );
  const [profileEditAge, setProfileEditAge] = useState(
    (userProfile?.age as string) || ''
  );
  const [profileEditStage, setProfileEditStage] = useState(
    (userProfile?.stage as string) || 'شبل مبتدئ'
  );
  const [profileEditPhoto, setProfileEditPhoto] = useState(
    (userProfile?.photoURL as string) || '🦁'
  );
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveProfile({
        displayName: profileEditName.trim(),
        phone: profileEditPhone.trim(),
        photoURL: profileEditPhoto,
        age: profileEditAge,
        stage: profileEditStage,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[150] flex items-center justify-center p-6 text-right font-sans" dir="rtl">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white max-w-md w-full rounded-[34px] p-6 sm:p-7 shadow-[0_25px_80px_rgba(15,23,42,0.18)] border-4 border-scout-yellow/30 max-h-[90vh] overflow-y-auto"
        >
          <div className="relative mb-6">
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-scout-blue via-blue-600 to-scout-green rounded-t-[28px]" />
            <div className="relative flex justify-between items-center pt-6 px-2">
              <div className="flex items-center gap-2 text-white">
                <div className="bg-white/15 p-2 rounded-2xl">
                  <UserCog size={18} />
                </div>
                <h2 className="text-xl font-black">الملف الشخصي</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-white/15 hover:bg-white/20 rounded-xl text-white cursor-pointer"
              >
                <Plus size={20} className="rotate-45" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-[26px] bg-slate-50 p-3 border border-slate-200">
              <div className="mb-2 flex items-center gap-2 text-scout-blue">
                <ShieldCheck size={15} />
                <span className="text-[10px] font-black tracking-[0.2em]">AVATAR</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {AVATARS.slice(0, 16).map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setProfileEditPhoto(em)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border-2 transition-all cursor-pointer ${
                      profileEditPhoto === em
                        ? 'bg-scout-yellow/20 border-scout-yellow scale-110 shadow-md'
                        : 'bg-white border-transparent hover:bg-slate-100'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500">الاسم الكامل</label>
              <input
                type="text"
                required
                value={profileEditName}
                onChange={(e) => setProfileEditName(e.target.value)}
                placeholder="الاسم الكامل"
                className="w-full bg-slate-50 border border-slate-200 focus:border-scout-blue rounded-2xl py-3 px-4 font-black outline-none text-sm text-right shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500">رقم الهاتف</label>
              <input
                type="text"
                value={profileEditPhone}
                onChange={(e) => setProfileEditPhone(e.target.value)}
                placeholder="رقم الهاتف"
                className="w-full bg-slate-50 border border-slate-200 focus:border-scout-blue rounded-2xl py-3 px-4 font-black outline-none text-sm text-left font-mono shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-scout-green to-emerald-700 text-white font-black py-3 rounded-2xl text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg shadow-emerald-500/20"
            >
              <Check size={16} /> {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="w-full text-xs font-black text-red-500 flex items-center justify-center gap-1 cursor-pointer hover:underline pt-2"
            >
              <LogOut size={14} /> تسجيل الخروج
            </button>
          </form>

          {role === UserRole.CUB && currentUser && activeCub && (
            <CubParentsSection
              cubUid={currentUser.uid}
              cubName={activeCub.name}
              cubAvatar={activeCub.avatar}
            />
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
