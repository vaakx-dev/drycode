const variant_info = {
  A: { name: "Command deck", hypothesis: "A command strip can make the small set of global actions discoverable without turning chat into an IDE." },
  B: { name: "Focus canvas", hypothesis: "A single calm canvas keeps attention on the conversation; operational detail can appear as a purposeful drawer." },
  C: { name: "Session shelf", hypothesis: "Sessions are the main wayfinding object, so a persistent shelf can make resume/new behavior obvious." },
  D: { name: "Run ledger", hypothesis: "A run is a first-class object; a parallel ledger makes Tool activity and interruption legible without hiding chat." },
  E: { name: "Launcher home", hypothesis: "A compact launcher gives a new user a useful starting point while keeping the active Session one click away." },
};
const keys = Object.keys(variant_info);
const query_variant = new URLSearchParams(location.search).get("variant")?.toUpperCase();

const state = {
  variant: variant_info[query_variant] ? query_variant : "A",
  workspace: { name: "drycode", path: "D:\\app\\drycode" },
  model: { provider: "Anthropic", name: "Claude Sonnet 4", ready: true },
  active_session: "contract",
  running: true,
  run_stage: "Searching bridge contracts",
  modal: null,
  draft: "",
  toast: "",
  sessions: [
    { id: "contract", title: "Shape the shell contract", summary: "Separating UI behavior from Core lifecycle", time: "now" },
    { id: "harness", title: "Extract the agent harness", summary: "Mapped reusable runtime seams", time: "2h" },
    { id: "installer", title: "Plan the Windows installer", summary: "Comparing package formats", time: "Fri" },
  ],
  messages: [
    { role: "user", text: "Review the shell contract and tell me what the starter chat needs to own." },
    { role: "assistant", text: "I’ll trace the Shell service, bridge endpoints, and Session operations, then separate chat-owned behavior from Core lifecycle behavior." },
  ],
  tools: [
    { name: "read", detail: "docs/adr/0004-shell-contract.md", status: "completed", output: "Read 184 lines\nShell owns the complete web-content subtree." },
    { name: "search", detail: "Session operations and bridge endpoints", status: "running", output: "Searching CONTEXT.md and planning records…" },
  ],
};

const esc = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const active = () => state.sessions.find((session) => session.id === state.active_session) || state.sessions[0];
const dot = (kind = "ready") => `<span class="dot ${kind}"></span>`;
const button = (label, action, class_name = "") => `<button class="${class_name}" data-action="${action}">${label}</button>`;

function titlebar() {
  return `<header class="titlebar"><span class="mark"></span><strong>drycode</strong><span class="title-sub">starter chat / exploration</span><span class="drag"></span><span class="window-status">${dot(state.running ? "running" : "ready")} ${state.running ? "Run active" : "Ready"}</span><span class="window-controls">—　□　×</span></header>`;
}
function workspace_button() { return `<button class="context-button" data-action="workspace"><span class="glyph">▱</span><span><small>WORKSPACE</small><strong>${esc(state.workspace.name)}</strong></span><span class="chevron">⌄</span></button>`; }
function session_button() { return `<button class="context-button" data-action="sessions"><span class="glyph">◈</span><span><small>SESSION</small><strong>${esc(active().title)}</strong></span><span class="chevron">⌄</span></button>`; }
function model_button() { return `<button class="model-button" data-action="model">${dot("ready")}<span>${esc(state.model.name)}</span><span class="chevron">⌄</span></button>`; }
function new_button(label = "＋ New session") { return button(label, "new-session", "primary"); }

