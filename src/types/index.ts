export type UserRole = 'student' | 'instructor' | 'parent';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  avatarEmoji?: string;
  token?: string;
  grade?: string;
  institution?: string;
  childrenNames?: string[];
  lastLogin?: string;
  // Parent-Student linkage
  parentAccountId?: string;
  parentEmail?: string;
  parentName?: string;
  studentAccountIds?: string[];
  students?: Array<{
    id: string;
    name: string;
    email: string;
    grade?: string;
  }>;
}

export type InterestId = 'gaming' | 'space' | 'football' | 'cooking' | 'anime' | 'music';

export interface StudentInterest {
  id: InterestId;
  label: string;
  emoji: string;
  color: string;
  bgGradient: string;
  tagline: string;
  description: string;
}

export type Scene3DType = 'orbit' | 'neural' | 'dna' | 'python' | 'quantum';

export interface Interactive3DNode {
  id: string;
  name: string;
  description: string;
  position: [number, number, number];
  color: string;
  interestAnnotation: Record<InterestId, string>;
}

export interface ProprietaryGLBXPackage {
  formatVersion: string; // e.g. "GLBX-v3.4"
  packageId: string;
  courseTitle: string;
  nodeCount: number;
  geometryEngine: 'ThreeJS_WebGL2';
  lmsInteroperability: 'SCORM_2004' | 'LTI_v1.3' | 'xAPI_TinCan';
  sizeBytes: number;
  checksum: string;
  lastCuratedBySME: string;
  adaptiveParameters: {
    maxLOD: number;
    physicsSimulationFPS: number;
    interestMeshVariantCount: number;
  };
}

export interface Flashcard {
  id: string;
  subject: string;
  concept: string;
  frontPrompt: string;
  backExplanation: string;
  interestContext: Record<InterestId, string>;
  leitnerBox: number; // 1-5
  reviewStatus?: 'again' | 'hard' | 'good' | 'easy';
  lastReviewedAt?: number;
  nextReviewAt?: number;
}

// Async Task Processing Types (FastAPI Task Queue)
export type TaskStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface AsyncTask<T = any> {
  id: string;
  name: string;
  type: 'generate_course' | 'compile_animation' | 'batch_sync' | 'export_glbx';
  status: TaskStatus;
  progress: number; // 0 to 100
  stepMessage: string;
  createdAt: string;
  completedAt?: string;
  payload?: any;
  result?: T;
  error?: string;
}

// Custom 3D SVG & Three.js Declarative Animation Format (.c3d.json)
export interface Three3DGeometryNode {
  id: string;
  type: 'sphere' | 'box' | 'cylinder' | 'torus' | 'particles' | 'helix' | 'ring';
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  color: string;
  opacity?: number;
  wireframe?: boolean;
  label?: string;
  interestThemeSkin?: Partial<Record<InterestId, { color: string; label: string; scale?: [number, number, number] }>>;
}

export interface SVG3DLayerNode {
  id: string;
  d: string; // SVG path command (e.g. M 100 200 C ...)
  stroke: string;
  strokeWidth: number;
  fill?: string;
  dashArray?: string;
  glow?: boolean;
  pulseSpeed?: number;
  annotationText?: string;
  interestAnnotation?: Partial<Record<InterestId, string>>;
}

export interface CogniAnimationKeyframe {
  stepIndex: number;
  title: string;
  subheading: string;
  narration: string;
  interestNarration?: Partial<Record<InterestId, string>>;
  cameraCoordinates: [number, number, number];
  targetLookAt: [number, number, number];
  activeHotspotId?: string;
  activeGeometryIds: string[];
  activeSvgIds: string[];
  durationSec: number;
}

export interface CogniSceneDoc {
  formatVersion: 'C3D-v2.0';
  sceneId: string;
  conceptName: string;
  sceneType: Scene3DType;
  threeNodes: Three3DGeometryNode[];
  svgLayers: SVG3DLayerNode[];
  keyframes: CogniAnimationKeyframe[];
  interestOverrides: Partial<Record<InterestId, {
    themeTitle: string;
    ambientColor: string;
    metaphorExplanation: string;
  }>>;
}

export interface QuizQuestion {
  id: string;
  question: string;
  interestFraming: Record<InterestId, string>;
  options: string[];
  correctAnswer: number;
  explanation: Record<InterestId, string>;
  xp: number;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  sceneType: Scene3DType;
  priceUSD: number;
  unlocked: boolean;
  completed: boolean;
  quizzes: QuizQuestion[];
  flashcards: Flashcard[];
  customAnimationDoc?: CogniSceneDoc;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  fieldSpecialist: {
    name: string;
    credential: string;
    institution: string;
  };
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  reviewsCount: number;
  enrolledStudents: number;
  priceUSD: number;
  glbxPackage: ProprietaryGLBXPackage;
  chapters: Chapter[];
  colorTheme: string;
  badges: string[];
  isPersonalized?: boolean;
  generatedForStudent?: string;
  generatedAt?: string;
  customInterestContext?: InterestId;
  studentGoalPrompt?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  timeSlot: string;
  durationMinutes: number;
  presenceRate: number; // 0-100%
  focusScorePct: number; // 0-100%
  distractionEvents: number;
  status: 'Present' | 'Late' | 'Distracted' | 'Absence';
  verificationMethod: 'Session Activity & Engagement Guard' | 'Headless Camera & Session Guard' | 'Biometric Eye-Gaze Sensor' | 'Manual Log';
}

export interface BehavioralTelemetry {
  timestamp: number;
  presence: boolean;
  eyeGazeAligned: boolean;
  gazeCoordinates: { x: number; y: number };
  attentionScore: number; // 0 - 100
  blinkPerMin: number;
  headPose: 'Centered' | 'Tilted Left' | 'Tilted Right' | 'Looking Down';
  cognitiveLoad: 'Optimal' | 'Mild Fatigue' | 'High Strain';
  alertFlag?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  grade: string;
  selectedInterest: InterestId;
  xp: number;
  level: number;
  streakDays: number;
  completedLessonsCount: number;
  dailyGoalMinutes: number;
  todayMinutes: number;
  coins: number;
  activeCourseId: string;
  activeChapterId: string;
}

export interface ParentChildData {
  id: string;
  name: string;
  avatarEmoji: string;
  grade: string;
  currentCourse: string;
  todayFocusMinutes: number;
  attendanceRatePct: number;
  weeklyAvgFocus: number;
  xp: number;
  streakDays: number;
  distractionCountToday: number;
  attendanceHistory: AttendanceRecord[];
}

export interface ParentMessage {
  id: string;
  senderName: string;
  senderRole: 'AI Mentor' | 'Field Specialist' | 'Parent';
  timestamp: string;
  subject: string;
  message: string;
  isAutomatedReport?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  billingPeriod: 'monthly' | 'yearly';
  priceUSD: number;
  features: string[];
  recommended?: boolean;
  tier: 'Explorer' | 'Pro Mastery' | 'Annual Scholar';
}

export interface MentorshipPackage {
  id: string;
  name: string;
  hours: number;
  priceUSD: number;
  description: string;
  agentRole: string;
  features: string[];
}

export interface LMSConfig {
  lmsName: 'Canvas LMS' | 'Blackboard Learn' | 'Moodle Core' | 'Google Classroom';
  endpoint: string;
  clientKey: string;
  isConnected: boolean;
  lastSync: string;
  syncRoster: boolean;
  syncGrades: boolean;
  webhookStatus: 'Active' | 'Idle' | 'Error';
}
