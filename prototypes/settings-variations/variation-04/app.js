const state = {
  sidebarCollapsed: false,
  section: "overview",
  query: "",
  drawer: null,
  modal: null,
  toast: "",
  toastTimer: null,
  diagnosticsRunning: false,
  generation: 18,
  extensions: [
    { id: "shell", name: "chat-shell", kind: "Shell Extension", version: "0.8.2", owner: "Drycode starter set", color: "blue", scope: "UI Runtime", status: "provides Shell", deps: "session-ui · provider-registry", description: "The base Shell provider for Drycode's chat experience. It owns the frame and composes session, workspace, and provider contributions.", config: ["Session title format", "Context preview density", "Tool activity detail"] },
    { id: "anthropic", name: "anthropic-provider", kind: "Model Provider", version: "0.5.1", owner: "Drycode starter set", color: "violet", scope: "Harness Runtime", status: "provides models", deps: "provider-contract", description: "Discovers Anthropic models, resolves the local credential reference, and normalizes streamed responses for the Harness.", config: ["Credential reference", "Request region", "Default model"] },
    { id: "trace", name: "run-diagnostics", kind: "Diagnostics", version: "0.3.0", owner: "Local extension", color: "amber", scope: "UI + Harness", status: "decorates Bridge", deps: "bridge-contract", description: "Adds generation health checks and structured Run observations without changing the authoritative Session record.", config: ["Event retention", "Trace detail", "Export format"] },
    { id: "workspace", name: "workspace-context", kind: "Harness contribution", version: "0.4.4", owner: "Drycode starter set", color: "slate", scope: "Harness Runtime", status: "provides context", deps: "tool-contract", description: "Contributes workspace context tools to Sessions. It remains headless and does not render an editor surface.", config: ["Context roots", "Ignore patterns", "Scan budget"] },
  ],
  providers: [
    { id: "provider-anthropic", name: "Anthropic", mark: "A", color: "violet", status: "Ready", detail: "3 models discovered", credential: "Windows Credential Manager · drycode/anthropic", latency: "228 ms", updated: "Just now" },
    { id: "provider-openai", name: "OpenAI", mark: "◎", color: "blue", status: "Ready", detail: "2 models discovered", credential: "Environment · OPENAI_API_KEY", latency: "301 ms", updated: "12 min ago" },
    { id: "provider-google", name: "Google", mark: "G", color: "amber", status: "Needs attention", detail: "Credential reference missing", credential: "Not configured", latency: "—", updated: "Yesterday" },
  ],
  home: { path: "C:\\Users\\Avery\\.drycode", durable: "18.4 MB", cache: "642 MB", diagnostics: "2.1 MB", temp: "0 B" },
  sessions: [
    { id: "contract", title: "Shape the starter chat", workspace: "drycode", time: "Now", running: true, summary: "Reading Workspace context" },
    { id: "harness", title: "Extract the Harness", workspace: "drycode", time: "2h", running: false, summary: "Compare runtime boundaries" },
    { id: "installer", title: "Plan the Windows install", workspace: "agent-lab", time: "Fri", running: true, summary: "Stopped after package formats" },
    { id: "recovery", title: "Recovery surface notes", workspace: "agent-lab", time: "Mon", running: false, summary: "Reload lifecycle notes" },
  ],
};

const icon = (name, label = "") => `<i data-lucide="${name}"${label ? ` aria-label="${label}"` : ""}></i>`;
const esc = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const activeSession = () => state.sessions[0];

function topbar() {
  return `<header class="topbar"><button class="topbar-collapse" data-action="collapse" aria-label="${state.sidebarCollapsed ? "Expand" : "Collapse"} sidebar">${icon(state.sidebarCollapsed ? "panel-left-open" : "panel-left-close")}</button><span class="window-drag"></span><div class="window-controls" aria-label="Window controls"><button aria-label="Minimize">${icon("minus")}</button><button aria-label="Maximize">${icon("square")}</button><button aria-label="Close">${icon("x")}</button></div></header>`;
}

