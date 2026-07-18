const state = {
  sidebarCollapsed: false,
  section: "overview",
  query: "",
  drawer: null,
  modal: null,
  toast: "",
  toastTimer: null,
  diagnosticsRunning: false,
  generation: 24,
  sessions: [
    { id: "shape", workspace: "drycode", title: "Shape the starter chat", summary: "Reading Workspace context", time: "Now", running: true },
    { id: "harness", workspace: "drycode", title: "Extract the Harness", summary: "Compare runtime boundaries", time: "2h", running: false },
    { id: "install", workspace: "agent-lab", title: "Plan the Windows install", summary: "Stopped after package formats", time: "Fri", running: false },
    { id: "recovery", workspace: "agent-lab", title: "Recovery surface notes", summary: "Reload lifecycle notes", time: "Mon", running: false },
  ],
  extensions: [
    { id: "shell", name: "chat-shell", kind: "Shell Extension", owner: "Starter Extension Set", version: "0.8.2", tone: "blue", scope: "UI Runtime", state: "Shell provider", description: "Supplies the effective base Shell and composes the Session, Workspace, and Model contributions around it.", deps: "session-ui · model-slot", config: ["Context preview", "Tool activity", "Session title"] },
    { id: "anthropic", name: "anthropic-provider", kind: "Model Provider", owner: "Starter Extension Set", version: "0.5.1", tone: "violet", scope: "Harness Runtime", state: "3 models", description: "Owns model discovery, credential resolution, requests, and normalized response streaming for Anthropic.", deps: "model-contract", config: ["Credential reference", "Request region", "Default model"] },
    { id: "trace", name: "run-diagnostics", kind: "Diagnostics", owner: "Local Extension", version: "0.3.0", tone: "amber", scope: "UI + Harness", state: "Bridge decorator", description: "Adds generation health checks and structured Run observations without changing the authoritative Session record.", deps: "bridge-contract", config: ["Event retention", "Trace detail", "Export format"] },
    { id: "workspace", name: "workspace-context", kind: "Harness contribution", owner: "Starter Extension Set", version: "0.4.4", tone: "slate", scope: "Harness Runtime", state: "Context tools", description: "Contributes headless Workspace context Tools to Sessions. It does not render an editor surface.", deps: "tool-contract", config: ["Context roots", "Ignore patterns", "Scan budget"] },
  ],
  providers: [
    { id: "anthropic", name: "Anthropic", mark: "A", tone: "violet", status: "Ready", detail: "3 models discovered", credential: "Windows Credential Manager · drycode/anthropic", latency: "228 ms" },
    { id: "openai", name: "OpenAI", mark: "◎", tone: "blue", status: "Ready", detail: "2 models discovered", credential: "Environment · OPENAI_API_KEY", latency: "301 ms" },
    { id: "google", name: "Google", mark: "G", tone: "amber", status: "Needs attention", detail: "Credential reference missing", credential: "Not configured", latency: "—" },
  ],
  home: { path: "C:\\Users\\Avery\\.drycode", durable: "18.4 MB", cache: "642 MB", diagnostics: "2.1 MB", temp: "0 B" },
};

const icon = (name, label = "") => `<i data-lucide="${name}"${label ? ` aria-label="${label}"` : ""}></i>`;
const esc = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const status = (text, tone = "blue") => `<span class="status-pill ${tone}"><i></i>${esc(text)}</span>`;
const currentSession = () => state.sessions[0];

function topbar() {
  return `<header class="topbar"><button class="topbar-collapse" data-action="collapse" aria-label="${state.sidebarCollapsed ? "Expand" : "Collapse"} sidebar">${icon(state.sidebarCollapsed ? "panel-left-open" : "panel-left-close")}</button><span class="window-drag"></span><div class="window-controls"><button data-action="window" aria-label="Minimize">${icon("minus")}</button><button data-action="window" aria-label="Maximize">${icon("square")}</button><button data-action="window" aria-label="Close">${icon("x")}</button></div></header>`;
}

