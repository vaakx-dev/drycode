const variant_names = {
  A: "Context rail",
  B: "Session shelf",
  C: "Run lane",
  D: "Focus canvas",
  E: "Start / resume",
};

const state = {
  variant: new URLSearchParams(location.search).get("variant")?.toUpperCase() || "A",
  workspace: { name: "drycode", path: "D:\\work\\drycode" },
  model: { provider: "Anthropic", name: "Claude Sonnet 4", ready: true },
  active_session: "shell",
  running: true,
  run_stage: "Reading Shell contract",
  draft: "",
  modal: null,
  sessions: [
    { id: "shell", title: "Shape the starter chat", summary: "Deciding what belongs above the fold", time: "now" },
    { id: "harness", title: "Extract the agent harness", summary: "Map the independent runtime seams", time: "2h" },
    { id: "installer", title: "Plan Windows install", summary: "Compare package formats", time: "Fri" },
    { id: "bridge", title: "Name bridge endpoints", summary: "Draft the first UI calls", time: "Thu" },
  ],
  messages: [
    { role: "user", text: "Review the starter experience. What should be visible before I send my first message?" },
    { role: "assistant", text: "Keep the first surface chat-first, but make its operating context explicit: Workspace, durable Session, Model, and the current Run. Tool activity should be inspectable without making Drycode feel like an IDE." },
  ],
  tools: [
    { name: "read", detail: "CONTEXT.md", status: "completed", output: "Read 76 lines\nWorkspace and Session are durable boundaries." },
    { name: "search", detail: "starter chat requirements", status: "running", output: "Looking through docs and prototype notes…" },
  ],
};

if (!variant_names[state.variant]) state.variant = "A";

const escape_html = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

function titlebar() {
  return `<header class="titlebar">
    <span class="app-glyph" aria-hidden="true">◒</span>
    <strong class="wordmark">drycode</strong>
    <span class="drag-region"></span>
    <span class="runtime-state"><i class="status-dot ${state.running ? "busy" : "ready"}"></i>${state.running ? "Run active" : "Ready"}</span>
    <div class="window-buttons" aria-hidden="true"><span>—</span><span>□</span><span>×</span></div>
  </header>`;
}

function workspace_button() {
  return `<button class="context-button workspace-button" data-action="workspace" title="Select Workspace">
    <span class="context-icon">▣</span><span class="button-copy"><small>WORKSPACE</small><b>${escape_html(state.workspace.name)}</b></span><span class="chevron">⌄</span>
  </button>`;
}

function model_button() {
  return `<button class="context-button model-button" data-action="model" title="Configure Model">
    <i class="status-dot ready"></i><span class="button-copy"><small>MODEL</small><b>${escape_html(state.model.name)}</b></span><span class="chevron">⌄</span>
  </button>`;
}

function session_button() {
  const active = state.sessions.find((item) => item.id === state.active_session) || state.sessions[0];
  return `<button class="session-button" data-action="sessions" title="Switch Session">
    <span class="session-mark">◷</span><span class="button-copy"><small>SESSION</small><b>${escape_html(active.title)}</b></span><span class="chevron">⌄</span>
  </button>`;
}

function session_items({ compact = false } = {}) {
  return `<div class="session-items">${state.sessions.map((session) => `<button class="session-row ${session.id === state.active_session ? "selected" : ""}" data-session="${session.id}">
    <span class="session-row-icon">${session.id === state.active_session ? "●" : "○"}</span><span class="session-row-copy"><b>${escape_html(session.title)}</b><small>${escape_html(session.summary)}</small></span><time>${session.time}</time>
  </button>`).join("")}</div>`;
}

function new_session_button(label = "New session") {
  return `<button class="new-session" data-action="new-session"><span>＋</span>${label}</button>`;
}

function tool_card(tool, extra = "") {
  return `<details class="tool-card ${extra}" ${tool.status === "running" ? "open" : ""}>
    <summary><span class="tool-symbol ${tool.status}">${tool.status === "running" ? "◌" : "✓"}</span><b>${escape_html(tool.name)}</b><span class="tool-detail">${escape_html(tool.detail)}</span><em>${tool.status === "running" ? "running" : "complete"}</em></summary>
    <pre>${escape_html(tool.output)}</pre>
  </details>`;
}

