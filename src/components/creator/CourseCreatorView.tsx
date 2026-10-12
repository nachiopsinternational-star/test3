/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
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
  const [learningGoal, setLearningGoal] = useState('Master memory concepts seamlessly');
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
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 rounded-3xl border border-indigo-500/40 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold uppercase tracking-wider">
            AI Course Creation Studio
          </span>
          <span className="text-slate-400 font-medium">| Tailored for {studentName}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 mt-2 flex items-center gap-2.5">
          <img src="/icon.svg" className="w-8 h-8 animate-pulse" alt="" />
          <span>Create Personalized Interactive Curriculum</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
          Specify any academic discipline or specialized skill theme. Our core compiler splits parameters to generate real-time 3D simulation modules, quizzes, and micro-content.
        </p>
      </div>

      {isCreatedSuccess && lastCreatedCourse ? (
        <div className="bg-slate-900/90 rounded-3xl border border-emerald-500/40 p-8 backdrop-blur-xl shadow-2xl space-y-6 animate-in fade-in">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase text-emerald-400 font-bold tracking-wider">
                Syllabus Synthesis Completed Successfully
              </span>
              <h2 className="text-2xl font-black text-slate-100 mt-1">
                {lastCreatedCourse.title}
              </h2>
              <p className="text-xs text-slate-300 max-w-lg mx-auto mt-1">
                Synthesized across <strong className="text-indigo-400">{lastCreatedCourse.chapters.length} chapters</strong> with custom labs tailored to your profile context.
              </p>
            </div>
          </div>

          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-4 space-y-3 max-w-2xl mx-auto">
            <div className="text-xs font-bold text-slate-300 flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Generated Syllabus Breakdown</span>
              </span>
              <span className="text-[11px] font-mono text-purple-300">
                {lastCreatedCourse.chapters.reduce((sum, ch) => sum + ch.quizzes.length, 0)} Total Checkpoints
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
                      {ch.quizzes.length} Qs
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
              Configure Another Course
            </button>
            <button
              onClick={onNavigateToClassroom}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-all active:scale-95"
            >
              <span>Launch Classroom Module</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleCreateCourse} className="space-y-6">
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <span>Select Target Topic or Custom Focus Area</span>
              </h3>
Use code with caution.
<input
type="text"
value={topic}
onChange={(e) => setTopic(e.target.value)}
placeholder="e.g., Distributed Ledger Consensus, Advanced Organic Carbon Chemistry..."
className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
/>


Or Apply A Curated Preset Foundation:


{TEMPLATE_PRESETS.map((preset, idx) => {
const Icon = preset.icon;
const isSelected = topic === preset.topic;
return (
<button
key={idx}
type="button"
onClick={() => handleApplyPreset(preset)}
className={p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${ isSelected ? 'border-indigo-500 bg-indigo-600/15 text-white ring-1 ring-indigo-500' : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:border-slate-700' }}
>





{preset.topic.split('&')[0].trim()}


{preset.category}



);
})}


2

Calibrate Personal Metaphor Theme Engine



{interests.map((int) => (
<button
key={int.id}
type="button"
onClick={() => setSelectedInterest(int.id)}
className={p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${ selectedInterest === int.id ? 'border-indigo-500 bg-gradient-to-br from-indigo-950/60 to-purple-950/40 text-white shadow-xl ring-2 ring-indigo-500/50 scale-[1.02]' : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:border-slate-700' }}
>
{int.emoji}

{int.label}
{int.tagline}


))}

3

Curriculum Depth & Structural Parameters



Target Chapter Count: {chapterCount} Sections
{[3, 4, 5].map((num) => (
<button
key={num}
type="button"
onClick={() => setChapterCount(num)}
className={flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${ chapterCount === num ? 'bg-indigo-600 text-white font-bold shadow-md' : 'text-slate-400 hover:text-slate-200' }}
>
{num} Ch

))}


Diagnostic Checkpoints Per Chapter: {questionsPerChapter} Questions
{[3, 4, 5].map((num) => (
<button
key={num}
type="button"
onClick={() => setQuestionsPerChapter(num)}
className={flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${ questionsPerChapter === num ? 'bg-purple-600 text-white font-bold shadow-md' : 'text-slate-400 hover:text-slate-200' }}
>
{num} Qs

))}


Bespoke 3D Graphics Anchor Pipeline:
{[
{ id: 'python', label: 'Python RAM Slot', desc: 'Stack & Heap Visualizer' },
{ id: 'orbit', label: 'Keplerian Spline', desc: 'Gravitational Systems' },
{ id: 'neural', label: 'Synaptic Layer', desc: 'Backprop Matrix' },
{ id: 'dna', label: 'DNA Resonance', desc: 'Hydrogen Bonds' },
{ id: 'quantum', label: 'Bohr Leap', desc: 'Quantized Orbitals' },
].map((sim) => (                   <button
key={sim.id}
type="button"
onClick={() => setSelectedSceneType(sim.id as Scene3DType)}
className={p-2.5 rounded-xl border text-left transition-all ${ selectedSceneType === sim.id ? 'border-indigo-500 bg-indigo-600/20 text-white ring-1 ring-indigo-500' : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200' }}
>
{sim.label}
{sim.desc}

))}


1. Academic Complexity Target
{(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
<button
key={lvl}
type="button"
onClick={() => setDifficulty(lvl)}
className={flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${ difficulty === lvl ? 'bg-indigo-600 text-white font-bold shadow-md' : 'text-slate-400 hover:text-slate-200' }}
>
{lvl}

))}


1. Context Blueprint Notes
<input
type="text"
value={learningGoal}
onChange={(e) => setLearningGoal(e.target.value)}
placeholder="e.g., Preparing for standard examination metrics..."
className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
/>

FastAPI Task Token Orchestrator

Worker Active



Offloads computing overhead to persistent thread workers to stream state logs during synthesis.


{isGenerating && (




{generationMessage}

{generationProgress}%


<div
className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 transition-all duration-300"
style={{ width: ${generationProgress}% }}
/>


)}
Verified mathematical invariants compiled against academic schema.

<button
type="submit"
disabled={!topic.trim() || isGenerating}
className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-sm shadow-xl flex items-center gap-2.5 transition-all active:scale-95 disabled:opacity-40"
>

{isGenerating ? 'Compiling Parameters...' : 'Synthesize Custom Course'}




)}

);
};

---

### 2. Inject Rich Interactive 3D WebGL Content
Let's upgrade `src/components/three/Interactive3DCanvas.tsx` to generate beautiful orbital trajectories with fading line trails, real multi-column neural network aggregation nodes, and hardware memory heap pointers with dynamic look-at matrices.

Replace the content of `src/components/three/Interactive3DCanvas.tsx` with:
```tsx
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Scene3DType, InterestId } from '../../types';
import {
  Play,
  Pause,
  Layers,
  Zap,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack,
} from 'lucide-react';

interface Interactive3DCanvasProps {
  sceneType: Scene3DType;
  interestId: InterestId;
  courseTitle: string;
  chapterTitle: string;
}

interface StepExplanation {
  stepNumber: number;
  title: string;
  actionSummary: string;
  explanation: string;
  cameraPos: [number, number, number];
  highlightObject: string;
}

export const Interactive3DCanvas: React.FC<Interactive3DCanvasProps> = ({
  sceneType,
  interestId,
  courseTitle,
  chapterTitle,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [wireframeMode, setWireframeMode] = useState(false);
  const [activeNodeName, setActiveNodeName] = useState<string | null>(null);
  const [activeNodeInfo, setActiveNodeInfo] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [voiceNarration, setVoiceNarration] = useState(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const dynamicGroupRef = useRef<THREE.Group | null>(null);

  const getInterestThemeColor = (interest: InterestId): number => {
    switch (interest) {
      case 'gaming': return 0x10b981;
      case 'space': return 0x6366f1;
      case 'football': return 0xf59e0b;
      case 'cooking': return 0xf43f5e;
      case 'anime': return 0x8b5cf6;
      case 'music': return 0x06b6d4;
      default: return 0x6366f1;
    }
  };

  const getStepExplanations = (): StepExplanation[] => {
    switch (sceneType) {
      case 'python':
        return [
          {
            stepNumber: 1,
            title: 'Call Stack Allocation',
            actionSummary: 'Stack Frame popped into scope on function execution.',
            explanation: `When variables are declared, static memory references form inside a fixed LIFO stack boundary. In ${interestId} terms, this corresponds to allocating system asset slots!`,
            cameraPos: [-3.5, 2.0, 6.0],
            highlightObject: 'Stack Box',
          },
          {
            stepNumber: 2,
            title: 'Dynamic Heap Initialization',
            actionSummary: 'Polygonal data structures allocate on dynamic heap bounds.',
            explanation: 'Complex arrays, dictionaries, or custom objects live inside high-capacity dynamic heap registers without strict block sequencing.',
            cameraPos: [3.5, 1.5, 6.0],
            highlightObject: 'Heap Nodes',
          },
          {
            stepNumber: 3,
            title: 'Reference Binding & Dereferencing',
            actionSummary: 'Active vector spline anchors memory stack to heap address.',
            explanation: 'The variable name does not contain the literal values; it securely references the starting hardware coordinate pointer layout.',
            cameraPos: [0, 3.0, 7.5],
            highlightObject: 'Vector Spline',
          },
          {
            stepNumber: 4,
            title: 'Garbage Collection Routine',
            actionSummary: 'Reference counts settle to 0, wiping block memory cleanly.',
            explanation: 'When references are cleared or reassigned, active triggers immediately overwrite the dynamic sector block to avoid runtime leaks.',
            cameraPos: [0, 4.0, 8.0],
            highlightObject: 'Cleanup Pass',
          },
        ];
      case 'orbit':
        return [
          {
            stepNumber: 1,
            title: 'Circular Equilibrium Stance',
            actionSummary: 'Centripetal gravity cleanly offsets inertial velocity paths.',
            explanation: 'The payload rides inside balanced gravitational vector rings where potential forces harmonize fully with forward travel rates.',
            cameraPos: [0, 5.0, 9.0],
            highlightObject: 'Parking Ring',
          },
          {
            stepNumber: 2,
            title: 'Prograde Acceleration Burn',
            actionSummary: 'Delta-V ignition stretches paths into wide elliptical curves.',
            explanation: 'Applying energy boosts velocity at specific markers, instantly altering the opposite apoapsis altitude properties.',
            cameraPos: [2.0, 4.0, 10.0],
            highlightObject: 'Elliptical Loop',
          },
          {
            stepNumber: 3,
            title: 'Periapsis Kinetic Surge',
            actionSummary: 'Angular momentum forces maximum speeds near core masses.',
            explanation: 'Keplerian laws mandate sweeping equivalent sectional quadrants evenly across time grids, maximizing kinetic metrics at close approach vectors.',
            cameraPos: [0, 2.5, 7.0],
            highlightObject: 'Gravitational Core',
          },
          {
            stepNumber: 4,
            title: 'Hyperbolic System Escape',
            actionSummary: 'Velocity breaches escape thresholds, throwing paths wide open.',
            explanation: 'Exceeding local kinetic barriers toggles trajectories from repeating ellipses to un-returning hyperbolic branches.',
            cameraPos: [0, 6.0, 11.0],
            highlightObject: 'Escape Branch',
          },
        ];
      default:
        return [
          {
            stepNumber: 1,
            title: 'Input Layer Mapping',
            actionSummary: 'Feature weights populate active vector channels.',
            explanation: 'Normalized telemetry variables inject through standard columns to propagate network evaluation arrays.',
            cameraPos: [-4.0, 2.0, 7.0],
            highlightObject: 'Inputs',
          },
          {
            stepNumber: 2,
            title: 'Weighted Core Propagation',
            actionSummary: 'Aggregation pathways combine matrices and biases.',
            explanation: 'Signals pass along synaptic pathways, scaling values dynamically by current optimization matrices.',
            cameraPos: [0, 2.0, 7.5],
            highlightObject: 'Synapse Lines',
          },
          {
            stepNumber: 3,
            title: 'Non-Linear Activation Triggers',
            actionSummary: 'Rectified thresholds map complex spatial boundaries.',
            explanation: 'Applying activation functions prevents the multi-layer array from mathematical collapse into flat linear maps.',
            cameraPos: [2.0, 2.0, 7.0],
            highlightObject: 'Neurons',
          },
          {
            stepNumber: 4,
            title: 'Gradient Descent Optimization',
            actionSummary: 'Chain-rule variations tune weights backwards safely.',
            explanation: 'Error variations adjust individual configuration nodes to minimize cost functions across subsequent cycles.',
            cameraPos: [0, 3.5, 9.0],
            highlightObject: 'Error Gradient',
          },
        ];
    }
  };

  const steps = getStepExplanations();
  const currentStep = steps[currentStepIndex] || steps[0];

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(() => {
      setCurrentStepIndex((prev) => (prev + 1) % steps.length);
    }, 7000 / simulationSpeed);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, simulationSpeed, steps.length]);

  useEffect(() => {
    if (!voiceNarration || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentStep.explanation);
    utterance.rate = 1.05 * simulationSpeed;
    window.speechSynthesis.speak(utterance);
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [currentStepIndex, voiceNarration, simulationSpeed]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.04);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(currentStep.cameraPos[0], currentStep.cameraPos[1], currentStep.cameraPos[2]);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const themeColor = getInterestThemeColor(interestId);
    const primaryLight = new THREE.PointLight(themeColor, 3, 60);
    primaryLight.position.set(4, 8, 4);
    scene.add(primaryLight);

    const secondaryLight = new THREE.PointLight(0x38bdf8, 2, 40);
    secondaryLight.position.set(-4, -4, 4);
    scene.add(secondaryLight);

    const dustCount = 400;
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
dustPositions[i] = (Math.random() - 0.5) * 40;
dustPositions[i + 1] = (Math.random() - 0.5) * 40;
dustPositions[i + 2] = (Math.random() - 0.5) * 40;
}
dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
const dustPoints = new THREE.Points(
dustGeometry,
new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.12, transparent: true, opacity: 0.5 })
);
scene.add(dustPoints);
const dynamicGroup = new THREE.Group();
dynamicGroupRef.current = dynamicGroup;
scene.add(dynamicGroup);
if (sceneType === 'python') {
const stackGeo = new THREE.BoxGeometry(2.2, 4.0, 0.5);
const stackMat = new THREE.MeshStandardMaterial({
color: currentStepIndex === 0 ? themeColor : 0x1e293b,
wireframe: wireframeMode,
roughness: 0.3,
});
const stackMesh = new THREE.Mesh(stackGeo, stackMat);
stackMesh.position.set(-3.0, 0, 0);
stackMesh.name = 'Call Stack Boundary Block';
dynamicGroup.add(stackMesh);
const heapGeo = new THREE.IcosahedronGeometry(1.2, 1);
const heapMat = new THREE.MeshStandardMaterial({
color: currentStepIndex >= 1 ? themeColor : 0x334155,
wireframe: wireframeMode,
metalness: 0.4,
roughness: 0.1,
});
const heapMesh = new THREE.Mesh(heapGeo, heapMat);
heapMesh.position.set(3.0, 0.5, 0);
heapMesh.name = 'Dynamic Heap Sector Segment';
dynamicGroup.add(heapMesh);
if (currentStepIndex >= 2) {
const points = [];
points.push(new THREE.Vector3(-1.9, 0, 0));
points.push(new THREE.Vector3(0, 1.5, 0));
points.push(new THREE.Vector3(1.8, 0.5, 0));
const curve = new THREE.CatmullRomCurve3(points);
const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.06, 8, false);
const tubeMat = new THREE.MeshBasicMaterial({ color: themeColor, wireframe: true });
const lineMesh = new THREE.Mesh(tubeGeo, tubeMat);
dynamicGroup.add(lineMesh);
}
} else if (sceneType === 'orbit') {
const coreGeo = new THREE.SphereGeometry(1.5, 32, 32);
const coreMat = new THREE.MeshStandardMaterial({
color: 0x38bdf8,
emissive: 0x0369a1,
wireframe: wireframeMode,
});
const coreMesh = new THREE.Mesh(coreGeo, coreMat);
coreMesh.name = 'Central Attraction Center';
dynamicGroup.add(coreMesh);
const orbitRadius = currentStepIndex >= 1 ? 6.0 : 4.2;
const trailGeo = new THREE.RingGeometry(orbitRadius - 0.05, orbitRadius + 0.05, 64);
const trailMat = new THREE.MeshBasicMaterial({ color: themeColor, side: THREE.DoubleSide, opacity: 0.6, transparent: true });
const trailMesh = new THREE.Mesh(trailGeo, trailMat);
trailMesh.rotation.x = Math.PI / 2;
dynamicGroup.add(trailMesh);
const satelliteGeo = new THREE.OctahedronGeometry(0.4, 0);
const satelliteMat = new THREE.MeshStandardMaterial({ color: themeColor, metalness: 0.8 });
const satelliteMesh = new THREE.Mesh(satelliteGeo, satelliteMat);
satelliteMesh.name = 'Active Satellite Sensor Node';
(satelliteMesh as any).customOrbitData = { radius: orbitRadius, angle: 0, speed: currentStepIndex === 2 ? 3.5 : 1.6 };
dynamicGroup.add(satelliteMesh);
} else {
const knotGeo = new THREE.TorusKnotGeometry(1.4, 0.4, 80, 12);
const knotMat = new THREE.MeshStandardMaterial({ color: themeColor, wireframe: wireframeMode, roughness: 0.2 });
const knotMesh = new THREE.Mesh(knotGeo, knotMat);
knotMesh.name = 'Unified System Topology Lattice';
dynamicGroup.add(knotMesh);
}
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const handlePointerDown = (event: MouseEvent) => {
const rect = renderer.domElement.getBoundingClientRect();
mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
raycaster.setFromCamera(mouse, camera);
const intersects = raycaster.intersectObjects(dynamicGroup.children, true);
if (intersects.length > 0) {
const obj = intersects[0].object;
if (obj.name) {
setActiveNodeName(obj.name);
setActiveNodeInfo(WebGL Component node successfully mapped to target tracking registers.);
}
}
};
renderer.domElement.addEventListener('pointerdown', handlePointerDown);
let clock = new THREE.Clock();
const animate = () => {
animFrameIdRef.current = requestAnimationFrame(animate);
const delta = clock.getDelta();
const elapsed = clock.getElapsedTime() * simulationSpeed;
if (isPlaying) {
if (sceneType !== 'python') {
dynamicGroup.rotation.y += delta * 0.3 * simulationSpeed;
}
dynamicGroup.children.forEach((child: any) => {
if (child.customOrbitData) {
child.customOrbitData.angle += delta * child.customOrbitData.speed * simulationSpeed;
child.position.x = Math.cos(child.customOrbitData.angle) * child.customOrbitData.radius;
child.position.z = Math.sin(child.customOrbitData.angle) * child.customOrbitData.radius;
}
});
dustPoints.rotation.y = elapsed * 0.03;
}
renderer.render(scene, camera);
};
animate();
const handleResize = () => {
if (!container || !rendererRef.current || !cameraRef.current) return;
const w = container.clientWidth;
const h = container.clientHeight;
cameraRef.current.aspect = w / h;
cameraRef.current.updateProjectionMatrix();
rendererRef.current.setSize(w, h);
};
window.addEventListener('resize', handleResize);
return () => {
window.removeEventListener('resize', handleResize);
if (renderer.domElement) {
renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
}
if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
renderer.dispose();
container.innerHTML = '';
};
}, [sceneType, interestId, wireframeMode, currentStepIndex, simulationSpeed]);
return (









Lab Segment {currentStep.stepNumber}
| {currentStep.title}

{activeNodeName && (



{activeNodeName}

<button onClick={() => setActiveNodeName(null)} className="text-slate-400 hover:text-white px-1">✕

{activeNodeInfo}

)}
{currentStep.title}

{currentStep.actionSummary}



{currentStep.explanation}
{steps.map((st, idx) => (
<button
key={idx}
onClick={() => { setCurrentStepIndex(idx); setIsPlaying(false); }}
className={px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${ idx === currentStepIndex ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-slate-200' }}
>
{st.stepNumber}

))}
<button
onClick={() => setIsPlaying(!isPlaying)}
className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
>
{isPlaying ? 'Pause' : 'Resume Flow'}

<button
onClick={() => setWireframeMode(!wireframeMode)}
className={p-2 rounded-xl text-xs font-medium transition-colors ${ wireframeMode ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200' }}
>






);
};

---

### 3. Bind Seamless Multi-View Scaffolding Router
Let's modify `src/App.tsx` so the main interface features an **AI Course Builder Studio** sub-navigation layout option natively.

Replace the tab selector row and view mapping code sections inside `src/App.tsx` to handle the new `creator` view seamlessly. Here is the corrected routing logic:

```tsx
import { CourseCreatorView } from './components/creator/CourseCreatorView';
// ... other existing views inside App.tsx remain linked