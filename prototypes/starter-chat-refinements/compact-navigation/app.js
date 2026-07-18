const initialSessions = [
  {
    id: "session-1",
    title: "Runtime lifecycle notes",
    summary: "Reviewing the reload contract",
    time: "10m",
    messages: [
      { role: "user", text: "Summarize how a Runtime Reload should feel in the chat surface." },
      { role: "assistant", text: "Reload replaces the UI and Harness Runtime Generation while leaving the desktop window and durable Sessions available. I will keep that lifecycle visible without making it the primary task." }
    ],
    tools: [
      { name: "session_context", detail: "Session records", status: "completed", output: "Loaded 4 Session records\nWorkspace: drycode" }
    ]
  },
  {
    id: "session-2",
    title: "Starter chat direction",
    summary: "Compare navigation patterns",
    time: "Yesterday",
    messages: [
      { role: "user", text: "Keep the Workspace and Session relationship easy to understand." },
      { role: "assistant", text: "A compact NavigationView can keep resume actions close without turning the rail into a dashboard." }
    ],
    tools: []
  },
  {
    id: "session-3",
    title: "Untitled Session",
    summary: "No messages yet",
    time: "Mon",
    messages: [],
    tools: []
  }
];

const state = {
  workspace: { name: "drycode", path: "D:\\work\\drycode" },
  model: { name: "Claude Sonnet 4", provider: "Anthropic" },
  sessions: initialSessions,
  activeSession: "session-1",
  draft: "",
  modal: null,
  toast: "",
  running: false,
  stage: "Ready"
};

const icon = (name, label = "") => `<i class="icon" data-lucide="${name}"${label ? ` aria-label="${label}"` : ""}></i>`;
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
const activeSession = () => state.sessions.find((session) => session.id === state.activeSession) ?? state.sessions[0];
const activeTools = () => activeSession().tools;

function titlebar() {
  return `<header class="titlebar" aria-label="Drycode window">
    <span class="app-mark">${icon("sparkles")}</span><span class="wordmark">Drycode</span><span class="title-separator">/</span><span class="window-title">Chat</span><span class="window-drag"></span>
    <span class="runtime-state"><span class="status-dot ${state.running ? "busy" : "ready"}"></span>${state.running ? "Run active" : "Ready"}</span>
    <div class="window-controls"><button class="window-control" type="button" aria-label="Minimize">${icon("minus")}</button><button class="window-control" type="button" aria-label="Maximize">${icon("square")}</button><button class="window-control close" type="button" aria-label="Close">${icon("x")}</button></div>
  </header>`;
}

function workspaceButton() {
  return `<button class="workspace-button" type="button" data-action="workspace" aria-label="Select Workspace">
    <span class="control-icon">${icon("folder-open")}</span><span class="button-copy"><b>${escapeHtml(state.workspace.name)}</b><small>${escapeHtml(state.workspace.path)}</small></span>${icon("chevron-down", "Select Workspace")}
  </button>`;
}

function modelButton() {
  return `<button class="model-button" type="button" data-action="model" aria-label="Configure Model">
    <span class="control-icon model-icon">${icon("sliders-horizontal")}</span><span class="button-copy"><b>${escapeHtml(state.model.name)}</b><small>${escapeHtml(state.model.provider)} · configured</small></span>
  </button>`;
}

function sessionRows() {
  return state.sessions.map((session) => `<button class="session-row ${session.id === state.activeSession ? "selected" : ""}" type="button" data-session="${escapeHtml(session.id)}" aria-current="${session.id === state.activeSession ? "true" : "false"}">
    <span class="session-icon">${icon(session.id === state.activeSession ? "circle-dot" : "circle")}</span><span class="session-row-copy"><b>${escapeHtml(session.title)}</b><small>${escapeHtml(session.summary)}</small></span><time>${escapeHtml(session.time)}</time>
  </button>`).join("");
}

function sessionHeader() {
  const session = activeSession();
  return `<div class="session-heading"><span class="status-dot ${state.running ? "busy" : "ready"}"></span><div><span class="eyebrow">Durable Session</span><b>${escapeHtml(session.title)}</b><small>${state.running ? escapeHtml(state.stage) : "Ready for input"}</small></div><span class="grow"></span><button class="subtle-button" type="button" data-action="sessions">${icon("list", "Open all Sessions")} Resume a Session</button></div>`;
}

function messageStream() {
  const messages = activeSession().messages.map((message) => `<article class="message ${message.role}">
    <div class="message-label"><span class="avatar ${message.role}">${icon(message.role === "user" ? "user" : "sparkles")}</span><b>${message.role === "user" ? "You" : "Drycode"}</b><time>${message.role === "user" ? "just now" : "response"}</time></div>
    <p>${escapeHtml(message.text)}</p>
  </article>`).join("");
  const tools = `<section class="inline-tools" aria-label="Tool activity"><div class="section-kicker"><span>${icon("wrench")} Tool activity</span><span class="grow"></span><span class="muted">${activeTools().length} events</span></div>${toolCards()}</section>`;
  return `<div class="message-stream">${messages || `<div class="empty-message">${icon("message-square", "Start a Session")}<b>Start this Session</b><span>Ask Drycode to work in ${escapeHtml(state.workspace.name)}.</span></div>`}${tools}</div>`;
}

