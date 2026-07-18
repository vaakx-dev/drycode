const state = {
  workspace: { name: "drycode", path: "D:\\work\\drycode" },
  workspaces: [
    { name: "drycode", path: "D:\\work\\drycode" },
    { name: "agent-lab", path: "D:\\work\\agent-lab" },
    { name: "docs", path: "D:\\work\\docs" },
    { name: "sandbox", path: "D:\\work\\sandbox" },
  ],
  workspaceFilter: "all",
  workspaceScroll: 0,
  sidebarCollapsed: false,
  railMenu: null,
  page: "chat",
  settingsSection: "general",
  settingsProvider: null,
  composerMenu: null,
  providerView: "Anthropic",
  providerConfig: { Anthropic: "Environment", OpenAI: "Windows Credential Manager", Google: null },
  preferences: { enterToSend: true, expandTools: false },
  model: { provider: "Anthropic", name: "Claude Sonnet 4", ready: true },
  thinking: "High",
  activeSession: "contract",
  running: true,
  stage: "Reading Workspace context",
  modal: null,
  draft: "",
  toast: "",
  runTimer: null,
  toastTimer: null,
  sessions: [
    {
      id: "contract",
      workspace: "drycode",
      active: true,
      running: true,
      title: "Shape the starter chat",
      summary: "Map the smallest useful Windows surface",
      time: "Now",
      messages: [
        { role: "user", text: "What does the starter chat need to make visible?" },
        { role: "assistant", text: "Workspace, durable Sessions, the selected Model, and a clear view of each Run. I will keep the surface focused on asking Drycode to work and watching what it does." },
      ],
      tools: [
        { name: "session_lookup", detail: "Durable Session record", status: "completed", output: "Session contract | 12 records" },
        { name: "workspace_scan", detail: "Workspace context", status: "running", output: "Reading workspace context..." },
      ],
    },
    {
      id: "harness",
      workspace: "drycode",
      active: false,
      running: false,
      title: "Extract the Harness",
      summary: "Compare runtime boundaries and hand-offs",
      time: "2h",
      messages: [{ role: "assistant", text: "A durable Session remains linear and can have at most one active Run." }],
      tools: [{ name: "read", detail: "Runtime notes", status: "completed", output: "Read 24 lines" }],
    },
    {
      id: "installer",
      workspace: "agent-lab",
      active: true,
      running: true,
      title: "Plan the Windows install",
      summary: "Stopped after comparing package formats",
      time: "Fri",
      messages: [{ role: "user", text: "Keep the first install experience small and understandable." }],
      tools: [],
    },
    {
      id: "recovery",
      workspace: "agent-lab",
      active: false,
      running: false,
      title: "Recovery surface notes",
      summary: "Capture what remains available during Reload",
      time: "Mon",
      messages: [{ role: "assistant", text: "Reload replaces the Runtime Generation while the desktop window stays open." }],
      tools: [],
    },
  ],
};

const MODEL_PROVIDERS = [
  { name: "Anthropic", icon: "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg@latest/icons/anthropic.svg", models: ["Claude Sonnet 4", "Claude Opus 4", "Claude Haiku 3.5"] },
  { name: "OpenAI", icon: "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg@latest/icons/openai.svg", models: ["GPT-5", "o3"] },
  { name: "Google", icon: "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg@latest/icons/google.svg", models: ["Gemini 2.5 Pro", "Gemini 2.5 Flash"] },
];
const THINKING_LEVELS = ["Off", "Low", "Medium", "High"];
const INSTALLED_EXTENSIONS = [
  { name: "Starter Shell", id: "vaakx.starter-shell", version: "0.6.2", role: "UI · Shell", icon: "panel-top" },
  { name: "Starter Sessions", id: "vaakx.starter-sessions", version: "0.6.2", role: "UI · Harness", icon: "messages-square" },
  { name: "Workspace Tools", id: "vaakx.workspace-tools", version: "0.4.1", role: "Harness", icon: "wrench" },
  { name: "Anthropic Provider", id: "vaakx.anthropic", version: "0.3.0", role: "Harness", icon: "blocks" },
  { name: "OpenAI Provider", id: "vaakx.openai", version: "0.3.0", role: "Harness", icon: "blocks" },
  { name: "Google Provider", id: "vaakx.google", version: "0.2.4", role: "Harness", icon: "blocks" },
];
const SETTINGS_SECTIONS = [
  ["general", "General", "settings-2"],
  ["extensions", "Extensions", "blocks"],
  ["providers", "Providers", "key-round"],
  ["data", "Data", "database"],
];

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const icon = (name, label = "") => `<i data-lucide="${name}"${label ? ` aria-label="${label}"` : ""}></i>`;
const activeSession = () => state.sessions.find((session) => session.id === state.activeSession) || state.sessions[0];
const activeTools = () => activeSession().tools;
const visibleSessions = () => state.workspaceFilter === "all" ? state.sessions : state.sessions.filter((session) => session.workspace === state.workspaceFilter);

