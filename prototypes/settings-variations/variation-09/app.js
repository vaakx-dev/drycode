const state = {
  sidebarCollapsed: false,
  workspaceFilter: "all",
  workspaceScroll: 0,
  modal: null,
  toast: "",
  toastTimer: null,
  generation: 19,
  reloading: false,
  expandedGraph: false,
  workspaces: ["drycode", "agent-lab", "docs", "sandbox"],
  sessions: [
    { title: "Shape the starter chat", workspace: "drycode", time: "Now", active: true },
    { title: "Extract the Harness", workspace: "drycode", time: "2h", active: false },
    { title: "Plan the Windows install", workspace: "agent-lab", time: "Fri", active: false },
    { title: "Recovery surface notes", workspace: "agent-lab", time: "Mon", active: false },
  ],
};

const extensions = [
  { mark: "SH", name: "drycode.shell.t3", version: "0.8.1", role: "Shell Extension", deps: "core >= 0.8 · ui-runtime", state: "Effective" },
  { mark: "MH", name: "drycode.model.http", version: "1.4.0", role: "Model Provider", deps: "bridge.endpoint: model.stream", state: "Effective" },
  { mark: "FS", name: "drycode.tools.filesystem", version: "0.6.2", role: "Tool contributor", deps: "harness-runtime", state: "Effective" },
  { mark: "SK", name: "drycode.skills.starter", version: "0.3.5", role: "Skill contributor", deps: "prompt.assemble", state: "Effective" },
  { mark: "LX", name: "local.telemetry", version: "0.2.0", role: "Diagnostics", deps: "service.slot: diagnostics", state: "Effective" },
  { mark: "UI", name: "drycode.ui.activity", version: "0.5.3", role: "UI contribution", deps: "drycode.shell.t3", state: "Effective" },
  { mark: "RC", name: "drycode.runtime.supervisor", version: "0.8.0", role: "Lifecycle contributor", deps: "core >= 0.8", state: "Effective" },
  { mark: "SR", name: "drycode.service.registry", version: "0.7.4", role: "Service Slot owner", deps: "ui-runtime · harness-runtime", state: "Effective" },
  { mark: "WC", name: "drycode.workspace.context", version: "0.4.1", role: "Context contributor", deps: "tool.filesystem", state: "Effective" },
  { mark: "AR", name: "drycode.activity.records", version: "0.2.8", role: "Session contributor", deps: "session.records.append", state: "Effective" },
  { mark: "MD", name: "drycode.model.discovery", version: "0.5.0", role: "Model contributor", deps: "drycode.model.http", state: "Effective" },
  { mark: "RS", name: "drycode.recovery.surface", version: "0.3.0", role: "Recovery contributor", deps: "core.lifecycle", state: "Effective" },
];

const registry = {
  ui: [
    ["shell", "Shell service", "drycode.shell.t3", "violet"],
    ["layout", "Layout contributions", "activity + settings", ""],
    ["diagnostics", "Diagnostics surface", "local.telemetry", ""],
  ],
  harness: [
    ["model", "model.request", "drycode.model.http", "violet"],
    ["tools", "tool.filesystem", "drycode.tools.filesystem", ""],
    ["prompt", "prompt.assemble", "drycode.skills.starter", ""],
  ],
};

const icon = (name, label = "") => `<i data-lucide="${name}"${label ? ` aria-label="${label}"` : ""}></i>`;
const escapeHtml = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

function topbar() {
  return `<header class="topbar">
    <button class="topbar-collapse" data-action="collapse-sidebar" aria-label="${state.sidebarCollapsed ? "Expand" : "Collapse"} sidebar">${icon(state.sidebarCollapsed ? "panel-left-open" : "panel-left-close")}</button>
    <span class="window-drag"></span>
    <div class="window-controls" aria-label="Window controls"><button aria-label="Minimize">${icon("minus")}</button><button aria-label="Maximize">${icon("square")}</button><button aria-label="Close">${icon("x")}</button></div>
  </header>`;
}

