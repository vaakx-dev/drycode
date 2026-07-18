const state = {
  sidebarCollapsed: false,
  workspaceFilter: "all",
  activeSession: "contract",
  settingsSection: "extensions",
  selectedExtension: "drycode.shell",
  extensionFilter: "",
  runtimeGeneration: 18,
  modal: null,
  toast: "",
  toastTimer: null,
  reloadTimer: null,
  workspaces: ["All", "drycode", "agent-lab", "docs", "sandbox"],
  sessions: [
    { id: "contract", workspace: "drycode", active: true, title: "Shape the starter chat", summary: "Map the smallest useful Windows surface", time: "Now" },
    { id: "harness", workspace: "drycode", active: false, title: "Extract the Harness", summary: "Compare runtime boundaries and hand-offs", time: "2h" },
    { id: "installer", workspace: "agent-lab", active: true, title: "Plan the Windows install", summary: "Stopped after comparing package formats", time: "Fri" },
    { id: "recovery", workspace: "agent-lab", active: false, title: "Recovery surface notes", summary: "Capture what remains available during Reload", time: "Mon" },
  ],
};

const extensions = [
  {
    id: "drycode.shell", name: "Shell Extension", role: "Root UI provider", kind: "Shell Extension", version: "0.4.0", compatibility: ">= 0.3", runtime: "UI Runtime", icon: "panels-top-left", tone: "blue",
    summary: "Supplies the effective base provider for the Shell service and composes the Starter Extension Set's UI contributions.", entry: "ui/shell.js", path: "~/.drycode/extensions/drycode.shell", deps: ["drycode.sessions", "drycode.workspace"], contracts: ["Shell service", "Session navigation", "Settings destination"], source: "Starter Extension Set",
  },
  {
    id: "drycode.sessions", name: "Session Records", role: "Durable conversation facts", kind: "UI + Harness", version: "0.3.2", compatibility: ">= 0.3", runtime: "UI + Harness", icon: "messages-square", tone: "violet",
    summary: "Provides the durable, linear Session record stream used by the UI and Harness runtimes.", entry: "ui/sessions.js · harness/records.js", path: "~/.drycode/extensions/drycode.sessions", deps: ["drycode.harness"], contracts: ["Session store", "Session list", "Run history"], source: "Starter Extension Set",
  },
  {
    id: "drycode.harness", name: "Harness Runtime", role: "Coding-agent runtime", kind: "Harness contribution", version: "0.4.1", compatibility: ">= 0.3", runtime: "Harness Runtime", icon: "orbit", tone: "amber",
    summary: "Contributes the independent coding-agent runtime that operates on a Workspace and records each Run.", entry: "harness/runtime.js", path: "~/.drycode/extensions/drycode.harness", deps: [], contracts: ["Harness service", "Run execution", "Tool host"], source: "Starter Extension Set",
  },
  {
    id: "drycode.workspace", name: "Workspace Context", role: "Workspace-aware Tools", kind: "Harness contribution", version: "0.2.5", compatibility: ">= 0.3", runtime: "Harness Runtime", icon: "folder-cog", tone: "blue",
    summary: "Adds the small set of headless Tools that lets a Run inspect and work in its selected Workspace.", entry: "harness/tools.js", path: "~/.drycode/extensions/drycode.workspace", deps: ["drycode.harness"], contracts: ["workspace.context", "Tool provider"], source: "Starter Extension Set",
  },
  {
    id: "drycode.anthropic", name: "Anthropic Provider", role: "Model Provider", kind: "Harness contribution", version: "0.3.0", compatibility: ">= 0.3", runtime: "Harness Runtime", icon: "sparkles", tone: "violet",
    summary: "Discovers Anthropic Models, resolves credentials locally, and normalizes response Streams for the Harness.", entry: "harness/provider.js", path: "~/.drycode/extensions/drycode.anthropic", deps: ["drycode.harness"], contracts: ["model.anthropic", "Model Provider"], source: "Installed Extension",
  },
  {
    id: "drycode.skills", name: "Starter Skills", role: "Prompt resources", kind: "UI + Harness", version: "0.1.8", compatibility: ">= 0.3", runtime: "UI + Harness", icon: "book-open", tone: "blue",
    summary: "Makes a small catalog of named instructions and resources available for Session prompt assembly.", entry: "ui/skills.js · harness/skills.js", path: "~/.drycode/extensions/drycode.skills", deps: ["drycode.sessions"], contracts: ["Skill catalog", "Prompt resources"], source: "Starter Extension Set",
  },
];

