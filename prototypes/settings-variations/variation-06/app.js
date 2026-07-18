const state = {
  section: "overview",
  sidebarCollapsed: false,
  modal: null,
  drawer: null,
  toast: "",
  toastTimer: null,
  reloadTimer: null,
  generation: 24,
  graphPending: false,
  extensions: [
    { id: "drycode.shell.starter", name: "Starter Shell", version: "0.4.2", kind: "UI runtime", description: "A focused shell for Sessions, Workspaces, and local contributions.", icon: "panels-top-left", tone: "", entry: "shell", dependencies: ["drycode.sessions", "drycode.harness.local"] },
    { id: "drycode.harness.local", name: "Local Harness", version: "0.7.1", kind: "Harness runtime", description: "Runs agent work locally and exposes validated Tool calls.", icon: "cpu", tone: "harness", entry: "harness", dependencies: ["drycode.sessions"] },
    { id: "drycode.sessions", name: "Session Records", version: "0.3.0", kind: "UI + Harness", description: "Owns append-only Session records and Workspace bindings.", icon: "database", tone: "store", entry: "records", dependencies: [] },
    { id: "model.anthropic", name: "Anthropic Provider", version: "0.2.4", kind: "Model Provider", description: "Discovers models and normalizes response streams for the Harness.", icon: "sparkles", tone: "", entry: "provider", dependencies: [] },
    { id: "skill.code-review", name: "Code Review Skill", version: "0.1.8", kind: "Skill", description: "Prompt instructions and review resources for a Session.", icon: "book-open", tone: "store", entry: "skill", dependencies: [] },
  ],
  sessions: [
    { title: "Shape the starter chat", workspace: "drycode", time: "Now", running: true },
    { title: "Extract the Harness", workspace: "drycode", time: "2h", running: false },
    { title: "Plan the Windows install", workspace: "agent-lab", time: "Fri", running: false },
  ],
};

const slots = [
  { id: "shell", name: "Shell", owner: "drycode.core", provider: "Starter Shell", runtime: "UI Registry", icon: "panels-top-left" },
  { id: "session-store", name: "Session Store", owner: "drycode.sessions", provider: "Session Records", runtime: "UI + Harness", icon: "database" },
  { id: "harness-run", name: "Harness Run", owner: "drycode.harness.local", provider: "Local Harness", runtime: "Harness Registry", icon: "cpu" },
  { id: "model", name: "Model Provider", owner: "drycode.core", provider: "Anthropic Provider", runtime: "Harness Registry", icon: "sparkles" },
  { id: "bridge", name: "UI-Harness Bridge", owner: "drycode.core", provider: "Generation 24 bridge", runtime: "Generation scoped", icon: "cable" },
];

const icon = (name, label = "") => `<i data-lucide="${name}"${label ? ` aria-label="${label}"` : ""}></i>`;
const escapeHtml = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const extension = (id) => state.extensions.find((item) => item.id === id);
const edgeCount = () => 7 + Math.max(0, state.extensions.length - 5);

function topbar() {
  return `<header class="topbar">
    <button class="topbar-collapse" data-action="collapse" aria-label="${state.sidebarCollapsed ? "Expand" : "Collapse"} sidebar">${icon(state.sidebarCollapsed ? "panel-left-open" : "panel-left-close")}</button>
    <span class="window-drag"></span><span class="window-label">Settings / ${escapeHtml(sectionTitle())}</span><span class="window-drag"></span>
    <div class="window-controls" aria-label="Window controls"><button aria-label="Minimize">${icon("minus")}</button><button aria-label="Maximize">${icon("square")}</button><button aria-label="Close">${icon("x")}</button></div>
  </header>`;
}

function sectionTitle() {
  return { overview: "Runtime overview", extensions: "Extensions", graph: "Extension Graph", slots: "Service Slots", generation: "Runtime Generation" }[state.section];
}

