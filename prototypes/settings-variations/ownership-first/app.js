const state = {
  section: "overview",
  graphChecked: false,
  graphVersion: 18,
  bridge: "Healthy",
  modal: null,
  toast: "",
  toastTimer: null,
  logFilter: "all",
  expandedExtensions: new Set(["starter-chat"]),
  providers: {
    Anthropic: { ready: true, detail: "Keychain · last checked 2m ago" },
    OpenAI: { ready: true, detail: "Keychain · last checked 18m ago" },
    Google: { ready: false, detail: "Authentication required" },
  },
};

const PROVIDERS = [
  { name: "Anthropic", logo: "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg@latest/icons/anthropic.svg", extension: "drycode-provider-anthropic", models: "3 models discovered", detail: "Anthropic Model Provider owns authentication and model discovery." },
  { name: "OpenAI", logo: "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg@latest/icons/openai.svg", extension: "drycode-provider-openai", models: "4 models discovered", detail: "OpenAI Model Provider owns authentication and model discovery." },
  { name: "Google", logo: "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg@latest/icons/google.svg", extension: "drycode-provider-google", models: "2 models discovered", detail: "Google Model Provider owns authentication and model discovery." },
];

const EXTENSIONS = [
  {
    id: "drycode-core", name: "Drycode Core", version: "0.8.0", description: "Discovers, resolves, and supervises the complete Extension Graph.", kind: "Core", icon: "boxes", owner: "core", ui: "—", harness: "core://harness", deps: ["—"], manifest: "~/.drycode/extensions/drycode-core/manifest.json",
  },
  {
    id: "starter-chat", name: "Starter Chat", version: "0.6.2", description: "The active Shell Extension for the current starter chat experience.", kind: "Shell Extension", icon: "message-square-code", owner: "shell", ui: "starter-chat/ui", harness: "starter-chat/harness", deps: ["drycode-core", "drycode-harness"], manifest: "~/.drycode/extensions/starter-chat/manifest.json",
  },
  {
    id: "drycode-harness", name: "Drycode Harness", version: "0.4.1", description: "Provides the independent coding-agent runtime for Harness Sessions.", kind: "Runtime", icon: "cpu", owner: "core", ui: "—", harness: "drycode-harness/runtime", deps: ["drycode-core"], manifest: "~/.drycode/extensions/drycode-harness/manifest.json",
  },
  {
    id: "anthropic-provider", name: "Anthropic Model Provider", version: "0.3.0", description: "Contributes the Anthropic Model Provider service slot.", kind: "Provider", icon: "key-round", owner: "extension", ui: "provider://anthropic/ui", harness: "provider://anthropic/harness", deps: ["drycode-core", "drycode-harness"], manifest: "~/.drycode/extensions/drycode-provider-anthropic/manifest.json",
  },
  {
    id: "workspace-tools", name: "Workspace Tools", version: "0.2.4", description: "Contributes headless tools for reading and shaping Workspace context.", kind: "Tools", icon: "wrench", owner: "extension", ui: "—", harness: "workspace-tools/harness", deps: ["drycode-core", "drycode-harness"], manifest: "~/.drycode/extensions/workspace-tools/manifest.json",
  },
  {
    id: "starter-skills", name: "Starter Skills", version: "0.1.8", description: "Contributes named instructions and resources for prompt assembly.", kind: "Skills", icon: "sparkles", owner: "extension", ui: "starter-skills/ui", harness: "—", deps: ["drycode-core"], manifest: "~/.drycode/extensions/starter-skills/manifest.json",
  },
];

const LOGS = [
  { time: "14:32:08.401", level: "info", source: "Core", text: "Runtime Generation 18 started with 6 extensions" },
  { time: "14:32:08.622", level: "info", source: "Graph", text: "Extension Graph validated · deterministic order resolved" },
  { time: "14:32:08.944", level: "info", source: "Bridge", text: "UI-Harness Bridge handshake complete · generation 18" },
  { time: "14:31:47.113", level: "warn", source: "Provider", text: "Google authentication is not configured" },
  { time: "14:29:16.007", level: "info", source: "Shell", text: "Starter Chat mounted as active Shell Extension" },
];

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");
const icon = (name, label = "") => `<i data-lucide="${name}"${label ? ` aria-label="${label}"` : ""}></i>`;
const provider = (name) => PROVIDERS.find((item) => item.name === name) || PROVIDERS[0];

