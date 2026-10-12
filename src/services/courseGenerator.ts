import { Course, Chapter, InterestId, Scene3DType, QuizQuestion, Flashcard } from '../types';
import { taskService } from './taskService';
import { buildProceduralAnimationDoc } from './c3dSceneBuilder';

export interface CourseGenerationParams {
  studentName: string;
  studentGrade: string;
  interestId: InterestId;
  targetTopic: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  customGoalPrompt?: string;
  chapterCount?: number;
  questionsPerChapter?: number;
  preferredSceneType?: Scene3DType;
  useAsyncTaskQueue?: boolean;
  onProgress?: (progress: number, message: string) => void;
}

export class CourseGeneratorService {
  private static instance: CourseGeneratorService;

  private constructor() {}

  public static getInstance(): CourseGeneratorService {
    if (!CourseGeneratorService.instance) {
      CourseGeneratorService.instance = new CourseGeneratorService();
    }
    return CourseGeneratorService.instance;
  }

  /**
   * Generates a complete bespoke course customized for a specific student and their passion
   */
  public async generatePersonalizedCourse(params: CourseGenerationParams): Promise<{ course: Course; isAiGenerated: boolean }> {
    const {
      studentName,
      studentGrade,
      interestId,
      targetTopic,
      difficulty,
      customGoalPrompt,
      chapterCount = 3,
      questionsPerChapter = 3,
      preferredSceneType,
      useAsyncTaskQueue = true,
      onProgress,
    } = params;

    // If async task queue is requested, submit background task with live polling
    if (useAsyncTaskQueue) {
      try {
        if (onProgress) onProgress(10, 'Submitting background task to FastAPI Task Queue...');
        const { taskId } = await taskService.submitTask('generate_course', `Synthesize ${targetTopic} Course`, {
          studentName,
          studentGrade,
          interestId,
          targetTopic,
          difficulty,
          customGoalPrompt,
          chapterCount,
          questionsPerChapter,
        });

        const finishedTask = await taskService.pollTask(taskId, (task) => {
          if (onProgress) onProgress(task.progress, task.stepMessage);
        });

        if (finishedTask.result?.course) {
          const course: Course = finishedTask.result.course;
          // Ensure each chapter has its procedural C3D animation doc
          course.chapters = course.chapters.map((ch) => ({
            ...ch,
            customAnimationDoc: ch.customAnimationDoc || buildProceduralAnimationDoc(ch.sceneType, interestId, ch.title),
          }));
          return { course, isAiGenerated: true };
        }
      } catch (queueErr) {
        console.warn('FastAPI task queue error, trying direct API route or local synthesizer:', queueErr);
      }
    }

    // Direct synchronous backend API attempt
    try {
      if (onProgress) onProgress(40, 'Contacting curriculum synthesis engine...');
      const response = await fetch('/api/generate-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          studentGrade,
          interestId,
          targetTopic,
          difficulty,
          customGoalPrompt,
          chapterCount,
          questionsPerChapter,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.course && Array.isArray(data.course.chapters) && data.course.chapters.length > 0) {
          const course: Course = data.course;
          course.chapters = course.chapters.map((ch) => ({
            ...ch,
            customAnimationDoc: ch.customAnimationDoc || buildProceduralAnimationDoc(ch.sceneType, interestId, ch.title),
          }));
          return { course, isAiGenerated: true };
        }
      }
    } catch (err) {
      console.warn('Backend /api/generate-course unavailable, building rich multi-chapter course locally:', err);
    }

    // Explicit fallback: Use local curriculum synthesizer with requested chapter & quiz counts
    const idSuffix = Math.random().toString(36).substring(2, 7);
    const courseId = `course-custom-${idSuffix}`;

    // Determine appropriate 3D scene type based on topic keywords
    const lower = (targetTopic + ' ' + (customGoalPrompt || '')).toLowerCase();
    let sceneType: Scene3DType = 'python';
    let category = 'Computer Science & Software';

    if (lower.includes('orbit') || lower.includes('space') || lower.includes('gravity') || lower.includes('astro') || lower.includes('rocket')) {
      sceneType = 'orbit';
      category = 'Astrophysics & Orbital Dynamics';
    } else if (lower.includes('neural') || lower.includes('ai') || lower.includes('brain') || lower.includes('deep learning') || lower.includes('synapse')) {
      sceneType = 'neural';
      category = 'Artificial Intelligence & Neural Science';
    } else if (lower.includes('dna') || lower.includes('bio') || lower.includes('gene') || lower.includes('crispr') || lower.includes('cell')) {
      sceneType = 'dna';
      category = 'Molecular Genetics & Biotechnology';
    } else if (lower.includes('quantum') || lower.includes('atom') || lower.includes('electron') || lower.includes('physics') || lower.includes('bohr')) {
      sceneType = 'quantum';
      category = 'Quantum Mechanics & Atomic Physics';
    }

