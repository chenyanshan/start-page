# Vibe Panel WebGL Background Design

## Goal

Add the animation from `/Users/chenyanshan/Downloads/gemini-code-1778597201201.html` seamlessly into the current start page as a restrained animated background for the right-side navigation panel only.

## Confirmed Decisions

- Placement: inside the right `.panel--vibe` panel, behind its existing content.
- Intensity: restrained. The animation should read as background texture, not the primary visual element.
- Implementation approach: install and bundle `three` locally instead of importing it from a CDN.

## Architecture

Create a small WebGL background module at `src/scripts/webgl-background.ts`, responsible for:

- Finding the right-side panel background host.
- Creating a `THREE.WebGLRenderer` canvas with `alpha` enabled.
- Rendering a full-screen shader plane using the provided dark fluid gradient GLSL.
- Handling resize with the panel dimensions rather than the full window dimensions.
- Returning a cleanup function for future lifecycle safety.

The app bootstrapping flow should initialize this module after `renderApp()` injects the DOM and before or around `attachInteractions(container)`.

## DOM And CSS

The right panel should include or receive a dedicated background host element, for example:

```html
<div class="panel__webgl-bg" aria-hidden="true"></div>
```

CSS should keep the host and canvas behind `.panel__inner`:

- `.panel--vibe` remains `position: absolute` and `overflow: hidden`.
- `.panel__webgl-bg` is `position: absolute; inset: 0; z-index: 0; pointer-events: none`.
- `.panel__inner` remains above it with `z-index: 1`.
- A dark overlay or lower canvas opacity keeps text and navigation cards readable.
- Existing CSS gradients remain as fallback if WebGL fails.

## Shader Adaptation

Reuse the source HTML shader structure:

- Orthographic camera.
- Full-screen plane.
- `u_time` and `u_resolution` uniforms.
- The simplex-style noise functions and dark blue, muted gold, and purple color mixing.

Adjust the visual treatment for the current page:

- Lower brightness and contrast from the original demo.
- Use transparent rendering or overlay blending so the panel keeps its current glassy dark tone.
- Respect `prefers-reduced-motion` by not starting the animation loop when reduced motion is requested; the fallback CSS remains visible.

## Error Handling

If `three` cannot initialize, WebGL is unavailable, shader compilation fails, or the target element is missing:

- Do not throw from `bootstrapApp`.
- Leave the current static CSS panel background visible.
- Log a concise warning only in development mode.

## Testing And Verification

Run:

- `npm install three` to add the local runtime dependency.
- Add TypeScript types if needed.
- `npm run build`.
- Start the Vite dev server and inspect the page.

Manual checks:

- Right panel shows restrained motion behind navigation content.
- Left panel is unchanged.
- Links and hover interactions still work.
- Mobile layout remains readable.
- Reduced motion disables the animation loop.
