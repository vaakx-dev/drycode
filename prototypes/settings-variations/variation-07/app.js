const state = {
  sidebarCollapsed: false,
  workspaceFilter: "all",
  page: "settings",
  selectedExtension: "harness",
  selectedSection: "overview",
  modal: null,
  toast: "",
  toastTimer: null,
  diagnostic: false,
  diagnosticTimer: null,
  storageNotice: false,
  prefs: { autoScroll: true, preserve: true, density: "Comfortable" },
  workspaces: ["All", "drycode", "agent-lab", "docs"],
  sessions: [
    { id: "shape", workspace: "drycode", title: "Shape the starter chat", status: "Running", detail: "Reading Workspace context", time: "Now" },
    { id: "harness", workspace: "drycode", title: "Extract the Harness", status: "Active", detail: "Runtime boundaries and hand-offs", time: "2h" },
    { id: "install", workspace: "agent-lab", title: "Plan the Windows install", status: "Active", detail: "Stopped after comparing formats", time: "Fri" },
    { id: "recovery", workspace: "agent-lab", title: "Recovery surface notes", status: "Settled", detail: "What remains during Reload", time: "Mon" },
  ],
};

const extensions = [
  { id: "harness", icon: "cpu", name: "Local Harness", version: "0.8.2", role: "Runtime owner", description: "Runs Sessions locally and normalizes Tool activity for the UI.", entry: "harness.main", graph: "Resolved · root", slots: "session.run · tool.execute" },
  { id: "shell", icon: "panels-top-left", name: "Starter Shell", version: "0.4.1", role: "Shell provider", description: "Composes the full-width desktop Shell and navigation surface.", entry: "ui.shell", graph: "Resolved · provider", slots: "shell · navigation" },
  { id: "anthropic", icon: "sparkles", name: "Anthropic Provider", version: "0.6.0", role: "Model provider", description: "Discovers Claude models and streams normalized responses through the Harness.", entry: "provider.models", graph: "Resolved · contributor", slots: "model.anthropic" },
  { id: "workspace", icon: "folder-search", name: "Workspace Context", version: "0.3.7", role: "UI + Harness", description: "Adds local context summaries and the workspace_scan Tool.", entry: "ui.context · harness.tools", graph: "Resolved · contributor", slots: "tool.workspace_scan" },
];

const providers = [
  { id: "anthropic", mark: "A", name: "Anthropic", detail: "3 models · credential cached", status: "Ready" },
  { id: "openai", mark: "O", name: "OpenAI", detail: "2 models · credential cached", status: "Ready" },
  { id: "google", mark: "G", name: "Google", detail: "2 models · needs credential", status: "Setup" },
  { id: "local", mark: "⌁", name: "Local endpoint", detail: "OpenAI-compatible · 127.0.0.1", status: "Ready" },
];

const icon = (name, label = "") => `<i data-lucide="${name}"${label ? ` aria-label="${label}"` : ""}></i>`;
const esc = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const selectedExtension = () => extensions.find((item) => item.id === state.selectedExtension) || extensions[0];

function topbar() {
  return `<header class="topbar">
    <button class="topbar-collapse" data-action="collapse-sidebar" aria-label="${state.sidebarCollapsed ? "Expand" : "Collapse"} sidebar">${icon(state.sidebarCollapsed ? "panel-left-open" : "panel-left-close")}</button>
    <span class="window-drag"></span>
    <div class="window-controls" aria-label="Window controls"><button aria-label="Minimize">${icon("minus")}</button><button aria-label="Maximize">${icon("square")}</button><button aria-label="Close">${icon("x")}</button></div>
  </header>`;
}

function sessionCard(session) {
  const selected = session.id === "harness";
  return `<button class="featured-session ${selected ? "selected" : ""}" data-session="${session.id}">
    <span class="featured-meta"><span class="session-source">${icon("message-square-code")}<b>${esc(session.workspace)}</b></span><time>${session.time}</time></span>
    <strong>${esc(session.title)}</strong>
    <span class="featured-status"><b>${esc(session.status)}</b><span>${esc(session.detail)}</span>${icon(session.status === "Running" ? "loader-circle" : "circle")}</span>
  </button>`;
}