function toolCards() {
  if (!activeTools().length) return `<div class="no-activity">No Tool activity yet.</div>`;
  return activeTools().map((tool) => `<details class="tool-card" ${tool.status === "running" ? "open" : ""}>
    <summary>${icon(tool.status === "running" ? "loader-circle" : "check-circle-2", tool.status === "running" ? "Tool running" : "Tool completed")}<b>${escapeHtml(tool.name)}</b><span class="tool-detail">${escapeHtml(tool.detail)}</span><span class="tool-status ${tool.status}">${tool.status === "running" ? "Running" : "Completed"}</span></summary>
    <pre>${escapeHtml(tool.output)}</pre>
  </details>`).join("");
}

function composer() {
  return `<form class="composer" data-composer>
    <textarea aria-label="Message this Session" placeholder="Message Drycode in this Session">${escapeHtml(state.draft)}</textarea>
    <div class="composer-bar"><button type="button" class="attach-button" data-action="attach" aria-label="Add context">${icon("paperclip")}</button><span class="compose-context">${escapeHtml(state.workspace.name)} · ${escapeHtml(state.model.name)}</span><span class="grow"></span>${state.running ? `<button type="button" class="interrupt-button" data-action="interrupt">${icon("square")} Interrupt Run</button>` : `<button type="submit" class="send-button">Send ${icon("send")}</button>`}</div>
  </form>`;
}

function navRail() {
  return `<nav class="navigation-view" aria-label="Navigation">
    <div class="nav-workspace">${workspaceButton()}</div>
    <button class="new-session primary-button" type="button" data-action="new-session">${icon("plus")} New Session</button>
    <div class="nav-section"><span class="eyebrow">Workspace</span><button class="nav-link active" type="button" aria-current="page">${icon("messages-square")} Sessions <em>${state.sessions.length}</em></button></div>
    <div class="session-nav"><div class="session-nav-header"><span class="eyebrow">Resume a Session</span><span class="grow"></span><button class="compact-button" type="button" data-action="new-session" aria-label="New Session">${icon("plus")}</button></div>${sessionRows()}<div class="resume-note">${icon("history")}<span>Sessions stay available here for quick resume.</span></div></div>
    <div class="nav-footer">${modelButton()}<button class="footer-link" type="button" data-action="reload">${icon("rotate-ccw")} Reload Runtime</button></div>
  </nav>`;
}

function view() {
  return `<div class="app-frame">${titlebar()}<div class="nav-layout">${navRail()}<main class="chat-column">${sessionHeader()}${messageStream()}${composer()}</main></div></div>`;
}

