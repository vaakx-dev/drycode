const state = {
  page: "overview",
  sidebarCollapsed: false,
  modal: null,
  provider: null,
  toast: "",
  toastTimer: null,
  reloadTimer: null,
  diagnostics: "Diagnostics last run 2 minutes ago · 0 blocking findings",
};

const PROVIDERS = [
  { name: "Anthropic", icon: "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg@latest/icons/anthropic.svg", detail: "Credential resolved from environment", state: "Configured" },
  { name: "OpenAI", icon: "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg@latest/icons/openai.svg", detail: "Credential resolved from environment", state: "Configured" },
  { name: "Google", icon: "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg@latest/icons/google.svg", detail: "No credential stored", state: "Needs setup" },
];

const escapeHtml = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const icon = (name, label = "") => `<i data-lucide="${name}"${label ? ` aria-label="${label}"` : ""}></i>`;

function topbar() {
  return `<header class="topbar">
    <button class="topbar-collapse" data-action="collapse" aria-label="${state.sidebarCollapsed ? "Expand" : "Collapse"} sidebar">${icon(state.sidebarCollapsed ? "panel-left-open" : "panel-left-close")}</button>
    <span class="window-drag"></span>
    <div class="window-controls" aria-label="Window controls"><button aria-label="Minimize">${icon("minus")}</button><button aria-label="Maximize">${icon("square")}</button><button aria-label="Close">${icon("x")}</button></div>
  </header>`;
}

const navItems = [
  ["overview", "Overview", "layout-dashboard"],
  ["extensions", "Extensions", "blocks"],
  ["providers", "Providers", "key-round"],
  ["runtime", "Runtime", "cpu"],
  ["data", "Data & Logs", "database"],
  ["about", "About", "info"],
];

function navigation() {
  return `<nav class="navigation-view ${state.sidebarCollapsed ? "collapsed" : ""}" aria-label="Control center navigation">
    <header class="sidebar-brand"><span class="sidebar-logo" title="Drycode">${icon("panels-top-left")}</span><strong>Drycode</strong><span class="dev-badge">Dev</span></header>
    <p class="sidebar-subtitle">Control center</p><div class="sidebar-rule"></div>
    <div class="sidebar-nav"><div class="nav-group-label">System</div>${navItems.map(([id, label, glyph]) => `<button class="nav-item ${state.page === id ? "selected" : ""}" data-nav="${id}" ${state.page === id ? "aria-current=\"page\"" : ""} aria-label="${label}" title="${label}">${icon(glyph)}<span>${label}</span>${id === "runtime" ? `<kbd>R</kbd>` : ""}</button>`).join("")}</div>
    <footer class="sidebar-bottom"><button data-action="back" title="Return to chat">${icon("arrow-left")}<span>Back to chat</span></button><button class="sidebar-icon" data-action="reload" aria-label="Reload Runtime" title="Reload Runtime">${icon("refresh-cw")}</button></footer>
  </nav>`;
}

function cardHeader(glyph, title, description, tone = "", action = "") {
  return `<div class="card-header"><span class="card-icon ${tone}">${icon(glyph)}</span><div class="grow"><h2>${title}</h2><p>${description}</p></div>${action}</div>`;
}

