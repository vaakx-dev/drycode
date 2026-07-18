const variantNames = {
  A: "Navigation view",
  B: "Run cockpit",
  C: "Workspace hub",
  D: "Focus surface",
  E: "Session tabs",
};

const state = {
  variant: new URLSearchParams(location.search).get("variant")?.toUpperCase() || "A",
  workspace: { name: "drycode", path: "D:\\work\\drycode" },
  model: { provider: "Anthropic", name: "Claude Sonnet 4", ready: true },
  activeSession: "contract",
  running: true,
  stage: "Searching session records",
  modal: null,
  draft: "",
  toast: "",
  sessions: [
    {
      id: "contract",
      title: "Shape the starter chat",
      summary: "Map the smallest useful Windows surface",
      time: "Now",
      messages: [
        { role: "user", text: "What does the starter chat need to make visible?" },
        { role: "assistant", text: "Workspace, durable Sessions, the selected Model, and a clear view of each Run. I’ll keep the surface focused on asking Drycode to work and watching what it does." },
      ],
      tools: [
        { name: "session_lookup", detail: "Durable Session record", status: "completed", output: "Session contract · 12 records" },
        { name: "workspace_scan", detail: "Workspace context", status: "running", output: "Reading workspace context…" },
      ],
    },
    {
      id: "harness",
      title: "Extract the Harness",
      summary: "Compare runtime boundaries and hand-offs",
      time: "2h",
      messages: [{ role: "assistant", text: "A durable Session remains linear and can have at most one active Run." }],
      tools: [{ name: "read", detail: "Runtime notes", status: "completed", output: "Read 24 lines" }],
    },
    {
      id: "installer",
      title: "Plan the Windows install",
      summary: "Stopped after comparing package formats",
      time: "Fri",
      messages: [{ role: "user", text: "Keep the first install experience small and understandable." }],
      tools: [],
    },
    {
      id: "recovery",
      title: "Recovery surface notes",
      summary: "Capture what remains available during Reload",
      time: "Mon",
      messages: [{ role: "assistant", text: "Reload replaces the Runtime Generation while the desktop window stays open." }],
      tools: [],
    },
  ],
};

if (!variantNames[state.variant]) state.variant = "A";

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const activeSession = () => state.sessions.find((session) => session.id === state.activeSession) || state.sessions[0];
const activeMessages = () => activeSession().messages;
const activeTools = () => activeSession().tools;

function titlebar(label = "Starter chat") {
  return `<header class="titlebar">
    <span class="app-glyph" aria-hidden="true"><i></i><i></i><i></i></span>
    <strong class="wordmark">drycode</strong><span class="title-separator">/</span><span class="window-title">${label}</span>
    <span class="window-drag"></span>
    <span class="runtime-state"><span class="status-dot ${state.running ? "busy" : "ready"}"></span>${state.running ? "Run active" : "Ready"}</span>
    <div class="window-controls" aria-hidden="true"><span>—</span><span>□</span><span>×</span></div>
  </header>`;
}

function workspaceButton(extraClass = "") {
  return `<button class="workspace-button ${extraClass}" data-action="workspace" title="Select Workspace">
    <span class="workspace-symbol">▣</span><span class="button-copy"><b>${escapeHtml(state.workspace.name)}</b><small>${escapeHtml(state.workspace.path)}</small></span><span class="chevron">⌄</span>
  </button>`;
}

function modelButton() {
  return `<button class="model-button" data-action="model" title="Configure Model">
    <span class="model-symbol">◈</span><span class="button-copy"><b>${escapeHtml(state.model.name)}</b><small>${escapeHtml(state.model.provider)} · configured</small></span><span class="chevron">⌄</span>
  </button>`;
}

function sessionRows({ cards = false } = {}) {
  return state.sessions.map((session) => `<button class="session-row ${session.id === state.activeSession ? "selected" : ""} ${cards ? "session-card" : ""}" data-session="${session.id}">
    <span class="session-icon">${session.id === state.activeSession ? "●" : "○"}</span><span class="session-row-copy"><b>${escapeHtml(session.title)}</b><small>${escapeHtml(session.summary)}</small></span><time>${session.time}</time>
  </button>`).join("");
}

