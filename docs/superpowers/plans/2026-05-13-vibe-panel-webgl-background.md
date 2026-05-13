# Vibe Panel WebGL Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the provided dark fluid WebGL animation as a restrained background texture inside the right-side navigation panel.

**Architecture:** The right panel gets a dedicated non-interactive background host behind `.panel__inner`. A new `src/scripts/webgl-background.ts` module owns Three.js setup, shader rendering, panel-sized resize handling, reduced-motion behavior, and graceful fallback. `bootstrapApp()` initializes the module after the app markup is rendered.

**Tech Stack:** Vite, TypeScript, CSS, local `three` runtime dependency, WebGL shader material.

---

## File Structure

- Modify `package.json` and `package-lock.json`: add local runtime dependency `three`.
- Modify `src/scripts/render-panels.ts`: render `<div class="panel__webgl-bg" aria-hidden="true" data-webgl-background></div>` only in the `vibe` panel.
- Modify `src/styles/layout.css`: style `.panel__webgl-bg`, its canvas, a dark readability overlay, and keep `.panel__inner` above it.
- Create `src/scripts/webgl-background.ts`: initialize and manage the restrained Three.js shader animation.
- Modify `src/app.ts`: import and call `attachVibePanelBackground(container)` after rendering the app.

---

### Task 1: Add Three.js Dependency

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Install local Three.js runtime dependency**

Run:

```bash
npm install three
```

Expected:

```text
added 1 package
```

or npm reports the dependency is already up to date. `package.json` should contain a `dependencies` entry for `three`, and `package-lock.json` should include the resolved package.

- [ ] **Step 2: Verify dependency is recorded**

Run:

```bash
node -e "const pkg=require('./package.json'); if(!pkg.dependencies?.three) process.exit(1); console.log(pkg.dependencies.three)"
```

Expected: prints the installed `three` version and exits with code 0.

- [ ] **Step 3: Commit dependency change**

Run:

```bash
git add package.json package-lock.json
git commit -m "Add Three.js dependency"
```

Expected: commit succeeds.

---

### Task 2: Add Right Panel Background Host

**Files:**
- Modify: `src/scripts/render-panels.ts`

- [ ] **Step 1: Update panel markup**

In `renderPanel()`, add the WebGL host as the first child inside the `<article>` only when `panelKey === "vibe"`.

Use this exact local constant near the existing `ariaControlsAttr` and `copyrightText` constants:

```ts
  const webglBackground =
    panelKey === "vibe"
      ? '<div class="panel__webgl-bg" aria-hidden="true" data-webgl-background></div>'
      : "";
```

Then change the article markup to:

```ts
    <article class="panel panel--${panelKey} ${panelThemeClass}" data-panel="${panelKey}">
      ${webglBackground}
      <div class="panel__inner">
```

- [ ] **Step 2: Run build to catch markup/type errors**

Run:

```bash
npm run build
```

Expected:

```text
✓ built in
```

and TypeScript exits successfully.

- [ ] **Step 3: Commit host markup**

Run:

```bash
git add src/scripts/render-panels.ts
git commit -m "Add vibe panel background host"
```

Expected: commit succeeds.

---

### Task 3: Layer The Background Behind Content

**Files:**
- Modify: `src/styles/layout.css`

- [ ] **Step 1: Add CSS for the WebGL host**

Add this block after `.panel--vibe`:

```css
.panel__webgl-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0.48;
  mix-blend-mode: screen;
}

.panel__webgl-bg canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.panel__webgl-bg::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(168deg, rgba(10, 13, 20, 0.48), rgba(7, 9, 14, 0.72)),
    radial-gradient(circle at 22% 18%, rgba(255, 255, 255, 0.05), transparent 38%);
}
```

- [ ] **Step 2: Keep right panel content above the background**

Replace the existing `.panel--vibe .panel__inner` rule:

```css
.panel--vibe .panel__inner {
  gap: 0.92rem;
}
```

with:

```css
.panel--vibe .panel__inner {
  z-index: 1;
  gap: 0.92rem;
}
```

- [ ] **Step 3: Run build**

Run:

```bash
npm run build
```

Expected:

```text
✓ built in
```

- [ ] **Step 4: Commit CSS layering**

Run:

```bash
git add src/styles/layout.css
git commit -m "Layer vibe panel WebGL background"
```

Expected: commit succeeds.

---

### Task 4: Implement WebGL Background Module

**Files:**
- Create: `src/scripts/webgl-background.ts`

- [ ] **Step 1: Create the module**

Create `src/scripts/webgl-background.ts` with this content:

```ts
import * as THREE from "three";

const VERTEX_SHADER = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

const FRAGMENT_SHADER = `
uniform float u_time;
uniform vec2 u_resolution;