function sessionSidebar() {
  if (state.sidebarCollapsed) return `<div class="rail-navigation"><button class="rail-button selected" data-action="shell-sessions" title="Sessions" aria-label="Sessions">${icon("messages-square")}<small>1</small></button><button class="rail-button" data-action="shell-workspaces" title="Workspaces" aria-label="Workspaces">${icon("folders")}</button></div>`;
  const active = state.sessions.filter((session) => session.running);
  const settled = state.sessions.filter((session) => !session.running);
  return `<div class="workspace-tabs"><button class="all-workspaces selected" data-action="shell-workspaces">ALL</button><button data-action="shell-workspaces"><span>drycode</span></button><button data-action="shell-workspaces"><span>agent-lab</span></button><button class="add-workspace" data-action="shell-workspaces" aria-label="Add workspace">${icon("plus")}</button></div><div class="sidebar-sessions"><div class="featured-sessions">${active.map((session) => `<button class="featured-session selected" data-session="${session.id}"><span class="featured-meta"><span class="session-source">${icon("message-square-code")}<b>${esc(session.workspace)}</b></span><time>${session.time}</time></span><strong>${esc(session.title)}</strong><span class="featured-status"><b class="running">Running</b><span>${esc(session.summary)}</span>${icon("loader-circle")}</span></button>`).join("")}</div><div class="settled-heading"><span>Settled</span><i></i></div><div class="settled-sessions">${settled.map((session) => `<button class="settled-session" data-session="${session.id}">${icon("message-square")}<span>${esc(session.title)}</span><time>${session.time}</time></button>`).join("")}</div></div>`;
}

function navigation() {
  return `<nav class="navigation-view ${state.sidebarCollapsed ? "collapsed" : ""}" aria-label="Drycode navigation"><header class="sidebar-brand"><span class="sidebar-logo" title="Drycode">${icon("panels-top-left")}</span><strong>Drycode</strong><span class="dev-badge">Dev</span></header><div class="sidebar-actions"><button data-action="search-shell">${icon("search")}<span>Search</span><kbd>Ctrl K</kbd></button><button data-action="new-session">${icon("plus")}<span>New Session</span><kbd>Ctrl Shift O</kbd></button></div>${sessionSidebar()}<footer class="sidebar-footer"><button class="selected" data-section="overview" aria-current="page">${icon("settings")}<span>Settings</span></button><button class="sidebar-icon" data-action="reload" title="Reload Runtime" aria-label="Reload Runtime">${icon("refresh-cw")}</button></footer></nav>`;
}

const navItems = [
  ["overview", "At a glance", "pulse", "The operating picture"],
  ["runtime", "Runtime lifecycle", "orbit", "One supervised generation"],
  ["graph", "Graph & contributions", "network", "What is effective"],
  ["models", "Model access", "radio-tower", "Provider-owned setup"],
  ["home", "Local data", "hard-drive", "Drycode Home"],
  ["diagnostics", "Diagnostics", "activity", "Signals and events"],
];

function settingsIndex() {
  return `<aside class="settings-index"><div class="index-heading"><span class="eyebrow">Configuration</span><h2>Settings</h2><p>Understand what is running, who owns it, and where it lives.</p></div><label class="settings-search">${icon("search")}<input data-search type="search" value="${esc(state.query)}" placeholder="Filter settings" aria-label="Filter settings"><kbd>⌘K</kbd></label><div class="index-label">Surface map</div><nav class="settings-nav">${navItems.map(([id, title, glyph, detail]) => `<button class="${state.section === id ? "selected" : ""}" data-section="${id}">${icon(glyph)}<span><b>${title}</b><small>${detail}</small></span>${id === "diagnostics" ? `<em>${state.diagnosticsRunning ? "…" : "2"}</em>` : ""}</button>`).join("")}</nav><div class="index-foot">${icon("shield-check")}<span><b>Local-first surface</b><small>No settings leave this device.</small></span></div></aside>`;
}

function header(kicker, title, description) {
  return `<header class="page-header"><div><div class="breadcrumb">Drycode <span>/</span> Settings <span>/</span> <b>${esc(kicker)}</b></div><h1>${esc(title)}</h1><p>${esc(description)}</p></div><div class="header-actions"><span class="saved-state">${icon("check")} Saved locally</span><button class="icon-button" data-action="search" title="Find a setting" aria-label="Find a setting">${icon("search")}</button></div></header>`;
}