function sessionHeader({ compact = false } = {}) {
  const session = activeSession();
  return `<div class="session-heading ${compact ? "compact" : ""}">
    <span class="status-dot ${state.running ? "busy" : "ready"}"></span><div><b>${escapeHtml(session.title)}</b><small>${state.running ? escapeHtml(state.stage) : "Durable Session · ready for input"}</small></div><span class="grow"></span>
    <button class="subtle-button" data-action="sessions">All sessions</button>
  </div>`;
}

function messageStream({ inlineTools = true } = {}) {
  const messages = activeMessages().map((message) => `<article class="message ${message.role}">
    <div class="message-label"><span class="avatar ${message.role}">${message.role === "user" ? "YOU" : "DRY"}</span><b>${message.role === "user" ? "You" : "Drycode"}</b><time>${message.role === "user" ? "just now" : "response"}</time></div>
    <p>${escapeHtml(message.text)}</p>
  </article>`).join("");
  const tools = inlineTools ? `<section class="inline-tools" aria-label="Tool activity"><div class="section-kicker"><span>Tool activity</span><span class="muted">${activeTools().length} events</span></div>${toolCards()}</section>` : "";
  return `<div class="message-stream">${messages || `<div class="empty-message"><span class="empty-icon">＋</span><b>Start this Session</b><span>Ask Drycode to work in ${escapeHtml(state.workspace.name)}.</span></div>`}${tools}</div>`;
}

function toolCards() {
  if (!activeTools().length) return `<div class="no-activity">No Tool activity yet.</div>`;
  return activeTools().map((tool) => `<details class="tool-card" ${tool.status === "running" ? "open" : ""}>
    <summary><span class="tool-mark ${tool.status}">${tool.status === "running" ? "◌" : "✓"}</span><b>${escapeHtml(tool.name)}</b><span class="tool-detail">${escapeHtml(tool.detail)}</span><span class="tool-status ${tool.status}">${tool.status === "running" ? "Running" : "Completed"}</span></summary>
    <pre>${escapeHtml(tool.output)}</pre>
  </details>`).join("");
}

function activityTimeline() {
  return `<div class="timeline">
    <div class="timeline-item"><span class="timeline-dot done"></span><div><b>Run started</b><small>Session input accepted</small><code>run 0190…d42a</code></div></div>
    ${activeTools().map((tool) => `<div class="timeline-item ${tool.status === "running" ? "current" : ""}"><span class="timeline-dot ${tool.status === "running" ? "current-dot" : "done"}"></span><div><b>${escapeHtml(tool.name)}</b><small>${escapeHtml(tool.status === "running" ? state.stage : tool.detail)}</small><code>${escapeHtml(tool.output)}</code></div></div>`).join("")}
    <div class="timeline-item future"><span class="timeline-dot"></span><div><b>Run completion</b><small>Waiting for Harness result</small></div></div>
  </div>`;
}

function composer({ context = false } = {}) {
  return `<form class="composer" data-composer>
    <textarea aria-label="Message" placeholder="Message Drycode in this Session…">${escapeHtml(state.draft)}</textarea>
    <div class="composer-bar"><button type="button" class="attach-button" data-action="attach" title="Add context">＋</button><span class="compose-context">${context ? `${escapeHtml(state.workspace.name)} · ${escapeHtml(state.model.name)}` : "Enter to send · Shift+Enter for newline"}</span><span class="grow"></span>${state.running ? `<button type="button" class="interrupt-button" data-action="interrupt">■ Interrupt</button>` : `<button type="submit" class="send-button" data-action="send">Send <span>↑</span></button>`}</div>
  </form>`;
}

function utilityButtons({ wide = false } = {}) {
  return `<div class="utility-buttons ${wide ? "wide" : ""}">${modelButton()}<button class="reload-button" data-action="reload"><span>↻</span>${wide ? "Reload Runtime" : "Reload"}</button></div>`;
}

