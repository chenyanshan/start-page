import type { PanelKey } from "../types/navigation";

export type DesktopState = "idle" | "left-active" | "right-active";
export type MobileState = "none" | PanelKey;

export function canUseDesktopHover(): boolean {
  return window.matchMedia("(min-width: 960px) and (hover: hover) and (pointer: fine)")
    .matches;
}