function sidebar() {
  const nav = [
    ["overview", "Overview", "layout-dashboard"],
    ["extensions", "Extensions", "puzzle"],
    ["graph", "Extension Graph", "network"],
    ["slots", "Service Slots", "brackets"],
    ["generation", "Runtime Generation", "refresh-cw"],
  ];
  return `<nav class="sidebar ${state.sidebarCollapsed ? "collapsed" : ""}" aria-label="Drycode navigation">
    <header class="brand"><span class="brand-logo" title="Drycode">${icon("panels-top-left")}</span><strong>Drycode</strong><span class="dev-badge">Dev</span></header>
    <div class="sidebar-tools"><button class="nav-action" data-action="search" aria-label="Search" title="Search">${icon("search")}<span>Search</span><kbd>Ctrl K</kbd></button><button class="nav-action" data-action="new-session" aria-label="New Session" title="New Session">${icon("plus")}<span>New Session</span><kbd>Ctrl Shift O</kbd></button></div>
    <section class="sidebar-section"><div class="section-label">Settings</div><div class="settings-nav">${nav.map(([id, label, glyph]) => `<button class="${state.section === id ? "selected" : ""}" data-section="${id}" ${state.section === id ? 'aria-current="page"' : ""}>${icon(glyph)}<span>${label}</span></button>`).join("")}</div></section>
    <div class="session-list"><div class="session-label"><span>Sessions</span><i></i></div>${state.sessions.map((session) => `<button class="session-row ${session.running ? "running" : ""}" data-action="session"><span>${icon(session.running ? "loader-circle" : "message-square")}</span><span class="session-copy"><strong>${escapeHtml(session.title)}</strong><small>${escapeHtml(session.workspace)}</small></span><time>${session.time}</time></button>`).join("")}</div>
    <footer class="sidebar-footer"><button class="sidebar-home" data-action="home" title="Return to chat">${icon("message-square-code")}<span>Chat</span><small>drycode</small></button><button data-action="reload" aria-label="Reload Runtime" title="Reload Runtime">${icon("refresh-cw")}</button></footer>
  </nav>`;
}

function statusPill() {
  return `<span class="status-pill ${state.graphPending ? "stale" : ""}"><i></i>${state.graphPending ? "Reload required" : "Generation running"}</span>`;
}

function generationStrip() {
  return `<section class="card generation-card"><div class="generation-intro"><span class="eyebrow">Supervised lifecycle</span><h2>Runtime Generation ${state.generation}</h2><p>One resolved graph, paired runtimes, and one generation-scoped bridge.</p></div><div class="generation-metric"><b>${state.extensions.length}</b><span>Extensions in graph</span></div><div class="generation-metric"><b>5</b><span>Effective Service Slots</span></div><div class="generation-action"><button data-action="reload">${icon("refresh-cw")}Reload generation</button></div></section>`;
}

function graphPreview() {
  return `<section class="card graph-preview"><div class="card-header"><span class="header-icon">${icon("network")}</span><div><h2>Extension Graph</h2><p>Accepted as one deterministic unit</p></div><span class="grow"></span><button class="plain icon-button" data-section="graph" aria-label="Open Extension Graph">${icon("arrow-up-right")}</button></div><div class="card-body"><div class="graph-line"><span class="graph-node shell">${icon("panels-top-left")}<strong>Starter Shell</strong><small>UI</small></span><span class="graph-arrow">${icon("arrow-right")}</span><span class="graph-node">${icon("database")}<strong>Session Records</strong><small>UI + Harness</small></span><span class="graph-arrow">${icon("arrow-right")}</span><span class="graph-node">${icon("cpu")}<strong>Local Harness</strong><small>Harness</small></span></div><div class="graph-foot"><div class="graph-stat"><b>Resolved</b><span>${state.extensions.length} identities, ${edgeCount()} dependency edges</span></div><div class="graph-stat"><b>Atomic</b><span>No partial graph is started</span></div></div></div></section>`;
}