function sessionSidebar() {
  const current = activeSession();
  const cards = state.sessions.filter((item) => item.running).map((session) => `<button class="featured-session ${session.id === current.id ? "selected" : ""}" data-action="session"><span class="featured-meta"><span class="session-source">${icon("message-square-code")}<b>${esc(session.workspace)}</b></span><time>${session.time}</time></span><strong>${esc(session.title)}</strong><span class="featured-status"><b class="running">Running</b><span>${esc(session.summary)}</span>${icon("loader-circle")}</span></button>`).join("");
  const settled = state.sessions.filter((item) => !item.running).map((session) => `<button class="settled-session" data-action="session"><span>${icon("message-square")}</span><span>${esc(session.title)}</span><time>${session.time}</time></button>`).join("");
  if (state.sidebarCollapsed) return `<div class="rail-navigation"><button class="rail-button selected" data-action="sessions" title="Sessions" aria-label="Sessions">${icon("messages-square")}<small>2</small></button><button class="rail-button" data-action="workspaces" title="Workspaces" aria-label="Workspaces">${icon("folders")}</button></div>`;
  return `<div class="workspace-tabs"><button class="all-workspaces selected">ALL</button><button><span>drycode</span></button><button><span>agent-lab</span></button><button class="add-workspace" aria-label="Add workspace">${icon("plus")}</button></div><div class="sidebar-sessions"><div class="featured-sessions">${cards}</div><div class="settled-heading"><span>Settled</span><i></i></div><div class="settled-sessions">${settled}</div></div>`;
}

function navigation() {
  return `<nav class="navigation-view ${state.sidebarCollapsed ? "collapsed" : ""}" aria-label="Drycode navigation"><header class="sidebar-brand"><span class="sidebar-logo">${icon("panels-top-left")}</span><strong>Drycode</strong><span class="dev-badge">Dev</span></header><div class="sidebar-actions"><button data-action="search">${icon("search")}<span>Search</span><kbd>Ctrl K</kbd></button><button data-action="new-session">${icon("plus")}<span>New Session</span><kbd>Ctrl Shift O</kbd></button></div>${sessionSidebar()}<footer class="sidebar-footer"><button class="selected" data-action="settings" aria-current="page">${icon("settings")}<span>Settings</span></button><button class="sidebar-icon" data-action="reload" title="Reload Runtime" aria-label="Reload Runtime">${icon("refresh-cw")}</button></footer></nav>`;
}

const navItems = [
  ["overview", "Overview", "layout-dashboard", "See the active generation"],
  ["runtime", "Runtime Generation", "orbit", "UI, Harness, and Bridge"],
  ["extensions", "Extensions", "puzzle", "Resolved Extension Graph"],
  ["providers", "Providers", "radio-tower", "Connection and discovery"],
  ["diagnostics", "Diagnostics", "activity", "Health and recent events"],
  ["home", "Drycode Home", "hard-drive", "Durable and temporary data"],
];

function settingsRail() {
  return `<aside class="settings-rail"><div class="settings-rail-title"><span class="eyebrow">Configuration</span><strong>Settings</strong></div><label class="settings-search">${icon("search")}<input data-search type="search" placeholder="Filter settings" value="${esc(state.query)}" aria-label="Filter settings"><kbd>⌘K</kbd></label><nav class="settings-nav">${navItems.map(([id, label, ico, desc]) => `<button class="settings-nav-item ${state.section === id ? "selected" : ""}" data-section="${id}">${icon(ico)}<span><b>${label}</b><small>${desc}</small></span>${id === "diagnostics" ? `<em>2</em>` : ""}</button>`).join("")}</nav><div class="settings-rail-foot"><span class="status-dot"></span><span><b>Generation ${state.generation}</b><small>All services resolved</small></span>${icon("chevron-right")}</div></aside>`;
}

function pageHeader(kicker, title, description) {
  return `<header class="settings-page-header"><div class="breadcrumb">Drycode Core <span>/</span> Settings <span>/</span> <b>${esc(kicker)}</b></div><div class="header-line"><div><h1>${esc(title)}</h1><p>${esc(description)}</p></div><div class="header-actions"><span class="saved-state">${icon("check")} Saved locally</span><button class="icon-button" data-action="search" title="Find a setting" aria-label="Find a setting">${icon("search")}</button></div></div></header>`;
}

function statusPill(text, tone = "blue") { return `<span class="status-pill ${tone}"><i></i>${esc(text)}</span>`; }
function sectionTitle(kicker, title, text, action = "") { return `<div class="section-title"><div><span class="eyebrow">${esc(kicker)}</span><h2>${esc(title)}</h2>${text ? `<p>${esc(text)}</p>` : ""}</div>${action}</div>`; }