function activity_items() {
  return `<div class="activity-items">
    <div class="activity-item complete"><i>✓</i><span><b>Run started</b><small>just now · run 8A2F</small></span></div>
    <div class="activity-item complete"><i>✓</i><span><b>Response streamed</b><small>Drycode · 148 tokens</small></span></div>
    ${state.tools.map((tool) => `<div class="activity-item ${tool.status === "running" ? "active" : "complete"}"><i>${tool.status === "running" ? "◌" : "✓"}</i><span><b>${escape_html(tool.name)} <small>${escape_html(tool.detail)}</small></b><small>${tool.status === "running" ? "in progress" : "finished"}</small></span></div>`).join("")}
  </div>`;
}

function transcript({ bubbles = false, tools = true } = {}) {
  return `<section class="transcript ${bubbles ? "bubbles" : ""}">
    <div class="date-divider"><span>Today · ${escape_html(state.sessions.find((item) => item.id === state.active_session)?.title || "Session")}</span></div>
    ${state.messages.map((message) => `<article class="message ${message.role}">
      <div class="message-label"><span class="avatar">${message.role === "user" ? "YOU" : "DC"}</span><b>${message.role === "user" ? "You" : "Drycode"}</b><time>${message.role === "user" ? "10:42" : "10:43"}</time></div>
      <p>${escape_html(message.text)}</p>
    </article>`).join("")}
    ${tools ? `<div class="tool-stack"><span class="activity-label"><i class="status-dot busy"></i>Tool activity · ${state.tools.filter((tool) => tool.status === "running").length ? "live" : "complete"}</span>${state.tools.map((tool) => tool_card(tool)).join("")}</div>` : ""}
  </section>`;
}

function composer({ class_name = "", context = true } = {}) {
  return `<form class="composer ${class_name}" data-composer>
    <textarea aria-label="Message Drycode" placeholder="Message this Session…">${escape_html(state.draft)}</textarea>
    <div class="composer-toolbar"><button type="button" class="toolbar-icon" title="Add context">＋</button><span class="composer-context">${context ? `${escape_html(state.workspace.name)}  ·  ${escape_html(state.model.name)}` : "Session context attached"}</span><span class="grow"></span><span class="key-hint">Enter to send</span>${state.running ? `<button type="button" class="interrupt" data-action="interrupt">■ Interrupt</button>` : `<button type="submit" class="send">Send <span>↑</span></button>`}</div>
  </form>`;
}

function reload_button() { return `<button class="reload-button" data-action="reload"><span>↻</span> Reload</button>`; }

function variant_a() {
  return `<div class="window variant-a">${titlebar()}<div class="a-layout">
    <aside class="context-rail"><div class="rail-section rail-context"><span class="section-kicker">CURRENT CONTEXT</span>${workspace_button()}${session_button()}${model_button()}</div>
      <div class="rail-section rail-sessions"><div class="section-heading"><span class="section-kicker">SESSIONS</span>${new_session_button("＋")}</div>${session_items()}</div>
      <div class="rail-footer">${reload_button()}<span class="footer-note">Local runtime · Generation 12</span></div>
    </aside>
    <main class="chat-column"><header class="chat-header"><div><span class="section-kicker">DURABLE SESSION</span><h1>Shape the starter chat</h1></div><span class="run-pill"><i class="status-dot busy"></i>${state.running ? state.run_stage : "Run idle"}</span></header>${transcript()}${composer()}</main>
    <aside class="run-drawer"><div class="drawer-heading"><div><span class="section-kicker">RUN ACTIVITY</span><h2>Current Run</h2></div><span class="live-tag">LIVE</span></div><div class="run-summary"><span class="run-number">RUN 8A2F</span><strong>${state.running ? state.run_stage : "Run complete"}</strong><small>${state.running ? "The Session is receiving streamed output" : "All output is recorded in this Session"}</small></div>${activity_items()}<div class="drawer-actions">${state.running ? `<button class="interrupt wide" data-action="interrupt">■ Interrupt active Run</button>` : `<span class="idle-note">No active Run</span>`}</div></aside>
  </div></div>`;
}