function slotsPreview() {
  return `<section class="card"><div class="card-header"><span class="header-icon">${icon("brackets")}</span><div><h2>Effective Service Slots</h2><p>Frozen for this Runtime Generation</p></div><span class="grow"></span><button class="plain icon-button" data-section="slots" aria-label="Open Service Slots">${icon("arrow-up-right")}</button></div><div class="card-body"><div class="slot-list">${slots.slice(0, 4).map(slotRow).join("")}</div></div></section>`;
}

function slotRow(slot) {
  return `<div class="slot-row"><span class="slot-mark">${icon(slot.icon)}</span><span class="slot-copy"><strong>${escapeHtml(slot.name)}</strong><span>${escapeHtml(slot.owner)}</span></span><span class="slot-value">${escapeHtml(slot.provider)}<small>${escapeHtml(slot.runtime)}</small></span></div>`;
}

function overview() {
  return `<div class="page-wrap"><header class="page-header"><div><span class="eyebrow">Drycode Home · ~/.drycode</span><h1>Settings</h1><p>See what Drycode is composed of locally. Extensions resolve into one graph, then a Runtime Generation freezes the services used by your Sessions.</p></div><div class="header-actions">${statusPill()}<button class="icon-button" data-action="add" aria-label="Add local Extension" title="Add local Extension">${icon("plus")}</button></div></header>${generationStrip()}<div class="overview-grid"><div>${graphPreview()}<div class="card note-card"><div class="card-body">${icon("info")}<p><b>Local by design.</b> Extension manifests are discovered from Drycode Home. Changing the graph takes effect on the next complete Reload, never halfway through a generation.</p></div></div></div><div>${slotsPreview()}</div></div></div>`;
}

function extensionRow(item) {
  return `<article class="extension-row"><span class="extension-mark ${item.tone}">${icon(item.icon)}</span><span class="extension-copy"><strong>${escapeHtml(item.name)}</strong><span><code>${escapeHtml(item.id)}</code> · ${escapeHtml(item.description)}</span></span><span class="extension-meta"><b>${escapeHtml(item.version)}</b><span>${escapeHtml(item.kind)}</span></span><button data-extension="${escapeHtml(item.id)}">Inspect</button></article>`;
}

function extensionsPage() {
  return `<div class="page-wrap"><header class="page-header"><div><span class="eyebrow">Drycode Home · Local extensions</span><h1>Extensions</h1><p>Installed Extension Manifests discovered on this machine. Each contribution participates in the complete graph before a generation starts.</p></div><div class="header-actions"><button class="primary" data-action="add">${icon("plus")}Add local Extension</button></div></header><div class="section-page"><div class="section-toolbar"><p>${state.extensions.length} discovered extensions · ${state.graphPending ? "graph change waiting for Reload" : "graph accepted by Core"}</p><span class="grow"></span>${statusPill()}</div><div class="extension-list">${state.extensions.map(extensionRow).join("")}</div><div class="card note-card"><div class="card-body">${icon("file-code-2")}<p><b>What an Extension brings.</b> A local package can contribute UI behavior, Harness behavior, or both. Its manifest declares identity, version, compatibility, entry points, and dependencies.</p></div></div></div></div>`;
}

function mapNode(item, className) {
  return `<button class="map-node ${className || ""}" data-extension="${item.id}">${icon(item.icon)}<span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.kind)}</small></span></button>`;
}

