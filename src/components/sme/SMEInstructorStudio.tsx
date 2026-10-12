import React, { useState } from 'react';
import { Course, Chapter, Scene3DType, ProprietaryGLBXPackage, QuizQuestion } from '../../types';
import { glbxEngine } from '../../services/glbxEngine';
import { taskService } from '../../services/taskService';
import { buildProceduralAnimationDoc } from '../../services/c3dSceneBuilder';
import {
  Layers,
  FileCode2,
  Download,
  Upload,
  BarChart2,
  Users,
  Flame,
  CheckCircle,
  HelpCircle,
  Eye,
  Sliders,
  Sparkles,
  PlusCircle,
  BookOpen,
  Send,
  Zap,
  Code2,
  Rocket,
  Brain,
  Dna,
  Atom,
  Check,
  AlertCircle,
  Trash2,
  Plus,
} from 'lucide-react';

interface SMEInstructorStudioProps {
  courses: Course[];
  activeCourse: Course;
  onSelectCourse: (courseId: string) => void;
  onCourseCreated?: (newCourse: Course) => void;
}

// Multi-Chapter Course Authoring Interface
interface AuthorChapter {
  id: string;
  title: string;
  description: string;
  formula: string;
  durationMinutes: number;
  sceneType: Scene3DType;
  quizzes: Array<{
    question: string;
    correctOption: string;
    distractor1: string;
    distractor2: string;
    distractor3: string;
    xp: number;
  }>;
}