function message_markup() {
  return state.messages.map((message) => `<article class="message ${message.role}"><div class="message-label"><span class="avatar">${message.role === "user" ? "YOU" : "DRY"}</span><span>${message.role === "user" ? "You" : "Drycode"}</span><span class="message-time">${message.role === "user" ? "just now" : "streaming"}</span></div><p>${esc(message.text)}</p></article>`).join("");
}
function tool_markup({ compact = false } = {}) {
  return state.tools.map((tool, index) => `<details class="tool ${tool.status} ${compact ? "compact" : ""}" ${tool.status === "running" ? "open" : ""}><summary><span class="tool-index">${index + 1}</span>${dot(tool.status === "running" ? "running" : "ready")}<strong>${esc(tool.name)}</strong><span class="tool-detail">${esc(tool.detail)}</span><span class="tool-status">${tool.status === "running" ? "running" : "done"}</span></summary><pre>${esc(tool.output)}</pre></details>`).join("");
}
function activity_markup() {
  return `<div class="activity-events"><div class="event done"><b>run_started</b><span>Session run began</span><code>run 0190…d42a</code></div><div class="event done"><b>message_finished</b><span>Plan prepared</span><code>assistant · 312 tokens</code></div>${state.tools.map((tool) => `<div class="event ${tool.status === "running" ? "live" : "done"}">${dot(tool.status === "running" ? "running" : "ready")}<b>${tool.status === "running" ? "tool_progress" : "tool_finished"}</b><span>${esc(tool.name)} · ${tool.status}</span><code>${esc(tool.detail)}</code></div>`).join("")}</div>`;
}
function composer({ hint = true, class_name = "" } = {}) {
  return `<form class="composer ${class_name}" data-composer><textarea aria-label="Message" placeholder="Ask Drycode to work in this Workspace…">${esc(state.draft)}</textarea><div class="composer-foot"><span class="composer-plus">＋</span>${model_button()}<span class="grow"></span>${hint ? `<span class="hint">Enter send · Shift+Enter newline</span>` : ""}${state.running ? button("■ Interrupt", "interrupt", "danger") : button("Send ↑", "send", "primary")}</div></form>`;
}
function session_cards({ compact = false } = {}) {
  return `<div class="session-cards ${compact ? "compact" : ""}">${state.sessions.map((session) => `<button class="session-card ${session.id === state.active_session ? "selected" : ""}" data-session="${session.id}"><span class="session-card-title">${esc(session.title)}</span><span class="session-card-time">${session.time}</span><span class="session-card-summary">${esc(session.summary)}</span></button>`).join("")}</div>`;
}
function context_footer() { return `<div class="context-footer"><span>Bound to <b>${esc(state.workspace.path)}</b></span><span>·</span><span>${esc(state.model.provider)} / ${esc(state.model.name)}</span></div>`; }

// A: the primary object is a horizontal command strip; run detail is a bottom tray.
function variant_a() {
  return `<div class="frame va">${titlebar()}<nav class="command-strip"><span class="command-prefix">DRYCODE</span>${workspace_button()}<span class="strip-arrow">→</span>${session_button()}<span class="grow"></span>${model_button()}${button("⌘K Commands", "commands", "command-button")}${button("↻", "reload", "icon-button")}</nav><main class="deck"><section class="deck-chat"><header class="chat-heading"><div><span class="eyebrow">Conversation</span><h1>${esc(active().title)}</h1></div><span class="grow"></span>${state.running ? `<span class="stage">${dot("running")} ${esc(state.run_stage)}</span>` : `<span class="idle-label">IDLE</span>`}</header><div class="transcript">${message_markup()}</div>${composer()}</section><aside class="bottom-activity"><div class="activity-heading"><span class="eyebrow">Tool activity</span><span class="activity-count">${state.tools.length} events</span><span class="grow"></span>${state.running ? button("■ Interrupt run", "interrupt", "danger") : `<span class="idle-label">No active run</span>`}</div><div class="tool-row">${tool_markup({ compact: true })}</div></aside></main></div>`;
}

// B: no permanent navigation; a narrow canvas is surrounded by a transient status surface.
function variant_b() {
  return `<div class="frame vb">${titlebar()}<header class="focus-header"><div class="focus-context">${workspace_button()}<span>/</span>${session_button()}</div><div class="focus-actions">${model_button()}${button("Sessions", "sessions")}${button("↻ Reload", "reload")}</div></header><main class="focus-layout"><section class="focus-canvas"><div class="focus-title"><span class="eyebrow">${state.running ? "Working now" : "Conversation"}</span><h1>${esc(active().title)}</h1><p>${esc(active().summary)}</p></div><div class="transcript">${message_markup()}<div class="inline-tools"><div class="inline-tools-head"><span class="eyebrow">Recent Tool activity</span><span class="grow"></span><span class="hint">click a row to inspect output</span></div>${tool_markup()}</div></div>${composer({ class_name: "focus-composer" })}</section><aside class="focus-rail"><div><span class="eyebrow">Run status</span><h2>${state.running ? "In progress" : "Ready"}</h2><p>${state.running ? esc(state.run_stage) : "Start a message when you are ready."}</p></div><div class="rail-rule"></div><div class="focus-stat"><span>WORKSPACE</span><b>${esc(state.workspace.name)}</b><small>${esc(state.workspace.path)}</small></div><div class="focus-stat"><span>MODEL</span><b>${esc(state.model.name)}</b><small>${esc(state.model.provider)} · configured</small></div><div class="focus-rail-actions">${state.running ? button("■ Interrupt active run", "interrupt", "danger") : new_button("＋ New message")}${button("⌘K Open commands", "commands", "ghost")}</div></aside></main></div>`;
}

