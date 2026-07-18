const state = {
  workspace: { name: "drycode", path: "D:\\work\\drycode" },
  model: { provider: "Anthropic", name: "Claude Sonnet 4" },
  activeSession: "contract",
  running: true,
  stage: "Searching Session records",
  modal: null,
  menu: false,
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
        { role: "assistant", text: "Workspace, durable Sessions, the selected Model, and a clear view of each Run. I will keep the surface focused on asking Drycode to work and watching what it does." },
      ],
      tools: [
        { name: "session_lookup", detail: "Durable Session record", status: "completed", output: "Session contract / 12 records" },
        { name: "workspace_scan", detail: "Workspace context", status: "running", output: "Reading workspace context..." },
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
const icon = (name, label = "") => `<i data-lucide="${name}"${label ? ` aria-label="${escapeHtml(label)}"` : ""} aria-hidden="${label ? "false" : "true"}></i>`;

function titlebar() {
  return `<header class="titlebar">
    <span class="app-mark">${icon("message-square")}</span>
    <strong class="wordmark">drycode</strong><span class="title-separator">/</span><span class="window-title">Chat</span>
    <span class="window-drag"></span>
    <span class="runtime-state"><span class="status-dot ${state.running ? "busy" : "ready"}"></span>${state.running ? "Run active" : "Ready"}</span>
    <div class="window-controls" aria-label="Window controls"><button class="window-control" type="button" title="Minimize">${icon("minus", "Minimize")}</button><button class="window-control" type="button" title="Maximize">${icon("square", "Maximize")}</button><button class="window-control close" type="button" title="Close">${icon("x", "Close")}</button></div>
  </header>`;
}

function workspaceButton() {
  return `<button class="workspace-button" data-action="workspace" title="Select Workspace">
    <span class="workspace-symbol">${icon("folder-open")}</span><span class="button-copy"><b>${escapeHtml(state.workspace.name)}</b><small>${escapeHtml(state.workspace.path)}</small></span><span class="chevron">${icon("chevron-down")}</span>
  </button>`;
}

function modelButton() {
  return `<button class="model-button" data-action="model" title="Configure Model">
    <span class="model-symbol">${icon("sliders-horizontal")}</span><span class="button-copy"><b>${escapeHtml(state.model.name)}</b><small>${escapeHtml(state.model.provider)} / configured</small></span><span class="chevron">${icon("chevron-down")}</span>
  </button>`;
}

function sessionRows() {
  return state.sessions.map((session) => `<button class="session-row ${session.id === state.activeSession ? "selected" : ""}" data-session="${escapeHtml(session.id)}" title="Resume ${escapeHtml(session.title)}">
    <span class="session-icon">${icon(session.id === state.activeSession ? "circle-dot" : "circle")}</span><span class="session-row-copy"><b>${escapeHtml(session.title)}</b><small>${escapeHtml(session.summary)}</small></span><time>${session.time}</time>
  </button>`).join("");
}

function sessionHeading() {
  const session = activeSession();
  return `<div class="session-heading">
    <span class="status-dot ${state.running ? "busy" : "ready"}"></span><div><b>${escapeHtml(session.title)}</b><small>${state.running ? escapeHtml(state.stage) : "Durable Session / ready for input"}</small></div><span class="grow"></span>
    <button class="subtle-button" data-action="sessions">All Sessions</button>
    <span class="more-wrap"><button class="more-button icon-button" data-action="more" title="More Session actions" aria-expanded="${state.menu}">${icon("more-horizontal", "More Session actions")}</button>${state.menu ? `<span class="more-menu" role="menu"><button type="button" data-action="session-details">${icon("info")} Session details</button><button type="button" data-action="copy-session">${icon("copy")} Copy Session ID</button></span>` : ""}</span>
  </div>`;
}

function toolCards() {
  if (!activeTools().length) return `<div class="no-activity">No Tool activity yet.</div>`;
  return activeTools().map((tool) => `<details class="tool-card" ${tool.status === "running" ? "open" : ""}>
    <summary><span class="tool-mark ${tool.status}">${icon(tool.status === "running" ? "loader-circle" : "check-circle-2")}</span><b>${escapeHtml(tool.name)}</b><span class="tool-detail">${escapeHtml(tool.detail)}</span><span class="tool-status ${tool.status}">${tool.status === "running" ? "Running" : "Completed"}</span></summary>
    <pre>${escapeHtml(tool.output)}</pre>
  </details>`).join("");
}

function messageStream() {
  const messages = activeSession().messages.map((message) => `<article class="message ${message.role}">
    <div class="message-label"><span class="avatar ${message.role}">${message.role === "user" ? "YOU" : "DRY"}</span><b>${message.role === "user" ? "You" : "Drycode"}</b><time>${message.role === "user" ? "just now" : "response"}</time></div>
    <p>${escapeHtml(message.text)}</p>
  </article>`).join("");
  const tools = `<section class="inline-tools" aria-label="Tool activity"><div class="section-kicker">${icon("activity")}<span>Tool activity</span><span class="muted">${activeTools().length} events</span></div>${toolCards()}</section>`;
  return `<div class="message-stream"><div class="transcript-inner">${messages || `<div class="empty-message"><span class="empty-icon">${icon("message-circle")}</span><b>Start this Session</b><span>Ask Drycode to work in ${escapeHtml(state.workspace.name)}.</span></div>`}${tools}</div></div>`;
}

function composer() {
  return `<form class="composer" data-composer>
    <textarea aria-label="Message" placeholder="Message Drycode in this Session...">${escapeHtml(state.draft)}</textarea>
    <div class="composer-bar"><button type="button" class="attach-button icon-button" data-action="attach" title="Add context">${icon("paperclip", "Add context")}</button><span class="compose-context">Enter to send / Shift+Enter for newline</span><span class="grow"></span>${state.running ? `<button type="button" class="interrupt-button" data-action="interrupt">${icon("square")} Interrupt</button>` : `<button type="submit" class="send-button" data-action="send">Send ${icon("arrow-up")}</button>`}</div>
  </form>`;
}

function navigationView() {
  return `<nav class="navigation-view">
    <div class="nav-workspace">${workspaceButton()}</div>
    <button class="new-session primary-button" data-action="new-session">${icon("plus")} New Session</button>
    <div class="nav-section"><span class="section-kicker">Workspace</span><button class="nav-link active">${icon("list")} Sessions <em>${state.sessions.length}</em></button><button class="nav-link" data-action="workspace">${icon("folder") } Change Workspace</button></div>
    <div class="session-nav"><div class="section-kicker"><span>Recent Sessions</span><span class="grow"></span><button class="mini-button" data-action="new-session" title="Start a new Session">${icon("plus", "Start a new Session")}</button></div>${sessionRows()}</div>
    <div class="nav-footer">${modelButton()}<button class="footer-link" data-action="reload">${icon("rotate-ccw")} Reload Runtime</button></div>
  </nav>`;
}

function variantA() {
  return `<div class="app-frame">${titlebar()}<div class="nav-layout">${navigationView()}<main class="chat-column">${sessionHeading()}${messageStream()}${composer()}</main></div>${variantPicker()}</div>`;
}

function variantPicker() {
  return `<nav class="variant-picker" aria-label="Exploration variants"><span class="picker-label">Explore</span><button class="variant-choice selected" type="button" title="Quiet command bar">A</button><span class="picker-name">Navigation view / refined</span></nav>`;
}

function modal() {
  if (!state.modal) return "";
  if (state.modal === "workspace") return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true"><div class="dialog-title"><span class="dialog-icon">${icon("folder-open")}</span><div><span class="section-kicker">Workspace</span><h2>Select a Workspace</h2></div></div><p>A Session is permanently bound to the Workspace selected when it is created.</p><div class="workspace-options"><button data-workspace="drycode|D:\\work\\drycode" class="option-row ${state.workspace.name === "drycode" ? "chosen" : ""}"><span class="option-icon">${icon("folder")}</span><span><b>drycode</b><small>D:\\work\\drycode</small></span><span class="option-check">${state.workspace.name === "drycode" ? icon("check") : ""}</span></button><button data-workspace="agent-lab|D:\\work\\agent-lab" class="option-row ${state.workspace.name === "agent-lab" ? "chosen" : ""}"><span class="option-icon">${icon("folder")}</span><span><b>agent-lab</b><small>D:\\work\\agent-lab</small></span><span class="option-check">${state.workspace.name === "agent-lab" ? icon("check") : ""}</span></button><button class="option-row" data-action="choose-folder"><span class="option-icon">${icon("folder-plus")}</span><span><b>Choose another folder...</b><small>Open the native folder picker (stub)</small></span></button></div><div class="dialog-actions"><button class="plain-button" data-action="close-modal">Cancel</button></div></section></div>`;
  if (state.modal === "model") return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true"><div class="dialog-title"><span class="dialog-icon amber">${icon("sliders-horizontal")}</span><div><span class="section-kicker">Session configuration</span><h2>Choose a Model</h2></div></div><p>The Model Provider owns discovery and credentials. This choice applies to the current Session.</p><label>Provider<select id="provider"><option ${state.model.provider === "Anthropic" ? "selected" : ""}>Anthropic</option><option ${state.model.provider === "OpenAI" ? "selected" : ""}>OpenAI</option><option ${state.model.provider === "Google" ? "selected" : ""}>Google</option></select></label><label>Model<select id="model"><option>Claude Sonnet 4</option><option>Claude Opus 4</option><option>Claude Haiku 3.5</option></select></label><label>API credential<input type="password" value="************" aria-label="API credential"></label><div class="dialog-actions"><button class="plain-button" data-action="close-modal">Cancel</button><button class="primary-button" data-action="save-model">Use Model</button></div></section></div>`;
  if (state.modal === "sessions") return `<div class="modal-shade" data-dismiss="true"><section class="dialog session-dialog" role="dialog" aria-modal="true"><div class="dialog-title"><span class="dialog-icon">${icon("list")}</span><div><span class="section-kicker">${escapeHtml(state.workspace.name)}</span><h2>Open a Session</h2></div></div><p>Resume a durable conversation or start a new one in this Workspace.</p><div class="dialog-sessions">${sessionRows()}</div><div class="dialog-actions"><button class="plain-button" data-action="close-modal">Cancel</button><button class="primary-button" data-action="new-session">${icon("plus")} New Session</button></div></section></div>`;
  if (state.modal === "reload") return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true"><div class="dialog-title"><span class="dialog-icon amber">${icon("rotate-ccw")}</span><div><span class="section-kicker">Runtime lifecycle</span><h2>Reload the Runtime?</h2></div></div><p>Drycode will stop the complete UI and Harness Runtime Generation, then start a fresh generation. Durable Sessions remain available.</p><div class="reload-note"><span class="status-dot busy"></span><span>Active work will be interrupted. Your Session record stays safe.</span></div><div class="dialog-actions"><button class="plain-button" data-action="close-modal">Cancel</button><button class="danger-button" data-action="confirm-reload">${icon("rotate-ccw")} Reload Drycode</button></div></section></div>`;
  return `<div class="modal-shade"><section class="dialog reload-progress" role="dialog" aria-modal="true"><span class="dialog-icon amber">${icon("loader-circle")}</span><span class="section-kicker">Runtime lifecycle</span><h2>Reloading Runtime...</h2><p>Stopping the current generation and starting a fresh UI and Harness pair.</p><div class="progress-track"><i></i></div><small>Starting Runtime Generation 19</small></section></div>`;
}

function render() {
  document.querySelector("#app").innerHTML = `${variantA()}${modal()}${state.toast ? `<div class="toast" role="status">${escapeHtml(state.toast)}</div>` : ""}`;
  if (window.lucide) lucide.createIcons();
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
  state.menu = false;
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
  state.menu = false;
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
  document.querySelectorAll("[data-action]").forEach((element) => element.addEventListener("click", (event) => {
    const action = element.dataset.action;
    if (action === "more") { state.menu = !state.menu; render(); return; }
    if (["workspace", "model", "sessions", "reload"].includes(action)) { state.modal = action; state.menu = false; render(); return; }
    if (action === "close-modal") { state.modal = null; render(); return; }
    if (action === "new-session") { newSession(); return; }
    if (action === "interrupt") { interrupt(); return; }
    if (action === "send") { event.preventDefault(); send(); return; }
    if (action === "attach") { showToast("Context attachment is a prototype stub"); return; }
    if (action === "choose-folder") { showToast("Native folder picker would open here"); return; }
    if (action === "session-details") { showToast("Session details would open here"); state.menu = false; return; }
    if (action === "copy-session") { showToast("Session ID copied (prototype stub)"); state.menu = false; return; }
    if (action === "save-model") {
      state.model.provider = document.querySelector("#provider").value;
      state.model.name = document.querySelector("#model").value;
      state.modal = null;
      state.toast = "Model configuration saved for this Session";
      render();
      return;
    }
    if (action === "confirm-reload") {
      state.modal = "reloading";
      render();
      window.setTimeout(() => { state.modal = null; state.running = false; state.stage = "Ready after Reload"; activeTools().forEach((tool) => { tool.status = "completed"; }); render(); }, 1400);
    }
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

render();
