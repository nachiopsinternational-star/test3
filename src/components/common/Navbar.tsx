import React from 'react';
import { UserRole, StudentProfile, StudentInterest, InterestId, AuthUser } from '../../types';
import { SupportedLanguage, LANGUAGES } from '../../services/i18n';
import {
  Sparkles,
  Flame,
  Award,
  Globe,
  Wifi,
  WifiOff,
  User,
  Shield,
  Layers,
  GraduationCap,
  Store,
  BarChart2,
  Settings,
  LogIn,
  LogOut,
  Zap,
} from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeView: string;
  onNavigate: (view: string) => void;
  profile: StudentProfile;
  interests: StudentInterest[];
  onSelectInterest: (id: InterestId) => void;
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  isOnline: boolean;
  authUser: AuthUser | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  onOpenTasks?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  activeView,
  onNavigate,
  profile,
  interests,
  onSelectInterest,
  currentLanguage,
  onLanguageChange,
  isOnline,
  authUser,
  onOpenAuth,
  onLogout,
  onOpenTasks,
}) => {
  const currentInterest =
    interests.find((i) => i.id === profile.selectedInterest) || interests[0];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#090d16]/90 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo & Tagline */}
          <div
            onClick={() => onNavigate('learn')}
            className="flex items-center gap-3 cursor-pointer select-none shrink-0"
          >
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 p-[2px] shadow-lg shadow-indigo-600/30">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">
                  CogniSphere
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                  AI 3D
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Adaptive Interest-Themed Learning
              </p>
            </div>
          </div>

          {/* Role Switcher (Student / SME Specialist / Parent) */}
          <div className="flex items-center p-1 bg-slate-950/80 rounded-xl border border-slate-800">
            <button
              onClick={() => onRoleChange('student')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                currentRole === 'student'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Student</span>
            </button>

            <button
              onClick={() => onRoleChange('instructor')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                currentRole === 'instructor'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Teacher (SME Studio)</span>
            </button>

            <button
              onClick={() => onRoleChange('parent')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                currentRole === 'parent'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Parent</span>
            </button>
          </div>

          {/* Gamification & User Stats HUD */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Day Streak */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{profile.streakDays}d Streak</span>
            </div>

            {/* XP & Level */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              <span>Lvl {profile.level}</span>
              <span className="text-[10px] text-slate-400 font-mono">({profile.xp} XP)</span>
            </div>

            {/* Interest Selector Chip */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:border-indigo-500 transition-all">
                <span>{currentInterest.emoji}</span>
                <span className="hidden lg:inline capitalize">{currentInterest.id}</span>
              </button>

              {/* Dropdown to change interest */}
              <div className="absolute right-0 mt-1 w-56 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl p-2 hidden group-hover:block z-50 backdrop-blur-md">
                <div className="text-[10px] font-mono text-slate-400 uppercase px-2 py-1">
                  Change Personal Context
                </div>
                {interests.map((int) => (
                  <button
                    key={int.id}
                    onClick={() => onSelectInterest(int.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 hover:bg-slate-800 transition-colors ${
                      profile.selectedInterest === int.id
                        ? 'bg-indigo-600/20 text-indigo-300 font-bold'
                        : 'text-slate-300'
                    }`}
                  >
                    <span>{int.emoji}</span>
                    <span className="truncate">{int.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language Switcher */}
            <div className="relative group">
              <button className="p-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-slate-300 hover:text-white transition-colors">
                <Globe className="w-4 h-4" />
              </button>
              <div className="absolute right-0 mt-1 w-36 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl p-1.5 hidden group-hover:block z-50 backdrop-blur-md">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => onLanguageChange(l.code)}
                    className={`w-full text-left px-2 py-1 rounded-md text-xs flex items-center gap-2 hover:bg-slate-800 ${
                      currentLanguage === l.code ? 'text-indigo-400 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.native}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Offline / Cloud Status Indicator */}
            <div
              className={`p-1.5 rounded-lg border text-xs flex items-center justify-center ${
                isOnline
                  ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                  : 'border-amber-500/30 text-amber-400 bg-amber-500/10'
              }`}
              title={isOnline ? 'Online & Synced with Cloud' : 'Offline Mode (Local Cache Active)'}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            </div>

            {/* FastAPI Background Task Queue Trigger */}
            {onOpenTasks && (
              <button
                onClick={onOpenTasks}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-500/40 text-xs font-bold text-purple-200 transition-all shadow-sm"
                title="FastAPI Background Task Queue & Worker Jobs"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Tasks</span>
              </button>
            )}

            {/* Google OAuth2 Quick Action */}
            <button
              onClick={() => onOpenAuth('login')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/60 text-xs font-semibold text-slate-200 transition-all shadow-sm"
              title="Sign in with Google or email"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span className="hidden sm:inline">Google / Sign In</span>
            </button>

            {/* Auth Profile / Account Dropdown */}
            {authUser ? (
              <div className="relative group">
                <button className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl bg-slate-900 border border-slate-750 hover:border-indigo-500/60 transition-all text-xs">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center text-[11px] border border-indigo-500/40">
                    {authUser.avatarUrl ? (
                      <img src={authUser.avatarUrl} alt="" className="w-full h-full rounded-lg object-cover" />
                    ) : (
                      authUser.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="text-left hidden md:block">
                    <div className="text-[11px] font-bold text-white truncate max-w-[100px]">
                      {authUser.name}
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono capitalize">
                      {authUser.role}
                    </div>
                  </div>
                </button>

                {/* Dropdown Profile Menu */}
                <div className="absolute right-0 mt-1 w-56 bg-slate-900/95 border border-slate-700/90 rounded-2xl shadow-2xl p-2.5 hidden group-hover:block z-50 backdrop-blur-md animate-in fade-in">
                  <div className="px-2 py-1.5 border-b border-slate-800 mb-1">
                    <div className="text-xs font-bold text-white truncate">{authUser.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{authUser.email}</div>
                    <div className="text-[9px] font-mono text-indigo-400 uppercase mt-0.5">
                      Role: {authUser.role} {authUser.grade ? `• ${authUser.grade}` : ''}
                    </div>
                    {authUser.parentEmail && (
                      <div className="text-[9px] text-emerald-400 font-mono mt-0.5 truncate">
                        Parent: {authUser.parentEmail}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onOpenAuth('login')}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs text-indigo-300 hover:bg-indigo-500/10 flex items-center gap-2 transition-colors font-medium mb-1"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Switch Account / OAuth</span>
                  </button>

                  <button
                    onClick={() => onLogout()}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30 flex items-center gap-1 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="flex items-center gap-2 py-2 overflow-x-auto no-scrollbar border-t border-slate-800/40 text-xs">
          {[
            { id: 'learn', label: 'Interactive Classroom', icon: GraduationCap },
            { id: 'creator', label: 'AI Course Studio', icon: Sparkles },
            { id: 'marketplace', label: 'Course Store & Plans', icon: Store },
            { id: 'analytics', label: 'Student Analytics', icon: BarChart2 },
            { id: 'settings', label: 'Settings & LMS Hooks', icon: Settings },
            {
              id: 'auth',
              label: authUser ? 'Account & Session' : 'Login / Sign In',
              icon: authUser ? User : LogIn,
              highlight: !authUser,
            },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 shrink-0 transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-500'
                    : item.highlight
                    ? 'bg-indigo-950/40 text-indigo-300 border border-indigo-700/50 hover:bg-indigo-900/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : item.highlight ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