vec2 hash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(in vec2 p) {
  const float K1 = 0.366025404;
  const float K2 = 0.211324865;
  vec2 i = floor(p + (p.x + p.y) * K1);
  vec2 a = p - i + (i.x + i.y) * K2;
  float m = step(a.y, a.x);
  vec2 o = vec2(m, 1.0 - m);
  vec2 b = a - o + K2;
  vec2 c = a - 1.0 + 2.0 * K2;
  vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
  vec3 n = h * h * h * h * vec3(dot(a, hash(i + 0.0)), dot(b, hash(i + o)), dot(c, hash(i + 1.0)));
  return dot(n, vec3(70.0));
}

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  st.x *= u_resolution.x / u_resolution.y;

  vec2 q = vec2(0.0);
  q.x = noise(st + u_time * 0.035);
  q.y = noise(st + vec2(1.0));

  vec2 r = vec2(0.0);
  r.x = noise(st + q + vec2(1.7, 9.2) + u_time * 0.09);
  r.y = noise(st + q + vec2(8.3, 2.8) + u_time * 0.075);

  float f = noise(st + r);

  vec3 color1 = vec3(0.035, 0.055, 0.085);
  vec3 color2 = vec3(0.13, 0.105, 0.062);
  vec3 color3 = vec3(0.07, 0.035, 0.105);

  vec3 finalColor = mix(color1, color2, clamp((f * f) * 2.1, 0.0, 1.0));
  finalColor = mix(finalColor, color3, clamp(length(q) * 0.72, 0.0, 1.0));
  finalColor *= 0.38 + 0.34 * smoothstep(-0.2, 0.9, f);

  gl_FragColor = vec4(finalColor, 0.82);
}
`;

interface VibePanelBackgroundController {
  destroy(): void;
}

export function attachVibePanelBackground(root: ParentNode): VibePanelBackgroundController | undefined {
  const host = root.querySelector<HTMLElement>("[data-webgl-background]");

  if (!host || prefersReducedMotion()) {
    return undefined;
  }

  try {
    return createVibePanelBackground(host);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("Unable to initialize vibe panel WebGL background.", error);
    }

    return undefined;
  }
}

function createVibePanelBackground(host: HTMLElement): VibePanelBackgroundController {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "low-power"
  });
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new THREE.PlaneGeometry(2, 2);
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    uniforms: {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(1, 1) }
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER
  });
  const mesh = new THREE.Mesh(geometry, material);
  let frameId: number | undefined;

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.append(renderer.domElement);
  scene.add(mesh);

  const resize = (): void => {
    const width = Math.max(1, Math.floor(host.clientWidth));
    const height = Math.max(1, Math.floor(host.clientHeight));

    renderer.setSize(width, height, false);
    material.uniforms.u_resolution.value.set(width, height);
  };

  const render = (time: number): void => {
    material.uniforms.u_time.value = time * 0.001;
    renderer.render(scene, camera);
    frameId = window.requestAnimationFrame(render);
  };

  const resizeObserver = new ResizeObserver(resize);

  resizeObserver.observe(host);
  resize();
  frameId = window.requestAnimationFrame(render);

  return {
    destroy(): void {
      if (frameId !== undefined) {
        window.cancelAnimationFrame(frameId);
      }

      resizeObserver.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    }
  };
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
```

- [ ] **Step 2: Run build**

Run:

```bash
npm run build
```

Expected:

```text
✓ built in
```

- [ ] **Step 3: Commit module**

Run:

```bash
git add src/scripts/webgl-background.ts
git commit -m "Implement vibe panel WebGL background"
```

Expected: commit succeeds.

---

### Task 5: Initialize The Background After Render

**Files:**
- Modify: `src/app.ts`

- [ ] **Step 1: Import the WebGL initializer**

Add this import below the existing interaction import:

```ts
import { attachVibePanelBackground } from "./scripts/webgl-background";
```

- [ ] **Step 2: Call the initializer after rendering**

In `bootstrapApp()`, change:

```ts
    container.innerHTML = renderApp(navigationData);
    attachInteractions(container);
```

to:

```ts
    container.innerHTML = renderApp(navigationData);
    attachVibePanelBackground(container);
    attachInteractions(container);
```

- [ ] **Step 3: Run build**

Run:

```bash
npm run build
```

Expected:

```text
✓ built in
```

- [ ] **Step 4: Commit app initialization**

Run:

```bash
git add src/app.ts
git commit -m "Initialize vibe panel background"
```

Expected: commit succeeds.

---

### Task 6: Browser Verification

**Files:**
- No source changes expected.

- [ ] **Step 1: Start dev server**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Expected: Vite prints a local URL, typically `http://127.0.0.1:5173/`.

- [ ] **Step 2: Desktop visual check**

Open the local URL in a browser and verify:

- The right `.panel--vibe` panel has a restrained animated dark fluid background.
- The left `.panel--blog` panel does not show the WebGL animation.
- The navigation text and cards remain readable.
- Hovering and clicking navigation links still works.

- [ ] **Step 3: Mobile visual check**

Use browser device emulation around `390x844` and verify:

- The right panel still shows the restrained background.
- No text overlaps the background host or canvas.
- The page remains scrollable/usable as before.

- [ ] **Step 4: Reduced motion check**

Emulate `prefers-reduced-motion: reduce`, reload, and verify:

- No canvas is appended under `[data-webgl-background]`.
- The static CSS background remains visible.

- [ ] **Step 5: Final build check**

Stop the dev server and run:

```bash
npm run build
```

Expected:

```text
✓ built in
```

- [ ] **Step 6: Commit final verification notes if source changed**

If browser verification required source adjustments, commit them with:

```bash
git add src
git commit -m "Tune vibe panel WebGL background"
```

If no source changes were needed, do not create an empty commit.
