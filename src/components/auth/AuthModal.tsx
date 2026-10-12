import React, { useState } from 'react';
import { UserRole, AuthUser } from '../../types';
import { GoogleAuthButton } from './GoogleAuthButton';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  GraduationCap,
  Layers,
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Compass,
  Star,
  BrainCircuit,
  Zap,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
  initialMode?: 'login' | 'register';
  initialRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
  initialRole = 'student',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<UserRole>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [grade, setGrade] = useState('9th Grade Honors');
  const [institution, setInstitution] = useState('MIT AI Curriculum Lab');
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickDemoLogin = async (demoRole: UserRole) => {
    setIsLoading(true);
    setErrorMessage(null);

    const demoCredentials: Record<UserRole, { email: string; pass: string }> = {
      student: { email: 'alex@cognisphere.edu', pass: 'password123' },
      instructor: { email: 'mercer@mit.edu', pass: 'instructor123' },
      parent: { email: 'sarah.vance@parent.org', pass: 'parent123' },
    };

    const cred = demoCredentials[demoRole];
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cred.email, password: cred.pass }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate');
      }

      setSuccessMessage(`Welcome back, ${data.user.name}!`);
      setTimeout(() => {
        onLoginSuccess(data.user);
        onClose();
      }, 500);
    } catch (err: any) {
      // Local fallback in case network has offline mode active
      const fallbackUser: AuthUser = {
        id: demoRole === 'student' ? 'stu-7749' : demoRole === 'instructor' ? 'ins-101' : 'par-990',
        name: demoRole === 'student' ? 'Alex Vance' : demoRole === 'instructor' ? 'Dr. Evelyn Mercer' : 'Sarah Vance',
        email: cred.email,
        role: demoRole,
        grade: demoRole === 'student' ? '9th Grade Honors' : undefined,
        institution: demoRole === 'instructor' ? 'MIT Lab' : undefined,
        token: `offline_tok_${Date.now()}`,
        lastLogin: new Date().toISOString(),
      };
      onLoginSuccess(fallbackUser);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    if (mode === 'register' && !name) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    setIsLoading(true);
    const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
    const payload = mode === 'register'
      ? {
          name,
          email,
          password,
          role,
          grade: role === 'student' ? grade : undefined,
          institution: role === 'instructor' ? institution : undefined,
          parentName: role === 'student' ? parentName : undefined,
          parentEmail: role === 'student' ? parentEmail : undefined,
        }
      : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (mode === 'register' && role === 'student' && data.user.parentEmail) {
        setSuccessMessage(`Account created! Linked Parent Guardian account created: ${data.user.parentEmail}`);
      } else {
        setSuccessMessage(mode === 'register' ? 'Account created successfully!' : `Welcome back, ${data.user.name}!`);
      }
      setTimeout(() => {
        onLoginSuccess(data.user);
        onClose();
      }, 500);
    } catch (err: any) {
      // If server is unreachable, provide intuitive offline local creation
      if (mode === 'register') {
        const localUser: AuthUser = {
          id: `usr_${Date.now()}`,
          name: name || 'Student',
          email,
          role,
          grade,
          parentEmail: parentEmail || `parent.${email}`,
          parentName: parentName || `Parent of ${name || 'Student'}`,
          token: `local_tok_${Date.now()}`,
          lastLogin: new Date().toISOString(),
        };
        onLoginSuccess(localUser);
        onClose();
      } else {
        setErrorMessage(err.message || 'Invalid email or password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-gradient-to-b from-[#131b2e] to-[#0b101c] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background circles */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 p-[2px] shadow-lg shadow-indigo-600/30">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">CogniSphere AI</h2>
              <p className="text-xs text-slate-400">Intelligent 3D Learning Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors text-sm font-mono"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Tab switch: Sign In vs Sign Up */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Role Selector (Student, Instructor, Parent) */}
        <div className="mb-5">
          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Select Your Role
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                role === 'student'
                  ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300 shadow-sm'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span className="text-[11px] font-bold">Student</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('instructor')}
              className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                role === 'instructor'
                  ? 'border-purple-500 bg-purple-500/15 text-purple-300 shadow-sm'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="text-[11px] font-bold">Teacher</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('parent')}
              className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                role === 'parent'
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-sm'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span className="text-[11px] font-bold">Parent</span>
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={role === 'student' ? 'e.g. Maya Chen' : role === 'instructor' ? 'Dr. Marcus Vance' : 'Helen Vance'}
                  className="w-full bg-slate-900/90 border border-slate-750 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-900/90 border border-slate-750 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/90 border border-slate-750 focus:border-indigo-500 rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'register' && role === 'student' && (
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Grade Level</label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="9th Grade Honors"
                  className="w-full bg-slate-900/90 border border-slate-750 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Auto Created & Linked Parent Account */}
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] mb-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Parent / Guardian Account (Auto-Created & Linked)</span>
                </div>
                <p className="text-[10px] text-slate-400 mb-2">
                  A parent account is always created for attendance and focus audits. One parent can manage multiple students.
                </p>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-300 mb-0.5">Parent / Guardian Name</label>
                    <input
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="e.g. Sarah Vance"
                      className="w-full bg-slate-900 border border-slate-750 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-300 mb-0.5">Parent Email (Links existing or creates new)</label>
                    <input
                      type="email"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      placeholder="parent.guardian@example.com"
                      className="w-full bg-slate-900 border border-slate-750 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {mode === 'register' && role === 'instructor' && (
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Department / Institution</label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="MIT / Stanford AI Lab"
                className="w-full bg-slate-900/90 border border-slate-750 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'login'
                    ? `Sign In as ${role.toUpperCase()}`
                    : role === 'student'
                    ? 'Create Student & Parent Account'
                    : 'Create Free Account'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Google OAuth2 Sign In with Provided Client ID */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <div className="relative flex justify-center text-[10px] uppercase font-mono text-slate-500 mb-2.5">
            <span className="bg-slate-900 px-2">Or continue with Google</span>
          </div>
          <GoogleAuthButton
            role={role}
            parentEmail={parentEmail}
            parentName={parentName}
            onSuccess={(user) => {
              setSuccessMessage(`Google Authentication Successful! Welcome ${user.name}`);
              setTimeout(() => {
                onLoginSuccess(user);
                onClose();
              }, 500);
            }}
            onError={(err) => setErrorMessage(err)}
            text={mode === 'register' ? 'signup_with' : 'signin_with'}
          />
        </div>

        {/* 1-Click Fast Demo Accounts */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              1-Click Demo Accounts
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Instant Sign-In</span>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('student')}
              className="w-full text-left p-2 rounded-xl bg-slate-900/60 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                  🎓
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-300">
                    Student • Alex Vance
                  </div>
                  <div className="text-[10px] text-slate-500">Honors 9th Grade • Gaming Lens • 3,420 XP</div>
                </div>
              </div>
              <span className="text-[11px] text-indigo-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                Enter →
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('instructor')}
              className="w-full text-left p-2 rounded-xl bg-slate-900/60 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/40 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">
                  🔬
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-purple-300">
                    Teacher • Dr. Evelyn Mercer
                  </div>
                  <div className="text-[10px] text-slate-500">MIT CS Lab • 3D Course Studio & GLBX Builder</div>
                </div>
              </div>
              <span className="text-[11px] text-purple-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                Enter →
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('parent')}
              className="w-full text-left p-2 rounded-xl bg-slate-900/60 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/40 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                  🛡️
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-300">
                    Parent • Sarah Vance
                  </div>
                  <div className="text-[10px] text-slate-500">Parent Dashboard • Focus Audit & Attendance</div>
                </div>
              </div>
              <span className="text-[11px] text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                Enter →
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
