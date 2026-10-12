import React, { useState, useEffect, useRef } from 'react';
import { Scene3DType, InterestId } from '../../types';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Sparkles,
  Info,
  Maximize2,
  CheckCircle2,
  HelpCircle,
  Eye,
  Layers,
  Zap,
} from 'lucide-react';
import { Interactive3DCanvas } from '../three/Interactive3DCanvas';
import { CogniSceneInterpreter } from '../animation/CogniSceneInterpreter';
import { buildProceduralAnimationDoc } from '../../services/c3dSceneBuilder';
import { CogniSceneDoc } from '../../types';

interface AnimatedConceptPlayerProps {
  sceneType: Scene3DType;
  interestId: InterestId;
  courseTitle: string;
  chapterTitle: string;
  targetStepIndex?: number;
  onStepChange?: (stepIndex: number) => void;
  customAnimationDoc?: CogniSceneDoc;
}

interface AnimationStep {
  stepNumber: number;
  title: string;
  subheading: string;
  teacherNarration: string;
  interestDetail: string;
  keyCallout: string;
  durationSec: number;
}

export const AnimatedConceptPlayer: React.FC<AnimatedConceptPlayerProps> = ({
  sceneType,
  interestId,
  courseTitle,
  chapterTitle,
  targetStepIndex,
  onStepChange,
  customAnimationDoc,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [viewMode, setViewMode] = useState<'c3d' | 'animated' | '3d'>('c3d');
  const [progressPct, setProgressPct] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  const activeC3DDoc = customAnimationDoc || buildProceduralAnimationDoc(sceneType, interestId, chapterTitle);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof targetStepIndex === 'number' && targetStepIndex >= 0) {
      setCurrentStep(targetStepIndex);
      setIsPlaying(false);
    }
  }, [targetStepIndex]);

  // Generate pedagogical animation steps tailored to the concept and interest
  const getAnimationSteps = (): AnimationStep[] => {
    switch (sceneType) {
      case 'python':
        return [
          {
            stepNumber: 1,
            title: 'Variable Declaration & Stack Allocation',
            subheading: 'Initializing the reference tag in hardware Stack memory',
            teacherNarration: `When Python executes an assignment, it does not store the data inside the variable name. Instead, it allocates a pointer slot on the Call Stack that will point to the actual object.`,
            interestDetail:
              interestId === 'gaming'
                ? '🎮 Minecraft / Gaming: Think of this like your hotbar item slot holding a reference ID to an inventory chest block in world memory.'
                : interestId === 'football'
                ? '⚽ Football Tactics: Like a coach assigning jersey #10 on the team board, pointing to the player coordinate on the pitch.'
                : interestId === 'space'
                ? '🚀 Space Flight: Flight computer creates telemetry label "THRUSTER_ALPHA" pointing to actuator memory buffer.'
                : interestId === 'cooking'
                ? '🍳 Culinary Science: Labeling a prep station ticket that references the marinade basin in the pantry.'
                : interestId === 'anime'
                ? '⚡ Anime Powers: Inscribing a chakra summon scroll linked directly to the sealed entity reservoir.'
                : '🎵 Audio Production: Assigning a MIDI channel track header that routes to the synthesizer engine buffer.',
            keyCallout: 'Stack Frame: Memory Address 0x7FFF_2104 allocated [8 bytes]',
            durationSec: 6,
          },
          {
            stepNumber: 2,
            title: 'Object Instantiation on the Heap',
            subheading: 'Dynamic memory allocation for the mutable payload',
            teacherNarration: `The Python memory manager asks the OS for space in the Heap to construct the object header, type pointer (PyTypeObject), reference counter (ob_refcnt = 1), and payload elements.`,
            interestDetail:
              interestId === 'gaming'
                ? '🎮 In Gaming: The 3D diamond sword entity is spawned into the world chunk memory pool.'
                : interestId === 'football'
                ? '⚽ In Football: The physical athlete enters the designated tactical zone with attributes and stamina.'
                : interestId === 'space'
                ? '🚀 In Space: The actual orbital telemetry matrix with 6-degrees-of-freedom telemetry is stored in RAM.'
                : interestId === 'cooking'
                ? '🍳 In Cooking: The master spice emulsification is prepared in the heat-regulated mixing vessel.'
                : interestId === 'anime'
                ? '⚡ In Anime: The raw energy form coalesces into physical manifestation in the battlefield arena.'
                : '🎵 In Music: The 48kHz audio sample waveform is loaded into physical RAM memory.',
            keyCallout: 'Heap Object: PyListObject [refcnt: 1, type: list, capacity: 4]',
            durationSec: 6,
          },
          {
            stepNumber: 3,
            title: 'Pointer Binding & Reference Resolution',
            subheading: 'Connecting the stack variable to the heap address',
            teacherNarration: `The variable now stores the exact memory address (e.g. 0x1028AF). If a second variable is assigned to the first (b = a), NO data is copied—both pointers reference the exact same heap memory!`,
            interestDetail:
              interestId === 'gaming'
                ? '🎮 In Gaming: Both Player 1 and Player 2 hotbars now target the SAME shared clan inventory chest! Modifying one modifies both!'
                : interestId === 'football'
                ? '⚽ In Football: Both striker and winger look at the same ball trajectory vector coordinate.'
                : interestId === 'space'
                ? '🚀 In Space: Ground Station and Satellite telemetry both point to the same trajectory vector.'
                : interestId === 'cooking'
                ? '🍳 In Cooking: Head chef and sous chef both work from the exact same reduction saucepan.'
                : interestId === 'anime'
                ? '⚡ In Anime: Two warriors share a linked telepathic sensory field; damage to one affects both.'
                : '🎵 In Music: Two fader tracks route to the exact same audio bus channel.',
            keyCallout: 'Pointer Link: Variable -> Heap Address 0x1028AF [Shared Reference]',
            durationSec: 7,
          },
          {
            stepNumber: 4,
            title: 'Garbage Collection & Dereferencing',
            subheading: 'Reclaiming memory when reference count drops to zero',
            teacherNarration: `When variables go out of scope or are reassigned, reference counter drops (ob_refcnt = 0). The cyclic garbage collector instantly reclaims the heap memory block to prevent memory leaks!`,
            interestDetail:
              interestId === 'gaming'
                ? '🎮 In Gaming: Mob entities that despawn have their memory wiped so your game runs at smooth 60 FPS without lag.'
                : interestId === 'football'
                ? '⚽ In Football: Resetting the formation board after a play cleans up temporary passing lines.'
                : interestId === 'space'
                ? '🚀 In Space: Expended rocket stage telemetry arrays are flushed from the guidance memory.'
                : interestId === 'cooking'
                ? '🍳 In Cooking: Clearing the cutting station and sanitizing dishes before starting the next service course.'
                : interestId === 'anime'
                ? '⚡ In Anime: Expelling residual exhaust smoke once the ultimate attack has concluded.'
                : '🎵 In Music: Clearing unused audio clip cache from DAW RAM to eliminate audio buffer underruns.',
            keyCallout: 'Ref Count = 0 -> Free Memory Block [Allocated 0 bytes]',
            durationSec: 6,
          },
        ];

      case 'orbit':
        return [
          {
            stepNumber: 1,
            title: 'Gravitational Wells & Circular Velocity',
            subheading: 'Centripetal gravity balancing tangential inertial velocity',
            teacherNarration: `In Keplerian orbit, an object is continuously falling toward the central mass, but its forward tangential velocity is so high that the ground curves away at the exact same rate!`,
            interestDetail:
              interestId === 'gaming'
                ? '🎮 In Gaming: Like a character holding max strafe velocity around a boss while staying outside the melee blast radius.'
                : interestId === 'football'
                ? '⚽ In Football: Like curling a corner kick with top-spin where air drag and gravity create an exact curved arc.'
                : interestId === 'space'
                ? '🚀 In Space: Low Earth Orbit requires exactly 7.8 km/s velocity to counteract Earth 9.8 m/s² gravity.'
                : interestId === 'cooking'
                ? '🍳 In Cooking: Swirling wine in a decanter: centrifugal force pushes liquid up the walls while gravity pulls it down.'
                : interestId === 'anime'
                ? '⚡ In Anime: Orbiting energy orbs spinning steadily around a master warrior defensive perimeter.'
                : '🎵 In Music: Standing sound waves rotating along a circular speaker horn with zero phase drift.',
            keyCallout: 'V_circ = sqrt(G * M / r) = 7,784 m/s',
            durationSec: 6,
          },
          {
            stepNumber: 2,
            title: 'Periapsis Acceleration & Gravitational Slingshot',
            subheading: 'Transferring planetary momentum via hyperbolic flyby',
            teacherNarration: `During a gravity assist, the probe enters the planet gravitational sphere of influence from behind. As the planet pulls the probe, the probe steals a tiny fraction of the planet orbital momentum!`,
            interestDetail:
              interestId === 'gaming'
                ? '🎮 In Gaming: Hitting a boost pad on a racing track or using a grapple swing to double your launch speed.'
                : interestId === 'football'
                ? '⚽ In Football: A give-and-go pass where the striker uses a defender momentum to dart into open space.'
                : interestId === 'space'
                ? '🚀 In Space: Voyager 2 stole orbital energy from Jupiter to sling all the way out of the solar system.'
                : interestId === 'cooking'
                ? '🍳 In Cooking: Using the residual kinetic heat of a cast-iron skillet to caramelize onions in seconds.'
                : interestId === 'anime'
                ? '⚡ In Anime: Parrying the antagonist brute strike to redirect their kinetic force into a counter-blow.'
                : '🎵 In Music: Using audio compressor side-chaining where the kick drum punches the bass synth into high energy.',
            keyCallout: 'Delta-V Gained = 2 * V_planet * sin(theta/2) [No Fuel Expended]',
            durationSec: 6,
          },
          {
            stepNumber: 3,
            title: 'Hohmann Elliptical Transfer',
            subheading: 'Two engine burns connecting two concentric orbits',
            teacherNarration: `To transfer between orbits efficiently, burn prograde at periapsis to raise apoapsis. Then coast along the half-ellipse transfer orbit and perform the circularization burn.`,
            interestDetail:
              interestId === 'gaming'
                ? '🎮 In Gaming: Jumping between two moving platforms with a single double-jump timed at the apex of the arc.'
                : interestId === 'football'
                ? '⚽ In Football: A long switch-field pass lofted across the midfield corridor to a sprinting winger.'
                : interestId === 'space'
                ? '🚀 In Space: The standard transfer method for journeys from Earth to Mars using minimum fuel.'
                : interestId === 'cooking'
                ? '🍳 In Cooking: Transferring a pan-seared steak directly into a 400°F oven for gentle core heat equilibration.'
                : interestId === 'anime'
                ? '⚡ In Anime: Shifting from defensive stance into high-speed flash-step trajectory across the field.'
                : '🎵 In Music: Sweeping a low-pass filter frequency from 200 Hz to 12 kHz in a 4-bar buildup.',
            keyCallout: 'Delta-V_total = Delta-V_1 + Delta-V_2 [Minimum Energy Orbit]',
            durationSec: 6,
          },
          {
            stepNumber: 4,
            title: 'Escape Velocity & Parabolic Trajectory',
            subheading: 'Total mechanical energy equals zero: breaking free of gravity',
            teacherNarration: `When kinetic energy exceeds gravitational potential energy, the trajectory changes from a closed ellipse into an open hyperbola. The object will never return!`,
            interestDetail:
              interestId === 'gaming'
                ? '🎮 In Gaming: Reaching terminal escape speed to breach the sky boundary and explore deep space.'
                : interestId === 'football'
                ? '⚽ In Football: A strike struck with such explosive force that it clears the stadium crossbar.'
                : interestId === 'space'
                ? '🚀 In Space: V_escape = 11.2 km/s from Earth surface, venturing into interplanetary space.'
                : interestId === 'cooking'
                ? '🍳 In Cooking: Reaching smoke point where volatile aromatic compounds escape entirely into the vapor phase.'
                : interestId === 'anime'
                ? '⚡ In Anime: Breaking through the physical realm barrier into transcendent dimensional space.'
                : '🎵 In Music: Exceeding 0 dB digital clipping limit, entering analog saturation resonance.',
            keyCallout: 'V_esc = sqrt(2 * G * M / r) = 11,186 m/s [Open Hyperbola]',
            durationSec: 6,
          },
        ];

      default:
        return [
          {
            stepNumber: 1,
            title: 'Input Signal & Synapse Receptive Field',
            subheading: 'Digitizing sensory inputs into normalized activation tensors',
            teacherNarration: `Sensory inputs are encoded into floating-point numerical vectors. Each synapse carries an adjustable scalar weight that either amplifies or dampens the electrical signal.`,
            interestDetail:
              interestId === 'gaming'
                ? '🎮 In Gaming: Controller joystick vectors (X, Y) and button state inputs mapped to character physics.'
                : interestId === 'football'
                ? '⚽ In Football: Optical cameras tracking player X,Y coordinates and speed vectors on the field.'
                : interestId === 'space'
                ? '🚀 In Space: Gyroscope, star tracker, and solar panel angle sensors digitizing attitude data.'
                : interestId === 'cooking'
                ? '🍳 In Cooking: Flavor profiles rated across sweet, salty, sour, bitter, and umami scales.'
                : interestId === 'anime'
                ? '⚡ In Anime: Gauging enemy aura density, strike velocity, and spiritual pressure.'
                : '🎵 In Music: Splitting raw acoustic sound into 128 discrete mel-spectrogram frequency bins.',
            keyCallout: 'Vector X = [x1, x2, ... xn], Weights W = [w1, w2, ... wn]',
            durationSec: 6,
          },
          {
            stepNumber: 2,
            title: 'Linear Aggregation & Dot Product Sum',
            subheading: 'Summing weighted inputs plus bias: z = W · X + b',
            teacherNarration: `The artificial neuron computes the dot product of the input vector with its weight matrix, adding a bias scalar to shift the activation threshold up or down.`,
            interestDetail:
              interestId === 'gaming'
                ? '🎮 In Gaming: Calculating total character damage = (Attack Power * Weapon Multiplier) + Armor Bonus.'
                : interestId === 'football'
                ? '⚽ In Football: Expected Goals (xG) calculation combining shot angle, distance, and defender density.'
                : interestId === 'space'
                ? '🚀 In Space: Attitude control summing thruster torque contributions to maintain stability.'
                : interestId === 'cooking'
                ? '🍳 In Cooking: Summing spice concentrations to achieve perfect harmonic flavor balance.'
                : interestId === 'anime'
                ? '⚡ In Anime: Gathering spiritual energy from body cells into a single focal point before release.'
                : '🎵 In Music: Summing multitrack instruments on a mixing console with individual volume faders.',
            keyCallout: 'Net Pre-activation: z = sum(w_i * x_i) + b = 2.45',
            durationSec: 6,
          },
          {
            stepNumber: 3,
            title: 'Non-Linear Activation & Threshold Firing',
            subheading: 'Applying ReLU / Sigmoid to introduce non-linear decision boundaries',
            teacherNarration: `Without non-linear activation functions, a 100-layer neural network collapses into a single simple linear regression! ReLU f(z) = max(0, z) allows the network to learn complex shapes and logic.`,
            interestDetail:
              interestId === 'gaming'
                ? '🎮 In Gaming: Hitbox collision trigger: if overlap depth > 0, trigger hit animation; otherwise do nothing.'
                : interestId === 'football'
                ? '⚽ In Football: Offside rule binary decision: if attacker ahead of second-to-last defender, whistle blows!'
                : interestId === 'space'
                ? '🚀 In Space: Solar flare protection switch: trip circuit breaker if voltage exceeds safe threshold.'
                : interestId === 'cooking'
                ? '🍳 In Cooking: Egg yolk protein coagulation: liquid below 65°C, instantly sets into custard above 68°C.'
                : interestId === 'anime'
                ? '⚡ In Anime: Activating Super Saiyan state only after emotional anger crosses the critical threshold.'
                : '🎵 In Music: Audio noise gate plugin: silence background noise below -40 dB, let clear voice through.',
            keyCallout: 'Activation: a = max(0, z) = ReLU(2.45) = 2.45 [Neuron Fires!]',
            durationSec: 6,
          },
          {
            stepNumber: 4,
            title: 'Backpropagation & Gradient Descent Optimization',
            subheading: 'Computing partial derivatives and updating weights via chain rule',
            teacherNarration: `When the prediction produces an error loss, backpropagation applies the calculus chain rule backward through every layer to adjust each synapse weight in the direction of lower error!`,
            interestDetail:
              interestId === 'gaming'
                ? '🎮 In Gaming: AI bot learns from player defeat, tuning dodge timing until it becomes unbeatable.'
                : interestId === 'football'
                ? '⚽ In Football: Team reviewing post-match video analysis, adjusting defensive line positioning for next match.'
                : interestId === 'space'
                ? '🚀 In Space: Kalman filter tuning navigation estimates as new radio star observations arrive.'
                : interestId === 'cooking'
                ? '🍳 In Cooking: Chef tasting the broth, adding a pinch of salt to perfectly balance acidity.'
                : interestId === 'anime'
                ? '⚡ In Anime: Warrior analyzing enemy counterattacks during battle, adapting technique on the fly.'
                : '🎵 In Music: Auto-tune adjusting vocal pitch offset in real-time to match perfect musical pitch.',
            keyCallout: 'Weight Update: W_new = W_old - lr * (dLoss / dW)',
            durationSec: 6,
          },
        ];
    }
  };

  const steps = getAnimationSteps();
  const currentStepData = steps[currentStep] || steps[0];

  // Speech narration helper
  useEffect(() => {
    if (speechEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentStepData.teacherNarration);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentStep, speechEnabled]);

  // Animation timeline ticker
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = 100;
    const stepDurationMs = currentStepData.durationSec * 1000 / playbackSpeed;
    let elapsed = 0;

    timerRef.current = window.setInterval(() => {
      elapsed += intervalMs;
      const pct = Math.min(100, Math.round((elapsed / stepDurationMs) * 100));
      setProgressPct(pct);

      if (elapsed >= stepDurationMs) {
        if (currentStep < steps.length - 1) {
          setCurrentStep((prev) => {
            const next = prev + 1;
            if (onStepChange) onStepChange(next);
            return next;
          });
          setProgressPct(0);
        } else {
          setIsPlaying(false);
          setProgressPct(100);
        }
      }
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentStep, playbackSpeed, currentStepData.durationSec, steps.length, onStepChange]);

  const handleStepJump = (idx: number) => {
    setCurrentStep(idx);
    setProgressPct(0);
    if (onStepChange) onStepChange(idx);
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setProgressPct(0);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setProgressPct(0);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setProgressPct(0);
    setIsPlaying(true);
  };

  return (
    <div className="bg-slate-900/95 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Top Header: Topic, Mode Switcher, Speed & Audio */}
      <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-indigo-400">
                Interactive Animated Lesson Explainer
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold capitalize">
                {interestId} Context
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>{chapterTitle}</span>
            </h3>
          </div>
        </div>

        {/* View Mode (Custom 3D SVG Interpreter / Animated 2D Concept / 3D WebGL Mesh) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('c3d')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'c3d'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>3D SVG & Three.js (C3D Engine)</span>
            </button>
            <button
              onClick={() => setViewMode('animated')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'animated'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Interactive Explainer</span>
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                viewMode === '3d'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-cyan-300" />
              <span>3D WebGL Mesh</span>
            </button>
          </div>

          {/* Voice Narration Toggle */}
          <button
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              speechEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title={speechEnabled ? 'Teacher Voice Active' : 'Enable AI Teacher Voice'}
          >
            {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Visual Animation Stage */}
      {viewMode === 'c3d' ? (
        <CogniSceneInterpreter
          sceneDoc={activeC3DDoc}
          interestId={interestId}
        />
      ) : viewMode === '3d' ? (
        <Interactive3DCanvas
          sceneType={sceneType}
          interestId={interestId}
          courseTitle={courseTitle}
          chapterTitle={chapterTitle}
        />
      ) : (
        <div className="relative w-full h-[380px] bg-gradient-to-b from-slate-950 via-[#0d1322] to-slate-950 flex flex-col justify-between p-6 select-none overflow-hidden">
          {/* Animated Background Grid & Particles */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <div className="w-full h-full bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px]" />
          </div>

          {/* Top Status & Concept Callout Overlay */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 bg-slate-900/90 border border-indigo-500/40 px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-mono font-bold text-indigo-300">
                Step {currentStep + 1} of {steps.length}: {currentStepData.title}
              </span>
            </div>

            <div className="bg-slate-900/90 border border-amber-500/30 px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-md text-[11px] font-mono text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentStepData.keyCallout}</span>
            </div>
          </div>

          {/* Central Interactive Animation Visualizer tailored to sceneType */}
          <div className="relative z-10 my-auto flex items-center justify-center">
            {sceneType === 'python' && (
              <div className="w-full max-w-2xl bg-slate-900/80 border border-slate-700/80 rounded-2xl p-5 shadow-2xl backdrop-blur-lg grid grid-cols-2 gap-6">
                {/* Stack Memory Column */}
                <div className="bg-slate-950/80 border border-blue-500/40 rounded-xl p-4 flex flex-col items-center">
                  <div className="text-[11px] font-mono uppercase tracking-wider font-bold text-blue-400 mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>Call Stack [LIFO]</span>
                  </div>
                  <div className="w-full space-y-2">
                    <div
                      onClick={() => setActiveHotspot('stack_var')}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                        currentStep >= 0
                          ? 'bg-blue-600/20 border-blue-400 text-blue-200 shadow-lg scale-102 ring-1 ring-blue-500/50'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="font-mono font-bold flex justify-between">
                        <span>var: inventory_list</span>
                        <span className="text-[10px] text-blue-400">0x7FFF_2104</span>
                      </div>
                      <div className="text-[11px] text-blue-300 mt-1">
                        Pointer value: <span className="font-mono font-bold">0x1028AF</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 font-mono">
                      <span>frame: main_exec_scope</span>
                    </div>
                  </div>
                </div>

                {/* Heap Memory Column */}
                <div className="bg-slate-950/80 border border-purple-500/40 rounded-xl p-4 flex flex-col items-center relative">
                  <div className="text-[11px] font-mono uppercase tracking-wider font-bold text-purple-400 mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span>Heap Allocation Pool</span>
                  </div>

                  <div
                    onClick={() => setActiveHotspot('heap_obj')}
                    className={`w-full p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      currentStep >= 1
                        ? 'bg-purple-600/20 border-purple-400 text-purple-200 shadow-xl scale-102 ring-1 ring-purple-500/50 animate-pulse'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="font-mono font-bold flex justify-between">
                      <span>PyListObject (Address: 0x1028AF)</span>
                      <span className="text-[10px] text-purple-300">
                        {currentStep >= 3 ? 'Ref: 0' : 'Ref: 1'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 mt-2 text-center font-mono text-[10px]">
                      <div className="bg-purple-950/80 border border-purple-500/30 p-1.5 rounded">
                        [0] "item_1"
                      </div>
                      <div className="bg-purple-950/80 border border-purple-500/30 p-1.5 rounded">
                        [1] "item_2"
                      </div>
                      <div className="bg-purple-950/80 border border-purple-500/30 p-1.5 rounded">
                        [2] "item_3"
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Pointer Arrow Line */}
                  {currentStep >= 2 && (
                    <div className="absolute -left-6 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-400 to-purple-400 h-1 w-12 rounded-full shadow-lg shadow-cyan-400/50 animate-pulse flex items-center justify-end">
                      <div className="w-2 h-2 border-t-2 border-r-2 border-purple-300 rotate-45" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {sceneType === 'orbit' && (
              <div className="w-full max-w-2xl bg-slate-900/80 border border-slate-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-lg flex flex-col items-center">
                <div className="relative w-80 h-44 flex items-center justify-center">
                  {/* Central Body (Planet) */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 border-2 border-cyan-300 shadow-2xl shadow-cyan-500/40 flex items-center justify-center z-10">
                    <span className="text-xl">🪐</span>
                  </div>

                  {/* Elliptical Orbital Path */}
                  <div
                    className={`absolute inset-0 border-2 rounded-[50%] transition-all ${
                      currentStep === 3
                        ? 'border-dashed border-amber-400 scale-125'
                        : 'border-indigo-500/60 shadow-lg shadow-indigo-500/20'
                    }`}
                  />

                  {/* Orbiting Satellite / Probe with Trail */}
                  <div
                    className="absolute w-7 h-7 rounded-full bg-amber-400 border-2 border-white shadow-xl shadow-amber-400/80 flex items-center justify-center transition-all duration-700 z-20"
                    style={{
                      transform: `translate(${
                        Math.cos((progressPct / 100) * Math.PI * 2) * 120
                      }px, ${Math.sin((progressPct / 100) * Math.PI * 2) * 55}px)`,
                    }}
                  >
                    <span className="text-[10px]">🛰️</span>
                  </div>

                  {/* Velocity Vector Arrow */}
                  {currentStep >= 1 && (
                    <div
                      className="absolute text-[10px] font-mono text-emerald-300 font-bold bg-slate-900/90 px-2 py-0.5 rounded border border-emerald-500/40"
                      style={{ top: '15px', right: '20px' }}
                    >
                      ⚡ Velocity Vector: {currentStep === 1 ? '7.8 km/s' : '11.2 km/s (Escape)'}
                    </div>
                  )}
                </div>
              </div>
            )}

            {sceneType !== 'python' && sceneType !== 'orbit' && (
              <div className="w-full max-w-2xl bg-slate-900/80 border border-slate-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-lg flex flex-col items-center">
                <div className="w-full flex items-center justify-between gap-4 py-4">
                  {/* Neural Layers Visual */}
                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">Input Layer</span>
                    <div className="w-10 h-10 rounded-xl bg-cyan-600/30 border border-cyan-400 flex items-center justify-center font-bold text-xs text-cyan-200">
                      x1
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-cyan-600/30 border border-cyan-400 flex items-center justify-center font-bold text-xs text-cyan-200">
                      x2
                    </div>
                  </div>

                  {/* Synapse Connection Weights */}
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-full h-1 bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 rounded-full shadow-lg animate-pulse" />
                    <span className="text-[10px] font-mono text-indigo-300 mt-1">
                      W · X + Bias (Weight: 0.85)
                    </span>
                  </div>

                  {/* Hidden / Activation Node */}
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-mono text-purple-400 font-bold">Neuron ReLU</span>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 border-2 border-white shadow-xl shadow-purple-500/50 flex items-center justify-center font-black text-sm text-white">
                      f(z)
                    </div>
                    <span className="text-[10px] font-mono text-emerald-300 bg-slate-950 px-2 py-0.5 rounded border border-emerald-500/40">
                      Output: 1.42
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Live Teacher Narration & Interest Context Banner */}
          <div className="relative z-10 bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 backdrop-blur-md space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="font-bold text-indigo-300">Teacher Voice & Concept Explanation:</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              "{currentStepData.teacherNarration}"
            </p>
            <div className="text-[11px] text-amber-300/90 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 font-medium">
              {currentStepData.interestDetail}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Controls & Step Timeline Bar */}
      <div className="px-5 py-4 bg-slate-950 border-t border-slate-800/80 space-y-3">
        {/* Step Scrubber Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px]">
              Step {currentStep + 1} of {steps.length} • {currentStepData.title}
            </span>
            <span className="font-mono text-[11px] text-indigo-400 font-bold">
              {progressPct}% Completed
            </span>
          </div>

          {/* Visual Step Progress Segments */}
          <div className="grid grid-cols-4 gap-2">
            {steps.map((st, idx) => (
              <button
                key={st.stepNumber}
                onClick={() => handleStepJump(idx)}
                className={`h-2.5 rounded-full transition-all relative overflow-hidden ${
                  idx < currentStep
                    ? 'bg-indigo-600'
                    : idx === currentStep
                    ? 'bg-slate-800 ring-2 ring-indigo-500/60'
                    : 'bg-slate-800'
                }`}
                title={`Jump to Step ${st.stepNumber}: ${st.title}`}
              >
                {idx === currentStep && (
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-100"
                    style={{ width: `${progressPct}%` }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons Row: Play/Pause, Steps, Speed, Replay */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isPlaying ? 'Pause' : 'Play Lesson'}</span>
            </button>

            <button
              onClick={handlePrevStep}
              disabled={currentStep === 0}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous Step"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={handleNextStep}
              disabled={currentStep === steps.length - 1}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next Step"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={handleRestart}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Replay from Beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-mono">Speed:</span>
            {[0.75, 1, 1.25, 1.5].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all ${
                  playbackSpeed === spd
                    ? 'bg-slate-800 text-indigo-300 border border-indigo-500/50'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