function overview() {
  return `<div class="settings-content">${pageHeader("Overview", "Your Drycode surface", "A quick read of the extensions, runtimes, and local data behind this window.")}<div class="overview-grid"><article class="generation-card"><div class="card-top"><div><span class="eyebrow">Runtime Generation</span><h2>Generation ${state.generation}</h2></div>${statusPill("Healthy", "blue")}</div><p class="card-copy">The resolved Extension Graph is running as one supervised UI and Harness pair.</p><div class="runtime-map"><div class="runtime-node"><span class="node-icon blue">${icon("panels-top-left")}</span><span><b>UI Runtime</b><small>chat-shell · ready</small></span></div><span class="map-line">${icon("arrow-right")}</span><div class="runtime-node"><span class="node-icon violet">${icon("cpu")}</span><span><b>Harness Runtime</b><small>4 contributions · ready</small></span></div><span class="map-line">${icon("arrow-right")}</span><div class="runtime-node bridge-node"><span class="node-icon amber">${icon("radio")}</span><span><b>Bridge</b><small>generation-scoped</small></span></div></div><div class="card-footer"><span>${icon("clock-3")} Started 14 min ago</span><button class="secondary-button" data-action="reload">${icon("refresh-cw")} Reload generation</button></div></article><article class="health-card"><div class="card-top"><div><span class="eyebrow">System readout</span><h2>Everything is in place</h2></div>${icon("sparkles")}</div><div class="health-list"><div><span class="health-icon blue">${icon("puzzle")}</span><span><b>Extension Graph</b><small>4 extensions · deterministic</small></span><strong>Resolved</strong></div><div><span class="health-icon violet">${icon("key-round")}</span><span><b>Model Providers</b><small>2 ready · 1 needs attention</small></span><strong>2 / 3</strong></div><div><span class="health-icon amber">${icon("database")}</span><span><b>Drycode Home</b><small>Last backup · 9 minutes ago</small></span><strong>Synced</strong></div></div><button class="text-button" data-section="diagnostics">Open diagnostics ${icon("arrow-up-right")}</button></article></div><section class="overview-section">${sectionTitle("Composition", "What's contributing right now", "Core resolves the graph first. These are the effective contributions in this generation.", `<button class="secondary-button" data-section="extensions">Inspect graph ${icon("arrow-up-right")}</button>`)}<div class="contribution-grid"><div class="contribution"><span class="contribution-mark blue">${icon("panels-top-left")}</span><span><b>chat-shell</b><small>Shell Extension · owns the base UI</small></span><em>UI Runtime</em></div><div class="contribution"><span class="contribution-mark violet">${icon("sparkles")}</span><span><b>anthropic-provider</b><small>Model Provider · 3 models discovered</small></span><em>Harness</em></div><div class="contribution"><span class="contribution-mark amber">${icon("activity")}</span><span><b>run-diagnostics</b><small>Diagnostics · decorates the Bridge</small></span><em>Both</em></div></div></section><section class="overview-section"><div class="home-banner"><span class="home-banner-icon">${icon("hard-drive")}</span><span><span class="eyebrow">Drycode Home</span><b>${esc(state.home.path)}</b><small>Durable records, extension installs, cache, and diagnostics live here.</small></span><button class="secondary-button" data-section="home">Manage data ${icon("arrow-up-right")}</button></div></section></div>`;
}

