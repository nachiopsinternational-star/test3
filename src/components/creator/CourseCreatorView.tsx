import React, { useState } from 'react';
import { Course, InterestId, Scene3DType, StudentInterest } from '../../types';
import { courseGenerator } from '../../services/courseGenerator';
import {
  Sparkles,
  Layers,
  Brain,
  Rocket,
  Atom,
  Dna,
  Code2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Flame,
  Zap,
} from 'lucide-react';

interface CourseCreatorViewProps {
  studentName: string;
  studentGrade: string;
  interests: StudentInterest[];
  initialInterest: InterestId;
  onCourseCreated: (newCourse: Course) => void;
  onNavigateToClassroom: () => void;
}

const TEMPLATE_PRESETS = [
  {
    topic: 'Python Memory Stack & Heap Pointers',
    category: 'Computer Science',
    sceneType: 'python' as Scene3DType,
    goal: 'Master dynamic memory allocation, pointer references, and garbage collection.',
    icon: Code2,
    gradient: 'from-blue-600 to-indigo-700',
  },
  {
    topic: 'Keplerian Orbits & Gravitational Slingshots',
    category: 'Astrophysics & Space Flight',
    sceneType: 'orbit' as Scene3DType,
    goal: 'Explore periapsis acceleration, delta-V burns, and planetary gravity assists.',
    icon: Rocket,
    gradient: 'from-purple-600 to-indigo-800',
  },
  {
    topic: 'Deep Learning Synapses & Backpropagation',
    category: 'Artificial Intelligence',
    sceneType: 'neural' as Scene3DType,
    goal: 'Deconstruct multilayer perceptrons, gradient descent, and non-linear thresholds.',
    icon: Brain,
    gradient: 'from-cyan-600 to-teal-800',
  },
  {
    topic: 'DNA Double Helix & Hydrogen Bonding Energies',
    category: 'Molecular Biology',
    sceneType: 'dna' as Scene3DType,
    goal: 'Inspect A-T double vs G-C triple hydrogen bonds and replication cleavage.',
    icon: Dna,
    gradient: 'from-emerald-600 to-green-800',
  },
  {
    topic: 'Quantum Mechanics & Quantized Bohr Leaps',
    category: 'Quantum Science',
    sceneType: 'quantum' as Scene3DType,
    goal: 'Observe discrete electron energy levels, photon absorption, and wave collapse.',
    icon: Atom,
    gradient: 'from-amber-600 to-rose-700',
  },
];