function graphCard() {
  return `<article class="card generation-card">${cardHeader("git-branch", "Extension Graph", "One deterministic graph resolved for this Runtime Generation.", "", `<button class="card-link" data-nav="extensions">Inspect graph ${icon("arrow-up-right")}</button>`)}
    <div class="graph-stage" aria-label="Resolved Extension Graph">
      <div class="graph-row"><div class="graph-node"><span class="node-mark">${icon("layers-3")}</span><div><strong>Drycode Core</strong><small>owner · lifecycle</small></div></div><span class="graph-connector"></span><div class="graph-node"><span class="node-mark amber">${icon("panel-top")}</span><div><strong>Starter Shell</strong><small>active Shell Extension</small></div></div></div>
      <div class="graph-row"><div class="graph-node small"><span class="node-mark purple">${icon("monitor")}</span><div><strong>UI Runtime</strong><small>runtime service</small></div></div><span class="graph-connector"></span><div class="graph-node small"><span class="node-mark purple">${icon("terminal")}</span><div><strong>Harness Runtime</strong><small>runtime service</small></div></div><span class="graph-connector"></span><div class="graph-node small"><span class="node-mark">${icon("arrow-left-right")}</span><div><strong>UI-Harness Bridge</strong><small>generation-scoped</small></div></div></div>
    </div><div class="owner-line"><span class="owner-badge drycode">Drycode-owned · 4</span><span class="owner-badge starter">Starter Shell · 1</span><span class="owner-badge extension">extension-owned · 3</span></div>
  </article>`;
}

function quickCard() {
  return `<article class="card quick-card">${cardHeader("activity", "Runtime Generation", "Supervised as one unit.", "blue")}
    <div class="stat-list"><div class="stat-row">${icon("hash")}<span>Generation</span><strong class="blue">18</strong></div><div class="stat-row">${icon("clock-3")}<span>Started</span><strong>14:32:08</strong></div><div class="stat-row">${icon("shield-check")}<span>Graph status</span><strong class="blue">Resolved</strong></div><div class="stat-row">${icon("rotate-ccw")}<span>Reload impact</span><strong class="amber">Full unit</strong></div></div>
  </article>`;
}

function runtimeCards() {
  return `<section><div class="section-divider"><span>Runtime composition</span><i></i></div><div class="three-col">
    <article class="card runtime-card">${cardHeader("monitor", "UI Runtime", "Composes UI services and mounts the effective Shell service.", "purple")}<div class="runtime-detail"><b>Running</b><small>generation-18 · pid 8420</small></div><div class="runtime-footer"><span class="status-dot"></span>Service Registry frozen</div></article>
    <article class="card runtime-card">${cardHeader("terminal", "Harness Runtime", "Executes Harness entry points for Sessions and Runs.", "purple")}<div class="runtime-detail"><b>Running</b><small>generation-18 · pid 8424</small></div><div class="runtime-footer"><span class="status-dot"></span>Service Registry frozen</div></article>
    <article class="card runtime-card">${cardHeader("arrow-left-right", "UI-Harness Bridge", "Validated Calls and Streams between paired runtimes.", "") }<div class="runtime-detail"><b>Connected</b><small>generation-18 · 4 endpoints</small></div><div class="runtime-footer"><span class="status-dot"></span>Bidirectional channel</div></article>
  </div></section>`;
}

function providerPreview() {
  return `<section><div class="section-divider"><span>Model providers</span><i></i></div><article class="card provider-preview"><div>${cardHeader("key-round", "Provider configuration", "Credentials and request adapters are owned by Model Provider extensions.", "")}<div class="provider-summary">${PROVIDERS.map((provider) => `<img src="${provider.icon}" alt="${provider.name} mark"><span>${provider.name}</span>`).join('<i></i>')}</div></div><button data-nav="providers">Manage providers ${icon("arrow-right")}</button></article></section>`;
}