export const SMEInstructorStudio: React.FC<SMEInstructorStudioProps> = ({
  courses,
  activeCourse,
  onSelectCourse,
  onCourseCreated,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'curriculum' | 'glbx' | 'telemetry'>('create');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportedXML, setExportedXML] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [publishSuccessNotice, setPublishSuccessNotice] = useState<string | null>(null);

  // Course Creation Form State for Teachers
  const [newCourseTitle, setNewCourseTitle] = useState('Beginner Python Workshop & Memory Architecture');
  const [newCourseCategory, setNewCourseCategory] = useState('Computer Science & Software');
  const [newSpecialistName, setNewSpecialistName] = useState('Dr. Marcus Vance, Ph.D.');
  const [newSpecialistInst, setNewSpecialistInst] = useState('MIT Computer Science & AI Lab (CSAIL)');
  const [newLevel, setNewLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [newCoursePrice, setNewCoursePrice] = useState('9.99');
  const [newSceneType, setNewSceneType] = useState<Scene3DType>('python');

  const [authorChapters, setAuthorChapters] = useState<AuthorChapter[]>([
    {
      id: 'ch-1',
      title: 'Variables, Hardware Pointers & Heap RAM',
      description: 'Understand how mutable objects live in heap memory and why variables are reference tags.',
      formula: 'Address = Base_Pointer + (Index * sizeof(DataType))',
      durationMinutes: 20,
      sceneType: 'python',
      quizzes: [
        {
          question: 'When executing b = a on a mutable list, what occurs in memory?',
          correctOption: 'A pointer copy referencing the exact same heap memory block',
          distractor1: 'A completely independent second copy of the entire list data',
          distractor2: 'A static read-only variable allocated in CPU registers',
          distractor3: 'The list is destroyed and reassigned to None',
          xp: 80,
        },
        {
          question: 'Where do local primitive integers and stack frames reside?',
          correctOption: 'In the contiguous call-stack frame popped on function return',
          distractor1: 'Exclusively in dynamic non-contiguous heap memory',
          distractor2: 'In permanent hard-drive swap space',
          distractor3: 'In the motherboard BIOS register',
          xp: 90,
        },
      ],
    },
    {
      id: 'ch-2',
      title: 'Call Stack LIFO Invocation & Recursion',
      description: 'Visualize push and pop operations on frame registers and how base cases prevent stack overflow.',
      formula: 'Stack_Depth = Base_Offset + (Recursion_Level * Frame_Size)',
      durationMinutes: 25,
      sceneType: 'python',
      quizzes: [
        {
          question: 'What triggers a StackOverflowError in recursive algorithms?',
          correctOption: 'Missing base case causing infinite activation frames exceeding stack limit',
          distractor1: 'Heap fragmentation causing pointer collisions',
          distractor2: 'Zero-division in mathematical formulas',
          distractor3: 'Too many CPU threads initialized',
          xp: 85,
        },
      ],
    },
  ]);

  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isTaskGenerating, setIsTaskGenerating] = useState(false);
  const [taskProgressMessage, setTaskProgressMessage] = useState<string | null>(null);
  const [taskProgressPct, setTaskProgressPct] = useState(0);

  // Existing Knowledge Modules State
  const [knowledgeModules, setKnowledgeModules] = useState([
    {
      id: 'km-1',
      title: 'Memory Allocation & Pointers',
      coreFormula: 'Address = Base + (Index * SizeOf(Type))',
      difficultyWeight: 'High',
      aiPersonalizationStatus: 'Active across 6 Interests',
    },
    {
      id: 'km-2',
      title: 'Call Stack LIFO Invocation',
      coreFormula: 'Frame_depth = Recursion_limit - n',
      difficultyWeight: 'Medium',
      aiPersonalizationStatus: 'Active across 6 Interests',
    },
    {
      id: 'km-3',
      title: 'Hash Collisions & Probing',
      coreFormula: 'Bucket = Hash(Key) % Capacity',
      difficultyWeight: 'Very High',
      aiPersonalizationStatus: 'Active across 6 Interests',
    },
  ]);

  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleFormula, setNewModuleFormula] = useState('');

  const handlePublishNewCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;

    const courseId = `course-sme-${Date.now()}`;

    // Map all authorChapters into rich Course chapters with procedural C3D docs and multiple quizzes
    const mappedChapters: Chapter[] = authorChapters.map((ch, idx) => {
      const chapterId = `ch-${Date.now()}-${idx + 1}`;
      return {
        id: chapterId,
        title: ch.title,
        description: ch.description,
        durationMinutes: ch.durationMinutes,
        sceneType: ch.sceneType,
        priceUSD: 0,
        unlocked: idx === 0,
        completed: false,
        customAnimationDoc: buildProceduralAnimationDoc(ch.sceneType, 'gaming', ch.title),
        quizzes: ch.quizzes.map((q, qIdx) => ({
          id: `quiz-${chapterId}-${qIdx + 1}`,
          question: q.question,
          interestFraming: {
            gaming: `In game development: ${q.question}`,
            space: `In orbital mechanics: ${q.question}`,
            football: `In sport telemetry: ${q.question}`,
            cooking: `In culinary chemistry: ${q.question}`,
            anime: `In energy matrices: ${q.question}`,
            music: `In acoustic synthesis: ${q.question}`,
          },
          options: [q.correctOption, q.distractor1, q.distractor2, q.distractor3],
          correctAnswer: 0,
          explanation: {
            gaming: `Optimal solution verified in game programming framework.`,
            space: `Avionics verified standard baseline.`,
            football: `Verified through tactical positioning telemetry.`,
            cooking: `Confirmed via thermal reaction kinetics.`,
            anime: `Harmonizes focal chakra coordinates.`,
            music: `Phase cancellation avoided with clean harmonic alignment.`,
          },
          xp: q.xp || 80,
        })),
        flashcards: [
          {
            id: `fc-${chapterId}-1`,
            subject: newCourseTitle,
            concept: ch.title,
            frontPrompt: `What invariant governs ${ch.title}?`,
            backExplanation: `Governed by invariant formula: ${ch.formula}. ${ch.description}`,
            interestContext: {
              gaming: `Analogous to state consistency across multiplayer server ticks.`,
              space: `Orbital physics invariant maintaining stable trajectory.`,
              football: `Tactical alignment maintaining offensive shape.`,
              cooking: `Recipe ratios ensuring emulsion equilibrium.`,
              anime: `Balance of elemental forms preventing power surges.`,
              music: `Key signature stability avoiding dissonance.`,
            },
            leitnerBox: 1,
          },
        ],
      };
    });

    const createdCourse: Course = {
      id: courseId,
      title: newCourseTitle,
      category: newCourseCategory,
      description: `${newCourseTitle} curated by ${newSpecialistName}. Includes ${mappedChapters.length} complete interactive chapters with procedural 3D SVG & ThreeJS scenes.`,
      fieldSpecialist: {
        name: newSpecialistName,
        credential: 'SME Curriculum Lead',
        institution: newSpecialistInst,
      },
      level: newLevel,
      rating: 5.0,
      reviewsCount: 1,
      enrolledStudents: 1,
      priceUSD: parseFloat(newCoursePrice) || 0,
      colorTheme: 'from-indigo-600 to-purple-800',
      badges: ['Multi-Chapter Masterclass', 'Procedural C3D Animation', 'SME Curated'],
      glbxPackage: {
        formatVersion: 'GLBX-v3.4-C3D',
        packageId: `PKG-SME-${Math.floor(Math.random() * 9000 + 1000)}.glbx`,
        courseTitle: newCourseTitle,
        nodeCount: mappedChapters.length * 40,
        geometryEngine: 'ThreeJS_WebGL2',
        lmsInteroperability: 'LTI_v1.3',
        sizeBytes: 15420000,
        checksum: `sha256_${Math.random().toString(36).substring(2, 10)}`,
        lastCuratedBySME: new Date().toISOString(),
        adaptiveParameters: {
          maxLOD: 4,
          physicsSimulationFPS: 60,
          interestMeshVariantCount: 6,
        },
      },
      chapters: mappedChapters,
    };

    if (onCourseCreated) {
      onCourseCreated(createdCourse);
    }
    onSelectCourse(createdCourse.id);

    setPublishSuccessNotice(`🎉 Successfully published "${createdCourse.title}" with ${createdCourse.chapters.length} chapters and diagnostic quizzes!`);
    setActiveTab('curriculum');
    setTimeout(() => setPublishSuccessNotice(null), 6000);
  };

  // Asynchronous FastAPI Task Dispatch for Instant Multi-Chapter Generation
  const handleGenerateWithFastAPI = async (topic: string, chaptersCount = 4, questionsPerChapter = 3) => {
    setIsTaskGenerating(true);
    setTaskProgressPct(10);
    setTaskProgressMessage('Submitting async generation job to FastAPI Task Queue...');

    try {
      const { taskId } = await taskService.submitTask('generate_course', `Generate ${topic} Syllabus`, {
        studentName: 'SME Studio Author',
        studentGrade: 'Undergraduate Honors',
        interestId: 'gaming',
        targetTopic: topic,
        difficulty: newLevel,
        chapterCount: chaptersCount,
        questionsPerChapter,
      });

      const finishedTask = await taskService.pollTask(taskId, (t) => {
        setTaskProgressPct(t.progress);
        setTaskProgressMessage(t.stepMessage);
      });

      if (finishedTask.result?.course) {
        const genCourse: Course = finishedTask.result.course;
        if (onCourseCreated) {
          onCourseCreated(genCourse);
        }
        onSelectCourse(genCourse.id);
        setPublishSuccessNotice(`⚡ FastAPI Background Task complete! Generated ${genCourse.chapters.length}-chapter syllabus for "${genCourse.title}".`);
        setActiveTab('curriculum');
      }
    } catch (err: any) {
      console.error('Task error:', err);
      setPublishSuccessNotice(`Task encountered issue: ${err.message}`);
    } finally {
      setIsTaskGenerating(false);
      setTaskProgressMessage(null);
    }
  };

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    setKnowledgeModules((prev) => [
      ...prev,
      {
        id: `km-${Date.now()}`,
        title: newModuleTitle,
        coreFormula: newModuleFormula || 'F(x) = E_state',
        difficultyWeight: 'Medium',
        aiPersonalizationStatus: 'Active across 6 Interests',
      },
    ]);
    setNewModuleTitle('');
    setNewModuleFormula('');
  };

  const handleExportLMS = () => {
    const xml = glbxEngine.generateLMSCartridge(activeCourse);
    setExportedXML(xml);
    setShowExportModal(true);
  };

  const handleCopyXML = () => {
    navigator.clipboard.writeText(exportedXML);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Studio Header & Course Selector */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 backdrop-blur-md shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[11px] font-mono font-bold uppercase">
              Teacher & SME Studio
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400">
              Curator: {activeCourse ? activeCourse.fieldSpecialist.name : 'Curriculum Director'}
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-100 mt-1">
            Subject Matter Expert (SME) Curriculum & Course Studio
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Create courses, curate skeletal knowledge modules, define animation blueprints, and verify pedagogical quizzes.
          </p>
        </div>

        {/* Course Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Curating Course:</label>
          <select
            value={activeCourse.id}
            onChange={(e) => onSelectCourse(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {publishSuccessNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{publishSuccessNotice}</span>
        </div>
      )}

      {/* SME Studio Tabs */}
      <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'create'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PlusCircle className="w-4 h-4 text-amber-300" />
          <span>+ Create New Course</span>
        </button>

        <button
          onClick={() => setActiveTab('curriculum')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'curriculum'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Curriculum Skeleton</span>
        </button>

        <button
          onClick={() => setActiveTab('glbx')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'glbx'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode2 className="w-4 h-4" />
          <span>Proprietary GLBX Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'telemetry'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Student Telemetry & Confusion Heatmap</span>
        </button>
      </div>

      {/* TAB 1: TEACHER COURSE CREATOR */}
      {activeTab === 'create' && (
        <form
          onSubmit={handlePublishNewCourse}
          className="bg-slate-900/90 rounded-2xl border border-purple-500/30 p-6 backdrop-blur-md shadow-2xl space-y-6"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">
                Field Specialist Authoring Tool
              </span>
              <h3 className="text-lg font-black text-slate-100 mt-0.5">
                Author & Publish a Course Skeleton
              </h3>
              <p className="text-xs text-slate-400">
                You define the academic truth, formulas, and quiz diagnostics; our AI automatically generates interest-personalized animations for every student.
              </p>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Publish Course to Curriculum</span>
            </button>
          </div>

          {/* Section 1: Course Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Course Title
              </label>
              <input
                type="text"
                value={newCourseTitle}
                onChange={(e) => setNewCourseTitle(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-medium"
                placeholder="e.g. Beginner Python Workshop"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Field / Category
              </label>
              <select
                value={newCourseCategory}
                onChange={(e) => setNewCourseCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              >
                <option value="Computer Science & Software">Computer Science & Software</option>
                <option value="Astrophysics & Orbital Dynamics">Astrophysics & Space Flight</option>
                <option value="Artificial Intelligence & Neural Science">Artificial Intelligence</option>
                <option value="Molecular Genetics & Biotechnology">Molecular Biology & Genetics</option>
                <option value="Quantum Mechanics & Atomic Physics">Quantum Mechanics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Field Specialist Name & Title
              </label>
              <input
                type="text"
                value={newSpecialistName}
                onChange={(e) => setNewSpecialistName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-medium"
                placeholder="e.g. Dr. Jane Doe, Ph.D."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Academic Institution / Lab
              </label>
              <input
                type="text"
                value={newSpecialistInst}
                onChange={(e) => setNewSpecialistInst(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-medium"
                placeholder="e.g. Stanford University / CERN"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Visual Animation Model
              </label>
              <select
                value={newSceneType}
                onChange={(e) => setNewSceneType(e.target.value as Scene3DType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              >
                <option value="python">Python Memory Stack & Heap Virtualizer</option>
                <option value="orbit">Keplerian Orbital Mechanics & Slingshot Vectors</option>
                <option value="neural">Multilayer Perceptron Neural Synapse</option>
                <option value="dna">DNA Double Helix & Hydrogen Cleavage</option>
                <option value="quantum">Quantized Bohr Atomic Orbitals</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Catalog Price (USD) or Subscription Free
              </label>
              <input
                type="text"
                value={newCoursePrice}
                onChange={(e) => setNewCoursePrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
                placeholder="9.99"
              />
            </div>
          </div>

          {/* FastAPI Background Task Generator Header */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-500/40 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                <Zap className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>FastAPI Background Task Engine</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono">
                    Async Queue Active
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Instantly synthesize 4+ chapters with diagnostic quizzes and custom procedural animations in the background.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isTaskGenerating}
                onClick={() => handleGenerateWithFastAPI(newCourseTitle || 'Advanced Algorithms', 4, 3)}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isTaskGenerating ? 'Running Task...' : 'Auto-Generate Multi-Chapter Course'}</span>
              </button>
            </div>
          </div>

          {/* Task Progress Bar */}
          {isTaskGenerating && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-purple-500/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-purple-300 font-semibold flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  {taskProgressMessage}
                </span>
                <span className="text-purple-400 font-mono font-bold">{taskProgressPct}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${taskProgressPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Section 2: Multi-Chapter Management Tabs */}
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Multi-Chapter Syllabus Editor ({authorChapters.length} Chapters)</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Configure chapters, learning goals, formulas, and multiple diagnostic quiz questions.
                </p>
              </div>

              {/* Add Chapter Button */}
              <button
                type="button"
                onClick={() => {
                  const newNum = authorChapters.length + 1;
                  setAuthorChapters((prev) => [
                    ...prev,
                    {
                      id: `ch-${Date.now()}`,
                      title: `Chapter ${newNum}: Advanced Topics & Analysis`,
                      description: `Deep dive into advanced paradigms and algorithmic execution.`,
                      formula: `Complexity = O(N * log(N))`,
                      durationMinutes: 25,
                      sceneType: (['python', 'orbit', 'neural', 'dna', 'quantum'][newNum % 5] || 'neural') as Scene3DType,
                      quizzes: [
                        {
                          question: `What is the primary constraint introduced in Chapter ${newNum}?`,
                          correctOption: `Systemic resource boundary enforcing optimal cache allocation`,
                          distractor1: `Total thread failure across all processors`,
                          distractor2: `Zero runtime memory usage`,
                          distractor3: `Indefinite blocking without semaphore release`,
                          xp: 85,
                        },
                      ],
                    },
                  ]);
                  setActiveChapterIndex(authorChapters.length);
                }}
                className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Chapter</span>
              </button>
            </div>

            {/* Chapter Selection Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-slate-800/80 pb-3">
              {authorChapters.map((ch, idx) => (
                <div key={ch.id} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setActiveChapterIndex(idx)}
                    className={`px-3 py-1.5 rounded-l-xl text-xs font-bold transition-all ${
                      activeChapterIndex === idx
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <span>Ch {idx + 1}: {ch.title.slice(0, 24)}...</span>
                  </button>
                  {authorChapters.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthorChapters((prev) => prev.filter((_, i) => i !== idx));
                        setActiveChapterIndex(0);
                      }}
                      className="px-2 py-1.5 bg-slate-900 hover:bg-rose-950/50 text-slate-500 hover:text-rose-400 border-y border-r border-slate-800 rounded-r-xl transition-colors text-xs"
                      title="Remove Chapter"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Active Chapter Details */}
            {authorChapters[activeChapterIndex] && (() => {
              const currentCh = authorChapters[activeChapterIndex];
              const updateActive = (updater: (prevCh: typeof currentCh) => typeof currentCh) => {
                setAuthorChapters((prev) =>
                  prev.map((c, i) => (i === activeChapterIndex ? updater(c) : c))
                );
              };

              return (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Chapter {activeChapterIndex + 1} Title
                      </label>
                      <input
                        type="text"
                        value={currentCh.title}
                        onChange={(e) => updateActive((c) => ({ ...c, title: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Scene 3D Simulation
                      </label>
                      <select
                        value={currentCh.sceneType}
                        onChange={(e) => updateActive((c) => ({ ...c, sceneType: e.target.value as Scene3DType }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      >
                        <option value="python">Python Memory RAM</option>
                        <option value="orbit">Keplerian Orbit Mechanics</option>
                        <option value="neural">Neural Synaptic Weights</option>
                        <option value="dna">DNA Helix Cleavage</option>
                        <option value="quantum">Quantum Bohr Orbitals</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Core Invariant Formula / Mathematical Law
                      </label>
                      <input
                        type="text"
                        value={currentCh.formula}
                        onChange={(e) => updateActive((c) => ({ ...c, formula: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Est. Duration (Minutes)
                      </label>
                      <input
                        type="number"
                        value={currentCh.durationMinutes}
                        onChange={(e) => updateActive((c) => ({ ...c, durationMinutes: parseInt(e.target.value) || 20 }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Pedagogical Objective & Concept Overview
                    </label>
                    <textarea
                      value={currentCh.description}
                      onChange={(e) => updateActive((c) => ({ ...c, description: e.target.value }))}
                      rows={2}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>

                  {/* Multi-Quiz Question Builder for Active Chapter */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-amber-300">
                          Diagnostic Quizzes for Chapter {activeChapterIndex + 1} ({currentCh.quizzes.length} Questions)
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const qNum = currentCh.quizzes.length + 1;
                          updateActive((c) => ({
                            ...c,
                            quizzes: [
                              ...c.quizzes,
                              {
                                question: `Question ${qNum}: What principle applies here?`,
                                correctOption: `Standard primary verified solution ${qNum}`,
                                distractor1: `Plausible alternate distractor A`,
                                distractor2: `Contradictory misconception B`,
                                distractor3: `Extraneous factor C`,
                                xp: 80,
                              },
                            ],
                          }));
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold border border-amber-500/30 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Add Quiz Question</span>
                      </button>
                    </div>

                    <div className="space-y-4 pt-1">
                      {currentCh.quizzes.map((quiz, qIndex) => (
                        <div key={qIndex} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase">
                              Question #{qIndex + 1}
                            </span>
                            {currentCh.quizzes.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateActive((c) => ({
                                    ...c,
                                    quizzes: c.quizzes.filter((_, qi) => qi !== qIndex),
                                  }))
                                }
                                className="text-slate-500 hover:text-rose-400 text-xs"
                                title="Delete Question"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div>
                            <input
                              type="text"
                              value={quiz.question}
                              onChange={(e) => {
                                const newQText = e.target.value;
                                updateActive((c) => ({
                                  ...c,
                                  quizzes: c.quizzes.map((q, qi) =>
                                    qi === qIndex ? { ...q, question: newQText } : q
                                  ),
                                }));
                              }}
                              placeholder="Question text..."
                              className="w-full bg-slate-900 border border-slate-750 rounded-lg p-2 text-xs text-white"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            <div>
                              <label className="block text-[10px] font-semibold text-emerald-400 mb-0.5">
                                Correct Answer (Option A)
                              </label>
                              <input
                                type="text"
                                value={quiz.correctOption}
                                onChange={(e) => {
                                  const text = e.target.value;
                                  updateActive((c) => ({
                                    ...c,
                                    quizzes: c.quizzes.map((q, qi) =>
                                      qi === qIndex ? { ...q, correctOption: text } : q
                                    ),
                                  }));
                                }}
                                className="w-full bg-emerald-950/20 border border-emerald-500/40 rounded-lg p-1.5 text-xs text-emerald-200"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-rose-400 mb-0.5">
                                Distractor B
                              </label>
                              <input
                                type="text"
                                value={quiz.distractor1}
                                onChange={(e) => {
                                  const text = e.target.value;
                                  updateActive((c) => ({
                                    ...c,
                                    quizzes: c.quizzes.map((q, qi) =>
                                      qi === qIndex ? { ...q, distractor1: text } : q
                                    ),
                                  }));
                                }}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-300"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-rose-400 mb-0.5">
                                Distractor C
                              </label>
                              <input
                                type="text"
                                value={quiz.distractor2}
                                onChange={(e) => {
                                  const text = e.target.value;
                                  updateActive((c) => ({
                                    ...c,
                                    quizzes: c.quizzes.map((q, qi) =>
                                      qi === qIndex ? { ...q, distractor2: text } : q
                                    ),
                                  }));
                                }}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-300"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-rose-400 mb-0.5">
                                Distractor D
                              </label>
                              <input
                                type="text"
                                value={quiz.distractor3}
                                onChange={(e) => {
                                  const text = e.target.value;
                                  updateActive((c) => ({
                                    ...c,
                                    quizzes: c.quizzes.map((q, qi) =>
                                      qi === qIndex ? { ...q, distractor3: text } : q
                                    ),
                                  }));
                                }}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-300"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 hover:opacity-90 text-white text-xs font-bold flex items-center gap-2 shadow-xl shadow-purple-600/30 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Publish {authorChapters.length}-Chapter Course to Curriculum</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: CURRICULUM SKELETON */}
      {activeTab === 'curriculum' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>SME Curated Modules: {activeCourse.title}</span>
                </h3>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  {knowledgeModules.length} Active Nodes
                </span>
              </div>

              <div className="space-y-3">
                {knowledgeModules.map((mod) => (
                  <div
                    key={mod.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-200">{mod.title}</span>
                      <span className="font-mono text-[10px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded">
                        Weight: {mod.difficultyWeight}
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-emerald-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800 mt-1">
                      {mod.coreFormula}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                      <span className="flex items-center gap-1 text-indigo-400">
                        <CheckCircle className="w-3 h-3" />
                        {mod.aiPersonalizationStatus}
                      </span>
                      <span className="text-slate-500 font-mono">{mod.id}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Knowledge Module Form */}
              <form onSubmit={handleAddModule} className="mt-4 pt-4 border-t border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-300">
                  + Add Specialized Knowledge Node:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newModuleTitle}
                    onChange={(e) => setNewModuleTitle(e.target.value)}
                    placeholder="Module Title (e.g. Cache Locality)"
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="text"
                    value={newModuleFormula}
                    onChange={(e) => setNewModuleFormula(e.target.value)}
                    placeholder="Scientific Formula / Invariant Rule"
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Append Knowledge Node</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Chapters & SME Meta */}
          <div className="space-y-4">
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
                Chapters in Syllabus
              </h4>
              <div className="space-y-2">
                {activeCourse.chapters.map((ch, idx) => (
                  <div key={ch.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <div className="font-bold text-slate-200">
                      Ch {idx + 1}: {ch.title}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                      {ch.description}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>{ch.durationMinutes} mins</span>
                      <span className="text-indigo-400">{ch.quizzes.length} Diagnostic Quizzes</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PROPRIETARY GLBX PACKAGE */}
      {activeTab === 'glbx' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-purple-400 font-bold text-xs">
                  {activeCourse.glbxPackage.formatVersion}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400 font-mono">
                  {activeCourse.glbxPackage.packageId}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-100 mt-1">
                Proprietary GLBX WebGL2 & Physics Container
              </h3>
            </div>

            <button
              onClick={handleExportLMS}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export LMS Cartridge (LTI 1.3 / IMS)</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-500 uppercase">3D Node Count</div>
              <div className="text-lg font-black text-slate-200 mt-0.5">
                {activeCourse.glbxPackage.nodeCount} Meshes
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Engine Core</div>
              <div className="text-lg font-black text-slate-200 mt-0.5">
                {activeCourse.glbxPackage.geometryEngine}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-500 uppercase">LMS Standard</div>
              <div className="text-lg font-black text-slate-200 mt-0.5">
                {activeCourse.glbxPackage.lmsInteroperability}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Container Size</div>
              <div className="text-lg font-black text-slate-200 mt-0.5">
                {(activeCourse.glbxPackage.sizeBytes / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TELEMETRY & CONFUSION HEATMAP */}
      {activeTab === 'telemetry' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">
                Real-Time Curriculum Telemetry
              </span>
              <h3 className="text-base font-bold text-slate-100 mt-1">
                Student Confusion Heatmap & Friction Analysis
              </h3>
            </div>
            <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              ● 24 Active Student Telemetry Feeds
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                concept: 'Memory Allocation: Stack vs Heap pointer dereferencing',
                confusionRate: 34,
                avgFocusScore: 78,
                interestContextWithHighestRetention: 'Gaming (92% accuracy)',
                status: 'Under AI Calibration',
              },
              {
                concept: 'Keplerian Orbit: Periapsis velocity conservation',
                confusionRate: 18,
                avgFocusScore: 89,
                interestContextWithHighestRetention: 'Space & Sci-Fi (96% accuracy)',
                status: 'Optimal Scaffolding',
              },
              {
                concept: 'Backpropagation: Partial derivatives through ReLU',
                confusionRate: 42,
                avgFocusScore: 71,
                interestContextWithHighestRetention: 'Football Analytics (88% accuracy)',
                status: 'SME Rubric Review Needed',
              },
            ].map((row, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-200">{row.concept}</span>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded ${
                      row.confusionRate > 30
                        ? 'bg-amber-500/15 text-amber-300'
                        : 'bg-emerald-500/15 text-emerald-300'
                    }`}
                  >
                    Confusion Index: {row.confusionRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Highest Retention Context: {row.interestContextWithHighestRetention}</span>
                  <span className="font-mono text-purple-300">{row.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export LMS Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-purple-400" />
                <span>Generated LTI 1.3 / IMS Cartridge Manifest</span>
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <textarea
              readOnly
              value={exportedXML}
              rows={12}
              className="w-full bg-slate-950 font-mono text-[11px] text-emerald-400 p-3 rounded-xl border border-slate-800 focus:outline-none"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Compatible with Canvas LMS, Moodle, and Blackboard.
              </span>
              <button
                onClick={handleCopyXML}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>{copiedNotification ? 'Copied to Clipboard!' : 'Copy XML Manifest'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
