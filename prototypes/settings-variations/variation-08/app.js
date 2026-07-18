const state = {
  page: "extensions",
  sidebarCollapsed: false,
  selectedExtension: "shell",
  query: "",
  contribution: "all",
  discovery: "ready",
  modal: null,
  toast: "",
  toastTimer: null,
  reloadTimer: null,
  settings: {
    defaultWorkspace: "drycode",
    restoreSession: true,
    durableRecords: true,
    runNotifications: true,
    sidebarExpanded: true,
    stageLabels: true,
    density: "Comfortable",
    modelProvider: "Anthropic",
    model: "Claude Sonnet 4",
    thinking: "High",
    retention: "Keep everything",
  },
  workspaces: [
    { name: "drycode", path: "C:\\work\\drycode", sessions: 12, default: true },
    { name: "agent-lab", path: "C:\\work\\agent-lab", sessions: 4, default: false },
    { name: "docs", path: "C:\\work\\docs", sessions: 8, default: false },
  ],
  extensions: [
    {
      key: "shell", name: "Starter Conversation Shell", id: "drycode.shell.starter", version: "0.4.2", icon: "panels-top-left", tone: "blue", state: "Effective", type: "UI Runtime", summary: "The base Shell service for Sessions, Workspaces, and Run observation.", path: "C:\\Users\\dev\\.drycode\\extensions\\starter-shell", entry: "ui: ./ui.js", compatibility: ">= 0.3.0", dependencies: ["drycode.core ^0.3.0"], contributions: ["Shell service", "Session view", "Workspace view"], manifest: '{\n  "id": "drycode.shell.starter",\n  "version": "0.4.2",\n  "drycode": ">= 0.3.0",\n  "entryPoints": { "ui": "./ui.js" },\n  "dependencies": { "drycode.core": "^0.3.0" }\n}',
    },
    {
      key: "tools", name: "Workspace Tools", id: "drycode.tools.workspace", version: "0.7.1", icon: "wrench", tone: "violet", state: "Effective", type: "Harness", summary: "Headless Tools for reading Workspace context and applying validated file changes.", path: "C:\\Users\\dev\\.drycode\\extensions\\workspace-tools", entry: "harness: ./harness.js", compatibility: ">= 0.3.0", dependencies: ["drycode.core ^0.3.0"], contributions: ["Tool: read", "Tool: write", "Bridge endpoint"], manifest: '{\n  "id": "drycode.tools.workspace",\n  "version": "0.7.1",\n  "drycode": ">= 0.3.0",\n  "entryPoints": { "harness": "./harness.js" },\n  "dependencies": { "drycode.core": "^0.3.0" }\n}',
    },
    {
      key: "anthropic", name: "Anthropic Model Provider", id: "drycode.provider.anthropic", version: "0.5.0", icon: "cpu", tone: "amber", state: "Effective", type: "Harness", summary: "Discovers Anthropic models and normalizes credential resolution and response streams.", path: "C:\\Users\\dev\\.drycode\\extensions\\provider-anthropic", entry: "harness: ./provider.js", compatibility: ">= 0.3.0", dependencies: ["drycode.harness ^0.3.0"], contributions: ["Model Provider", "Credential resolver", "Stream adapter"], manifest: '{\n  "id": "drycode.provider.anthropic",\n  "version": "0.5.0",\n  "drycode": ">= 0.3.0",\n  "entryPoints": { "harness": "./provider.js" },\n  "dependencies": { "drycode.harness": "^0.3.0" }\n}',
    },
    {
      key: "skills", name: "Starter Skills", id: "drycode.skills.starter", version: "0.3.3", icon: "sparkles", tone: "violet", state: "Effective", type: "UI + Harness", summary: "A small local catalog of named instructions and resources for Session prompt assembly.", path: "C:\\Users\\dev\\.drycode\\extensions\\starter-skills", entry: "both: ./index.js", compatibility: ">= 0.3.0", dependencies: ["drycode.core ^0.3.0"], contributions: ["Skill catalog", "Skill picker"], manifest: '{\n  "id": "drycode.skills.starter",\n  "version": "0.3.3",\n  "drycode": ">= 0.3.0",\n  "entryPoints": { "both": "./index.js" },\n  "dependencies": { "drycode.core": "^0.3.0" }\n}',
    },
    {
      key: "records", name: "Session Records", id: "drycode.sessions.records", version: "0.3.8", icon: "scroll-text", tone: "blue", state: "Effective", type: "UI + Harness", summary: "Owns the append-only Session record stream and durable Run history.", path: "C:\\Users\\dev\\.drycode\\extensions\\session-records", entry: "both: ./records.js", compatibility: ">= 0.3.0", dependencies: ["drycode.core ^0.3.0"], contributions: ["Session service", "Run history", "Storage adapter"], manifest: '{\n  "id": "drycode.sessions.records",\n  "version": "0.3.8",\n  "drycode": ">= 0.3.0",\n  "entryPoints": { "both": "./records.js" },\n  "dependencies": { "drycode.core": "^0.3.0" }\n}',
    },
    {
      key: "diagnostics", name: "Runtime Diagnostics", id: "drycode.diagnostics.local", version: "0.2.6", icon: "activity", tone: "amber", state: "Effective", type: "UI + Harness", summary: "Captures lifecycle events and produces a local diagnostic summary for support.", path: "C:\\Users\\dev\\.drycode\\extensions\\runtime-diagnostics", entry: "both: ./diagnostics.js", compatibility: ">= 0.3.0", dependencies: ["drycode.core ^0.3.0"], contributions: ["Diagnostics", "Lifecycle events"], manifest: '{\n  "id": "drycode.diagnostics.local",\n  "version": "0.2.6",\n  "drycode": ">= 0.3.0",\n  "entryPoints": { "both": "./diagnostics.js" },\n  "dependencies": { "drycode.core": "^0.3.0" }\n}',
    },
  ],
};

