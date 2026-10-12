import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CogniSceneDoc, InterestId, Three3DGeometryNode, SVG3DLayerNode } from '../../types';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Sparkles,
  Layers,
  Zap,
  Info,
  Maximize2,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface CogniSceneInterpreterProps {
  sceneDoc: CogniSceneDoc;
  interestId: InterestId;
  onStepComplete?: (stepIndex: number) => void;
}

export const CogniSceneInterpreter: React.FC<CogniSceneInterpreterProps> = ({
  sceneDoc,
  interestId,
  onStepComplete,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [voiceNarration, setVoiceNarration] = useState(false);
  const [selectedElementInfo, setSelectedElementInfo] = useState<{
    id: string;
    title: string;
    description: string;
  } | null>(null);

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshesMapRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const animFrameIdRef = useRef<number | null>(null);

  const activeKeyframe = sceneDoc.keyframes[currentStepIndex] || sceneDoc.keyframes[0];

  // Initialize Three.js Scene and Dynamic Nodes
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x070b14);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(...activeKeyframe.cameraCoordinates);
    camera.lookAt(...activeKeyframe.targetLookAt);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x6366f1, 2, 20);
    pointLight.position.set(0, 2, 2);
    scene.add(pointLight);

    // 5. Interpret Declarative Three.js Nodes
    meshesMapRef.current.clear();
    const group = new THREE.Group();
    scene.add(group);

    sceneDoc.threeNodes.forEach((node) => {
      let geometry: THREE.BufferGeometry;
      const themeSkin = node.interestThemeSkin?.[interestId];
      const colorHex = themeSkin?.color || node.color;

      switch (node.type) {
        case 'sphere':
          geometry = new THREE.SphereGeometry(1, 32, 32);
          break;
        case 'box':
          geometry = new THREE.BoxGeometry(1.6, 1.6, 1.6);
          break;
        case 'cylinder':
          geometry = new THREE.CylinderGeometry(0.8, 0.8, 2, 24);
          break;
        case 'torus':
          geometry = new THREE.TorusGeometry(1.4, 0.4, 16, 64);
          break;
        case 'helix':
          geometry = new THREE.TorusKnotGeometry(1, 0.3, 64, 8);
          break;
        case 'ring':
          geometry = new THREE.RingGeometry(1.5, 1.7, 32);
          break;
        case 'particles': {
          const count = 120;
          const posArray = new Float32Array(count * 3);
          for (let i = 0; i < count * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 8;
          }
          geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
          const particleMat = new THREE.PointsMaterial({
            size: 0.08,
            color: new THREE.Color(colorHex),
            transparent: true,
            opacity: 0.7,
          });
          const points = new THREE.Points(geometry, particleMat);
          points.position.set(...node.position);
          group.add(points);
          meshesMapRef.current.set(node.id, points);
          return;
        }
        default:
          geometry = new THREE.BoxGeometry(1, 1, 1);
      }

      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex),
        metalness: 0.3,
        roughness: 0.4,
        wireframe: node.wireframe || false,
        transparent: (node.opacity ?? 1) < 1,
        opacity: node.opacity ?? 1,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...node.position);
      if (node.rotation) mesh.rotation.set(...node.rotation);
      const scale = themeSkin?.scale || node.scale || [1, 1, 1];
      mesh.scale.set(...scale);

      mesh.userData = {
        id: node.id,
        label: themeSkin?.label || node.label || '3D Element',
        description: `Procedural node generated for ${interestId}. Position: [${node.position.join(', ')}]`,
      };

      group.add(mesh);
      meshesMapRef.current.set(node.id, mesh);
    });

    // 6. Animation Loop (60 FPS)
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Continuous subtle rotation for dynamic presence
      meshesMapRef.current.forEach((obj, id) => {
        if (id.includes('core-1')) {
          obj.rotation.y += 0.4 * delta;
          obj.rotation.x += 0.2 * delta;
        } else if (id.includes('core-2')) {
          obj.rotation.y -= 0.3 * delta;
          obj.rotation.z += 0.2 * delta;
        } else if (id.includes('orbital-ring')) {
          obj.rotation.z += 0.25 * delta;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      renderer.dispose();
    };
  }, [sceneDoc, interestId]);

  // Handle Step Navigation and Smooth Camera Interpolation
  useEffect(() => {
    if (!cameraRef.current || !activeKeyframe) return;
    const targetPos = activeKeyframe.cameraCoordinates;
    const targetLook = activeKeyframe.targetLookAt;

    // Smoothly set camera
    cameraRef.current.position.set(...targetPos);
    cameraRef.current.lookAt(...targetLook);

    // Voice narration
    if (voiceNarration && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = activeKeyframe.interestNarration?.[interestId] || activeKeyframe.narration;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }

    if (onStepComplete) onStepComplete(currentStepIndex);
  }, [currentStepIndex, activeKeyframe, interestId, voiceNarration, onStepComplete]);

  // Autoplay step advancement timer
  useEffect(() => {
    if (!isPlaying) return;
    const duration = (activeKeyframe?.durationSec || 5) * 1000 * (1 / playbackSpeed);

    const timer = setTimeout(() => {
      setCurrentStepIndex((prev) => (prev + 1) % sceneDoc.keyframes.length);
    }, duration);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, activeKeyframe, playbackSpeed, sceneDoc.keyframes.length]);

  return (
    <div className="relative w-full rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
      {/* Header Bar */}
      <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between backdrop-blur-md z-20">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>{sceneDoc.conceptName}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                Procedural C3D v2.0
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Interest Customization: <span className="text-indigo-300 font-semibold uppercase">{interestId}</span>
            </div>
          </div>
        </div>

        {/* Speed & Narration */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceNarration(!voiceNarration)}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              voiceNarration
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Toggle Voice Synthesis Narration"
          >
            {voiceNarration ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setPlaybackSpeed((s) => (s === 1 ? 1.5 : s === 1.5 ? 2 : 1))}
            className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-[11px] font-mono font-bold"
          >
            {playbackSpeed}x
          </button>
        </div>
      </div>

      {/* Main Viewport: Three.js Canvas + Synchronized Procedural SVG Overlay */}
      <div className="relative w-full h-[380px] bg-[#070b14] overflow-hidden">
        {/* Three.js Canvas Mount */}
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Synchronized Dynamic SVG Layer */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          viewBox="0 0 680 400"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {sceneDoc.svgLayers.map((layer) => {
            const isLayerActive = activeKeyframe.activeSvgIds.includes(layer.id);
            return (
              <g
                key={layer.id}
                className={`transition-opacity duration-500 pointer-events-auto cursor-pointer ${
                  isLayerActive ? 'opacity-100' : 'opacity-25'
                }`}
                onClick={() =>
                  setSelectedElementInfo({
                    id: layer.id,
                    title: layer.annotationText || 'Dynamic Vector Conduit',
                    description:
                      layer.interestAnnotation?.[interestId] ||
                      'Mathematical relationship mapping energy and state vectors.',
                  })
                }
              >
                {/* Background glow path */}
                {layer.glow && (
                  <path
                    d={layer.d}
                    fill="none"
                    stroke={layer.stroke}
                    strokeWidth={layer.strokeWidth * 2.2}
                    opacity="0.35"
                    filter="url(#glow)"
                  />
                )}
                {/* Foreground vector path */}
                <path
                  d={layer.d}
                  fill={layer.fill || 'none'}
                  stroke={layer.stroke}
                  strokeWidth={layer.strokeWidth}
                  strokeDasharray={layer.dashArray}
                  strokeLinecap="round"
                />

                {/* SVG Annotation Badge */}
                {layer.annotationText && isLayerActive && (
                  <text
                    x="340"
                    y={layer.id.includes('feedback') ? '310' : '75'}
                    textAnchor="middle"
                    fill={layer.stroke}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                    className="drop-shadow-md select-none"
                  >
                    {layer.annotationText}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Inspected Element Modal Overlay */}
        {selectedElementInfo && (
          <div className="absolute bottom-4 left-4 right-4 z-30 p-3 rounded-xl bg-slate-900/95 border border-indigo-500/50 shadow-2xl backdrop-blur-md animate-in fade-in">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-400" />
                {selectedElementInfo.title}
              </span>
              <button
                onClick={() => setSelectedElementInfo(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-slate-300">{selectedElementInfo.description}</p>
          </div>
        )}
      </div>

      {/* Step Explanation & Metaphor Card */}
      <div className="p-4 bg-slate-900/90 border-t border-slate-800 backdrop-blur-md">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-indigo-400">
            Step {currentStepIndex + 1} of {sceneDoc.keyframes.length}: {activeKeyframe.title}
          </span>
          <span className="text-[10px] text-slate-400">
            Theme: <strong className="text-emerald-400 capitalize">{interestId}</strong>
          </span>
        </div>

        <p className="text-xs text-slate-200 font-medium mb-2 leading-relaxed">
          {activeKeyframe.interestNarration?.[interestId] || activeKeyframe.narration}
        </p>

        {/* Playback Controls & Scrubber */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md shadow-indigo-600/30"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            </button>

            <button
              onClick={() =>
                setCurrentStepIndex((prev) =>
                  prev === 0 ? sceneDoc.keyframes.length - 1 : prev - 1
                )
              }
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Previous Step"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() =>
                setCurrentStepIndex((prev) => (prev + 1) % sceneDoc.keyframes.length)
              }
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Next Step"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setCurrentStepIndex(0)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Restart"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Keyframe step indicator dots */}
          <div className="flex items-center gap-1.5">
            {sceneDoc.keyframes.map((kf, idx) => (
              <button
                key={kf.stepIndex}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  currentStepIndex === idx
                    ? 'w-6 bg-indigo-500'
                    : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Jump to ${kf.title}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
