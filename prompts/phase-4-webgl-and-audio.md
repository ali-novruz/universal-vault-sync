# 🏛️ UNIVERSAL AI VAULT SYNC // EXECUTION PROMPT: PHASE 4
## Domain: Three.js 3D Force Graph, PBR Physical Shaders, Dynamic Bezier Splines & Web Audio

### 1. CONTEXT & OBJECTIVE
Construct the immersive WebGL/Three.js centerpiece and Web Audio telemetry suite for **Universal AI Vault Sync**. The 3D scene represents the decentralized cross-agent neural memory graph connected to the central Obsidian Vault.

### 2. ORCHESTRATED DISCIPLINES
- `threejs-fundamentals`, `threejs-geometry`, `threejs-materials`, `threejs-lighting`, `threejs-shaders`, `canvas-generative`

### 3. TECHNICAL SPECIFICATIONS & SCENE TOPOLOGY

1. **Scene, Camera & Responsive Viewport:**
   - High-performance `THREE.WebGLRenderer` attached to `#webgl-canvas` with `antialias: true, alpha: true`.
   - Cap Device Pixel Ratio: `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`.
   - Responsive `THREE.PerspectiveCamera(45, width / height, 0.1, 1000)` with smooth mouse orbit damping.

2. **Nodes Hierarchy & PBR Materials:**
   - **Central Core Node (The Obsidian Vault):**
     - Geometry: `THREE.IcosahedronGeometry(2.4, 2)` or multi-faceted crystalline lathe.
     - Material: `THREE.MeshPhysicalMaterial` with deep obsidian color (`#090c14`), transmission `0.85`, roughness `0.12`, metalness `0.3`, and IOR `1.52`.
     - Wireframe Lattice: Outer glowing amethyst wireframe cage (`THREE.WireframeGeometry`).
   - **7 Orbiting Satellite Agent Nodes:**
     - Distinct colored nodes positioned in 3D space for Claude (`#d97706`), Antigravity (`#3b82f6`), Cursor (`#f43f5e`), Windsurf (`#14b8a6`), Aider (`#eab308`), Cline (`#8b5cf6`), and Copilot (`#64748b`).
     - Luminous glow halos using additive blending sprite materials.

3. **Dynamic Bezier Splines & Particle Flow:**
   - Construct quadratic Bezier curves (`THREE.QuadraticBezierCurve3`) connecting each satellite agent node to the central Obsidian core.
   - Animate luminous data packet particles along the splines with configurable velocities upon synchronization triggers.

4. **Custom GLSL Shader Wave Displacements:**
   - Implement custom vertex shader displacing wireframe lattice vertices with sinusoidal time harmonics:
     `vec3 newPos = position + normal * (sin(position.x * 2.0 + uTime * 1.5) * 0.15);`
   - Implement Fresnel edge glow in fragment shader:
     `float fresnel = pow(1.0 - dot(viewDir, normal), 3.0);`

5. **Web Audio API Acoustic Telemetry Suite:**
   - Procedural Web Audio API oscillator synthesis (zero MP3/WAV dependencies):
     - **Vault Sync Chime:** Dual-sine harmonic chime at `880Hz` & `1760Hz` with exponential gain decay.
     - **Stream Data Pulse:** Lowpass-filtered `110Hz` rhythmic blip on transcript compression.
     - **Node Click:** Crisp tactile `2400Hz` micro-click.
   - Global mute toggle with persistence in `localStorage`.

### 4. DELIVERABLES
Implement the complete Three.js WebGL engine, shader uniforms, particle animation loops, raycaster interaction, and Web Audio API synthesizer in `app.js`.