function topbar() {
  return `<header class="topbar">
    <button class="topbar-collapse" data-action="collapse-sidebar" aria-label="${state.sidebarCollapsed ? "Expand" : "Collapse"} sidebar">${icon(state.sidebarCollapsed ? "panel-left-open" : "panel-left-close")}</button>
    <span class="window-drag"></span>
    <div class="window-controls" aria-label="Window controls"><button aria-label="Minimize">${icon("minus")}</button><button aria-label="Maximize">${icon("square")}</button><button aria-label="Close">${icon("x")}</button></div>
  </header>`;
}

function messageStream() {
  const messages = activeSession().messages.map((message) => `<article class="message ${message.role}"><p>${escapeHtml(message.text)}</p></article>`).join("");
  return `<div class="message-stream">${messages || `<div class="empty-message">${icon("message-circle")}<b>Start this Session</b><span>Ask Drycode to work in ${escapeHtml(state.workspace.name)}.</span></div>`}<section class="inline-tools" aria-label="Tool activity"><div class="section-kicker"><span>${icon("wrench")}Tool activity</span><span class="muted">${activeTools().length} events</span></div>${toolCards()}</section></div>`;
}

function toolCards() {
  if (!activeTools().length) return `<div class="no-activity">No Tool activity yet.</div>`;
  return activeTools().map((tool) => `<details class="tool-card" ${tool.status === "running" || state.preferences.expandTools ? "open" : ""}>
    <summary><span class="tool-mark ${tool.status}">${icon(tool.status === "running" ? "loader-circle" : "circle-check")}</span><b>${escapeHtml(tool.name)}</b><span class="tool-detail">${escapeHtml(tool.detail)}</span><span class="tool-status ${tool.status}">${tool.status === "running" ? "Running" : "Completed"}</span>${icon("chevron-down", "Toggle tool output")}</summary>
    <pre>${escapeHtml(tool.output)}</pre>
  </details>`).join("");
}

function modelPicker() {
  const provider = MODEL_PROVIDERS.find((item) => item.name === state.providerView) || MODEL_PROVIDERS[0];
  return `<section class="model-picker" aria-label="Select model">
    <aside class="provider-list"><span>Providers</span>${MODEL_PROVIDERS.map((item) => `<button type="button" class="${item.name === provider.name ? "selected" : ""}" data-provider-option="${escapeHtml(item.name)}"><img src="${item.icon}" alt=""><span>${escapeHtml(item.name)}</span></button>`).join("")}</aside>
    <div class="model-list"><span>${escapeHtml(provider.name)} models</span>${provider.models.map((model) => `<button type="button" class="${state.model.provider === provider.name && state.model.name === model ? "selected" : ""}" data-model-option="${escapeHtml(model)}" data-model-provider="${escapeHtml(provider.name)}"><span>${escapeHtml(model)}</span>${state.model.provider === provider.name && state.model.name === model ? icon("check") : ""}</button>`).join("")}</div>
  </section>`;
}

function thinkingPicker() {
  return `<section class="thinking-picker" aria-label="Select thinking level"><span>Thinking level</span>${THINKING_LEVELS.map((level) => `<button type="button" class="${state.thinking === level ? "selected" : ""}" data-thinking-option="${level}"><span>${level}</span>${state.thinking === level ? icon("check") : ""}</button>`).join("")}</section>`;
}