function overview() {
  return `<div class="settings-content">${header("At a glance", "Your Drycode surface", "A compact read of the graph, runtimes, and local data behind this window.")}<div class="status-strip"><span class="status-orb">${icon("radio")}</span><span><b>Generation ${state.generation}</b> is running normally <small>· started 14 min ago</small></span><span class="right">${status("Healthy")}<button class="text-button" data-section="runtime">View lifecycle ${icon("arrow-up-right")}</button></span></div><section class="surface runtime-card"><div class="runtime-top"><div><span class="eyebrow">Runtime Generation</span><h2>One resolved graph, three live surfaces <span>GEN-${state.generation}</span></h2><p>UI Runtime, Harness Runtime, and Bridge start and stop together.</p></div><button class="secondary-button" data-action="reload">${icon("refresh-cw")} Reload</button></div><div class="lifecycle"><div class="lifecycle-node"><span class="node-icon">${icon("panels-top-left")}</span><span><b>UI Runtime</b><small>chat-shell · mounted</small></span></div><i class="lifecycle-line"></i><div class="lifecycle-node"><span class="node-icon violet">${icon("cpu")}</span><span><b>Harness Runtime</b><small>4 contributions · ready</small></span></div><i class="lifecycle-line"></i><div class="lifecycle-node"><span class="node-icon amber">${icon("radio")}</span><span><b>UI-Harness Bridge</b><small>12 endpoints · frozen</small></span></div></div><div class="runtime-foot"><span>${icon("lock-keyhole")} Service Registries frozen for this generation</span><button class="text-button" data-section="graph">Inspect graph ${icon("arrow-up-right")}</button></div></section><div class="overview-grid"><section class="surface readout-card"><span class="eyebrow">System readout</span><h2>Nothing is waiting on Core</h2><p>Provider setup and extension configuration stay with their owners.</p><div class="signal-list"><div class="signal">${icon("network")}<span><b>Extension Graph</b><small>4 manifests · deterministic</small></span><strong>Resolved</strong></div><div class="signal">${icon("key-round")}<span><b>Model access</b><small>2 ready · 1 needs attention</small></span><strong>2 / 3</strong></div><div class="signal">${icon("database")}<span><b>Drycode Home</b><small>Durable records available</small></span><strong>Synced</strong></div></div></section><section class="surface focus-card"><span class="focus-mark">${icon("sparkles")}</span><span class="eyebrow" style="margin-top:12px">Recommended next step</span><h2>Review the effective graph</h2><p>See which extension owns each contribution before changing a setting.</p><button class="secondary-button" data-section="graph">Open contributions ${icon("arrow-right")}</button></section></div><section class="contribution-section"><div class="section-head"><div><span class="eyebrow">Effective now</span><h2>Contributions in this generation</h2><p>There is no partial loading state: this is the complete accepted graph.</p></div><button class="text-button" data-section="graph">See all ${icon("arrow-up-right")}</button></div><div class="contribution-grid">${contribution("shell", "panels-top-left", "chat-shell", "Shell Extension · owns base UI", "UI Runtime", "blue")}${contribution("anthropic", "sparkles", "anthropic-provider", "Model Provider · 3 models", "Harness", "violet")}${contribution("trace", "activity", "run-diagnostics", "Diagnostics · decorates Bridge", "Both", "amber")}</div></section></div>`;
}

function contribution(id, glyph, name, detail, scope, tone) {
  return `<button class="contribution" data-drawer="${id}"><span class="contribution-mark ${tone}">${icon(glyph)}</span><span><b>${name}</b><small>${detail}</small></span><em>${scope} ${icon("arrow-up-right")}</em></button>`;
}

function runtimePage() {
  return `<div class="settings-content">${header("Runtime lifecycle", "Runtime lifecycle", "Reload is a full replacement of one Runtime Generation while the desktop window remains open.")}<div class="graph-banner"><span class="graph-glyph">${icon("orbit")}</span><span><b>Generation ${state.generation} · running</b><small>Accepted graph loaded at 10:42 AM. No partial runtime restarts.</small></span><button class="secondary-button" data-action="reload">${icon("refresh-cw")} Reload generation</button></div><section class="surface page-section" style="padding:17px"><div class="section-head"><div><span class="eyebrow">Lifecycle contract</span><h2>Start and stop as one unit</h2><p>Core supervises the resolved graph as a paired UI and Harness runtime.</p></div>${status("All surfaces ready")}</div><div class="lifecycle"><div class="lifecycle-node"><span class="node-icon">${icon("layers-3")}</span><span><b>Extension Graph</b><small>Accepted · 4 nodes</small></span></div><i class="lifecycle-line"></i><div class="lifecycle-node"><span class="node-icon violet">${icon("panels-top-left")}</span><span><b>UI Runtime</b><small>chat-shell mounted</small></span></div><i class="lifecycle-line"></i><div class="lifecycle-node"><span class="node-icon amber">${icon("radio")}</span><span><b>Bridge</b><small>12 endpoints frozen</small></span></div></div><div class="callout">${icon("triangle-alert")}<span><b>Reload interrupts active Runs.</b><small>Durable Session records and Drycode Home data remain available throughout the replacement.</small></span></div></section><section class="surface page-section" style="padding:17px"><div class="section-head"><div><span class="eyebrow">Generation detail</span><h2>Current signals</h2><p>Independent health signals from this generation.</p></div><button class="text-button" data-section="diagnostics">View diagnostics ${icon("arrow-up-right")}</button></div><div class="signal-list" style="margin-top:12px"><div class="signal">${icon("panel-top")}<span><b>UI Runtime</b><small>chat-shell · 46 MB</small></span><strong>Ready</strong></div><div class="signal">${icon("cpu")}<span><b>Harness Runtime</b><small>workspace-context · 82 MB</small></span><strong>Ready</strong></div><div class="signal">${icon("radio")}<span><b>UI-Harness Bridge</b><small>0 dropped Streams · 12 endpoints</small></span><strong>Connected</strong></div></div></section></div>`;
}

