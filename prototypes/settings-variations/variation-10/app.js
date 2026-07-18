const state = {
  sidebarCollapsed: false,
  workspace: "drycode",
  workspaceFilter: "all",
  page: "settings",
  tab: "overview",
  extensionQuery: "",
  expandedExtension: null,
  modal: null,
  toast: "",
  toastTimer: null,
  reloadTimer: null,
  generation: 18,
  graphState: "Resolved",
  preferences: { autoRestore: true, streamDetails: true, confirmReload: true },
  selectedProvider: "Anthropic",
  sessions: [
    { id: "shape", workspace: "drycode", title: "Shape the starter chat", summary: "Map the smallest useful Windows surface", time: "Now", running: true },
    { id: "harness", workspace: "drycode", title: "Extract the Harness", summary: "Compare runtime boundaries and hand-offs", time: "2h", running: false },
    { id: "install", workspace: "agent-lab", title: "Plan the Windows install", summary: "Stopped after comparing package formats", time: "Fri", running: true },
    { id: "recovery", workspace: "agent-lab", title: "Recovery surface notes", summary: "Capture what remains available during Reload", time: "Mon", running: false },
  ],
};

const providers = [
  { name: "Anthropic", mark: "A", className: "anthropic", models: "3 models", detail: "Claude Sonnet 4 · Claude Opus 4", credential: "API key stored" },
  { name: "OpenAI", mark: "O", className: "openai", models: "2 models", detail: "GPT-5 · o3", credential: "API key stored" },
  { name: "Google", mark: "G", className: "google", models: "2 models", detail: "Gemini 2.5 Pro · Gemini 2.5 Flash", credential: "Not configured" },
];
const extensions = [
  { id: "shell", name: "drycode.shell", version: "0.8.2", className: "orange", icon: "panels-top-left", role: "Shell provider", summary: "Owns the effective application surface and composes UI contributions.", entry: "ui.shell", deps: "2 dependencies", slot: "Shell" },
  { id: "harness", name: "drycode.harness", version: "0.8.2", className: "violet", icon: "bot", role: "Harness runtime", summary: "Supplies the independent coding-agent runtime for each Session Run.", entry: "harness.runtime", deps: "1 dependency", slot: "Harness" },
  { id: "anthropic", name: "drycode.provider.anthropic", version: "0.4.0", className: "", icon: "sparkles", role: "Model Provider", summary: "Discovers models, resolves its own credentials, and streams normalized responses.", entry: "model.provider", deps: "none", slot: "Model provider" },
  { id: "workspace", name: "drycode.workspace", version: "0.6.1", className: "", icon: "folder-open", role: "Workspace context", summary: "Provides local Workspace selection and scoped context to the Harness.", entry: "workspace.context", deps: "none", slot: "Workspace" },
  { id: "starter", name: "drycode.starter-chat", version: "0.8.2", className: "", icon: "message-square-code", role: "Starter contribution", summary: "Adds chat composition, Session history, and Tool activity to the Shell.", entry: "ui.contribution", deps: "3 dependencies", slot: "Chat surface" },
];

const escapeHtml = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const icon = (name, label = "") => `<i data-lucide="${name}"${label ? ` aria-label="${escapeHtml(label)}"` : ""}></i>`;
const activeSession = () => state.sessions.find((session) => session.id === "shape") || state.sessions[0];

function topbar() {
  return `<header class="topbar">
    <button class="topbar-collapse" data-action="collapse-sidebar" aria-label="${state.sidebarCollapsed ? "Expand" : "Collapse"} sidebar">${icon(state.sidebarCollapsed ? "panel-left-open" : "panel-left-close")}</button>
    <span class="window-drag"></span>
    <div class="window-controls" aria-label="Window controls"><button aria-label="Minimize">${icon("minus")}</button><button aria-label="Maximize">${icon("square")}</button><button aria-label="Close">${icon("x")}</button></div>
  </header>`;
}