// C: sessions remain visible as a shelf, while run details are a compact right status column.
function variant_c() {
  return `<div class="frame vc">${titlebar()}<header class="shelf-header"><div class="shelf-workspace">${workspace_button()}</div><div class="shelf-title"><span class="eyebrow">Workspace sessions</span><strong>${state.sessions.length} conversations</strong></div><div class="shelf-actions">${model_button()}${button("↻", "reload", "icon-button")}</div></header><main class="shelf-layout"><aside class="session-shelf"><div class="shelf-new">${new_button("＋ Start new session")}</div>${session_cards()}<div class="shelf-bottom">${button("⌘K Command menu", "commands", "ghost")}</div></aside><section class="shelf-chat"><header><span class="session-marker">${dot(state.running ? "running" : "ready")}</span><div><h1>${esc(active().title)}</h1><span>${esc(active().summary)}</span></div><span class="grow"></span>${button("Session info", "session-info")}</header><div class="transcript">${message_markup()}</div>${composer()}</section><aside class="shelf-status"><div class="status-top"><span class="eyebrow">Live surface</span><span class="live-label">${state.running ? "LIVE" : "IDLE"}</span></div><div class="status-stage">${dot(state.running ? "running" : "ready")}<strong>${state.running ? esc(state.run_stage) : "No run"}</strong></div><div class="shelf-tools">${tool_markup()}</div><div class="status-bottom">${state.running ? button("■ Interrupt", "interrupt", "danger") : button("Run is idle", "send", "ghost")}</div></aside></main></div>`;
}

// D: chat and a durable run ledger share the window; wayfinding is intentionally overlaid.
function variant_d() {
  return `<div class="frame vd">${titlebar()}<header class="ledger-header"><button class="workspace-name" data-action="workspace"><span class="glyph">▱</span><b>${esc(state.workspace.name)}</b><small>${esc(state.workspace.path)}</small></button><span class="ledger-divider">/</span><button class="ledger-session" data-action="sessions"><span class="eyebrow">SESSION</span><b>${esc(active().title)}</b></button><span class="grow"></span>${model_button()}${button("＋ New", "new-session", "primary")}${button("↻ Reload", "reload")}</header><main class="ledger-layout"><section class="ledger-chat"><div class="ledger-chat-heading"><span class="eyebrow">Conversation</span><h1>Ask, inspect, interrupt.</h1></div><div class="transcript">${message_markup()}<div class="ledger-summary"><span class="eyebrow">Run transcript</span><strong>${state.running ? esc(state.run_stage) : "Run complete"}</strong></div></div>${composer({ hint: false })}</section><aside class="run-ledger"><header><div><span class="eyebrow">Run ledger</span><h2>${state.running ? "Active run" : "Last run"}</h2></div><span class="run-id mono">0190…d42a</span></header><div class="ledger-timeline">${activity_markup()}</div><footer>${state.running ? button("■ Interrupt this run", "interrupt", "danger") : `<span class="idle-label">Run ended · results retained</span>`}${button("Sessions", "sessions", "ghost")}</footer></aside></main></div>`;
}

// E: a launcher is always present above the focused conversation, making the starter state explicit.
function variant_e() {
  return `<div class="frame ve">${titlebar()}<header class="launcher-header"><div class="launcher-brand"><span class="mark small"></span><div><strong>What should we work on?</strong><span>${esc(state.workspace.name)} · local Workspace</span></div></div><div class="launcher-controls">${workspace_button()}${model_button()}${button("↻", "reload", "icon-button")}</div></header><main class="launcher-layout"><aside class="launcher"><div class="launcher-input"><span class="slash">/</span><input aria-label="Command" placeholder="Command or session…"><kbd>⌘ K</kbd></div><div class="launcher-group"><span class="eyebrow">Start here</span>${new_button("＋ New session")}${button("Resume a session", "sessions")}${button("Configure model", "model")}</div><div class="launcher-group resume"><span class="eyebrow">Recent sessions</span>${session_cards({ compact: true })}</div><div class="launcher-foot">${dot(state.running ? "running" : "ready")} ${state.running ? "A run is active" : "Ready for a message"}<span class="grow"></span>${button("Commands", "commands", "ghost")}</div></aside><section class="launcher-chat"><header><span class="eyebrow">Current session</span><h1>${esc(active().title)}</h1><span class="session-path">${esc(state.workspace.path)}</span></header><div class="transcript">${message_markup()}<div class="tool-stack"><span class="eyebrow">Tools in this run</span>${tool_markup({ compact: true })}</div></div>${composer()}</section></main></div>`;
}