function graphPage() {
  const shell = extension("drycode.shell.starter");
  const harness = extension("drycode.harness.local");
  const sessions = extension("drycode.sessions");
  const model = extension("model.anthropic");
  return `<div class="page-wrap"><header class="page-header"><div><span class="eyebrow">Core resolution · Complete graph</span><h1>Extension Graph</h1><p>The graph is the full set of discovered Extensions and dependency edges. Drycode accepts or rejects it as a whole.</p></div><div class="header-actions">${statusPill()}</div></header><div class="section-page"><section class="graph-board"><div class="graph-board-head"><div><h2>Generation ${state.generation} resolution</h2><span>Deterministic dependency view</span></div><span class="grow"></span><button class="plain icon-button" data-action="diagnose" aria-label="Run graph diagnostics" title="Run graph diagnostics">${icon("scan-search")}</button></div><div class="graph-map">${mapNode(shell, "shell-node primary-node")}<span class="line-center"></span><span class="line-left"></span>${mapNode(harness, "harness-node")}${mapNode(sessions, "session-node")}${mapNode(model, "model-node")}</div><div class="graph-legend"><span><i></i>UI contribution</span><span><i class="harness-dot"></i>Harness contribution</span><span><i class="contract-dot"></i>Dependency edge</span></div></section><div class="diagnostics"><div class="diagnostic-item">${icon("circle-check")}<div><strong>All manifests valid</strong><span>Identity and version declarations are present for every node.</span></div></div><div class="diagnostic-item">${icon("circle-check")}<div><strong>Dependencies resolved</strong><span>${edgeCount()} edges resolved without an ambiguous provider.</span></div></div></div><section class="card note-card"><div class="card-body">${icon("shield-check")}<p><b>Atomic graph boundary.</b> A changed manifest is staged for the next Reload. The current generation continues with its already-resolved graph.</p></div></section></div></div>`;
}

function slotsPage() {
  return `<div class="page-wrap"><header class="page-header"><div><span class="eyebrow">Frozen registry · Generation ${state.generation}</span><h1>Service Slots</h1><p>Stable, namespaced contracts with zero or one effective provider inside this Runtime Generation. UI and Harness runtimes keep separate registries.</p></div><div class="header-actions">${statusPill()}</div></header><div class="section-page"><div class="slot-table"><div class="slot-table-head"><span>Slot</span><span>Owner</span><span>Effective provider</span><span>Runtime</span></div>${slots.map((slot) => `<div class="slot-table-row"><strong>${escapeHtml(slot.name)}</strong><code>${escapeHtml(slot.id)}</code><span class="effective">${escapeHtml(slot.provider)}</span><span class="registry-badge">${icon(slot.runtime.includes("Harness") ? "cpu" : "panels-top-left")}${escapeHtml(slot.runtime)}</span></div>`).join("")}</div><section class="card note-card"><div class="card-body">${icon("archive")}<p><b>Registry snapshot.</b> The Service Registry is the frozen result of composing the graph for one generation. Extensions provide, replace, decorate, or remove a slot through its contract owner.</p></div></section></div></div>`;
}

function generationPage() {
  return `<div class="page-wrap"><header class="page-header"><div><span class="eyebrow">Lifecycle · Supervised by Drycode Core</span><h1>Runtime Generation</h1><p>One supervised instance of the resolved Extension Graph, paired UI and Harness runtimes, and their generation-scoped UI-Harness Bridge.</p></div><div class="header-actions">${statusPill()}<button data-action="reload">${icon("refresh-cw")}Reload</button></div></header><div class="generation-layout"><section class="card"><div class="card-header"><span class="header-icon">${icon("activity")}</span><div><h2>Generation ${state.generation} lifecycle</h2><p>${state.graphPending ? "A graph change is waiting to be applied" : "Running as one supervised unit"}</p></div></div><div class="timeline"><div class="timeline-row"><span class="timeline-dot">${icon("check")}</span><div class="timeline-copy"><strong>Extension Graph accepted</strong><span>${state.extensions.length} manifests and their dependencies resolved together.</span></div><time>09:41:02</time></div><div class="timeline-row"><span class="timeline-dot">${icon("layers-2")}</span><div class="timeline-copy"><strong>Registries composed</strong><span>UI and Harness Service Registries frozen from the accepted graph.</span></div><time>09:41:03</time></div><div class="timeline-row"><span class="timeline-dot">${icon("radio-tower")}</span><div class="timeline-copy"><strong>Bridge connected</strong><span>Validated Calls and Streams are scoped to this generation.</span></div><time>09:41:03</time></div></div></section><section class="card"><div class="card-header"><div><h2>Lifecycle rules</h2><p>What Reload means here</p></div></div><div class="card-body lifecycle-list"><div class="lifecycle-row">${icon("square-stop")}<div><strong>Stop together</strong><span>UI and Harness runtimes stop as one unit.</span></div></div><div class="lifecycle-row">${icon("refresh-cw")}<div><strong>Start together</strong><span>A fresh generation is paired before it is shown.</span></div></div><div class="lifecycle-row">${icon("archive")}<div><strong>Keep records</strong><span>Durable Sessions remain available across Reload.</span></div></div></div></section></div><section class="card note-card"><div class="card-body">${icon("circle-help")}<p><b>Recovery surface.</b> If no generation is running, Drycode Core keeps this minimal lifecycle surface available so the graph can be repaired and started again.</p></div></section></div>`;
}