function featuredSession(session) {
  return `<button class="featured-session ${session.id === "shape" ? "selected" : ""}" data-session="${session.id}">
    <span class="featured-meta"><span class="session-source">${icon("message-square-code")}<b>${escapeHtml(session.workspace)}</b></span><time>${escapeHtml(session.time)}</time></span>
    <strong>${escapeHtml(session.title)}</strong>
    <span class="featured-status"><b class="${session.running ? "running" : ""}">${session.running ? "Running" : "Active"}</b><span>${escapeHtml(session.summary)}</span>${icon(session.running ? "loader-circle" : "circle")}</span>
  </button>`;
}

function navigation() {
  const visible = state.workspaceFilter === "all" ? state.sessions : state.sessions.filter((session) => session.workspace === state.workspaceFilter);
  const active = visible.filter((session) => session.running);
  const settled = visible.filter((session) => !session.running);
  if (state.sidebarCollapsed) {
    return `<nav class="navigation-view collapsed" aria-label="Drycode navigation">
      <header class="sidebar-brand"><span class="sidebar-logo">${icon("panels-top-left")}</span><strong>Drycode</strong><span class="dev-badge">Dev</span></header>
      <div class="sidebar-actions"><button data-action="search" aria-label="Search">${icon("search")}<span>Search</span><kbd>Ctrl K</kbd></button><button data-action="new-session" aria-label="New Session">${icon("plus")}<span>New Session</span><kbd>Ctrl Shift O</kbd></button></div>
      <div class="sidebar-sessions"></div>
      <footer class="sidebar-footer"><button class="selected" data-action="settings" aria-label="Settings">${icon("settings")}<span>Settings</span></button><button class="sidebar-icon" data-action="reload" aria-label="Reload Runtime">${icon("refresh-cw")}</button></footer>
    </nav>`;
  }
  return `<nav class="navigation-view" aria-label="Drycode navigation">
    <header class="sidebar-brand"><span class="sidebar-logo" title="Drycode">${icon("panels-top-left")}</span><strong>Drycode</strong><span class="dev-badge">Dev</span></header>
    <div class="sidebar-actions"><button data-action="search" aria-label="Search" title="Search">${icon("search")}<span>Search</span><kbd>Ctrl K</kbd></button><button data-action="new-session" aria-label="New Session" title="New Session">${icon("plus")}<span>New Session</span><kbd>Ctrl Shift O</kbd></button></div>
    <div class="workspace-tabs"><button class="all-workspaces ${state.workspaceFilter === "all" ? "selected" : ""}" data-workspace-filter="all">All</button><button class="${state.workspaceFilter === "drycode" ? "selected" : ""}" data-workspace-filter="drycode">${icon("folder")}<span>drycode</span></button><button class="${state.workspaceFilter === "agent-lab" ? "selected" : ""}" data-workspace-filter="agent-lab">${icon("folder")}<span>agent-lab</span></button><button data-action="choose-folder" aria-label="Add Workspace">${icon("plus")}</button></div>
    <div class="sidebar-sessions"><div class="featured-sessions">${active.map(featuredSession).join("")}</div><div class="settled-heading"><span>Settled</span><i></i></div><div class="settled-sessions">${settled.map((session) => `<button class="settled-session" data-session="${session.id}">${icon("message-square")}<span>${escapeHtml(session.title)}</span><time>${escapeHtml(session.time)}</time></button>`).join("")}</div></div>
    <footer class="sidebar-footer"><button class="selected" data-action="settings" aria-current="page" aria-label="Settings">${icon("settings")}<span>Settings</span></button><button class="sidebar-icon" data-action="reload" aria-label="Reload Runtime" title="Reload Runtime">${icon("refresh-cw")}</button></footer>
  </nav>`;
}

