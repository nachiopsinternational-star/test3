import React, { useState } from 'react';
import { Course, SubscriptionPlan, MentorshipPackage, Chapter } from '../../types';
import {
  ShoppingBag,
  Sparkles,
  Check,
  Star,
  Clock,
  Layers,
  Crown,
  Zap,
  Lock,
  Unlock,
  CreditCard,
  CheckCircle2,
  FileCode2,
} from 'lucide-react';

interface MarketplaceViewProps {
  courses: Course[];
  subscriptions: SubscriptionPlan[];
  mentorshipPackages: MentorshipPackage[];
  studentCoins: number;
  onUnlockChapter: (courseId: string, chapterId: string) => void;
  onSubscribe: (plan: SubscriptionPlan) => void;
  onOpenCourseGenerator?: () => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  courses,
  subscriptions,
  mentorshipPackages,
  studentCoins,
  onUnlockChapter,
  onSubscribe,
  onOpenCourseGenerator,
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'courses' | 'chapters' | 'subscriptions' | 'mentorship'>('all');
  const [activeCheckoutItem, setActiveCheckoutItem] = useState<{
    title: string;
    priceUSD: number;
    type: 'course' | 'chapter' | 'subscription' | 'mentorship';
    meta?: any;
  } | null>(null);
  const [checkoutCompleteNotice, setCheckoutCompleteNotice] = useState<string | null>(null);