const icon = (name, label = "") => `<i data-lucide="${name}"${label ? ` aria-label="${label}"` : ""}></i>`;
const esc = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const selectedExtension = () => state.extensions.find((item) => item.key === state.selectedExtension) || state.extensions[0];

function topbar() {
  return `<header class="topbar"><button class="topbar-collapse" data-action="collapse" aria-label="${state.sidebarCollapsed ? "Expand" : "Collapse"} sidebar">${icon(state.sidebarCollapsed ? "panel-left-open" : "panel-left-close")}</button><span class="window-drag"></span><div class="window-controls" aria-label="Window controls"><button data-action="window" aria-label="Minimize">${icon("minus")}</button><button data-action="window" aria-label="Maximize">${icon("square")}</button><button data-action="window" aria-label="Close">${icon("x")}</button></div></header>`;
}

const navItems = [
  ["overview", "Overview", "layout-dashboard"], ["extensions", "Extensions", "puzzle", "7"], ["lifecycle", "Lifecycle", "refresh-cw"], ["workspaces", "Workspaces", "folders"], ["sessions", "Sessions", "messages-square"], ["appearance", "Appearance", "contrast"], ["shortcuts", "Shortcuts", "keyboard"], ["data", "Data & diagnostics", "file-cog"],
];
function sidebar() {
  return `<aside class="sidebar"><header class="brand"><span class="logo" title="Drycode">${icon("panels-top-left")}</span><strong>Drycode</strong><span class="dev-badge">Dev</span></header><button class="home-card" data-action="home" title="Drycode Home"><span class="home-icon">${icon("house")}</span><span class="home-copy"><b>Drycode Home</b><small>~\\.drycode</small></span><span class="home-meta"><i></i><span>Local · 7 extensions</span></span></button><div class="nav-heading">Settings</div><nav class="settings-nav" aria-label="Settings navigation">${navItems.map(([key, label, ico, count]) => `<button class="${state.page === key ? "selected" : ""}" data-page="${key}" aria-current="${state.page === key ? "page" : "false"}" title="${label}">${icon(ico)}<span class="nav-label">${label}</span>${count ? `<span class="nav-count">${count}</span>` : ""}</button>`).join("")}</nav><div class="runtime-card"><div class="runtime-row"><i></i><span class="runtime-copy"><b>Generation 18</b><br>UI + Harness paired</span></div></div><footer class="sidebar-footer"><button data-action="reload" title="Reload Runtime">${icon("refresh-cw")}<span>Reload Runtime</span></button><button class="icon-button" data-action="help" aria-label="Help" title="Help">${icon("circle-help")}</button></footer></aside>`;
}