function navigationView() {
  const active = state.sessions.filter((session) => session.active && (state.workspaceFilter === "all" || session.workspace === state.workspaceFilter));
  const settled = state.sessions.filter((session) => !session.active && (state.workspaceFilter === "all" || session.workspace === state.workspaceFilter));
  const navBody = state.sidebarCollapsed
    ? `<div class="rail-navigation"><button class="rail-button" data-action="rail-workspaces" aria-label="Workspaces" title="Workspaces">${icon("folders")}</button><button class="rail-button selected" data-action="rail-sessions" aria-label="Sessions" title="Sessions">${icon("messages-square")}<small>${active.length}</small></button></div>`
    : `<div class="workspace-tabs"><button class="all-workspaces ${state.workspaceFilter === "all" ? "selected" : ""}" data-workspace-filter="all">All</button>${state.workspaces.map((name) => `<button class="${state.workspaceFilter === name ? "selected" : ""}" data-workspace-filter="${escapeHtml(name)}">${icon("folder")}<span>${escapeHtml(name)}</span></button>`).join("")}<button class="add-workspace" data-action="choose-folder" aria-label="Add Workspace" title="Add Workspace">${icon("plus")}</button></div>
      <div class="sidebar-sessions"><div class="session-heading"><span>Active</span><i></i></div>${active.map((session) => sessionRow(session, true)).join("")}<div class="session-heading"><span>Settled</span><i></i></div>${settled.map((session) => sessionRow(session, false)).join("")}</div>`;
  return `<nav class="navigation-view ${state.sidebarCollapsed ? "collapsed" : ""}" aria-label="Drycode navigation"><header class="sidebar-brand"><span class="sidebar-logo" title="Drycode">${icon("panels-top-left")}</span><strong>Drycode</strong><span class="dev-badge">Dev</span></header><div class="sidebar-actions"><button data-action="search" aria-label="Search Sessions" title="Search Sessions">${icon("search")}<span>Search</span><kbd>Ctrl K</kbd></button><button data-action="new-session" aria-label="New Session" title="New Session">${icon("plus")}<span>New Session</span><kbd>Ctrl Shift O</kbd></button></div>${navBody}<footer class="sidebar-footer"><button class="selected" data-action="settings" aria-current="page" aria-label="Settings" title="Settings">${icon("settings")}<span>Settings</span></button><button class="sidebar-icon" data-action="reload" aria-label="Reload Runtime" title="Reload Runtime">${icon("refresh-cw")}</button></footer></nav>`;
}

function sessionRow(session, active) {
  return `<button class="session-row ${active ? "selected" : ""}" data-action="session" data-session="${escapeHtml(session.title)}">${icon(active ? "loader-circle" : "message-square")}<span>${escapeHtml(session.title)}</span><time>${session.time}</time></button>`;
}

function overview() {
  return `<div class="overview-grid"><article class="overview-card primary"><header>${icon("layers-3")} Runtime Generation</header><h2>Generation ${state.generation}</h2><p>Resolved graph is running as one supervised UI + Harness pair.</p><div class="card-foot"><i class="status-dot"></i><span>Healthy · started 14 min ago</span></div></article><article class="overview-card"><header>${icon("git-merge")} Extension Graph</header><div class="metric">12<small>/ 12</small></div><div class="metric-label">extensions resolved</div><div class="card-foot">deterministic</div></article><article class="overview-card"><header>${icon("radio-tower")} UI-Harness Bridge</header><div class="metric">142<small>ms</small></div><div class="metric-label">median stream latency</div><div class="card-foot">0 failed Calls · 2 Streams</div></article></div>`;
}

