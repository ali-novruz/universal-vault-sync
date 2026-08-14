import * as THREE from 'https://cdn.skypack.dev/three@0.134.0/build/three.module.js';

/* ==========================================================================
   APP STATE
   ========================================================================== */
const App = {
  webgl: null,
  audio: {
    ctx: null,
    muted: localStorage.getItem('vault_audio_muted') === 'true'
  }
};

/* ==========================================================================
   WEB AUDIO TELEMETRY (Phase 4)
   Procedural oscillator synthesis — zero MP3/WAV dependencies
   ========================================================================== */
function getAudioCtx() {
  if (!App.audio.ctx) App.audio.ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (App.audio.ctx.state === 'suspended') App.audio.ctx.resume();
  return App.audio.ctx;
}

function playVaultSyncChime() {
  if (App.audio.muted) return;
  const ctx = getAudioCtx();
  [880, 1760].forEach(freq => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.2);
  });
}

function playStreamPulse() {
  if (App.audio.muted) return;
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(110, ctx.currentTime);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(400, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
  osc.connect(filter).connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

function playNodeClick() {
  if (App.audio.muted) return;
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(2400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.04);
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.04);
}

function initAudio() {
  const btn = document.getElementById('audio-toggle');
  if (!btn) return;
  if (App.audio.muted) btn.style.opacity = '0.4';
  btn.addEventListener('click', () => {
    App.audio.muted = !App.audio.muted;
    localStorage.setItem('vault_audio_muted', App.audio.muted);
    btn.style.opacity = App.audio.muted ? '0.4' : '1';
    playNodeClick();
  });
}

/* ==========================================================================
   THREE.JS 3D NEURAL GRAPH (Phase 4)
   Central core = Obsidian Vault. 7 satellites = AI agents.
   ========================================================================== */
function initWebGL() {
  const canvas = document.querySelector('#webgl-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 20;

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  const keyLight = new THREE.PointLight(0x00f0ff, 2, 50);
  keyLight.position.set(5, 5, 5);
  scene.add(keyLight);

  // Core Vault — PBR Physical Material
  const coreGeo = new THREE.IcosahedronGeometry(2.4, 2);
  const coreMat = new THREE.MeshPhysicalMaterial({
    color: 0x090c14, metalness: 0.3, roughness: 0.12,
    transmission: 0.85, ior: 1.52, transparent: true
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  scene.add(core);

  // GLSL Shader Wireframe Lattice
  const shaderUniforms = { uTime: { value: 0 }, color: { value: new THREE.Color(0xa855f7) } };
  const lattice = new THREE.Mesh(coreGeo, new THREE.ShaderMaterial({
    uniforms: shaderUniforms,
    vertexShader: `
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vViewPos;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec3 p = position + normal * (sin(position.x * 2.0 + uTime * 1.5) * 0.15);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vViewPos = -mv.xyz;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 color;
      varying vec3 vNormal;
      varying vec3 vViewPos;
      void main() {
        float fresnel = pow(1.0 - dot(normalize(vViewPos), normalize(vNormal)), 3.0);
        gl_FragColor = vec4(color + vec3(fresnel * 0.8), 0.55);
      }`,
    wireframe: true, transparent: true, blending: THREE.AdditiveBlending
  }));
  core.add(lattice);

  // Glow sprite generator
  function makeGlow(rgba) {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, rgba); grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }

  // 7 Agent Satellites
  const colors = [0xd97706, 0x3b82f6, 0xf43f5e, 0x14b8a6, 0xeab308, 0x8b5cf6, 0x64748b];
  const rgbas = ['rgba(217,119,6,1)','rgba(59,130,246,1)','rgba(244,63,94,1)','rgba(20,184,166,1)','rgba(234,179,8,1)','rgba(139,92,246,1)','rgba(100,116,139,1)'];
  const satGeo = new THREE.SphereGeometry(0.3, 16, 16);
  const sats = [];

  for (let i = 0; i < 7; i++) {
    const mat = new THREE.MeshStandardMaterial({ color: colors[i], emissive: colors[i], emissiveIntensity: 0.5 });
    const sat = new THREE.Mesh(satGeo, mat);

    // Glow halo
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeGlow(rgbas[i]), transparent: true, blending: THREE.AdditiveBlending, opacity: 0.7
    }));
    glow.scale.set(1.8, 1.8, 1);
    sat.add(glow);

    const angle = (i / 7) * Math.PI * 2;
    const radius = 6;
    sat.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
    sat.userData = { angle, radius, speed: 0.004 + Math.random() * 0.004 };
    scene.add(sat);

    // Bezier spline
    const curve = new THREE.QuadraticBezierCurve3(sat.position, new THREE.Vector3(sat.position.x * 0.5, sat.position.y * 0.5, 3), core.position);
    const spline = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(curve.getPoints(20)),
      new THREE.LineBasicMaterial({ color: colors[i], transparent: true, opacity: 0.2 })
    );
    scene.add(spline);

    // Data packet particle
    const particle = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 })
    );
    scene.add(particle);

    sat.userData.spline = spline;
    sat.userData.curve = curve;
    sat.userData.particle = particle;
    sat.userData.progress = Math.random();
    sats.push(sat);
  }

  // Mouse tracking
  const mouse = new THREE.Vector2();
  window.addEventListener('mousemove', e => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // Animation loop
  const clock = new THREE.Clock();
  window.particleSpeed = 1;

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    shaderUniforms.uTime.value = t;

    core.rotation.y += 0.002;
    core.rotation.x += 0.001;

    sats.forEach(s => {
      s.userData.angle += s.userData.speed;
      s.position.x = Math.cos(s.userData.angle) * s.userData.radius;
      s.position.y = Math.sin(s.userData.angle) * s.userData.radius;
      s.position.z = Math.sin(s.userData.angle * 2) * 1.5;

      s.userData.curve.v0.copy(s.position);
      s.userData.curve.v1.set(s.position.x * 0.5, s.position.y * 0.5, 3);
      s.userData.curve.v2.copy(core.position);
      s.userData.spline.geometry.setFromPoints(s.userData.curve.getPoints(20));

      s.userData.progress += 0.004 * window.particleSpeed;
      if (s.userData.progress >= 1) s.userData.progress = 0;
      s.userData.particle.position.copy(s.userData.curve.getPoint(s.userData.progress));
    });

    camera.position.x += (mouse.x * 2 - camera.position.x) * 0.05;
    camera.position.y += (mouse.y * 2 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  App.webgl = { camera, core, scene };
}

/* ==========================================================================
   GSAP CHOREOGRAPHY (Phase 3)
   GPU-accelerated transforms only. Zero layout-triggering props.
   ========================================================================== */
function initGSAP() {
  gsap.registerPlugin(ScrollTrigger);

  // Scrubbed 3D rotation linked to scroll
  if (App.webgl) {
    gsap.to(App.webgl.core.rotation, {
      y: Math.PI * 2, z: Math.PI,
      ease: 'none',
      scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 1 }
    });
    gsap.to(App.webgl.camera.position, {
      z: 12, ease: 'power1.inOut',
      scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 1 }
    });
  }

  // Hero parallax
  gsap.to('.hero-content', {
    y: 100, opacity: 0, force3D: true,
    scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: true }
  });

  // Staggered module reveals
  gsap.utils.toArray('.sandbox-module').forEach(mod => {
    gsap.from(mod, {
      y: 50, opacity: 0, duration: 1, ease: 'power3.out', force3D: true,
      scrollTrigger: { trigger: mod, start: 'top 85%', toggleActions: 'play none none reverse' }
    });
  });

  // Radar circle animation
  gsap.from('.circle', {
    strokeDasharray: '0, 100', duration: 1.5, ease: 'power2.out', stagger: 0.15,
    scrollTrigger: { trigger: '.coverage-radar', start: 'top 85%' }
  });

  // Magnetic hover on CTA
  const cta = document.querySelector('#trigger-sync');
  if (cta) {
    cta.addEventListener('mousemove', e => {
      const r = cta.getBoundingClientRect();
      gsap.to(cta, { x: ((e.clientX - r.left) - r.width / 2) * 0.25, y: ((e.clientY - r.top) - r.height / 2) * 0.25, duration: 0.3, ease: 'power2.out', force3D: true });
    });
    cta.addEventListener('mouseleave', () => {
      gsap.to(cta, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)', force3D: true });
    });
    cta.addEventListener('click', e => {
      e.preventDefault();
      playVaultSyncChime();
      window.particleSpeed = 12;
      setTimeout(() => { window.particleSpeed = 1; }, 1500);
      gsap.to('.btn-text', { x: () => Math.random() * 8 - 4, duration: 0.08, yoyo: true, repeat: 5 });
    });
  }

  // Condenser hover pulse
  const condenser = document.getElementById('module-condenser');
  if (condenser) condenser.addEventListener('mouseenter', playStreamPulse);

  // Tab switching with cross-fade
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playNodeClick();
      const step = btn.getAttribute('data-step');
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cur = document.querySelector('.step-view.active');
      const next = document.getElementById(`step-${step}`);
      if (cur && cur !== next) {
        gsap.to(cur, { opacity: 0, y: -8, duration: 0.2, force3D: true, onComplete: () => {
          cur.classList.remove('active');
          next.classList.add('active');
          gsap.fromTo(next, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out', force3D: true });
        }});
      }
    });
  });

  // PARA tree folders
  document.querySelectorAll('.folder-name').forEach(f => {
    f.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f.click(); } });
    f.addEventListener('click', () => {
      playNodeClick();
      const li = f.closest('.folder');
      if (!li) return;
      const ch = li.querySelector('.tree-children');
      if (li.classList.contains('open')) {
        li.setAttribute('aria-expanded', 'false');
        if (ch) gsap.to(ch, { height: 0, opacity: 0, duration: 0.25, ease: 'power2.out', onComplete: () => { li.classList.remove('open'); ch.style.height = 'auto'; } });
        else li.classList.remove('open');
      } else {
        li.classList.add('open');
        li.setAttribute('aria-expanded', 'true');
        if (ch) gsap.fromTo(ch, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.25, ease: 'power2.out' });
      }
    });
  });

  // Lifecycle
  window.addEventListener('resize', () => ScrollTrigger.refresh());
}

/* ==========================================================================
   BOOTSTRAP
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initAudio();
  initWebGL();
  initGSAP();
});