    // Generate interest metaphors
    const getInterestMetaphor = (concept: string): string => {
      switch (interestId) {
        case 'gaming':
          return `In game development: think of ${concept} like player state synchronization across multiplayer server tick rates.`;
        case 'space':
          return `In aerospace exploration: ${concept} mirrors telemetry flight correction calculations during a deep-space gravity assist.`;
        case 'football':
          return `In tactical soccer analytics: ${concept} resembles a high-pressing defensive zonal coverage map adapting to ball position.`;
        case 'cooking':
          return `In gastronomy chemistry: ${concept} acts like precise caramelization temperature thresholds transforming flavor molecules.`;
        case 'anime':
          return `In shonen battle mechanics: ${concept} works like charging a signature elemental aura burst without burning out stamina.`;
        case 'music':
          return `In audio production: ${concept} functions like frequency bandpass equalization shaping harmonic resonance waves.`;
        default:
          return `Empirical conceptual foundation applied to ${concept}.`;
      }
    };

    const chapter1Quizzes: QuizQuestion[] = [
      {
        id: `quiz-${courseId}-1`,
        question: `What is the core principle underlying ${targetTopic}?`,
        interestFraming: {
          gaming: `When optimizing a game engine loop for ${targetTopic}, what is the primary invariant condition?`,
          space: `In mission control telemetry for ${targetTopic}, what critical baseline parameter is constantly monitored?`,
          football: `During a high-stakes match analysis of ${targetTopic}, what key tactical metric determines victory?`,
          cooking: `In high-precision cooking techniques for ${targetTopic}, what primary chemical reaction is regulated?`,
          anime: `When training in the hyperbolic chamber for ${targetTopic}, what inner spiritual law must never be broken?`,
          music: `When synthesizing a clean audio frequency spectrum for ${targetTopic}, what harmonic fundamental is maintained?`,
        },
        options: [
          `Conserved invariant states and deterministic boundary rules that guarantee stability`,
          `Unbounded chaotic mutations that reset variables at random intervals`,
          `Flat linear addition with no consideration of multi-factor dependencies`,
          `Complete deletion of preceding state allocations`,
        ],
        correctAnswer: 0,
        explanation: {
          gaming: `Stability prevents race conditions and stutter in the game tick loop!`,
          space: `Telemetry invariance ensures the spacecraft maintains its projected trajectory.`,
          football: `Defensive shape maintains geometric integrity against offensive overloads.`,
          cooking: `Thermal equilibrium guarantees consistent texture without scorching.`,
          anime: `Chakra containment maintains balance without destabilizing the energy shield.`,
          music: `Resonant phase alignment prevents destructive audio cancellation.`,
        },
        xp: 85,
      },
      {
        id: `quiz-${courseId}-2`,
        question: `How does progressive refinement affect learning mastery in ${targetTopic}?`,
        interestFraming: {
          gaming: `How does grinding incremental XP loops unlock mastery of advanced boss patterns?`,
          space: `How do staged rocket burns optimize delta-V propellant efficiency?`,
          football: `How does repetitive passing drill muscle memory enhance matchday decision speed?`,
          cooking: `How does layering subtle seasoning in stages elevate Michelin-tier culinary depth?`,
          anime: `How does consecutive battle training awaken dormant inner spiritual power?`,
          music: `How does mastering polyrhythmic timing unlock complex musical improvisation?`,
        },
        options: [
          `Iterative feedback reinforces neural pathways and solidifies conceptual schema`,
          `It causes immediate cognitive saturation and permanent loss of prior knowledge`,
          `It only works if performed once without any repetition`,
          `It decreases analytical accuracy over time`,
        ],
        correctAnswer: 0,
        explanation: {
          gaming: `Each boss attempt exposes attack telegraphs, turning reflexes into muscle memory!`,
          space: `Staged burns exploit the Oberth effect for maximum orbital velocity per kg of fuel.`,
          football: `Muscle memory frees up cognitive bandwidth for high-speed pitch vision.`,
          cooking: `Layered reductions build rich umami complexity that single-step cooking cannot match.`,
          anime: `Every battle awakens a deeper understanding of energy control.`,
          music: `Repetition internalizes groove micro-timing into natural intuition.`,
        },
        xp: 90,
      },
    ];

    const chapter1Flashcards: Flashcard[] = [
      {
        id: `fc-${courseId}-1`,
        subject: category,
        concept: `${targetTopic} Core Framework`,
        frontPrompt: `What defines the foundational mechanism of ${targetTopic}?`,
        backExplanation: `The systematic decomposition of complex variables into predictable, stateful components that execute in harmonious sequence.`,
        interestContext: {
          gaming: getInterestMetaphor('item stack state machines'),
          space: getInterestMetaphor('telemetry synchronization'),
          football: getInterestMetaphor('spatial pitch pressing'),
          cooking: getInterestMetaphor('flavor emulsification'),
          anime: getInterestMetaphor('spiritual power equilibrium'),
          music: getInterestMetaphor('multi-track polyrhythms'),
        },
        leitnerBox: 1,
      },
    ];