function runtimePage() {
  return `<div class="settings-content">${pageHeader("Runtime Generation", "Runtime Generation", "The supervised unit that pairs the UI Runtime, Harness Runtime, and their generation-scoped Bridge.")}<div class="runtime-banner"><div class="runtime-banner-mark">${icon("orbit")}</div><div><span class="eyebrow">Current generation</span><h2>Generation ${state.generation} <span>${statusPill("Running", "blue")}</span></h2><p>Resolved from the Extension Graph at 10:42 AM · reload replaces the complete pair.</p></div><button class="secondary-button" data-action="reload">${icon("refresh-cw")} Reload</button></div><section class="settings-section-card">${sectionTitle("Lifecycle", "One unit, three surfaces", "A Runtime Generation starts and stops together. There are no partial reloads.")}<div class="lifecycle-grid"><div class="lifecycle-step done"><span class="step-number">01</span><span class="step-icon blue">${icon("layers-3")}</span><b>Extension Graph</b><small>Accepted · 4 nodes</small></div><div class="lifecycle-connector"></div><div class="lifecycle-step done"><span class="step-number">02</span><span class="step-icon violet">${icon("panels-top-left")}</span><b>UI Runtime</b><small>chat-shell mounted</small></div><div class="lifecycle-connector"></div><div class="lifecycle-step done"><span class="step-number">03</span><span class="step-icon violet">${icon("cpu")}</span><b>Harness Runtime</b><small>4 contributions ready</small></div><div class="lifecycle-connector"></div><div class="lifecycle-step done"><span class="step-number">04</span><span class="step-icon amber">${icon("radio")}</span><b>UI-Harness Bridge</b><small>12 endpoints frozen</small></div></div></section><section class="settings-section-card"><div class="split-heading"><div>${sectionTitle("Runtime detail", "Generation health", "Last known signals from this generation.")}</div><button class="text-button" data-section="diagnostics">View all events ${icon("arrow-up-right")}</button></div><div class="detail-table"><div><span>${icon("panel-top")}UI Runtime</span><b>Ready</b><small>chat-shell · 46 MB</small></div><div><span>${icon("cpu")}Harness Runtime</span><b>Ready</b><small>workspace-context · 82 MB</small></div><div><span>${icon("radio")}Bridge</span><b>Connected</b><small>0 dropped Streams · 12 endpoints</small></div><div><span>${icon("history")}Last reload</span><b>14 min ago</b><small>Generation 17 → 18</small></div></div></section><div class="callout amber-callout">${icon("triangle-alert")}<span><b>Reload is a replacement, not a background update.</b><small>Active Runs stop with this generation. Durable Session records remain in Drycode Home.</small></span></div></div>`;
}

function extensionMatches(extension) {
  return !state.query || `${extension.name} ${extension.kind} ${extension.owner}`.toLowerCase().includes(state.query.toLowerCase());
}

function extensionsPage() {
  const filtered = state.extensions.filter(extensionMatches);
  return `<div class="settings-content">${pageHeader("Extensions", "Extensions", "The local, fully trusted packages that compose Drycode's UI and Harness behavior.")}<section class="graph-card"><div class="graph-card-head"><div><span class="eyebrow">Extension Graph</span><h2>Resolved and deterministic</h2><p>Every discovered extension is accepted as one complete graph.</p></div><span class="graph-id">GRAPH-18 · ${state.extensions.length} NODES</span></div><div class="graph-strip"><span class="graph-root">${icon("box")}Drycode Core</span><i></i>${state.extensions.slice(0, 3).map((extension) => `<button class="graph-node ${extension.color}" data-extension="${extension.id}">${icon(extension.id === "shell" ? "panels-top-left" : extension.id === "anthropic" ? "sparkles" : "activity")}<b>${extension.name}</b></button><i></i>`).join("")}<span class="graph-more">+1</span></div></section><section class="extension-section">${sectionTitle("Discovered locally", "Contributions", `${filtered.length} of ${state.extensions.length} extensions in the effective graph.`, `<button class="secondary-button" data-action="discover">${icon("folder-search")} Discover local extension</button>`)}<div class="extension-list">${filtered.length ? filtered.map(extensionRow).join("") : `<div class="empty-settings">${icon("search-x")}<b>No extensions match “${esc(state.query)}”</b><span>Try a package name, owner, or contribution type.</span></div>`}</div></section><section class="owned-config"><div class="owned-config-icon">${icon("sliders-horizontal")}</div><div><span class="eyebrow">Extension-owned configuration</span><h2>Configuration stays with its owner</h2><p>Drycode Core provides the settings surface; each extension defines the values and validation it owns. Select an extension to inspect its configuration.</p></div><button class="secondary-button" data-extension="shell">Inspect chat-shell ${icon("arrow-right")}</button></section></div>`;
}

function extensionRow(extension) {
  return `<button class="extension-row" data-extension="${extension.id}"><span class="extension-mark ${extension.color}">${icon(extension.id === "shell" ? "panels-top-left" : extension.id === "anthropic" ? "sparkles" : extension.id === "trace" ? "activity" : "scan-search")}</span><span class="extension-main"><b>${esc(extension.name)}</b><small>${esc(extension.kind)} · ${esc(extension.owner)}</small></span><span class="extension-scope"><b>${esc(extension.scope)}</b><small>${esc(extension.status)}</small></span><span class="extension-version">v${esc(extension.version)}</span>${icon("chevron-right")}</button>`;
}