function heading(eyebrow, title, description, actions = "") {
  return `<div class="breadcrumb"><span>Settings</span>${icon("chevron-right")}<b>${eyebrow}</b></div><header class="page-heading"><div><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${description}</p></div>${actions ? `<div class="heading-actions">${actions}</div>` : ""}</header>`;
}
function reloadButton(label = "Reload generation") { return `<button data-action="reload">${icon("refresh-cw")}<span>${label}</span></button>`; }
function runtimeBanner() {
  return `<section class="runtime-banner"><div class="runtime-title">${icon("radio-tower")}<div><strong>Runtime Generation 18</strong><small>Accepted Extension Graph · running</small></div></div><div class="banner-stat"><small>Graph</small><b>7 extensions</b></div><div class="banner-stat"><small>Registries</small><b>UI + Harness</b></div><div class="banner-stat"><small>Last reload</small><b class="amber">11 min ago</b></div><button data-action="lifecycle">View lifecycle ${icon("arrow-up-right")}</button></section>`;
}

function extensionCard(extension) {
  const selected = extension.key === state.selectedExtension;
  return `<button class="extension-card ${selected ? "selected" : ""}" data-extension="${extension.key}" aria-pressed="${selected}"><span class="extension-mark ${extension.tone}">${icon(extension.icon)}</span><span class="extension-card-copy"><strong>${esc(extension.name)}</strong><span class="extension-id">${esc(extension.id)} · v${esc(extension.version)}</span><span class="extension-summary">${esc(extension.summary)}</span><span class="card-meta">${extension.contributions.slice(0, 2).map((item) => `<span class="chip ${extension.tone}">${icon(item.includes("Model") ? "cpu" : "plus")} ${esc(item)}</span>`).join("")}</span></span><span class="extension-state ${extension.state === "Available" ? "waiting" : ""}"><i></i>${esc(extension.state)}</span></button>`;
}
function inspector() {
  const extension = selectedExtension();
  return `<aside class="panel inspector"><header class="inspector-head"><span class="extension-mark ${extension.tone}">${icon(extension.icon)}</span><div><strong>${esc(extension.name)}</strong><small>${esc(extension.type)} contribution</small></div><span class="effective-pill"><i></i>${esc(extension.state)}</span></header><div class="inspector-body"><section class="inspector-section"><h3>Extension Manifest</h3><dl class="manifest-table"><div class="manifest-row"><dt>Identity</dt><dd>${esc(extension.id)}</dd></div><div class="manifest-row"><dt>Version</dt><dd>${esc(extension.version)}</dd></div><div class="manifest-row"><dt>Drycode</dt><dd>${esc(extension.compatibility)}</dd></div><div class="manifest-row"><dt>Entry point</dt><dd>${esc(extension.entry)}</dd></div><div class="manifest-row"><dt>Depends on</dt><dd>${esc(extension.dependencies.join(", "))}</dd></div></dl></section><section class="inspector-section"><h3>Contributes</h3><div class="contribution-list">${extension.contributions.map((item) => `<span class="chip">${icon("box")} ${esc(item)}</span>`).join("")}</div></section><section class="inspector-section"><div class="graph-note">${icon("workflow")}<span><b>Graph-controlled.</b> This package is in the accepted graph. Drycode does not offer per-extension toggles that could leave a partial graph running.</span></div></section><section class="inspector-section"><div class="inspector-actions"><button data-action="manifest">${icon("file-json")} View manifest</button><button data-action="copy" data-copy="${esc(extension.path)}">${icon("copy")} Copy location</button></div><div class="location" title="${esc(extension.path)}">${esc(extension.path)}</div></section></div></aside>`;
}
function extensionsPage() {
  const matching = state.extensions.filter((extension) => {
    const query = state.query.toLowerCase();
    const hit = !query || `${extension.name} ${extension.id} ${extension.summary}`.toLowerCase().includes(query);
    const type = state.contribution === "all" || extension.type === state.contribution;
    return hit && type;
  });
  return `<main class="page">${heading("Extensions", "Extensions", "Local, fully trusted packages compose Drycode's UI and Harness behavior. Inspect the accepted graph and its lifecycle here.", `<button data-action="home">${icon("folder-open")} Drycode Home</button>${reloadButton()}`)}${runtimeBanner()}<div class="extensions-layout"><section><div class="section-title"><h2>Installed locally</h2><small>${matching.length} of ${state.extensions.length} discovered</small></div><div class="extension-toolbar"><label class="search-input">${icon("search")}<input data-input="extension-search" value="${esc(state.query)}" placeholder="Filter by name or manifest id" aria-label="Filter extensions"></label><select class="select-control" data-setting="contribution" aria-label="Filter contribution type"><option value="all" ${state.contribution === "all" ? "selected" : ""}>All contributions</option><option value="UI Runtime" ${state.contribution === "UI Runtime" ? "selected" : ""}>UI Runtime</option><option value="Harness" ${state.contribution === "Harness" ? "selected" : ""}>Harness</option><option value="UI + Harness" ${state.contribution === "UI + Harness" ? "selected" : ""}>UI + Harness</option></select><button data-action="discover" aria-label="Refresh discovery" title="Refresh discovery">${icon("scan-search")}</button></div><div class="extension-list">${matching.length ? matching.map(extensionCard).join("") : `<div class="panel no-results">No local Extensions match that filter.</div>`}</div><div class="discovery-note">${icon("info")}<span>${state.discovery === "scanning" ? "Discovering local manifests and rebuilding the preview graph…" : "Discovery reads manifests from Drycode Home. Changes are staged until the next Reload; the graph is accepted or rejected as a whole."}</span></div></section>${inspector()}</div></main>`;
}