function graphSection() {
  const shown = state.expandedGraph ? extensions : extensions.slice(0, 4);
  const graphRows = shown.map((item) => `<div class="graph-row"><span class="extension-mark">${item.mark}</span><span class="graph-name"><b>${item.name}</b><small>${item.version} · ${item.role}</small></span><span class="graph-deps">requires <span>${item.deps}</span></span><span class="graph-state">${icon("circle-check")} ${item.state}</span></div>`).join("");
  const moreRow = state.expandedGraph ? `<div class="graph-row more"><button data-action="toggle-graph">Show less</button></div>` : `<div class="graph-row more"><button data-action="toggle-graph">+ 8 more resolved extensions</button></div>`;
  return `<section class="settings-section"><div><h2>Extension Graph</h2><p class="section-lede">The complete, deterministic set discovered from Drycode Home. A generation starts only when this graph resolves as a whole.</p><div class="section-label">Starter Extension Set</div></div><div class="panel-stack"><article class="panel"><div class="panel-header graph-header">${icon("git-merge")}<div><strong>Resolved graph</strong><small>All manifests validated against Drycode 0.8</small></div><button class="primary" data-action="inspect-graph">Inspect graph</button></div><div class="graph-summary"><span><strong>12</strong> discovered</span><span><strong>12</strong> resolved</span><span class="hash">graph sha256: 6f3a…e91c</span></div><div class="graph-list">${graphRows}${moreRow}</div></article></div></section>`;
}

function registrySection() {
  const registryCard = (name, label, subtitle, items, iconName) => `<article class="registry"><header>${icon(iconName)}<strong>${label}</strong><span>${subtitle}</span></header>${items.map(([slot, contract, provider, tone]) => `<div class="slot">${icon("box")}<span class="slot-copy"><b>${contract}</b><small>${slot} · Service Slot</small></span><span class="slot-provider ${tone}">${provider}</span></div>`).join("")}</article>`;
  return `<section class="settings-section"><div><h2>Service Registries</h2><p class="section-lede">Frozen effective values for this generation. UI and Harness runtimes compose separate registries.</p><div class="section-label">Generation-scoped</div></div><div class="registry-grid">${registryCard("ui", "UI Runtime", "3 effective slots", registry.ui, "layout-dashboard")}${registryCard("harness", "Harness Runtime", "3 effective slots", registry.harness, "cpu")}</div></section>`;
}

function bridgeSection() {
  return `<section class="settings-section"><div><h2>UI-Harness Bridge</h2><p class="section-lede">Validated Calls and Streams between the paired runtimes. Endpoint ownership stays with its contributing Extension.</p><div class="section-label">Last 5 minutes</div></div><div class="panel-stack"><article class="bridge-card"><div class="panel-header">${icon("radio-tower")}<div><strong>Bridge traffic</strong><small>Generation ${state.generation} · local channel · schema checks on</small></div><button data-action="bridge-log">View activity</button></div><div class="bridge-line"><span class="endpoint">${icon("arrow-right-left")}<b>model.stream</b><span>Harness → UI · normalized response</span></span><span class="bridge-stat"><em>2</em> Streams · 142 ms</span></div><div class="bridge-line"><span class="endpoint">${icon("arrow-right-left")}<b>session.records.append</b><span>UI → Harness · append-only fact</span></span><span class="bridge-stat"><em>86</em> Calls · 0 rejected</span></div><div class="bridge-line"><span class="endpoint">${icon("arrow-right-left")}<b>tool.activity</b><span>Harness → UI · Run observation</span></span><span class="bridge-stat"><em>54</em> Calls · 99.9%</span></div></article></div></section>`;
}

function storageSection() {
  return `<section class="settings-section"><div><h2>Drycode Home</h2><p class="section-lede">Durable local data used by Core: discovered Extensions, cached graph facts, and diagnostics.</p><div class="section-label">Local only</div></div><div class="panel-stack"><article class="panel"><div class="storage-row"><span class="storage-icon">${icon("folder-cog")}</span><span class="storage-copy"><b>Drycode Home</b><small>~/.drycode/</small></span><span class="storage-value">1.8 GB</span></div><div class="storage-row"><span class="storage-icon">${icon("archive")}</span><span class="storage-copy"><b>Graph cache</b><small>~/.drycode/cache/extension-graph.json</small></span><span class="storage-value">42 KB</span></div><div class="storage-row"><span class="storage-icon">${icon("file-warning")}</span><span class="storage-copy"><b>Diagnostics</b><small>~/.drycode/diagnostics/current.log</small></span><span class="storage-value">286 KB</span></div><div class="storage-actions"><button data-action="open-home">Open Drycode Home</button><button data-action="clear-cache">Clear graph cache</button></div></article></div></section>`;
}

