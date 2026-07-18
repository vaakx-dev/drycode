const state = {
  workspace: { name: "drycode", path: "D:\\work\\drycode" },
  workspaces: [
    { name: "drycode", path: "D:\\work\\drycode" },
    { name: "agent-lab", path: "D:\\work\\agent-lab" },
  ],
  workspaceFilter: "all",
  model: { provider: "Anthropic", name: "Claude Sonnet 4", ready: true },
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
      title: "Extract the Harness",
      summary: "Compare runtime boundaries and hand-offs",
      time: "2h",
      messages: [{ role: "assistant", text: "A durable Session remains linear and can have at most one active Run." }],
      tools: [{ name: "read", detail: "Runtime notes", status: "completed", output: "Read 24 lines" }],
    },
    {
      id: "installer",
      workspace: "agent-lab",
      title: "Plan the Windows install",
      summary: "Stopped after comparing package formats",
      time: "Fri",
      messages: [{ role: "user", text: "Keep the first install experience small and understandable." }],
      tools: [],
    },
    {
      id: "recovery",
      workspace: "agent-lab",
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

const icon = (name, label = "") => `<i data-lucide="${name}"${label ? ` aria-label="${label}"` : ""}></i>`;
const activeSession = () => state.sessions.find((session) => session.id === state.activeSession) || state.sessions[0];
const activeTools = () => activeSession().tools;
const visibleSessions = () => state.workspaceFilter === "all" ? state.sessions : state.sessions.filter((session) => session.workspace === state.workspaceFilter);

function messageStream() {
  const messages = activeSession().messages.map((message) => `<article class="message ${message.role}"><p>${escapeHtml(message.text)}</p></article>`).join("");
  return `<div class="message-stream">${messages || `<div class="empty-message">${icon("message-circle")}<b>Start this Session</b><span>Ask Drycode to work in ${escapeHtml(state.workspace.name)}.</span></div>`}<section class="inline-tools" aria-label="Tool activity"><div class="section-kicker"><span>${icon("wrench")}Tool activity</span><span class="muted">${activeTools().length} events</span></div>${toolCards()}</section></div>`;
}

function toolCards() {
  if (!activeTools().length) return `<div class="no-activity">No Tool activity yet.</div>`;
  return activeTools().map((tool) => `<details class="tool-card" ${tool.status === "running" ? "open" : ""}>
    <summary><span class="tool-mark ${tool.status}">${icon(tool.status === "running" ? "loader-circle" : "circle-check")}</span><b>${escapeHtml(tool.name)}</b><span class="tool-detail">${escapeHtml(tool.detail)}</span><span class="tool-status ${tool.status}">${tool.status === "running" ? "Running" : "Completed"}</span>${icon("chevron-down", "Toggle tool output")}</summary>
    <pre>${escapeHtml(tool.output)}</pre>
  </details>`).join("");
}

function composer() {
  return `<form class="composer" data-composer>
    <textarea aria-label="Message" placeholder="Message Drycode in this Session...">${escapeHtml(state.draft)}</textarea>
    <div class="composer-bar"><div class="composer-context">${icon("panel-left")}<span>${escapeHtml(state.workspace.name)}</span><span class="context-slash">/</span><span>${escapeHtml(activeSession().title)}</span><span class="context-slash">/</span><button type="button" class="composer-model" data-action="model">${icon("cpu")}<span>${escapeHtml(state.model.name)}</span></button></div><span class="grow"></span>${state.running ? `<button type="button" class="interrupt-button" data-action="interrupt">${icon("square")}<span>Interrupt</span></button>` : `<button type="submit" class="send-button" data-action="send"><span>Send</span>${icon("arrow-up")}</button>`}</div>
  </form>`;
}

function featuredSessionCard(session, index) {
  const selected = session.id === state.activeSession;
  const running = selected && state.running;
  return `<button class="featured-session ${selected ? "selected" : ""}" data-session="${session.id}">
    <span class="featured-meta"><span class="session-source">${icon("message-square-code")}<b>${escapeHtml(session.workspace)}</b></span><time>${session.time}</time></span>
    <strong>${escapeHtml(session.title)}</strong>
    <span class="featured-status"><b class="${running ? "running" : ""}">${running ? "Running" : index === 0 ? "Active" : "Paused"}</b><span>${escapeHtml(running ? state.stage : session.summary)}</span>${icon(running ? "square" : "loader-circle")}</span>
  </button>`;
}

function settledSessionRow(session) {
  return `<button class="settled-session ${session.id === state.activeSession ? "selected" : ""}" data-session="${session.id}">
    ${icon("message-square")}<span>${escapeHtml(session.title)}</span><time>${session.time}</time>
  </button>`;
}

function navigationView() {
  const sessions = visibleSessions();
  const featured = sessions.slice(0, 2);
  const settled = sessions.slice(2);
  return `<nav class="navigation-view" aria-label="Drycode navigation">
    <header class="sidebar-brand"><button class="sidebar-icon" data-action="collapse-sidebar" aria-label="Collapse sidebar">${icon("panel-left-close")}</button><span class="sidebar-logo">${icon("panels-top-left")}</span><strong>Drycode</strong><span class="dev-badge">Dev</span></header>
    <div class="sidebar-actions">
      <button data-action="search">${icon("search")}<span>Search</span><kbd>Ctrl K</kbd></button>
      <button data-action="new-session">${icon("plus")}<span>New Session</span><kbd>Ctrl Shift O</kbd></button>
    </div>
    <div class="workspace-tabs">
      <button class="all-workspaces ${state.workspaceFilter === "all" ? "selected" : ""}" data-workspace-filter="all">All</button>
      ${state.workspaces.map((workspace) => `<button class="${state.workspaceFilter === workspace.name ? "selected" : ""}" data-workspace-filter="${escapeHtml(workspace.name)}">${icon("folder")}<span>${escapeHtml(workspace.name)}</span></button>`).join("")}
      <button class="add-workspace" data-action="choose-folder" aria-label="Add Workspace">${icon("plus")}</button>
    </div>
    <div class="sidebar-sessions">
      <div class="featured-sessions">${featured.map(featuredSessionCard).join("")}</div>
      <div class="settled-heading"><span>Settled</span><i></i></div>
      <div class="settled-sessions">${settled.map(settledSessionRow).join("")}</div>
    </div>
    <footer class="sidebar-footer"><button data-action="model">${icon("settings")}<span>Settings</span></button><button class="sidebar-icon" data-action="reload" aria-label="Reload Runtime" title="Reload Runtime">${icon("refresh-cw")}</button></footer>
  </nav>`;
}

function modal() {
  if (!state.modal) return "";
  if (state.modal === "model") return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="model-title"><div class="dialog-title"><span class="dialog-icon violet">${icon("cpu")}</span><div><span class="eyebrow">Session configuration</span><h2 id="model-title">Configure Model</h2></div></div><p>The Model Provider owns discovery and credentials. This choice applies to the current Session.</p><label>Provider<select id="provider"><option ${state.model.provider === "Anthropic" ? "selected" : ""}>Anthropic</option><option ${state.model.provider === "OpenAI" ? "selected" : ""}>OpenAI</option><option ${state.model.provider === "Google" ? "selected" : ""}>Google</option></select></label><label>Model<select id="model"><option ${state.model.name === "Claude Sonnet 4" ? "selected" : ""}>Claude Sonnet 4</option><option ${state.model.name === "Claude Opus 4" ? "selected" : ""}>Claude Opus 4</option><option ${state.model.name === "Claude Haiku 3.5" ? "selected" : ""}>Claude Haiku 3.5</option></select></label><label>API credential<input type="password" value="placeholder-credential" aria-label="API credential"></label><div class="dialog-actions"><button class="plain-button" data-action="close-modal">Cancel</button><button class="primary-button" data-action="save-model">${icon("check")}<span>Use Model</span></button></div></section></div>`;
  if (state.modal === "reload") return `<div class="modal-shade" data-dismiss="true"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="reload-title"><div class="dialog-title"><span class="dialog-icon amber">${icon("refresh-cw")}</span><div><span class="eyebrow">Runtime lifecycle</span><h2 id="reload-title">Reload the Runtime?</h2></div></div><p>Drycode will stop the complete UI and Harness Runtime Generation, then start a fresh generation. Durable Sessions remain available.</p><div class="reload-note">${icon("triangle-alert")}<span>Active work will be interrupted. Your Session record stays safe.</span></div><div class="dialog-actions"><button class="plain-button" data-action="close-modal">Cancel</button><button class="danger-button" data-action="confirm-reload">${icon("refresh-cw")}<span>Reload Drycode</span></button></div></section></div>`;
  return `<div class="modal-shade"><section class="dialog reload-progress" role="dialog" aria-modal="true"><span class="dialog-icon amber">${icon("refresh-cw")}</span><span class="eyebrow">Runtime lifecycle</span><h2>Reloading Runtime...</h2><p>Stopping the current generation and starting a fresh UI and Harness pair.</p><div class="progress-track"><i></i></div><small>Starting Runtime Generation 19</small></section></div>`;
}

function render() {
  document.querySelector("#app").innerHTML = `<div class="app-frame"><div class="nav-layout">${navigationView()}<main class="chat-column">${messageStream()}${composer()}</main></div></div>${modal()}${state.toast ? `<div class="toast" role="status">${icon("info")}<span>${escapeHtml(state.toast)}</span></div>` : ""}`;
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
  state.activeSession = id;
  state.modal = null;
  state.running = false;
  state.stage = "Ready";
  render();
}

function newSession() {
  const id = `session-${state.sessions.length + 1}`;
  const workspace = state.workspaceFilter === "all" ? state.workspace.name : state.workspaceFilter;
  state.sessions.unshift({ id, workspace, title: "Untitled Session", summary: "No messages yet", time: "Now", messages: [], tools: [] });
  state.activeSession = id;
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
      render();
    });
    picker.click();
  } catch (error) {
    if (error?.name !== "AbortError") showToast("The folder picker could not open");
  }
}

function filterWorkspace(name) {
  state.workspaceFilter = name;
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
    activeTools().forEach((tool) => { tool.status = "completed"; });
    render();
    showToast("Runtime Generation reloaded");
  }, 1400);
}

function bind() {
  document.querySelectorAll("[data-action]").forEach((element) => element.addEventListener("click", (event) => {
    const action = element.dataset.action;
    if (action === "send") event.preventDefault();
    if (["model", "reload"].includes(action)) state.modal = action;
    if (action === "close-modal") state.modal = null;
    if (action === "new-session") return newSession();
    if (action === "interrupt") return interrupt();
    if (action === "send") return send();
    if (action === "choose-folder") return chooseWorkspace();
    if (action === "search") return showToast("Session search would open here");
    if (action === "collapse-sidebar") return showToast("Sidebar collapse would keep an icon rail");
    if (action === "save-model") {
      state.model.provider = document.querySelector("#provider").value;
      state.model.name = document.querySelector("#model").value;
      state.modal = null;
      state.toast = "Model configuration saved for this Session";
    }
    if (action === "confirm-reload") return confirmReload();
    render();
  }));
  document.querySelectorAll("[data-session]").forEach((element) => element.addEventListener("click", () => selectSession(element.dataset.session)));
  document.querySelectorAll("[data-workspace-filter]").forEach((element) => element.addEventListener("click", () => filterWorkspace(element.dataset.workspaceFilter)));
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
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); showToast("Session search would open here"); }
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "o") { event.preventDefault(); newSession(); }
});

render();