function overview() {
  return `<div class="page-wrap"><header class="page-header"><div><span class="eyebrow">Drycode / Control center</span><h1>Control center</h1><p>Inspect the resolved system, its runtime generation, and the extensions that own each surface.</p></div><div class="page-header-actions"><span class="runtime-chip"><i class="status-dot"></i>Generation 18 · Running</span><button class="reload-button" data-action="reload">${icon("refresh-cw")}Reload</button></div></header>
    <div class="overview-grid">${graphCard()}${quickCard()}</div>${runtimeCards()}${providerPreview()}
    <section><div class="section-divider"><span>Operational notes</span><i></i></div><div class="info-grid"><article class="card info-card"><h2>Drycode Home</h2><p>Durable local root for installed extensions, cache, diagnostics, and temporary data.</p><div class="info-line">${icon("folder-open")}<span>Location</span><strong class="path">~/.drycode/</strong></div><div class="info-line">${icon("package")}<span>Installed extensions</span><strong>8</strong></div></article><article class="card info-card"><h2>Diagnostics</h2><p>Core-owned checks for graph resolution, runtime health, and bridge endpoints.</p><div class="info-line">${icon("stethoscope")}<span>Last run</span><strong class="blue">2 minutes ago</strong></div><div class="info-line">${icon("circle-check")}<span>Blocking findings</span><strong>0</strong></div></article></div></section>
    <div class="diagnostic-box" style="margin-top:12px">${icon("triangle-alert")}<span><b>Reload requirements:</b> graph or runtime changes stop and replace the complete Runtime Generation.</span><button data-action="reload">Review</button></div>
  </div>`;
}

function extensionsPage() {
  const rows = [
    ["layers-3", "Drycode Core", "Discovers extensions, resolves the graph, and controls lifecycle.", "Drycode-owned", "1.8.0", ""],
    ["panel-top", "Starter Shell", "Effective Shell service · owns the root user interface.", "Starter Shell", "0.6.2", "amber"],
    ["monitor", "UI Runtime", "Composes UI services and executes UI entry points.", "Drycode-owned", "1.8.0", "purple"],
    ["terminal", "Harness Runtime", "Independent coding-agent runtime for Harness extensions.", "Drycode-owned", "1.8.0", "purple"],
    ["plug-zap", "Workspace Tools", "Workspace context and local tool endpoints.", "extension-owned", "0.4.1", "purple"],
    ["message-square-code", "Starter Sessions", "Session and Run UI contribution for the Starter Shell.", "extension-owned", "0.6.2", "purple"],
  ];
  return detailLayout("Extensions", "The installed set that makes up the current Extension Graph. Ownership stays explicit at each boundary.", `<div class="detail-section"><div class="section-divider"><span>Resolved graph · 6 of 8 installed</span><i></i></div><div class="extension-list">${rows.map(([glyph, title, desc, owner, version, tone]) => `<article class="card extension-row"><span class="extension-mark ${tone}">${icon(glyph)}</span><div class="extension-copy"><strong>${title}<span class="ownership ${owner === "Starter Shell" ? "starter" : owner === "extension-owned" ? "extension" : ""}">${owner}</span></strong><p>${desc}</p></div><span class="extension-version">v${version}</span></article>`).join("")}</div></div><div class="diagnostic-box" style="margin-top:16px">${icon("info")}<span>Extensions are fully trusted local packages. Drycode accepts or rejects the graph as a whole.</span><button data-action="toast" data-message="Graph manifest copied">Copy manifest</button></div>`);
}

function providerRows() {
  return PROVIDERS.map((provider) => `<article class="card provider-row"><span class="provider-logo"><img src="${provider.icon}" alt="${provider.name} provider mark"></span><div class="provider-copy"><strong>${provider.name}</strong><small>${provider.detail}</small></div><span class="provider-state">${provider.state}</span><button data-provider="${provider.name}">${provider.state === "Configured" ? "Configure" : "Add credential"}</button></article>`).join("");
}

function providersPage() {
  return detailLayout("Providers", "Configure Model Provider extensions and how Drycode resolves their credentials. Model and thinking selection belongs to a Session, not this control center.", `<div class="detail-section"><div class="section-divider"><span>Configured extensions</span><i></i></div><div class="provider-list-page">${providerRows()}</div></div><div class="detail-section"><div class="section-divider"><span>Resolution rules</span><i></i></div><div class="info-grid"><article class="card info-card">${cardHeader("key-round", "Credential resolution", "Provider extensions own discovery, credential resolution, requests, and normalized response streaming.", "") }<div class="info-line">${icon("lock-keyhole")}<span>Storage</span><strong>Environment / OS keychain</strong></div><div class="info-line">${icon("user-round")}<span>Scope</span><strong>Per provider extension</strong></div></article><article class="card info-card">${cardHeader("list-filter", "Available contributions", "Configuration is available to the active graph.", "") }<div class="info-line">${icon("boxes")}<span>Model providers</span><strong>3 discovered</strong></div><div class="info-line">${icon("circle-alert")}<span>Needs attention</span><strong class="amber">1 provider</strong></div></article></div></div>`);
}