function navigation() {
  const active = state.sessions.filter((item) => item.status !== "Settled");
  const filtered = state.workspaceFilter === "all" ? state.sessions : state.sessions.filter((item) => item.workspace === state.workspaceFilter);
  const featured = filtered.filter((item) => item.status !== "Settled");
  const settled = filtered.filter((item) => item.status === "Settled");
  if (state.sidebarCollapsed) return `<nav class="navigation-view collapsed" aria-label="Drycode navigation">
    <header class="sidebar-brand"><span class="sidebar-logo">${icon("panels-top-left")}</span><strong>Drycode</strong><span class="dev-badge">Dev</span></header>
    <div class="sidebar-actions"><button data-action="search" aria-label="Search">${icon("search")}<span>Search</span><kbd>Ctrl K</kbd></button><button data-action="new-session" aria-label="New Session">${icon("plus")}<span>New Session</span><kbd>Ctrl Shift O</kbd></button></div>
    <div class="rail-collapsed"><button class="rail-button" data-action="workspace-menu" aria-label="Workspaces">${icon("folders")}</button><button class="rail-button" data-action="session-menu" aria-label="Sessions">${icon("messages-square")}<small>${active.length}</small></button></div>
    <footer class="sidebar-footer"><button class="selected" data-action="settings" aria-label="Settings">${icon("settings")}<span>Settings</span></button><button class="sidebar-icon" data-action="reload" aria-label="Reload runtime">${icon("refresh-cw")}</button></footer>
  </nav>`;
  return `<nav class="navigation-view" aria-label="Drycode navigation">
    <header class="sidebar-brand"><span class="sidebar-logo">${icon("panels-top-left")}</span><strong>Drycode</strong><span class="dev-badge">Dev</span></header>
    <div class="sidebar-actions"><button data-action="search" aria-label="Search" title="Search">${icon("search")}<span>Search</span><kbd>Ctrl K</kbd></button><button data-action="new-session" aria-label="New Session" title="New Session">${icon("plus")}<span>New Session</span><kbd>Ctrl Shift O</kbd></button></div>
    <div class="workspace-tabs">${state.workspaces.map((name) => `<button class="${(name.toLowerCase() === state.workspaceFilter || (name === "All" && state.workspaceFilter === "all")) ? "selected" : ""} ${name === "All" ? "all" : ""}" data-workspace="${esc(name.toLowerCase())}">${name === "All" ? "ALL" : `${icon("folder")}<span>${esc(name)}</span>`}</button>`).join("")}<button class="add" data-action="choose-folder" aria-label="Add workspace">${icon("plus")}</button></div>
    <div class="sidebar-sessions"><div class="featured-sessions">${featured.map(sessionCard).join("")}</div><div class="settled-heading"><span>Settled</span><i></i></div><div class="settled-sessions">${settled.map((session) => `<button class="settled-session" data-session="${session.id}">${icon("message-square")}<span>${esc(session.title)}</span><time>${session.time}</time></button>`).join("")}</div></div>
    <footer class="sidebar-footer"><button class="selected" data-action="settings" aria-current="page" aria-label="Settings">${icon("settings")}<span>Settings</span></button><button class="sidebar-icon" data-action="reload" aria-label="Reload runtime" title="Reload Runtime">${icon("refresh-cw")}</button></footer>
  </nav>`;
}

function overview() {
  return `<section class="section" id="overview" data-section="overview"><div class="section-heading">${icon("activity")}<div><h2>Runtime at a glance</h2><p>One composed graph powers both UI and Harness runtimes. These values describe the generation currently serving this window.</p></div></div>
    <div class="overview-grid"><article class="metric-card accent-cyan"><span class="metric-label">Graph state</span><span class="metric-value">Resolved <small>18 extensions</small></span><p>Deterministic dependency graph accepted</p></article><article class="metric-card accent-amber"><span class="metric-label">Generation</span><span class="metric-value">18 <small>started 12m ago</small></span><p>UI + Harness pair, bridge connected</p></article><article class="metric-card accent-purple"><span class="metric-label">Home footprint</span><span class="metric-value">1.8 <small>GB cached</small></span><p>Durable records are protected</p></article></div>
  </section>`;
}

