import { Scene3DType, InterestId, CogniSceneDoc } from '../types';

export function buildProceduralAnimationDoc(
  sceneType: Scene3DType,
  interestId: InterestId,
  conceptName: string
): CogniSceneDoc {
  // Theme specific colors and visual metaphors
  const themeVisuals: Record<InterestId, { mainColor: string; accentColor: string; metaphor: string; itemLabel: string }> = {
    gaming: {
      mainColor: '#10b981', // emerald
      accentColor: '#38bdf8', // sky
      metaphor: 'Inventory Chest Memory Blocks & State Vectors',
      itemLabel: 'Inventory Block',
    },
    space: {
      mainColor: '#6366f1', // indigo
      accentColor: '#ec4899', // pink
      metaphor: 'Orbital Resonance & Gravitational Well Mechanics',
      itemLabel: 'Orbital Module',
    },
    football: {
      mainColor: '#22c55e', // green
      accentColor: '#eab308', // yellow
      metaphor: 'Tactical Formations & Pitch Velocity Vectors',
      itemLabel: 'Formation Node',
    },
    cooking: {
      mainColor: '#f97316', // orange
      accentColor: '#ef4444', // red
      metaphor: 'Thermal Convection & Emulsion Equilibrium',
      itemLabel: 'Reaction Crucible',
    },
    anime: {
      mainColor: '#a855f7', // purple
      accentColor: '#06b6d4', // cyan
      metaphor: 'Chakra Pressure Wave & Elemental Synergy Matrix',
      itemLabel: 'Ki Capacitor',
    },
    music: {
      mainColor: '#ec4899', // pink
      accentColor: '#8b5cf6', // violet
      metaphor: 'Harmonic Standing Waves & Frequency Synthesis',
      itemLabel: 'Acoustic Resonator',
    },
  };

  const currentTheme = themeVisuals[interestId] || themeVisuals.gaming;

  return {
    formatVersion: 'C3D-v2.0',
    sceneId: `scene_${sceneType}_${interestId}_${Date.now()}`,
    conceptName,
    sceneType,
    threeNodes: [
      {
        id: 'node-core-1',
        type: sceneType === 'orbit' ? 'sphere' : sceneType === 'neural' ? 'torus' : 'box',
        position: [-2.2, 0.4, 0],
        rotation: [0.2, 0.4, 0],
        scale: [1.2, 1.2, 1.2],
        color: currentTheme.mainColor,
        label: `Primary ${currentTheme.itemLabel}`,
        interestThemeSkin: {
          [interestId]: {
            color: currentTheme.mainColor,
            label: `${currentTheme.itemLabel} A`,
            scale: [1.3, 1.3, 1.3],
          },
        },
      },
      {
        id: 'node-core-2',
        type: sceneType === 'dna' ? 'helix' : 'sphere',
        position: [2.2, -0.2, 0],
        rotation: [0.1, -0.3, 0],
        scale: [1, 1, 1],
        color: currentTheme.accentColor,
        label: `Secondary ${currentTheme.itemLabel}`,
        interestThemeSkin: {
          [interestId]: {
            color: currentTheme.accentColor,
            label: `${currentTheme.itemLabel} B`,
            scale: [1.1, 1.1, 1.1],
          },
        },
      },
      {
        id: 'node-ambient-particles',
        type: 'particles',
        position: [0, 0, -2],
        color: '#94a3b8',
        scale: [3, 3, 3],
        label: 'Field Particles',
      },
      {
        id: 'node-orbital-ring',
        type: 'ring',
        position: [0, 0, 0],
        rotation: [Math.PI / 2.5, 0, 0],
        scale: [3.4, 3.4, 3.4],
        color: '#38bdf8',
        opacity: 0.4,
        label: 'Vector Axis Track',
      },
    ],
    svgLayers: [
      {
        id: 'svg-flow-path-1',
        d: 'M 140 180 C 260 80, 420 80, 540 180',
        stroke: currentTheme.mainColor,
        strokeWidth: 3.5,
        glow: true,
        pulseSpeed: 1.5,
        annotationText: 'Primary Kinetic Energy Exchange',
        interestAnnotation: {
          [interestId]: `Direct energy throughput conduit configured for ${interestId}.`,
        },
      },
      {
        id: 'svg-feedback-loop',
        d: 'M 540 220 C 420 320, 260 320, 140 220',
        stroke: currentTheme.accentColor,
        strokeWidth: 2,
        dashArray: '6,6',
        glow: true,
        pulseSpeed: 2.2,
        annotationText: 'Closed-Loop Conservation Feedback',
        interestAnnotation: {
          [interestId]: `Conservation of state vectors mirroring ${currentTheme.metaphor}.`,
        },
      },
      {
        id: 'svg-equilibrium-marker',
        d: 'M 340 120 L 340 280',
        stroke: '#e2e8f0',
        strokeWidth: 1.5,
        dashArray: '4,4',
        annotationText: 'Equilibrium Baseline',
      },
    ],
    keyframes: [
      {
        stepIndex: 0,
        title: 'Initial State Calibration',
        subheading: 'Boundary conditions and rest equilibrium',
        narration: `Observe how the core nodes initialize along the primary vector. In ${interestId}, this corresponds directly to ${currentTheme.metaphor}.`,
        interestNarration: {
          [interestId]: `Nodes set up like initial formation states in ${interestId}. Notice zero kinetic loss.`,
        },
        cameraCoordinates: [0, 1.5, 6],
        targetLookAt: [0, 0, 0],
        activeHotspotId: 'node-core-1',
        activeGeometryIds: ['node-core-1', 'node-orbital-ring'],
        activeSvgIds: ['svg-flow-path-1'],
        durationSec: 5,
      },
      {
        stepIndex: 1,
        title: 'Active Dynamic Transfer',
        subheading: 'Energy transmission through the procedural flow vector',
        narration: `Kinetic energy flows through the curved SVG vector path towards Node B, causing an instantaneous state transition.`,
        interestNarration: {
          [interestId]: `Data packet transfer occurs just like synchronization pulses in ${interestId}.`,
        },
        cameraCoordinates: [3, 2, 5],
        targetLookAt: [1, 0, 0],
        activeHotspotId: 'node-core-2',
        activeGeometryIds: ['node-core-1', 'node-core-2', 'node-ambient-particles'],
        activeSvgIds: ['svg-flow-path-1', 'svg-feedback-loop'],
        durationSec: 6,
      },
      {
        stepIndex: 2,
        title: 'Conservation & Closed-Loop Equilibrium',
        subheading: 'Steady-state harmonic equilibrium established',
        narration: `Feedback loop completes the system cycle. Output state perfectly matches the theoretical equation baseline.`,
        interestNarration: {
          [interestId]: `Full loop harmony achieved! In ${interestId}, this represents flawless execution with 100% efficiency.`,
        },
        cameraCoordinates: [-2, 3, 5],
        targetLookAt: [0, 0, 0],
        activeHotspotId: 'node-orbital-ring',
        activeGeometryIds: ['node-core-1', 'node-core-2', 'node-orbital-ring', 'node-ambient-particles'],
        activeSvgIds: ['svg-flow-path-1', 'svg-feedback-loop', 'svg-equilibrium-marker'],
        durationSec: 7,
      },
    ],
    interestOverrides: {
      [interestId]: {
        themeTitle: `${conceptName} (${interestId.toUpperCase()} Mode)`,
        ambientColor: currentTheme.mainColor,
        metaphorExplanation: `Reframed through ${currentTheme.metaphor}.`,
      },
    },
  };
}