function settingsNav() {
  const items = [["overview", "layout-dashboard", "Overview"], ["extensions", "boxes", "Extension Graph"], ["providers", "key-round", "Model Providers"], ["runtime", "refresh-cw", "Runtime Generation"], ["storage", "hard-drive", "Drycode Home"]];
  return `<aside class="settings-nav"><span class="settings-nav-label">Control surface</span>${items.map(([id, name, label]) => `<button class="${state.tab === id ? "active" : ""}" data-tab="${id}" aria-current="${state.tab === id ? "page" : "false"}">${icon(name)}<span>${label}</span></button>`).join("")}<span class="nav-rule"></span><button data-action="diagnostics">${icon("stethoscope")}<span>Diagnostics</span></button><button data-action="open-docs">${icon("book-open")}<span>Architecture notes</span></button></aside>`;
}

function intro(iconName, tone, title, description, side = "") {
  return `<div class="section-intro"><span class="section-icon ${tone}">${icon(iconName)}</span><div class="grow"><h2>${title}</h2><p>${description}</p></div>${side ? `<span class="intro-side">${side}</span>` : ""}</div>`;
}

function overviewSection() {
  return `<section class="settings-section ${state.tab === "overview" ? "active" : ""}" data-section="overview">
    ${intro("layout-dashboard", "", "Control surface", "Drycode stays small by making composition, lifecycle, and ownership visible in one place. This is the Core view—not an IDE settings catalog.", "OVERVIEW / 01")}
    <div class="status-banner"><span class="status-symbol">${icon("check")}</span><div><strong>Runtime Generation ${state.generation} is serving Sessions</strong><p>UI Runtime and Harness Runtime are paired from the same resolved Extension Graph.</p></div><span class="status-meta"><b>${state.graphState.toUpperCase()}</b>last checked just now</span></div>
    <div class="stat-grid"><article class="stat-card"><span>Graph</span><strong>5 / 5</strong><small>extensions accepted atomically</small></article><article class="stat-card"><span>Service Slots</span><strong>07</strong><small>frozen for this generation</small></article><article class="stat-card"><span>Sessions</span><strong>04</strong><small>durable local records</small></article></div>
    <article class="card"><header class="card-heading"><div>${icon("git-merge")}<div><h3>How Drycode is composed</h3><p>One graph in. One generation out.</p></div></div><button class="quiet-action" data-tab="extensions">Inspect graph ${icon("arrow-up-right")}</button></header><div class="graph-preview"><div class="graph-line"><div class="graph-node"><span class="node-mark">${icon("layers-2")}</span><div><strong>Extension Graph</strong><small>resolved / atomic</small></div></div><span class="graph-connector"></span><div class="graph-node"><span class="node-mark">${icon("refresh-cw")}</span><div><strong>Generation ${state.generation}</strong><small>UI + Harness</small></div></div><span class="graph-connector"></span><div class="graph-node"><span class="node-mark">${icon("messages-square")}</span><div><strong>Session Runs</strong><small>workspace bound</small></div></div></div><p class="graph-caption"><b>Core accepts or rejects the complete graph.</b> The Service Registry freezes after composition, while validated Calls and Streams cross the generation-scoped UI–Harness Bridge.</p></div></article>
    <article class="card"><header class="card-heading"><div>${icon("sliders-horizontal")}<div><h3>Session defaults</h3><p>Small choices that shape the starter chat.</p></div></div></header>${preferenceRow("rotate-ccw", "Restore the last Session", "Open the most recent durable Session when Drycode starts.", "autoRestore")} ${preferenceRow("activity", "Show Tool detail", "Keep Tool calls expanded when activity is streaming.", "streamDetails")} ${preferenceRow("shield-alert", "Confirm Reload", "Ask before stopping a complete Runtime Generation.", "confirmReload")}</article>
  </section>`;
}

function preferenceRow(iconName, title, description, key) {
  return `<div class="setting-row"><span class="row-icon">${icon(iconName)}</span><div class="grow"><h4>${title}</h4><p>${description}</p></div><button class="switch ${state.preferences[key] ? "" : "off"}" data-preference="${key}" role="switch" aria-checked="${state.preferences[key]}"><em>${state.preferences[key] ? "On" : "Off"}</em></button></div>`;
}