const slots = [
  ["shell", "The root user interface", "Shell Extension", "drycode.shell", "UI Runtime"],
  ["session.records", "Durable Session facts", "Session Records", "drycode.sessions", "UI + Harness"],
  ["harness", "Coding-agent execution", "Harness Runtime", "drycode.harness", "Harness Runtime"],
  ["model.anthropic", "Anthropic Model discovery", "Anthropic Provider", "drycode.anthropic", "Harness Runtime"],
  ["workspace.context", "Workspace-aware Tools", "Workspace Context", "drycode.workspace", "Harness Runtime"],
];

const icon = (name, label = "") => `<i data-lucide="${name}"${label ? ` aria-label="${label}"` : ""}></i>`;
const esc = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const visibleSessions = () => state.workspaceFilter === "all" ? state.sessions : state.sessions.filter((session) => session.workspace === state.workspaceFilter);
const selectedExtension = () => extensions.find((item) => item.id === state.selectedExtension) || extensions[0];

function topbar() {
  return `<header class="topbar">
    <button class="topbar-collapse" data-action="collapse-sidebar" aria-label="${state.sidebarCollapsed ? "Expand" : "Collapse"} sidebar">${icon(state.sidebarCollapsed ? "panel-left-open" : "panel-left-close")}</button>
    <span class="window-drag"></span>
    <div class="window-controls" aria-label="Window controls"><button aria-label="Minimize">${icon("minus")}</button><button aria-label="Maximize">${icon("square")}</button><button aria-label="Close">${icon("x")}</button></div>
  </header>`;
}

function workspaceTabs() {
  return `<div class="workspace-tabs">
    ${state.workspaces.map((name, index) => `<button class="${(state.workspaceFilter === "all" && index === 0) || state.workspaceFilter === name ? "selected" : ""} ${index === 0 ? "all-workspaces" : ""}" data-workspace-filter="${esc(name === "All" ? "all" : name)}">${index === 0 ? "ALL" : `${icon("folder")}<span>${esc(name)}</span>`}</button>`).join("")}
    <button class="add-workspace" data-action="choose-folder" aria-label="Add Workspace" title="Add Workspace">${icon("plus")}</button>
  </div>`;
}

function featuredSession(session) {
  return `<button class="featured-session ${session.id === state.activeSession ? "selected" : ""}" data-session="${session.id}">
    <span class="featured-meta"><span class="session-source">${icon("message-square-code")}<b>${esc(session.workspace)}</b></span><time>${esc(session.time)}</time></span>
    <strong>${esc(session.title)}</strong>
    <span class="featured-status"><b class="${session.active ? "running" : ""}">${session.active ? "Running" : "Active"}</b><span>${esc(session.summary)}</span>${icon(session.active ? "loader-circle" : "circle")}</span>
  </button>`;
}

function settledSession(session) {
  return `<button class="settled-session ${session.id === state.activeSession ? "selected" : ""}" data-session="${session.id}">${icon("message-square")}<span>${esc(session.title)}</span><time>${esc(session.time)}</time></button>`;
}

