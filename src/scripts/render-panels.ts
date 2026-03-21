import type { NavigationData, PanelConfig, PanelKey, PanelLink } from "../types/navigation";

const PANEL_LABELS: Record<PanelKey, string> = {
  blog: "博客",
  vibe: "导航"
};

const PANEL_LINK_LABELS: Record<PanelKey, string> = {
  blog: "博客内容",
  vibe: "站点导航"
};

export function renderApp(data: NavigationData): string {
  return `
    <main class="app-shell">
      <section
        class="split-shell"
        data-split
        data-desktop-state="idle"
        data-mobile-state="none"
        aria-label="主导航分屏"
      >
        <button
          class="mobile-back"
          type="button"
          data-mobile-back
          aria-label="返回分屏视图"
          hidden
        >
          返回
        </button>
        ${renderPanel("blog", data.panels.blog, data.meta.owner)}
        ${renderPanel("vibe", data.panels.vibe, data.meta.owner)}
      </section>
    </main>
  `;
}

function renderPanel(panelKey: PanelKey, panel: PanelConfig, owner?: string): string {
  const isBlogPanel = panelKey === "blog";
  const showPrimaryAction = panelKey === "blog";
  const panelName = PANEL_LABELS[panelKey];
  const linksLabel = PANEL_LINK_LABELS[panelKey];
  const contentId = `panel-content-${panelKey}`;
  const panelThemeClass = panel.theme === "dark" ? "panel--dark" : "panel--light";
  const primaryUrl = toSafeUrl(panel.primary.url);
  const primaryAttrs = anchorAttributes(primaryUrl);
  const aboutAttrs = anchorAttributes(toSafeUrl(withPath(primaryUrl, "about")));
  const copyrightText = owner ? owner : "站点作者";
  const ariaControlsAttr = isBlogPanel ? "" : `aria-controls="${contentId}"`;

  return `
    <article class="panel panel--${panelKey} ${panelThemeClass}" data-panel="${panelKey}">
      <div class="panel__inner">
        <p class="panel__eyebrow">${escapeHtml(panel.eyebrow)}</p>
        <h1 class="panel__title">${escapeHtml(panel.title)}</h1>
        <p class="panel__description">${escapeHtml(panel.description)}</p>

        <div class="panel__actions">
          ${
            showPrimaryAction
              ? `<a class="panel__primary" ${primaryAttrs}>${escapeHtml(panel.primary.label)}</a>`
              : ""
          }
          <button
            class="panel__open"
            type="button"
            data-open-panel="${panelKey}"
            ${ariaControlsAttr}
            aria-expanded="false"
          >
            展开${escapeHtml(panelName)}
          </button>
        </div>

        ${
          isBlogPanel
            ? `
              <nav class="blog-side__menu" aria-label="博客快捷导航">
                <a class="blog-side__menu-link" ${aboutAttrs}>关于</a>
              </nav>
              <p class="blog-side__copyright">© ${new Date().getFullYear()}. ${escapeHtml(
                copyrightText
              )}.</p>
            `
            : `
              <p class="panel__links-label">${escapeHtml(linksLabel)}</p>
              ${
                panel.links.length
                  ? renderLinks(contentId, panel.links)
                  : `
                    <p id="${contentId}" class="panel__empty">
                      暂无导航链接，请在 data.json 中添加。
                    </p>
                  `
              }
            `
        }
      </div>
    </article>
  `;
}

function renderLinks(contentId: string, links: PanelLink[]): string {
  if (!links.length) {
    return `
      <p id="${contentId}" class="panel__empty">
        暂无可展示的导航链接。
      </p>
    `;
  }

  return `
    <ul class="panel__links" id="${contentId}" role="list">
      ${links.map((link) => renderLink(link)).join("")}
    </ul>
  `;
}

function renderLink(link: PanelLink): string {
  const safeUrl = toSafeUrl(link.url);
  const attrs = anchorAttributes(safeUrl);
  const tag = link.tag ? `<span class="panel-link__chip">${escapeHtml(link.tag)}</span>` : "";
  const status = link.status
    ? `<span class="panel-link__chip panel-link__chip--status" data-status="${escapeHtml(
        link.status
      )}">${escapeHtml(formatStatus(link.status))}</span>`
    : "";
  const description = link.description
    ? `<p class="panel-link__description">${escapeHtml(link.description)}</p>`
    : "";

  return `
    <li class="panel-link">
      <a class="panel-link__anchor" ${attrs}>
        <span class="panel-link__row">
          <span class="panel-link__name">${escapeHtml(link.name)}</span>
          <span class="panel-link__chips">${tag}${status}</span>
        </span>
        ${description}
      </a>
    </li>
  `;
}

function formatStatus(status: NonNullable<PanelLink["status"]>): string {
  if (status === "live") {
    return "在线";
  }

  if (status === "beta") {
    return "测试";
  }

  return "私有";
}

function anchorAttributes(url: string): string {
  const escapedUrl = escapeHtml(url);

  return `href="${escapedUrl}"`;
}

function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

function toSafeUrl(input: string): string {
  const normalized = input.trim();

  if (!normalized) {
    return "#";
  }

  if (isExternalUrl(normalized) || normalized.startsWith("/")) {
    return normalized;
  }

  return "#";
}

function withPath(baseUrl: string, nextPath: string): string {
  if (baseUrl === "#") {
    return "#";
  }

  const normalizedPath = nextPath.replace(/^\/+/, "");

  if (!normalizedPath) {
    return baseUrl;
  }

  if (isExternalUrl(baseUrl)) {
    try {
      const url = new URL(baseUrl);
      const basePath = url.pathname.replace(/\/+$/, "");
      url.pathname = `${basePath}/${normalizedPath}`.replace(/\/{2,}/g, "/");
      url.search = "";
      url.hash = "";
      return url.toString();
    } catch {
      return baseUrl;
    }
  }

  if (baseUrl.startsWith("/")) {
    const basePath = baseUrl.replace(/\/+$/, "");
    return `${basePath}/${normalizedPath}`.replace(/\/{2,}/g, "/");
  }

  return baseUrl;
}

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
