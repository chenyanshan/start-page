export type LinkStatus = "live" | "beta" | "private";
export type PanelTheme = "light" | "dark";
export type PanelKey = "blog" | "vibe";

export interface PanelLink {
  name: string;
  url: string;
  description?: string;
  tag?: string;
  status?: LinkStatus;
  featured?: boolean;
}

export interface PanelPrimaryAction {
  label: string;
  url: string;
}

export interface PanelConfig {
  theme: PanelTheme;
  eyebrow: string;
  title: string;
  description: string;
  primary: PanelPrimaryAction;
  links: PanelLink[];
}

export interface NavigationMeta {
  siteName: string;
  tagline: string;
  owner?: string;
}

export interface NavigationData {
  meta: NavigationMeta;
  panels: Record<PanelKey, PanelConfig>;
}

