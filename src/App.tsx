/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  UserRole,
  StudentProfile,
  InterestId,
  Course,
  Chapter,
  AttendanceRecord,
  ParentMessage,
  LMSConfig,
  SubscriptionPlan,
  AuthUser,
} from './types';
import {
  STUDENT_INTERESTS,
  INITIAL_STUDENT_PROFILE,
  COURSES,
  MOCK_ATTENDANCE_LOGS,
  PARENT_CHILD_DATA,
  PARENT_MESSAGES,
  SUBSCRIPTION_PLANS,
  MENTORSHIP_PACKAGES,
  DEFAULT_LMS_CONFIG,
} from './data/mockData';
import { SupportedLanguage } from './services/i18n';
import { offlineStorage } from './services/offlineStorage';
import { Navbar } from './components/common/Navbar';
import { StudentView } from './components/student/StudentView';
import { SMEInstructorStudio } from './components/sme/SMEInstructorStudio';
import { ParentDashboard } from './components/parent/ParentDashboard';
import { MarketplaceView } from './components/marketplace/MarketplaceView';
import { StudentAnalyticsView } from './components/analytics/StudentAnalyticsView';
import { SettingsView } from './components/settings/SettingsView';
import { AuthModal } from './components/auth/AuthModal';
import { AuthPage } from './components/auth/AuthPage';
import {
  Sparkles,
  Award,
  Download,
  ShieldCheck,
  CheckCircle2,
  Heart,
} from 'lucide-react';