function variantA() {
  return `<div class="app-frame variant-a">${titlebar("Chat")}
    <div class="nav-layout"><nav class="navigation-view">
      <div class="nav-workspace">${workspaceButton()}</div>
      <button class="new-session primary-button" data-action="new-session">＋ New Session</button>
      <div class="nav-section"><span class="section-kicker">Workspace</span><button class="nav-link active"><span>▤</span> Sessions <em>${state.sessions.length}</em></button><button class="nav-link" data-action="workspace"><span>▣</span> Change Workspace</button></div>
      <div class="session-nav"><div class="section-kicker"><span>Recent Sessions</span><span class="grow"></span><button class="mini-button" data-action="new-session">＋</button></div>${sessionRows()}</div>
      <div class="nav-footer">${modelButton()}<button class="footer-link" data-action="reload">↻ Reload Runtime</button></div>
    </nav><main class="chat-column">${sessionHeader()}${messageStream()}${composer()}</main></div>${variantPicker()}</div>`;
}

function variantB() {
  return `<div class="app-frame variant-b">${titlebar("Run cockpit")}
    <header class="command-bar"><div class="command-group">${workspaceButton("command-workspace")}<button class="command-button" data-action="new-session">＋ New Session</button></div><span class="grow"></span><div class="command-group">${modelButton()}<button class="command-button" data-action="reload">↻ Reload</button></div></header>
    <div class="cockpit-grid"><aside class="session-pane"><div class="pane-header"><span class="section-kicker">Sessions</span><button class="mini-button" data-action="new-session">＋</button></div><div class="session-scroll">${sessionRows()}</div></aside><section class="conversation-pane">${sessionHeader({ compact: true })}${messageStream({ inlineTools: false })}${composer({ context: true })}</section><aside class="run-pane"><div class="pane-header"><div><span class="section-kicker">Run activity</span><small class="live-label"><span class="status-dot ${state.running ? "busy" : "ready"}"></span>${state.running ? "LIVE" : "IDLE"}</small></div></div><div class="run-scroll">${activityTimeline()}</div><div class="run-actions">${state.running ? `<button class="interrupt-button full" data-action="interrupt">■ Interrupt active Run</button>` : `<span class="idle-copy">No active Run</span>`}<button class="plain-button" data-action="reload">↻ Reload Runtime</button></div></aside></div>${variantPicker()}</div>`;
}

function variantC() {
  const session = activeSession();
  return `<div class="app-frame variant-c">${titlebar("Workspace hub")}
    <main class="hub-layout"><section class="hub-sidebar"><div class="hub-intro"><span class="section-kicker">Workspace</span>${workspaceButton()}<h1>Good to see you.</h1><p>Choose a durable Session or start a new line of work.</p><button class="primary-button wide-button" data-action="new-session">＋ New Session</button></div><div class="hub-list"><div class="section-kicker"><span>Recent Sessions</span><span class="muted">${state.sessions.length}</span></div>${sessionRows({ cards: true })}</div><div class="hub-controls">${modelButton()}<button class="footer-link" data-action="reload">↻ Reload Runtime</button></div></section><section class="hub-detail"><div class="hub-toolbar"><div><span class="section-kicker">Session</span><h2>${escapeHtml(session.title)}</h2></div><span class="grow"></span><button class="toolbar-button" data-action="sessions">Open Session…</button><button class="toolbar-button" data-action="workspace">Workspace</button></div>${messageStream()}${composer({ context: true })}</section></main>${variantPicker()}</div>`;
}