function providerRow(provider) {
  const attention = provider.status !== "Ready";
  return `<article class="provider-row"><span class="provider-letter ${provider.color}">${esc(provider.mark)}</span><span class="provider-main"><b>${esc(provider.name)}</b><small>${esc(provider.detail)}</small></span><span class="provider-health ${attention ? "attention" : ""}"><i></i>${esc(provider.status)}</span><span class="provider-latency">${esc(provider.latency)}</span><button class="secondary-button compact" data-provider="${provider.id}">Manage ${icon("arrow-up-right")}</button></article>`;
}

function providersPage() {
  return `<div class="settings-content">${pageHeader("Providers", "Model providers", "Provider extensions own discovery, credential resolution, requests, and normalized response streaming.")}<div class="provider-summary"><div><span class="eyebrow">Provider registry</span><h2>2 ready <span>·</span> 1 needs attention</h2><p>Credentials are referenced locally; Drycode does not store provider secrets in its own settings.</p></div><button class="secondary-button" data-action="add-provider">${icon("plus")} Add provider extension</button></div><section class="settings-section-card provider-card">${sectionTitle("Connections", "Installed provider extensions", "Choose a provider to inspect its owned connection settings.")}<div class="provider-list">${state.providers.map(providerRow).join("")}</div></section><section class="settings-section-card"><div class="split-heading"><div>${sectionTitle("Selection defaults", "Session defaults", "These are preferences for new Sessions, not a global model lock.")}</div><button class="text-button" data-action="defaults">Edit defaults ${icon("arrow-up-right")}</button></div><div class="default-grid"><div><span class="default-label">Provider preference</span><b>Remember last used</b><small>Each Session can choose its own provider.</small></div><div><span class="default-label">Discovery refresh</span><b>On Runtime Reload</b><small>Last discovery completed 2 minutes ago.</small></div><div><span class="default-label">Fallback behavior</span><b>Ask before switching</b><small>Runs never change provider silently.</small></div></div></section></div>`;
}

function diagnosticsPage() {
  const running = state.diagnosticsRunning;
  return `<div class="settings-content">${pageHeader("Diagnostics", "Diagnostics", "Core-owned signals for the Extension Graph, Runtime Generation, Bridge, and local data." )}<div class="diagnostic-hero"><div class="diagnostic-score"><span>${running ? "…" : "98"}</span><small>health score</small></div><div><span class="eyebrow">${running ? "Running checks" : "Last checked 2 minutes ago"}</span><h2>${running ? "Collecting a fresh readout" : "Generation looks healthy"}</h2><p>${running ? "Core is checking the graph, Bridge, providers, and Drycode Home." : "Two informational events are available. Nothing is blocking the current generation."}</p></div><button class="secondary-button" data-action="run-diagnostics">${icon(running ? "loader-circle" : "refresh-cw")} ${running ? "Checking…" : "Run checks"}</button></div><section class="settings-section-card"><div class="split-heading"><div>${sectionTitle("Checks", "Signal overview", "A diagnostic read is assembled from both runtimes; it does not change the graph.")}</div><button class="text-button" data-action="export">${icon("download")} Export report</button></div><div class="check-list"><div>${icon("check-circle-2")}<span><b>Extension Graph</b><small>4 manifests · dependencies resolved in 182 ms</small></span>${statusPill("Passed", "blue")}</div><div>${icon("check-circle-2")}<span><b>UI-Harness Bridge</b><small>12 endpoints · 0 rejected Calls · 0 dropped Streams</small></span>${statusPill("Passed", "blue")}</div><div>${icon("check-circle-2")}<span><b>Drycode Home</b><small>Durable record append and diagnostic write verified</small></span>${statusPill("Passed", "blue")}</div><div class="warning-check">${icon("circle-alert")}<span><b>Google provider</b><small>Credential reference is missing; unrelated providers remain available</small></span>${statusPill("Review", "amber")}</div></div></section><section class="settings-section-card events-card">${sectionTitle("Recent events", "Diagnostic timeline", "Structured events are retained in Drycode Home / diagnostics.")}<div class="event-list"><div><time>10:56:12</time><span class="event-mark blue">${icon("check")}</span><span><b>Runtime Generation 18 healthy</b><small>All required Service Slots have an effective provider.</small></span></div><div><time>10:43:08</time><span class="event-mark amber">${icon("info")}</span><span><b>Provider discovery refreshed</b><small>anthropic-provider discovered 3 models.</small></span></div><div><time>10:42:51</time><span class="event-mark amber">${icon("info")}</span><span><b>Google credential reference unavailable</b><small>Set by the google-provider extension when needed.</small></span></div></div></section></div>`;
}