function composer() {
  return `<form class="composer" data-composer>
    <textarea aria-label="Message" placeholder="Message Drycode in this Session...">${escapeHtml(state.draft)}</textarea>
    <div class="composer-bar">
      <div class="composer-control model-control"><button type="button" class="composer-select" data-action="toggle-model" aria-expanded="${state.composerMenu === "model"}"><span>${escapeHtml(state.model.name)}</span>${icon("chevron-down")}</button>${state.composerMenu === "model" ? modelPicker() : ""}</div>
      <div class="composer-control thinking-control"><button type="button" class="composer-select" data-action="toggle-thinking" aria-expanded="${state.composerMenu === "thinking"}"><span>${escapeHtml(state.thinking)}</span>${icon("chevron-down")}</button>${state.composerMenu === "thinking" ? thinkingPicker() : ""}</div>
      <span class="grow"></span>${state.running ? `<button type="button" class="interrupt-button" data-action="interrupt" aria-label="Interrupt" title="Interrupt">${icon("square")}</button>` : `<button type="submit" class="send-button" data-action="send" aria-label="Send" title="Send">${icon("arrow-up")}</button>`}
    </div>
  </form>`;
}

function settingRow(iconName, title, detail, action = "") {
  return `<article class="setting-row"><span class="setting-mark">${icon(iconName)}</span><span><b>${title}</b><small>${detail}</small></span>${action}</article>`;
}

function generalSettings() {
  return `<section class="settings-group"><header><h2>Chat behavior</h2><p>Preferences owned by the Starter Shell.</p></header><div class="setting-list">
    ${settingRow("corner-down-left", "Enter sends messages", "Use Shift Enter for a new line.", `<button class="setting-switch ${state.preferences.enterToSend ? "selected" : ""}" data-preference="enterToSend" aria-pressed="${state.preferences.enterToSend}" aria-label="Toggle Enter to send"><i></i></button>`)}
    ${settingRow("wrench", "Expand Tool activity", "Open completed Tool results in the transcript.", `<button class="setting-switch ${state.preferences.expandTools ? "selected" : ""}" data-preference="expandTools" aria-pressed="${state.preferences.expandTools}" aria-label="Toggle expanded Tool activity"><i></i></button>`)}
  </div></section><section class="settings-group"><header><h2>Runtime</h2><p>Changes to installed Extensions apply after Reload.</p></header><div class="setting-list">${settingRow("refresh-cw", "Runtime Generation", "Running · durable Sessions remain available after Reload.", `<button data-action="reload">Reload</button>`)}</div></section>`;
}

function extensionSettings() {
  return `<section class="settings-group"><header class="settings-group-heading"><div><h2>Installed Extensions</h2><p>Drycode loads one complete Extension Graph from this folder.</p></div><button data-action="open-path" data-path="~/.drycode/extensions/">${icon("folder-open")}Open folder</button></header><div class="extension-settings-list">${INSTALLED_EXTENSIONS.map((extension) => `<article class="extension-setting-row"><span class="setting-mark">${icon(extension.icon)}</span><span><b>${escapeHtml(extension.name)}</b><small>${escapeHtml(extension.id)}</small></span><span class="extension-role">${escapeHtml(extension.role)}</span><time>v${escapeHtml(extension.version)}</time></article>`).join("")}</div><p class="settings-note">Installed Extensions are fully trusted. Adding or removing a package requires Reload and Drycode accepts or rejects the resulting graph as a whole.</p></section>`;
}

function providerSettings() {
  return `<section class="settings-group"><header><h2>Model Providers</h2><p>Provider Extensions own credentials and model discovery. Select a model in the composer.</p></header><div class="provider-settings-list">${MODEL_PROVIDERS.map((provider) => {
    const configured = Boolean(state.providerConfig[provider.name]);
    return `<article class="provider-setting-row"><span class="provider-mark"><img src="${provider.icon}" alt=""></span><span><b>${escapeHtml(provider.name)}</b><small>${configured ? escapeHtml(state.providerConfig[provider.name]) : "No credential configured"}</small></span><strong class="${configured ? "" : "attention"}">${configured ? "Configured" : "Needs setup"}</strong><button data-settings-provider="${escapeHtml(provider.name)}">Configure</button></article>`;
  }).join("")}</div></section>`;
}

