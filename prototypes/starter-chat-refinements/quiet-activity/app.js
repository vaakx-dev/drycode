const state = {
  workspace: { name: "drycode", path: "D:\\work\\drycode" },
  model: { provider: "Anthropic", name: "Claude Sonnet 4" },
  activeSession: "contract",
  running: true,
  stage: "Searching Session records",
  activityOpen: false,
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
        { role: "assistant", text: "Workspace, durable Sessions, the selected Model, and a clear view of each Run. I will keep the surface focused on asking Drycode to work and quietly show what it does." },
      ],
      tools: [
        { name: "session_lookup", detail: "Durable Session record", status: "completed", output: "Session contract · 12 records" },
        { name: "workspace_scan", detail: "Workspace context", status: "running", output: "Reading workspace context" },
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

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const activeSession = () => state.sessions.find((session) => session.id === state.activeSession) || state.sessions[0];
const activeTools = () => activeSession().tools;
const icon = (name, extra = "") => `<i data-lucide="${name}" class="icon ${extra}" aria-hidden="true"></i>`;

function titlebar() {
  return `<header class="titlebar">
    <span class="app-mark">${icon("panel-left")}</span>
    <strong class="wordmark">drycode</strong><span class="title-separator">/</span><span class="window-title">Chat</span>
    <span class="window-drag"></span>
    <span class="runtime-state"><span class="status-dot ${state.running ? "busy" : "ready"}"></span>${state.running ? "Run active" : "Ready"}</span>
    <div class="window-controls" aria-label="Window controls">
      <button class="window-control" type="button" title="Minimize" aria-label="Minimize">${icon("minus")}</button>
      <button class="window-control" type="button" title="Maximize" aria-label="Maximize">${icon("square")}</button>
      <button class="window-control close" type="button" title="Close" aria-label="Close">${icon("x")}</button>
    </div>
  </header>`;
}

function workspaceButton() {
  return `<button class="workspace-button" data-action="workspace" title="Select Workspace">
    <span class="workspace-symbol">${icon("folder")}</span><span class="button-copy"><b>${escapeHtml(state.workspace.name)}</b><small>${escapeHtml(state.workspace.path)}</small></span>${icon("chevron-down", "small")}
  </button>`;
}

function modelButton() {
  return `<button class="model-button" data-action="model" title="Configure Model">
    <span class="model-symbol">${icon("settings-2")}</span><span class="button-copy"><b>${escapeHtml(state.model.name)}</b><small>${escapeHtml(state.model.provider)} · configured</small></span>${icon("chevron-down", "small")}
  </button>`;
}

function sessionRows() {
  return state.sessions.map((session) => `<button class="session-row ${session.id === state.activeSession ? "selected" : ""}" data-session="${escapeHtml(session.id)}" title="Resume ${escapeHtml(session.title)}">
    <span class="session-icon">${icon(session.id === state.activeSession ? "message-circle" : "message-square", "small")}</span><span class="session-row-copy"><b>${escapeHtml(session.title)}</b><small>${escapeHtml(session.summary)}</small></span><time>${escapeHtml(session.time)}</time>
  </button>`).join("");
}

function sessionHeader() {
  const session = activeSession();
  const count = activeTools().length;
  return `<div class="session-heading">
    <span class="status-dot ${state.running ? "busy" : "ready"}"></span><div><b>${escapeHtml(session.title)}</b><small>${state.running ? escapeHtml(state.stage) : "Durable Session · ready for input"}</small></div><span class="grow"></span>
    <div class="heading-actions">
      <button class="activity-button" data-action="activity-toggle" aria-expanded="${state.activityOpen}" title="${state.activityOpen ? "Hide" : "Show"} Tool activity">${icon("list-checks", "small")}<span>Activity</span><span class="activity-count">${count}</span>${icon("chevron-down", "small")}</button>
      <button class="subtle-button" data-action="sessions" title="Browse Sessions">${icon("list", "small")}<span>Browse</span></button>
      ${state.running ? `<button class="interrupt-inline" data-action="interrupt" title="Interrupt active Run">${icon("square", "small")}<span>Interrupt Run</span></button>` : ""}
    </div>
  </div>`;
}

function toolRows() {
  if (!activeTools().length) return `<div class="no-activity">No Tool activity yet.</div>`;
  return activeTools().map((tool) => `<div class="tool-row ${tool.status === "running" ? "running" : ""}">
    <span class="tool-icon">${icon(tool.status === "running" ? "loader-circle" : "check", "small")}</span><b>${escapeHtml(tool.name)}</b><span>${escapeHtml(tool.detail)} · ${escapeHtml(tool.output)}</span><span class="tool-status ${tool.status}">${tool.status === "running" ? "Running" : tool.status === "interrupted" ? "Interrupted" : "Completed"}</span>
  </div>`).join("");
}

function activityStrip() {
  const tools = activeTools();
  const runningTool = tools.find((tool) => tool.status === "running");
  const summary = runningTool ? `${runningTool.name} · ${state.stage}` : tools.length ? `${tools.length} recorded events` : "No events";
  return `<section class="activity-strip-wrap" aria-label="Tool activity">
    <div class="activity-strip ${runningTool ? "running" : ""} ${state.activityOpen ? "expanded" : ""}">
      <span class="status-dot ${runningTool ? "busy" : "ready"}"></span><b>Tool activity</b><span class="activity-summary">${escapeHtml(summary)}${runningTool ? ` <strong>Running</strong>` : ""}</span>
      <button class="disclose" data-action="activity-toggle" aria-expanded="${state.activityOpen}">${state.activityOpen ? "Hide details" : "View details"}${icon("chevron-down", "small")}</button>
    </div>
    ${state.activityOpen ? `<div class="activity-detail">${toolRows()}</div>` : ""}
  </section>`;
}

function messageStream() {
  const messages = activeSession().messages.map((message) => `<article class="message ${message.role}">
    <div class="message-label"><span class="avatar ${message.role}">${message.role === "user" ? "YOU" : "DRY"}</span><b>${message.role === "user" ? "You" : "Drycode"}</b><time>${message.role === "user" ? "just now" : "response"}</time></div>
    <p>${escapeHtml(message.text)}</p>
  </article>`).join("");
  return `<div class="message-stream">${messages || `<div class="empty-message"><span class="empty-icon">${icon("message-square", "large")}</span><b>Start this Session</b><span>Ask Drycode to work in ${escapeHtml(state.workspace.name)}.</span></div>`}${activityStrip()}</div>`;
}

function composer() {
  return `<form class="composer" data-composer>
    <textarea aria-label="Message" placeholder="Message Drycode in this Session">${escapeHtml(state.draft)}</textarea>
    <div class="composer-bar"><button type="button" class="attach-button" data-action="attach" title="Add context" aria-label="Add context">${icon("paperclip")}</button><span class="compose-context">${escapeHtml(state.workspace.name)} · ${escapeHtml(state.model.name)} · Enter to send</span><span class="grow"></span>${state.running ? `<button type="button" class="interrupt-button" data-action="interrupt" title="Interrupt active Run">${icon("square", "small")}<span>Interrupt Run</span></button>` : `<button type="submit" class="send-button" data-action="send" title="Send message">${icon("send", "small")}<span>Send</span></button>`}</div>
  </form>`;
}

function variantA() {
  return `<div class="app-frame">${titlebar()}
    <div class="nav-layout"><nav class="navigation-view">
      <div class="nav-workspace">${workspaceButton()}</div>
      <button class="new-session" data-action="new-session" title="Start a new Session">${icon("plus", "small")}<span>New Session</span></button>
      <div class="nav-section"><span class="section-kicker">Workspace</span><button class="nav-link active"><span class="nav-icon">${icon("messages-square", "small")}</span><span>Sessions</span><em>${state.sessions.length}</em></button><button class="nav-link" data-action="workspace"><span class="nav-icon">${icon("folder-open", "small")}</span><span>Change Workspace</span></button></div>
      <div class="session-nav"><div class="section-kicker"><span>Recent Sessions</span><span class="grow"></span><button class="icon-button" data-action="new-session" title="New Session" aria-label="New Session">${icon("plus", "small")}</button></div>${sessionRows()}</div>
      <div class="nav-footer">${modelButton()}<button class="footer-link" data-action="reload" title="Reload Runtime">${icon("refresh-cw", "small")}<span>Reload Runtime</span></button></div>
    </nav><main class="chat-column">${sessionHeader()}${messageStream()}${composer()}</main></div>
    <div class="variant-note">${icon("panel-left", "small")}<span>Navigation view · <b>quiet activity</b></span></div>
  </div>`;
}

function modal() {
  if (!state.modal) return "";
  if (state.modal === "workspace") return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="workspace-title"><div class="dialog-title"><span class="dialog-icon">${icon("folder")}</span><div><span class="section-kicker">Workspace</span><h2 id="workspace-title">Select a Workspace</h2></div></div><p>A Session is permanently bound to the Workspace selected when it is created.</p><div class="workspace-options"><button data-workspace="drycode|D:\\work\\drycode" class="option-row ${state.workspace.name === "drycode" ? "chosen" : ""}"><span class="option-icon">${icon("folder", "small")}</span><span><b>drycode</b><small>D:\\work\\drycode</small></span>${state.workspace.name === "drycode" ? `<span class="option-check">${icon("check", "small")}</span>` : ""}</button><button data-workspace="agent-lab|D:\\work\\agent-lab" class="option-row ${state.workspace.name === "agent-lab" ? "chosen" : ""}"><span class="option-icon">${icon("folder", "small")}</span><span><b>agent-lab</b><small>D:\\work\\agent-lab</small></span>${state.workspace.name === "agent-lab" ? `<span class="option-check">${icon("check", "small")}</span>` : ""}</button><button class="option-row" data-action="choose-folder"><span class="option-icon">${icon("folder-plus", "small")}</span><span><b>Choose another folder</b><small>Open the native folder picker (stub)</small></span></button></div><div class="dialog-actions"><button class="plain-button" data-action="close-modal">Cancel</button></div></section></div>`;
  if (state.modal === "model") return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="model-title"><div class="dialog-title"><span class="dialog-icon amber">${icon("settings-2")}</span><div><span class="section-kicker">Session configuration</span><h2 id="model-title">Choose a Model</h2></div></div><p>The Model Provider owns discovery and credentials. This choice applies to the current Session.</p><label>Provider<select id="provider"><option ${state.model.provider === "Anthropic" ? "selected" : ""}>Anthropic</option><option ${state.model.provider === "OpenAI" ? "selected" : ""}>OpenAI</option><option ${state.model.provider === "Google" ? "selected" : ""}>Google</option></select></label><label>Model<select id="model"><option ${state.model.name === "Claude Sonnet 4" ? "selected" : ""}>Claude Sonnet 4</option><option ${state.model.name === "Claude Opus 4" ? "selected" : ""}>Claude Opus 4</option><option ${state.model.name === "Claude Haiku 3.5" ? "selected" : ""}>Claude Haiku 3.5</option></select></label><label>API credential<input type="password" value="************" aria-label="API credential"></label><div class="dialog-actions"><button class="plain-button" data-action="close-modal">Cancel</button><button class="new-session" data-action="save-model">Use Model</button></div></section></div>`;
  if (state.modal === "sessions") return `<div class="modal-shade" data-dismiss="true"><section class="dialog session-dialog" role="dialog" aria-modal="true" aria-labelledby="sessions-title"><div class="dialog-title"><span class="dialog-icon">${icon("messages-square")}</span><div><span class="section-kicker">${escapeHtml(state.workspace.name)}</span><h2 id="sessions-title">Open a Session</h2></div></div><p>Resume a durable conversation or start a new one in this Workspace.</p><div class="dialog-sessions">${sessionRows()}</div><div class="dialog-actions"><button class="plain-button" data-action="close-modal">Cancel</button><button class="new-session" data-action="new-session">${icon("plus", "small")}<span>New Session</span></button></div></section></div>`;
  if (state.modal === "reload") return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="reload-title"><div class="dialog-title"><span class="dialog-icon amber">${icon("refresh-cw")}</span><div><span class="section-kicker">Runtime lifecycle</span><h2 id="reload-title">Reload the Runtime?</h2></div></div><p>Drycode will stop the complete UI and Harness Runtime Generation, then start a fresh generation. Durable Sessions remain available.</p><div class="reload-note"><span class="status-dot busy"></span><span>Active work will be interrupted. Your Session record stays safe.</span></div><div class="dialog-actions"><button class="plain-button" data-action="close-modal">Cancel</button><button class="danger-button" data-action="confirm-reload">Reload Drycode</button></div></section></div>`;
  return `<div class="modal-shade"><section class="dialog reload-progress" role="dialog" aria-modal="true"><span class="dialog-icon amber">${icon("refresh-cw")}</span><span class="section-kicker">Runtime lifecycle</span><h2>Reloading Runtime</h2><p>Stopping the current generation and starting a fresh UI and Harness pair.</p><div class="progress-track"><span class="progress-fill"></span></div><small>Starting Runtime Generation 19</small></section></div>`;
}

function render() {
  document.querySelector("#app").innerHTML = `${variantA()}${modal()}${state.toast ? `<div class="toast" role="status">${escapeHtml(state.toast)}</div>` : ""}`;
  lucide.createIcons();
  bind();
}

function showToast(text) {
  state.toast = text;
  render();
  window.setTimeout(() => { state.toast = ""; render(); }, 1800);
}

function selectSession(id) {
  state.activeSession = id;
  state.modal = null;
  state.running = false;
  state.stage = "Ready";
  state.activityOpen = false;
  render();
}

function newSession() {
  const id = `session-${state.sessions.length + 1}`;
  state.sessions.unshift({ id, title: "Untitled Session", summary: "No messages yet", time: "Now", messages: [], tools: [] });
  state.activeSession = id;
  state.running = false;
  state.draft = "";
  state.modal = null;
  state.activityOpen = false;
  render();
}

function send() {
  const text = state.draft.trim();
  if (!text || state.running) return;
  const session = activeSession();
  session.messages.push({ role: "user", text });
  session.messages.push({ role: "assistant", text: "I will inspect the Workspace and keep the active Tool visible in the compact activity strip." });
  session.tools.push({ name: "workspace_scan", detail: "Workspace context", status: "running", output: "Inspecting Workspace" });
  session.summary = text;
  state.draft = "";
  state.running = true;
  state.stage = "Inspecting Workspace";
  state.activityOpen = false;
  render();
}

function interrupt() {
  const session = activeSession();
  state.running = false;
  state.stage = "Interrupted by user";
  session.tools = session.tools.map((tool) => tool.status === "running" ? { ...tool, status: "interrupted", output: `${tool.output} · Run interrupted by user` } : tool);
  session.messages.push({ role: "assistant", text: "Run interrupted. Completed messages and Tool results remain in this Session." });
  state.activityOpen = true;
  render();
}

function confirmReload() {
  state.modal = "reloading";
  render();
  window.setTimeout(() => {
    state.modal = null;
    state.running = false;
    state.stage = "Ready after Reload";
    activeTools().forEach((tool) => { if (tool.status === "running") tool.status = "interrupted"; });
    state.toast = "Runtime Generation reloaded";
    render();
    window.setTimeout(() => { state.toast = ""; render(); }, 1800);
  }, 1400);
}

function bind() {
  document.querySelectorAll("[data-action]").forEach((element) => element.addEventListener("click", (event) => {
    const action = element.dataset.action;
    if (action === "activity-toggle") { state.activityOpen = !state.activityOpen; return render(); }
    if (["workspace", "model", "sessions", "reload"].includes(action)) state.modal = action;
    if (action === "close-modal") state.modal = null;
    if (action === "new-session") return newSession();
    if (action === "interrupt") return interrupt();
    if (action === "attach") return showToast("Context attachment is a prototype stub");
    if (action === "choose-folder") return showToast("Native folder picker would open here");
    if (action === "save-model") {
      event.preventDefault();
      state.model.provider = document.querySelector("#provider").value;
      state.model.name = document.querySelector("#model").value;
      state.modal = null;
      state.toast = "Model configuration saved for this Session";
    }
    if (action === "confirm-reload") return confirmReload();
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
  if (event.key === "Escape" && state.modal) { state.modal = null; render(); }
});

render();
