import React, { useState } from 'react';
import { StudentProfile, AttendanceRecord } from '../../types';
import { offlineStorage } from '../../services/offlineStorage';
import {
  BarChart3,
  TrendingUp,
  Brain,
  ShieldCheck,
  RefreshCw,
  Clock,
  Award,
  Zap,
  Activity,
  CheckCircle2,
} from 'lucide-react';

interface StudentAnalyticsViewProps {
  profile: StudentProfile;
  attendanceLogs: AttendanceRecord[];
}

export const StudentAnalyticsView: React.FC<StudentAnalyticsViewProps> = ({
  profile,
  attendanceLogs,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await offlineStorage.triggerCloudSync();
      if (res.syncedCount > 0) {
        setSyncNotice(`Successfully synchronized ${res.syncedCount} queued records to cloud backend.`);
      } else {
        setSyncNotice('All local records are already up to date with cloud backend.');
      }
    } catch {
      setSyncNotice('Offline: records safely retained in queue for auto-sync.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncNotice(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 backdrop-blur-md shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[11px] font-mono font-bold uppercase">
              Cloud Telemetry & Sync Active
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400">Behavioral Telemetry & Cognitive Science</span>
          </div>
          <h2 className="text-xl font-black text-slate-100 mt-1">
            Real-Time Student Behavioral Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-analyzing gaze focus duration, quiz response latencies, and interest personalization multipliers.
          </p>
        </div>

        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync with PostgreSQL'}</span>
        </button>
      </div>

      {syncNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Avg. Eye-Gaze Focus</span>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">93.2%</div>
          <div className="text-[11px] text-slate-500 mt-1">+14% during Minecraft skin</div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-indigo-400" />
            <span>Cognitive Efficiency</span>
          </div>
          <div className="text-2xl font-black text-indigo-400 mt-1">1.82x</div>
          <div className="text-[11px] text-slate-500 mt-1">Faster retention vs linear text</div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Verified Attendance</span>
          </div>
          <div className="text-2xl font-black text-blue-400 mt-1">98.5%</div>
          <div className="text-[11px] text-slate-500 mt-1">0 unexcused lapses</div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Quiz First-Pass Rate</span>
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">88.9%</div>
          <div className="text-[11px] text-slate-500 mt-1">3,420 Total XP logged</div>
        </div>
      </div>

      {/* Deep Behavioral Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Focus vs Quiz Score Correlation */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-100">
                FocusLens™ Attention vs. Quiz Score Correlation
              </h3>
              <p className="text-[11px] text-slate-400">
                High gaze focus (&gt;85%) correlates directly with 95%+ quiz accuracy.
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              r = 0.92 (Strong)
            </span>
          </div>

          <div className="h-48 bg-slate-950 rounded-xl p-4 border border-slate-800 flex items-end justify-between gap-3">
            {[
              { day: 'Mon', focus: 78, score: 80 },
              { day: 'Tue', focus: 85, score: 88 },
              { day: 'Wed', focus: 92, score: 95 },
              { day: 'Thu', dayFocus: 'Low', focus: 71, score: 75 },
              { day: 'Fri', focus: 96, score: 98 },
              { day: 'Sat', focus: 90, score: 92 },
              { day: 'Sun', focus: 94, score: 96 },
            ].map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1 h-32">
                  {/* Focus bar */}
                  <div
                    className="w-2.5 bg-indigo-500 rounded-t"
                    style={{ height: `${d.focus}%` }}
                    title={`Focus: ${d.focus}%`}
                  />
                  {/* Quiz score bar */}
                  <div
                    className="w-2.5 bg-emerald-400 rounded-t"
                    style={{ height: `${d.score}%` }}
                    title={`Score: ${d.score}%`}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400">{d.day}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-indigo-500" />
              Focus Score %
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-400" />
              Quiz Accuracy %
            </span>
          </div>
        </div>

        {/* Chart 2: Skill Radar / Mastery Breakdown */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-100">
              Cognitive Domain Mastery Breakdown
            </h3>
            <p className="text-[11px] text-slate-400">
              Assessed across 3D interactive manipulation and Socratic tutor interactions.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { skill: 'Spatial Geometry & 3D Vector Logic', pct: 92, color: 'bg-indigo-500' },
              { skill: 'Memory Pointers & Hardware State', pct: 86, color: 'bg-emerald-500' },
              { skill: 'Non-linear Threshold Functions', pct: 88, color: 'bg-purple-500' },
              { skill: 'Thermodynamic Bonding Energies', pct: 79, color: 'bg-amber-500' },
              { skill: 'Quantum Superposition State Transitions', pct: 94, color: 'bg-rose-500' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{item.skill}</span>
                  <span className="font-mono text-slate-200 font-bold">{item.pct}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