function dataSettings() {
  const paths = [
    ["folder", "Drycode Home", "~/.drycode/"],
    ["messages-square", "Sessions", "~/.drycode/sessions/"],
    ["scroll-text", "Logs", "~/.drycode/logs/"],
  ];
  return `<section class="settings-group"><header><h2>Local Data</h2><p>Open Drycode-owned data on this computer.</p></header><div class="setting-list">${paths.map(([glyph, title, path]) => settingRow(glyph, title, path, `<button data-action="open-path" data-path="${path}">Open</button>`)).join("")}${settingRow("archive", "Extension cache", "~/.drycode/cache/ · disposable data", `<button data-action="clear-cache">Clear</button>`)}</div></section>`;
}

function settingsPage() {
  const pages = { general: generalSettings, extensions: extensionSettings, providers: providerSettings, data: dataSettings };
  const section = SETTINGS_SECTIONS.find(([id]) => id === state.settingsSection) || SETTINGS_SECTIONS[0];
  return `<main class="settings-page"><header class="settings-heading"><span class="eyebrow">Settings</span><h1>${section[1]}</h1></header>${(pages[section[0]] || generalSettings)()}</main>`;
}

function featuredSessionCard(session) {
  const selected = session.id === state.activeSession;
  const running = session.running;
  return `<button class="featured-session ${selected ? "selected" : ""}" data-session="${session.id}">
    <span class="featured-meta"><span class="session-source">${icon("message-square-code")}<b>${escapeHtml(session.workspace)}</b></span><time>${session.time}</time></span>
    <strong>${escapeHtml(session.title)}</strong>
    <span class="featured-status"><b class="${running ? "running" : ""}">${running ? "Running" : "Active"}</b><span>${escapeHtml(selected && running ? state.stage : session.summary)}</span>${icon(running ? "loader-circle" : "circle")}</span>
  </button>`;
}

function settledSessionRow(session) {
  return `<button class="settled-session ${session.id === state.activeSession ? "selected" : ""}" data-session="${session.id}">
    ${icon("message-square")}<span>${escapeHtml(session.title)}</span><time>${session.time}</time>
  </button>`;
}

function railFlyout(sessions) {
  if (state.railMenu === "workspaces") return `<section class="rail-flyout workspace-flyout" aria-label="Workspaces">
    <header><strong>Workspaces</strong><button data-action="choose-folder" aria-label="Add Workspace" title="Add Workspace">${icon("plus")}</button></header>
    <div class="rail-list"><button class="${state.workspaceFilter === "all" ? "selected" : ""}" data-workspace-filter="all">${icon("folders")}<span>All Workspaces</span>${state.workspaceFilter === "all" ? icon("check") : ""}</button>${state.workspaces.map((workspace) => `<button class="${state.workspaceFilter === workspace.name ? "selected" : ""}" data-workspace-filter="${escapeHtml(workspace.name)}">${icon("folder")}<span>${escapeHtml(workspace.name)}</span>${state.workspaceFilter === workspace.name ? icon("check") : ""}</button>`).join("")}</div>
  </section>`;

  if (state.railMenu === "sessions") {
    const active = sessions.filter((session) => session.active);
    const settled = sessions.filter((session) => !session.active);
    return `<section class="rail-flyout session-flyout" aria-label="Sessions"><header><strong>Sessions</strong><button data-action="new-session" aria-label="New Session" title="New Session">${icon("plus")}</button></header><div class="rail-list">${active.map((session) => `<button class="${session.id === state.activeSession ? "selected" : ""}" data-session="${session.id}">${icon(session.running ? "loader-circle" : "message-square")}<span>${escapeHtml(session.title)}</span><small>${escapeHtml(session.workspace)}</small></button>`).join("")}${settled.length ? `<span class="rail-list-heading">Settled</span>${settled.map((session) => `<button class="${session.id === state.activeSession ? "selected" : ""}" data-session="${session.id}">${icon("message-square")}<span>${escapeHtml(session.title)}</span><small>${session.time}</small></button>`).join("")}` : ""}</div></section>`;
  }

  return "";
}