function recoverySection() {
  return `<section class="settings-section"><div><h2>Lifecycle</h2><p class="section-lede">Replace the current Runtime Generation without closing the desktop window.</p></div><div class="panel-stack"><div class="recovery">${icon("life-buoy")}<span class="recovery-copy"><b>Recovery Surface available</b><span>Core keeps this minimal surface visible if generation startup is rejected or Reload is in progress.</span></span><button data-action="reload">Reload Runtime</button></div></div></section>`;
}

function settingsPage() {
  return `<main class="settings-page"><div class="settings-wrap"><header class="settings-heading"><div><span class="eyebrow">Core / Operations</span><h1>Settings</h1><p>Understand what Drycode composed, what is running, and where local state lives.</p></div><div class="heading-meta"><b><i></i> Generation ${state.generation}</b><span>updated just now</span></div></header>${overview()}${graphSection()}${registrySection()}${bridgeSection()}${storageSection()}${recoverySection()}</div></main>`;
}

function modal() {
  if (!state.modal) return "";
  if (state.modal === "graph") return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="graph-title"><div class="dialog-title"><span class="dialog-icon">${icon("git-merge")}</span><div><span class="eyebrow">Complete graph</span><h2 id="graph-title">Extension Graph details</h2></div><button class="dialog-close" data-action="close-modal" aria-label="Close">${icon("x")}</button></div><p>Core accepted the discovered set together. There are no unresolved dependencies or partial loads in Generation ${state.generation}.</p><div class="detail-grid"><div class="detail-item"><span>Manifest scan</span><b>12 / 12 valid</b></div><div class="detail-item"><span>Graph hash</span><b>6f3a…e91c</b></div><div class="detail-item"><span>Drycode compatibility</span><b>0.8 · exact</b></div><div class="detail-item"><span>Resolution</span><b>deterministic</b></div></div><div class="dialog-list"><div><span>Shell service owner</span><b>drycode.shell.t3</b></div><div><span>Model discovery contributor</span><b>drycode.model.http</b></div><div><span>Last validation</span><b>14 min ago</b></div></div><div class="dialog-actions"><button data-action="close-modal">Close</button></div></section></div>`;
  if (state.modal === "bridge") return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="bridge-title"><div class="dialog-title"><span class="dialog-icon">${icon("radio-tower")}</span><div><span class="eyebrow">Generation ${state.generation}</span><h2 id="bridge-title">Bridge activity</h2></div><button class="dialog-close" data-action="close-modal" aria-label="Close">${icon("x")}</button></div><p>Only validated, generation-scoped traffic appears here. Streams stay open until their Run completes.</p><div class="dialog-list"><div><span>model.stream</span><b>2 streams · 142 ms median</b></div><div><span>session.records.append</span><b>86 Calls · 0 rejected</b></div><div><span>tool.activity</span><b>54 Calls · 99.9% accepted</b></div><div><span>schema mismatches</span><b>0</b></div></div><div class="dialog-actions"><button data-action="close-modal">Close</button></div></section></div>`;
  if (state.modal === "reloading") return `<div class="modal-shade"><section class="dialog reload-progress" role="dialog" aria-modal="true"><span class="dialog-icon amber">${icon("refresh-cw")}</span><span class="eyebrow">Runtime lifecycle</span><h2>Reloading Runtime...</h2><p>Stopping the complete generation and starting a fresh UI and Harness pair.</p><div class="progress-track"><i></i></div><small>Resolving Extension Graph · Generation ${state.generation + 1}</small></section></div>`;
  return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="reload-title"><div class="dialog-title"><span class="dialog-icon amber">${icon("refresh-cw")}</span><div><span class="eyebrow">Runtime lifecycle</span><h2 id="reload-title">Reload the Runtime?</h2></div><button class="dialog-close" data-action="close-modal" aria-label="Close">${icon("x")}</button></div><p>Drycode will stop the complete UI and Harness Runtime Generation, then start a fresh generation. Durable Sessions and the resolved Extension Graph remain available.</p><div class="reload-note">${icon("triangle-alert")}<span>Any active Run will be interrupted. Its completed Session records stay safe.</span></div><div class="dialog-actions"><button data-action="close-modal">Cancel</button><button class="primary" data-action="confirm-reload">${icon("refresh-cw")} Reload Drycode</button></div></section></div>`;
}

function render() {
  document.querySelector("#app").innerHTML = `<div class="app-frame">${topbar()}<div class="nav-layout ${state.sidebarCollapsed ? "sidebar-collapsed" : ""}">${navigationView()}${settingsPage()}</div></div>${modal()}${state.toast ? `<div class="toast" role="status">${icon("info")}<span>${escapeHtml(state.toast)}</span></div>` : ""}`;
  if (window.lucide) window.lucide.createIcons();
  bind();
}

function showToast(text) {
  window.clearTimeout(state.toastTimer);
  state.toast = text;
  render();
  state.toastTimer = window.setTimeout(() => { state.toast = ""; render(); }, 2200);
}

function chooseWorkspace() {
  try {
    if (window.showDirectoryPicker) {
      window.showDirectoryPicker().then((directory) => {
        if (!directory) return;
        if (!state.workspaces.includes(directory.name)) state.workspaces.push(directory.name);
        state.workspaceFilter = directory.name;
        render();
      }).catch((error) => { if (error?.name !== "AbortError") showToast("The folder picker could not open"); });
      return;
    }
    showToast("Folder selection is available in the desktop host");
  } catch { showToast("The folder picker could not open"); }
}

function confirmReload() {
  state.modal = "reloading";
  render();
  window.setTimeout(() => {
    state.generation += 1;
    state.modal = null;
    render();
    showToast(`Runtime Generation ${state.generation} is running`);
  }, 1450);
}

function bind() {
  document.querySelectorAll("[data-action]").forEach((element) => element.addEventListener("click", () => {
    const action = element.dataset.action;
    if (action === "collapse-sidebar") { state.sidebarCollapsed = !state.sidebarCollapsed; return render(); }
    if (action === "settings") return render();
    if (action === "choose-folder") return chooseWorkspace();
    if (action === "reload") { state.modal = "reload"; return render(); }
    if (action === "close-modal") { state.modal = null; return render(); }
    if (action === "confirm-reload") return confirmReload();
    if (action === "inspect-graph") { state.modal = "graph"; return render(); }
    if (action === "bridge-log") { state.modal = "bridge"; return render(); }
    if (action === "toggle-graph") { state.expandedGraph = !state.expandedGraph; return render(); }
    if (action === "clear-cache") return showToast("Graph cache cleared; next generation will resolve fresh");
    if (action === "open-home") return showToast("Opening ~/.drycode in the desktop host");
    if (action === "search") return showToast("Session search would open here");
    if (action === "new-session") return showToast("New Session would open in the chat shell");
    if (action === "rail-workspaces") return showToast("Workspace navigation is available in the expanded sidebar");
    if (action === "rail-sessions") return showToast("Session navigation is available in the expanded sidebar");
    if (action === "session") return showToast(`Resume Session: ${element.dataset.session}`);
  }));
  document.querySelectorAll("[data-workspace-filter]").forEach((element) => element.addEventListener("click", () => {
    state.workspaceFilter = element.dataset.workspaceFilter;
    render();
  }));
  document.querySelectorAll(".workspace-tabs").forEach((tabs) => {
    tabs.scrollLeft = state.workspaceScroll;
    tabs.addEventListener("scroll", () => { state.workspaceScroll = tabs.scrollLeft; });
  });
  document.querySelectorAll(".modal-shade[data-dismiss]").forEach((shade) => shade.addEventListener("click", (event) => {
    if (event.target === shade) { state.modal = null; render(); }
  }));
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.modal) { state.modal = null; render(); }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); showToast("Session search would open here"); }
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "o") { event.preventDefault(); showToast("New Session would open in the chat shell"); }
});

render();
