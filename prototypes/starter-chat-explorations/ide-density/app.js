const variants = {
  A: "Command strip",
  B: "Split console",
  C: "Focus stack",
  D: "Workbench matrix",
  E: "Run timeline",
};

const state = {
  variant: (new URLSearchParams(location.search).get("variant") || "A").toUpperCase(),
  workspace: { name: "drycode", path: "D:\\app\\drycode" },
  model: { provider: "Anthropic", name: "Claude Sonnet 4" },
  active: "architecture",
  running: true,
  stage: "Reading UI contracts",
  modal: null,
  draft: "",
  sessions: [
    { id: "architecture", title: "Shape extension architecture", note: "Shell and bridge boundaries", time: "now", count: 12 },
    { id: "harness", title: "Extract the agent harness", note: "Mapped reusable runtime seams", time: "2h", count: 8 },
    { id: "installer", title: "Plan the Windows installer", note: "Package format comparison", time: "Fri", count: 5 },
    { id: "recovery", title: "Recovery surface notes", note: "Lifecycle edge cases", time: "Mon", count: 3 },
  ],
  messages: [
    { role: "user", text: "Review the shell contract and tell me what the starter chat needs to own." },
    { role: "assistant", text: "I’ll trace the Shell service, bridge endpoints, and Session operations, then separate chat-owned behavior from Core lifecycle behavior." },
  ],
  openTools: [0, 1],
  tools: [
    { name: "read", detail: "docs/adr/0004-shell-contract.md", status: "done", output: "Read 184 lines\nShell owns the complete web-content subtree.\nCore exposes no product layout or widget contracts." },
    { name: "search", detail: "Session operations and bridge endpoints", status: "running", output: "Searching CONTEXT.md and planning records…" },
    { name: "read", detail: "docs/agents/domain.md", status: "queued", output: "Queued" },
  ],
};
if (!variants[state.variant]) state.variant = "A";

const esc = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const activeSession = () => state.sessions.find((session) => session.id === state.active) || state.sessions[0];
const dot = (kind = "ready") => `<span class="dot ${kind}"></span>`;

function windowBar() {
  return `<header class="windowbar"><span class="dry-mark">d</span><b>drycode</b><span class="crumb">/ starter chat</span><span class="drag"></span><span class="runtime">${dot(state.running ? "busy" : "ready")} ${state.running ? "RUN ACTIVE" : "READY"}</span><span class="window-buttons"><i>—</i><i>□</i><i>×</i></span></header>`;
}
function workspaceButton() {
  return `<button class="select-button workspace" data-action="workspace"><span class="glyph">▣</span><span><small>WORKSPACE</small><b>${esc(state.workspace.name)}</b></span><span class="chevron">⌄</span></button>`;
}
function sessionButton() {
  const session = activeSession();
  return `<button class="select-button session-select" data-action="sessions"><span class="glyph">◈</span><span><small>SESSION</small><b>${esc(session.title)}</b></span><span class="chevron">⌄</span></button>`;
}
function modelButton() {
  return `<button class="model-button" data-action="model">${dot("ready")}<span><small>MODEL</small><b>${esc(state.model.name)}</b></span><span class="chevron">⌄</span></button>`;
}
function actionButtons({ compact = false } = {}) {
  return `<button class="button subtle ${compact ? "compact" : ""}" data-action="new-session">＋ <span>New session</span></button><button class="button subtle ${compact ? "compact" : ""}" data-action="reload">↻ <span>Reload</span></button>`;
}
function sessionRows() {
  return state.sessions.map((s) => `<button class="session-row ${s.id === state.active ? "selected" : ""}" data-session="${s.id}"><span class="session-symbol">${s.id === state.active ? "●" : "○"}</span><span class="session-copy"><b>${esc(s.title)}</b><small>${esc(s.note)}</small></span><time>${s.time}</time></button>`).join("");
}
function transcript({ limit = false } = {}) {
  const messages = state.messages.map((m) => `<article class="message ${m.role}"><div class="message-label"><span class="avatar">${m.role === "user" ? "YOU" : "AI"}</span><b>${m.role === "user" ? "You" : "Drycode"}</b><span class="message-time">${m.role === "user" ? "09:41" : "09:42"}</span></div><p>${esc(m.text)}</p></article>`).join("");
  return `<section class="transcript ${limit ? "limited" : ""}">${messages}</section>`;
}
function toolRows({ cards = false } = {}) {
  return state.tools.map((tool, index) => `<div class="tool-row ${tool.status} ${cards ? "tool-card" : ""}"><span class="tool-icon">${tool.status === "running" ? "◌" : tool.status === "done" ? "✓" : "·"}</span><span class="tool-copy"><b>${esc(tool.name)} <em>${tool.status}</em></b><small>${esc(tool.detail)}</small></span><button class="tool-expand" data-action="toggle-tool" data-tool="${index}">${cards ? (state.openTools.includes(index) ? "⌃" : "⌄") : "›"}</button>${cards && state.openTools.includes(index) ? `<pre>${esc(tool.output)}</pre>` : ""}</div>`).join("");
}
function composer({ rail = false } = {}) {
  return `<form class="composer" data-composer><textarea aria-label="Message" placeholder="Message this Session…">${esc(state.draft)}</textarea><div class="composer-foot"><button type="button" class="icon-action" title="Add context">＋</button><span class="compose-context"><span class="blue-key">⌘</span> ${esc(state.workspace.name)} · ${esc(state.model.name)}</span><span class="grow"></span><span class="key-hint">Enter to send</span>${state.running ? `<button type="button" class="interrupt" data-action="interrupt">■ Interrupt</button>` : `<button type="submit" class="send">Send <b>↑</b></button>`}</div>${rail ? `<div class="composer-status">Session records are durable · Runs are linear</div>` : ""}</form>`;
}
function runPill() { return state.running ? `<span class="run-pill">${dot("busy")} ${esc(state.stage)} <button data-action="interrupt">Interrupt</button></span>` : `<span class="idle-pill">${dot("ready")} No active Run</span>`; }
function panelHead(label, extra = "") { return `<div class="panel-head"><span class="eyebrow">${label}</span><span class="grow"></span>${extra}</div>`; }