function collapsedRail() {
  return `<div class="collapsed-rail">
    <button class="rail-button" data-action="rail-workspaces" aria-label="Workspaces" title="Workspaces">${icon("folders")}</button>
    <button class="rail-button" data-action="rail-sessions" aria-label="Sessions" title="Sessions">${icon("messages-square")}<small>${visibleSessions().filter((item) => item.active).length}</small></button>
    <div class="rail-rule"></div>
    ${state.railMenu === "workspaces" ? `<div class="rail-flyout"><header><strong>Workspaces</strong><button data-action="close-rail">${icon("x")}</button></header>${state.workspaces.map((name, index) => `<button data-workspace-filter="${index === 0 ? "all" : esc(name)}" class="${(index === 0 && state.workspaceFilter === "all") || state.workspaceFilter === name ? "selected" : ""}">${icon(index === 0 ? "folders" : "folder")}<span>${esc(name)}</span></button>`).join("")}</div>` : ""}
    ${state.railMenu === "sessions" ? `<div class="rail-flyout"><header><strong>Sessions</strong><button data-action="close-rail">${icon("x")}</button></header>${visibleSessions().map((session) => `<button data-session="${session.id}" class="${session.id === state.activeSession ? "selected" : ""}">${icon(session.active ? "loader-circle" : "message-square")}<span>${esc(session.title)}</span></button>`).join("")}</div>` : ""}
  </div>`;
}

function navigation() {
  const sessions = visibleSessions();
  const active = sessions.filter((session) => session.active);
  const settled = sessions.filter((session) => !session.active);
  return `<nav class="navigation-view ${state.sidebarCollapsed ? "collapsed" : ""}" aria-label="Drycode navigation">
    <header class="sidebar-brand"><span class="sidebar-logo" title="Drycode">${icon("panels-top-left")}</span><strong>Drycode</strong><span class="dev-badge">Dev</span></header>
    <div class="sidebar-actions">
      <button data-action="search" aria-label="Search" title="Search">${icon("search")}<span>Search</span><kbd>Ctrl K</kbd></button>
      <button data-action="new-session" aria-label="New Session" title="New Session">${icon("plus")}<span>New Session</span><kbd>Ctrl Shift O</kbd></button>
    </div>
    ${state.sidebarCollapsed ? collapsedRail() : `${workspaceTabs()}<div class="sidebar-sessions"><div class="featured-sessions">${active.map(featuredSession).join("")}</div><div class="settled-heading"><span>Settled</span><i></i></div><div class="settled-sessions">${settled.map(settledSession).join("")}</div></div>`}
    <footer class="sidebar-footer"><button class="selected" data-action="settings" aria-current="page" aria-label="Settings" title="Settings">${icon("settings")}<span>Settings</span></button><button class="sidebar-icon" data-action="reload" aria-label="Reload Runtime" title="Reload Runtime">${icon("refresh-cw")}</button></footer>
  </nav>`;
}

function settingsNav() {
  const items = [["extensions", "package", "Extensions"], ["slots", "layers-3", "Service Slots"], ["lifecycle", "refresh-cw", "Lifecycle"], ["home", "hard-drive", "Drycode Home"]];
  return `<aside class="settings-nav"><span class="settings-nav-label">Core settings</span>${items.map(([id, iconName, label]) => `<button class="${state.settingsSection === id ? "active" : ""}" data-section="${id}" ${state.settingsSection === id ? "aria-current=\"page\"" : ""}>${icon(iconName)}<span>${label}</span></button>`).join("")}<p class="nav-note">Core owns discovery and lifecycle. The effective graph is accepted or rejected as one unit.</p></aside>`;
}

function runtimeStrip() {
  return `<section class="runtime-strip"><div class="runtime-state"><span class="state-orb">${icon("activity")}</span><span class="runtime-copy"><strong>Runtime Generation ${state.runtimeGeneration} is running</strong><span>UI Runtime + Harness Runtime · Bridge generation-scoped</span></span></div><div class="runtime-links"><span>Graph <b>accepted</b></span><i></i><span>Bridge <b>healthy</b></span></div><button data-action="reload">${icon("refresh-cw")}<span>Reload Generation</span></button></section>`;
}