function navigationView() {
  const sessions = visibleSessions();
  const featured = sessions.filter((session) => session.active);
  const settled = sessions.filter((session) => !session.active);
  const sessionNavigation = state.sidebarCollapsed
    ? `<div class="rail-navigation">
        <button class="rail-button ${state.railMenu === "workspaces" ? "selected" : ""}" data-action="rail-workspaces" aria-label="Workspaces. Current filter: ${escapeHtml(state.workspaceFilter)}" title="Workspaces: ${escapeHtml(state.workspaceFilter)}" aria-expanded="${state.railMenu === "workspaces"}">${icon("folders")}</button>
        <button class="rail-button ${state.page === "chat" || state.railMenu === "sessions" ? "selected" : ""}" data-action="rail-sessions" aria-label="Sessions. Current: ${escapeHtml(activeSession().title)}" title="Sessions: ${escapeHtml(activeSession().title)}" aria-expanded="${state.railMenu === "sessions"}">${icon("messages-square")}<small>${featured.length}</small></button>
        ${railFlyout(sessions)}
      </div>`
    : `<div class="workspace-tabs">
        <button class="all-workspaces ${state.workspaceFilter === "all" ? "selected" : ""}" data-workspace-filter="all">All</button>
        ${state.workspaces.map((workspace) => `<button class="${state.workspaceFilter === workspace.name ? "selected" : ""}" data-workspace-filter="${escapeHtml(workspace.name)}">${icon("folder")}<span>${escapeHtml(workspace.name)}</span></button>`).join("")}
        <button class="add-workspace" data-action="choose-folder" aria-label="Add Workspace" title="Add Workspace">${icon("plus")}</button>
      </div>
      <div class="sidebar-sessions">
        <div class="featured-sessions">${featured.map(featuredSessionCard).join("")}</div>
        <div class="settled-heading"><span>Settled</span><i></i></div>
        <div class="settled-sessions">${settled.map(settledSessionRow).join("")}</div>
      </div>`;
  return `<nav class="navigation-view ${state.sidebarCollapsed ? "collapsed" : ""}" aria-label="Drycode navigation">
    <header class="sidebar-brand"><span class="sidebar-logo" title="Drycode">${icon("panels-top-left")}</span><strong>Drycode</strong><span class="dev-badge">Dev</span></header>
    <div class="sidebar-actions">
      <button data-action="search" aria-label="Search" title="Search">${icon("search")}<span>Search</span><kbd>Ctrl K</kbd></button>
      <button data-action="new-session" aria-label="New Session" title="New Session">${icon("plus")}<span>New Session</span><kbd>Ctrl Shift O</kbd></button>
    </div>
    ${sessionNavigation}
    <footer class="sidebar-footer"><button class="${state.page === "settings" ? "selected" : ""}" data-action="settings" aria-label="Settings" title="Settings" ${state.page === "settings" ? "aria-current=\"page\"" : ""}>${icon("settings")}<span>Settings</span></button><button class="sidebar-icon" data-action="reload" aria-label="Reload Runtime" title="Reload Runtime">${icon("refresh-cw")}</button></footer>
  </nav>`;
}

function settingsNavigation() {
  return `<nav class="navigation-view settings-navigation ${state.sidebarCollapsed ? "collapsed" : ""}" aria-label="Settings navigation">
    <header class="sidebar-brand"><span class="sidebar-logo" title="Drycode">${icon("panels-top-left")}</span><strong>Drycode</strong><span class="dev-badge">Dev</span></header>
    <span class="settings-nav-label">Settings</span>
    <div class="settings-nav">${SETTINGS_SECTIONS.map(([id, label, glyph]) => `<button class="${state.settingsSection === id ? "selected" : ""}" data-settings-section="${id}" aria-label="${label}" title="${label}" ${state.settingsSection === id ? "aria-current=\"page\"" : ""}>${icon(glyph)}<span>${label}</span></button>`).join("")}</div>
    <footer class="settings-sidebar-footer"><button data-action="back-chat" aria-label="Back to chat" title="Back to chat">${icon("arrow-left")}<span>Back to chat</span></button><button class="sidebar-icon" data-action="reload" aria-label="Reload Runtime" title="Reload Runtime">${icon("refresh-cw")}</button></footer>
  </nav>`;
}