// A: all global context is a compact command strip; the transcript owns the middle.
function viewA() {
  return `<div class="frame view-a">${windowBar()}<div class="command-strip"><div class="command-context">${workspaceButton()}<span class="strip-divider">/</span>${sessionButton()}</div><div class="strip-actions"><button class="button primary" data-action="new-session">＋ New session</button>${modelButton()}${actionButtons({ compact: true })}</div></div><div class="a-main"><header class="conversation-head"><div><span class="eyebrow">DURABLE SESSION · ${esc(state.workspace.path)}</span><h1>${esc(activeSession().title)}</h1></div><span class="grow"></span>${runPill()}<button class="dots">•••</button></header>${transcript()}<div class="a-tools"><div class="tool-summary"><span class="eyebrow">TOOL ACTIVITY</span><span class="activity-count">${state.tools.length} events</span></div><div class="tool-inline">${toolRows()}</div></div>${composer()}</div><div class="a-footer"><span>Starter chat · local Workspace</span><span class="grow"></span><kbd>←</kbd><span>variant A / 5</span><kbd>→</kbd></div></div>`;
}

// B: sessions and Tools are permanent side columns, like an operational console.
function viewB() {
  return `<div class="frame view-b">${windowBar()}<div class="b-toolbar">${workspaceButton()}<button class="button primary" data-action="new-session">＋ Session</button><span class="grow"></span><span class="toolbar-label">RUNTIME GENERATION 18</span>${modelButton()}<button class="button subtle" data-action="reload">↻ Reload</button></div><div class="b-grid"><aside class="session-panel">${panelHead("SESSIONS", `<button class="tiny-icon" data-action="new-session">＋</button>`)}<div class="session-list">${sessionRows()}</div><div class="panel-bottom">${actionButtons()}</div></aside><section class="chat-panel"><div class="chat-panel-head"><span class="signal">#</span><b>${esc(activeSession().title)}</b><span class="grow"></span><span class="mono muted">${state.messages.length} records</span></div>${transcript({ limit: true })}${composer({ rail: true })}</section><aside class="activity-panel">${panelHead("RUN ACTIVITY", `<span class="live-label">${state.running ? "LIVE" : "IDLE"}</span>`)}<div class="run-meta"><span class="eyebrow">CURRENT STAGE</span><strong>${state.running ? esc(state.stage) : "Run interrupted"}</strong><small>run · 0190…d42a</small></div><div class="tool-list">${toolRows({ cards: true })}</div><div class="activity-actions">${state.running ? `<button class="interrupt wide" data-action="interrupt">■ Interrupt active Run</button>` : `<button class="button subtle wide" data-action="send">↻ Run again</button>`}<button class="button subtle wide">Copy run details</button></div></aside></div><div class="b-status"><span>${dot(state.running ? "busy" : "ready")} ${state.running ? "Tool call in progress" : "Session ready"}</span><span class="grow"></span><span>Model Provider · ${esc(state.model.provider)}</span></div></div>`;
}