function extensionInspector() {
  const item = selectedExtension();
  return `<aside class="inspector"><div class="inspector-top"><span class="extension-mark ${item.id === "shell" ? "purple" : item.id === "workspace" ? "cyan" : ""}">${icon(item.icon)}</span><div><h3>${esc(item.name)}</h3><p>${esc(item.description)}</p></div></div><dl><dt>Manifest</dt><dd>${esc(item.name.toLowerCase().replaceAll(" ", "-"))}@${item.version}</dd><dt>Entry point</dt><dd>${esc(item.entry)}</dd><dt>Graph role</dt><dd>${esc(item.graph)}</dd><dt>Service slots</dt><dd>${esc(item.slots)}</dd></dl></aside>`;
}

function extensionsSection() {
  return `<section class="section" id="extensions" data-section="extensions"><div class="section-heading">${icon("boxes")}<div><h2>Extension graph</h2><p>Installed extensions compose the product you use. Select a node to inspect its manifest contribution and owned contracts.</p></div></div><div class="extensions-layout"><div class="extension-list">${extensions.map((item) => `<button class="extension-card ${item.id === state.selectedExtension ? "selected" : ""}" data-extension="${item.id}"><span class="extension-mark ${item.id === "shell" ? "purple" : item.id === "workspace" ? "cyan" : ""}">${icon(item.icon)}</span><span><b>${esc(item.name)}</b><small>v${item.version} · ${esc(item.role)}</small></span><strong>${item.id === "harness" ? "Root" : "Resolved"}</strong></button>`).join("")}</div>${extensionInspector()}</div></section>`;
}

function slotsSection() {
  return `<section class="section" id="slots" data-section="slots"><div class="section-heading">${icon("network")}<div><h2>Service slots</h2><p>The frozen registry for this generation. Ownership stays explicit while eligible extensions provide the effective value.</p></div></div><div class="slot-list"><div class="slot-row">${icon("panel-top")}<span><b>shell</b><small>Root application surface and navigation composition</small></span><strong class="slot-owner">Starter Shell</strong></div><div class="slot-row">${icon("message-circle")}<span><b>session.run</b><small>Starts and observes one active Run per Session</small></span><strong class="slot-owner">Local Harness</strong></div><div class="slot-row">${icon("radio-tower")}<span><b>model.anthropic</b><small>Normalized response stream over the UI–Harness Bridge</small></span><strong class="slot-owner">Anthropic Provider</strong></div></div></section>`;
}

function diagnosticsSection() {
  const output = state.diagnostic ? "[12:41:08] graph      passed · 18 manifests resolved\n[12:41:08] registry   passed · 7 service slots frozen\n[12:41:09] bridge     passed · UI ↔ Harness generation 18\n[12:41:09] storage    notice  · 3 temporary artifacts can be reclaimed\n\nDiagnostic complete. No blocking faults found." : "";
  return `<section class="section" id="diagnostics" data-section="diagnostics"><div class="section-heading">${icon("stethoscope")}<div><h2>Runtime health & diagnostics</h2><p>Check the graph, registries, Bridge, and Drycode Home without interrupting the current generation.</p></div></div><div class="health-grid"><div class="health-item"><span class="health-icon">${icon("git-merge")}</span><span><b>Extension graph</b><small>18 / 18 manifests accepted</small></span><strong class="health-state">Passed</strong></div><div class="health-item"><span class="health-icon">${icon("radio-tower")}</span><span><b>UI–Harness Bridge</b><small>Latency 14ms · generation 18</small></span><strong class="health-state">Connected</strong></div><div class="health-item"><span class="health-icon">${icon("database")}</span><span><b>Drycode Home</b><small>Writable · last flush 2m ago</small></span><strong class="health-state">Ready</strong></div><div class="health-item"><span class="health-icon warn">${icon("archive-restore")}</span><span><b>Temporary data</b><small>3 artifacts · 86 MB reclaimable</small></span><strong class="health-state warn">Notice</strong></div></div><div class="diagnostic-toolbar"><button data-action="run-diagnostics">${icon(state.diagnostic ? "rotate-ccw" : "scan-search")}<span>${state.diagnostic ? "Run again" : "Run full diagnostics"}</span></button><span class="last-run">${state.diagnostic ? "Completed just now" : "Last run 18 minutes ago"}</span><span class="grow"></span><button class="plain-button" data-action="copy-report">${icon("copy")} Copy report</button></div><pre class="diagnostic-output ${state.diagnostic ? "visible" : ""}">${esc(output)}</pre></section>`;
}