function runtimePage() {
  return detailLayout("Runtime", "The current Runtime Generation is a paired, supervised instance of the resolved graph.", `<div class="detail-section"><div class="section-divider"><span>Generation 18</span><i></i></div><div class="info-grid"><article class="card info-card">${cardHeader("activity", "Runtime Generation", "Starts, runs, and stops as one unit.", "") }<div class="info-line">${icon("circle-check")}<span>State</span><strong class="blue">Running</strong></div><div class="info-line">${icon("git-commit-horizontal")}<span>Graph</span><strong>Resolved</strong></div><div class="info-line">${icon("clock-3")}<span>Started</span><strong>Today, 14:32</strong></div></article><article class="card info-card">${cardHeader("refresh-cw", "Reload requirements", "A reload is required when the graph or runtime composition changes.", "amber") }<div class="info-line">${icon("octagon-alert")}<span>Active Runs</span><strong class="amber">Will interrupt</strong></div><div class="info-line">${icon("database")}<span>Session records</span><strong>Remain available</strong></div><button class="reload-button" data-action="reload" style="margin-top:13px">${icon("refresh-cw")}Reload Runtime</button></article></div></div><div class="detail-section"><div class="section-divider"><span>Paired runtimes</span><i></i></div><div class="three-col"><article class="card runtime-card">${cardHeader("monitor", "UI Runtime", "Replaceable UI service runtime.", "purple")}<div class="runtime-detail"><b>Healthy</b><small>Registry · 12 slots · pid 8420</small></div></article><article class="card runtime-card">${cardHeader("terminal", "Harness Runtime", "Independent Harness service runtime.", "purple")}<div class="runtime-detail"><b>Healthy</b><small>Registry · 9 slots · pid 8424</small></div></article><article class="card runtime-card">${cardHeader("arrow-left-right", "UI-Harness Bridge", "Generation-scoped remote channel.", "") }<div class="runtime-detail"><b>Connected</b><small>4 endpoints · 0 queued streams</small></div></article></div></div>`);
}

function dataPage() {
  return detailLayout("Data & Logs", "See where Drycode Home keeps durable system data and review Core-owned lifecycle diagnostics.", `<div class="detail-section"><div class="section-divider"><span>Drycode Home</span><i></i></div><div class="info-grid"><article class="card info-card">${cardHeader("folder-open", "Durable data", "Per-user root; not workspace or project configuration.", "") }<div class="info-line">${icon("folder")}<span>Root</span><strong class="path">~/.drycode/</strong></div><div class="info-line">${icon("package")}<span>Extensions</span><strong class="path">~/.drycode/extensions</strong></div><div class="info-line">${icon("archive")}<span>Cache & temporary</span><strong class="path">~/.drycode/cache</strong></div></article><article class="card info-card">${cardHeader("stethoscope", "Diagnostics", "Core records graph and runtime health findings here.", "") }<div class="info-line">${icon("clock-3")}<span>Last run</span><strong class="blue">2 minutes ago</strong></div><div class="info-line">${icon("circle-check")}<span>Blocking findings</span><strong>0</strong></div><button class="reload-button" data-action="diagnose" style="margin-top:13px">${icon("scan-search")}Run diagnostics</button></article></div></div><div class="detail-section"><div class="section-divider"><span>Core event log</span><i></i></div><div class="log-toolbar"><span class="log-filter">Showing latest lifecycle events</span><span class="grow"></span><button data-action="clear-logs" style="font-size:10px">Clear view</button></div><div class="card log-table"><div class="log-row"><time>14:32:08.412</time><span class="log-level">info</span><span>Runtime Generation 18 started</span></div><div class="log-row"><time>14:32:08.221</time><span class="log-level">info</span><span>UI-Harness Bridge connected · 4 endpoints</span></div><div class="log-row"><time>14:32:07.944</time><span class="log-level warn">warn</span><span>Google provider has no resolved credential</span></div><div class="log-row"><time>14:31:59.018</time><span class="log-level">info</span><span>Extension Graph accepted · 8 manifests discovered</span></div></div></div>`);
}