function topbar() {
  return `<header class="topbar">
    <button class="topbar-home" data-action="back-chat" aria-label="Back to Starter Chat">${icon("arrow-left")}<span>Starter Chat</span></button>
    <span class="topbar-divider"></span><span class="topbar-context">Settings</span><span class="window-drag"></span>
    <div class="window-controls" aria-label="Window controls"><button aria-label="Minimize">${icon("minus")}</button><button aria-label="Maximize">${icon("square")}</button><button aria-label="Close">${icon("x")}</button></div>
  </header>`;
}

const navItems = [
  ["overview", "Overview", "layout-dashboard"],
  ["extensions", "Extensions", "boxes"],
  ["providers", "Providers", "key-round"],
  ["runtime", "Runtime", "refresh-cw"],
  ["data", "Data & Logs", "database"],
  ["about", "About", "info"],
];

function settingsRail() {
  return `<aside class="settings-rail" aria-label="Settings navigation">
    <header class="brand"><span class="brand-mark">${icon("panels-top-left")}</span><strong>Drycode</strong><span class="dev-badge">Dev</span></header>
    <div class="rail-heading">Settings</div>
    <nav class="section-nav">${navItems.map(([id, label, glyph]) => `<button class="${state.section === id ? "selected" : ""}" data-section="${id}" aria-current="${state.section === id ? "page" : "false"}">${icon(glyph)}<span>${label}</span>${id === "extensions" ? `<small>6</small>` : ""}</button>`).join("")}</nav>
    <span class="rail-spacer"></span>
    <section class="rail-runtime" aria-label="Runtime status"><div class="rail-runtime-head"><i class="status-dot"></i><span>Runtime Generation ${state.graphVersion}</span></div><p>UI + Harness · <code>Bridge healthy</code></p></section>
    <button class="back-chat" data-action="back-chat">${icon("message-square-code")}<span>Return to Starter Chat</span>${icon("chevron-right")}</button>
  </aside>`;
}

function pageHeader() {
  return `<header class="page-head"><div><span class="eyebrow">Drycode / Settings</span><h1>Settings</h1><p>Understand what owns each setting, contribution, and runtime boundary before you change it.</p></div><div class="page-head-actions"><button class="outline-button" data-action="validate-graph">${icon("shield-check")}Validate graph</button><button class="primary-button" data-action="reload">${icon("refresh-cw")}Reload runtime</button></div></header>
  <div class="ownership-key"><span class="key-label">Ownership</span><span class="owner-chip core"><i></i>Drycode / Core &amp; Runtime</span><span class="owner-chip shell"><i></i>Starter Chat / Shell</span><span class="owner-chip extension"><i></i>Extension-contributed</span></div>`;
}

function sectionTitle(glyph, title, description, meta = "") {
  return `<div class="section-title">${icon(glyph)}<div><h2>${title}</h2><p>${description}</p></div>${meta ? `<span class="title-meta">${meta}</span>` : ""}</div>`;
}