// C: a focused vertical stack keeps context close to the composer and makes activity a drawer.
function viewC() {
  return `<div class="frame view-c">${windowBar()}<header class="focus-nav"><button class="brand-context" data-action="workspace"><span class="dry-mark">d</span><b>${esc(state.workspace.name)}</b><span class="chevron">⌄</span></button><span class="focus-slash">/</span><button class="focus-session" data-action="sessions">${dot(state.running ? "busy" : "ready")}<b>${esc(activeSession().title)}</b><span class="chevron">⌄</span></button><span class="grow"></span><button class="button subtle" data-action="new-session">＋ New</button><button class="icon-button" data-action="model" title="Configure model">⚙</button><button class="icon-button" data-action="reload" title="Reload">↻</button></header><div class="focus-context"><span><small>WORKSPACE</small><b>${esc(state.workspace.path)}</b></span><span class="context-rule"></span><span><small>MODEL</small><b>${esc(state.model.provider)} / ${esc(state.model.name)}</b></span><span class="grow"></span>${runPill()}</div><main class="focus-main"><div class="focus-column"><header class="focus-title"><span class="eyebrow">SESSION ${String(activeSession().count).padStart(2, "0")}</span><h1>${esc(activeSession().title)}</h1><p>Linear record stream · started today at 09:38</p></header>${transcript()}<div class="drawer-handle"><span>RUN ACTIVITY</span><span class="grow"></span><span>${state.tools.length} tool events</span><button data-action="toggle-drawer">⌃</button></div><div class="focus-tools">${toolRows({ cards: true })}</div>${composer()}</div></main></div>`;
}

// D: a matrix puts the conversation and current run side by side while keeping session metadata visible.
function viewD() {
  return `<div class="frame view-d">${windowBar()}<div class="matrix-top"><div class="matrix-label"><span class="eyebrow">WORKSPACE</span><button data-action="workspace"><b>${esc(state.workspace.name)}</b><span class="muted">${esc(state.workspace.path)}</span>⌄</button></div><div class="matrix-label"><span class="eyebrow">SESSION</span><button data-action="sessions"><b>${esc(activeSession().title)}</b><span class="muted">${activeSession().count} records</span>⌄</button></div><div class="grow"></div>${modelButton()}<button class="button primary" data-action="new-session">＋ New session</button><button class="button subtle" data-action="reload">↻</button></div><div class="matrix"><aside class="matrix-sessions"><div class="matrix-title">RECENT SESSIONS <button data-action="new-session">＋</button></div>${sessionRows()}</aside><section class="matrix-chat"><div class="matrix-chat-head"><div><span class="eyebrow">CONVERSATION</span><b>${esc(activeSession().title)}</b></div><span class="grow"></span>${runPill()}</div>${transcript()}${composer()}</section><aside class="matrix-inspector"><div class="matrix-title">SESSION DOSSIER</div><div class="dossier"><span class="dossier-icon">◈</span><b>Durable Session</b><p>Bound to <strong>${esc(state.workspace.name)}</strong>. Messages and Tool results remain available when this window reloads.</p><dl><dt>STATUS</dt><dd>${state.running ? "Run active" : "Ready"}</dd><dt>MODEL</dt><dd>${esc(state.model.name)}</dd><dt>RECORDS</dt><dd>${state.messages.length + state.tools.length} append-only facts</dd></dl></div><div class="matrix-title">TOOLS IN THIS RUN</div><div class="inspector-tools">${toolRows()}</div><button class="button subtle wide" data-action="model">⚙ Configure model</button><button class="button subtle wide" data-action="reload">↻ Reload extensions</button></aside></div></div>`;
}