function aboutPage() {
  return detailLayout("About Drycode", "A minimal, locally extensible AI coding application developers compose into the tool they want.", `<div class="detail-section"><div class="info-grid"><article class="card info-card">${cardHeader("panels-top-left", "Drycode Core", "The featureless host that discovers extensions, resolves their relationships, and controls lifecycle.", "") }<div class="info-line">${icon("tag")}<span>Core version</span><strong>1.8.0-dev</strong></div><div class="info-line">${icon("monitor-smartphone")}<span>Desktop window</span><strong>Open</strong></div></article><article class="card info-card">${cardHeader("book-open", "Architecture", "Stable boundaries keep extensions replaceable without turning Core into an IDE or application shell.", "purple") }<div class="info-line">${icon("box")}<span>Extension model</span><strong>Fully trusted local</strong></div><div class="info-line">${icon("file-code-2")}<span>Manifest contract</span><strong>v1</strong></div></article></div></div><div class="detail-section"><div class="section-divider"><span>Useful paths</span><i></i></div><div class="card info-card"><div class="info-line">${icon("folder")}<span>Drycode Home</span><strong class="path">~/.drycode/</strong><button data-action="copy-home" style="font-size:9px">Copy</button></div><div class="info-line">${icon("book")}<span>Documentation</span><strong>Architecture notes</strong><button data-action="toast" data-message="Documentation opened">Open</button></div></div></div>`);
}

function detailLayout(title, description, content) {
  return `<div class="page-wrap detail-page"><header class="detail-header"><div><span class="eyebrow">Drycode / Control center</span><h1>${title}</h1><p>${description}</p></div><button class="card-link" data-nav="overview">${icon("arrow-left")}Overview</button></header>${content}</div>`;
}

function providerModal() {
  const provider = PROVIDERS.find((item) => item.name === state.provider) || PROVIDERS[0];
  return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="provider-title"><div class="dialog-title"><span class="dialog-icon">${icon("key-round")}</span><div><span class="eyebrow">Model Provider extension</span><h2 id="provider-title">Configure ${provider.name}</h2></div></div><p>Drycode asks the ${provider.name} extension to resolve credentials and handle model requests. This setting does not select a Session model.</p><div class="form-field"><label for="credential">Credential reference</label><input id="credential" value="${provider.state === "Configured" ? `${provider.name.toLowerCase()}-environment` : ""}" placeholder="Environment variable or keychain reference"></div><div class="dialog-actions"><button class="plain-button" data-action="close-modal">Cancel</button><button data-action="save-provider">Save configuration</button></div></section></div>`;
}

function reloadModal() {
  if (state.modal === "reloading") return `<div class="modal-shade"><section class="dialog reload-progress" role="dialog" aria-modal="true"><span class="dialog-icon amber">${icon("refresh-cw")}</span><span class="eyebrow">Runtime lifecycle</span><h2>Reloading Runtime...</h2><p>Stopping the current generation and starting a fresh UI and Harness pair.</p><div class="progress-track"><i></i></div><small>Starting Runtime Generation 19</small></section></div>`;
  return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="reload-title"><div class="dialog-title"><span class="dialog-icon amber">${icon("refresh-cw")}</span><div><span class="eyebrow">Runtime lifecycle</span><h2 id="reload-title">Reload the Runtime?</h2></div></div><p>Drycode will stop the complete UI and Harness Runtime Generation, then start a fresh generation. Durable Sessions remain available.</p><div class="diagnostic-box">${icon("triangle-alert")}<span>Active work will be interrupted. Session records stay safe.</span></div><div class="dialog-actions"><button class="plain-button" data-action="close-modal">Cancel</button><button class="danger-button" data-action="confirm-reload">${icon("refresh-cw")}Reload Drycode</button></div></section></div>`;
}

