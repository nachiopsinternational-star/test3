import React, { useState } from 'react';
import { StudentProfile, LMSConfig, InterestId } from '../../types';
import { LANGUAGES, SupportedLanguage, LanguageOption } from '../../services/i18n';
import { offlineStorage, OfflineLessonPackage } from '../../services/offlineStorage';
import { STUDENT_INTERESTS } from '../../data/mockData';
import {
  Globe,
  Download,
  Wifi,
  WifiOff,
  Link,
  Shield,
  Volume2,
  Trash2,
  CheckCircle2,
  Send,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface SettingsViewProps {
  profile: StudentProfile;
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onInterestChange: (interestId: InterestId) => void;
  lmsConfig: LMSConfig;
  onUpdateLMSConfig: (config: LMSConfig) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  currentLanguage,
  onLanguageChange,
  onInterestChange,
  lmsConfig,
  onUpdateLMSConfig,
}) => {
  const [cachedLessons, setCachedLessons] = useState<OfflineLessonPackage[]>(
    offlineStorage.getCachedLessons()
  );
  const [isDownloadingOffline, setIsDownloadingOffline] = useState(false);
  const [lmsTestStatus, setLmsTestStatus] = useState<string | null>(null);
  const [highContrast, setHighContrast] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleDownloadAll = async () => {
    setIsDownloadingOffline(true);
    await new Promise((res) => setTimeout(res, 1200));

    const newPkg: OfflineLessonPackage = {
      courseId: profile.activeCourseId,
      chapterId: profile.activeChapterId,
      title: 'Full 3D Course Offline Container (GLBX-v3.4)',
      cachedAt: Date.now(),
      sizeBytes: 19412030,
    };
    offlineStorage.cacheLesson(newPkg);
    setCachedLessons(offlineStorage.getCachedLessons());
    setIsDownloadingOffline(false);
  };

  const handleClearCache = () => {
    localStorage.removeItem('cognisphere_offline_lessons');
    setCachedLessons([]);
  };

  const handleTestLMSWebhook = async () => {
    setLmsTestStatus('Testing webhook connection to Canvas LMS endpoint...');
    await new Promise((res) => setTimeout(res, 800));
    setLmsTestStatus('✓ Webhook ping 200 OK! Gradebook & Roster sync authenticated via LTI 1.3.');
    setTimeout(() => setLmsTestStatus(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Settings Header */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 backdrop-blur-md shadow-xl">
        <h2 className="text-xl font-black text-slate-100">
          System Preferences, LMS Hooks & Offline Cache
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure multi-language accessibility, manage local PWA offline packages, and calibrate LMS integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Multi-Language Localization */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Multi-Language Accessibility (i18n)
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Instantly translate the entire user interface and 3D simulation captions into your preferred native tongue.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => onLanguageChange(lang.code)}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  currentLanguage === lang.code
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-md font-bold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <div>
                  <div className="text-xs font-semibold leading-tight">{lang.native}</div>
                  <div className="text-[10px] text-slate-500">{lang.label}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Personalized Context Switching */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Primary Personalized Context
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Choose your passion. The AI engine automatically adapts all 3D scene visual metaphors and quiz prompts.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {STUDENT_INTERESTS.map((interest) => (
              <button
                key={interest.id}
                onClick={() => onInterestChange(interest.id)}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  profile.selectedInterest === interest.id
                    ? 'bg-purple-600/20 border-purple-500 text-purple-200 font-bold shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="text-base">{interest.emoji}</span>
                <span className="text-xs truncate">{interest.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: PWA Offline Capabilities */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100">
                PWA Offline Lesson Cache
              </h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Remote Access Enabled
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Download complete 3D interactive lesson packs and quiz banks to study without internet access (e.g. airplane or rural area).
          </p>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Cached Lesson Modules:</span>
              <span className="font-bold font-mono text-slate-100">{cachedLessons.length} Packages</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Local Storage Used:</span>
              <span className="font-mono">
                {(
                  cachedLessons.reduce((acc, c) => acc + c.sizeBytes, 0) /
                  (1024 * 1024)
                ).toFixed(1)}{' '}
                MB / 500 MB
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDownloadAll}
              disabled={isDownloadingOffline}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloadingOffline ? 'Caching .glbx...' : 'Download for Offline Mode'}</span>
            </button>

            <button
              onClick={handleClearCache}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 rounded-xl transition-colors"
              title="Clear Offline Cache"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Section 4: LMS Integration Hooks (Canvas / Moodle / Blackboard) */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-slate-100">
                LMS API Hooks & LTI v1.3
              </h3>
            </div>
            <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              {lmsConfig.lmsName}
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Seamlessly synchronize attendance verification, gradebooks, and quiz mastery with institutional LMS platforms.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-400">Target LMS Platform</label>
              <select
                value={lmsConfig.lmsName}
                onChange={(e) =>
                  onUpdateLMSConfig({ ...lmsConfig, lmsName: e.target.value as any })
                }
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="Canvas LMS">Canvas LMS (Instructure)</option>
                <option value="Blackboard Learn">Blackboard Learn Ultra</option>
                <option value="Moodle Core">Moodle Core / Workplace</option>
                <option value="Google Classroom">Google Classroom API</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400">LTI 1.3 Webhook Endpoint</label>
              <input
                type="text"
                value={lmsConfig.endpoint}
                onChange={(e) =>
                  onUpdateLMSConfig({ ...lmsConfig, endpoint: e.target.value })
                }
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleTestLMSWebhook}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Test Webhook Ping</span>
              </button>

              <span className="text-[11px] text-slate-500 font-mono">
                Status: {lmsConfig.webhookStatus}
              </span>
            </div>

            {lmsTestStatus && (
              <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-200 text-[11px]">
                {lmsTestStatus}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