// E: a vertical Run timeline is the primary reading order; chat is one event type among others.
function viewE() {
  const events = [{ type: "message", label: "MESSAGE FINISHED", detail: "Drycode · plan prepared", time: "09:42" }, ...state.tools.map((t) => ({ type: t.status === "running" ? "running" : "tool", label: t.status === "running" ? "TOOL IN PROGRESS" : "TOOL FINISHED", detail: `${t.name} · ${t.detail}`, time: t.status === "running" ? "now" : "09:42" }))];
  return `<div class="frame view-e">${windowBar()}<header class="timeline-header"><div>${workspaceButton()}</div><div class="timeline-session"><span class="eyebrow">ACTIVE SESSION</span><button data-action="sessions"><b>${esc(activeSession().title)}</b><span class="muted">${esc(activeSession().note)}</span>⌄</button></div><span class="grow"></span>${modelButton()}<button class="button primary" data-action="new-session">＋ New</button><button class="button subtle" data-action="reload">↻ Reload</button></header><div class="timeline-layout"><aside class="timeline-rail"><div class="timeline-rail-title">SESSIONS <button data-action="new-session">＋</button></div>${sessionRows()}<div class="timeline-rail-foot"><span class="eyebrow">WORKSPACE PATH</span><code>${esc(state.workspace.path)}</code><button class="button subtle wide" data-action="workspace">Change Workspace</button></div></aside><main class="timeline-main"><div class="timeline-title"><span class="eyebrow">RUN TIMELINE</span><span class="grow"></span>${runPill()}</div><div class="timeline-events">${events.map((e, i) => `<article class="timeline-event ${e.type}"><span class="event-dot">${e.type === "message" ? "✦" : e.type === "running" ? "◌" : "✓"}</span><div><div class="event-label">${e.label}<time>${e.time}</time></div><b>${esc(e.detail)}</b>${e.type === "message" ? `<p>“${esc(state.messages.at(-1)?.text || "No message yet")}”</p>` : ""}</div></article>`).join("")}<article class="timeline-event prompt"><span class="event-dot">+</span><div><div class="event-label">NEXT INPUT</div><b>Continue this Session</b></div></article></div>${composer({ rail: true })}</main><aside class="timeline-side"><div class="side-block">${panelHead("RUN CONTROL")}<div class="run-control-status">${dot(state.running ? "busy" : "ready")}<strong>${state.running ? "Run active" : "Ready for input"}</strong><small>${state.running ? esc(state.stage) : "No agent work is in flight"}</small></div>${state.running ? `<button class="interrupt wide" data-action="interrupt">■ Interrupt Run</button>` : `<button class="button primary wide" data-action="send">Start Run</button>`}</div><div class="side-block">${panelHead("MODEL")}${modelButton()}<button class="button subtle wide" data-action="model">Configure</button></div><div class="side-block help-block"><span class="eyebrow">WAYFINDING</span><p>Every input starts one linear Run. Tool activity appears in this timeline as it happens.</p></div></aside></div><footer class="e-footer"><span>Runtime Generation 18</span><span class="grow"></span><span>Variant E · Run-first reading order</span></footer></div>`;
}