function homePage() {
  return `<div class="settings-content">${pageHeader("Drycode Home", "Drycode Home", "The per-user root for installed extensions and Drycode's durable, cached, diagnostic, and temporary data.")}<section class="home-path-card"><div class="home-path-icon">${icon("folder-open")}</div><div><span class="eyebrow">Current data root</span><code>${esc(state.home.path)}</code><p>Used by Drycode Core and extensions that declare a durable data location.</p></div><button class="secondary-button" data-action="open-home">${icon("external-link")} Open folder</button></section><section class="settings-section-card data-card">${sectionTitle("Storage map", "What lives here", "Data ownership is visible before you remove or export anything.")}<div class="data-grid"><div class="data-tile"><span class="data-tile-icon blue">${icon("archive")}</span><span><b>Durable records</b><small>Sessions, preferences, installed graph</small></span><strong>${state.home.durable}</strong><button data-action="inspect-data">Inspect ${icon("arrow-up-right")}</button></div><div class="data-tile"><span class="data-tile-icon violet">${icon("database-zap")}</span><span><b>Extension cache</b><small>Provider discovery and package cache</small></span><strong>${state.home.cache}</strong><button data-action="clear-cache">Clear cache ${icon("trash-2")}</button></div><div class="data-tile"><span class="data-tile-icon amber">${icon("clipboard-check")}</span><span><b>Diagnostics</b><small>Reports and generation events</small></span><strong>${state.home.diagnostics}</strong><button data-action="export">Export report ${icon("download")}</button></div><div class="data-tile"><span class="data-tile-icon slate">${icon("timer-reset")}</span><span><b>Temporary data</b><small>Safe-to-remove interrupted work</small></span><strong>${state.home.temp}</strong><button data-action="clear-temp">Clear temporary ${icon("trash-2")}</button></div></div></section><div class="callout blue-callout">${icon("shield-check")}<span><b>Drycode Home is not a Workspace.</b><small>Workspace files stay where you chose them. This folder only holds per-user Drycode data and installed extensions.</small></span></div></div>`;
}

function drawer() {
  if (!state.drawer) return "";
  const extension = state.extensions.find((item) => item.id === state.drawer);
  const provider = state.providers.find((item) => item.id === state.drawer);
  if (extension) return `<div class="drawer-shade" data-dismiss="drawer"><aside class="detail-drawer"><header class="drawer-header"><div><span class="eyebrow">${esc(extension.kind)}</span><h2>${esc(extension.name)}</h2><p>${esc(extension.owner)} · v${esc(extension.version)}</p></div><button class="icon-button" data-action="close-drawer" aria-label="Close">${icon("x")}</button></header><div class="drawer-body"><div class="drawer-status-line">${statusPill("In active graph", "blue")}<span>${esc(extension.scope)}</span></div><p class="drawer-description">${esc(extension.description)}</p><div class="drawer-block"><span class="eyebrow">Extension manifest</span><dl><div><dt>Entry points</dt><dd>${extension.scope === "UI + Harness" ? "ui · harness · bridge" : extension.scope.toLowerCase().replace(" runtime", "")}</dd></div><div><dt>Dependencies</dt><dd>${esc(extension.deps)}</dd></div><div><dt>Data owner</dt><dd>${extension.name === "anthropic-provider" ? "provider-owned reference" : "Drycode Home / extensions"}</dd></div></dl></div><div class="drawer-block"><span class="eyebrow">Owned configuration</span><div class="config-list">${extension.config.map((item, index) => `<label class="config-row"><span><b>${esc(item)}</b><small>${index === 0 ? (extension.id === "anthropic" ? "Credential Manager reference" : "Current preference") : index === 1 ? "Provided by this extension" : "Validated on save"}</small></span>${configControl(extension.id, index)}</label>`).join("")}</div></div></div><footer class="drawer-footer"><button class="plain-button" data-action="close-drawer">Cancel</button><button class="primary-button" data-action="save-config">Save configuration</button></footer></aside></div>`;
  return `<div class="drawer-shade" data-dismiss="drawer"><aside class="detail-drawer"><header class="drawer-header"><div><span class="eyebrow">Model Provider</span><h2>${esc(provider.name)}</h2><p>Owned by ${esc(provider.name.toLowerCase())}-provider</p></div><button class="icon-button" data-action="close-drawer" aria-label="Close">${icon("x")}</button></header><div class="drawer-body"><div class="provider-drawer-state"><span class="provider-letter ${provider.color}">${esc(provider.mark)}</span><span><b>${esc(provider.status)}</b><small>${esc(provider.detail)}</small></span></div><div class="drawer-block"><span class="eyebrow">Connection details</span><dl><div><dt>Credential source</dt><dd>${esc(provider.credential)}</dd></div><div><dt>Last request</dt><dd>${esc(provider.latency)} · ${esc(provider.updated)}</dd></div><div><dt>Discovered models</dt><dd>${provider.detail.replace(" discovered", "")}</dd></div></dl></div><div class="drawer-block"><span class="eyebrow">Provider-owned settings</span><label class="field-label">Credential reference<input value="${provider.credential === "Not configured" ? "" : esc(provider.credential)}" placeholder="Select a local reference"></label><label class="field-label">Request region<select><option>Auto-select</option><option>North America</option><option>Europe</option></select></label><p class="field-note">Secrets stay in the provider's local credential store. This surface only records the reference.</p></div></div><footer class="drawer-footer"><button class="plain-button" data-action="close-drawer">Cancel</button><button class="primary-button" data-action="save-config">Save reference</button></footer></aside></div>`;
}