function modal() {
  if (!state.modal) return "";
  if (state.modal === "workspace") return `<div class="overlay" data-dismiss><section class="dialog"><span class="eyebrow">Workspace</span><h2>Where should Drycode work?</h2><p>A Session stays bound to the Workspace it was created in.</p><div class="choice-list"><button data-workspace="drycode|D:\\app\\drycode">▱ <span><b>drycode</b><small>D:\\app\\drycode</small></span></button><button data-workspace="agent-lab|D:\\app\\agent-lab">▱ <span><b>agent-lab</b><small>D:\\app\\agent-lab</small></span></button><button>＋ <span><b>Choose another folder…</b><small>Native Windows folder picker</small></span></button></div><div class="dialog-actions">${button("Cancel", "close-modal")}</div></section></div>`;
  if (state.modal === "sessions") return `<div class="overlay" data-dismiss><section class="dialog wide"><span class="eyebrow">${esc(state.workspace.name)} · sessions</span><h2>Resume or start a Session</h2><p>Each Session is one durable, linear conversation in this Workspace.</p>${session_cards()}<div class="dialog-actions">${button("Cancel", "close-modal")}${new_button("＋ New session")}</div></section></div>`;
  if (state.modal === "model") return `<div class="overlay" data-dismiss><section class="dialog"><span class="eyebrow">Model Provider</span><h2>Configure this Session</h2><p>Credentials and model discovery belong to the Model Provider.</p><label>Provider<select id="provider"><option>Anthropic</option><option>OpenAI</option><option>Google</option></select></label><label>Model<select id="model"><option>Claude Sonnet 4</option><option>Claude Opus 4</option><option>Claude Haiku 3.5</option></select></label><label>API credential<input type="password" value="••••••••••••"></label><div class="dialog-actions">${button("Cancel", "close-modal")}${button("Use model", "save-model", "primary")}</div></section></div>`;
  if (state.modal === "commands") return `<div class="overlay command-overlay" data-dismiss><section class="dialog command-dialog"><div class="command-search"><span class="slash">/</span><input autofocus aria-label="Find command" placeholder="Find a command…"><kbd>ESC</kbd></div><div class="command-list"><button data-action="new-session"><b>＋ New Session</b><small>Start a blank conversation in ${esc(state.workspace.name)}</small><kbd>N</kbd></button><button data-action="sessions"><b>◈ Resume Session</b><small>Browse durable conversations</small><kbd>R</kbd></button><button data-action="workspace"><b>▱ Change Workspace</b><small>Choose where the next Session operates</small><kbd>W</kbd></button><button data-action="model"><b>◉ Configure Model</b><small>${esc(state.model.name)} · ${esc(state.model.provider)}</small><kbd>M</kbd></button><button data-action="reload"><b>↻ Reload Extensions</b><small>Replace the UI and Harness Runtime Generation</small><kbd>L</kbd></button></div></section></div>`;
  if (state.modal === "session-info") return `<div class="overlay" data-dismiss><section class="dialog"><span class="eyebrow">Session info</span><h2>${esc(active().title)}</h2><p>${esc(active().summary)}</p><dl class="facts"><dt>Workspace</dt><dd>${esc(state.workspace.path)}</dd><dt>Model</dt><dd>${esc(state.model.provider)} / ${esc(state.model.name)}</dd><dt>Run</dt><dd>${state.running ? "Active" : "Idle"}</dd></dl><div class="dialog-actions">${button("Done", "close-modal")}</div></section></div>`;
  if (state.modal === "reload") return `<div class="overlay" data-dismiss><section class="dialog"><span class="eyebrow">Runtime lifecycle</span><h2>Reload all extensions?</h2><p>Active work will be interrupted. The complete UI and Harness Runtime Generation will stop and start again; durable Sessions remain available.</p><div class="dialog-actions">${button("Cancel", "close-modal")}${button("Reload Drycode", "confirm-reload", "danger")}</div></section></div>`;
  return `<div class="overlay"><section class="dialog reload-dialog"><span class="eyebrow">Runtime lifecycle</span><h2>Starting a fresh generation…</h2><p>Stopping the current UI and Harness pair, then starting the replacement.</p><span class="loading-bar"><i></i></span><div class="status-line">${dot("running")} Runtime Generation 19</div></section></div>`;
}