function variantD() {
  return `<div class="app-frame variant-d">${titlebar("Focus surface")}
    <header class="focus-command"><button class="crumb-button" data-action="workspace"><span>▣</span>${escapeHtml(state.workspace.name)}<b>⌄</b></button><span class="crumb-chevron">›</span><button class="crumb-button session-crumb" data-action="sessions"><span class="status-dot ${state.running ? "busy" : "ready"}></span>${escapeHtml(activeSession().title)}<b>⌄</b></button><span class="grow"></span>${modelButton()}<button class="command-button" data-action="new-session">＋ New</button><button class="command-button" data-action="reload">↻ Reload</button></header>
    <main class="focus-main"><div class="focus-title"><span class="section-kicker">Conversation</span><h1>${escapeHtml(activeSession().title)}</h1><p>${state.running ? `Drycode is working · ${escapeHtml(state.stage)}` : "Send a message to begin a Run"}</p></div><div class="focus-transcript">${messageStream()}</div>${composer({ context: true })}</main>
    <footer class="focus-status"><span><span class="status-dot ${state.running ? "busy" : "ready"}></span>${state.running ? "Run active" : "Ready"}</span><span class="status-divider"></span><span>Workspace <b>${escapeHtml(state.workspace.name)}</b></span><span class="status-divider"></span><span>Model <b>${escapeHtml(state.model.name)}</b></span><span class="grow"></span>${state.running ? `<button class="interrupt-button" data-action="interrupt">■ Interrupt</button>` : `<button class="plain-button" data-action="sessions">Resume a Session</button>`}</footer>${variantPicker()}</div>`;
}

function variantE() {
  return `<div class="app-frame variant-e">${titlebar("Session tabs")}
    <header class="tabs-command"><div class="tabs-workspace">${workspaceButton("tab-workspace")}</div><div class="session-tabs">${state.sessions.slice(0, 3).map((session) => `<button class="session-tab ${session.id === state.activeSession ? "selected" : ""}" data-session="${session.id}"><span class="status-dot ${session.id === state.activeSession && state.running ? "busy" : "ready"}"></span>${escapeHtml(session.title)}</button>`).join("")}<button class="session-tab new-tab" data-action="new-session">＋</button></div><div class="tabs-actions"><button class="command-button" data-action="new-session">＋ New Session</button>${modelButton()}<button class="command-button" data-action="reload">↻ Reload</button></div></header>
    <main class="tab-layout"><section class="tab-conversation"><div class="tab-heading"><div><span class="section-kicker">Durable Session</span><h1>${escapeHtml(activeSession().title)}</h1></div><span class="grow"></span><button class="toolbar-button" data-action="sessions">Browse all</button></div>${messageStream({ inlineTools: false })}${composer()}</section><aside class="tab-activity"><div class="activity-heading"><span class="section-kicker">Activity</span><span class="activity-count">${activeTools().length}</span></div><p class="activity-summary">Every Tool call is listed here so a Run stays observable without leaving the conversation.</p>${toolCards()}<div class="activity-bottom">${state.running ? `<button class="interrupt-button full" data-action="interrupt">■ Interrupt Run</button>` : `<span class="idle-copy">Run is idle</span>`}<button class="plain-button" data-action="reload">↻ Reload Runtime</button></div></aside></main>${variantPicker()}</div>`;
}

function variantPicker() {
  return `<nav class="variant-picker" aria-label="Exploration variants"><span class="picker-label">Explore</span>${Object.keys(variantNames).map((key) => `<button class="variant-choice ${state.variant === key ? "selected" : ""}" data-variant="${key}" title="${variantNames[key]}">${key}</button>`).join("")}<span class="picker-name">${variantNames[state.variant]}</span></nav>`;
}