function extensionCard(extension) {
  const expanded = state.expandedExtension === extension.id;
  return `<article class="extension-card"><div class="extension-summary"><span class="extension-mark ${extension.className}">${icon(extension.icon)}</span><div><strong>${escapeHtml(extension.name)}</strong><small>${escapeHtml(extension.version)} · ${escapeHtml(extension.role)}</small></div><span class="trust-label">Fully trusted</span><button data-extension="${extension.id}" aria-label="${expanded ? "Collapse" : "Inspect"} ${escapeHtml(extension.name)}">${icon(expanded ? "chevron-up" : "chevron-down")}</button></div>${expanded ? `<div class="extension-detail"><p>${escapeHtml(extension.summary)}<br><br>Its manifest contributes to the single resolved graph. There is no per-extension enable switch: removing or replacing code means resolving a different graph and reloading the generation.</p><div class="detail-facts"><span>entry <b>${escapeHtml(extension.entry)}</b></span><span>service slot <b>${escapeHtml(extension.slot)}</b></span><span>dependencies <b>${escapeHtml(extension.deps)}</b></span></div></div>` : ""}</article>`;
}

function extensionsSection() {
  const query = state.extensionQuery.toLowerCase();
  const filtered = extensions.filter((extension) => `${extension.name} ${extension.role}`.toLowerCase().includes(query));
  return `<section class="settings-section ${state.tab === "extensions" ? "active" : ""}" data-section="extensions">${intro("boxes", "orange", "Extension Graph", "The complete, deterministic set discovered from Drycode Home. Every package is local and fully trusted; Core evaluates the graph as one unit.", "GRAPH / 02")}<div class="status-banner"><span class="status-symbol">${icon("git-commit-horizontal")}</span><div><strong>Graph accepted · ${extensions.length} extensions discovered</strong><p>All dependencies resolve. The next Reload will create a replacement generation from this exact graph.</p></div><span class="status-meta"><b>ATOMIC</b>manifest lock · 18</span></div><article class="card" style="margin-top:13px"><header class="card-heading"><div>${icon("network")}<div><h3>Resolved members</h3><p>Inspect ownership and entry points—not permission toggles.</p></div></div><button class="quiet-action" data-action="reload">Reload generation ${icon("refresh-cw")}</button></header><div style="padding:13px 15px 3px"><div class="extension-toolbar"><label class="search-box">${icon("search")}<input data-extension-search type="search" placeholder="Filter by extension or contribution" value="${escapeHtml(state.extensionQuery)}" aria-label="Filter extensions"></label><span class="extension-count">${filtered.length} / ${extensions.length}</span></div><div class="provider-list">${filtered.length ? filtered.map(extensionCard).join("") : `<div class="dim" style="padding:14px;font-size:11px">No extension matches that filter.</div>`}</div></div></article></section>`;
}

function providersSection() {
  return `<section class="settings-section ${state.tab === "providers" ? "active" : ""}" data-section="providers">${intro("key-round", "violet", "Model Providers", "Provider extensions own model discovery, credential resolution, requests, and normalized response streaming. Core never becomes a credential vault.", "OWNERSHIP / 03")}<div class="provider-list">${providers.map((provider) => `<article class="provider-card"><span class="provider-mark ${provider.className}">${provider.mark}</span><div><h3>${provider.name}</h3><p>${provider.models} · ${provider.detail}</p></div><div class="provider-state"><span>${provider.credential === "Not configured" ? "Needs setup" : "Ready"}</span><button data-provider="${provider.name}">${provider.credential === "Not configured" ? "Configure" : "Manage credentials"}</button></div></article>`).join("")}</div><div class="provider-note">${icon("lock-keyhole")}<span><b>Provider boundary.</b> A provider extension resolves its own credential from its approved local store and owns the request. Drycode Core only composes the Model Provider Service Slot.</span></div></section>`;
}