function render() {
  const pages = { overview, extensions: extensionsPage, providers: providersPage, runtime: runtimePage, data: dataPage, about: aboutPage };
  const body = (pages[state.page] || overview)();
  document.querySelector("#app").innerHTML = `<div class="app-frame">${topbar()}<div class="nav-layout ${state.sidebarCollapsed ? "sidebar-collapsed" : ""}">${navigation()}<main class="control-main">${body}</main></div></div>${state.modal === "provider" ? providerModal() : state.modal ? reloadModal() : ""}${state.toast ? `<div class="toast" role="status">${icon("info")}<span>${escapeHtml(state.toast)}</span></div>` : ""}`;
  if (window.lucide) window.lucide.createIcons();
  bind();
}

function showToast(message) {
  clearTimeout(state.toastTimer); state.toast = message; render();
  state.toastTimer = setTimeout(() => { state.toast = ""; render(); }, 2200);
}

function bind() {
  document.querySelectorAll("[data-nav]").forEach((button) => button.addEventListener("click", () => { state.page = button.dataset.nav; state.modal = null; render(); }));
  document.querySelectorAll('[data-action="collapse"]').forEach((button) => button.addEventListener("click", () => { state.sidebarCollapsed = !state.sidebarCollapsed; render(); }));
  document.querySelectorAll('[data-action="reload"]').forEach((button) => button.addEventListener("click", () => { state.modal = "reload"; render(); }));
  document.querySelectorAll('[data-action="close-modal"]').forEach((button) => button.addEventListener("click", () => { state.modal = null; state.provider = null; render(); }));
  document.querySelectorAll('[data-action="confirm-reload"]').forEach((button) => button.addEventListener("click", () => { state.modal = "reloading"; render(); clearTimeout(state.reloadTimer); state.reloadTimer = setTimeout(() => { state.modal = null; showToast("Runtime Generation 19 is running"); }, 2300); }));
  document.querySelectorAll('[data-provider]').forEach((button) => button.addEventListener("click", () => { state.provider = button.dataset.provider; state.modal = "provider"; render(); }));
  document.querySelectorAll('[data-action="save-provider"]').forEach((button) => button.addEventListener("click", () => { state.modal = null; showToast(`${state.provider} configuration saved`); state.provider = null; }));
  document.querySelectorAll('[data-action="diagnose"]').forEach((button) => button.addEventListener("click", () => showToast("Diagnostics complete · 0 blocking findings")));
  document.querySelectorAll('[data-action="copy-home"]').forEach((button) => button.addEventListener("click", () => showToast("Drycode Home path copied")));
  document.querySelectorAll('[data-action="toast"]').forEach((button) => button.addEventListener("click", () => showToast(button.dataset.message || "Done")));
  document.querySelectorAll('[data-action="clear-logs"]').forEach((button) => button.addEventListener("click", () => showToast("Log view cleared")));
  document.querySelectorAll('[data-action="back"]').forEach((button) => button.addEventListener("click", () => showToast("Starter chat is outside this prototype")));
  document.querySelectorAll(".modal-shade[data-dismiss]").forEach((shade) => shade.addEventListener("click", (event) => { if (event.target === shade) { state.modal = null; state.provider = null; render(); } }));
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.modal) { state.modal = null; state.provider = null; render(); }
  if (event.key.toLowerCase() === "r" && !event.metaKey && !event.ctrlKey && !event.altKey && !state.modal && document.activeElement?.tagName !== "INPUT") { state.page = "runtime"; render(); }
});

render();
