import React, { useState } from 'react';
import { Calendar, Plus, Trash2, Clock } from 'lucide-react';
import { Meeting, Cub, UserRole } from '../../types';

interface MeetingsTabProps {
  role: UserRole;
  meetings: Meeting[];
  cubs: Cub[];
  onCreateMeeting: (title: string, date: string) => Promise<void>;
  onToggleMeetingAttendance: (meetingId: string, cubId: string) => Promise<void>;
  onDeleteMeeting: (meetingId: string) => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function MeetingsTab({
  role,
  meetings,
  cubs,
  onCreateMeeting,
  onToggleMeetingAttendance,
  onDeleteMeeting,
  showToast
}: MeetingsTabProps) {
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeAttendanceMeetingId, setActiveAttendanceMeetingId] = useState<string | null>(null);

  const isLeader = role === UserRole.LEADER;

  const handleSubmitMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTitle.trim()) {
      showToast('يرجى كتابة عنوان للاجتماع الكشفي الأسبوعي!', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      await onCreateMeeting(meetingTitle.trim(), meetingDate);
      setMeetingTitle('');
      setShowAddForm(false);
    } catch (err) {
      showToast('حدث خطأ أثناء حفظ الاجتماع.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-350 text-right font-sans" dir="rtl">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Calendar className="text-scout-blue animate-pulse" size={24} /> سجل خطط وجداول اللقاءات الكشفية الأسبوعية
          </h2>
          <p className="text-xs text-slate-500 font-bold">
            {isLeader
              ? 'إدارة جلسات التدريب، المناهج الكشفية، ورصد حضور وغياب الأشبال لكل لقاء.'
              : 'تابع مواعيد الاجتماعات ومحاور التعلم التي يضعها لك أفراد فرقة القادة.'}
          </p>
        </div>
        {isLeader && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-5 py-2.5 bg-scout-blue text-white rounded-2xl font-black text-xs hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 border-b-2 border-indigo-900 shadow-sm"
          >
            <Plus size={16} />
            <span>تسجيل اجتماع أسبوعي جديد</span>
          </button>
        )}
      </div>

      {/* Add Meeting Form */}
      {isLeader && showAddForm && (
        <form onSubmit={handleSubmitMeeting} className="p-6 bg-white border-2 border-scout-blue/20 rounded-[32px] shadow-sm space-y-4">
          <h3 className="text-sm font-black text-scout-blue flex items-center gap-1.5">
            <span>📅</span> إعداد وإطلاق اجتماع أسبوعي جديد
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <label className="text-xs font-black text-slate-500 block mb-1">محور أو موضوع الاجتماع</label>
              <input
                type="text"
                required
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                placeholder="مثال: التدريب على العقدة المربعة ومبادئ الاتجاهات"
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 font-bold text-xs outline-none"
              />
            </div>
            <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <label className="text-xs font-black text-slate-500 block mb-1">تاريخ ووقت اللقاء</label>
              <input
                type="date"
                required
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 font-bold text-xs outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-scout-blue hover:bg-blue-800 text-white font-black text-xs rounded-xl shadow-lg transition-all active:scale-95"
          >
            {isSubmitting ? 'جاري الحفظ والجدولة...' : 'حفظ ومشاركة مع الفرقة ✓'}
          </button>
        </form>
      )}

      {/* Meetings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {meetings.length > 0 ? (
          meetings.map((meeting) => {
            const attendingCount = Object.values(meeting.attendance || {}).filter(Boolean).length;
            const isAttendanceOpen = activeAttendanceMeetingId === meeting.id;

            return (
              <div key={meeting.id} className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm space-y-4 relative overflow-hidden flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-xs bg-slate-50 text-slate-500 px-3 py-1 rounded-full font-black border flex items-center gap-1">
                      <Clock size={12} /> {meeting.date}
                    </span>
                    {isLeader && (
                      <button
                        onClick={async () => {
                          const ok = confirm(`هل تريد بالتأكيد حذف الاجتماع: "${meeting.title}"؟`);
                          if (ok) await onDeleteMeeting(meeting.id);
                        }}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors border"
                        title="حذف الاجتماع"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <h3 className="font-black text-sm text-slate-800 leading-relaxed">{meeting.title}</h3>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-4 select-none">
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">
                    حضور الأشبال: <span className="font-black text-scout-blue">{attendingCount} / {cubs.length}</span>
                  </span>
                  {isLeader && (
                    <button
                      onClick={() => setActiveAttendanceMeetingId(isAttendanceOpen ? null : meeting.id)}
                      className={`px-4 py-2 border rounded-xl text-xs font-black transition-all ${
                        isAttendanceOpen ? 'bg-scout-blue text-white' : 'hover:bg-slate-50'
                      }`}
                    >
                      {isAttendanceOpen ? 'إغلاق الحضور والغياب ⛌' : 'رصد الحضور والغياب ✓'}
                    </button>
                  )}
                </div>

                {/* Attendance checklist */}
                {isLeader && isAttendanceOpen && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-dashed space-y-2 max-h-[250px] overflow-y-auto">
                    <span className="text-[9px] font-black uppercase text-slate-400 block mb-2">
                      اضغط على أي شبل لتسجيل الحضور والاستحقاقات
                    </span>
                    {cubs.map((cub) => {
                      const isPresent = !!meeting.attendance?.[cub.id];
                      return (
                        <div key={cub.id} className="w-full p-3 rounded-xl border bg-white flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>{cub.avatar || '🦁'}</span>
                            <span className="font-black text-[11px]">{cub.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { if (!isPresent) onToggleMeetingAttendance(meeting.id, cub.id); }}
                              className={`px-3 py-1 rounded-lg border text-[10px] font-black transition-all ${
                                isPresent
                                  ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                                  : 'bg-white border-slate-200 text-slate-400 hover:bg-emerald-50'
                              }`}
                            >
                              ✓ حاضر
                            </button>
                            <button
                              onClick={() => { if (isPresent) onToggleMeetingAttendance(meeting.id, cub.id); }}
                              className={`px-3 py-1 rounded-lg border text-[10px] font-black transition-all ${
                                !isPresent
                                  ? 'bg-rose-100 border-rose-300 text-rose-700'
                                  : 'bg-white border-slate-200 text-slate-400 hover:bg-rose-50'
                              }`}
                            >
                              ✗ غائب
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 text-slate-400 font-bold italic">
            لم تُسجّل أي اجتماعات كشفية أسبوعية حتى الآن.
          </div>
        )}
      </div>

      {/* Guide Banner */}
      <div className="p-6 bg-rose-500/5 rounded-3xl border-2 border-dashed border-rose-500/20 flex gap-4 items-center">
        <div className="w-12 h-12 bg-rose-100 text-rose-605 rounded-2xl flex items-center justify-center text-2xl shrink-0">
          📍
        </div>
        <div>
          <h4 className="text-xs font-black text-rose-850">ملاحظات حضور الاجتماعات</h4>
          <p className="text-[10px] text-slate-500 font-bold mt-1 leading-relaxed">
            الالتزام بمواعيد اللقاءات فرصة لرفع تقييم الحضور في التقرير الشهري التفاعلي للأشبال بمعدل (8 لقاءات شهرياً)، والاستحقاق نحو رتبة الشبل المبتدئ، الثاني، والأول.
          </p>
        </div>
      </div>

    </div>
  );
}