  const handleCheckout = () => {
    if (!activeCheckoutItem) return;
    if (activeCheckoutItem.type === 'chapter' && activeCheckoutItem.meta) {
      onUnlockChapter(activeCheckoutItem.meta.courseId, activeCheckoutItem.meta.chapterId);
    } else if (activeCheckoutItem.type === 'subscription' && activeCheckoutItem.meta) {
      onSubscribe(activeCheckoutItem.meta);
    }
    setCheckoutCompleteNotice(
      `Access successfully activated for "${activeCheckoutItem.title}". License key generated and synced to cloud profile.`
    );
    setActiveCheckoutItem(null);
    setTimeout(() => setCheckoutCompleteNotice(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Marketplace Header */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 backdrop-blur-md shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-bold uppercase">
              Course & Subscription Store
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400">Individual Chapters, Complete Courses & AI Mentorship</span>
          </div>
          <h2 className="text-xl font-black text-slate-100 mt-1">
            Learning Marketplace & Unlimited Plans
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Purchase micro-lessons by the chapter, enroll in complete 3D tracks, or unlock unlimited access plans.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Catalog' },
            { id: 'courses', label: 'Full Courses' },
            { id: 'chapters', label: 'Chapter Micro-Lessons' },
            { id: 'subscriptions', label: 'Subscriptions' },
            { id: 'mentorship', label: 'AI Mentorship Packs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterCategory === tab.id
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {checkoutCompleteNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{checkoutCompleteNotice}</span>
        </div>
      )}

      {/* Specialist Curated Courses Callout */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 rounded-2xl border border-indigo-500/40 p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Field Specialist Curated • AI Interest-Tailored Animations
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                100% Automated Personalization
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
              Subject matter experts establish the mathematical invariants, core formulas, and diagnostic quizzes. As a student, our AI automatically crafts animated lessons and quizzes uniquely adapted to your selected passion!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
            ✨ {courses.length} Certified Tracks
          </span>
        </div>
      </div>

      {/* Subscriptions Section */}
      {(filterCategory === 'all' || filterCategory === 'subscriptions') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              Unlimited Subscription Plans
            </h3>
            <span className="text-[11px] text-slate-400">Cancel or upgrade anytime</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {subscriptions.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 flex flex-col justify-between border backdrop-blur-md transition-all ${
                  plan.recommended
                    ? 'bg-gradient-to-b from-indigo-950/60 to-slate-900 border-indigo-500/60 shadow-2xl glow-indigo'
                    : 'bg-slate-900/90 border-slate-800'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-bold text-[10px] tracking-wider uppercase px-3 py-0.5 rounded-full shadow-md">
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="text-xs font-bold text-slate-300">{plan.name}</div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-100">${plan.priceUSD}</span>
                    <span className="text-xs text-slate-400">/{plan.billingPeriod === 'monthly' ? 'month' : 'year'}</span>
                  </div>

                  <ul className="mt-5 space-y-2.5 text-xs text-slate-300">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800">
                  <button
                    onClick={() =>
                      setActiveCheckoutItem({
                        title: plan.name,
                        priceUSD: plan.priceUSD,
                        type: 'subscription',
                        meta: plan,
                      })
                    }
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg active:scale-95 ${
                      plan.recommended
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    Select {plan.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Courses Section */}
      {(filterCategory === 'all' || filterCategory === 'courses') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Specialized 3D Courses
            </h3>
            <span className="text-[11px] text-slate-400">Curated by Subject Matter Experts</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {course.category}
                    </span>
                    <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px]">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {course.rating} ({course.reviewsCount})
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-100">{course.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="mt-3 text-[11px] text-slate-500">
                    SME Curator: <strong className="text-slate-300">{course.fieldSpecialist.name}</strong>
                  </div>

                  <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                    <span>{course.chapters.length} Chapters</span>
                    <span>•</span>
                    <span>{course.glbxPackage.nodeCount} 3D Nodes</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Course Price:</span>
                    <div className="text-lg font-black text-slate-100">${course.priceUSD}</div>
                  </div>

                  <button
                    onClick={() =>
                      setActiveCheckoutItem({
                        title: course.title,
                        priceUSD: course.priceUSD,
                        type: 'course',
                        meta: course,
                      })
                    }
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
                  >
                    Enroll Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chapter-Only Micro Lessons */}
      {(filterCategory === 'all' || filterCategory === 'chapters') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Chapter-Only Micro-Lessons
            </h3>
            <span className="text-[11px] text-slate-400">Buy individual chapters as needed ($4.99 each)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.flatMap((c) =>
              c.chapters.map((ch) => (
                <div
                  key={`${c.id}-${ch.id}`}
                  className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-[10px] text-indigo-400 font-mono uppercase">
                      From: {c.title}
                    </div>
                    <div className="text-xs font-bold text-slate-200 mt-0.5">{ch.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{ch.durationMinutes} mins • 3D Interactive WebGL Lab</span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-xs font-black text-slate-100">${ch.priceUSD}</div>
                    <button
                      onClick={() =>
                        setActiveCheckoutItem({
                          title: ch.title,
                          priceUSD: ch.priceUSD,
                          type: 'chapter',
                          meta: { courseId: c.id, chapterId: ch.id },
                        })
                      }
                      className="mt-1 px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold transition-all"
                    >
                      {ch.unlocked ? 'Unlocked' : 'Buy Chapter'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* AI Mentorship Packages */}
      {(filterCategory === 'all' || filterCategory === 'mentorship') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              1-on-1 AI Cognitive Mentorship Packages
            </h3>
            <span className="text-[11px] text-slate-400">Automated 24/7 Voice Scaffolding Tokens</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {mentorshipPackages.map((pack) => (
              <div
                key={pack.id}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-sm font-bold text-slate-100">{pack.name}</span>
                    <span className="text-lg font-black text-amber-400">${pack.priceUSD}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{pack.description}</p>
                  <div className="mt-2 text-[11px] text-indigo-400 font-mono">
                    Includes {pack.hours} Hours of Real-Time AI Speech Mentorship
                  </div>

                  <ul className="mt-3 space-y-1.5 text-xs text-slate-300">
                    {pack.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800">
                  <button
                    onClick={() =>
                      setActiveCheckoutItem({
                        title: pack.name,
                        priceUSD: pack.priceUSD,
                        type: 'mentorship',
                        meta: pack,
                      })
                    }
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
                  >
                    Purchase {pack.hours}h Mentorship
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {activeCheckoutItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl border border-indigo-500/40 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-400" />
                Secure Checkout
              </h3>
              <button
                onClick={() => setActiveCheckoutItem(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 uppercase font-mono">Selected Item</div>
              <div className="text-sm font-bold text-slate-100 mt-0.5">
                {activeCheckoutItem.title}
              </div>
              <div className="text-xl font-black text-indigo-400 mt-1">
                ${activeCheckoutItem.priceUSD} USD
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Payment Method:</span>
                <span className="text-slate-200 font-medium">Apple Pay / Credit Card Simulator</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">LMS Integration Hook:</span>
                <span className="text-emerald-400 font-mono">Auto-Sync Enabled</span>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setActiveCheckoutItem(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg active:scale-95"
              >
                Confirm & Unlock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
