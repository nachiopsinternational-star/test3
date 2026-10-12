import React, { useState } from 'react';
import {
  StudentProfile,
  Course,
  Chapter,
  InterestId,
  StudentInterest,
  AttendanceRecord,
} from '../../types';
import { AnimatedConceptPlayer } from './AnimatedConceptPlayer';
import { FocusLensCamera } from '../focus/FocusLensCamera';
import { AILiveTutor } from '../tutor/AILiveTutor';
import { GamifiedQuiz } from './GamifiedQuiz';
import { SpacedFlashcards } from './SpacedFlashcards';
import {
  Sparkles,
  BookOpen,
  Award,
  Layers,
  HelpCircle,
  Brain,
  CheckCircle2,
  Clock,
  Play,
  Flame,
  ChevronRight,
  ShieldCheck,
  Zap,
  GraduationCap,
} from 'lucide-react';

interface StudentViewProps {
  profile: StudentProfile;
  courses: Course[];
  interests: StudentInterest[];
  activeCourse?: Course;
  activeChapter?: Chapter;
  onSelectCourse: (courseId: string) => void;
  onSelectChapter: (chapterId: string) => void;
  onSelectInterest: (interestId: InterestId) => void;
  onXPBonus: (xp: number) => void;
  onAttendanceLogCreated: (record: AttendanceRecord) => void;
  onNavigateToMarketplace?: () => void;
}