function providerSettingsModal() {
  const provider = MODEL_PROVIDERS.find((item) => item.name === state.settingsProvider) || MODEL_PROVIDERS[0];
  const value = state.providerConfig[provider.name] || "";
  return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="provider-settings-title"><div class="dialog-title"><span class="dialog-icon"><img src="${provider.icon}" alt=""></span><div><span class="eyebrow">Model Provider</span><h2 id="provider-settings-title">Configure ${escapeHtml(provider.name)}</h2></div></div><p>The ${escapeHtml(provider.name)} Extension owns credential resolution and model discovery.</p><label class="form-field">Credential reference<input id="provider-credential" value="${escapeHtml(value)}" placeholder="Environment or Windows Credential Manager"></label><div class="dialog-actions"><button class="plain-button" data-action="close-modal">Cancel</button><button data-action="save-provider">Save</button></div></section></div>`;
}

function modal() {
  if (!state.modal) return "";
  if (state.modal === "provider") return providerSettingsModal();
  if (state.modal === "reload") return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="reload-title"><div class="dialog-title"><span class="dialog-icon amber">${icon("refresh-cw")}</span><div><span class="eyebrow">Runtime lifecycle</span><h2 id="reload-title">Reload the Runtime?</h2></div></div><p>Drycode will stop the complete UI and Harness Runtime Generation, then start a fresh generation. Durable Sessions remain available.</p><div class="reload-note">${icon("triangle-alert")}<span>Active work will be interrupted. Your Session record stays safe.</span></div><div class="dialog-actions"><button class="plain-button" data-action="close-modal">Cancel</button><button class="danger-button" data-action="confirm-reload">${icon("refresh-cw")}<span>Reload Drycode</span></button></div></section></div>`;
  return `<div class="modal-shade"><section class="dialog reload-progress" role="dialog" aria-modal="true"><span class="dialog-icon amber">${icon("refresh-cw")}</span><span class="eyebrow">Runtime lifecycle</span><h2>Reloading Runtime...</h2><p>Stopping the current generation and starting a fresh UI and Harness pair.</p><div class="progress-track"><i></i></div><small>Starting Runtime Generation 19</small></section></div>`;
}

function render() {
  const inSettings = state.page === "settings";
  const content = inSettings ? settingsPage() : `<main class="chat-column">${messageStream()}${composer()}</main>`;
  const navigation = inSettings ? settingsNavigation() : navigationView();
  document.querySelector("#app").innerHTML = `<div class="app-frame">${topbar()}<div class="nav-layout ${state.sidebarCollapsed ? "sidebar-collapsed" : ""}">${navigation}${content}</div></div>${modal()}${state.toast ? `<div class="toast" role="status">${icon("info")}<span>${escapeHtml(state.toast)}</span></div>` : ""}`;
  if (window.lucide) window.lucide.createIcons();
  bind();
}

function showToast(text) {
  window.clearTimeout(state.toastTimer);
  state.toast = text;
  render();
  state.toastTimer = window.setTimeout(() => { state.toast = ""; render(); }, 1800);
}

function selectSession(id) {
  window.clearTimeout(state.runTimer);
  const session = state.sessions.find((item) => item.id === id);
  state.activeSession = id;
  state.page = "chat";
  state.composerMenu = null;
  state.railMenu = null;
  state.modal = null;
  state.running = session?.running ?? false;
  state.stage = state.running ? "Run active" : "Ready";
  render();
}

function newSession() {
  const id = `session-${state.sessions.length + 1}`;
  const workspace = state.workspaceFilter === "all" ? state.workspace.name : state.workspaceFilter;
  state.sessions.unshift({ id, workspace, active: true, running: false, title: "Untitled Session", summary: "No messages yet", time: "Now", messages: [], tools: [] });
  state.activeSession = id;
  state.page = "chat";
  state.composerMenu = null;
  state.railMenu = null;
  state.running = false;
  state.draft = "";
  state.modal = null;
  render();
}