export const CourseCreatorView: React.FC<CourseCreatorViewProps> = ({
  studentName,
  studentGrade,
  interests,
  initialInterest,
  onCourseCreated,
  onNavigateToClassroom,
}) => {
  const [topic, setTopic] = useState('Python Memory Stack & Heap Pointers');
  const [selectedInterest, setSelectedInterest] = useState<InterestId>(initialInterest);
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [learningGoal, setLearningGoal] = useState('Master memory pointers through Minecraft inventory mechanics');
  const [chapterCount, setChapterCount] = useState<number>(3);
  const [questionsPerChapter, setQuestionsPerChapter] = useState<number>(3);
  const [selectedSceneType, setSelectedSceneType] = useState<Scene3DType>('python');
  const [useFastAPIQueue, setUseFastAPIQueue] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generationMessage, setGenerationMessage] = useState<string>('');
  const [isCreatedSuccess, setIsCreatedSuccess] = useState(false);
  const [lastCreatedCourse, setLastCreatedCourse] = useState<Course | null>(null);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    setGenerationProgress(5);
    setGenerationMessage('Initializing curriculum framework & task dispatch...');

    try {
      const { course: newCourse } = await courseGenerator.generatePersonalizedCourse({
        studentName,
        studentGrade,
        interestId: selectedInterest,
        targetTopic: topic,
        difficulty,
        customGoalPrompt: learningGoal,
        chapterCount,
        questionsPerChapter,
        preferredSceneType: selectedSceneType,
        useAsyncTaskQueue: useFastAPIQueue,
        onProgress: (pct, msg) => {
          setGenerationProgress(pct);
          setGenerationMessage(msg);
        },
      });

      onCourseCreated(newCourse);
      setLastCreatedCourse(newCourse);
      setIsCreatedSuccess(true);
    } catch (err: any) {
      console.error('Course creation error:', err);
      setGenerationMessage(`Error generating course: ${err.message || 'Please retry.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyPreset = (preset: typeof TEMPLATE_PRESETS[0]) => {
    setTopic(preset.topic);
    setLearningGoal(preset.goal);
    setSelectedSceneType(preset.sceneType);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Studio Header */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 rounded-3xl border border-indigo-500/40 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold uppercase tracking-wider">
            AI Course Creation Studio
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-xs text-slate-300 font-semibold">Author for: {studentName}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 mt-2 flex items-center gap-2.5">
          <Sparkles className="w-7 h-7 text-indigo-400" />
          <span>Create a Personalized Course & Animated Simulation</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
          Specify any concept or subject you want to master. Our engine synthesizes an interactive 3D simulation, tailored chapters, interest-infused quizzes, and step-by-step animated explanations immediately!
        </p>
      </div>

      {isCreatedSuccess && lastCreatedCourse ? (
        /* Success Screen */
        <div className="bg-slate-900/90 rounded-3xl border border-emerald-500/40 p-8 backdrop-blur-xl shadow-2xl space-y-6 animate-in fade-in">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-mono uppercase text-emerald-400 font-bold tracking-wider">
                ⚡ FastAPI Background Task Succeeded • Multi-Chapter Course Ready
              </span>
              <h2 className="text-2xl font-black text-slate-100 mt-1">
                {lastCreatedCourse.title}
              </h2>
              <p className="text-xs text-slate-300 max-w-lg mx-auto mt-1">
                Synthesized across <strong className="text-indigo-400">{lastCreatedCourse.chapters.length} chapters</strong> with custom diagnostic quizzes and procedural 3D SVG / Three.js animations tailored to <strong className="text-purple-400 uppercase">{selectedInterest}</strong>.
              </p>
            </div>
          </div>

          {/* Generated Chapters & Quizzes Summary Grid */}
          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-4 space-y-3 max-w-2xl mx-auto">
            <div className="text-xs font-bold text-slate-300 flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Generated Syllabus ({lastCreatedCourse.chapters.length} Chapters)</span>
              </span>
              <span className="text-[11px] font-mono text-purple-300">
                {lastCreatedCourse.chapters.reduce((sum, ch) => sum + ch.quizzes.length, 0)} Total Quizzes
              </span>
            </div>

            <div className="space-y-2">
              {lastCreatedCourse.chapters.map((ch, idx) => (
                <div key={ch.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-200">{ch.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300">
                      {ch.quizzes.length} Quizzes
                    </span>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300">
                      {ch.customAnimationDoc ? 'Custom C3D' : '3D Sim'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsCreatedSuccess(false)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Author Another Course
            </button>

            <button
              onClick={onNavigateToClassroom}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-95"
            >
              <span>Launch Animated Lesson in Classroom</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Course Authoring Form */
        <form onSubmit={handleCreateCourse} className="space-y-6">
          {/* Section 1: Learning Topic & Foundational Presets */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    1
                  </span>
                  <span>What subject or concept do you want to learn?</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Type any custom topic or select a foundational template below.
                </p>
              </div>
            </div>

            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Python Memory Architecture, Gravitational Orbiting, Quantum Physics, Game Engines..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
            />

            {/* Template Presets */}
            <div>
              <div className="text-[11px] font-mono uppercase text-slate-400 font-bold mb-2">
                Or Quick-Pick a Specialized Foundation Track:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {TEMPLATE_PRESETS.map((preset, idx) => {
                  const Icon = preset.icon;
                  const isSelected = topic === preset.topic;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-600/15 text-white ring-1 ring-indigo-500'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-slate-200 truncate">
                          {preset.topic.split('&')[0].trim()}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">
                          {preset.category}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 2: Choose Personal Passion Lens */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <span>Select Your Personal Passion (Animation & Explanations Context)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                The simulation and step-by-step explanations will be framed through this interest!
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {interests.map((int) => (
                <button
                  key={int.id}
                  type="button"
                  onClick={() => setSelectedInterest(int.id)}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    selectedInterest === int.id
                      ? 'border-indigo-500 bg-gradient-to-br from-indigo-950/60 to-purple-950/40 text-white shadow-xl ring-2 ring-indigo-500/50 scale-[1.02]'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl shrink-0">{int.emoji}</span>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-slate-200 truncate">{int.label}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{int.tagline}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Multi-Chapter & Diagnostic Quizzes Configuration */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <span>Multi-Chapter & Diagnostic Quiz Architecture</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Customize syllabus depth, chapter count, and question density for this course.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Chapter Count */}
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-2">
                  Number of Chapters: <span className="text-indigo-400 font-mono">{chapterCount} Chapters</span>
                </label>
                <div className="flex rounded-xl bg-slate-950 p-1.5 border border-slate-800">
                  {[2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setChapterCount(num)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        chapterCount === num
                          ? 'bg-indigo-600 text-white font-bold shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {num} Ch
                    </button>
                  ))}
                </div>
              </div>

              {/* Questions Per Chapter */}
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-2">
                  Quizzes per Chapter: <span className="text-purple-400 font-mono">{questionsPerChapter} Questions</span>
                </label>
                <div className="flex rounded-xl bg-slate-950 p-1.5 border border-slate-800">
                  {[2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuestionsPerChapter(num)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        questionsPerChapter === num
                          ? 'bg-purple-600 text-white font-bold shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {num} Qs
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Visual 3D Simulation & Animation Engine */}
            <div>
              <label className="text-xs font-bold text-slate-200 block mb-2">
                Custom 3D Simulation & Animation Engine:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {[
                  { id: 'python', label: 'Python RAM', desc: 'Stack & Heap Virtualizer' },
                  { id: 'orbit', label: 'Keplerian Orbit', desc: 'Gravitational Slingshots' },
                  { id: 'neural', label: 'Neural Synapse', desc: 'Backprop & Weights' },
                  { id: 'dna', label: 'DNA Double Helix', desc: 'Hydrogen Bonds' },
                  { id: 'quantum', label: 'Bohr Quantum', desc: 'Quantized Orbitals' },
                ].map((sim) => (
                  <button
                    key={sim.id}
                    type="button"
                    onClick={() => setSelectedSceneType(sim.id as Scene3DType)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedSceneType === sim.id
                        ? 'border-indigo-500 bg-indigo-600/20 text-white ring-1 ring-indigo-500'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-bold truncate">{sim.label}</div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{sim.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Difficulty & Learning Objective */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-slate-200 block mb-2">
                4. Target Difficulty Pacing
              </label>
              <div className="flex rounded-xl bg-slate-950 p-1.5 border border-slate-800">
                {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                      difficulty === lvl
                        ? 'bg-indigo-600 text-white font-bold shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-200 block mb-2">
                5. Specific Learning Goal (Optional)
              </label>
              <input
                type="text"
                value={learningGoal}
                onChange={(e) => setLearningGoal(e.target.value)}
                placeholder="e.g. Master memory pointers for game dev, prep for physics test..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* FastAPI Background Task Queue Callout */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-950 border border-purple-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                <Zap className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>FastAPI Task Queue Manager</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                    Async Worker Active
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Runs curriculum compilation and custom procedural animation synthesis in a background worker queue with live progress polling.
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useFastAPIQueue}
                onChange={(e) => setUseFastAPIQueue(e.target.checked)}
                className="rounded border-slate-700 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-xs text-slate-300 font-medium">Use Async Queue</span>
            </label>
          </div>

          {/* Active Generation Progress Bar */}
          {isGenerating && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/50 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="text-purple-300 font-bold flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  {generationMessage}
                </span>
                <span className="text-purple-400 font-mono font-bold">{generationProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Action Button */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Calibrated with Subject Matter Expert (SME) mathematical invariants</span>
            </div>

            <button
              type="submit"
              disabled={!topic.trim() || isGenerating}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2.5 transition-all active:scale-95 disabled:opacity-40"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>{isGenerating ? 'Synthesizing with FastAPI...' : 'Create Multi-Chapter Course'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
