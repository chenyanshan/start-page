import type {
  LinkStatus,
  NavigationData,
  PanelConfig,
  PanelKey,
  PanelLink,
  PanelTheme
} from "../types/navigation";

const FALLBACK_DATA: NavigationData = {
  meta: {
    siteName: "个人导航站",
    tagline: "左侧博客，右侧导航。",
    owner: "站点主人"
  },
  panels: {
    blog: {
      theme: "dark",
      eyebrow: "博客",
      title: "我的博客",
      description: "技术文章与项目记录入口。",
      primary: {
        label: "进入博客",
        url: "https://example.com"
      },
      links: []
    },
    vibe: {
      theme: "light",
      eyebrow: "导航",
      title: "站点导航",
      description: "常用开发站点与工具入口。",
      primary: {
        label: "导航主页",
        url: "https://example.com"
      },
      links: []
    }
  }
};

const VALID_STATUSES: LinkStatus[] = ["live", "beta", "private"];

export async function loadNavigationData(): Promise<NavigationData> {
  const response = await fetch("/data.json", { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  const rawData: unknown = await response.json();
  return sanitizeNavigationData(rawData);
}

function sanitizeNavigationData(rawData: unknown): NavigationData {
  if (!isRecord(rawData)) {
    return FALLBACK_DATA;
  }

  const rawMeta = asRecord(rawData.meta);
  const rawPanels = asRecord(rawData.panels);

  return {
    meta: {
      siteName: asString(rawMeta.siteName, FALLBACK_DATA.meta.siteName),
      tagline: asString(rawMeta.tagline, FALLBACK_DATA.meta.tagline),
      owner: asOptionalString(rawMeta.owner)
    },
    panels: {
      blog: sanitizePanel("blog", rawPanels.blog),
      vibe: sanitizePanel("vibe", rawPanels.vibe)
    }
  };
}

function sanitizePanel(panelKey: PanelKey, rawPanel: unknown): PanelConfig {
  const fallbackPanel = FALLBACK_DATA.panels[panelKey];
  const source = asRecord(rawPanel);

  const links = sanitizeLinks(source.links);

  return {
    theme: asTheme(source.theme, fallbackPanel.theme),
    eyebrow: asString(source.eyebrow, fallbackPanel.eyebrow),
    title: asString(source.title, fallbackPanel.title),
    description: asString(source.description, fallbackPanel.description),
    primary: sanitizePrimary(source.primary, fallbackPanel.primary),
    links
  };
}

function sanitizePrimary(
  rawPrimary: unknown,
  fallbackPrimary: PanelConfig["primary"]
): PanelConfig["primary"] {
  const source = asRecord(rawPrimary);

  return {
    label: asString(source.label, fallbackPrimary.label),
    url: asString(source.url, fallbackPrimary.url)
  };
}

function sanitizeLinks(rawLinks: unknown): PanelLink[] {
  if (!Array.isArray(rawLinks)) {
    return [];
  }

  return rawLinks
    .map((item, index) => sanitizeLink(item, index))
    .filter((item): item is PanelLink => item !== null);
}

function sanitizeLink(rawLink: unknown, index: number): PanelLink | null {
  const source = asRecord(rawLink);
  const defaultName = `链接 ${index + 1}`;

  const name = asString(source.name, defaultName).trim();
  const url = asString(source.url, "").trim();

  if (!name || !url) {
    return null;
  }

  return {
    name,
    url,
    description: asOptionalString(source.description),
    tag: asOptionalString(source.tag),
    status: asStatus(source.status),
    featured: Boolean(source.featured)
  };
}

function asTheme(input: unknown, fallback: PanelTheme): PanelTheme {
  return input === "light" || input === "dark" ? input : fallback;
}

function asStatus(input: unknown): LinkStatus | undefined {
  return VALID_STATUSES.includes(input as LinkStatus) ? (input as LinkStatus) : undefined;
}

function asString(input: unknown, fallback: string): string {
  return typeof input === "string" && input.trim() ? input : fallback;
}

function asOptionalString(input: unknown): string | undefined {
  return typeof input === "string" && input.trim() ? input : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}
