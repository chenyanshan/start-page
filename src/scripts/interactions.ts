import type { PanelKey } from "../types/navigation";
import { canUseDesktopHover, type DesktopState, type MobileState } from "./state";

const BG_EASE = 0.28;

export function attachInteractions(root: HTMLElement): void {
  const splitShell = root.querySelector<HTMLElement>("[data-split]");

  if (!splitShell) {
    return;
  }

  const openButtons = Array.from(
    splitShell.querySelectorAll<HTMLButtonElement>("[data-open-panel]")
  );
  const mobileBack = splitShell.querySelector<HTMLButtonElement>("[data-mobile-back]");

  let mobileState: MobileState = "none";
  let bgRaf: number | undefined;
  let bgCurrentX = 50;
  let bgCurrentY = 50;
  let bgTargetX = 50;
  let bgTargetY = 50;
  let bgInitialized = false;

  const applyDesktopState = (state: DesktopState): void => {
    splitShell.dataset.desktopState = state;
  };

  const setMobileState = (state: MobileState): void => {
    mobileState = state;
    splitShell.dataset.mobileState = state;

    const isExpanded = state !== "none" && !canUseDesktopHover();
    document.body.classList.toggle("is-mobile-expanded", isExpanded);

    if (mobileBack) {
      mobileBack.hidden = !isExpanded;
      mobileBack.setAttribute("aria-hidden", String(!isExpanded));
    }

    openButtons.forEach((button) => {
      const panel = button.dataset.openPanel as PanelKey | undefined;
      button.setAttribute("aria-expanded", String(panel === state));
    });
  };

  const applyBackgroundPoint = (): void => {
    bgCurrentX += (bgTargetX - bgCurrentX) * BG_EASE;
    bgCurrentY += (bgTargetY - bgCurrentY) * BG_EASE;

    document.documentElement.style.setProperty("--bg-x", `${bgCurrentX.toFixed(2)}%`);
    document.documentElement.style.setProperty("--bg-y", `${bgCurrentY.toFixed(2)}%`);

    const deltaX = Math.abs(bgTargetX - bgCurrentX);
    const deltaY = Math.abs(bgTargetY - bgCurrentY);

    if (deltaX < 0.18 && deltaY < 0.18) {
      bgRaf = undefined;
      return;
    }

    bgRaf = window.requestAnimationFrame(applyBackgroundPoint);
  };

  const scheduleBackgroundPoint = (): void => {
    if (bgRaf === undefined) {
      bgRaf = window.requestAnimationFrame(applyBackgroundPoint);
    }
  };

  const moveBackgroundToCenter = (): void => {
    bgTargetX = 50;
    bgTargetY = 50;
    scheduleBackgroundPoint();
  };

  splitShell.addEventListener("pointermove", (event) => {
    if (!canUseDesktopHover()) {
      return;
    }

    const rect = splitShell.getBoundingClientRect();
    const nextX = ((event.clientX - rect.left) / rect.width) * 100;
    const nextY = ((event.clientY - rect.top) / rect.height) * 100;

    bgTargetX = clamp(nextX, 0, 100);
    bgTargetY = clamp(nextY, 0, 100);

    if (!bgInitialized) {
      bgCurrentX = bgTargetX;
      bgCurrentY = bgTargetY;
      bgInitialized = true;
    }

    scheduleBackgroundPoint();
  });

  splitShell.addEventListener("pointerleave", () => {
    if (!canUseDesktopHover()) {
      return;
    }

    moveBackgroundToCenter();
  });

  openButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();

      if (canUseDesktopHover()) {
        return;
      }

      const panel = button.dataset.openPanel as PanelKey | undefined;

      if (!panel) {
        return;
      }

      applyDesktopState("idle");
      setMobileState(panel);
    });
  });

  mobileBack?.addEventListener("click", () => {
    applyDesktopState("idle");
    setMobileState("none");
  });

  splitShell.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileState !== "none") {
      event.preventDefault();
      applyDesktopState("idle");
      setMobileState("none");
    }
  });

  const syncWithViewportMode = (): void => {
    if (canUseDesktopHover()) {
      setMobileState("none");
      applyDesktopState("idle");
      moveBackgroundToCenter();
      return;
    }

    moveBackgroundToCenter();
    applyDesktopState("idle");
  };

  document.documentElement.style.setProperty("--bg-x", "50%");
  document.documentElement.style.setProperty("--bg-y", "50%");
  window.addEventListener("resize", syncWithViewportMode, { passive: true });
  syncWithViewportMode();
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