export default function App() {
  // Authentication session state
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('cognisphere_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [guestBypass, setGuestBypass] = useState<boolean>(() => {
    return localStorage.getItem('cognisphere_guest_mode') === 'true';
  });

  // State initialized with safe localStorage fallback
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    try {
      const savedUser = localStorage.getItem('cognisphere_auth_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.role) return parsed.role;
      }
    } catch {}
    return 'student';
  });

  const [activeView, setActiveView] = useState<string>('learn');
  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem('cognisphere_student_profile');
      return saved ? JSON.parse(saved) : INITIAL_STUDENT_PROFILE;
    } catch {
      return INITIAL_STUDENT_PROFILE;
    }
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem('cognisphere_courses');
      return saved ? JSON.parse(saved) : COURSES;
    } catch {
      return COURSES;
    }
  });

  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  const [lmsConfig, setLmsConfig] = useState<LMSConfig>(() => {
    try {
      const saved = localStorage.getItem('cognisphere_lms_config');
      return saved ? JSON.parse(saved) : DEFAULT_LMS_CONFIG;
    } catch {
      return DEFAULT_LMS_CONFIG;
    }
  });

  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('cognisphere_attendance_logs');
      return saved ? JSON.parse(saved) : MOCK_ATTENDANCE_LOGS;
    } catch {
      return MOCK_ATTENDANCE_LOGS;
    }
  });

  const [parentMessages, setParentMessages] = useState<ParentMessage[]>(PARENT_MESSAGES);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [xpToast, setXpToast] = useState<{ amount: number; message: string } | null>(null);

  // Synchronize state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cognisphere_student_profile', JSON.stringify(profile));
    } catch (e) {
      console.warn('Could not persist profile:', e);
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem('cognisphere_courses', JSON.stringify(courses));
    } catch (e) {
      console.warn('Could not persist courses:', e);
    }
  }, [courses]);

  useEffect(() => {
    try {
      localStorage.setItem('cognisphere_attendance_logs', JSON.stringify(attendanceLogs));
    } catch (e) {
      console.warn('Could not persist attendance logs:', e);
    }
  }, [attendanceLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('cognisphere_lms_config', JSON.stringify(lmsConfig));
    } catch (e) {
      console.warn('Could not persist LMS config:', e);
    }
  }, [lmsConfig]);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Defensive active course and active chapter
  const activeCourse =
    courses.find((c) => c.id === profile.activeCourseId) ?? courses[0] ?? undefined;

  const activeChapter = activeCourse
    ? activeCourse.chapters.find((ch) => ch.id === profile.activeChapterId) ?? activeCourse.chapters[0]
    : undefined;

  const handleSelectCourse = (courseId: string) => {
    const targetCourse = courses.find((c) => c.id === courseId) ?? courses[0];
    if (!targetCourse) return;
    setProfile((prev) => ({
      ...prev,
      activeCourseId: targetCourse.id,
      activeChapterId: targetCourse.chapters[0]?.id ?? '',
    }));
  };

  const handleSelectChapter = (chapterId: string) => {
    setProfile((prev) => ({
      ...prev,
      activeChapterId: chapterId,
    }));
  };

  const handleSelectInterest = (interestId: InterestId) => {
    setProfile((prev) => ({
      ...prev,
      selectedInterest: interestId,
    }));
  };

  const handleXPBonus = (bonusXP: number) => {
    setProfile((prev) => {
      const nextXP = prev.xp + bonusXP;
      const nextLevel = Math.floor(nextXP / 300) + 1;
      return {
        ...prev,
        xp: nextXP,
        level: nextLevel,
        coins: prev.coins + Math.floor(bonusXP / 2),
      };
    });

    setXpToast({ amount: bonusXP, message: 'Cognitive Milestone Unlocked!' });
    setTimeout(() => setXpToast(null), 3000);
  };

  const handleAttendanceLogCreated = (record: AttendanceRecord) => {
    setAttendanceLogs((prev) => [record, ...prev]);
  };

  const handleUnlockChapter = (courseId: string, chapterId: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          chapters: c.chapters.map((ch) =>
            ch.id === chapterId ? { ...ch, unlocked: true } : ch
          ),
        };
      })
    );
  };

  const handleCourseCreated = (newCourse: Course) => {
    setCourses((prev) => [newCourse, ...prev]);
    setProfile((prev) => ({
      ...prev,
      activeCourseId: newCourse.id,
      activeChapterId: newCourse.chapters[0]?.id ?? '',
    }));
    handleXPBonus(100);
  };

  const handleDailyLessonCreated = (newChapter: Chapter) => {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === profile.activeCourseId
          ? { ...c, chapters: [newChapter, ...c.chapters] }
          : c
      )
    );
  };

  const handleSubscribe = (plan: SubscriptionPlan) => {
    // Entitlement handling based on purchased tier:
    // Explorer: Unlocks first 3 courses
    // Pro Mastery & Annual Scholar: Unlocks all courses
    if (plan.tier === 'Explorer') {
      setCourses((prev) =>
        prev.map((c, idx) => {
          if (idx < 3) {
            return {
              ...c,
              chapters: c.chapters.map((ch) => ({ ...ch, unlocked: true })),
            };
          }
          return c;
        })
      );
    } else {
      // Pro Mastery or Annual Scholar
      setCourses((prev) =>
        prev.map((c) => ({
          ...c,
          chapters: c.chapters.map((ch) => ({ ...ch, unlocked: true })),
        }))
      );
    }

    setXpToast({ amount: 250, message: `Subscribed to ${plan.name}! Entitlements unlocked.` });
    setTimeout(() => setXpToast(null), 4000);
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setAuthUser(user);
    setCurrentRole(user.role);
    setGuestBypass(true);
    try {
      localStorage.setItem('cognisphere_auth_user', JSON.stringify(user));
      localStorage.setItem('cognisphere_guest_mode', 'true');
    } catch {}

    // If user is a student, update student profile name
    if (user.role === 'student') {
      setProfile((prev) => ({
        ...prev,
        name: user.name,
        grade: user.grade || prev.grade,
      }));
    }

    setXpToast({ amount: 100, message: `Welcome ${user.name}! Session authenticated.` });
    setTimeout(() => setXpToast(null), 3500);
  };

  const handleLogout = () => {
    setAuthUser(null);
    setGuestBypass(false);
    try {
      localStorage.removeItem('cognisphere_auth_user');
      localStorage.removeItem('cognisphere_guest_mode');
    } catch {}
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleExploreAsGuest = () => {
    setGuestBypass(true);
    try {
      localStorage.setItem('cognisphere_guest_mode', 'true');
    } catch {}
  };

  // If not logged in and hasn't chosen guest mode, show the full login/sign-in page
  if (!authUser && !guestBypass) {
    return (
      <AuthPage
        onLoginSuccess={handleLoginSuccess}
        onExploreAsGuest={handleExploreAsGuest}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={(role) => setCurrentRole(role)}
        activeView={activeView}
        onNavigate={(v) => setActiveView(v)}
        profile={profile}
        interests={STUDENT_INTERESTS}
        onSelectInterest={handleSelectInterest}
        currentLanguage={currentLanguage}
        onLanguageChange={(lang) => setCurrentLanguage(lang)}
        isOnline={isOnline}
        authUser={authUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Auth Modal for in-session Sign In / Switch Account */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialMode={authModalMode}
        initialRole={currentRole}
      />

      {/* Main View Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentRole === 'student' && (
          <>
            {activeView === 'learn' && (
              <StudentView
                profile={profile}
                courses={courses}
                interests={STUDENT_INTERESTS}
                activeCourse={activeCourse}
                activeChapter={activeChapter}
                onSelectCourse={handleSelectCourse}
                onSelectChapter={handleSelectChapter}
                onSelectInterest={handleSelectInterest}
                onXPBonus={handleXPBonus}
                onAttendanceLogCreated={handleAttendanceLogCreated}
                onNavigateToMarketplace={() => setActiveView('marketplace')}
              />
            )}
           {activeView === 'creator' && (
             <CourseCreatorView
               studentName={profile.name}
               studentGrade={profile.grade}
               interests={STUDENT_INTERESTS}
               initialInterest={profile.selectedInterest}
               onCourseCreated={handleCourseCreated}
               onNavigateToClassroom={() => setActiveView('learn')}
              />
             )}

            {activeView === 'marketplace' && (
              <MarketplaceView
                courses={courses}
                subscriptions={SUBSCRIPTION_PLANS}
                mentorshipPackages={MENTORSHIP_PACKAGES}
                studentCoins={profile.coins}
                onUnlockChapter={handleUnlockChapter}
                onSubscribe={handleSubscribe}
              />
            )}

            {activeView === 'analytics' && (
              <StudentAnalyticsView
                profile={profile}
                attendanceLogs={attendanceLogs}
              />
            )}

            {activeView === 'settings' && (
              <SettingsView
                profile={profile}
                currentLanguage={currentLanguage}
                onLanguageChange={(lang) => setCurrentLanguage(lang)}
                onInterestChange={handleSelectInterest}
                lmsConfig={lmsConfig}
                onUpdateLMSConfig={(cfg) => setLmsConfig(cfg)}
              />
            )}

            {activeView === 'auth' && (
              <div className="py-2">
                <AuthPage
                  onLoginSuccess={(user) => {
                    handleLoginSuccess(user);
                    setActiveView('learn');
                  }}
                  onExploreAsGuest={() => {
                    setActiveView('learn');
                  }}
                />
              </div>
            )}
          </>
        )}

        {currentRole === 'instructor' && (
          <>
            {activeView === 'auth' ? (
              <div className="py-2">
                <AuthPage
                  onLoginSuccess={(user) => {
                    handleLoginSuccess(user);
                    setActiveView('learn');
                  }}
                  onExploreAsGuest={() => {
                    setActiveView('learn');
                  }}
                />
              </div>
            ) : (
              <SMEInstructorStudio
                courses={courses}
                activeCourse={activeCourse}
                onSelectCourse={handleSelectCourse}
                onCourseCreated={handleCourseCreated}
              />
            )}
          </>
        )}

        {currentRole === 'parent' && (
          <>
            {activeView === 'auth' ? (
              <div className="py-2">
                <AuthPage
                  onLoginSuccess={(user) => {
                    handleLoginSuccess(user);
                    setActiveView('learn');
                  }}
                  onExploreAsGuest={() => {
                    setActiveView('learn');
                  }}
                />
              </div>
            ) : (
              <ParentDashboard
                childrenData={PARENT_CHILD_DATA}
                messages={parentMessages}
              />
            )}
          </>
        )}
      </main>

      {/* XP Toast Notification */}
      {xpToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-4 py-3 rounded-2xl shadow-2xl font-bold text-xs animate-in slide-in-from-bottom-5">
          <Award className="w-5 h-5 text-slate-950 shrink-0" />
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider opacity-80">
              {xpToast.message}
            </div>
            <div className="text-sm">+{xpToast.amount} XP Earned!</div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">CogniSphere AI</span>
            <span>•</span>
            <span>Interactive 3D Learning & Intelligent Tutoring Platform</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Student Privacy Protected • Session Focus Guard</span>
            </span>
            <span>•</span>
            <span className="font-mono text-[11px]">Full-Stack TypeScript Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