function modal() {
  if (!state.modal) return "";
  if (state.modal === "workspace") return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true"><div class="dialog-title"><span class="dialog-icon">▣</span><div><span class="section-kicker">Workspace</span><h2>Select a Workspace</h2></div></div><p>A Session is permanently bound to the Workspace selected when it is created.</p><div class="workspace-options"><button data-workspace="drycode|D:\\work\\drycode" class="option-row ${state.workspace.name === "drycode" ? "chosen" : ""}"><span class="option-icon">▣</span><span><b>drycode</b><small>D:\\work\\drycode</small></span><span class="option-check">${state.workspace.name === "drycode" ? "✓" : ""}</span></button><button data-workspace="agent-lab|D:\\work\\agent-lab" class="option-row ${state.workspace.name === "agent-lab" ? "chosen" : ""}"><span class="option-icon">▣</span><span><b>agent-lab</b><small>D:\\work\\agent-lab</small></span><span class="option-check">${state.workspace.name === "agent-lab" ? "✓" : ""}</span></button><button class="option-row" data-action="choose-folder"><span class="option-icon">＋</span><span><b>Choose another folder…</b><small>Open the native folder picker (stub)</small></span></button></div><div class="dialog-actions"><button class="plain-button" data-action="close-modal">Cancel</button></div></section></div>`;
  if (state.modal === "model") return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true"><div class="dialog-title"><span class="dialog-icon violet">◈</span><div><span class="section-kicker">Session configuration</span><h2>Choose a Model</h2></div></div><p>The Model Provider owns discovery and credentials. This choice applies to the current Session.</p><label>Provider<select id="provider"><option ${state.model.provider === "Anthropic" ? "selected" : ""}>Anthropic</option><option ${state.model.provider === "OpenAI" ? "selected" : ""}>OpenAI</option><option ${state.model.provider === "Google" ? "selected" : ""}>Google</option></select></label><label>Model<select id="model"><option>Claude Sonnet 4</option><option>Claude Opus 4</option><option>Claude Haiku 3.5</option></select></label><label>API credential<input type="password" value="••••••••••••" aria-label="API credential"></label><div class="dialog-actions"><button class="plain-button" data-action="close-modal">Cancel</button><button class="primary-button" data-action="save-model">Use Model</button></div></section></div>`;
  if (state.modal === "sessions") return `<div class="modal-shade" data-dismiss="true"><section class="dialog session-dialog" role="dialog" aria-modal="true"><div class="dialog-title"><span class="dialog-icon">▤</span><div><span class="section-kicker">${escapeHtml(state.workspace.name)}</span><h2>Open a Session</h2></div></div><p>Resume a durable conversation or start a new one in this Workspace.</p><div class="dialog-sessions">${sessionRows()}</div><div class="dialog-actions"><button class="plain-button" data-action="close-modal">Cancel</button><button class="primary-button" data-action="new-session">＋ New Session</button></div></section></div>`;
  if (state.modal === "reload") return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true"><div class="dialog-title"><span class="dialog-icon amber">↻</span><div><span class="section-kicker">Runtime lifecycle</span><h2>Reload the Runtime?</h2></div></div><p>Drycode will stop the complete UI and Harness Runtime Generation, then start a fresh generation. Durable Sessions remain available.</p><div class="reload-note"><span class="status-dot busy"></span><span>Active work will be interrupted. Your Session record stays safe.</span></div><div class="dialog-actions"><button class="plain-button" data-action="close-modal">Cancel</button><button class="danger-button" data-action="confirm-reload">Reload Drycode</button></div></section></div>`;
  return `<div class="modal-shade"><section class="dialog reload-progress" role="dialog" aria-modal="true"><span class="dialog-icon amber">↻</span><span class="section-kicker">Runtime lifecycle</span><h2>Reloading Runtime…</h2><p>Stopping the current generation and starting a fresh UI + Harness pair.</p><div class="progress-track"><i></i></div><small>Starting Runtime Generation 19</small></section></div>`;
}

function render() {
  const views = { A: variantA, B: variantB, C: variantC, D: variantD, E: variantE };
  document.querySelector("#app").innerHTML = `${views[state.variant]()}${modal()}${state.toast ? `<div class="toast" role="status">${escapeHtml(state.toast)}</div>` : ""}`;
  bind();
}

function showToast(text) {
  state.toast = text;
  render();
  window.setTimeout(() => { state.toast = ""; render(); }, 1800);
}

function switchVariant(key) {
  state.variant = key;
  const url = new URL(location.href);
  url.searchParams.set("variant", key);
  history.replaceState(null, "", url);
  render();
}

function selectSession(id) {
  state.activeSession = id;
  state.modal = null;
  state.running = false;
  state.stage = "Ready";
  render();
}