function overviewPage() {
  return `<main class="page">${heading("Overview", "Settings", "A practical view of Drycode Home, the active Runtime Generation, and the defaults used by new Sessions.", reloadButton())}<div class="settings-grid"><section class="info-card"><div class="card-heading">${icon("house")}<h2>Drycode Home</h2></div><p>Local durable, cached, diagnostic, and temporary data lives here. Workspaces remain separate.</p><div class="path-box">${icon("folder")}<span>C:\\Users\\dev\\.drycode</span><button class="inline-link" data-action="copy" data-copy="C:\\Users\\dev\\.drycode">Copy</button></div><div class="setting-line"><span><b>Discovered Extensions</b><small>Packages in the local extensions directory</small></span><strong class="muted">7</strong></div></section><section class="info-card"><div class="card-heading">${icon("radio-tower")}<h2>Runtime Generation</h2></div><p>One supervised UI and Harness pair, created from the accepted Extension Graph.</p><div class="setting-line"><span><b>Current generation</b><small>Separate UI and Harness Service Registries</small></span><strong class="muted">18 · Running</strong></div><div class="setting-line"><span><b>Lifecycle</b><small>Reload replaces this generation in place</small></span><button data-action="lifecycle">Inspect</button></div></section><section class="info-card wide"><div class="card-heading">${icon("sliders-horizontal")}<h2>New Session defaults</h2></div><p>These are app-level defaults. Model discovery and credential resolution belong to the local Model Provider Extension.</p><div class="settings-grid"><div class="setting-line"><span><b>Default Workspace</b><small>Where a new Session starts</small></span><select class="select-control" data-setting="defaultWorkspace">${state.workspaces.map((w) => `<option ${w.name === state.settings.defaultWorkspace ? "selected" : ""}>${esc(w.name)}</option>`).join("")}</select></div><div class="setting-line"><span><b>Model Provider</b><small>Provider contribution used for new Runs</small></span><select class="select-control" data-setting="modelProvider"><option ${state.settings.modelProvider === "Anthropic" ? "selected" : ""}>Anthropic</option><option ${state.settings.modelProvider === "OpenAI" ? "selected" : ""}>OpenAI</option><option ${state.settings.modelProvider === "Google" ? "selected" : ""}>Google</option></select></div><div class="setting-line"><span><b>Model</b><small>Selected after provider discovery</small></span><select class="select-control" data-setting="model"><option ${state.settings.model === "Claude Sonnet 4" ? "selected" : ""}>Claude Sonnet 4</option><option ${state.settings.model === "Claude Opus 4" ? "selected" : ""}>Claude Opus 4</option><option ${state.settings.model === "GPT-5" ? "selected" : ""}>GPT-5</option><option ${state.settings.model === "Gemini 2.5 Pro" ? "selected" : ""}>Gemini 2.5 Pro</option></select></div><div class="setting-line"><span><b>Thinking level</b><small>Reasoning depth for new Runs</small></span><select class="select-control" data-setting="thinking"><option ${state.settings.thinking === "Off" ? "selected" : ""}>Off</option><option ${state.settings.thinking === "Low" ? "selected" : ""}>Low</option><option ${state.settings.thinking === "Medium" ? "selected" : ""}>Medium</option><option ${state.settings.thinking === "High" ? "selected" : ""}>High</option></select></div></div></section></div></main>`;
}
function lifecyclePage() {
  return `<main class="page">${heading("Lifecycle", "Runtime lifecycle", "See how Drycode discovers Extensions, accepts one deterministic graph, and replaces paired runtimes without closing the desktop window.", reloadButton("Reload Runtime"))}<section class="panel" style="padding: 18px 20px 21px"><div class="section-title"><h2>Generation 18</h2><span class="effective-pill"><i></i>Running</span><span class="grow"></span><small>Started today at 10:42</small></div><div class="lifecycle-track"><div class="lifecycle-step complete"><span class="step-number">1</span><strong>Discover</strong><p>Read local Extension Manifests from Drycode Home.</p></div><div class="lifecycle-step complete"><span class="step-number">2</span><strong>Resolve graph</strong><p>Validate identity, compatibility, and dependencies as one set.</p></div><div class="lifecycle-step current"><span class="step-number">3</span><strong>Start generation</strong><p>Pair UI and Harness runtimes with frozen registries.</p></div><div class="lifecycle-step"><span class="step-number">4</span><strong>Run</strong><p>Bridge validated Calls and Streams across runtimes.</p></div></div><div class="generation-card"><div class="setting-line"><span><b>Extension Graph</b><small>Deterministic set accepted by Core</small></span><strong class="muted">7 / 7 accepted</strong></div><div class="setting-line"><span><b>UI Runtime</b><small>Shell service provider is effective</small></span><strong class="muted">Paired</strong></div><div class="setting-line"><span><b>Harness Runtime</b><small>Tools and Model Provider available</small></span><strong class="muted">Paired</strong></div><div class="setting-line"><span><b>UI-Harness Bridge</b><small>Generation-scoped and validated</small></span><strong class="muted">Connected</strong></div></div></section><section class="info-card" style="margin-top: 13px"><div class="card-heading">${icon("history")}<h2>Recent lifecycle events</h2></div><div class="history-list"><div class="history-row"><time>Today · 10:42</time><span>Reload completed</span><small>Generation 18</small></div><div class="history-row"><time>Today · 10:41</time><span>Graph accepted</span><small>7 extensions</small></div><div class="history-row"><time>Yesterday · 16:08</time><span>Discovery completed</span><small>7 local manifests</small></div></div></section><div class="discovery-note" style="margin-top: 13px">${icon("shield-check")}<span>If a manifest or dependency is invalid, Drycode shows the Recovery Surface and does not start a partial Extension Graph. Active Runs are interrupted by Reload, while durable Session records remain available.</span></div></main>`;
}
function workspacesPage() {
  return `<main class="page">${heading("Workspaces", "Workspaces", "Choose where new Harness Sessions operate. Workspace folders are local and are not stored in Drycode Home.", `<button data-action="choose-folder">${icon("folder-plus")} Add Workspace</button>`)}<section class="info-card" style="margin-bottom: 13px"><div class="card-heading">${icon("star")}<h2>New Session location</h2></div><p>The default is used when creating a Session from the sidebar. Existing Sessions keep their own Workspace binding.</p><div class="setting-line"><span><b>Default Workspace</b><small>Current choice: ${esc(state.settings.defaultWorkspace)}</small></span><select class="select-control" data-setting="defaultWorkspace">${state.workspaces.map((w) => `<option ${w.name === state.settings.defaultWorkspace ? "selected" : ""}>${esc(w.name)}</option>`).join("")}</select></div></section><div class="section-title"><h2>Known Workspaces</h2><small>${state.workspaces.length} folders</small></div><div class="workspace-list">${state.workspaces.map((workspace) => `<article class="workspace-row"><span>${icon("folder")}</span><div><strong>${esc(workspace.name)} ${workspace.default || workspace.name === state.settings.defaultWorkspace ? `<span class="chip">Default</span>` : ""}</strong><small>${esc(workspace.path)} · ${workspace.sessions} Sessions</small></div><button data-action="copy" data-copy="${esc(workspace.path)}">Copy path</button></article>`).join("")}</div></main>`;
}
function sessionsPage() {
  return `<main class="page">${heading("Sessions", "Session defaults", "Keep the durable, linear record stream useful between Runs. These settings affect storage and new Run behavior, not the Extension Graph.") }<div class="settings-grid"><section class="info-card"><div class="card-heading">${icon("messages-square")}<h2>Durable records</h2></div><p>Session records are append-only facts. A Session has at most one active Run.</p>${toggleLine("durableRecords", "Keep durable Session records", "Store the authoritative record stream in Drycode Home.")} ${toggleLine("restoreSession", "Restore the last Session", "Open the last active Session when Drycode starts.")}<div class="setting-line"><span><b>Record retention</b><small>Does not remove active Session records</small></span><select class="select-control" data-setting="retention"><option ${state.settings.retention === "Keep everything" ? "selected" : ""}>Keep everything</option><option ${state.settings.retention === "90 days" ? "selected" : ""}>90 days</option><option ${state.settings.retention === "30 days" ? "selected" : ""}>30 days</option></select></div></section><section class="info-card"><div class="card-heading">${icon("sliders-horizontal")}<h2>Run defaults</h2></div><p>Providers are Extension contributions; choose the defaults used when a new Run is started.</p><div class="setting-line"><span><b>Model Provider</b><small>Credential resolution remains with the provider</small></span><select class="select-control" data-setting="modelProvider"><option ${state.settings.modelProvider === "Anthropic" ? "selected" : ""}>Anthropic</option><option ${state.settings.modelProvider === "OpenAI" ? "selected" : ""}>OpenAI</option><option ${state.settings.modelProvider === "Google" ? "selected" : ""}>Google</option></select></div><div class="setting-line"><span><b>Thinking level</b><small>Prompt assembly hint for the Harness</small></span><select class="select-control" data-setting="thinking"><option ${state.settings.thinking === "Off" ? "selected" : ""}>Off</option><option ${state.settings.thinking === "Low" ? "selected" : ""}>Low</option><option ${state.settings.thinking === "Medium" ? "selected" : ""}>Medium</option><option ${state.settings.thinking === "High" ? "selected" : ""}>High</option></select></div>${toggleLine("runNotifications", "Run completion notices", "Show a local notice when a Run settles.")}</section></div></main>`;
}
function toggleLine(key, title, description) { return `<div class="setting-line"><span><b>${title}</b><small>${description}</small></span><span class="toggle-label">${state.settings[key] ? "On" : "Off"}</span><button class="toggle ${state.settings[key] ? "on" : ""}" data-toggle="${key}" aria-label="${title}: ${state.settings[key] ? "On" : "Off"}" aria-pressed="${state.settings[key]}"><i></i></button></div>`; }
function appearancePage() {
  return `<main class="page">${heading("Appearance", "Appearance", "Keep the neutral dark surface legible while choosing the amount of density and lifecycle detail you want to see.")}<div class="settings-grid"><section class="info-card"><div class="card-heading">${icon("contrast")}<h2>Surface</h2></div><p>Drycode's dark canvas is intentionally neutral so status colors carry meaning.</p><div class="setting-line"><span><b>Theme</b><small>More themes can arrive as UI contributions</small></span><select class="select-control"><option>Neutral dark</option></select></div><div class="setting-line"><span><b>Density</b><small>Spacing in Settings and navigation</small></span><select class="select-control" data-setting="density"><option ${state.settings.density === "Comfortable" ? "selected" : ""}>Comfortable</option><option ${state.settings.density === "Compact" ? "selected" : ""}>Compact</option></select></div></section><section class="info-card"><div class="card-heading">${icon("panel-left")}<h2>Navigation</h2></div><p>These controls change presentation only; they do not change runtime behavior.</p>${toggleLine("sidebarExpanded", "Start with sidebar expanded", "Keep Settings navigation labels visible on launch.")}${toggleLine("stageLabels", "Show Run stage labels", "Show the current Harness stage in Session surfaces.")}</section></div></main>`;
}
function shortcutsPage() {
  const rows = [["Search Sessions", "Ctrl K"], ["New Session", "Ctrl Shift O"], ["Collapse sidebar", "Ctrl B"], ["Dismiss surface", "Esc"], ["Send Session input", "Enter"]];
  return `<main class="page">${heading("Shortcuts", "Keyboard shortcuts", "Small, direct controls for navigating Sessions and watching the active Run.")}<section class="info-card" style="max-width: 630px"><div class="card-heading">${icon("keyboard")}<h2>Application shortcuts</h2></div><div class="shortcut-list">${rows.map(([name, key]) => `<div class="shortcut-row"><span>${name}</span><kbd>${key}</kbd></div>`).join("")}</div></section></main>`;
}
function dataPage() {
  return `<main class="page">${heading("Data & diagnostics", "Data & diagnostics", "Understand what Drycode keeps locally and collect a useful lifecycle snapshot without sending it anywhere.")}<div class="settings-grid"><section class="info-card"><div class="card-heading">${icon("database")}<h2>Local data</h2></div><p>Drycode Home is the per-user root for durable, cached, diagnostic, and temporary data.</p><div class="data-list"><div class="data-row">${icon("scroll-text")}<span><b>Session records</b><small>C:\\Users\\dev\\.drycode\\sessions</small></span></div><div class="data-row">${icon("archive")}<span><b>Extension cache</b><small>C:\\Users\\dev\\.drycode\\cache</small></span></div><div class="data-row">${icon("file-clock")}<span><b>Diagnostics</b><small>C:\\Users\\dev\\.drycode\\diagnostics</small></span></div><div class="data-row">${icon("file-clock")}<span><b>Temporary data</b><small>C:\\Users\\dev\\.drycode\\tmp</small></span></div></div></section><section class="info-card"><div class="card-heading">${icon("stethoscope")}<h2>Diagnostics</h2></div><p>Generate a local summary of the accepted graph, paired runtimes, and recent lifecycle events.</p><button class="primary-button" data-action="diagnostic">${icon("clipboard-copy")} Copy diagnostic summary</button><div style="height: 8px"></div><button data-action="clear-temp">${icon("trash-2")} Clear temporary data</button></section></div></main>`;
}