function runtimeSection() {
  return `<section class="settings-section ${state.tab === "runtime" ? "active" : ""}" data-section="runtime">${intro("refresh-cw", "orange", "Runtime Generation", "Reload is a supervised stop-then-start replacement. The desktop window and Core remain available while the paired UI and Harness runtimes are replaced.", "LIFECYCLE / 04")}<article class="card"><header class="card-heading"><div>${icon("activity")}<div><h3>Generation ${state.generation}</h3><p>Currently serving the effective Shell.</p></div></div><span class="intro-side">${state.graphState.toUpperCase()}</span></header><div class="setting-row"><span class="row-icon">${icon("monitor-dot")}</span><div class="grow"><h4>UI Runtime</h4><p>Shell extension and UI contributions · Bridge endpoint available</p></div><span class="mono muted" style="font-size:9px">SERVING</span></div><div class="setting-row"><span class="row-icon" style="color:var(--violet);border-color:#51457d;background:#25203b">${icon("bot")}</span><div class="grow"><h4>Harness Runtime</h4><p>Agent execution for Sessions · one active Run per Session</p></div><span class="mono muted" style="font-size:9px">SERVING</span></div><div class="setting-row"><span class="row-icon" style="color:var(--cyan);border-color:#346263;background:#1a3437">${icon("radio-tower")}</span><div class="grow"><h4>UI–Harness Bridge</h4><p>Generation-scoped validated Calls and Streams</p></div><span class="mono" style="font-size:9px;color:var(--cyan)">PAIRED</span></div></article><article class="card" style="margin-top:13px"><header class="card-heading"><div>${icon("triangle-alert")}<div><h3>Replace this generation</h3><p>Active Runs are interrupted; durable Session records remain safe.</p></div></div></header><div class="setting-row"><span class="row-icon" style="color:var(--orange);border-color:#6f5030;background:#30251b">${icon("refresh-cw")}</span><div class="grow"><h4>Reload Runtime Generation</h4><p>Resolve the complete Extension Graph, then start a fresh UI + Harness pair.</p></div><button class="primary-action" data-action="reload">Reload now ${icon("arrow-right")}</button></div></article></section>`;
}

function storageSection() {
  return `<section class="settings-section ${state.tab === "storage" ? "active" : ""}" data-section="storage">${intro("hard-drive", "cyan", "Drycode Home", "Durable application data lives under the per-user Drycode Home. Workspace folders remain separate and are only supplied as Session context.", "LOCAL DATA / 05")}<article class="path-card"><span class="eyebrow">Drycode Home</span><div class="path-line">${icon("folder-open")}<code>C:\\Users\\alex\\.drycode</code><button data-action="copy-path" aria-label="Copy Drycode Home path">${icon("copy")}</button></div><div class="storage-stats"><div class="storage-stat"><span>Extensions</span><b>248 MB</b></div><div class="storage-stat"><span>Sessions</span><b>1.8 MB</b></div><div class="storage-stat"><span>Diagnostics</span><b>42 KB</b></div></div></article><article class="card" style="margin-top:13px"><header class="card-heading"><div>${icon("archive")}<div><h3>Diagnostics</h3><p>Useful evidence for the current graph and generation.</p></div></div><button class="quiet-action" data-action="diagnostics">Export report ${icon("download")}</button></header><div class="setting-row"><span class="row-icon" style="color:var(--cyan);border-color:#346263;background:#1a3437">${icon("file-text")}</span><div class="grow"><h4>Local diagnostic bundle</h4><p>Graph lock, Service Slots, generation lifecycle, and recent Bridge events.</p></div><span class="mono muted" style="font-size:9px">READY</span></div></article><article class="card danger-zone" style="margin-top:13px"><header class="card-heading"><div>${icon("trash-2")}<div><h3>Clear cached data</h3><p>Removes derived diagnostics and provider model catalogs, never Session records.</p></div></div><button class="danger-button" data-action="clear-cache">Clear cache</button></header></article></section>`;
}

