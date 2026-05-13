// @ts-expect-error three does not publish declarations in this package version.
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

export function attachVibePanelBackground(
  root: ParentNode
): VibePanelBackgroundController | undefined {
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

function createVibePanelBackground(
  host: HTMLElement
): VibePanelBackgroundController {
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