function graphPage() {
  const filtered = state.extensions.filter((item) => !state.query || `${item.name} ${item.kind} ${item.owner} ${item.scope}`.toLowerCase().includes(state.query.toLowerCase()));
  return `<div class="settings-content">${header("Graph & contributions", "Graph & contributions", "Inspect the complete deterministic graph and the extension-owned settings composing this generation.")}<div class="graph-banner"><span class="graph-glyph">${icon("network")}</span><span><b>Resolved and deterministic</b><small>GRAPH-${state.generation} · ${state.extensions.length} nodes · accepted as a whole</small></span><button class="secondary-button" data-action="discover">${icon("folder-search")} Discover local extension</button></div><section class="surface graph-view page-section"><div class="section-head"><div><span class="eyebrow">Composition map</span><h2>Drycode Core → effective contributions</h2><p>Click any node to see its manifest and owned configuration.</p></div><span class="status-pill neutral">FROZEN REGISTRY</span></div><div class="graph-chain"><span class="graph-root">${icon("box")}<b>Drycode Core</b></span><i></i><button class="graph-node blue" data-drawer="shell">${icon("panels-top-left")}<b>chat-shell</b></button><i></i><button class="graph-node violet" data-drawer="anthropic">${icon("sparkles")}<b>anthropic-provider</b></button><i></i><button class="graph-node amber" data-drawer="trace">${icon("activity")}<b>run-diagnostics</b></button><i></i><span class="graph-root">${icon("scan-search")}<b>+1 contribution</b></span></div><div class="graph-note">${icon("info")} The graph is either accepted in full or rejected; settings never imply partial loading.</div></section><section class="page-section"><div class="section-head"><div><span class="eyebrow">Discovered locally</span><h2>Contribution ownership</h2><p>${filtered.length} of ${state.extensions.length} effective extensions · configuration is validated by its owner.</p></div></div><div class="extension-list">${filtered.length ? filtered.map(extensionRow).join("") : `<div class="filter-empty">${icon("search-x")}<br><br>No contributions match “${esc(state.query)}”.</div>`}</div></section><div class="callout page-section">${icon("sliders-horizontal")}<span><b>Configuration stays with its owner.</b><small>Drycode Core provides the surface and lifecycle. Each extension defines its own values, validation, and data contract.</small></span></div></div>`;
}

function extensionRow(item) {
  const glyph = item.id === "shell" ? "panels-top-left" : item.id === "anthropic" ? "sparkles" : item.id === "trace" ? "activity" : "scan-search";
  return `<button class="extension-row" data-drawer="${item.id}"><span class="extension-mark ${item.tone}">${icon(glyph)}</span><span class="extension-main"><b>${esc(item.name)}</b><small>${esc(item.kind)} · ${esc(item.owner)}</small></span><span class="extension-scope"><b>${esc(item.scope)}</b><small>${esc(item.state)}</small></span><span class="extension-version">v${esc(item.version)}</span>${icon("chevron-right")}</button>`;
}

