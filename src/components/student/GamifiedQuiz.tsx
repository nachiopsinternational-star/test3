import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { QuizQuestion, InterestId } from '../../types';
import {
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  Check,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface GamifiedQuizProps {
  quizzes: QuizQuestion[];
  interestId: InterestId;
  onQuizComplete: (totalXPEarned: number) => void;
  onJumpToAnimationStep?: (stepIndex: number) => void;
}

export const GamifiedQuiz: React.FC<GamifiedQuizProps> = ({
  quizzes,
  interestId,
  onQuizComplete,
  onJumpToAnimationStep,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<
    { questionId: string; selectedIndex: number; isCorrect: boolean }[]
  >([]);
  const [isFinished, setIsFinished] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  // Reset quiz state when quizzes change (e.g. chapter switch)
  useEffect(() => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setUserAnswers([]);
    setIsFinished(false);
    setRewardClaimed(false);
  }, [quizzes]);

  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-8 text-center text-slate-400">
        <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2 opacity-50" />
        <p className="font-semibold text-slate-200">
          SME diagnostic quiz modules are actively being curated for this chapter.
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Review the animated concept explainer or test your recall with smart flashcards!
        </p>
      </div>
    );
  }

  const currentQuiz = quizzes[currentIndex];
  const isSelected = selectedOption !== null;
  const isCorrect = selectedOption === currentQuiz.correctAnswer;

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);

    const answeredCorrectly = selectedOption === currentQuiz.correctAnswer;
    setUserAnswers((prev) => [
      ...prev.filter((a) => a.questionId !== currentQuiz.id),
      {
        questionId: currentQuiz.id,
        selectedIndex: selectedOption,
        isCorrect: answeredCorrectly,
      },
    ]);

    if (answeredCorrectly) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#6366f1', '#10b981', '#f59e0b', '#38bdf8'],
        });
      } catch (e) {}
    }
  };

  const handleNextQuestion = () => {
    // Determine complete answer set including current question if answered
    let updatedAnswers = [...userAnswers];
    if (selectedOption !== null && !updatedAnswers.some((a) => a.questionId === currentQuiz.id)) {
      const isAnsCorrect = selectedOption === currentQuiz.correctAnswer;
      updatedAnswers = [
        ...updatedAnswers.filter((a) => a.questionId !== currentQuiz.id),
        {
          questionId: currentQuiz.id,
          selectedIndex: selectedOption,
          isCorrect: isAnsCorrect,
        },
      ];
      setUserAnswers(updatedAnswers);
    }

    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsFinished(true);
      if (!rewardClaimed) {
        // Calculate exact earned XP from correctly answered questions using complete answers
        const totalEarnedXP = quizzes.reduce((sum, q) => {
          const ans = updatedAnswers.find((a) => a.questionId === q.id);
          return sum + (ans?.isCorrect ? (q.xp || 50) : 0);
        }, 0);
        setRewardClaimed(true);
        onQuizComplete(totalEarnedXP);
      }
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setUserAnswers([]);
    setIsFinished(false);
    setRewardClaimed(false);
  };

  // Summary Report when all questions are answered
  if (isFinished) {
    const totalCount = quizzes.length;
    const correctCount = userAnswers.filter((a) => a.isCorrect).length;
    const accuracyPct = Math.round((correctCount / totalCount) * 100);
    const totalXP = quizzes.reduce((sum, q) => {
      const ans = userAnswers.find((a) => a.questionId === q.id);
      return sum + (ans?.isCorrect ? (q.xp || 50) : 0);
    }, 0);

    return (
      <div className="bg-slate-900/95 rounded-2xl border border-slate-800 p-7 shadow-2xl backdrop-blur-md space-y-6">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-xl ${
                accuracyPct >= 80
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : accuracyPct >= 50
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              }`}
            >
              {accuracyPct}%
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold">
                  Diagnostic Mastery Report
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400 font-semibold">
                  {correctCount} / {totalCount} Concepts Verified
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-100">
                {accuracyPct >= 80
                  ? 'Concept Mastery Achieved!'
                  : accuracyPct >= 50
                  ? 'Good Progress – Review Core Steps'
                  : 'Needs Review – Revisit Animation'}
              </h3>
            </div>
          </div>

          <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-mono text-slate-400">Total Mastery XP</div>
            <div className="text-xl font-black text-amber-400">+{totalXP} XP</div>
          </div>
        </div>

        {/* Detailed Review of Each Question */}
        <div className="space-y-3">
          <div className="text-xs font-mono uppercase text-slate-400 font-bold">
            Pedagogical Breakdown & Solution Review:
          </div>

          {quizzes.map((q, idx) => {
            const userAnswer = userAnswers[idx];
            const wasCorrect = userAnswer?.isCorrect;
            const chosenOptionText =
              userAnswer !== undefined ? q.options[userAnswer.selectedIndex] : 'No answer';
            const correctOptionText = q.options[q.correctAnswer];
            const explanation =
              q.explanation[interestId] || q.explanation.gaming || 'Domain principle verified.';

            return (
              <div
                key={q.id}
                className={`p-4 rounded-xl border transition-all text-xs space-y-2 ${
                  wasCorrect
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-rose-950/20 border-rose-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 font-bold">
                    {wasCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span className="text-slate-200">
                      Q{idx + 1}: {q.question}
                    </span>
                  </div>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold uppercase shrink-0 ${
                      wasCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {wasCorrect ? 'Correct' : 'Needs Review'}
                  </span>
                </div>

                {!wasCorrect && (
                  <div className="text-[11px] text-slate-400 pl-6">
                    <span className="text-rose-400">Your choice:</span> {chosenOptionText}
                  </div>
                )}

                <div className="text-[11px] text-emerald-300/90 pl-6">
                  <span className="font-bold">Correct Scientific Model:</span> {correctOptionText}
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 pl-6 leading-relaxed">
                  <span className="font-semibold text-indigo-300">Why this matters: </span>
                  {explanation}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={handleRestartQuiz}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Diagnostic Quiz</span>
          </button>

          {onJumpToAnimationStep && (
            <button
              onClick={() => onJumpToAnimationStep(0)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Review Lesson Animation</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Active Question View
  const interestPrompt = currentQuiz.interestFraming[interestId] || currentQuiz.question;
  const currentExplanation =
    currentQuiz.explanation[interestId] || currentQuiz.explanation.gaming || 'Verified.';

  return (
    <div className="bg-slate-900/95 rounded-2xl border border-slate-800 p-6 shadow-2xl backdrop-blur-md space-y-5">
      {/* Header: Progress, Pedagogical Objective & XP */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-indigo-400 font-bold">
            Question {currentIndex + 1} of {quizzes.length}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400 flex items-center gap-1 capitalize">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Framed through {interestId}</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg text-amber-300 font-mono font-bold">
          +{currentQuiz.xp} XP
        </div>
      </div>

      {/* Meaningful Pedagogical Question Box */}
      <div className="space-y-2">
        <div className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Core Concept Check:</span>
        </div>
        <h4 className="text-base font-bold text-slate-100 leading-snug">{currentQuiz.question}</h4>

        {/* Personalized Interest Context Sub-prompt */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-indigo-300 flex items-start gap-2.5">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-300">Contextual Scenario: </span>
            <span>{interestPrompt}</span>
          </div>
        </div>
      </div>

      {/* Answer Options */}
      <div className="space-y-2.5">
        <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
          Select the scientifically accurate hypothesis:
        </div>

        {currentQuiz.options.map((opt, idx) => {
          const isThisSelected = selectedOption === idx;
          const isThisCorrect = idx === currentQuiz.correctAnswer;

          let optionStyle =
            'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900';

          if (isAnswerSubmitted) {
            if (isThisCorrect) {
              optionStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500';
            } else if (isThisSelected && !isThisCorrect) {
              optionStyle = 'bg-rose-950/40 border-rose-500 text-rose-200 ring-1 ring-rose-500';
            } else {
              optionStyle = 'bg-slate-950/40 border-slate-800/40 text-slate-600 opacity-60';
            }
          } else if (isThisSelected) {
            optionStyle = 'bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500';
          }

          return (
            <button
              key={idx}
              onClick={() => {
                if (!isAnswerSubmitted) setSelectedOption(idx);
              }}
              disabled={isAnswerSubmitted}
              className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs font-medium flex items-center justify-between gap-3 ${optionStyle}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-lg font-mono text-xs flex items-center justify-center font-bold shrink-0 ${
                    isThisSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="leading-relaxed">{opt}</span>
              </div>

              {isAnswerSubmitted && isThisCorrect && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              {isAnswerSubmitted && isThisSelected && !isThisCorrect && (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Immediate Pedagogical Explanation & Feedback Box upon Submit */}
      {isAnswerSubmitted && (
        <div
          className={`p-4 rounded-xl border transition-all space-y-2 animate-in fade-in ${
            isCorrect
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-xs">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Correct! Pedagogical Principle Verified</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Misconception Detected</span>
              </>
            )}
          </div>

          <p className="text-xs text-slate-200 leading-relaxed font-normal">
            {currentExplanation}
          </p>

          <div className="pt-1 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">Why this matters: </span>
            <span>
              Real-world systems rely on this exact invariant to prevent bugs, crashes, or faulty
              predictions.
            </span>
          </div>
        </div>
      )}

      {/* Submit / Next Button */}
      <div className="flex items-center justify-end pt-3 border-t border-slate-800">
        {!isAnswerSubmitted ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={selectedOption === null}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <span>Confirm Answer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <span>{currentIndex < quizzes.length - 1 ? 'Next Question' : 'View Mastery Report'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