function preferencesSection() {
  return `<section class="section" id="preferences" data-section="preferences"><div class="section-heading">${icon("sliders-horizontal")}<div><h2>Shell-owned preferences</h2><p>Small choices owned by the Shell, kept separate from extension composition and Session data.</p></div></div><div class="preferences"><div class="preference-row"><span class="preference-icon">${icon("list-end")}</span><span class="preference-copy"><b>Follow active Run</b><small>Keep the newest Tool event in view while a Run is active.</small></span><button class="switch ${state.prefs.autoScroll ? "on" : ""}" data-pref="autoScroll" role="switch" aria-checked="${state.prefs.autoScroll}"><i></i></button></div><div class="preference-row"><span class="preference-icon">${icon("history")}</span><span class="preference-copy"><b>Restore open Sessions</b><small>Reopen the last Session list when the desktop window returns.</small></span><button class="switch ${state.prefs.preserve ? "on" : ""}" data-pref="preserve" role="switch" aria-checked="${state.prefs.preserve}"><i></i></button></div><div class="preference-row"><span class="preference-icon">${icon("rows-3")}</span><span class="preference-copy"><b>Navigation density</b><small>How much Session context is shown in the left rail.</small></span><select data-pref-select="density"><option ${state.prefs.density === "Comfortable" ? "selected" : ""}>Comfortable</option><option ${state.prefs.density === "Compact" ? "selected" : ""}>Compact</option></select></div></div></section>`;
}

function storageSection() {
  return `<section class="section" id="storage" data-section="storage"><div class="section-heading">${icon("hard-drive")}<div><h2>Drycode Home</h2><p>Inspect local durable data, caches, and temporary artifacts. Workspace files live outside this home.</p></div></div><div class="storage-card"><div><h3>Local storage footprint</h3><p><b>~/.drycode/</b> contains Session records, the resolved extension set, diagnostic history, and cached provider metadata.</p><div class="storage-actions"><button data-action="open-home">${icon("folder-open")} Open Drycode Home</button><button class="danger-button" data-action="clear-temp">${icon("trash-2")} Clear temporary data</button></div></div><div class="storage-meter"><div><i></i><i></i><i></i><i></i></div><small><span>1.8 GB used</span><span>2.4 GB limit</span></small></div></div></section>`;
}

function providersSection() {
  return `<section class="section" id="providers" data-section="providers"><div class="section-heading">${icon("plug")}<div><h2>Provider extensions</h2><p>Credentials and model discovery belong to provider extensions. The Shell only shows their composed status.</p></div></div><div class="provider-grid">${providers.map((provider) => `<article class="provider-card ${provider.status === "Ready" ? "selected" : ""}"><span class="provider-logo">${esc(provider.mark)}</span><span><b>${esc(provider.name)}</b><small>${esc(provider.detail)}</small></span><button data-provider="${provider.id}">${provider.status === "Ready" ? "Details" : "Connect"}</button></article>`).join("")}</div><button class="add-provider" data-action="add-provider">${icon("plus")} Add provider extension</button></section>`;
}

function settingsPage() {
  const index = [
    ["overview", "Overview", "activity", ""], ["extensions", "Extension graph", "boxes", "4"], ["slots", "Service slots", "network", "7"], ["diagnostics", "Health & diagnostics", "stethoscope", ""], ["preferences", "Shell preferences", "sliders-horizontal", ""], ["storage", "Drycode Home", "hard-drive", "1.8G"], ["providers", "Provider extensions", "plug", "4"],
  ];
  return `<main class="settings-page" data-settings-page><header class="settings-header"><div class="settings-header-inner"><div class="settings-title"><span class="eyebrow">Drycode Core · local control plane</span><h1>Settings</h1><p>Explore what is composed, what is owned, and what is healthy in this Runtime Generation.</p></div><div class="generation-badge"><i></i><span>GENERATION 18&nbsp; / &nbsp;RUNNING</span></div></div></header><div class="settings-body"><nav class="settings-index" aria-label="Settings sections"><span class="index-label">Control plane</span>${index.map(([id, label, ico, count]) => `<button class="index-button ${state.selectedSection === id ? "selected" : ""}" data-jump="${id}">${icon(ico)}<span>${label}</span>${count ? `<small class="index-count">${count}</small>` : ""}</button>`).join("")}<span class="index-divider"></span><button class="index-button" data-action="reload">${icon("refresh-cw")}<span>Reload Runtime</span></button></nav><div class="content-column">${overview()}${extensionsSection()}${slotsSection()}${diagnosticsSection()}${preferencesSection()}${storageSection()}${providersSection()}<div class="footer-note">${icon("shield-check")}<span>Settings are local to this Drycode Home. Nothing leaves this machine unless a provider extension sends a request.</span></div></div></div></main>`;
}

