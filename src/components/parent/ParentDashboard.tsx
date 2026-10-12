import React, { useState } from 'react';
import { ParentChildData, ParentMessage, AttendanceRecord } from '../../types';
import {
  Users,
  ShieldCheck,
  Calendar,
  Clock,
  Eye,
  MessageSquare,
  AlertCircle,
  Send,
  Sparkles,
  ChevronRight,
  TrendingUp,
  FileCheck,
} from 'lucide-react';

interface ParentDashboardProps {
  childrenData: ParentChildData[];
  messages: ParentMessage[];
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  childrenData,
  messages: initialMessages,
}) => {
  const [selectedChildId, setSelectedChildId] = useState<string>(childrenData[0]?.id || 'child-1');
  const [messages, setMessages] = useState<ParentMessage[]>(initialMessages);
  const [newMsgText, setNewMsgText] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'messaging'>('overview');

  const activeChild = childrenData.find((c) => c.id === selectedChildId) || childrenData[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgText.trim()) return;

    const userMsg: ParentMessage = {
      id: `pmsg_${Date.now()}`,
      senderName: 'You (Parent)',
      senderRole: 'Parent',
      timestamp: 'Just now',
      subject: `Inquiry regarding ${activeChild.name}`,
      message: newMsgText,
    };

    setMessages((prev) => [userMsg, ...prev]);
    setNewMsgText('');

    // Automated AI Tutor response simulation
    setTimeout(() => {
      const aiReply: ParentMessage = {
        id: `aimsg_${Date.now()}`,
        senderName: 'CogniSphere AI Mentor',
        senderRole: 'AI Mentor',
        timestamp: 'Just now',
        subject: `Re: Inquiry regarding ${activeChild.name}`,
        message: `Thank you for checking in! ${activeChild.name}'s active lesson engagement remained at ${activeChild.weeklyAvgFocus}% during today's lesson. Our adaptive interest engine continues to reframe complex formulas effectively.`,
        isAutomatedReport: true,
      };
      setMessages((prev) => [aiReply, ...prev]);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Child Selector */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 backdrop-blur-md shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-bold uppercase">
              Parent Guardian Portal
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400">Multi-Student Overview</span>
          </div>
          <h2 className="text-xl font-black text-slate-100 mt-1">
            Student Engagement & Verified Attendance
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuous engagement telemetry, active session logs, and mentor messaging.
          </p>
        </div>

        {/* Student Switcher Pills (One Parent Can Have Many Students) */}
        <div className="flex flex-wrap items-center gap-2">
          {childrenData.map((child) => (
            <button
              key={child.id}
              onClick={() => setSelectedChildId(child.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                selectedChildId === child.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{child.avatarEmoji}</span>
              <span>{child.name}</span>
              <span className="text-[10px] font-mono opacity-80">({child.grade.split(' ')[0]})</span>
            </button>
          ))}

          {/* Badge indicating multi-student capacity */}
          <span className="text-[10px] px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono">
            {childrenData.length} Linked {childrenData.length === 1 ? 'Student' : 'Students'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Daily Overview & Focus Curve
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'attendance'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Automated Cloud Attendance Logs
        </button>

        <button
          onClick={() => setActiveTab('messaging')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeTab === 'messaging'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Secure Mentor Messaging</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-xl">
              <div className="text-[11px] text-slate-400">Today's Focus Time</div>
              <div className="text-2xl font-black text-slate-100 mt-1 flex items-baseline gap-1">
                {activeChild.todayFocusMinutes} <span className="text-xs text-slate-400 font-normal">min</span>
              </div>
              <div className="text-[11px] text-emerald-400 mt-1">Goal: 30 min daily</div>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-xl">
              <div className="text-[11px] text-slate-400">Attendance Rate</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {activeChild.attendanceRatePct}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Biometrically Verified</div>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-xl">
              <div className="text-[11px] text-slate-400">Weekly Gaze Focus Avg</div>
              <div className="text-2xl font-black text-indigo-400 mt-1">
                {activeChild.weeklyAvgFocus}%
              </div>
              <div className="text-[11px] text-emerald-400 mt-1">Top 5% Engagement</div>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-xl">
              <div className="text-[11px] text-slate-400">Active Study Streak</div>
              <div className="text-2xl font-black text-amber-400 mt-1">
                🔥 {activeChild.streakDays} Days
              </div>
              <div className="text-[11px] text-slate-400 mt-1">{activeChild.xp} Total XP</div>
            </div>
          </div>

          {/* Current Course Card */}
          <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-mono uppercase text-indigo-400 font-bold">
                Current Active Track
              </div>
              <h3 className="text-base font-bold text-slate-100 mt-0.5">
                {activeChild.currentCourse}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Level 12 • 3D WebGL Labs & Automated AI Tutoring Active
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                FocusLens™ Proctor Active
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Attendance Logs */}
      {activeTab === 'attendance' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Automated Attendance & Proctoring Audit Records
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Cryptographically logged attendance with biometric attention score.
              </p>
            </div>

            <span className="text-xs text-slate-400 font-mono">
              Records for: <strong className="text-slate-200">{activeChild.name}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Time Window</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Gaze Focus Score</th>
                  <th className="p-3">Distractions</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Verification Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {activeChild.attendanceHistory.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-medium">{rec.date}</td>
                    <td className="p-3">{rec.timeSlot}</td>
                    <td className="p-3">{rec.durationMinutes} mins</td>
                    <td className="p-3">
                      <span
                        className={`font-bold font-mono ${
                          rec.focusScorePct >= 85
                            ? 'text-emerald-400'
                            : rec.focusScorePct >= 70
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {rec.focusScorePct}%
                      </span>
                    </td>
                    <td className="p-3">
                      {rec.distractionEvents === 0 ? (
                        <span className="text-emerald-400">None (Optimal)</span>
                      ) : (
                        <span className="text-amber-400">{rec.distractionEvents} events</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rec.status === 'Present'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{rec.verificationMethod}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Secure Messaging */}
      {activeTab === 'messaging' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-slate-100">Direct Message Feed</h3>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-4 rounded-xl border ${
                      m.senderRole === 'Parent'
                        ? 'bg-indigo-950/40 border-indigo-500/30'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-200 flex items-center gap-1.5">
                        {m.senderName}
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          {m.senderRole}
                        </span>
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">{m.timestamp}</span>
                    </div>
                    <div className="text-xs font-semibold text-indigo-300 mb-1">{m.subject}</div>
                    <p className="text-xs text-slate-300 leading-relaxed">{m.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Compose Message */}
            <form
              onSubmit={handleSendMessage}
              className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl flex gap-2"
            >
              <input
                type="text"
                value={newMsgText}
                onChange={(e) => setNewMsgText(e.target.value)}
                placeholder={`Ask AI tutor about ${activeChild.name}'s progress or request custom learning pacing...`}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>

          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-200">Parent Advisory Tips</h4>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2">
              <p>
                💡 <strong>Optimal Attention Time:</strong> Studies show {activeChild.name} performs with highest retention between 9:00 AM and 11:30 AM.
              </p>
              <p>
                🎯 <strong>Interest Context:</strong> Minecraft and space metaphors have elevated quiz recall by 28% over textbook baselines.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