function extensionMark(item, inspector = false) {
  return `<span class="${inspector ? "inspector-mark" : "extension-mark"} ${item.tone !== "blue" ? item.tone : ""}">${icon(item.icon)}</span>`;
}

function extensionItem(item) {
  return `<button class="extension-item ${item.id === state.selectedExtension ? "selected" : ""}" data-extension="${item.id}">${extensionMark(item)}<span class="extension-copy"><strong>${esc(item.name)}</strong><span>${esc(item.id)} · ${esc(item.role)}</span></span><span class="resolved"><i></i>resolved</span></button>`;
}

function inspector() {
  const item = selectedExtension();
  return `<aside class="extension-inspector" aria-label="Extension details">
    <header class="inspector-header">${extensionMark(item, true)}<div><h3>${esc(item.name)}</h3><p>${esc(item.id)}</p></div><span class="inspector-state">${icon("check")}in graph</span></header>
    <p class="inspector-summary">${esc(item.summary)}</p>
    <div class="detail-grid"><div class="detail-cell"><label>Version</label><span>${esc(item.version)}</span></div><div class="detail-cell"><label>Drycode</label><span>${esc(item.compatibility)}</span></div><div class="detail-cell"><label>Runtime</label><span>${esc(item.runtime)}</span></div><div class="detail-cell"><label>Entry point</label><span>${esc(item.entry)}</span></div><div class="detail-cell" style="grid-column: 1 / -1"><label>Installed in Drycode Home</label><span class="path">${esc(item.path)}</span></div></div>
    <div class="inspector-block"><label>Service Slots & contributions</label><div class="contract-chips">${item.contracts.map((contract) => `<span>${esc(contract)}</span>`).join("")}</div></div>
    <div class="inspector-block"><label>Dependencies</label>${item.deps.length ? item.deps.map((dep) => `<div class="dependency-line">${icon("arrow-down-right")}<span>${esc(dep)} <span class="muted">· resolved</span></span></div>`).join("") : `<div class="dependency-line">${icon("minus")}<span>No dependencies</span></div>`}</div>
    <div class="inspector-actions"><button data-action="inspect-manifest">${icon("file-json")}<span>Inspect manifest</span></button><button class="quiet-button" data-action="open-home">${icon("external-link")}<span>Open Home</span></button></div>
  </aside>`;
}

function extensionsView() {
  const query = state.extensionFilter.trim().toLowerCase();
  const filtered = extensions.filter((item) => `${item.name} ${item.id} ${item.role}`.toLowerCase().includes(query));
  return `<div class="content-heading"><div><h2>Extension Graph</h2><p>One deterministic composition for this Runtime Generation.</p></div><span class="graph-badge">${icon("git-merge")}Starter Extension Set</span></div>
    <div class="graph-overview"><div class="overview-cell"><span>Graph state</span><strong class="blue">Accepted as a whole</strong></div><div class="overview-cell"><span>Resolved extensions</span><strong>${extensions.length} / ${extensions.length}</strong></div><div class="overview-cell"><span>Effective providers</span><strong class="violet">${slots.length} Service Slots</strong></div></div>
    <section class="graph-panel"><div class="graph-toolbar"><strong>Resolved extensions</strong><span>discovered from Drycode Home</span><div class="graph-filter">${icon("search")}<input data-extension-filter type="search" placeholder="Filter by name or ID" value="${esc(state.extensionFilter)}" aria-label="Filter extensions"></div></div><div class="graph-workbench"><div class="extension-list"><div class="list-heading"><span>Composition order</span><span>${filtered.length} shown</span></div><div class="extension-items">${filtered.length ? filtered.map(extensionItem).join("") : `<div class="no-results">No Extension matches “${esc(state.extensionFilter)}”.</div>`}</div></div>${filtered.length ? inspector() : `<div class="extension-inspector"><p class="no-results">Select a resolved Extension to inspect its manifest contribution.</p></div>`}</div></section>
    <section class="lifecycle-card"><div><h3>Generation composition</h3><p>Core discovered, resolved, and started the paired runtimes from this graph.</p><div class="timeline"><div class="timeline-step"><span class="timeline-dot">${icon("search")}</span><strong>Discovered</strong><span>6 manifests found</span></div><div class="timeline-step"><span class="timeline-dot">${icon("git-merge")}</span><strong>Resolved</strong><span>dependencies complete</span></div><div class="timeline-step"><span class="timeline-dot">${icon("play")}</span><strong>Running</strong><span>generation ${state.runtimeGeneration}</span></div></div></div><div class="lifecycle-aside"><div class="aside-title">${icon("radio")} Runtime pair</div><div class="runtime-pair"><div><span>UI Runtime</span><b>running</b></div><div><span>Harness Runtime</span><b>running</b></div><div><span>UI-Harness Bridge</span><b>healthy</b></div></div></div></section>`;
}