function pageContent() {
  if (state.page === "overview") return overviewPage();
  if (state.page === "lifecycle") return lifecyclePage();
  if (state.page === "workspaces") return workspacesPage();
  if (state.page === "sessions") return sessionsPage();
  if (state.page === "appearance") return appearancePage();
  if (state.page === "shortcuts") return shortcutsPage();
  if (state.page === "data") return dataPage();
  return extensionsPage();
}
function modal() {
  if (!state.modal) return "";
  if (state.modal === "reload") return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="reload-title"><div class="dialog-title"><span class="dialog-icon amber">${icon("refresh-cw")}</span><div><span class="eyebrow">Runtime lifecycle</span><h2 id="reload-title">Reload Runtime Generation?</h2></div></div><p>Drycode will stop the complete UI and Harness pair, resolve the local Extension Graph again, then start a fresh generation. The desktop window and durable Session records remain available.</p><div class="graph-note">${icon("triangle-alert")}<span>Any active Run will be interrupted. The graph is accepted or rejected as a whole; no partial extension set will start.</span></div><div class="dialog-actions"><button class="plain-button" data-action="close-modal">Cancel</button><button class="danger-button" data-action="confirm-reload">${icon("refresh-cw")} Reload generation</button></div></section></div>`;
  if (state.modal === "manifest") { const extension = selectedExtension(); return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="manifest-title"><div class="dialog-title"><span class="dialog-icon violet">${icon("file-json")}</span><div><span class="eyebrow">Local manifest</span><h2 id="manifest-title">${esc(extension.name)}</h2></div></div><p>Read-only preview from <span class="muted">${esc(extension.path)}</span>.</p><pre class="manifest-code">${esc(extension.manifest)}</pre><div class="dialog-actions"><button class="plain-button" data-action="close-modal">Close</button><button class="primary-button" data-action="copy" data-copy="${esc(extension.manifest)}">${icon("copy")} Copy manifest</button></div></section></div>`; }
  if (state.modal === "clear-temp") return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true"><div class="dialog-title"><span class="dialog-icon amber">${icon("trash-2")}</span><div><span class="eyebrow">Drycode Home · tmp</span><h2>Clear temporary data?</h2></div></div><p>Cached intermediate files will be removed. Durable Session records, Extension Manifests, and diagnostics will not be touched.</p><div class="dialog-actions"><button class="plain-button" data-action="close-modal">Cancel</button><button class="danger-button" data-action="confirm-clear">${icon("trash-2")} Clear temporary data</button></div></section></div>`;
  if (state.modal === "reloading") return `<div class="modal-shade"><section class="dialog reload-progress" role="dialog" aria-modal="true"><span class="dialog-icon amber">${icon("refresh-cw")}</span><span class="eyebrow">Runtime lifecycle</span><h2>Reloading Generation...</h2><p>Stopping the pair, resolving the graph, and starting a fresh UI + Harness generation.</p><div class="progress-track"><i></i></div><small>Resolving 7 local Extensions</small></section></div>`;
  return "";
}
function render() {
  document.querySelector("#app").innerHTML = `<div class="app-frame">${topbar()}<div class="shell ${state.sidebarCollapsed ? "is-collapsed" : ""}">${sidebar()}<section class="content">${pageContent()}</section></div></div>${modal()}${state.toast ? `<div class="toast" role="status">${icon("info")}<span>${esc(state.toast)}</span></div>` : ""}`;
  if (window.lucide) window.lucide.createIcons();
  bind();
}
function toast(message) {
  clearTimeout(state.toastTimer); state.toast = message; render();
  state.toastTimer = setTimeout(() => { state.toast = ""; render(); }, 2200);
}
function copyText(text) {
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {});
  toast("Copied to clipboard");
}
function chooseFolder() {
  if (!window.showDirectoryPicker) { toast("Folder picker is unavailable in this browser"); return; }
  window.showDirectoryPicker().then((directory) => {
    if (!directory) return;
    if (!state.workspaces.some((item) => item.name === directory.name)) state.workspaces.push({ name: directory.name, path: directory.name, sessions: 0, default: false });
    toast(`${directory.name} added as a Workspace`); render();
  }).catch((error) => { if (error?.name !== "AbortError") toast("The folder picker could not open"); });
}
function reload() {
  clearTimeout(state.reloadTimer); state.modal = "reloading"; render();
  state.reloadTimer = setTimeout(() => { state.modal = null; toast("Runtime Generation 19 started"); }, 1500);
}
function bind() {
  document.querySelectorAll("[data-page]").forEach((element) => element.addEventListener("click", () => { state.page = element.dataset.page; state.modal = null; render(); }));
  document.querySelectorAll("[data-action]").forEach((element) => element.addEventListener("click", (event) => {
    const action = element.dataset.action;
    if (action === "collapse") { state.sidebarCollapsed = !state.sidebarCollapsed; render(); }
    if (action === "reload") { state.modal = "reload"; render(); }
    if (action === "confirm-reload") reload();
    if (action === "close-modal") { state.modal = null; render(); }
    if (action === "manifest") { state.modal = "manifest"; render(); }
    if (action === "copy") copyText(element.dataset.copy || "");
    if (action === "lifecycle") { state.page = "lifecycle"; render(); }
    if (action === "home") toast("Drycode Home is local at C:\\Users\\dev\\.drycode");
    if (action === "help") toast("Settings help is available in the local README");
    if (action === "window") toast("Window controls are available in the desktop build");
    if (action === "choose-folder") chooseFolder();
    if (action === "discover") {
      state.discovery = "scanning"; render();
      setTimeout(() => { state.discovery = "ready"; toast("7 local Extension Manifests discovered"); }, 950);
    }
    if (action === "diagnostic") copyText("Drycode diagnostic summary\\nGeneration 18 · 7 extensions · UI + Harness paired\\nGraph accepted · Bridge connected");
    if (action === "clear-temp") { state.modal = "clear-temp"; render(); }
    if (action === "confirm-clear") { state.modal = null; toast("Temporary data cleared"); }
    if (action === "view-manifest") { state.modal = "manifest"; render(); }
    if (action === "view-lifecycle") { state.page = "lifecycle"; render(); }
    event.stopPropagation();
  }));
  document.querySelectorAll("[data-extension]").forEach((element) => element.addEventListener("click", () => { state.selectedExtension = element.dataset.extension; render(); }));
  const search = document.querySelector("[data-input=extension-search]");
  if (search) search.addEventListener("input", () => { state.query = search.value; render(); const next = document.querySelector("[data-input=extension-search]"); next?.focus(); next?.setSelectionRange(state.query.length, state.query.length); });
  document.querySelectorAll("[data-toggle]").forEach((element) => element.addEventListener("click", () => { const key = element.dataset.toggle; state.settings[key] = !state.settings[key]; toast(`${element.getAttribute("aria-label").split(":")[0]} ${state.settings[key] ? "on" : "off"}`); }));
  document.querySelectorAll("[data-setting]").forEach((element) => element.addEventListener("change", () => {
    const key = element.dataset.setting;
    if (key === "contribution") state.contribution = element.value;
    else {
      state.settings[key] = element.value;
      if (key === "modelProvider") {
        state.settings.model = element.value === "OpenAI" ? "GPT-5" : element.value === "Google" ? "Gemini 2.5 Pro" : "Claude Sonnet 4";
      }
    }
    render();
  }));
  document.querySelectorAll(".modal-shade[data-dismiss]").forEach((shade) => shade.addEventListener("click", (event) => { if (event.target === shade) { state.modal = null; render(); } }));
}
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.modal) { state.modal = null; render(); }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") { event.preventDefault(); state.sidebarCollapsed = !state.sidebarCollapsed; render(); }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); state.page = "sessions"; render(); }
});
render();