function overview() {
  return `<section class="settings-section" id="overview" data-page-section="overview">
    ${sectionTitle("layout-dashboard", "Overview", "The current Runtime Generation, Shell ownership, and contribution boundaries at a glance.", `<i class="status-dot"></i>All systems nominal`)}
    <div class="ownership-grid">
      <article class="ownership-card core"><header>${icon("boxes")}<div><h3>Drycode / Core &amp; Runtime</h3><p>Owns lifecycle and the host contracts.</p></div></header><div class="ownership-list"><div>${icon("git-branch")}<span>Extension Graph validation</span></div><div>${icon("refresh-cw")}<span>Runtime Generation lifecycle</span></div><div>${icon("radio-tower")}<span>UI-Harness Bridge</span></div></div><span class="owner-tag">Core-owned</span></article>
      <article class="ownership-card shell"><header>${icon("message-square-code")}<div><h3>Starter Chat / Shell</h3><p>Owns the root interface and composition.</p></div></header><div class="ownership-list"><div>${icon("panel-left")}<span>Active Shell Extension</span></div><div>${icon("monitor")}<span>UI entry point</span></div><div>${icon("terminal")}<span>Harness entry point</span></div></div><span class="owner-tag">Shell-owned</span></article>
      <article class="ownership-card extension"><header>${icon("puzzle")}<div><h3>Extension-contributed</h3><p>Owns values it contributes to service slots.</p></div></header><div class="ownership-list"><div>${icon("key-round")}<span>Provider authentication</span></div><div>${icon("wrench")}<span>Tools and Skills</span></div><div>${icon("plug")}<span>UI and Harness contributions</span></div></div><span class="owner-tag">Extension-owned</span></article>
    </div>
    <div class="health-row">
      <article class="card health-card"><i class="status-dot"></i><div><b>Extension Graph</b><small>${state.graphChecked ? "Validated just now" : "Valid · 6 extensions"}</small></div></article>
      <article class="card health-card"><i class="status-dot"></i><div><b>Runtime Generation</b><small>${state.graphVersion} · UI + Harness running</small></div></article>
      <article class="card health-card"><i class="status-dot"></i><div><b>UI-Harness Bridge</b><small>${state.bridge} · 0 rejected Calls</small></div></article>
    </div>
  </section>`;
}

function extensionCard(item) {
  const open = state.expandedExtensions.has(item.id);
  const shell = item.owner === "shell";
  const ext = item.owner === "extension";
  return `<article class="extension-card"><div class="extension-main"><span class="extension-mark ${shell ? "shell-mark" : ""} ${ext ? "provider-mark" : ""}">${icon(item.icon)}</span><div><h3>${escapeHtml(item.name)} <span class="muted">· ${escapeHtml(item.version)}</span></h3><p>${escapeHtml(item.description)}</p></div><div class="extension-badges"><span class="badge ${shell ? "shell" : ext ? "provider" : ""}">${escapeHtml(item.kind)}</span>${shell ? `<span class="badge valid">Active</span>` : ""}</div><button data-action="expand-extension" data-extension="${item.id}" aria-label="${open ? "Collapse" : "Expand"} ${escapeHtml(item.name)}">${icon(open ? "chevron-up" : "chevron-down")}</button></div>${open ? `<div class="extension-details"><div class="detail-columns"><div class="detail-block"><label>Entry points</label><code>UI · ${escapeHtml(item.ui)}</code><code>Harness · ${escapeHtml(item.harness)}</code></div><div class="detail-block"><label>Required dependencies</label><div class="dependency-list">${item.deps.map((dep) => `<span>${escapeHtml(dep)}</span>`).join("")}</div></div></div><div class="detail-block" style="margin-top:13px"><label>Manifest</label><code>${escapeHtml(item.manifest)}</code></div></div>` : ""}</article>`;
}

function extensions() {
  return `<section class="settings-section" id="extensions" data-page-section="extensions">
    ${sectionTitle("boxes", "Extensions", "The Extension Graph is resolved as a complete, deterministic set. Contributions are visible by owner.", `<i class="status-dot"></i>Valid graph`)}
    <div class="graph-banner">${icon("shield-check")}<div><b>Extension Graph valid</b><span>6 discovered · 6 resolved · no missing dependencies · generation ${state.graphVersion}</span></div><button data-action="validate-graph">${state.graphChecked ? "Checked" : "Check again"}</button></div>
    <div class="graph-path" aria-label="Resolved extension graph"><div class="graph-node"><header>${icon("boxes")}<b>Drycode Core</b></header><span class="node-kind">Host</span><small>Discovers and accepts the graph</small></div><div class="graph-node"><header>${icon("message-square-code")}<b>Starter Chat</b></header><span class="node-kind">Shell Extension</span><small>Effective base Shell provider</small></div><div class="graph-node"><header>${icon("cpu")}<b>Drycode Harness</b></header><span class="node-kind">Runtime</span><small>Harness Runtime contribution</small></div><div class="graph-node"><header>${icon("key-round")}<b>Provider extensions</b></header><span class="node-kind">Contributions</span><small>Model discovery and auth slots</small></div></div>
    <div class="extension-list">${EXTENSIONS.map(extensionCard).join("")}</div>
  </section>`;
}