function detailDrawer() {
  const item = extension(state.drawer);
  if (!item) return "";
  return `<aside class="detail-drawer" aria-label="Extension details"><div class="drawer-head"><span class="extension-mark ${item.tone}">${icon(item.icon)}</span><div><span class="eyebrow">Extension manifest</span><h2>${escapeHtml(item.name)}</h2><p>${escapeHtml(item.id)}</p></div><button data-action="close-drawer" aria-label="Close details">${icon("x")}</button></div><div class="drawer-section"><h3>Identity</h3><div class="detail-line"><span>Version</span><code>${escapeHtml(item.version)}</code></div><div class="detail-line"><span>Compatibility</span><code>Drycode ≥ 0.8</code></div><div class="detail-line"><span>Contribution</span><code>${escapeHtml(item.kind)}</code></div></div><div class="drawer-section"><h3>Entry point</h3><p>${escapeHtml(item.description)}</p><div class="detail-line"><span>Named entry</span><code>${escapeHtml(item.entry)}</code></div></div><div class="drawer-section"><h3>Required dependencies</h3>${item.dependencies.length ? `<div class="dep-list">${item.dependencies.map((dep) => `<code>${escapeHtml(dep)}</code>`).join("")}</div>` : `<p>No required dependencies declared.</p>`}</div><div class="drawer-section"><button class="primary" data-section="graph">View in Extension Graph ${icon("arrow-up-right")}</button></div></aside>`;
}

function modal() {
  if (!state.modal) return "";
  if (state.modal === "add") return `<div class="modal-shade" data-dismiss="true"><form class="dialog" data-add-form><div class="dialog-title"><span class="dialog-icon">${icon("package-plus")}</span><div><span class="eyebrow">Local Extension</span><h2>Add to Drycode Home</h2></div></div><p>Point Drycode at a local Extension package. Its manifest will join the next complete graph resolution; the current Runtime Generation stays unchanged until Reload.</p><label>Extension location<input name="location" required placeholder="~/.drycode/extensions/my-extension"></label><label>Manifest identity<input name="identity" required placeholder="com.example.local-tools"></label><div class="dialog-actions"><button type="button" class="plain" data-action="close-modal">Cancel</button><button class="primary" type="submit">${icon("plus")}Stage Extension</button></div></form></div>`;
  if (state.modal === "reload") return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true"><div class="dialog-title"><span class="dialog-icon amber">${icon("refresh-cw")}</span><div><span class="eyebrow">Runtime lifecycle</span><h2>Reload Generation ${state.generation}?</h2></div></div><p>Drycode will stop the complete UI and Harness Runtime Generation, then start a fresh instance from the resolved Extension Graph.</p><div class="reload-note">${icon("triangle-alert")}<span>Active Runs are interrupted. Durable Session records remain available.</span></div><div class="dialog-actions"><button class="plain" data-action="close-modal">Cancel</button><button class="primary" data-action="confirm-reload">${icon("refresh-cw")}Reload together</button></div></section></div>`;
  return `<div class="modal-shade"><section class="dialog reload-progress" role="dialog" aria-modal="true"><span class="dialog-icon amber">${icon("refresh-cw")}</span><span class="eyebrow">Runtime lifecycle</span><h2>Starting Generation ${state.generation + 1}...</h2><p>Stopping the old generation, resolving the graph, and pairing UI + Harness.</p><div class="progress-track"><i></i></div><small>Composing Service Registries</small></section></div>`;
}