function modelsPage() {
  return `<div class="settings-content">${header("Model access", "Model access", "Provider extensions own discovery and credential references. Drycode only presents their effective slots to Sessions.")}<div class="status-strip"><span class="status-orb">${icon("key-round")}</span><span><b>Provider registry</b> · 2 ready, 1 needs attention <small>· credentials remain outside Drycode settings</small></span><span class="right"><button class="text-button" data-section="diagnostics">Run health check ${icon("arrow-up-right")}</button></span></div><section class="page-section"><div class="section-head"><div><span class="eyebrow">Installed providers</span><h2>Connection references</h2><p>Manage the setup owned by each Model Provider extension.</p></div><button class="secondary-button" data-action="add-provider">${icon("plus")} Add provider extension</button></div><div class="provider-list">${state.providers.map(providerRow).join("")}</div></section><section class="surface page-section" style="padding:17px"><div class="section-head"><div><span class="eyebrow">Session preferences</span><h2>Defaults for new Sessions</h2><p>These are starting preferences, not a global model lock. Each Session can choose its own provider.</p></div><button class="text-button" data-action="defaults">Edit preferences ${icon("arrow-up-right")}</button></div><div class="default-grid"><div class="default-tile"><span>Provider preference</span><b>Remember last used</b><small>Chosen per Session in the Shell.</small></div><div class="default-tile"><span>Discovery refresh</span><b>On Runtime Reload</b><small>Last discovery completed 2 min ago.</small></div><div class="default-tile"><span>Fallback behavior</span><b>Ask before switching</b><small>Runs never change provider silently.</small></div></div></section><div class="callout">${icon("key-round")}<span><b>Provider-owned setup stays provider-owned.</b><small>Drycode stores a local reference, never a provider secret. Select a provider to inspect its connection contract.</small></span></div></div>`;
}

function providerRow(provider) {
  const attention = provider.status !== "Ready";
  return `<article class="provider-row"><span class="provider-mark ${provider.tone}">${esc(provider.mark)}</span><span class="provider-main"><b>${esc(provider.name)}</b><small>${esc(provider.detail)}</small></span><span class="provider-health ${attention ? "attention" : ""}"><i></i>${esc(provider.status)}</span><span class="provider-latency">${esc(provider.latency)}</span><button class="secondary-button compact" data-drawer="${provider.id}">Manage ${icon("arrow-up-right")}</button></article>`;
}

function homePage() {
  return `<div class="settings-content">${header("Local data", "Local data", "Drycode Home is the per-user root for extensions and Drycode's durable, cached, diagnostic, and temporary data.")}<div class="storage-path">${icon("folder-open")}<span><b>${esc(state.home.path)}</b><small>Workspace files stay in the folder you chose. This is per-user Drycode data.</small></span><button class="secondary-button" data-action="open-home">${icon("external-link")} Open folder</button></div><section class="page-section"><div class="section-head"><div><span class="eyebrow">Storage map</span><h2>What lives in Drycode Home</h2><p>See ownership before removing or exporting anything.</p></div></div><div class="storage-grid"><div class="storage-tile">${icon("archive")}<span><b>Durable records</b><small>Sessions, preferences, installed graph</small></span><strong>${state.home.durable}</strong><button data-action="inspect-data">Inspect records ${icon("arrow-up-right")}</button></div><div class="storage-tile">${icon("database-zap")}<span><b>Extension cache</b><small>Discovery and package cache</small></span><strong>${state.home.cache}</strong><button data-action="clear-cache">Clear cache ${icon("trash-2")}</button></div><div class="storage-tile">${icon("clipboard-check")}<span><b>Diagnostics</b><small>Reports and generation events</small></span><strong>${state.home.diagnostics}</strong><button data-action="export">Export report ${icon("download")}</button></div><div class="storage-tile">${icon("timer-reset")}<span><b>Temporary data</b><small>Safe-to-remove interrupted work</small></span><strong>${state.home.temp}</strong><button data-action="clear-temp">Clear temporary ${icon("trash-2")}</button></div></div></section><div class="callout page-section">${icon("shield-check")}<span><b>Drycode Home is not a Workspace.</b><small>Extensions may own subdirectories here, but Workspace source files never move into this folder.</small></span></div></div>`;
}