function settingsPage() {
  return `<main class="settings-page"><div class="settings-inner"><header class="settings-header"><div><span class="eyebrow">Core / Settings</span><h1>Control surface</h1><p>Compose the local host you want. Watch the graph, know who owns a boundary, and replace a Runtime Generation without losing your Sessions.</p></div><div class="header-actions"><button data-action="diagnostics">${icon("download")}Export report</button><button class="primary-action" data-action="reload">${icon("refresh-cw")}Reload generation</button></div></header><div class="settings-body">${settingsNav()}<div class="settings-main">${overviewSection()}${extensionsSection()}${providersSection()}${runtimeSection()}${storageSection()}</div></div></div></main>`;
}

function modal() {
  if (state.modal === "reload") return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="reload-title"><div class="dialog-title"><span class="dialog-icon">${icon("refresh-cw")}</span><div><span class="eyebrow">Runtime lifecycle</span><h2 id="reload-title">Replace Runtime Generation?</h2></div></div><p>Drycode will stop the complete UI and Harness pair, resolve the Extension Graph again, and start a fresh generation. <strong>Durable Sessions stay available.</strong></p><div class="reload-note">${icon("triangle-alert")}<span>There is an active Run in “Shape the starter chat”. It will be interrupted, but its Session record remains append-only and safe.</span></div><div class="dialog-actions"><button class="plain-button" data-action="close-modal">Cancel</button><button class="primary-action" data-action="confirm-reload">${icon("refresh-cw")}Replace generation</button></div></section></div>`;
  if (state.modal === "reloading") return `<div class="modal-shade"><section class="dialog reload-progress" role="dialog" aria-modal="true"><span class="dialog-icon">${icon("refresh-cw")}</span><span class="eyebrow">Runtime lifecycle</span><h2>Starting Runtime Generation...</h2><p>Stopping the old pair, freezing the Service Registries, and starting UI + Harness together.</p><div class="progress-track"><i></i></div><small>Resolving graph · generation ${state.generation + 1}</small></section></div>`;
  if (state.modal === "credentials") { const provider = providers.find((item) => item.name === state.selectedProvider) || providers[0]; return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="credential-title"><div class="dialog-title"><span class="dialog-icon" style="color:var(--violet);border-color:#51457d;background:#25203b">${icon("key-round")}</span><div><span class="eyebrow">${escapeHtml(provider.name)} provider</span><h2 id="credential-title">Provider credentials</h2></div></div><p>This provider extension owns credential resolution. Drycode Core will not inspect, proxy, or store the value.</p><form class="credentials-form" data-credentials><label>Local credential reference<input type="password" value="••••••••••••••••" aria-label="Credential reference"></label><small>Stored in the provider-owned local credential store. This prototype only simulates the hand-off.</small><div class="dialog-actions"><button type="button" class="plain-button" data-action="close-modal">Cancel</button><button type="submit" class="primary-action">Save provider reference</button></div></form></section></div>`; }
  return "";
}

function render() {
  const content = settingsPage();
  document.querySelector("#app").innerHTML = `<div class="app-frame">${topbar()}<div class="nav-layout ${state.sidebarCollapsed ? "sidebar-collapsed" : ""}">${navigation()}${content}</div></div>${modal()}${state.toast ? `<div class="toast" role="status">${icon("info")}<span>${escapeHtml(state.toast)}</span></div>` : ""}`;
  if (window.lucide) window.lucide.createIcons();
  bind();
}

function showToast(message) {
  window.clearTimeout(state.toastTimer);
  state.toast = message;
  render();
  state.toastTimer = window.setTimeout(() => { state.toast = ""; render(); }, 2200);
}