export const StudentView: React.FC<StudentViewProps> = ({
  profile,
  courses,
  interests,
  activeCourse,
  activeChapter,
  onSelectCourse,
  onSelectChapter,
  onSelectInterest,
  onXPBonus,
  onAttendanceLogCreated,
  onNavigateToMarketplace,
}) => {
  const [activeStudioTab, setActiveStudioTab] = useState<'animated' | 'quiz' | 'flashcards'>('animated');
  const [liveFocusScore, setLiveFocusScore] = useState<number>(94);
  const [showAITutor, setShowAITutor] = useState<boolean>(false);
  const [targetAnimationStep, setTargetAnimationStep] = useState<number | undefined>(undefined);

  const currentInterestObj =
    interests.find((i) => i.id === profile.selectedInterest) || interests[0];

  if (!activeCourse || !activeChapter) {
    return (
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-12 text-center max-w-lg mx-auto shadow-xl">
        <GraduationCap className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-100">No Course Selected</h3>
        <p className="text-xs text-slate-400 mt-2">
          Select an active curriculum from the catalog or visit the Marketplace to enroll.
        </p>
        {onNavigateToMarketplace && (
          <button
            onClick={onNavigateToMarketplace}
            className="mt-5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
          >
            Browse Marketplace Catalog
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dynamic Interest Personalization Ribbon */}
      <div
        className={`p-4 rounded-2xl border border-slate-800 bg-gradient-to-r ${currentInterestObj.bgGradient} backdrop-blur-md shadow-xl flex flex-wrap items-center justify-between gap-4`}
      >
        <div className="flex items-center gap-3">
          <div className="text-3xl p-2 rounded-xl bg-slate-900/60 border border-white/10 shadow-inner">
            {currentInterestObj.emoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-300">
                Personalized Learning Context
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-bold text-white capitalize">
                {currentInterestObj.label}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
              Every lesson animation, step-by-step explainer, and quiz is tailored directly to your passion for{' '}
              <strong className="text-white">{currentInterestObj.label}</strong>.
            </p>
          </div>
        </div>

        {/* Quick Interest Switcher Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {interests.map((int) => (
            <button
              key={int.id}
              onClick={() => onSelectInterest(int.id)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                profile.selectedInterest === int.id
                  ? 'bg-white text-slate-950 font-bold shadow-md scale-105'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-700/60'
              }`}
            >
              <span>{int.emoji}</span>
              <span className="hidden sm:inline capitalize">{int.id}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Course & Chapter Selector Banner */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl backdrop-blur-md space-y-3">
        {/* Course Row */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <span className="text-[11px] text-slate-400 font-mono shrink-0">Your Courses:</span>
          {courses.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectCourse(c.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-2 transition-all ${
                activeCourse.id === c.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{c.title.split('&')[0].split('(')[0].trim()}</span>
              <span className="text-[10px] font-mono opacity-70">({c.level})</span>
            </button>
          ))}

          {onNavigateToMarketplace && (
            <button
              onClick={onNavigateToMarketplace}
              className="px-3 py-1.5 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500 text-slate-400 hover:text-indigo-300 text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors"
            >
              <span>+ Explore Store</span>
            </button>
          )}
        </div>

        {/* Chapter Row */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-800/60">
          <span className="text-[11px] text-slate-400 font-mono shrink-0">Chapters:</span>
          {activeCourse.chapters.map((ch, idx) => (
            <button
              key={ch.id}
              onClick={() => onSelectChapter(ch.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1.5 transition-all ${
                activeChapter.id === ch.id
                  ? 'bg-slate-800 text-indigo-300 font-bold border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-[10px] font-mono text-slate-500">Ch {idx + 1}:</span>
              <span className="truncate max-w-[240px]">{ch.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Classroom Layout: Left 2 Columns (Lesson / Quiz / Flashcards) | Right 1 Column (Camera Sensor & AI Tutor) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-5">
          {/* Studio Tab Switcher & Live Focus Indicator */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 w-fit">
              <button
                onClick={() => setActiveStudioTab('animated')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeStudioTab === 'animated'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Animated Lesson Explainer</span>
              </button>

              <button
                onClick={() => setActiveStudioTab('quiz')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeStudioTab === 'quiz'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Concept Diagnostic Quiz</span>
              </button>

              <button
                onClick={() => setActiveStudioTab('flashcards')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeStudioTab === 'flashcards'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Spaced Recall Flashcards</span>
              </button>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs shadow-md">
              <div
                className={`w-2 h-2 rounded-full ${
                  liveFocusScore >= 80 ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                }`}
              />
              <span className="text-[11px] font-semibold text-slate-300">Live Engagement:</span>
              <span
                className={`font-mono font-bold text-xs ${
                  liveFocusScore >= 80 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {liveFocusScore}%
              </span>
            </div>
          </div>

          {/* Active Tab View */}
          {activeStudioTab === 'animated' && (
            <div className="space-y-4">
              <AnimatedConceptPlayer
                sceneType={activeChapter.sceneType}
                interestId={profile.selectedInterest}
                courseTitle={activeCourse.title}
                chapterTitle={activeChapter.title}
                targetStepIndex={targetAnimationStep}
                customAnimationDoc={activeChapter.customAnimationDoc}
              />

              {/* Lesson Narrative & Pedagogical Blueprint Card */}
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-indigo-400 uppercase font-bold text-[10px]">
                    Academic Blueprint • {activeCourse.category}
                  </span>
                  <span className="text-slate-400">
                    SME Curator: <strong className="text-slate-200">{activeCourse.fieldSpecialist.name}</strong> ({activeCourse.fieldSpecialist.institution})
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100">{activeChapter.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeChapter.description}
                </p>

                {/* Interest Reframe Callout Box */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/30 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-indigo-300 flex items-center gap-1">
                      <span>Animated & Framed through {currentInterestObj.label}:</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {currentInterestObj.description} The animation above visually simulates how this principle functions in high-stakes {currentInterestObj.label.toLowerCase()} scenarios.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeStudioTab === 'quiz' && (
            <GamifiedQuiz
              quizzes={activeChapter.quizzes}
              interestId={profile.selectedInterest}
              onQuizComplete={(xp) => onXPBonus(xp)}
              onJumpToAnimationStep={(step) => {
                setTargetAnimationStep(step);
                setActiveStudioTab('animated');
              }}
            />
          )}

          {activeStudioTab === 'flashcards' && (
            <SpacedFlashcards
              flashcards={activeChapter.flashcards}
              interestId={profile.selectedInterest}
              onBoxUpdated={(id, box) => onXPBonus(10)}
            />
          )}
        </div>

        {/* Right 1 Column: AI Live Tutor & Headless Focus Guard */}
        <div className="space-y-6">
          {/* Headless Focus & Engagement Guard (Zero UI clutter, instant warning alerts) */}
          <FocusLensCamera
            studentName={profile.name}
            onAttendanceLogCreated={(rec: AttendanceRecord) => onAttendanceLogCreated(rec)}
            onFocusScoreChange={(score: number) => setLiveFocusScore(score)}
          />

          {/* AI Live Tutor Widget */}
          <AILiveTutor
            studentName={profile.name}
            selectedInterest={profile.selectedInterest}
            activeCourseTitle={activeCourse.title}
            activeChapterTitle={activeChapter.title}
            onXPBonus={onXPBonus}
          />
        </div>
      </div>
    </div>
  );
};