function slotsView() {
  return `<div class="content-heading"><div><h2>Service Slots</h2><p>Stable contracts with one effective provider in this runtime generation.</p></div><span class="graph-badge">${icon("layers-3")}Frozen registry</span></div><div class="slot-list">${slots.map(([name, description, provider, extension, runtime]) => `<article class="slot-row"><div class="slot-name"><strong>${esc(name)}</strong><span>${esc(description)}</span></div><div class="slot-provider"><b>${esc(provider)}</b><small>${esc(extension)} · ${esc(runtime)}</small></div><span class="slot-status">effective</span></article>`).join("")}</div><section class="lifecycle-card"><div><h3>Separate registries, one generation</h3><p>The UI and Harness runtimes each freeze their own Service Registry. Contributions cross the UI-Harness Bridge only through validated Calls and Streams.</p></div><div class="lifecycle-aside"><div class="aside-title">${icon("shield-check")} Contract surface</div><div class="runtime-pair"><div><span>UI registry</span><b>4 slots</b></div><div><span>Harness registry</span><b>4 slots</b></div></div></div></section>`;
}

function lifecycleView() {
  return `<div class="content-heading"><div><h2>Runtime lifecycle</h2><p>See what Reload replaces, and what remains durable while it does.</p></div><button class="primary-button" data-action="reload">${icon("refresh-cw")}Reload Runtime</button></div><div class="lifecycle-detail"><article class="lifecycle-block"><h3>Runtime Generation ${state.runtimeGeneration}</h3><p>The current generation is a supervised instance of the resolved Extension Graph, paired UI and Harness runtimes, and their Bridge.</p><div class="lifecycle-event">${icon("play-circle")}<span>Started from accepted graph</span><time>09:42</time></div><div class="lifecycle-event">${icon("link-2")}<span>Bridge endpoints validated</span><time>09:42</time></div><div class="lifecycle-event">${icon("activity")}<span>UI + Harness running as one unit</span><time>now</time></div></article><article class="lifecycle-block"><h3>Reload behavior</h3><p>Reload stops the complete Runtime Generation, then starts its replacement while Core and the desktop window stay open.</p><div class="lifecycle-event">${icon("database")}<span>Session Records remain durable</span></div><div class="lifecycle-event">${icon("life-buoy")}<span>Recovery Surface is available between generations</span></div><div class="lifecycle-event">${icon("triangle-alert")}<span>Active Runs are interrupted</span></div></article></div>`;
}

function homeView() {
  return `<div class="content-heading"><div><h2>Drycode Home</h2><p>The per-user root for installed Extensions and Core's durable, cached, diagnostic, and temporary data.</p></div></div><div class="home-list"><article class="home-row">${icon("folder-open")}<div><strong>Extensions</strong><span>~/.drycode/extensions · ${extensions.length} discovered packages</span></div><button data-action="open-home">Open location</button></article><article class="home-row">${icon("database")}<div><strong>Durable data</strong><span>~/.drycode/data · Session Records and Core state</span></div><button data-action="open-home">Open location</button></article><article class="home-row">${icon("clipboard-list")}<div><strong>Diagnostics</strong><span>~/.drycode/diagnostics · graph resolution and lifecycle records</span></div><button data-action="open-home">Open location</button></article><article class="home-row">${icon("archive")}<div><strong>Cache & temporary data</strong><span>~/.drycode/cache · safe to clear when no generation is running</span></div><button data-action="clear-cache">Clear cache</button></article></div>`;
}