function pageContent() {
  return { overview, extensions: extensionsPage, graph: graphPage, slots: slotsPage, generation: generationPage }[state.section]();
}

function render() {
  document.querySelector("#app").innerHTML = `<div class="app-frame">${topbar()}<div class="content-layout ${state.sidebarCollapsed ? "collapsed" : ""}">${sidebar()}<main class="settings-main">${pageContent()}</main></div></div>${detailDrawer()}${modal()}${state.toast ? `<div class="toast" role="status">${icon("info")}<span>${escapeHtml(state.toast)}</span></div>` : ""}`;
  if (window.lucide) window.lucide.createIcons();
  bind();
}

function showToast(message) {
  clearTimeout(state.toastTimer);
  state.toast = message;
  render();
  state.toastTimer = setTimeout(() => { state.toast = ""; render(); }, 2200);
}

function openReload() { state.modal = "reload"; state.drawer = null; render(); }
function confirmReload() {
  state.modal = "reloading";
  render();
  clearTimeout(state.reloadTimer);
  state.reloadTimer = setTimeout(() => {
    state.generation += 1;
    state.graphPending = false;
    state.modal = null;
    render();
    showToast(`Runtime Generation ${state.generation} is running`);
  }, 1500);
}

function addExtension(form) {
  const data = new FormData(form);
  const location = String(data.get("location") || "").trim();
  const identity = String(data.get("identity") || "").trim();
  if (!location || !identity) return;
  const name = identity.split(".").pop().replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  if (!state.extensions.some((item) => item.id === identity)) state.extensions.push({ id: identity, name: `${name} Extension`, version: "manifest", kind: "Local contribution", description: `Discovered at ${location}. Waiting for the next graph resolution.`, icon: "puzzle", tone: "store", entry: "local", dependencies: [] });
  state.graphPending = true;
  state.modal = null;
  state.section = "extensions";
  render();
  showToast("Manifest staged · Reload to resolve the complete graph");
}

function bind() {
  document.querySelectorAll("[data-section]").forEach((element) => element.addEventListener("click", () => { state.section = element.dataset.section; state.drawer = null; state.modal = null; render(); }));
  document.querySelectorAll("[data-extension]").forEach((element) => element.addEventListener("click", () => { state.drawer = element.dataset.extension; render(); }));
  document.querySelectorAll("[data-action]").forEach((element) => element.addEventListener("click", (event) => {
    const action = element.dataset.action;
    if (action === "collapse") { state.sidebarCollapsed = !state.sidebarCollapsed; render(); }
    if (action === "reload") openReload();
    if (action === "confirm-reload") confirmReload();
    if (action === "close-modal") { state.modal = null; render(); }
    if (action === "close-drawer") { state.drawer = null; render(); }
    if (action === "add") { state.modal = "add"; render(); }
    if (action === "diagnose") showToast(`Graph diagnostics passed · ${edgeCount()} edges resolved`);
    if (action === "search") showToast("Session search would open here");
    if (action === "new-session") showToast("New Session would open in Chat");
    if (action === "home") showToast("Chat surface would open here");
    if (action === "session") showToast("Session remains available in Chat");
  }));
  document.querySelector("[data-add-form]")?.addEventListener("submit", (event) => { event.preventDefault(); addExtension(event.currentTarget); });
  document.querySelectorAll(".modal-shade[data-dismiss]").forEach((shade) => shade.addEventListener("click", (event) => { if (event.target === shade) { state.modal = null; render(); } }));
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && (state.modal || state.drawer)) { state.modal = null; state.drawer = null; render(); }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); showToast("Session search would open here"); }
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "o") { event.preventDefault(); showToast("New Session would open in Chat"); }
});

render();