function variant_b() {
  return `<div class="window variant-b">${titlebar()}<header class="b-toolbar"><div class="toolbar-workspace">${workspace_button()}</div>${new_session_button("New Session")}<span class="grow"></span>${model_button()}${reload_button()}</header>
    <div class="b-layout"><aside class="session-shelf"><div class="shelf-title"><span class="section-kicker">WORKSPACE SESSIONS</span><span class="count">${state.sessions.length}</span></div>${session_items()}<div class="shelf-bottom"><span class="section-kicker">BOUND TO</span><code>${escape_html(state.workspace.path)}</code></div></aside>
      <main class="stage"><div class="stage-top"><div class="stage-session"><span class="session-mark">◷</span><div><span class="section-kicker">ACTIVE SESSION</span><h1>Shape the starter chat</h1></div></div><div class="stage-actions"><button data-action="sessions">Switch</button>${reload_button()}</div></div>${transcript({ bubbles: true })}${composer({ class_name: "stage-composer", context: false })}</main>
    </div></div>`;
}

function variant_c() {
  return `<div class="window variant-c">${titlebar()}<header class="c-header"><div class="c-context">${workspace_button()}</div><div class="c-session">${session_button()}</div><div class="c-model">${model_button()}</div>${reload_button()}</header>
    <div class="c-layout"><main class="thread"><div class="thread-heading"><div><span class="section-kicker">CONVERSATION</span><h1>Shape the starter chat</h1></div><span class="thread-state"><i class="status-dot ${state.running ? "busy" : "ready"}"></i>${state.running ? "RUNNING" : "IDLE"}</span></div>${transcript({ tools: false })}${state.tools.map((tool) => tool_card(tool, "lane-tool")).join("")}${composer({ class_name: "thread-composer" })}</main>
      <aside class="run-lane"><div class="lane-heading"><span class="section-kicker">RUN LANE</span><span class="run-number">8A2F</span></div><div class="lane-status"><i class="status-dot ${state.running ? "busy" : "ready"}"></i><b>${state.running ? "Working in Session" : "Run stopped"}</b><small>${state.running ? state.run_stage : "Ready for a new message"}</small></div>${activity_items()}<div class="lane-bottom">${state.running ? `<button class="interrupt wide" data-action="interrupt">■ Interrupt</button>` : `<button class="send wide" data-action="send">Send next message</button>`}<p>Tools stay in a dedicated lane so the conversation remains readable.</p></div></aside>
    </div></div>`;
}

function variant_d() {
  return `<div class="window variant-d">${titlebar()}<header class="focus-bar"><div class="focus-brand"><span class="app-glyph">◒</span><b>Starter chat</b></div><div class="focus-context">${workspace_button()}<span class="context-separator">/</span>${session_button()}<span class="context-separator">/</span>${model_button()}</div><div class="focus-actions">${reload_button()}<button class="icon-button" data-action="sessions" title="All Sessions">☷</button></div></header>
    <main class="focus-main"><div class="focus-title"><span class="section-kicker">SESSION · ACTIVE NOW</span><h1>Shape the starter chat</h1><p>Ask Drycode to inspect the Workspace, make a plan, or continue where you left off.</p></div>${transcript({ bubbles: true, tools: false })}<div class="focus-activity"><div class="focus-activity-copy"><i class="status-dot ${state.running ? "busy" : "ready"}></i><span><b>${state.running ? state.run_stage : "No active Run"}</b><small>${state.running ? "Tool activity is available below" : "Send a message to begin a Run"}</small></span></div><button class="activity-toggle" data-action="activity">${state.running ? "View Tool activity" : "Show last Run"} <span>›</span></button></div>${composer({ class_name: "focus-composer" })}</main>
  </div>`;
}