function settingsPage() {
  const content = state.settingsSection === "extensions" ? extensionsView() : state.settingsSection === "slots" ? slotsView() : state.settingsSection === "lifecycle" ? lifecycleView() : homeView();
  return `<main class="settings-page"><div class="settings-wrap"><header class="settings-header"><div><span class="eyebrow">Drycode Core / destination</span><h1>Settings</h1><p>Compose the local Extensions and supervise the Runtime Generation used by your Sessions.</p></div><div class="header-actions"><button data-action="open-home">${icon("folder-open")}<span>Open Drycode Home</span></button><button class="primary-button" data-action="reload">${icon("refresh-cw")}<span>Reload</span></button></div></header><div class="settings-layout">${settingsNav()}<div class="settings-content">${runtimeStrip()}${content}</div></div></div></main>`;
}

function modal() {
  if (!state.modal) return "";
  if (state.modal === "reload") return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="reload-title"><div class="dialog-title"><span class="dialog-icon">${icon("refresh-cw")}</span><div><span class="eyebrow">Runtime lifecycle</span><h2 id="reload-title">Reload the Runtime?</h2></div></div><p>Drycode will stop Runtime Generation ${state.runtimeGeneration}, then start a fresh generation from the accepted Extension Graph.</p><div class="reload-note">${icon("triangle-alert")}<span>Active Runs will be interrupted. Session Records remain durable.</span></div><div class="dialog-actions"><button class="plain-button" data-action="close-modal">Cancel</button><button class="danger-button" data-action="confirm-reload">${icon("refresh-cw")}<span>Reload Generation</span></button></div></section></div>`;
  if (state.modal === "manifest") {
    const item = selectedExtension();
    return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="manifest-title"><div class="dialog-title"><span class="dialog-icon">${icon("file-json")}</span><div><span class="eyebrow">Extension Manifest</span><h2 id="manifest-title">${esc(item.name)}</h2></div></div><p>Identity and contribution declared by <span class="mono">${esc(item.id)}</span>.</p><div class="detail-grid"><div class="detail-cell"><label>Identity</label><span>${esc(item.id)}</span></div><div class="detail-cell"><label>Version</label><span>${esc(item.version)}</span></div><div class="detail-cell"><label>Compatibility</label><span>${esc(item.compatibility)}</span></div><div class="detail-cell"><label>Source</label><span>${esc(item.source)}</span></div><div class="detail-cell" style="grid-column: 1 / -1"><label>Entry points</label><span>${esc(item.entry)}</span></div></div><div class="dialog-actions"><button class="primary-button" data-action="close-modal">Done</button></div></section></div>`;
  }
  return `<div class="modal-shade"><section class="dialog reload-progress" role="dialog" aria-modal="true"><span class="dialog-icon">${icon("refresh-cw")}</span><span class="eyebrow">Runtime lifecycle</span><h2>Starting new Generation...</h2><p>Stopping the old pair and starting a fresh UI and Harness Runtime.</p><div class="progress-track"><i></i></div><small>Resolving Extension Graph ${state.runtimeGeneration + 1}</small></section></div>`;
}

function render() {
  document.querySelector("#app").innerHTML = `<div class="app-frame">${topbar()}<div class="nav-layout ${state.sidebarCollapsed ? "sidebar-collapsed" : ""}">${navigation()}${settingsPage()}</div></div>${modal()}${state.toast ? `<div class="toast" role="status">${icon("info")}<span>${esc(state.toast)}</span></div>` : ""}`;
  if (window.lucide) window.lucide.createIcons();
  bind();
}