function providers() {
  return `<section class="settings-section" id="providers" data-page-section="providers">
    ${sectionTitle("key-round", "Providers", "Each Model Provider extension owns its authentication, configuration, discovery, and response stream.")}
    <div class="provider-grid">${PROVIDERS.map((item) => { const data = state.providers[item.name]; return `<article class="card provider-card"><header><span class="provider-logo"><img src="${item.logo}" alt="${escapeHtml(item.name)} logo"></span><h3>${escapeHtml(item.name)}</h3><span class="provider-status">${data.ready ? "Ready" : "Needs auth"}</span></header><p>${escapeHtml(item.detail)}</p><span class="card-label">${escapeHtml(item.extension)}</span><small class="muted">${escapeHtml(item.models)}</small><footer><button class="outline-button" data-action="provider-config" data-provider="${escapeHtml(item.name)}">${icon("settings-2")}Configure</button><button class="quiet-button" data-action="provider-test" data-provider="${escapeHtml(item.name)}">${icon("activity")}Test</button></footer></article>`; }).join("")}</div>
    <div class="provider-note">${icon("info")}<span>Authentication is stored and resolved by the owning provider extension.</span></div>
  </section>`;
}

function runtime() {
  return `<section class="settings-section" id="runtime" data-page-section="runtime">
    ${sectionTitle("refresh-cw", "Runtime", "UI and Harness start, run, and stop together inside one supervised Runtime Generation.", `<i class="status-dot"></i>Running`)}
    <div class="runtime-summary"><article class="card runtime-card"><span class="card-label">Runtime Generation</span><span class="runtime-value">${state.graphVersion} <small>current</small></span><p>Resolved graph paired with UI and Harness runtimes.</p></article><article class="card runtime-card"><span class="card-label">UI Runtime</span><span class="runtime-value">Ready</span><p>Shell mounted · 6 UI entry points</p></article><article class="card runtime-card bridge-card"><span class="card-label">UI-Harness Bridge</span><span class="runtime-value">${state.bridge}</span><p>Generation-scoped · bidirectional</p></article></div>
    <div class="lifecycle" aria-label="Runtime lifecycle"><div class="lifecycle-step"><span class="step-line">${icon("search-check")}Graph resolved</span><small>14:32:08.401</small></div><div class="lifecycle-step"><span class="step-line">${icon("play-circle")}Generation started</span><small>14:32:08.622</small></div><div class="lifecycle-step active"><span class="step-line">${icon("radio-tower")}Bridge connected</span><small>Healthy now</small></div><div class="lifecycle-step"><span class="step-line">${icon("activity")}Serving</span><small>UI + Harness</small></div></div>
    <div class="reload-required">${icon("triangle-alert")}<div><b>Reload required for 2 pending changes</b><span>Provider manifest updates will apply to the next complete Runtime Generation.</span></div><button data-action="reload">Review &amp; reload</button></div>
  </section>`;
}