async function chooseWorkspace() {
  try {
    if (window.showDirectoryPicker) {
      const directory = await window.showDirectoryPicker();
      const workspace = { name: directory.name, path: directory.name };
      if (!state.workspaces.some((item) => item.name === workspace.name)) state.workspaces.push(workspace);
      state.workspace = workspace;
      state.workspaceFilter = workspace.name;
      state.page = "chat";
      state.composerMenu = null;
      state.railMenu = null;
      render();
      return;
    }

    const picker = document.createElement("input");
    picker.type = "file";
    picker.webkitdirectory = true;
    picker.addEventListener("change", () => {
      const first = picker.files?.[0];
      if (!first) return;
      const name = first.webkitRelativePath.split("/")[0];
      const workspace = { name, path: name };
      if (!state.workspaces.some((item) => item.name === name)) state.workspaces.push(workspace);
      state.workspace = workspace;
      state.workspaceFilter = name;
      state.page = "chat";
      state.composerMenu = null;
      state.railMenu = null;
      render();
    });
    picker.click();
  } catch (error) {
    if (error?.name !== "AbortError") showToast("The folder picker could not open");
  }
}

function filterWorkspace(name) {
  state.workspaceFilter = name;
  state.page = "chat";
  state.composerMenu = null;
  state.railMenu = null;
  const workspace = state.workspaces.find((item) => item.name === name);
  if (workspace) state.workspace = workspace;
  const sessions = visibleSessions();
  if (sessions.length && !sessions.some((session) => session.id === state.activeSession)) state.activeSession = sessions[0].id;
  render();
}

function completeRun() {
  const session = activeSession();
  session.tools = session.tools.map((tool) => tool.status === "running" ? { ...tool, status: "completed", output: "Workspace context ready\nRun completed successfully." } : tool);
  session.messages.push({ role: "assistant", text: "Workspace context is ready. The Tool result is attached to this Run." });
  session.active = false;
  session.running = false;
  state.running = false;
  state.stage = "Run completed";
  render();
}

function send() {
  const text = state.draft.trim();
  if (!text || state.running) return;
  const session = activeSession();
  session.messages.push({ role: "user", text });
  session.messages.push({ role: "assistant", text: "I will inspect the Workspace and report each Tool as it runs." });
  session.tools.push({ name: "workspace_scan", detail: "Workspace context", status: "running", output: "Inspecting Workspace..." });
  session.summary = text;
  session.active = true;
  session.running = true;
  state.draft = "";
  state.running = true;
  state.stage = "Inspecting Workspace";
  render();
  state.runTimer = window.setTimeout(completeRun, 3500);
}

function interrupt() {
  window.clearTimeout(state.runTimer);
  const session = activeSession();
  state.running = false;
  session.active = false;
  session.running = false;
  state.stage = "Interrupted by user";
  session.tools = session.tools.map((tool) => tool.status === "running" ? { ...tool, status: "completed", output: `${tool.output}\nRun interrupted by user.` } : tool);
  session.messages.push({ role: "assistant", text: "Run interrupted. Completed messages and Tool results remain in this Session." });
  render();
}

function confirmReload() {
  window.clearTimeout(state.runTimer);
  state.modal = "reloading";
  render();
  window.setTimeout(() => {
    state.modal = null;
    state.running = false;
    state.stage = "Ready after Reload";
    activeSession().active = false;
    activeSession().running = false;
    activeTools().forEach((tool) => { tool.status = "completed"; });
    render();
    showToast("Runtime Generation reloaded");
  }, 1400);
}