function showToast(message) {
  window.clearTimeout(state.toastTimer);
  state.toast = message;
  render();
  state.toastTimer = window.setTimeout(() => { state.toast = ""; render(); }, 2100);
}

function chooseWorkspace() { showToast("Workspace picker would open here"); }
function newSession() { showToast("New Session would open in the chat destination"); }
function selectSession(id) { const session = state.sessions.find((item) => item.id === id); if (session) showToast(`Opening Session · ${session.title}`); }
function filterWorkspace(name) { state.workspaceFilter = name; state.railMenu = null; render(); }

function confirmReload() {
  state.modal = "reloading";
  render();
  window.clearTimeout(state.reloadTimer);
  state.reloadTimer = window.setTimeout(() => {
    state.runtimeGeneration += 1;
    state.modal = null;
    render();
    showToast(`Runtime Generation ${state.runtimeGeneration} is running`);
  }, 1500);
}

function bind() {
  document.querySelectorAll("[data-action]").forEach((element) => element.addEventListener("click", (event) => {
    const action = element.dataset.action;
    if (action === "collapse-sidebar") { state.sidebarCollapsed = !state.sidebarCollapsed; state.railMenu = null; return render(); }
    if (action === "settings") { state.settingsSection = "extensions"; state.railMenu = null; return render(); }
    if (action === "search") return showToast("Session search would open here");
    if (action === "new-session") return newSession();
    if (action === "choose-folder") return chooseWorkspace();
    if (action === "reload") { state.modal = "reload"; state.railMenu = null; return render(); }
    if (action === "close-modal") { state.modal = null; return render(); }
    if (action === "confirm-reload") return confirmReload();
    if (action === "inspect-manifest") { state.modal = "manifest"; return render(); }
    if (action === "open-home") return showToast("Drycode Home is available at ~/.drycode");
    if (action === "clear-cache") return showToast("Cache clear requires no running Runtime Generation");
    if (action === "rail-workspaces") { state.railMenu = state.railMenu === "workspaces" ? null : "workspaces"; return render(); }
    if (action === "rail-sessions") { state.railMenu = state.railMenu === "sessions" ? null : "sessions"; return render(); }
    if (action === "close-rail") { state.railMenu = null; return render(); }
  }));
  document.querySelectorAll("[data-section]").forEach((element) => element.addEventListener("click", () => { state.settingsSection = element.dataset.section; render(); }));
  document.querySelectorAll("[data-extension]").forEach((element) => element.addEventListener("click", () => { state.selectedExtension = element.dataset.extension; render(); }));
  document.querySelectorAll("[data-session]").forEach((element) => element.addEventListener("click", () => selectSession(element.dataset.session)));
  document.querySelectorAll("[data-workspace-filter]").forEach((element) => element.addEventListener("click", () => filterWorkspace(element.dataset.workspaceFilter)));
  const extensionFilter = document.querySelector("[data-extension-filter]");
  if (extensionFilter) extensionFilter.addEventListener("input", () => {
    state.extensionFilter = extensionFilter.value;
    const cursor = extensionFilter.selectionStart;
    render();
    const next = document.querySelector("[data-extension-filter]");
    if (next) { next.focus(); next.setSelectionRange(cursor, cursor); }
  });
  document.querySelectorAll(".modal-shade[data-dismiss]").forEach((shade) => shade.addEventListener("click", (event) => { if (event.target === shade) { state.modal = null; render(); } }));
  document.querySelector(".settings-page")?.addEventListener("click", (event) => {
    if (state.railMenu && !event.target.closest(".collapsed-rail")) { state.railMenu = null; render(); }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && (state.modal || state.railMenu)) { state.modal = null; state.railMenu = null; render(); }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); showToast("Session search would open here"); }
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "o") { event.preventDefault(); newSession(); }
});

render();