function configControl(extensionId, index) {
  const values = extensionId === "shell" ? ["Readable", "Balanced", "Expanded"] : extensionId === "anthropic" ? ["Credential Manager", "Auto", "Claude Sonnet 4"] : extensionId === "trace" ? ["30 days", "Standard", "JSON"] : ["Workspace root", ".drycodeignore", "90 sec"];
  return `<select aria-label="Configuration value"><option>${values[index]}</option><option>Default</option><option>Custom…</option></select>`;
}

function modal() {
  if (!state.modal) return "";
  if (state.modal === "reload") return `<div class="modal-shade" data-dismiss="modal"><section class="dialog" role="dialog" aria-modal="true"><div class="dialog-title"><span class="dialog-icon amber">${icon("refresh-cw")}</span><div><span class="eyebrow">Runtime lifecycle</span><h2>Reload the Runtime Generation?</h2></div></div><p>Drycode will stop Generation ${state.generation}, then start a fresh UI and Harness pair from the current graph.</p><div class="reload-note">${icon("triangle-alert")}<span>Active Runs will stop. Durable Sessions and Drycode Home data stay safe.</span></div><div class="dialog-actions"><button class="plain-button" data-action="close-modal">Cancel</button><button class="danger-button" data-action="confirm-reload">${icon("refresh-cw")} Reload generation</button></div></section></div>`;
  if (state.modal === "reloading") return `<div class="modal-shade"><section class="dialog reload-progress" role="dialog" aria-modal="true"><span class="dialog-icon amber">${icon("refresh-cw")}</span><span class="eyebrow">Runtime lifecycle</span><h2>Starting Generation ${state.generation + 1}…</h2><p>Stopping the old pair and freezing a fresh Service Registry.</p><div class="progress-track"><i></i></div><small>UI Runtime · Harness Runtime · Bridge</small></section></div>`;
  if (state.modal === "discover") return `<div class="modal-shade" data-dismiss="modal"><section class="dialog"><div class="dialog-title"><span class="dialog-icon">${icon("folder-search")}</span><div><span class="eyebrow">Extension Graph</span><h2>Discover a local extension</h2></div></div><p>Choose a folder containing a Drycode Extension Manifest. Core will validate the complete graph before the next Runtime Generation.</p><label class="field-label">Extension folder<input placeholder="C:\\Users\\Avery\\.drycode\\extensions\\…"></label><div class="dialog-actions"><button class="plain-button" data-action="close-modal">Cancel</button><button class="primary-button" data-action="discover-finish">Choose folder</button></div></section></div>`;
  return `<div class="modal-shade" data-dismiss="modal"><section class="dialog"><div class="dialog-title"><span class="dialog-icon amber">${icon("trash-2")}</span><div><span class="eyebrow">Drycode Home</span><h2>Clear ${state.modal === "cache" ? "extension cache" : "temporary data"}?</h2></div></div><p>${state.modal === "cache" ? "Provider discovery and package cache will be rebuilt on the next discovery pass." : "Temporary data can be removed without touching durable Session records."}</p><div class="dialog-actions"><button class="plain-button" data-action="close-modal">Cancel</button><button class="danger-button" data-action="confirm-clear">${icon("trash-2")} Clear data</button></div></section></div>`;
}