function newSession() {
  const id = `session-${state.sessions.length + 1}`;
  state.sessions.unshift({ id, title: "Untitled Session", summary: "No messages yet", time: "Now", messages: [], tools: [] });
  state.activeSession = id;
  state.running = false;
  state.draft = "";
  state.modal = null;
  render();
}

function send() {
  const text = state.draft.trim();
  if (!text || state.running) return;
  const session = activeSession();
  session.messages.push({ role: "user", text });
  session.messages.push({ role: "assistant", text: "I’ll inspect the Workspace and report each Tool as it runs." });
  session.tools.push({ name: "workspace_scan", detail: "Workspace context", status: "running", output: "Inspecting Workspace…" });
  session.summary = text;
  state.draft = "";
  state.running = true;
  state.stage = "Inspecting Workspace";
  render();
}

function interrupt() {
  const session = activeSession();
  state.running = false;
  state.stage = "Interrupted by user";
  session.tools = session.tools.map((tool) => tool.status === "running" ? { ...tool, status: "completed", output: `${tool.output}\nRun interrupted by user.` } : tool);
  session.messages.push({ role: "assistant", text: "Run interrupted. Completed messages and Tool results remain in this Session." });
  render();
}

function bind() {
  document.querySelectorAll("[data-variant]").forEach((button) => button.addEventListener("click", () => switchVariant(button.dataset.variant)));
  document.querySelectorAll("[data-action]").forEach((element) => element.addEventListener("click", (event) => {
    if (element.dataset.action === "send") event.preventDefault();
    const action = element.dataset.action;
    if (["workspace", "model", "sessions", "reload"].includes(action)) state.modal = action;
    if (action === "close-modal") state.modal = null;
    if (action === "new-session") return newSession();
    if (action === "interrupt") return interrupt();
    if (action === "send") return send();
    if (action === "attach") return showToast("Context attachment is a prototype stub");
    if (action === "choose-folder") return showToast("Native folder picker would open here");
    if (action === "save-model") {
      state.model.provider = document.querySelector("#provider").value;
      state.model.name = document.querySelector("#model").value;
      state.modal = null;
      state.toast = "Model configuration saved for this Session";
    }
    if (action === "confirm-reload") {
      state.modal = "reloading";
      render();
      window.setTimeout(() => { state.modal = null; state.running = false; state.stage = "Ready after Reload"; activeTools().forEach((tool) => { tool.status = "completed"; }); render(); }, 1400);
      return;
    }
    render();
  }));
  document.querySelectorAll("[data-session]").forEach((element) => element.addEventListener("click", () => selectSession(element.dataset.session)));
  document.querySelectorAll("[data-workspace]").forEach((element) => element.addEventListener("click", () => {
    const [name, path] = element.dataset.workspace.split("|");
    state.workspace = { name, path };
    state.modal = null;
    state.toast = `Workspace changed to ${name}`;
    render();
  }));
  document.querySelectorAll("textarea").forEach((textarea) => {
    textarea.addEventListener("input", () => { state.draft = textarea.value; });
    textarea.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); state.draft = textarea.value; send(); }
    });
  });
  document.querySelectorAll("[data-composer]").forEach((form) => form.addEventListener("submit", (event) => { event.preventDefault(); send(); }));
  document.querySelectorAll(".modal-shade[data-dismiss]").forEach((shade) => shade.addEventListener("click", (event) => { if (event.target === shade) { state.modal = null; render(); } }));
}

document.addEventListener("keydown", (event) => {
  const editing = event.target.matches?.("input, textarea, select, [contenteditable]");
  if (!editing && event.key === "ArrowLeft") switchVariant(Object.keys(variantNames)[(Object.keys(variantNames).indexOf(state.variant) + 4) % 5]);
  if (!editing && event.key === "ArrowRight") switchVariant(Object.keys(variantNames)[(Object.keys(variantNames).indexOf(state.variant) + 1) % 5]);
  if (event.key === "Escape" && state.modal) { state.modal = null; render(); }
});

render();
