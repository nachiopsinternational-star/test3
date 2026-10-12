# Implementation Plan: FastAPI Task Architecture, Enhanced Multi-Chapter Course Creator & Custom 3D SVG/Three.js Animation Engine

## Executive Overview
Based on your answers, we are implementing:
1. **Full Async Task Management**: Dedicated background task execution engine with job queues, task IDs, polling (`/api/tasks/:id`), status streaming, and worker orchestration for long-running generative tasks.
2. **Comprehensive Course Creator Studio (All 3 Structures)**:
   - Multi-chapter syllabi authoring (unlimited chapters, 3–10+ chapters per course).
   - Multi-question quiz builder per chapter (configurable question counts, distractors, interest framing, XP rewards).
   - Modular flashcard suites with Leitner boxes and branch-based difficulty controls.
3. **Custom 3D SVG & Three.js Dynamic Animation Specification & Interpreter**:
   - Declarative JSON animation script format (`CogniSceneDSL` / `.c3d.json`) replacing hardcoded illustrations.
   - Built-in custom runtime interpreter rendering procedural Three.js 3D geometry alongside dynamic SVG paths, camera keyframe tracks, and personalized theme modifiers (gaming, space, soccer, anime, cooking, music).

---

## Architecture Breakdown

### 1. Task Queue & Job Management System (`server.ts` & `src/services/taskService.ts`)
- **Endpoints**:
  - `POST /api/tasks`: Submit asynchronous generation jobs (e.g. course generation, syllabus rendering, animation script compilation).
  - `GET /api/tasks/:id`: Check task execution status (`queued`, `processing`, `completed`, `failed`), progress percentage (0–100%), and output payload.
  - `GET /api/tasks`: List all recent active and completed tasks.
  - `DELETE /api/tasks/:id`: Cancel long-running task.
- **Client Task Tracker**:
  - Global task indicator in the navbar and toast feedback showing active progress.

### 2. Enhanced Multi-Chapter & Multi-Quiz Course Studio (`src/components/sme/SMEInstructorStudio.tsx`)
- **Multi-Chapter Management**:
  - Tabbed or accordion chapter list with "+ Add Chapter", reordering, and removal.
  - Per-chapter configuration: Title, description, duration, 3D scene type, pricing, core pedagogical formula, and custom animation script.
- **Multi-Quiz Builder**:
  - Teachers can add multiple questions per chapter (e.g. 3 to 10 questions).
  - Multiple choice options with customizable correct answer index, XP bonus, and interest-specific explanations.
- **Flashcard Deck Builder**:
  - Add and edit review flashcards with Leitner system parameters.

### 3. Custom 3D SVG & Three.js Animation Interpreter (`src/components/animation/CogniSceneInterpreter.tsx`)
- **Declarative Animation Scene Schema (`CogniSceneDoc`)**:
  - `id`, `concept`, `duration`: Base metadata.
  - `layers`:
    - `three`: Procedural Three.js 3D nodes (spheres, cubes, toruses, cylinders, ribbons, particle clouds) with animation keyframes (rotation, position, scale, color).
    - `svg`: Vector layers (curved bezier pipelines, flow arrows, glowing energetic pulses, data badges).
  - `themes`: Interest theme skins modifying textures, particles, and narrative visual metaphors in real time.
  - `keyframes`: Step-by-step playback states with camera coordinates and narration cues.
- **Extensible Interpreter Component**:
  - Renders Three.js canvas in synchronization with responsive SVG layers.
  - Full scrubbing controls (Play, Pause, Step Forward/Back, Speed, Scrubber bar).
  - Interactive hotspot inspection on both 3D objects and SVG vectors.

---

## Verification & Compilation
- Validate TypeScript compilation (`npm run lint` and `compile_applet`).
- Test task queue with asynchronous course generation.
- Verify that teachers can author multiple chapters and questions.
- Verify that the custom animation interpreter renders procedural 3D SVG and Three.js scenes dynamically across all themes.