function variant_e() {
  return `<div class="window variant-e">${titlebar()}<div class="e-layout"><aside class="start-panel"><div class="start-intro"><span class="section-kicker">DRYCODE STARTER</span><h1>Pick up the work.</h1><p>Choose a Workspace, then resume a durable Session or begin a new one.</p></div>${workspace_button()}<div class="start-divider"></div><div class="start-session-heading"><span class="section-kicker">RECENT SESSIONS</span><span class="count">${state.sessions.length}</span></div>${session_items()}${new_session_button("＋ New session")}<div class="start-footer">${model_button()}${reload_button()}</div></aside>
    <main class="e-chat"><header class="e-chat-head"><div><span class="section-kicker">RESUMING SESSION</span><h2>Shape the starter chat</h2></div><span class="e-path">${escape_html(state.workspace.path)}</span></header><div class="e-body">${transcript({ bubbles: true, tools: false })}<div class="e-run-card"><div class="e-run-top"><span class="section-kicker">LATEST RUN</span><span class="run-number">8A2F</span></div><div class="e-run-content"><div class="e-run-copy"><i class="status-dot ${state.running ? "busy" : "ready"}></i><span><b>${state.running ? "Drycode is working" : "Run interrupted"}</b><small>${state.running ? state.run_stage : "The Session is ready to continue"}</small></span></div><div class="e-tools">${state.tools.map((tool) => `<span class="mini-tool ${tool.status}">${tool.status === "running" ? "◌" : "✓"} ${escape_html(tool.name)}</span>`).join("")}</div>${state.running ? `<button class="interrupt" data-action="interrupt">■ Interrupt</button>` : ""}</div></div>${composer({ class_name: "e-composer", context: false })}</div></main>
  </div></div>`;
}

function switcher() {
  return `<nav class="prototype-switcher" aria-label="Prototype variants"><button data-action="previous-variant" aria-label="Previous variant">←</button><span><b>${state.variant}</b> · ${variant_names[state.variant]}</span><button data-action="next-variant" aria-label="Next variant">→</button></nav>`;
}

function modal() {
  if (!state.modal) return "";
  const backdrop = (content) => `<div class="modal-backdrop" data-dismiss="true"><section class="modal" role="dialog" aria-modal="true">${content}</section></div>`;
  if (state.modal === "workspace") return backdrop(`<span class="section-kicker">SELECT WORKSPACE</span><h2>Where should Drycode work?</h2><p>A Session is permanently bound to its Workspace. Select a folder to continue.</p><div class="option-list"><button class="option" data-workspace="drycode|D:\\work\\drycode"><span>▣</span><span><b>drycode</b><small>D:\\work\\drycode</small></span></button><button class="option" data-workspace="agent-lab|D:\\work\\agent-lab"><span>▣</span><span><b>agent-lab</b><small>D:\\work\\agent-lab</small></span></button><button class="option"><span>＋</span><span><b>Choose another folder…</b><small>Opens the Windows folder picker</small></span></button></div><div class="modal-actions"><button data-action="close-modal">Cancel</button></div>`);
  if (state.modal === "model") return backdrop(`<span class="section-kicker">SESSION MODEL</span><h2>Configure Model</h2><p>The Model Provider handles discovery and credentials for this Session.</p><label>Provider<select id="provider"><option>Anthropic</option><option>OpenAI</option><option>Google</option></select></label><label>Model<select id="model"><option>Claude Sonnet 4</option><option>Claude Opus 4</option><option>Claude Haiku 3.5</option></select></label><label>API credential<input type="password" value="••••••••••••" aria-label="API credential"></label><div class="modal-actions"><button data-action="close-modal">Cancel</button><button class="primary" data-action="save-model">Use model</button></div>`);
  if (state.modal === "sessions") return backdrop(`<span class="section-kicker">${escape_html(state.workspace.name)} · DURABLE</span><h2>Open a Session</h2><p>Resume a conversation or start a new one in this Workspace.</p>${session_items()}<div class="modal-actions"><button data-action="close-modal">Cancel</button><button class="primary" data-action="new-session">＋ New session</button></div>`);
  if (state.modal === "activity") return backdrop(`<span class="section-kicker">CURRENT RUN · 8A2F</span><h2>Tool activity</h2><p>Inspect the work without leaving the conversation.</p>${activity_items()}<div class="modal-actions">${state.running ? `<button class="interrupt" data-action="interrupt">■ Interrupt Run</button>` : ""}<button data-action="close-modal">Done</button></div>`);
  if (state.modal === "reloading") return backdrop(`<span class="section-kicker">RUNTIME LIFECYCLE</span><h2>Reloading Drycode…</h2><p>Stopping the current UI and Harness Runtime Generation, then starting a fresh pair. Durable Sessions remain available.</p><span class="reload-progress"><i class="status-dot busy"></i>Starting Generation 13</span>`);
  return backdrop(`<span class="section-kicker">RUNTIME LIFECYCLE</span><h2>Reload all extensions?</h2><p>Drycode will stop the complete Runtime Generation and start a fresh one. Any active Run will be interrupted.</p><div class="modal-actions"><button data-action="close-modal">Cancel</button><button class="danger" data-action="confirm-reload">Reload Drycode</button></div>`);
}