function dataLogs() {
  const logs = state.logFilter === "all" ? LOGS : LOGS.filter((log) => log.level === state.logFilter);
  return `<section class="settings-section" id="data" data-page-section="data">
    ${sectionTitle("database", "Data &amp; Logs", "Durable Drycode Home data, cached extensions, and diagnostics stay separate from Workspace data.")}
    <div class="grid two"><article><span class="card-label">Drycode Home</span><div class="home-card">${[["home", "Root", "~/.drycode/"], ["package", "Installed extensions", "~/.drycode/extensions/"], ["database", "Durable data", "~/.drycode/data/"], ["file-warning", "Logs & diagnostics", "~/.drycode/logs/"]].map(([glyph, label, path]) => `<div class="home-row">${icon(glyph)}<div><b>${label}</b><code>${path}</code></div><button data-action="copy-path" data-path="${escapeHtml(path)}" aria-label="Copy ${label} path" title="Copy path">${icon("copy")}</button></div>`).join("")}</div><div class="data-actions"><button class="outline-button" data-action="reveal-home">${icon("folder-open")}Reveal Drycode Home</button><button class="quiet-button" data-action="open-diagnostics">${icon("stethoscope")}Open diagnostics</button></div></article><article><span class="card-label">Recent diagnostics</span><div class="log-toolbar">${["all", "info", "warn"].map((filter) => `<button class="log-filter ${state.logFilter === filter ? "selected" : ""}" data-log-filter="${filter}">${filter === "all" ? "All events" : filter === "warn" ? "Warnings" : "Info"}</button>`).join("")}</div><div class="log-list">${logs.map((log) => `<div class="log-row"><time>${log.time}</time><span class="log-level ${log.level}">${log.level}</span><span class="log-source">${escapeHtml(log.source)}</span><span title="${escapeHtml(log.text)}">${escapeHtml(log.text)}</span></div>`).join("") || `<div class="log-row"><span></span><span class="log-level">—</span><span></span><span>No ${state.logFilter} events</span></div>`}</div></article></div>
  </section>`;
}

function about() {
  return `<section class="settings-section" id="about" data-page-section="about">
    ${sectionTitle("info", "About", "The vocabulary and boundaries behind this Drycode installation.")}
    <div class="about-grid"><article class="card about-card"><h3>Drycode</h3><p>A minimal, locally extensible AI coding application. Core provides the host; trusted Extensions compose the tool.</p><div class="about-facts"><div class="about-fact"><span>Desktop build</span><b>0.8.0-dev</b></div><div class="about-fact"><span>Runtime Generation</span><b>${state.graphVersion}</b></div><div class="about-fact"><span>Active Shell</span><b>Starter Chat 0.6.2</b></div></div></article><article class="card about-card"><h3>Reference</h3><div class="link-list"><button data-action="open-doc" data-doc="Extension Graph">${icon("book-open")}Extension Graph${icon("arrow-up-right")}</button><button data-action="open-doc" data-doc="Runtime boundaries">${icon("book-open")}Runtime boundaries${icon("arrow-up-right")}</button><button data-action="open-doc" data-doc="UI-Harness Bridge">${icon("book-open")}UI-Harness Bridge${icon("arrow-up-right")}</button></div></article></div>
  </section>`;
}

