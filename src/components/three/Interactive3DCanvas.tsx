import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Scene3DType, InterestId } from '../../types';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Layers,
  Zap,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack,
  Info,
  Maximize2,
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
  const [quantumLeapTrigger, setQuantumLeapTrigger] = useState(0);

  // References for Three.js animation loop & objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const dynamicGroupRef = useRef<THREE.Group | null>(null);

  // Mesh references for step-based animation manipulation
  const stackMeshRef = useRef<THREE.Mesh | null>(null);
  const heapMeshRef = useRef<THREE.Mesh | null>(null);
  const pointerCurveMeshRef = useRef<THREE.Line | null>(null);
  const satelliteMeshRef = useRef<THREE.Mesh | null>(null);
  const electronMeshRef = useRef<THREE.Mesh | null>(null);
  const neuralLayersRef = useRef<THREE.Mesh[][]>([]);

  // Themed accent color helper based on interest
  const getInterestThemeColor = (interest: InterestId): number => {
    switch (interest) {
      case 'gaming': return 0x10b981; // emerald
      case 'space': return 0x6366f1; // indigo
      case 'football': return 0xf59e0b; // amber
      case 'cooking': return 0xf43f5e; // rose
      case 'anime': return 0x8b5cf6; // purple
      case 'music': return 0x06b6d4; // cyan
      default: return 0x6366f1;
    }
  };

  // Generate 4 pedagogical step-by-step walkthrough descriptions for this scene
  const getStepExplanations = (): StepExplanation[] => {
    switch (sceneType) {
      case 'python':
        return [
          {
            stepNumber: 1,
            title: 'Call Stack Allocation & Local Variable',
            actionSummary: 'Stack Frame `main()` created on hardware RAM.',
            explanation: `When a function is called, a fixed stack frame is allocated in LIFO memory. The local variable slot \`inventory_ptr\` is created here. In ${interestId} terms: this is your hotbar slot keybind!`,
            cameraPos: [-3.0, 1.5, 7.0],
            highlightObject: 'Stack Frame',
          },
          {
            stepNumber: 2,
            title: 'Dynamic Heap Object Instantiation',
            actionSummary: 'Dynamic list object allocated at heap address 0x7FFA.',
            explanation: `Complex dynamic structures (lists, dicts, 3D meshes) live in the Heap. Notice the glowing polygonal memory block forming at address 0x7FFA. It holds the actual data values!`,
            cameraPos: [2.5, 1.2, 7.5],
            highlightObject: 'Heap Object',
          },
          {
            stepNumber: 3,
            title: 'Pointer Dereferencing & Reference Binding',
            actionSummary: 'Glowing pointer laser binds Stack address to Heap memory block.',
            explanation: `Notice the glowing Bezier energy laser connecting the Stack slot directly to the Heap object! The variable does NOT clone the data; it stores the 64-bit memory pointer.`,
            cameraPos: [0, 2.0, 9.5],
            highlightObject: 'Pointer Beam',
          },
          {
            stepNumber: 4,
            title: 'In-Place Mutation & Memory Cleanup',
            actionSummary: 'Mutating value through pointer without modifying caller stack frame.',
            explanation: `Calling \`.append()\` or mutating an item alters the Heap object directly through the pointer reference. The stack variable address remains untouched. This is pass-by-object-reference!`,
            cameraPos: [0, 2.5, 10.0],
            highlightObject: 'Mutated Heap State',
          },
        ];

      case 'orbit':
        return [
          {
            stepNumber: 1,
            title: 'Stable Circular Parking Orbit',
            actionSummary: 'Centripetal gravitational equilibrium at r = 4.2.',
            explanation: `The satellite cruises in uniform circular motion where gravitational pull F = G*M*m/r^2 precisely balances centripetal acceleration. In ${interestId} terms: stable baseline holding pattern!`,
            cameraPos: [0, 4.0, 10.0],
            highlightObject: 'Circular Orbit',
          },
          {
            stepNumber: 2,
            title: 'Prograde Burn & Hohmann Transfer Ellipse',
            actionSummary: 'Delta-V velocity burn fired, stretching orbit into an ellipse.',
            explanation: `Firing rocket thrusters increases velocity v, pushing the apoapsis outward. Notice the trajectory stretching into a graceful Keplerian transfer ellipse!`,
            cameraPos: [1.5, 5.0, 11.0],
            highlightObject: 'Transfer Ellipse',
          },
          {
            stepNumber: 3,
            title: 'Periapsis Gravitational Slingshot Surge',
            actionSummary: 'Angular momentum conservation sweeps maximum speed closest to mass.',
            explanation: `At closest approach (periapsis), gravitational potential energy converts to peak kinetic energy. Kepler\'s 2nd Law dictates equal area swept in equal time, forcing maximum speed!`,
            cameraPos: [0, 3.0, 9.0],
            highlightObject: 'Periapsis Velocity Peak',
          },
          {
            stepNumber: 4,
            title: 'Escape Velocity & Hyperbolic Trajectory',
            actionSummary: 'Velocity exceeds square root of 2 * orbital speed: Escape achieved.',
            explanation: `With velocity v >= √(2GM/r), total orbital mechanical energy becomes positive (E > 0). The satellite permanently breaks free of the planetary gravity well!`,
            cameraPos: [0, 4.0, 12.0],
            highlightObject: 'Hyperbolic Escape',
          },
        ];

      case 'quantum':
        return [
          {
            stepNumber: 1,
            title: 'Bohr Ground State (n=1 Level)',
            actionSummary: 'Electron in quantized lowest energy orbit (Ground State).',
            explanation: `In quantum mechanics, electrons cannot orbit at arbitrary distances. They are strictly confined to discrete quantized energy shells n = 1, 2, 3... dictated by Planck\'s constant.`,
            cameraPos: [0, 2.5, 9.0],
            highlightObject: 'Ground State n=1',
          },
          {
            stepNumber: 2,
            title: 'Incoming Photon Absorption',
            actionSummary: 'Incident photon pulse matches exact delta-E energy gap.',
            explanation: `An external photon strikes the atom. If and only if the photon energy h*f exactly matches the energy difference ΔE = E3 - E1, the electron absorbs the photon instantaneously!`,
            cameraPos: [0, 3.0, 9.5],
            highlightObject: 'Photon Wave',
          },
          {
            stepNumber: 3,
            title: 'Instantaneous Quantum Leap (n=3)',
            actionSummary: 'Electron vanishes from n=1 and reappears on n=3 shell with zero transit time.',
            explanation: `The electron does NOT travel through the space in between. It disappears from ground state and instantaneously materializes in excited state n=3. This is the quantum leap!`,
            cameraPos: [0, 3.5, 10.5],
            highlightObject: 'Excited State n=3',
          },
          {
            stepNumber: 4,
            title: 'Spontaneous Emission & Spectral Photon Emission',
            actionSummary: 'Electron decays back to ground state, emitting a discrete photon burst.',
            explanation: `The excited state is unstable. As the electron falls back to n=1, it unleashes a radiant light photon carrying away ΔE. This emission wavelength creates spectral emission lines!`,
            cameraPos: [0, 3.0, 10.0],
            highlightObject: 'Emitted Photon Wave',
          },
        ];

      case 'neural':
        return [
          {
            stepNumber: 1,
            title: 'Input Tensor Injection',
            actionSummary: 'Input layer nodes illuminate with feature vectors.',
            explanation: `Data enters through input dimension features (e.g. image pixels or audio frequencies). Notice the first column of nodes illuminating with raw activation potentials.`,
            cameraPos: [-3.5, 1.0, 8.5],
            highlightObject: 'Input Layer',
          },
          {
            stepNumber: 2,
            title: 'Synaptic Weight Propagation',
            actionSummary: 'Glowing signal pulses flow along synaptic connection lines.',
            explanation: `Signals multiply across synaptic weights: z = W*x + b. Notice the animated pulse photons streaming across the neural pathways between layers!`,
            cameraPos: [0, 1.5, 9.0],
            highlightObject: 'Synaptic Lines',
          },
          {
            stepNumber: 3,
            title: 'Non-Linear Activation Threshold (ReLU / GELU)',
            actionSummary: 'Neurons activate when weighted sum crosses activation threshold.',
            explanation: `Without non-linear activations, 100 neural layers mathematically collapse into a single flat equation. The threshold function introduces the non-linearity that allows complex reasoning!`,
            cameraPos: [1.5, 1.5, 8.5],
            highlightObject: 'Hidden Layer Neurons',
          },
          {
            stepNumber: 4,
            title: 'Output Prediction & Loss Gradient Computation',
            actionSummary: 'Output layer fires with prediction confidence probability.',
            explanation: `The output layer fires the final classification prediction. During backpropagation, the loss gradient flows in reverse to adjust synaptic weights and master the task!`,
            cameraPos: [3.5, 1.0, 8.0],
            highlightObject: 'Output Neuron',
          },
        ];

      case 'dna':
        return [
          {
            stepNumber: 1,
            title: 'Intact Double Helix Equilibrium',
            actionSummary: 'Antiparallel sugar-phosphate backbones connected by base pairs.',
            explanation: `The DNA double helix consists of two complementary strands running antiparallel (5\' to 3\'). Nucleotides stack neatly in the core, stabilized by hydrophobic interactions.`,
            cameraPos: [0, 1.0, 9.5],
            highlightObject: 'Double Helix',
          },
          {
            stepNumber: 2,
            title: 'Helicase Unzipping & Hydrogen Bond Cleavage',
            actionSummary: 'Thermal/enzymatic energy splits hydrogen bonds along the axis.',
            explanation: `Notice the central bonds separating! Unlike covalent bonds, hydrogen bonds are weak enough to be unzipped by cellular machinery without breaking the backbone.`,
            cameraPos: [0, 1.5, 8.5],
            highlightObject: 'Replication Fork',
          },
          {
            stepNumber: 3,
            title: 'Complementary Base Pairing Rule',
            actionSummary: 'Adenine binds Thymine (2 H-bonds); Guanine binds Cytosine (3 H-bonds).',
            explanation: `Chargaff\'s law in action: Adenine strictly pairs with Thymine with 2 bonds; Guanine with Cytosine with 3 bonds. The triple G-C bond gives the strand superior thermal stability!`,
            cameraPos: [0, 2.0, 9.0],
            highlightObject: 'Base Pair Bonds',
          },
          {
            stepNumber: 4,
            title: 'Complete Daughter Strand Synthesis',
            actionSummary: 'Two identical double-helical molecules generated with high fidelity.',
            explanation: `DNA polymerase seals the complementary strands with near-zero error rate (1 in 10^9). Semiconservative replication is complete, preserving the genetic code!`,
            cameraPos: [0, 2.0, 10.0],
            highlightObject: 'Replicated Strands',
          },
        ];

      default:
        return [];
    }
  };

  const steps = getStepExplanations();
  const currentStep = steps[currentStepIndex] || steps[0];

  // Auto-advance through steps if isPlaying
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      setCurrentStepIndex((prev) => (prev + 1) % steps.length);
    }, 7000 / simulationSpeed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, simulationSpeed, steps.length]);

  // Speech narration
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

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.035);

    // 2. Camera setup
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(currentStep.cameraPos[0], currentStep.cameraPos[1], currentStep.cameraPos[2]);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const themeColor = getInterestThemeColor(interestId);
    const pointLight = new THREE.PointLight(themeColor, 2.8, 50);
    pointLight.position.set(5, 8, 5);
    scene.add(pointLight);

    const secondaryLight = new THREE.PointLight(0x38bdf8, 2.0, 50);
    secondaryLight.position.set(-6, -4, 4);
    scene.add(secondaryLight);

    // 5. Starfield Dust Particles
    const dustCount = 350;
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPositions[i] = (Math.random() - 0.5) * 35;
      dustPositions[i + 1] = (Math.random() - 0.5) * 35;
      dustPositions[i + 2] = (Math.random() - 0.5) * 35;
    }
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustPoints = new THREE.Points(
      dustGeometry,
      new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.1, transparent: true, opacity: 0.4 })
    );
    scene.add(dustPoints);

    // 6. Dynamic Group
    const dynamicGroup = new THREE.Group();
    dynamicGroupRef.current = dynamicGroup;
    scene.add(dynamicGroup);

    // Build scene geometries based on sceneType
    if (sceneType === 'python') {
      // Stack Frame (Left)
      const stackFrameGeo = new THREE.BoxGeometry(2.4, 4.4, 0.4);
      const stackFrameMat = new THREE.MeshStandardMaterial({
        color: currentStepIndex === 0 ? themeColor : 0x1e293b,
        metalness: 0.3,
        roughness: 0.4,
        wireframe: wireframeMode,
      });
      const stackMesh = new THREE.Mesh(stackFrameGeo, stackFrameMat);
      stackMesh.position.set(-3.2, 0, 0);
      stackMesh.name = 'Call Stack Frame: main()';
      dynamicGroup.add(stackMesh);
      stackMeshRef.current = stackMesh;

      // Stack Local Slots
      [-1.3, 0, 1.3].forEach((slotY, sIdx) => {
        const slotGeo = new THREE.BoxGeometry(2.0, 0.7, 0.5);
        const slotMat = new THREE.MeshStandardMaterial({
          color: sIdx === 1 && currentStepIndex >= 0 ? themeColor : 0x334155,
          roughness: 0.3,
        });
        const slot = new THREE.Mesh(slotGeo, slotMat);
        slot.position.set(-3.2, slotY, 0.1);
        slot.name = `Stack Local Var: ptr_inventory_${sIdx + 1}`;
        dynamicGroup.add(slot);
      });

      // Heap Objects (Right)
      const heapGeo = new THREE.DodecahedronGeometry(1.0, 0);
      const heapMat = new THREE.MeshStandardMaterial({
        color: currentStepIndex >= 1 ? themeColor : 0x475569,
        emissive: currentStepIndex >= 1 ? themeColor : 0x000000,
        emissiveIntensity: currentStepIndex >= 1 ? 0.4 : 0,
        roughness: 0.2,
        metalness: 0.3,
        wireframe: wireframeMode,
      });
      const heapMesh = new THREE.Mesh(heapGeo, heapMat);
      heapMesh.position.set(2.8, 0.8, 0);
      heapMesh.name = 'Heap Object at 0x7FFA (Items)';
      dynamicGroup.add(heapMesh);
      heapMeshRef.current = heapMesh;

      // Pointer Curve
      if (currentStepIndex >= 2) {
        const curve = new THREE.CubicBezierCurve3(
          new THREE.Vector3(-2.2, 0, 0.1),
          new THREE.Vector3(-0.5, 2.0, 0.5),
          new THREE.Vector3(1.2, 1.5, 0.5),
          new THREE.Vector3(2.8, 0.8, 0)
        );
        const points = curve.getPoints(30);
        const curveGeo = new THREE.BufferGeometry().setFromPoints(points);
        const curveMat = new THREE.LineBasicMaterial({ color: themeColor, linewidth: 3 });
        const curveLine = new THREE.Line(curveGeo, curveMat);
        dynamicGroup.add(curveLine);
        pointerCurveMeshRef.current = curveLine;
      }
    } else if (sceneType === 'orbit') {
      // Central Star/Planet
      const sunGeo = new THREE.SphereGeometry(1.4, 32, 32);
      const sunMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.6,
        roughness: 0.2,
        wireframe: wireframeMode,
      });
      const sun = new THREE.Mesh(sunGeo, sunMat);
      sun.name = 'Central Gravitational Planet';
      dynamicGroup.add(sun);

      // Orbital Ring
      const orbitRadius = currentStepIndex >= 1 ? 5.8 : 4.0;
      const ringGeo = new THREE.RingGeometry(orbitRadius - 0.04, orbitRadius + 0.04, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: themeColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      dynamicGroup.add(ring);

      // Satellite
      const satGeo = new THREE.SphereGeometry(0.4, 24, 24);
      const satMat = new THREE.MeshStandardMaterial({
        color: themeColor,
        metalness: 0.5,
        roughness: 0.2,
      });
      const sat = new THREE.Mesh(satGeo, satMat);
      sat.name = 'Voyager Deep Space Probe';
      (sat as any).orbitRadius = orbitRadius;
      (sat as any).orbitSpeed = currentStepIndex === 2 ? 3.0 : 1.5;
      (sat as any).orbitAngle = 0;
      dynamicGroup.add(sat);
      satelliteMeshRef.current = sat;
    } else if (sceneType === 'quantum') {
      // Nucleus
      const nucleusGeo = new THREE.SphereGeometry(0.7, 32, 32);
      const nucleusMat = new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        emissive: 0x9f1239,
        emissiveIntensity: 0.6,
        wireframe: wireframeMode,
      });
      const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
      nucleus.name = 'Atomic Nucleus (+Ze)';
      dynamicGroup.add(nucleus);

      // Energy shells
      [2.0, 3.6, 5.2].forEach((radius, nIdx) => {
        const ringGeo = new THREE.RingGeometry(radius - 0.03, radius + 0.03, 64);
        const ringMat = new THREE.MeshBasicMaterial({
          color: (nIdx === 0 && currentStepIndex <= 1) || (nIdx === 2 && currentStepIndex >= 2) ? themeColor : 0x334155,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        dynamicGroup.add(ring);
      });

      // Electron
      const electronRadius = currentStepIndex >= 2 ? 5.2 : 2.0;
      const eGeo = new THREE.SphereGeometry(0.3, 20, 20);
      const eMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: themeColor,
        emissiveIntensity: 0.8,
      });
      const electron = new THREE.Mesh(eGeo, eMat);
      electron.name = `Bohr Electron at Energy Shell n=${currentStepIndex >= 2 ? 3 : 1}`;
      (electron as any).orbitRadius = electronRadius;
      (electron as any).orbitSpeed = 2.5;
      (electron as any).orbitAngle = 0;
      dynamicGroup.add(electron);
      electronMeshRef.current = electron;
    } else {
      // Default / Neural / DNA fallback geometry
      const fallbackGeo = new THREE.TorusKnotGeometry(1.6, 0.45, 100, 16);
      const fallbackMat = new THREE.MeshStandardMaterial({
        color: themeColor,
        metalness: 0.3,
        roughness: 0.3,
        wireframe: wireframeMode,
      });
      const fallbackMesh = new THREE.Mesh(fallbackGeo, fallbackMat);
      fallbackMesh.name = `${courseTitle} Interactive 3D Model`;
      dynamicGroup.add(fallbackMesh);
    }

    // Raycaster for interactive object click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(dynamicGroup.children, true);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.name) {
          setActiveNodeName(hit.name);
          setActiveNodeInfo(
            `Proprietary 3D Node [${hit.name}] active in Step ${currentStep.stepNumber}. Parameter synced for ${interestId.toUpperCase()}.`
          );
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime() * simulationSpeed;

      if (isPlaying) {
        if (sceneType !== 'python') {
          dynamicGroup.rotation.y += delta * 0.25 * simulationSpeed;
        }

        dynamicGroup.children.forEach((child: any) => {
          if (child.orbitRadius !== undefined) {
            child.orbitAngle += delta * child.orbitSpeed * simulationSpeed;
            child.position.x = Math.cos(child.orbitAngle) * child.orbitRadius;
            child.position.z = Math.sin(child.orbitAngle) * child.orbitRadius;
          }
        });

        dustPoints.rotation.y = elapsed * 0.02;
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
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [sceneType, interestId, wireframeMode, currentStepIndex, quantumLeapTrigger]);

  const handleStepSelect = (idx: number) => {
    setCurrentStepIndex(idx);
    setIsPlaying(false);
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-700/80 bg-[#060913] shadow-2xl flex flex-col">
      {/* Three.js 3D Viewport */}
      <div className="relative w-full h-[360px] sm:h-[420px]">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Top Overlay HUD */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs shadow-lg pointer-events-auto">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-emerald-400 font-bold">Step {currentStep.stepNumber}/4</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-200 font-medium">{currentStep.title}</span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => setVoiceNarration(!voiceNarration)}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
                voiceNarration
                  ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white border border-slate-700'
              }`}
              title={voiceNarration ? 'Mute Audio Explanation' : 'Read Out Animated Explanation'}
            >
              {voiceNarration ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{voiceNarration ? 'Voice ON' : 'Audio Readout'}</span>
            </button>
          </div>
        </div>

        {/* Node Inspector Callout */}
        {activeNodeName && (
          <div className="absolute top-16 left-4 max-w-sm bg-slate-900/95 backdrop-blur-lg p-3.5 rounded-xl border border-indigo-500 text-xs shadow-2xl animate-in fade-in z-20">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                {activeNodeName}
              </span>
              <button
                onClick={() => setActiveNodeName(null)}
                className="text-slate-400 hover:text-white px-1.5"
              >
                ✕
              </button>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">{activeNodeInfo}</p>
          </div>
        )}
      </div>

      {/* SYNCHRONIZED ANIMATED EXPLANATION & STEPPER BAR */}
      <div className="bg-slate-900/95 border-t border-slate-800 p-4 sm:p-5 space-y-3">
        {/* Step Title & Action Headline */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-md">
              {currentStep.stepNumber}
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-100">
              {currentStep.title}
            </h3>
          </div>

          <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px] font-mono font-bold">
            Action: {currentStep.actionSummary}
          </span>
        </div>

        {/* In-depth Pedagogical Explanation */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          {currentStep.explanation}
        </p>

        {/* Stepper Controls & Scrubber Timeline */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Step Selector Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {steps.map((st, idx) => (
              <button
                key={idx}
                onClick={() => handleStepSelect(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  idx === currentStepIndex
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30 scale-105'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Step {st.stepNumber}
              </button>
            ))}
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentStepIndex === 0}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors"
              title="Previous Step"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
              <span>{isPlaying ? 'Pause' : 'Play Walkthrough'}</span>
            </button>

            <button
              onClick={() => setCurrentStepIndex((prev) => (prev + 1) % steps.length)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Next Step"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Wireframe toggle */}
            <button
              onClick={() => setWireframeMode(!wireframeMode)}
              className={`p-2 rounded-xl text-xs font-medium transition-colors ${
                wireframeMode ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Mesh Structure"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