function mainContent() {
  if (state.section === "runtime") return runtimePage();
  if (state.section === "extensions") return extensionsPage();
  if (state.section === "providers") return providersPage();
  if (state.section === "diagnostics") return diagnosticsPage();
  if (state.section === "home") return homePage();
  return overview();
}

function render() {
  document.querySelector("#app").innerHTML = `<div class="app-frame">${topbar()}<div class="nav-layout ${state.sidebarCollapsed ? "sidebar-collapsed" : ""}">${navigation()}<main class="settings-shell">${settingsRail()}${mainContent()}</main></div></div>${drawer()}${modal()}${state.toast ? `<div class="toast" role="status">${icon("info")}<span>${esc(state.toast)}</span></div>` : ""}`;
  if (window.lucide) window.lucide.createIcons();
  bind();
}

function toast(message) {
  clearTimeout(state.toastTimer);
  state.toast = message;
  render();
  state.toastTimer = setTimeout(() => { state.toast = ""; render(); }, 2200);
}
function setSection(section) { state.section = section; state.drawer = null; render(); }
function reload() { state.modal = "reloading"; render(); setTimeout(() => { state.generation += 1; state.modal = null; state.sessions.forEach((session) => { if (session.running) { session.running = false; session.summary = "Run stopped by Reload"; } }); toast(`Runtime Generation ${state.generation} is ready`); }, 1500); }
function runDiagnostics() { if (state.diagnosticsRunning) return; state.diagnosticsRunning = true; render(); setTimeout(() => { state.diagnosticsRunning = false; toast("Diagnostics refreshed · 0 blocking issues"); }, 1200); }

function bind() {
  document.querySelectorAll("[data-section]").forEach((el) => el.addEventListener("click", () => setSection(el.dataset.section)));
  document.querySelectorAll("[data-extension]").forEach((el) => el.addEventListener("click", () => { state.drawer = el.dataset.extension; render(); }));
  document.querySelectorAll("[data-provider]").forEach((el) => el.addEventListener("click", () => { state.drawer = el.dataset.provider; render(); }));
  document.querySelectorAll("[data-action]").forEach((el) => el.addEventListener("click", () => {
    const action = el.dataset.action;
    if (action === "collapse") { state.sidebarCollapsed = !state.sidebarCollapsed; return render(); }
    if (action === "settings") return setSection("overview");
    if (action === "reload") { state.modal = "reload"; return render(); }
    if (action === "close-modal") { state.modal = null; return render(); }
    if (action === "confirm-reload") return reload();
    if (action === "discover") { state.modal = "discover"; return render(); }
    if (action === "discover-finish") { state.modal = null; return toast("Manifest scan queued for next generation"); }
    if (action === "close-drawer") { state.drawer = null; return render(); }
    if (action === "save-config") { state.drawer = null; return toast("Extension-owned configuration saved"); }
    if (action === "run-diagnostics") return runDiagnostics();
    if (action === "export") return toast("Diagnostic report copied to clipboard");
    if (action === "open-home") return toast("Open-folder handoff would open Drycode Home");
    if (action === "inspect-data") return toast("Durable records are append-only and protected");
    if (action === "clear-cache") { state.modal = "cache"; return render(); }
    if (action === "clear-temp") { state.modal = "temp"; return render(); }
    if (action === "confirm-clear") { state.modal = null; return toast("Selected data cleared safely"); }
    if (action === "add-provider") return toast("Provider extension discovery is available from Extensions");
    if (action === "defaults") return toast("Session defaults are extension-owned preferences");
    if (action === "search") { document.querySelector("[data-search]")?.focus(); }
    if (action === "new-session") return toast("New Session would open in the chat Shell");
    if (action === "sessions" || action === "workspaces") return toast(`${action === "sessions" ? "Session" : "Workspace"} navigation is available from the chat Shell`);
  }));
  const search = document.querySelector("[data-search]");
  search?.addEventListener("input", () => {
    state.query = search.value;
    if (state.section === "extensions") {
      const cursor = search.selectionStart;
      render();
      const nextSearch = document.querySelector("[data-search]");
      nextSearch?.focus();
      if (cursor !== null) nextSearch?.setSelectionRange(cursor, cursor);
    }
  });
  document.querySelectorAll("[data-dismiss]").forEach((el) => el.addEventListener("click", (event) => { if (event.target === el) { state.drawer = null; state.modal = null; render(); } }));
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && (state.drawer || state.modal)) { state.drawer = null; state.modal = null; render(); }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); document.querySelector("[data-search]")?.focus(); }
});

render();