function switcher() { return `<nav class="switcher" aria-label="Exploration variants"><button data-action="previous">←</button><span><b>${state.variant}</b> ${variants[state.variant]}</span><button data-action="next">→</button></nav>`; }
function modal() {
  if (!state.modal) return "";
  if (state.modal === "workspace") return `<div class="modal-backdrop" data-dismiss><section class="modal"><span class="eyebrow">SELECT WORKSPACE</span><h2>Where should Drycode work?</h2><p>A Session is bound to the Workspace selected when it is created.</p><div class="option-list"><button data-workspace="drycode|D:\\app\\drycode" class="${state.workspace.name === "drycode" ? "chosen" : ""}">▣ <span><b>drycode</b><small>D:\\app\\drycode</small></span>✓</button><button data-workspace="agent-lab|D:\\app\\agent-lab">▣ <span><b>agent-lab</b><small>D:\\app\\agent-lab</small></span>○</button><button>＋ <span><b>Choose another folder…</b><small>Open the Windows folder picker</small></span>○</button></div><div class="modal-actions"><button data-action="close">Cancel</button></div></section></div>`;
  if (state.modal === "sessions") return `<div class="modal-backdrop" data-dismiss><section class="modal"><span class="eyebrow">${esc(state.workspace.name)} · SESSIONS</span><h2>Resume a Session</h2><p>Pick up a durable conversation or create a new one.</p><div class="modal-session-list">${sessionRows()}</div><div class="modal-actions"><button data-action="close">Cancel</button><button class="primary" data-action="new-session">＋ New session</button></div></section></div>`;
  if (state.modal === "model") return `<div class="modal-backdrop" data-dismiss><section class="modal"><span class="eyebrow">SESSION CONFIGURATION</span><h2>Configure model</h2><p>The Model Provider owns discovery and credentials. This selection applies to the current Session.</p><label>Provider<select id="provider"><option>Anthropic</option><option>OpenAI</option><option>Google</option></select></label><label>Model<select id="model"><option>Claude Sonnet 4</option><option>Claude Opus 4</option><option>Claude Haiku 3.5</option></select></label><label>Credential<input type="password" value="••••••••••••"></label><div class="modal-actions"><button data-action="close">Cancel</button><button class="primary" data-action="save-model">Use model</button></div></section></div>`;
  if (state.modal === "reload") return `<div class="modal-backdrop" data-dismiss><section class="modal"><span class="eyebrow">RUNTIME LIFECYCLE</span><h2>Reload all extensions?</h2><p>Drycode will stop the complete UI and Harness Runtime Generation, then start a fresh generation. Durable Sessions remain available.</p><div class="reload-note">↻ <span>Runtime Generation 18<br><small>will be replaced</small></span></div><div class="modal-actions"><button data-action="close">Cancel</button><button class="danger" data-action="confirm-reload">Reload Drycode</button></div></section></div>`;
  return `<div class="modal-backdrop"><section class="modal"><span class="eyebrow">RUNTIME LIFECYCLE</span><h2>Starting new generation…</h2><p>Replacing the UI and Harness pair while keeping this Session available.</p><div class="progress"><span></span></div>${dot("busy")} Starting Runtime Generation 19</section></div>`;
}
function render() {
  const view = { A: viewA, B: viewB, C: viewC, D: viewD, E: viewE }[state.variant];
  document.querySelector("#app").innerHTML = `${view()}${switcher()}${modal()}`;
  bind();
}
function cycle(step) {
  const keys = Object.keys(variants); state.variant = keys[(keys.indexOf(state.variant) + step + keys.length) % keys.length];
  const url = new URL(location.href); url.searchParams.set("variant", state.variant); history.replaceState(null, "", url); render();
}
function chooseSession(id) { state.active = id; state.running = false; state.stage = "Idle"; state.tools = state.tools.map((t) => ({ ...t, status: t.status === "running" ? "done" : t.status })); state.modal = null; render(); }
function newSession() { const id = `session-${state.sessions.length + 1}`; state.sessions.unshift({ id, title: "Untitled session", note: "No messages yet", time: "now", count: 0 }); state.active = id; state.messages = []; state.tools = []; state.running = false; state.modal = null; render(); }
function send() { const text = state.draft.trim(); if (!text || state.running) return; state.messages.push({ role: "user", text }, { role: "assistant", text: "I’ll inspect the Workspace and report each Tool as it runs." }); state.draft = ""; state.running = true; state.stage = "Inspecting Workspace"; state.tools.push({ name: "search", detail: "Workspace structure", status: "running", output: "Searching files…" }); render(); }
function bind() {
  document.querySelectorAll("[data-action]").forEach((el) => el.addEventListener("click", () => {
    const action = el.dataset.action;
    if (action === "workspace" || action === "sessions" || action === "model" || action === "reload") state.modal = action;
    if (action === "close") state.modal = null;
    if (action === "previous") return cycle(-1);
    if (action === "next") return cycle(1);
    if (action === "new-session") return newSession();
    if (action === "toggle-tool") { const index = Number(el.dataset.tool); state.openTools = state.openTools.includes(index) ? state.openTools.filter((item) => item !== index) : [...state.openTools, index]; }
    if (action === "interrupt") { state.running = false; state.stage = "Interrupted"; state.tools = state.tools.map((t) => t.status === "running" ? { ...t, status: "done", output: `${t.output}\nInterrupted by user.` } : t); state.messages.push({ role: "assistant", text: "Run interrupted. Completed messages and Tool results remain in this Session." }); }
    if (action === "send") send();
    if (action === "save-model") { state.model.provider = document.querySelector("#provider").value; state.model.name = document.querySelector("#model").value; state.modal = null; }
    if (action === "confirm-reload") { state.modal = "reloading"; render(); setTimeout(() => { state.modal = null; state.running = false; state.stage = "Idle"; state.tools = state.tools.map((t) => ({ ...t, status: "done" })); render(); }, 1200); return; }
    render();
  }));
  document.querySelectorAll("[data-session]").forEach((el) => el.addEventListener("click", () => chooseSession(el.dataset.session)));
  document.querySelectorAll("[data-workspace]").forEach((el) => el.addEventListener("click", () => { const [name, path] = el.dataset.workspace.split("|"); state.workspace = { name, path }; state.modal = null; render(); }));
  document.querySelectorAll("[data-dismiss]").forEach((el) => el.addEventListener("click", (event) => { if (event.target === el) { state.modal = null; render(); } }));
  document.querySelectorAll("textarea").forEach((el) => { el.addEventListener("input", () => state.draft = el.value); el.addEventListener("keydown", (event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); state.draft = el.value; send(); } }); });
  document.querySelectorAll("[data-composer]").forEach((form) => form.addEventListener("submit", (event) => { event.preventDefault(); state.draft = form.querySelector("textarea").value; send(); }));
}
document.addEventListener("keydown", (event) => { if (!event.target.matches("input, textarea, select") && event.key === "ArrowLeft") cycle(-1); if (!event.target.matches("input, textarea, select") && event.key === "ArrowRight") cycle(1); if (event.key === "Escape" && state.modal) { state.modal = null; render(); } });
render();
