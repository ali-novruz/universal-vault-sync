# 🏛️ UNIVERSAL AI VAULT SYNC // EXECUTION PROMPT: PHASE 3
## Domain: GSAP 3.12 Timelines, ScrollTrigger Scrubbing, Lenis Inertia & GPU Acceleration

### 1. CONTEXT & OBJECTIVE
Implement the kinetic choreography and motion architecture for **Universal AI Vault Sync**. Ensure smooth 60 FPS scroll-linked reveals, seamless state transitions, and zero Cumulative Layout Shift (CLS).

### 2. ORCHESTRATED DISCIPLINES
- `awwwards-animations`, `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `motion-principles`

### 3. TECHNICAL SPECIFICATIONS & RULES

1. **Strict GPU Acceleration Discipline:**
   - Animate strictly via hardware-accelerated CSS properties: `transform: translate3d(x, y, 0)`, `scale()`, `rotate()`, and `opacity`.
   - Apply `will-change: transform, opacity` hints during active animation cycles and clean them up upon completion.
   - Absolutely zero animation of layout-triggering properties (`width`, `height`, `top`, `margin`, `padding`).

2. **GSAP & ScrollTrigger Setup:**
   - Initialize GSAP and register `ScrollTrigger`.
   - Configure scrubbed hero camera rotation timeline linked to scroll progress (`ScrollTrigger.create({ scrub: 1 })`).
   - Implement staggered reveal animations for telemetry cards and code panels (`gsap.from('.telemetry-card', { stagger: 0.08, y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' })`).

3. **Interactive UI Micro-Interactions:**
   - Magnetic hover effects on CTA buttons (`#trigger-sync`) using client bounding rectangle deltas.
   - Smooth tab switching in the Cross-Agent Matrix with cross-fade opacity transitions.
   - Animated progress bars and rotating status rings on log condensing events.

4. **Lifecycle & Memory Management:**
   - Provide clean teardown mechanisms on window resize or page reloads (`ScrollTrigger.refresh()`).
   - Prevent layout thrashing by caching bounding box calculations outside animation loops.

### 4. DELIVERABLES
Implement the kinetic choreography module in `app.js` or `motion.js`, wiring GSAP timelines and interactive hover physics to all UI elements.