function diagnosticsPage() {
  return `<div class="settings-content">${header("Diagnostics", "Diagnostics", "Core-owned signals for the Extension Graph, Runtime Generation, Bridge, and local data.")}<div class="diagnostics-hero"><div class="score"><b>${state.diagnosticsRunning ? "…" : "98"}</b><small>health</small></div><span><span class="eyebrow">${state.diagnosticsRunning ? "Running checks" : "Last checked 2 min ago"}</span><h2>${state.diagnosticsRunning ? "Collecting a fresh readout" : "Generation looks healthy"}</h2><p>${state.diagnosticsRunning ? "Checking graph, Bridge, providers, and Drycode Home." : "Two informational events are available; nothing blocks this generation."}</p></span><button class="secondary-button" data-action="run-checks">${icon(state.diagnosticsRunning ? "loader-circle" : "refresh-cw")} ${state.diagnosticsRunning ? "Checking…" : "Run checks"}</button></div><section class="surface page-section" style="padding:17px"><div class="section-head"><div><span class="eyebrow">Checks</span><h2>Signal overview</h2><p>A diagnostic read does not change the graph or Session record.</p></div><button class="text-button" data-action="export">${icon("download")} Export report</button></div><div class="check-list"><div class="check-row">${icon("check-circle-2")}<span><b>Extension Graph</b><small>4 manifests · dependencies resolved in 182 ms</small></span>${status("Passed")}</div><div class="check-row">${icon("check-circle-2")}<span><b>UI-Harness Bridge</b><small>12 endpoints · 0 rejected Calls · 0 dropped Streams</small></span>${status("Passed")}</div><div class="check-row">${icon("check-circle-2")}<span><b>Drycode Home</b><small>Durable append and diagnostic write verified</small></span>${status("Passed")}</div><div class="check-row warning">${icon("circle-alert")}<span><b>Google provider</b><small>Credential reference missing; unrelated providers remain available</small></span>${status("Review", "amber")}</div></div></section><section class="surface page-section" style="padding:17px"><div class="section-head"><div><span class="eyebrow">Recent events</span><h2>Diagnostic timeline</h2><p>Structured events are retained in Drycode Home / diagnostics.</p></div></div><div class="timeline"><div class="event"><time>10:56:12</time><span class="event-mark">${icon("check")}</span><span><b>Runtime Generation ${state.generation} healthy</b><small>All required Service Slots have an effective provider.</small></span></div><div class="event"><time>10:43:08</time><span class="event-mark amber">${icon("info")}</span><span><b>Provider discovery refreshed</b><small>anthropic-provider discovered 3 models.</small></span></div><div class="event"><time>10:42:51</time><span class="event-mark amber">${icon("info")}</span><span><b>Google credential reference unavailable</b><small>Set by the google-provider extension when needed.</small></span></div></div></section></div>`;
}

function mainContent() {
  if (state.section === "runtime") return runtimePage();
  if (state.section === "graph") return graphPage();
  if (state.section === "models") return modelsPage();
  if (state.section === "home") return homePage();
  if (state.section === "diagnostics") return diagnosticsPage();
  return overview();
}

function extensionDrawer(item) {
  return `<div class="shade" data-dismiss="drawer"><aside class="drawer"><header class="drawer-head"><div><span class="eyebrow">${esc(item.kind)}</span><h2>${esc(item.name)}</h2><p>${esc(item.owner)} · v${esc(item.version)}</p></div><button class="icon-button" data-action="close-drawer" aria-label="Close">${icon("x")}</button></header><div class="drawer-body"><div class="drawer-status">${status("In active graph")}<span>${esc(item.scope)}</span></div><p class="drawer-copy">${esc(item.description)}</p><div class="drawer-block"><span class="eyebrow">Extension manifest</span><dl class="manifest"><div><dt>Entry points</dt><dd>${item.scope === "UI + Harness" ? "ui · harness · bridge" : item.scope.toLowerCase().replace(" runtime", "")}</dd></div><div><dt>Dependencies</dt><dd>${esc(item.deps)}</dd></div><div><dt>Effective state</dt><dd>${esc(item.state)}</dd></div></dl></div><div class="drawer-block"><span class="eyebrow">Owned configuration</span><h3>Values contributed by ${esc(item.name)}</h3>${item.config.map((value, index) => `<label class="owned-row"><span><b>${esc(value)}</b><small>${index === 0 ? "Validated by this extension" : "Stored locally"}</small></span><select aria-label="${esc(value)}"><option>${index === 0 ? (item.id === "anthropic" ? "Credential Manager" : item.id === "shell" ? "Balanced" : "30 days") : index === 1 ? "Standard" : "Default"}</option><option>Default</option><option>Custom…</option></select></label>`).join("")}</div></div><footer class="drawer-foot"><button class="plain-button" data-action="close-drawer">Cancel</button><button class="primary-button" data-action="save-config">Save locally</button></footer></aside></div>`;
}