function render() {
  const view = { A: variant_a, B: variant_b, C: variant_c, D: variant_d, E: variant_e }[state.variant]();
  document.querySelector("#app").innerHTML = `${view}${switcher()}${modal()}`;
  bind();
}

function cycle_variant(step) {
  const keys = Object.keys(variant_names);
  state.variant = keys[(keys.indexOf(state.variant) + step + keys.length) % keys.length];
  const url = new URL(location.href);
  url.searchParams.set("variant", state.variant);
  history.replaceState(null, "", url);
  render();
}

function send() {
  const text = state.draft.trim();
  if (!text || state.running) return;
  state.messages.push({ role: "user", text });
  state.messages.push({ role: "assistant", text: "I’ll inspect the Workspace and keep the Tool activity visible while I work." });
  state.draft = "";
  state.running = true;
  state.run_stage = "Inspecting Workspace";
  state.tools.push({ name: "search", detail: "Workspace structure", status: "running", output: "Searching files…" });
  render();
}

function bind() {
  document.querySelectorAll("[data-action]").forEach((element) => element.addEventListener("click", () => {
    const action = element.dataset.action;
    if (["workspace", "model", "sessions", "reload", "activity"].includes(action)) state.modal = action;
    if (action === "close-modal") state.modal = null;
    if (action === "previous-variant") return cycle_variant(-1);
    if (action === "next-variant") return cycle_variant(1);
    if (action === "new-session") {
      const id = `session-${state.sessions.length + 1}`;
      state.sessions.unshift({ id, title: "Untitled session", summary: "No messages yet", time: "now" });
      state.active_session = id;
      state.messages = [];
      state.tools = [];
      state.running = false;
      state.run_stage = "Ready for a message";
      state.modal = null;
    }
    if (action === "interrupt") {
      state.running = false;
      state.run_stage = "Run interrupted";
      state.tools = state.tools.map((tool) => tool.status === "running" ? { ...tool, status: "completed", output: `${tool.output}\nInterrupted by user.` } : tool);
      state.messages.push({ role: "assistant", text: "Run interrupted. Completed output and Tool results remain in this Session." });
      state.modal = null;
    }
    if (action === "send") send();
    if (action === "save-model") {
      state.model.name = document.querySelector("#model").value;
      state.model.provider = document.querySelector("#provider").value;
      state.model.ready = true;
      state.modal = null;
    }
    if (action === "confirm-reload") {
      state.modal = "reloading";
      render();
      window.setTimeout(() => { state.modal = null; state.running = false; state.run_stage = "Runtime ready"; state.tools = state.tools.map((tool) => ({ ...tool, status: "completed" })); render(); }, 1200);
      return;
    }
    render();
  }));

  document.querySelectorAll("[data-session]").forEach((element) => element.addEventListener("click", () => {
    state.active_session = element.dataset.session;
    state.running = false;
    state.run_stage = "Session ready";
    state.tools = state.tools.map((tool) => ({ ...tool, status: "completed" }));
    state.modal = null;
    render();
  }));

  document.querySelectorAll("[data-workspace]").forEach((element) => element.addEventListener("click", () => {
    const [name, path] = element.dataset.workspace.split("|");
    state.workspace = { name, path };
    state.modal = null;
    render();
  }));

  document.querySelectorAll(".modal-backdrop[data-dismiss]").forEach((element) => element.addEventListener("click", (event) => {
    if (event.target === element) { state.modal = null; render(); }
  }));

  document.querySelectorAll("textarea").forEach((textarea) => {
    textarea.addEventListener("input", () => { state.draft = textarea.value; });
    textarea.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); state.draft = textarea.value; send(); }
    });
  });
  document.querySelectorAll("[data-composer]").forEach((form) => form.addEventListener("submit", (event) => { event.preventDefault(); state.draft = form.querySelector("textarea").value; send(); }));
}

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const editing = target.matches?.("input, textarea, select, [contenteditable]");
  if (!editing && event.key === "ArrowLeft") cycle_variant(-1);
  if (!editing && event.key === "ArrowRight") cycle_variant(1);
  if (event.key === "Escape" && state.modal) { state.modal = null; render(); }
});

render();