function switcher() { return `<nav class="variant-switcher"><button data-action="previous-variant" aria-label="Previous variant">←</button><span><b>${state.variant}</b> / ${variant_info[state.variant].name}</span><button data-action="next-variant" aria-label="Next variant">→</button></nav>`; }
function render() {
  const views = { A: variant_a, B: variant_b, C: variant_c, D: variant_d, E: variant_e };
  document.querySelector("#app").innerHTML = `${views[state.variant]()}${switcher()}${modal()}${state.toast ? `<div class="toast">${esc(state.toast)}</div>` : ""}`;
  bind();
}
function cycle(step) {
  const index = keys.indexOf(state.variant);
  state.variant = keys[(index + step + keys.length) % keys.length];
  const url = new URL(location.href); url.searchParams.set("variant", state.variant); history.replaceState(null, "", url); render();
}
function select_session(id) { state.active_session = id; state.modal = null; state.running = false; state.run_stage = "Idle"; state.tools = state.tools.map((tool) => ({ ...tool, status: "completed" })); state.toast = "Session resumed"; render(); clear_toast(); }
function create_session() { const id = `session-${state.sessions.length + 1}`; state.sessions.unshift({ id, title: "Untitled session", summary: "No messages yet", time: "now" }); state.active_session = id; state.messages = []; state.tools = []; state.running = false; state.modal = null; state.toast = "New Session ready"; render(); clear_toast(); }
function send() { const text = state.draft.trim(); if (!text || state.running) return; state.messages.push({ role: "user", text }, { role: "assistant", text: "I’ll inspect the Workspace and report each Tool as it runs." }); state.draft = ""; state.running = true; state.run_stage = "Inspecting Workspace"; state.tools.push({ name: "search", detail: "Workspace structure", status: "running", output: "Searching files…" }); render(); }
function interrupt() { state.running = false; state.run_stage = "Interrupted"; state.tools = state.tools.map((tool) => tool.status === "running" ? { ...tool, status: "completed", output: `${tool.output}\nInterrupted by user.` } : tool); state.messages.push({ role: "assistant", text: "Run interrupted. Completed messages and Tool results remain in this Session." }); state.toast = "Run interrupted"; render(); clear_toast(); }
function clear_toast() { window.setTimeout(() => { state.toast = ""; render(); }, 1800); }

function bind() {
  document.querySelectorAll("[data-action]").forEach((element) => element.addEventListener("click", () => {
    const action = element.dataset.action;
    if (["workspace", "model", "sessions", "commands", "reload", "session-info"].includes(action)) state.modal = action;
    if (action === "close-modal") state.modal = null;
    if (action === "previous-variant") return cycle(-1);
    if (action === "next-variant") return cycle(1);
    if (action === "new-session") return create_session();
    if (action === "interrupt") return interrupt();
    if (action === "send") return send();
    if (action === "save-model") { state.model.provider = document.querySelector("#provider").value; state.model.name = document.querySelector("#model").value; state.model.ready = true; state.modal = null; state.toast = "Model configured for this Session"; render(); clear_toast(); return; }
    if (action === "confirm-reload") { state.modal = "reloading"; render(); window.setTimeout(() => { state.modal = null; state.running = false; state.run_stage = "Idle"; state.tools = state.tools.map((tool) => ({ ...tool, status: "completed" })); state.toast = "Runtime Generation reloaded"; render(); clear_toast(); }, 1400); }
    else render();
  }));
  document.querySelectorAll("[data-session]").forEach((element) => element.addEventListener("click", () => select_session(element.dataset.session)));
  document.querySelectorAll("[data-workspace]").forEach((element) => element.addEventListener("click", () => { const [name, path] = element.dataset.workspace.split("|"); state.workspace = { name, path }; state.modal = null; state.toast = `Workspace changed to ${name}`; render(); clear_toast(); }));
  document.querySelectorAll(".overlay[data-dismiss]").forEach((element) => element.addEventListener("click", (event) => { if (event.target === element) { state.modal = null; render(); } }));
  document.querySelectorAll("textarea").forEach((textarea) => { textarea.addEventListener("input", () => { state.draft = textarea.value; }); textarea.addEventListener("keydown", (event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); state.draft = textarea.value; send(); } }); });
}
document.addEventListener("keydown", (event) => { const editing = event.target.matches("input, textarea, select, [contenteditable]"); if (!editing && event.key === "ArrowLeft") cycle(-1); if (!editing && event.key === "ArrowRight") cycle(1); if (event.key === "Escape" && state.modal) { state.modal = null; render(); } if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); state.modal = "commands"; render(); } });
render();
