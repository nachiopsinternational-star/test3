import React, { useState } from 'react';
import { InterestId, StudentInterest, Course } from '../../types';
import { courseGenerator } from '../../services/courseGenerator';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  Brain,
  Sliders,
  Layers,
  FileCode2,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Loader2,
} from 'lucide-react';

interface PersonalizedCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  studentGrade: string;
  initialInterest: InterestId;
  interests: StudentInterest[];
  onCourseGenerated: (newCourse: Course) => void;
}

const POPULAR_TOPIC_TEMPLATES = [
  {
    topic: 'Python Heap Memory & Pointer References',
    category: 'Computer Science',
    scene: 'python',
    desc: 'Master RAM addresses, stack frames, and dynamic objects through inventory slots.',
  },
  {
    topic: 'Keplerian Orbits & Gravitational Slingshots',
    category: 'Astrophysics',
    scene: 'orbit',
    desc: 'Calculate periapsis velocities, escape trajectories, and orbital energy states.',
  },
  {
    topic: 'Deep Learning Synapses & Backpropagation',
    category: 'Artificial Intelligence',
    scene: 'neural',
    desc: 'Explore gradient descent and non-linear threshold activations in 3D.',
  },
  {
    topic: 'DNA Double Helix & CRISPR Base Pairing',
    category: 'Molecular Biology',
    scene: 'dna',
    desc: 'Inspect hydrogen bonding energies and nucleotide stability matrices.',
  },
  {
    topic: 'Quantum Mechanics & Quantized Energy Jumps',
    category: 'Quantum Science',
    scene: 'quantum',
    desc: 'Fire photons and observe discrete Bohr electron quantum state leaps.',
  },
  {
    topic: 'Algorithmic Complexity & Spatial Trees',
    category: 'Computer Science',
    scene: 'python',
    desc: 'Visualize recursive call trees and quadtree spatial partitions.',
  },
];

export const PersonalizedCourseModal: React.FC<PersonalizedCourseModalProps> = ({
  isOpen,
  onClose,
  studentName,
  studentGrade,
  initialInterest,
  interests,
  onCourseGenerated,
}) => {
  const [targetTopic, setTargetTopic] = useState('Python Heap Memory & Pointer References');
  const [selectedInterest, setSelectedInterest] = useState<InterestId>(initialInterest);
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [customGoal, setCustomGoal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  if (!isOpen) return null;

  const stepsText = [
    'Connecting with Field Specialist (SME) mathematical knowledge module...',
    `Translating core formulas into ${selectedInterest.toUpperCase()} metaphors...`,
    'Synthesizing interactive Three.js 3D GLBX node hierarchy...',
    `Authoring personalized quizzes and spaced flashcards for ${studentName}...`,
    'Cryptographically packaging GLBX-v3.4 verified learning cartridge...',
  ];

  const handleStartGeneration = async () => {
    if (!targetTopic.trim()) return;

    setIsGenerating(true);
    setGenerationStep(2);

    try {
      const { course: generatedCourse } = await courseGenerator.generatePersonalizedCourse({
        studentName,
        studentGrade,
        interestId: selectedInterest,
        targetTopic,
        difficulty,
        customGoalPrompt: customGoal,
      });

      setTimeout(() => {
        setIsGenerating(false);
        onCourseGenerated(generatedCourse);
        onClose();
      }, 250);
    } catch (err) {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 rounded-3xl border border-indigo-500/40 p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        {!isGenerating && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
          >
            ✕
          </button>
        )}

        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
              AI Course Synthesis Engine
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-semibold">Tailored Just for {studentName}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 mt-1 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Create Your Personalized Course
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Our AI Agent pairs your personal passion with Field Specialist (SME) mathematical modules to synthesize a bespoke 3D interactive curriculum on demand.
          </p>
        </div>

        {/* Generating Animation State */}
        {isGenerating ? (
          <div className="my-10 py-8 flex flex-col items-center justify-center space-y-6 text-center">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping"></div>
              <div className="w-full h-full rounded-full border-4 border-t-indigo-500 border-r-purple-500 border-b-cyan-500 border-l-transparent animate-spin flex items-center justify-center">
                <Brain className="w-8 h-8 text-indigo-400" />
              </div>
            </div>

            <div className="space-y-2 max-w-md">
              <div className="text-sm font-bold text-slate-100">
                Synthesizing Custom Course for {studentName}...
              </div>
              <p className="text-xs text-indigo-400 font-mono animate-pulse min-h-[36px]">
                {stepsText[generationStep]}
              </p>
            </div>

            {/* Step Progress Indicators */}
            <div className="flex gap-2">
              {stepsText.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i <= generationStep ? 'w-6 bg-indigo-500' : 'w-2 bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Step-by-Step Configuration */
          <div className="mt-6 space-y-6">
            {/* 1. Target Topic */}
            <div>
              <label className="text-xs font-bold text-slate-200 block mb-1.5">
                1. What complex subject or concept do you want to master?
              </label>
              <input
                type="text"
                value={targetTopic}
                onChange={(e) => setTargetTopic(e.target.value)}
                placeholder="e.g. Python Heap Memory, Quantum Entanglement, Orbital Slingshots..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />

              {/* Template Quick Chips */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {POPULAR_TOPIC_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTargetTopic(tmpl.topic)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                      targetTopic === tmpl.topic
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-bold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {tmpl.topic.split('&')[0].trim()}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Personalized Passion Lens */}
            <div>
              <label className="text-xs font-bold text-slate-200 block mb-1.5">
                2. Select Your Personal Passion Lens (Context for 3D Scenes & Quizzes)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {interests.map((int) => (
                  <button
                    key={int.id}
                    type="button"
                    onClick={() => setSelectedInterest(int.id)}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                      selectedInterest === int.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md font-bold ring-1 ring-indigo-500'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xl shrink-0 mt-0.5">{int.emoji}</span>
                    <div className="overflow-hidden">
                      <div className="text-xs font-semibold truncate">{int.label}</div>
                      <div className="text-[10px] text-slate-500 truncate">{int.tagline}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Difficulty Level & Goal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1.5">
                  3. Difficulty Pacing
                </label>
                <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                  {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        difficulty === lvl
                          ? 'bg-indigo-600 text-white font-bold shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1.5">
                  4. Custom Goal (Optional)
                </label>
                <input
                  type="text"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder="e.g. Ace my midterm, prep for game dev..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Curated by Field Specialist Lead (Dr. Mercer)</span>
              </div>

              <button
                type="button"
                onClick={handleStartGeneration}
                disabled={!targetTopic.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <span>Synthesize Course for Me</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
