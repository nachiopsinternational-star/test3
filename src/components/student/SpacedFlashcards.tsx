import React, { useState } from 'react';
import { Flashcard, InterestId } from '../../types';
import { RotateCw, Check, ArrowLeft, ArrowRight, Brain, Sparkles, BookMarked } from 'lucide-react';

interface SpacedFlashcardsProps {
  flashcards: Flashcard[];
  interestId: InterestId;
  onBoxUpdated?: (cardId: string, newBox: number) => void;
}

export const SpacedFlashcards: React.FC<SpacedFlashcardsProps> = ({
  flashcards,
  interestId,
  onBoxUpdated,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>(flashcards);
  const [isCompleted, setIsCompleted] = useState(false);

  // Sync state when flashcards prop changes (e.g. chapter switch)
  React.useEffect(() => {
    setCards(flashcards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
  }, [flashcards]);

  if (!cards || cards.length === 0) {
    return (
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-8 text-center text-slate-400">
        <BookMarked className="w-8 h-8 text-indigo-400 mx-auto mb-2 opacity-50" />
        <p className="font-medium text-slate-300">No flashcards queued for this chapter yet.</p>
      </div>
    );
  }

  if (isCompleted) {
    const sorted = [...cards].sort((a, b) => (a.nextReviewAt || 0) - (b.nextReviewAt || 0));
    const nextDueTime = sorted[0]?.nextReviewAt;
    const formattedNext = nextDueTime
      ? new Date(nextDueTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : 'in 10 minutes';

    return (
      <div className="bg-slate-900/95 rounded-2xl border border-slate-800 p-8 text-center text-slate-300 shadow-xl space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
          <Brain className="w-6 h-6 text-indigo-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-100">Deck Session Completed!</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          You reviewed all {cards.length} flashcards. Spaced repetition dates are now scheduled. Your earliest review will be due on <strong className="text-indigo-300">{formattedNext}</strong>.
        </p>

        {/* Breakdown of scheduled cards */}
        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 text-left text-[11px] max-w-sm mx-auto space-y-1.5">
          <div className="text-[10px] uppercase font-mono text-slate-400 font-bold mb-1">Scheduled Review Timeline</div>
          {cards.slice(0, 4).map((c) => (
            <div key={c.id} className="flex items-center justify-between text-slate-300">
              <span className="truncate max-w-[200px] text-slate-400">{c.concept}</span>
              <span className="font-mono text-indigo-400 font-semibold">
                {c.nextReviewAt ? new Date(c.nextReviewAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Pending'}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            setCurrentIndex(0);
            setIsFlipped(false);
            setIsCompleted(false);
          }}
          className="mt-3 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg inline-flex items-center gap-2"
        >
          <RotateCw className="w-4 h-4" />
          <span>Review Deck Again</span>
        </button>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  const handleRate = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    let newBox = currentCard.leitnerBox;
    if (rating === 'again') newBox = 1;
    else if (rating === 'hard') newBox = Math.max(1, newBox);
    else if (rating === 'good') newBox = Math.min(5, newBox + 1);
    else if (rating === 'easy') newBox = Math.min(5, newBox + 2);

    const now = Date.now();
    let intervalMs = 10 * 60 * 1000; // < 10m
    if (rating === 'hard') intervalMs = 24 * 60 * 60 * 1000; // 1 day
    else if (rating === 'good') intervalMs = 3 * 24 * 60 * 60 * 1000; // 3 days
    else if (rating === 'easy') intervalMs = 7 * 24 * 60 * 60 * 1000; // 7 days

    const nextReviewAt = now + intervalMs;

    const updated = cards.map((c, i) =>
      i === currentIndex
        ? {
            ...c,
            leitnerBox: newBox,
            reviewStatus: rating,
            lastReviewedAt: now,
            nextReviewAt,
          }
        : c
    );
    setCards(updated);
    if (onBoxUpdated) onBoxUpdated(currentCard.id, newBox);

    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const interestHook =
    currentCard.interestContext[interestId] || currentCard.backExplanation;

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl backdrop-blur-md">
      {/* Deck Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-indigo-400" />
          <span className="font-bold text-slate-200">Spaced Repetition Deck</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">
            Card {currentIndex + 1} of {cards.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg text-slate-300 font-mono text-[11px]">
          <span>Leitner Box {currentCard.leitnerBox}/5</span>
        </div>
      </div>

      {/* Flip Card Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="my-5 min-h-[220px] bg-gradient-to-br from-slate-950 to-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between cursor-pointer hover:border-indigo-500/40 transition-all shadow-inner relative group select-none"
      >
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-indigo-400 uppercase tracking-wider text-[10px]">
            {currentCard.subject} • {currentCard.concept}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-500 group-hover:text-slate-300 transition-colors">
            <RotateCw className="w-3 h-3" />
            <span>Click to flip</span>
          </span>
        </div>

        <div className="my-auto py-3">
          {!isFlipped ? (
            <div className="text-center">
              <div className="text-[11px] text-slate-500 uppercase tracking-widest font-mono mb-2">Prompt</div>
              <h4 className="text-base font-semibold text-slate-100 leading-relaxed max-w-lg mx-auto">
                {currentCard.frontPrompt}
              </h4>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mb-1">
                  Core Scientific Definition
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {currentCard.backExplanation}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-300 mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Personalized {interestId.toUpperCase()} Memory Hook:</span>
                </div>
                <p className="text-xs text-indigo-100/90 leading-relaxed">
                  {interestHook}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-[11px] text-slate-500">
          {!isFlipped ? '💡 Test your recall, then reveal answer' : '🎯 Rate difficulty to calibrate Leitner algorithm'}
        </div>
      </div>

      {/* Leitner Rating Buttons (Active when flipped) */}
      {isFlipped ? (
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={() => handleRate('again')}
            className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 text-xs font-semibold flex flex-col items-center gap-0.5 transition-all"
          >
            <span>Again</span>
            <span className="text-[10px] text-rose-400/80 font-mono">&lt; 10m</span>
          </button>
          <button
            onClick={() => handleRate('hard')}
            className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 text-xs font-semibold flex flex-col items-center gap-0.5 transition-all"
          >
            <span>Hard</span>
            <span className="text-[10px] text-amber-400/80 font-mono">1 day</span>
          </button>
          <button
            onClick={() => handleRate('good')}
            className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 hover:bg-blue-500/25 text-xs font-semibold flex flex-col items-center gap-0.5 transition-all"
          >
            <span>Good</span>
            <span className="text-[10px] text-blue-400/80 font-mono">3 days</span>
          </button>
          <button
            onClick={() => handleRate('easy')}
            className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-xs font-semibold flex flex-col items-center gap-0.5 transition-all"
          >
            <span>Easy</span>
            <span className="text-[10px] text-emerald-400/80 font-mono">7 days</span>
          </button>
        </div>
      ) : (
        /* Prev / Next controls when not flipped */
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              setIsFlipped(false);
              setCurrentIndex((prev) => Math.max(0, prev - 1));
            }}
            disabled={currentIndex === 0}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <button
            onClick={() => {
              setIsFlipped(false);
              setCurrentIndex((prev) => Math.min(cards.length - 1, prev + 1));
            }}
            disabled={currentIndex === cards.length - 1}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <span>Next</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