function modal() {
  if (!state.modal) return "";
  if (state.modal === "workspace") return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="workspace-title"><div class="dialog-title"><span class="dialog-icon">${icon("folder-open")}</span><div><span class="eyebrow">Workspace</span><h2 id="workspace-title">Select a Workspace</h2></div></div><p>Sessions are bound to the Workspace selected when they are created.</p><div class="workspace-options"><button class="option-row ${state.workspace.name === "drycode" ? "chosen" : ""}" type="button" data-workspace="drycode|D:\\work\\drycode">${icon("folder")}<span><b>drycode</b><small>D:\\work\\drycode</small></span>${state.workspace.name === "drycode" ? `<span class="option-check">${icon("check")}</span>` : ""}</button><button class="option-row ${state.workspace.name === "agent-lab" ? "chosen" : ""}" type="button" data-workspace="agent-lab|D:\\work\\agent-lab">${icon("folder")}<span><b>agent-lab</b><small>D:\\work\\agent-lab</small></span>${state.workspace.name === "agent-lab" ? `<span class="option-check">${icon("check")}</span>` : ""}</button><button class="option-row" type="button" data-action="choose-folder">${icon("folder-plus")}<span><b>Choose another folder</b><small>Open the native folder picker stub</small></span></button></div><div class="dialog-actions"><button class="subtle-button" type="button" data-action="close-modal">Cancel</button></div></section></div>`;
  if (state.modal === "model") return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="model-title"><div class="dialog-title"><span class="dialog-icon amber">${icon("sliders-horizontal")}</span><div><span class="eyebrow">Session configuration</span><h2 id="model-title">Configure Model</h2></div></div><p>The Model Provider owns discovery and credentials. This choice applies to the current Session.</p><label>Provider<select id="provider"><option ${state.model.provider === "Anthropic" ? "selected" : ""}>Anthropic</option><option ${state.model.provider === "OpenAI" ? "selected" : ""}>OpenAI</option><option ${state.model.provider === "Google" ? "selected" : ""}>Google</option></select></label><label>Model<select id="model"><option ${state.model.name === "Claude Sonnet 4" ? "selected" : ""}>Claude Sonnet 4</option><option ${state.model.name === "Claude Opus 4" ? "selected" : ""}>Claude Opus 4</option><option ${state.model.name === "Claude Haiku 3.5" ? "selected" : ""}>Claude Haiku 3.5</option></select></label><label>API credential<input type="password" value="prototype-credential" aria-label="API credential"></label><div class="dialog-actions"><button class="subtle-button" type="button" data-action="close-modal">Cancel</button><button class="primary-button" type="button" data-action="save-model">Use Model</button></div></section></div>`;
  if (state.modal === "sessions") return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="sessions-title"><div class="dialog-title"><span class="dialog-icon">${icon("history")}</span><div><span class="eyebrow">${escapeHtml(state.workspace.name)}</span><h2 id="sessions-title">Resume a Session</h2></div></div><p>Choose a durable conversation to continue, or start a new one in this Workspace.</p><div class="dialog-sessions">${sessionRows()}</div><div class="dialog-actions"><button class="subtle-button" type="button" data-action="close-modal">Cancel</button><button class="primary-button" type="button" data-action="new-session">${icon("plus")} New Session</button></div></section></div>`;
  if (state.modal === "reload") return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="reload-title"><div class="dialog-title"><span class="dialog-icon amber">${icon("rotate-ccw")}</span><div><span class="eyebrow">Runtime lifecycle</span><h2 id="reload-title">Reload the Runtime?</h2></div></div><p>Drycode stops the current UI and Harness Runtime Generation, then starts a fresh generation. Durable Sessions remain available.</p><div class="reload-note"><span class="status-dot busy"></span><span>Active work will be interrupted. Your Session record stays safe.</span></div><div class="dialog-actions"><button class="subtle-button" type="button" data-action="close-modal">Cancel</button><button class="danger-button" type="button" data-action="confirm-reload">Reload Drycode</button></div></section></div>`;
  return `<div class="modal-shade"><section class="dialog reload-progress" role="dialog" aria-modal="true" aria-labelledby="progress-title"><span class="dialog-icon amber">${icon("rotate-ccw")}</span><span class="eyebrow">Runtime lifecycle</span><h2 id="progress-title">Reloading Runtime</h2><p>Stopping the current generation and starting a fresh UI and Harness pair.</p><div class="progress-track"><i></i></div><small>Starting Runtime Generation 19</small></section></div>`;
}

function render() {
  document.querySelector("#app").innerHTML = `${view()}${modal()}${state.toast ? `<div class="toast" role="status">${escapeHtml(state.toast)}</div>` : ""}`;
  if (window.lucide) lucide.createIcons();
  bind();
}

function showToast(text) {
  state.toast = text;
  render();
  window.setTimeout(() => { if (state.toast === text) { state.toast = ""; render(); } }, 1800);
}

function selectSession(id) {
  state.activeSession = id;
  state.modal = null;
  state.running = false;
  state.stage = "Ready";
  render();
}

function newSession() {
  const id = `session-${Date.now()}`;
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
  session.messages.push({ role: "assistant", text: "I will inspect the Workspace and report each Tool as it runs." });
  session.tools.push({ name: "workspace_scan", detail: "Workspace context", status: "running", output: "Inspecting Workspace" });
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

function confirmReload() {
  state.modal = "reloading";
  render();
  window.setTimeout(() => {
    state.modal = null;
    state.running = false;
    state.stage = "Ready after Reload";
    activeTools().forEach((tool) => { tool.status = "completed"; });
    render();
    showToast("Runtime Reloaded; Sessions are ready to resume");
  }, 1300);
}

function bind() {
  document.querySelectorAll("[data-action]").forEach((element) => element.addEventListener("click", (event) => {
    const action = element.dataset.action;
    if (action === "workspace" || action === "model" || action === "sessions" || action === "reload") state.modal = action;
    if (action === "close-modal") state.modal = null;
    if (action === "new-session") return newSession();
    if (action === "interrupt") return interrupt();
    if (action === "attach") return showToast("Context attachment is a prototype stub");
    if (action === "choose-folder") return showToast("Native folder picker would open here");
    if (action === "save-model") {
      state.model.provider = document.querySelector("#provider").value;
      state.model.name = document.querySelector("#model").value;
      state.modal = null;
      state.toast = "Model configuration saved for this Session";
    }
    if (action === "confirm-reload") return confirmReload();
    if (["workspace", "model", "sessions", "reload", "close-modal", "save-model"].includes(action)) { event.preventDefault(); render(); }
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
  if (event.key === "Escape" && state.modal && !editing) { state.modal = null; render(); }
});

render();