function bind() {
  document.querySelectorAll("[data-action]").forEach((element) => element.addEventListener("click", (event) => {
    const action = element.dataset.action;
    if (action === "send") event.preventDefault();
    if (action === "reload") { state.modal = action; state.railMenu = null; }
    if (action === "close-modal") { state.modal = null; state.settingsProvider = null; }
    if (action === "settings") {
      state.page = "settings";
      state.settingsSection = "general";
      state.composerMenu = null;
      state.railMenu = null;
      return render();
    }
    if (action === "back-chat") {
      state.page = "chat";
      state.modal = null;
      return render();
    }
    if (action === "open-path") return showToast(`Opening ${element.dataset.path}`);
    if (action === "clear-cache") return showToast("Extension cache cleared");
    if (action === "save-provider") {
      const value = document.querySelector("#provider-credential")?.value.trim();
      state.providerConfig[state.settingsProvider] = value || null;
      state.modal = null;
      state.settingsProvider = null;
      return showToast("Provider configuration saved");
    }
    if (action === "rail-workspaces") {
      state.railMenu = state.railMenu === "workspaces" ? null : "workspaces";
      return render();
    }
    if (action === "rail-sessions") {
      state.railMenu = state.railMenu === "sessions" ? null : "sessions";
      return render();
    }
    if (action === "toggle-model") {
      state.providerView = state.model.provider;
      state.composerMenu = state.composerMenu === "model" ? null : "model";
      return render();
    }
    if (action === "toggle-thinking") {
      state.composerMenu = state.composerMenu === "thinking" ? null : "thinking";
      return render();
    }
    if (action === "new-session") return newSession();
    if (action === "interrupt") return interrupt();
    if (action === "send") return send();
    if (action === "choose-folder") return chooseWorkspace();
    if (action === "search") { state.railMenu = null; return showToast("Session search would open here"); }
    if (action === "collapse-sidebar") {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      state.railMenu = null;
      return render();
    }
    if (action === "confirm-reload") return confirmReload();
    render();
  }));
  document.querySelectorAll("[data-session]").forEach((element) => element.addEventListener("click", () => selectSession(element.dataset.session)));
  document.querySelectorAll("[data-settings-section]").forEach((element) => element.addEventListener("click", () => {
    state.settingsSection = element.dataset.settingsSection;
    render();
  }));
  document.querySelectorAll("[data-settings-provider]").forEach((element) => element.addEventListener("click", () => {
    state.settingsProvider = element.dataset.settingsProvider;
    state.modal = "provider";
    render();
  }));
  document.querySelectorAll("[data-preference]").forEach((element) => element.addEventListener("click", () => {
    const preference = element.dataset.preference;
    state.preferences[preference] = !state.preferences[preference];
    render();
  }));
  document.querySelectorAll("[data-workspace-filter]").forEach((element) => element.addEventListener("click", () => filterWorkspace(element.dataset.workspaceFilter)));
  document.querySelectorAll("[data-provider-option]").forEach((element) => element.addEventListener("click", () => {
    state.providerView = element.dataset.providerOption;
    render();
  }));
  document.querySelectorAll("[data-model-option]").forEach((element) => element.addEventListener("click", () => {
    state.model = { provider: element.dataset.modelProvider, name: element.dataset.modelOption, ready: true };
    state.composerMenu = null;
    render();
  }));
  document.querySelectorAll("[data-thinking-option]").forEach((element) => element.addEventListener("click", () => {
    state.thinking = element.dataset.thinkingOption;
    state.composerMenu = null;
    render();
  }));
  const workspaceTabs = document.querySelector(".workspace-tabs");
  if (workspaceTabs) {
    workspaceTabs.scrollLeft = state.workspaceScroll;
    workspaceTabs.addEventListener("scroll", () => { state.workspaceScroll = workspaceTabs.scrollLeft; });
    workspaceTabs.addEventListener("wheel", (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      workspaceTabs.scrollLeft += event.deltaY;
    }, { passive: false });
  }
  document.querySelectorAll("textarea").forEach((textarea) => {
    textarea.addEventListener("input", () => { state.draft = textarea.value; });
    textarea.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey && state.preferences.enterToSend) { event.preventDefault(); state.draft = textarea.value; send(); }
    });
  });
  document.querySelectorAll("[data-composer]").forEach((form) => form.addEventListener("submit", (event) => { event.preventDefault(); send(); }));
  document.querySelector(".chat-column")?.addEventListener("click", (event) => {
    if (state.composerMenu && !event.target.closest(".composer-control")) {
      state.composerMenu = null;
      render();
    }
  });
  document.querySelector(".nav-layout")?.addEventListener("click", (event) => {
    if (state.railMenu && !event.target.closest(".rail-navigation")) {
      state.railMenu = null;
      render();
    }
  });
  document.querySelectorAll(".modal-shade[data-dismiss]").forEach((shade) => shade.addEventListener("click", (event) => { if (event.target === shade) { state.modal = null; state.settingsProvider = null; render(); } }));
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && (state.modal || state.composerMenu || state.railMenu)) { state.modal = null; state.settingsProvider = null; state.composerMenu = null; state.railMenu = null; render(); }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); showToast("Session search would open here"); }
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "o") { event.preventDefault(); newSession(); }
});

render();
