import { attachInteractions } from "./scripts/interactions";
import { loadNavigationData } from "./scripts/load-data";
import { renderApp } from "./scripts/render-panels";

const LOADING_MARKUP = `
  <main class="app-shell app-shell--status">
    <p class="status-title">正在加载导航</p>
    <p class="status-message">正在准备分屏视图...</p>
  </main>
`;

export async function bootstrapApp(container: HTMLElement): Promise<void> {
  container.innerHTML = LOADING_MARKUP;

  try {
    const navigationData = await loadNavigationData();

    container.innerHTML = renderApp(navigationData);
    attachInteractions(container);
  } catch (error) {
    const message = escapeHtml(
      error instanceof Error ? error.message : "初始化失败。"
    );

    container.innerHTML = `
      <main class="app-shell app-shell--status">
        <p class="status-title">数据加载失败</p>
        <p class="status-message">${message}</p>
      </main>
    `;
  }
}

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