    const chapters: Chapter[] = [];
    const sceneTypeToUse = preferredSceneType || sceneType;

    for (let c = 1; c <= chapterCount; c++) {
      const chapterId = `ch-${courseId}-${c}`;
      const chapterTitle = c === 1
        ? `Foundations of ${targetTopic}: The Architecture`
        : c === 2
        ? `Dynamic Interactions & Advanced Optimization in ${targetTopic}`
        : `Mastery Module ${c}: High-Throughput Systemic ${targetTopic}`;

      const chapterQuizzes: QuizQuestion[] = [];
      for (let q = 1; q <= questionsPerChapter; q++) {
        chapterQuizzes.push({
          id: `quiz-${chapterId}-${q}`,
          question: q === 1
            ? `What is the core principle underlying Chapter ${c} of ${targetTopic}?`
            : q === 2
            ? `How does progressive parameter tuning optimize performance in Module ${c}?`
            : `Under peak load conditions in ${targetTopic}, which invariant is prioritized?`,
          interestFraming: {
            gaming: `In ${interestId} game development: What invariant prevents stutter in Module ${c}?`,
            space: `In orbital telemetry for ${interestId}: What parameter calibration stabilizes Module ${c}?`,
            football: `In high-tempo football analysis: How does Module ${c} structure space on the pitch?`,
            cooking: `In culinary thermodynamics: How does Module ${c} govern chemical emulsification?`,
            anime: `In tactical martial arts: How does Module ${c} balance energy consumption?`,
            music: `In acoustic sound synthesis: How does Module ${c} eliminate phase cancellation?`,
          },
          options: [
            `Conserved invariant states and deterministic boundary rules that guarantee stability`,
            `Unbounded chaotic mutations that reset variables at random intervals`,
            `Flat linear addition with no consideration of multi-factor dependencies`,
            `Complete deletion of preceding state allocations`,
          ],
          correctAnswer: 0,
          explanation: {
            gaming: `Stability prevents race conditions and stutter in the game tick loop!`,
            space: `Telemetry invariance ensures the spacecraft maintains its projected trajectory.`,
            football: `Defensive shape maintains geometric integrity against offensive overloads.`,
            cooking: `Thermal equilibrium guarantees consistent texture without scorching.`,
            anime: `Chakra containment maintains balance without destabilizing the energy shield.`,
            music: `Resonant phase alignment prevents destructive audio cancellation.`,
          },
          xp: 80 + q * 5,
        });
      }

      chapters.push({
        id: chapterId,
        title: chapterTitle,
        description: `Explore ${targetTopic} Part ${c} through personalized 3D models and interactive simulations customized for ${studentName} through ${interestId.toUpperCase()}.`,
        durationMinutes: 15 + c * 5,
        sceneType: sceneTypeToUse,
        priceUSD: 0,
        unlocked: c === 1,
        completed: false,
        quizzes: chapterQuizzes,
        flashcards: [
          {
            id: `fc-${chapterId}-1`,
            subject: category,
            concept: `${targetTopic} Principle ${c}`,
            frontPrompt: `What defines the key mechanism of Module ${c}?`,
            backExplanation: `The systematic decomposition of complex variables into predictable, stateful components that execute in harmonious sequence.`,
            interestContext: {
              gaming: getInterestMetaphor(`item stack state machines in module ${c}`),
              space: getInterestMetaphor(`telemetry synchronization in module ${c}`),
              football: getInterestMetaphor(`spatial pitch pressing in module ${c}`),
              cooking: getInterestMetaphor(`flavor emulsification in module ${c}`),
              anime: getInterestMetaphor(`spiritual power equilibrium in module ${c}`),
              music: getInterestMetaphor(`multi-track polyrhythms in module ${c}`),
            },
            leitnerBox: 1,
          },
        ],
        customAnimationDoc: buildProceduralAnimationDoc(sceneTypeToUse, interestId, chapterTitle),
      });
    }