function modal() {
  if (!state.modal) return "";
  if (state.modal === "reload") return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true"><div class="dialog-title"><span class="dialog-icon amber">${icon("refresh-cw")}</span><div><span class="eyebrow">Runtime lifecycle</span><h2>Reload the Runtime?</h2></div></div><p>Drycode will stop the complete UI and Harness Runtime Generation, then start a fresh generation. Durable Sessions and local preferences remain available.</p><div class="reload-note">${icon("triangle-alert")}<span>The active Run will be interrupted. Session records stay safe.</span></div><div class="dialog-actions"><button class="plain-button" data-action="close-modal">Cancel</button><button class="danger-button" data-action="confirm-reload">${icon("refresh-cw")} Reload Drycode</button></div></section></div>`;
  if (state.modal === "reloading") return `<div class="modal-shade"><section class="dialog reload-progress" role="dialog" aria-modal="true"><span class="dialog-icon amber">${icon("refresh-cw")}</span><span class="eyebrow">Runtime lifecycle</span><h2>Reloading Runtime...</h2><p>Stopping the current generation and starting a fresh UI and Harness pair.</p><div class="progress-track"><i></i></div><small>Composing Extension Graph 19</small></section></div>`;
  if (state.modal === "provider") return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true"><div class="dialog-title"><span class="dialog-icon">${icon("plug")}</span><div><span class="eyebrow">Provider extension</span><h2>Add a provider</h2></div></div><p>Choose a local extension to add to the composed provider registry. Credentials stay in Drycode Home.</p><div class="dialog-list"><button data-action="connect-provider"><span class="provider-logo">O</span><b>OpenAI-compatible endpoint</b><small>Local</small></button><button data-action="connect-provider"><span class="provider-logo">A</span><b>Anthropic</b><small>Cloud</small></button><button data-action="connect-provider"><span class="provider-logo">G</span><b>Google Gemini</b><small>Cloud</small></button></div><div class="dialog-actions"><button class="plain-button" data-action="close-modal">Cancel</button></div></section></div>`;
  if (state.modal === "clear") return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true"><div class="dialog-title"><span class="dialog-icon rose">${icon("trash-2")}</span><div><span class="eyebrow">Drycode Home</span><h2>Clear temporary data?</h2></div></div><p>Remove 86 MB of disposable diagnostic and bridge artifacts. Durable Session records, credentials, and the resolved graph are not affected.</p><div class="dialog-actions"><button class="plain-button" data-action="close-modal">Cancel</button><button class="danger-button" data-action="confirm-clear">${icon("trash-2")} Clear 86 MB</button></div></section></div>`;
  return "";
}

function render() {
  document.querySelector("#app").innerHTML = `<div class="app-frame">${topbar()}<div class="nav-layout ${state.sidebarCollapsed ? "sidebar-collapsed" : ""}">${navigation()}${settingsPage()}</div></div>${modal()}${state.toast ? `<div class="toast" role="status">${icon("info")}<span>${esc(state.toast)}</span></div>` : ""}`;
  if (window.lucide) window.lucide.createIcons();
  bind();
}