function providerDrawer(provider) {
  return `<div class="shade" data-dismiss="drawer"><aside class="drawer"><header class="drawer-head"><div><span class="eyebrow">Model Provider</span><h2>${esc(provider.name)}</h2><p>${esc(provider.name.toLowerCase())}-provider · provider-owned setup</p></div><button class="icon-button" data-action="close-drawer" aria-label="Close">${icon("x")}</button></header><div class="drawer-body"><div class="drawer-status"><span class="provider-mark ${provider.tone}">${esc(provider.mark)}</span>${provider.status === "Ready" ? status("Ready") : status("Needs attention", "amber")}<span>${esc(provider.detail)}</span></div><p class="drawer-copy">This provider extension owns credentials, discovery, requests, and response normalization. Drycode records only a local reference to the setup.</p><div class="drawer-block"><span class="eyebrow">Connection details</span><dl class="manifest"><div><dt>Credential source</dt><dd>${esc(provider.credential)}</dd></div><div><dt>Last request</dt><dd>${esc(provider.latency)}</dd></div><div><dt>Models</dt><dd>${provider.id === "anthropic" ? "3 discovered" : provider.id === "openai" ? "2 discovered" : "Not discovered"}</dd></div></dl></div><div class="drawer-block"><span class="eyebrow">Provider-owned settings</span><label class="field">Credential reference<input value="${provider.credential === "Not configured" ? "" : esc(provider.credential)}" placeholder="Select a local reference"></label><label class="field">Request region<select><option>Auto-select</option><option>North America</option><option>Europe</option></select></label></div></div><footer class="drawer-foot"><button class="plain-button" data-action="close-drawer">Cancel</button><button class="primary-button" data-action="save-provider">Save reference</button></footer></aside></div>`;
}

function drawer() {
  if (!state.drawer) return "";
  const extension = state.extensions.find((item) => item.id === state.drawer);
  if (extension) return extensionDrawer(extension);
  const provider = state.providers.find((item) => item.id === state.drawer);
  return provider ? providerDrawer(provider) : "";
}

function modal() {
  if (!state.modal) return "";
  if (state.modal === "reload") return `<div class="dialog-wrap" data-dismiss="modal"><section class="dialog" role="dialog" aria-modal="true"><div class="dialog-title"><span class="dialog-icon amber">${icon("refresh-cw")}</span><div><span class="eyebrow">Runtime lifecycle</span><h2>Reload Generation ${state.generation}?</h2></div></div><p>Drycode will stop the complete UI and Harness Runtime Generation, then start a fresh generation from the accepted graph.</p><div class="dialog-note">${icon("triangle-alert")}<span>Active Runs will be interrupted. Durable Sessions and Drycode Home data remain safe.</span></div><div class="dialog-actions"><button class="plain-button" data-action="close-modal">Cancel</button><button class="danger-button" data-action="confirm-reload">${icon("refresh-cw")} Reload generation</button></div></section></div>`;
  if (state.modal === "reloading") return `<div class="dialog-wrap"><section class="dialog" role="dialog" aria-modal="true" style="text-align:center"><span class="dialog-icon amber" style="margin:auto">${icon("refresh-cw")}</span><span class="eyebrow" style="margin-top:12px">Runtime lifecycle</span><h2 style="margin:5px 0 0">Starting Generation ${state.generation + 1}…</h2><p>Stopping the old pair and freezing a fresh Service Registry.</p><div class="progress"><i></i></div><small>UI Runtime · Harness Runtime · Bridge</small></section></div>`;
  if (state.modal === "discover") return `<div class="dialog-wrap" data-dismiss="modal"><section class="dialog" role="dialog" aria-modal="true"><div class="dialog-title"><span class="dialog-icon">${icon("folder-search")}</span><div><span class="eyebrow">Extension Graph</span><h2>Discover a local extension</h2></div></div><p>Choose a folder containing a Drycode Extension Manifest. Core validates the complete graph before the next Runtime Generation.</p><label class="field">Extension folder<input placeholder="C:\\Users\\Avery\\.drycode\\extensions\\…"></label><div class="dialog-actions"><button class="plain-button" data-action="close-modal">Cancel</button><button class="primary-button" data-action="discover-finish">Choose folder</button></div></section></div>`;
  return `<div class="dialog-wrap" data-dismiss="modal"><section class="dialog" role="dialog" aria-modal="true"><div class="dialog-title"><span class="dialog-icon amber">${icon("trash-2")}</span><div><span class="eyebrow">Drycode Home</span><h2>Clear ${state.modal === "cache" ? "extension cache" : "temporary data"}?</h2></div></div><p>${state.modal === "cache" ? "Provider discovery and package cache will be rebuilt on the next discovery pass." : "Temporary data can be removed without touching durable Session records."}</p><div class="dialog-actions"><button class="plain-button" data-action="close-modal">Cancel</button><button class="danger-button" data-action="confirm-clear">${icon("trash-2")} Clear data</button></div></section></div>`;
}