    const newCourse: Course = {
      id: courseId,
      title: `${targetTopic} (Tailored for ${studentName})`,
      category,
      description: `Bespoke adaptive curriculum synthesized dynamically for ${studentName} (${studentGrade}). Concepts, 3D simulations, and assessments are tailored through the passion lens of ${interestId.toUpperCase()}.`,
      fieldSpecialist: {
        name: 'Dr. Evelyn Mercer & AI Curriculum Synthesizer',
        credential: 'SME Lead & Cognitive Systems Architect',
        institution: 'CogniSphere Adaptive Pedagogy Institute',
      },
      level: difficulty,
      rating: 5.0,
      reviewsCount: 1,
      enrolledStudents: 1,
      priceUSD: 0, // Generated free for the student!
      colorTheme: 'from-indigo-600 via-purple-600 to-pink-600',
      badges: ['Personalized AI Masterwork', `${interestId.toUpperCase()} Specialized`, 'Bespoke Track'],
      isPersonalized: true,
      generatedForStudent: studentName,
      generatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      customInterestContext: interestId,
      studentGoalPrompt: customGoalPrompt || targetTopic,
      glbxPackage: {
        formatVersion: 'GLBX-v3.4-BESPOKE',
        packageId: `PKG-CUSTOM-${idSuffix.toUpperCase()}.glbx`,
        courseTitle: `${targetTopic} Customized 3D Lab`,
        nodeCount: 180,
        geometryEngine: 'ThreeJS_WebGL2',
        lmsInteroperability: 'LTI_v1.3',
        sizeBytes: 15420100,
        checksum: `sha256_${idSuffix}_${Date.now()}`,
        lastCuratedBySME: new Date().toISOString(),
        adaptiveParameters: {
          maxLOD: 4,
          physicsSimulationFPS: 60,
          interestMeshVariantCount: 6,
        },
      },
      chapters,
    };

    return { course: newCourse, isAiGenerated: false };
  }

  /**
   * Generates today's personalized daily quest lesson for the student
   */
  public generateDailyLesson(course: Course, studentName: string, interestId: InterestId, focusScore: number): Chapter {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const questId = `daily-${Date.now()}`;

    const focusStatus = focusScore >= 85 ? 'High-Performance' : 'Adaptive Recovery';

    return {
      id: questId,
      title: `Daily Quest (${today}): ${course.title.split('(')[0].trim()} Accelerator`,
      description: `Targeted 15-minute daily mastery quest calibrated to your ${focusScore}% focus score. Personal metaphors tuned for ${interestId.toUpperCase()}.`,
      durationMinutes: 15,
      sceneType: course.chapters[0]?.sceneType || 'python',
      priceUSD: 0,
      unlocked: true,
      completed: false,
      quizzes: [
        {
          id: `quiz-daily-${questId}`,
          question: `Today's Daily Checkpoint: How do you identify the optimal pathway in ${course.title.split('(')[0].trim()}?`,
          interestFraming: {
            gaming: `In today's daily dungeon run, what provides the highest XP loot per hour?`,
            space: `In today's orbital trajectory telemetry, what burn timing minimizes fuel cost?`,
            football: `In today's training match, what passing sequence creates the highest expected goal probability?`,
            cooking: `In today's chef special, what flavor combination creates the most harmonious palate?`,
            anime: `In today's training duel, how do you neutralize your rival's signature offensive strike?`,
            music: `In today's beat session, what syncopation pattern gives the groove maximum bounce?`,
          },
          options: [
            `Formulating the problem with clear boundary constraints and minimizing unnecessary compute`,
            `Random trial without analyzing failure feedback`,
            `Skipping fundamental steps to guess the outcome`,
            `Repeating outdated configurations without adjustment`,
          ],
          correctAnswer: 0,
          explanation: {
            gaming: `Minimizing wasted ticks ensures maximum dungeon clear speed!`,
            space: `Optimal delta-V timing saves vital spacecraft propellant.`,
            football: `Triangulating passes unlocks space through defensive blocks.`,
            cooking: `Balance of acid and salt unlocks clean flavors.`,
            anime: `Anticipating flow counters the attack with minimal stamina.`,
            music: `Rhythmic syncopation locks the bass into the kick drum groove.`,
          },
          xp: 120,
        },
      ],
      flashcards: [
        {
          id: `fc-daily-${questId}`,
          subject: course.category,
          concept: `Daily Mastery Retention`,
          frontPrompt: `What is the core takeaway from today's daily focus session?`,
          backExplanation: `Consistent daily interaction with 3D models combined with passion-aligned metaphors multiplies long-term memory retention by up to 300%.`,
          interestContext: {
            gaming: `Grinding 15 minutes of daily dailies compounds faster than an 8-hour binge once a month!`,
            space: `Small continuous ion thruster burns reach interplanetary speeds over time.`,
            football: `Daily 15-minute ball-touch drills create world-class touch.`,
            cooking: `Tasting prep broth daily refines a chef's palate sensitivity.`,
            anime: `Daily katas build instinctual warrior reflexes.`,
            music: `Daily 15-minute rudiment practice builds flawless groove.`,
          },
          leitnerBox: 1,
        },
      ],
    };
  }
}

export const courseGenerator = CourseGeneratorService.getInstance();