function showToast(message) {
  clearTimeout(state.toastTimer); state.toast = message; render();
  state.toastTimer = setTimeout(() => { state.toast = ""; render(); }, 2200);
}
function jumpTo(id) {
  state.selectedSection = id;
  document.querySelectorAll(".index-button[data-jump]").forEach((button) => button.classList.toggle("selected", button.dataset.jump === id));
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
function runDiagnostics() {
  if (state.diagnosticTimer) return;
  showToast("Checking graph, registries, Bridge, and local storage…");
  state.diagnosticTimer = setTimeout(() => { state.diagnostic = true; state.diagnosticTimer = null; render(); }, 900);
}
function confirmReload() {
  state.modal = "reloading"; render();
  setTimeout(() => { state.modal = null; render(); showToast("Runtime Generation 19 is ready"); }, 1500);
}
function bind() {
  document.querySelectorAll("[data-action]").forEach((element) => element.addEventListener("click", (event) => {
    const action = element.dataset.action;
    if (action === "collapse-sidebar") { state.sidebarCollapsed = !state.sidebarCollapsed; return render(); }
    if (action === "settings") return render();
    if (action === "reload") { state.modal = "reload"; return render(); }
    if (action === "close-modal") { state.modal = null; return render(); }
    if (action === "confirm-reload") return confirmReload();
    if (action === "run-diagnostics") return runDiagnostics();
    if (action === "copy-report") return showToast("Diagnostic report copied to clipboard");
    if (action === "clear-temp") { state.modal = "clear"; return render(); }
    if (action === "confirm-clear") { state.modal = null; state.storageNotice = true; return showToast("Temporary data cleared · 86 MB reclaimed"); }
    if (action === "add-provider") { state.modal = "provider"; return render(); }
    if (action === "connect-provider") { state.modal = null; return showToast("Provider extension staged for next Reload"); }
    if (action === "open-home") return showToast("Opening ~/.drycode in the system file manager");
    if (action === "search") return showToast("Session search would open here");
    if (action === "new-session") return showToast("New Session would open in the chat Shell");
    if (action === "choose-folder") return showToast("Workspace folder picker would open here");
    if (action === "workspace-menu" || action === "session-menu") return showToast(action === "workspace-menu" ? "Workspace navigation is available in the expanded rail" : "Session navigation is available in the expanded rail");
  }));
  document.querySelectorAll("[data-jump]").forEach((button) => button.addEventListener("click", () => jumpTo(button.dataset.jump)));
  document.querySelectorAll("[data-extension]").forEach((button) => button.addEventListener("click", () => { state.selectedExtension = button.dataset.extension; render(); }));
  document.querySelectorAll("[data-workspace]").forEach((button) => button.addEventListener("click", () => { state.workspaceFilter = button.dataset.workspace === "all" ? "all" : button.dataset.workspace; render(); }));
  document.querySelectorAll("[data-session]").forEach((button) => button.addEventListener("click", () => showToast(`Opening Session: ${button.querySelector("strong, span")?.textContent || "Session"}`)));
  document.querySelectorAll("[data-pref]").forEach((button) => button.addEventListener("click", () => { const key = button.dataset.pref; state.prefs[key] = !state.prefs[key]; render(); showToast(`${key === "autoScroll" ? "Follow active Run" : "Restore open Sessions"} ${state.prefs[key] ? "on" : "off"}`); }));
  document.querySelectorAll("[data-pref-select]").forEach((select) => select.addEventListener("change", () => { state.prefs.density = select.value; showToast(`Navigation density: ${select.value}`); }));
  document.querySelectorAll("[data-provider]").forEach((button) => button.addEventListener("click", () => showToast(`${button.dataset.provider === "google" ? "Google" : button.dataset.provider} provider details opened`)));
  document.querySelectorAll(".modal-shade[data-dismiss]").forEach((shade) => shade.addEventListener("click", (event) => { if (event.target === shade) { state.modal = null; render(); } }));
  const page = document.querySelector("[data-settings-page]");
  if (page) page.addEventListener("scroll", () => {
    const sections = [...document.querySelectorAll(".section")];
    const current = sections.reverse().find((section) => section.getBoundingClientRect().top < 180);
    if (current && current.dataset.section !== state.selectedSection) { state.selectedSection = current.dataset.section; document.querySelectorAll(".index-button[data-jump]").forEach((button) => button.classList.toggle("selected", button.dataset.jump === state.selectedSection)); }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.modal) { state.modal = null; render(); }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); showToast("Session search would open here"); }
});
render();