function render() {
  document.querySelector("#app").innerHTML = `<div class="app-frame">${topbar()}<div class="nav-layout ${state.sidebarCollapsed ? "sidebar-collapsed" : ""}">${navigation()}<main class="settings-shell">${settingsIndex()}<section class="settings-main">${mainContent()}</section></main></div></div>${drawer()}${modal()}${state.toast ? `<div class="toast" role="status">${icon("info")}<span>${esc(state.toast)}</span></div>` : ""}`;
  if (window.lucide) window.lucide.createIcons();
  bind();
}

function toast(message) {
  clearTimeout(state.toastTimer);
  state.toast = message;
  render();
  state.toastTimer = setTimeout(() => { state.toast = ""; render(); }, 2200);
}
function selectSection(section) { state.section = section; state.drawer = null; document.querySelector(".settings-main")?.scrollTo(0, 0); render(); }
function reload() {
  state.modal = "reloading";
  render();
  setTimeout(() => {
    state.generation += 1;
    state.modal = null;
    state.sessions.forEach((session) => { if (session.running) { session.running = false; session.summary = "Run stopped by Reload"; } });
    toast(`Runtime Generation ${state.generation} is ready`);
  }, 1500);
}
function runChecks() {
  if (state.diagnosticsRunning) return;
  state.diagnosticsRunning = true;
  render();
  setTimeout(() => { state.diagnosticsRunning = false; toast("Diagnostics refreshed · 0 blocking issues"); }, 1200);
}
async function copyHome() {
  try { await navigator.clipboard?.writeText(state.home.path); toast("Drycode Home path copied"); }
  catch { toast("Drycode Home path is ready to copy"); }
}

function bind() {
  document.querySelectorAll("[data-section]").forEach((el) => el.addEventListener("click", () => selectSection(el.dataset.section)));
  document.querySelectorAll("[data-drawer]").forEach((el) => el.addEventListener("click", () => { state.drawer = el.dataset.drawer; render(); }));
  document.querySelectorAll("[data-action]").forEach((el) => el.addEventListener("click", () => {
    const action = el.dataset.action;
    if (action === "collapse") { state.sidebarCollapsed = !state.sidebarCollapsed; state.drawer = null; return render(); }
    if (action === "reload") { state.modal = "reload"; return render(); }
    if (action === "close-modal") { state.modal = null; return render(); }
    if (action === "confirm-reload") return reload();
    if (action === "close-drawer") { state.drawer = null; return render(); }
    if (action === "save-config" || action === "save-provider") { state.drawer = null; return toast("Configuration saved locally"); }
    if (action === "discover") { state.modal = "discover"; return render(); }
    if (action === "discover-finish") { state.modal = null; return toast("Manifest scan queued for next generation"); }
    if (action === "run-checks") return runChecks();
    if (action === "export") return toast("Diagnostic report copied to clipboard");
    if (action === "open-home") return copyHome();
    if (action === "inspect-data") return toast("Durable records are append-only and protected");
    if (action === "clear-cache") { state.modal = "cache"; return render(); }
    if (action === "clear-temp") { state.modal = "temp"; return render(); }
    if (action === "confirm-clear") { state.modal = null; return toast("Selected local data cleared safely"); }
    if (action === "add-provider") return toast("Provider extension discovery is available from Graph & contributions");
    if (action === "defaults") return toast("Session preferences are ready to edit in the Shell");
    if (action === "search" || action === "search-shell") { document.querySelector("[data-search]")?.focus(); return; }
    if (action === "window") return toast("Window controls belong to the desktop host");
    if (action === "new-session") return toast("New Session opens in the chat Shell");
    if (action === "shell-sessions" || action === "shell-workspaces") return toast("Navigation remains available from the chat Shell");
  }));
  document.querySelectorAll("[data-session]").forEach((el) => el.addEventListener("click", () => toast("Settings stays open while this Session remains active")));
  const search = document.querySelector("[data-search]");
  search?.addEventListener("input", () => {
    state.query = search.value;
    if (state.section === "graph") {
      document.querySelectorAll(".extension-row").forEach((row) => { row.hidden = !row.innerText.toLowerCase().includes(state.query.toLowerCase()); });
    }
  });
  document.querySelectorAll("[data-dismiss]").forEach((el) => el.addEventListener("click", (event) => { if (event.target === el) { state.drawer = null; state.modal = null; render(); } }));
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && (state.drawer || state.modal)) { state.drawer = null; state.modal = null; render(); }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); document.querySelector("[data-search]")?.focus(); }
});

render();