function setTab(tab) { state.tab = tab; state.expandedExtension = null; render(); }
function confirmReload() {
  window.clearTimeout(state.reloadTimer);
  state.modal = "reloading";
  state.graphState = "Rebuilding";
  render();
  state.reloadTimer = window.setTimeout(() => {
    state.generation += 1;
    state.graphState = "Resolved";
    state.modal = null;
    state.sessions[0].running = false;
    render();
    showToast(`Runtime Generation ${state.generation} is serving`);
  }, 1500);
}
function requestReload() {
  if (state.preferences.confirmReload) state.modal = "reload";
  else confirmReload();
  render();
}
function fakeFolderPicker() {
  if (window.showDirectoryPicker) {
    window.showDirectoryPicker().then((directory) => showToast(`Workspace added: ${directory.name}`)).catch((error) => { if (error?.name !== "AbortError") showToast("Folder picker could not open"); });
    return;
  }
  showToast("Workspace folder picker is available in the desktop host");
}

function bind() {
  document.querySelectorAll("[data-action]").forEach((element) => element.addEventListener("click", (event) => {
    const action = element.dataset.action;
    if (action === "collapse-sidebar") { state.sidebarCollapsed = !state.sidebarCollapsed; return render(); }
    if (action === "settings") { state.page = "settings"; return render(); }
    if (action === "reload") return requestReload();
    if (action === "confirm-reload") return confirmReload();
    if (action === "close-modal") { state.modal = null; return render(); }
    if (action === "choose-folder") return fakeFolderPicker();
    if (action === "search") return showToast("Session search is ready from the Core shell");
    if (action === "new-session") return showToast("New Session created in drycode");
    if (action === "diagnostics") return showToast("Diagnostic report exported to Drycode Home");
    if (action === "open-docs") return showToast("Architecture notes opened");
    if (action === "copy-path") { navigator.clipboard?.writeText("C:\\Users\\alex\\.drycode"); return showToast("Drycode Home path copied"); }
    if (action === "clear-cache") return showToast("Derived cache cleared; Session records were kept");
  }));
  document.querySelectorAll("[data-tab]").forEach((element) => element.addEventListener("click", () => setTab(element.dataset.tab)));
  document.querySelectorAll("[data-workspace-filter]").forEach((element) => element.addEventListener("click", () => { state.workspaceFilter = element.dataset.workspaceFilter; render(); }));
  document.querySelectorAll("[data-session]").forEach((element) => element.addEventListener("click", () => showToast(`${element.querySelector("strong, span")?.textContent || "Session"} stays open in the chat surface`)));
  document.querySelectorAll("[data-preference]").forEach((element) => element.addEventListener("click", () => { const key = element.dataset.preference; state.preferences[key] = !state.preferences[key]; render(); }));
  document.querySelectorAll("[data-extension]").forEach((element) => element.addEventListener("click", () => { state.expandedExtension = state.expandedExtension === element.dataset.extension ? null : element.dataset.extension; render(); }));
  document.querySelectorAll("[data-provider]").forEach((element) => element.addEventListener("click", () => { state.selectedProvider = element.dataset.provider; state.modal = "credentials"; render(); }));
  const search = document.querySelector("[data-extension-search]");
  if (search) { search.addEventListener("input", () => { state.extensionQuery = search.value; const cursor = search.selectionStart; render(); const next = document.querySelector("[data-extension-search]"); next?.focus(); next?.setSelectionRange(cursor, cursor); }); }
  document.querySelector("[data-credentials]")?.addEventListener("submit", (event) => { event.preventDefault(); state.modal = null; showToast(`${state.selectedProvider} provider reference saved`); });
  document.querySelectorAll(".modal-shade[data-dismiss]").forEach((shade) => shade.addEventListener("click", (event) => { if (event.target === shade) { state.modal = null; render(); } }));
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.modal) { state.modal = null; render(); }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); showToast("Session search is ready from the Core shell"); }
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "o") { event.preventDefault(); showToast("New Session created in drycode"); }
});

render();