function modal() {
  if (!state.modal) return "";
  if (state.modal.type === "provider") {
    const item = provider(state.modal.provider);
    return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="provider-title"><div class="dialog-header"><span class="dialog-icon">${icon("key-round")}</span><div><span class="eyebrow">${escapeHtml(item.extension)}</span><h2 id="provider-title">Configure ${escapeHtml(item.name)}</h2><p>Provider-owned authentication and connection details.</p></div></div><div class="dialog-field"><label for="provider-endpoint">Endpoint</label><input id="provider-endpoint" value="https://api.${item.name.toLowerCase()}.com" /></div><div class="dialog-field"><label for="provider-key">API key</label><input id="provider-key" type="password" placeholder="Stored in the provider extension's keychain" /></div><div class="dialog-actions"><button class="quiet-button" data-action="close-modal">Cancel</button><button class="primary-button" data-action="save-provider" data-provider="${escapeHtml(item.name)}">${icon("save")}Save configuration</button></div></section></div>`;
  }
  if (state.modal.type === "reload") return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="reload-title"><div class="dialog-header"><span class="dialog-icon amber">${icon("refresh-cw")}</span><div><span class="eyebrow">Runtime lifecycle</span><h2 id="reload-title">Reload Runtime Generation?</h2><p>Apply pending extension and provider changes.</p></div></div><p>Drycode will stop the complete UI and Harness pair, then start generation ${state.graphVersion + 1}. Durable data remains in Drycode Home.</p><div class="reload-required">${icon("triangle-alert")}<div><b>Active Runs will be interrupted</b><span>The current generation is replaced as one unit.</span></div></div><div class="dialog-actions"><button class="quiet-button" data-action="close-modal">Cancel</button><button class="danger-button" data-action="confirm-reload">${icon("refresh-cw")}Reload generation</button></div></section></div>`;
  return `<div class="modal-shade"><section class="dialog" role="dialog" aria-modal="true"><div class="dialog-header"><span class="dialog-icon">${icon("refresh-cw")}</span><div><span class="eyebrow">Runtime lifecycle</span><h2>Starting Generation ${state.graphVersion + 1}</h2><p>Composing UI and Harness with the validated graph.</p></div></div><p>Connecting the UI-Harness Bridge and mounting the active Shell Extension.</p><div class="progress-track"><i></i></div></section></div>`;
}

function render() {
  const content = `<div class="settings-main" id="settings-main"><div class="settings-content">${pageHeader()}${overview()}${extensions()}${providers()}${runtime()}${dataLogs()}${about()}</div></div>`;
  document.querySelector("#app").innerHTML = `<div class="app-frame">${topbar()}<div class="settings-layout">${settingsRail()}${content}</div></div>${modal()}${state.toast ? `<div class="toast" role="status">${icon("info")}<span>${escapeHtml(state.toast)}</span></div>` : ""}`;
  if (window.lucide) window.lucide.createIcons();
  bind();
}

function showToast(text) {
  window.clearTimeout(state.toastTimer);
  state.toast = text;
  render();
  state.toastTimer = window.setTimeout(() => { state.toast = ""; render(); }, 2100);
}

function goToSection(section) {
  state.section = section;
  render();
  requestAnimationFrame(() => document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" }));
}

function copyText(text) {
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {});
  showToast(`Copied ${text}`);
}

function confirmReload() {
  state.modal = { type: "reloading" };
  render();
  window.setTimeout(() => {
    state.graphVersion += 1;
    state.bridge = "Healthy";
    state.modal = null;
    showToast(`Runtime Generation ${state.graphVersion} is running`);
  }, 1300);
}

function bind() {
  document.querySelectorAll("[data-section]").forEach((element) => element.addEventListener("click", () => goToSection(element.dataset.section)));
  document.querySelectorAll("[data-log-filter]").forEach((element) => element.addEventListener("click", () => { state.logFilter = element.dataset.logFilter; render(); }));
  document.querySelectorAll("[data-action]").forEach((element) => element.addEventListener("click", () => {
    const action = element.dataset.action;
    if (action === "back-chat") return showToast("Starter Chat would open here");
    if (action === "reload") { state.modal = { type: "reload" }; return render(); }
    if (action === "close-modal") { state.modal = null; return render(); }
    if (action === "confirm-reload") return confirmReload();
    if (action === "validate-graph") { state.graphChecked = true; return showToast("Extension Graph is valid"); }
    if (action === "expand-extension") { const id = element.dataset.extension; state.expandedExtensions.has(id) ? state.expandedExtensions.delete(id) : state.expandedExtensions.add(id); return render(); }
    if (action === "provider-config") { state.modal = { type: "provider", provider: element.dataset.provider }; return render(); }
    if (action === "provider-test") { return showToast(`${element.dataset.provider} provider handshake passed`); }
    if (action === "save-provider") { state.providers[element.dataset.provider].ready = true; state.providers[element.dataset.provider].detail = "Keychain · saved just now"; state.modal = null; return showToast(`${element.dataset.provider} configuration saved`); }
    if (action === "copy-path") return copyText(element.dataset.path);
    if (action === "reveal-home") return showToast("Drycode Home opened in Explorer");
    if (action === "open-diagnostics") return showToast("Diagnostics bundle is ready to inspect");
    if (action === "open-doc") return showToast(`${element.dataset.doc} reference opened`);
    render();
  }));
  document.querySelectorAll("[data-dismiss]").forEach((shade) => shade.addEventListener("click", (event) => { if (event.target === shade) { state.modal = null; render(); } }));
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.modal) { state.modal = null; render(); }
});

render();
