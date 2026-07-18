const variantNames = {
  A: "Run stage",
  B: "Session cards",
  C: "Transcript timeline",
  D: "Adaptive inspector",
  E: "Conversation stack",
};

const state = {
  variant: new URLSearchParams(location.search).get("variant")?.toUpperCase() || "A",
  workspace: { name: "drycode", path: "D:\\app\\drycode" },
  model: { provider: "Anthropic", name: "Claude Sonnet 4", ready: true },
  active: "contracts",
  running: true,
  stage: "Reading the Shell contract",
  draft: "",
  modal: null,
  bOpen: false,
  panel: "run",
  sessions: [
    { id: "contracts", title: "Shape the starter chat", note: "Working through ownership and wayfinding", age: "now", count: 8, state: "active" },
    { id: "harness", title: "Extract the agent harness", note: "Mapped the runtime seams", age: "2h", count: 14, state: "idle" },
    { id: "installer", title: "Plan the Windows installer", note: "Stopped after package comparisons", age: "Fri", count: 6, state: "paused" },
    { id: "recovery", title: "Recovery surface copy", note: "A short pass on lifecycle language", age: "Mon", count: 4, state: "idle" },
  ],
  messages: [
    { role: "user", text: "Review the Shell contract and tell me what the starter chat needs to own.", time: "10:42" },
    { role: "assistant", text: "I’ll trace the Shell service, bridge endpoints, and Session operations, then separate chat-owned behavior from Core lifecycle behavior.", time: "10:42" },
  ],
  tools: [
    { name: "read", label: "Shell contract", detail: "docs/adr/0004-shell-contract.md", status: "done", output: "Read 184 lines\nShell owns the complete web-content subtree.\nCore exposes no product layout or widget contracts.", time: "10:43" },
    { name: "search", label: "Session operations", detail: "CONTEXT.md · bridge endpoints", status: "running", output: "Searching product records…", time: "10:44" },
  ],
};

if (!variantNames[state.variant]) state.variant = "A";
const esc = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const activeSession = () => state.sessions.find((session) => session.id === state.active) ?? state.sessions[0];
const dot = (kind = "idle") => `<i class="dot ${kind}"></i>`;

function chrome(label = "starter chat") {
  return `<header class="chrome"><span class="brand-mark">d</span><strong>drycode</strong><span class="chrome-label">/ ${label}</span><span class="drag"></span><span class="run-state">${dot(state.running ? "amber" : "blue")} ${state.running ? "Run active" : "Ready"}</span><span class="window-buttons">—　□　×</span></header>`;
}
function workspace() {
  return `<button class="workspace" data-action="workspace"><span class="folder">▣</span><span><b>${esc(state.workspace.name)}</b><small>${esc(state.workspace.path)}</small></span><em>⌄</em></button>`;
}
function model() {
  return `<button class="model" data-action="model">${dot("purple")}<span>${esc(state.model.name)}</span><em>⌄</em></button>`;
}
function topbar(extra = "") {
  return `<div class="topbar">${workspace()}<span class="top-separator"></span>${extra}<span class="grow"></span>${model()}<button data-action="reload" title="Reload the complete Runtime Generation">↻ <span>Reload</span></button></div>`;
}
function sessionRow(session, compact = false) {
  return `<button class="session-row ${session.id === state.active ? "selected" : ""}" data-session="${session.id}">${dot(session.state === "active" ? "amber" : session.state === "paused" ? "red" : "blue")}<span class="session-row-copy"><b>${esc(session.title)}</b><small>${esc(session.note)}</small></span><span class="session-age">${session.age}</span>${compact ? "" : `<span class="session-count">${session.count}</span>`}</button>`;
}
function sessionList() { return state.sessions.map((session) => sessionRow(session)).join(""); }
function sessionTabs() { return state.sessions.slice(0, 3).map((session) => `<button class="session-tab ${session.id === state.active ? "selected" : ""}" data-session="${session.id}">${dot(session.id === state.active && state.running ? "amber" : "blue")} ${esc(session.title)}</button>`).join(""); }

function toolCard(tool, timeline = false) {
  return `<details class="tool ${tool.status === "running" ? "is-running" : ""}" ${tool.status === "running" ? "open" : ""}><summary>${dot(tool.status === "running" ? "amber" : "blue")}<b>${esc(tool.name)}</b><span>${esc(tool.label)}</span><code>${esc(tool.detail)}</code><strong>${tool.status === "running" ? "running" : "complete"}</strong></summary><pre>${esc(tool.output)}</pre></details>`;
}
function message(message, index = 0) {
  return `<article class="message ${message.role}"><div class="message-meta"><span class="avatar">${message.role === "user" ? "YOU" : "DRY"}</span><b>${message.role === "user" ? "You" : "Drycode"}</b><time>${message.time ?? "now"}</time></div><p>${esc(message.text)}</p>${message.role === "assistant" && index === 1 ? state.tools.map((tool) => toolCard(tool)).join("") : ""}</article>`;
}
function transcript() { return `<div class="transcript">${state.messages.map(message).join("")}</div>`; }
function composer(className = "") {
  return `<form class="composer ${className}" data-composer><textarea aria-label="Message" placeholder="Ask Drycode to work in this Workspace…">${esc(state.draft)}</textarea><div class="composer-foot"><button type="button" class="quiet">＋ Context</button><span class="composer-context">${esc(state.workspace.name)} · ${esc(state.model.name)}</span><span class="grow"></span><small>Enter to send · Shift+Enter for newline</small>${state.running ? `<button type="button" class="interrupt" data-action="interrupt">■ Interrupt</button>` : `<button type="submit" class="send">Send ↑</button>`}</div></form>`;
}
function runSteps() {
  const steps = ["Receive message", "Read Shell contract", "Inspect Session boundaries", "Return guidance"];
  return `<div class="run-steps">${steps.map((step, index) => `<div class="run-step ${index === 1 && state.running ? "current" : index < 1 || !state.running ? "complete" : "upcoming"}">${dot(index === 1 && state.running ? "amber" : index < 1 || !state.running ? "blue" : "idle")}<span>${step}</span>${index === 1 && state.running ? `<small>now</small>` : ""}</div>`).join("")}</div>`;
}
function runSummary() {
  return `<section class="run-summary"><div class="section-kicker">ACTIVE RUN <span class="mono">0190…D42A</span></div><h2>${state.running ? esc(state.stage) : "Run is ready"}</h2><p>${state.running ? "Tool activity is kept beside the decision it supports." : "Send a message to start a new Run in this Session."}</p>${runSteps()}${state.running ? `<button class="interrupt wide" data-action="interrupt">■ Interrupt active Run</button>` : ""}</section>`;
}

function variantA() {
  return `<div class="frame a">${chrome("run stage")}<div class="a-layout"><aside class="a-context"><div class="aside-head">WORKSPACE</div>${workspace()}<div class="aside-head session-head">SESSIONS <button data-action="new-session">＋</button></div><div class="session-list">${sessionList()}</div><div class="aside-bottom">${model()}<button class="text-button" data-action="reload">↻ Reload Runtime</button></div></aside><main class="a-main">${topbar(`<span class="crumb">Session / ${esc(activeSession().title)}</span>`)}<div class="a-stage">${runSummary()}<div class="a-conversation"><div class="conversation-head"><span class="section-kicker">CONVERSATION</span><span class="grow"></span><span class="mono muted">${state.messages.length} messages</span></div>${transcript()}${composer()}</div></div></main></div></div>`;
}
function sessionCard(session) {
  return `<button class="session-card ${session.id === state.active ? "selected" : ""}" data-session="${session.id}"><div class="card-top">${dot(session.id === state.active && state.running ? "amber" : "blue")}<span>${session.age}</span><span class="grow"></span><b>${session.count} records</b></div><h3>${esc(session.title)}</h3><p>${esc(session.note)}</p><div class="card-bottom"><span>${session.id === state.active ? "Open now" : "Resume Session"}</span><span>→</span></div></button>`;
}
function variantB() {
  return `<div class="frame b">${chrome("session cards")}<main class="b-main">${topbar(`<span class="eyebrow">WORKSPACE HOME</span>`)}<section class="b-intro"><div><div class="section-kicker">${esc(state.workspace.name)} / SESSIONS</div><h1>Pick up where you left off.</h1><p>Every conversation is a linear Session bound to this Workspace.</p></div><button class="primary" data-action="new-session">＋ New Session</button></section><section class="cards-area"><div class="cards-heading"><span class="eyebrow">RECENT SESSIONS</span><span class="grow"></span><button class="quiet" data-action="workspace">Change Workspace</button></div><div class="session-cards">${state.sessions.map(sessionCard).join("")}</div></section><section class="b-chat ${state.bOpen ? "open" : ""}"><header><button class="back-to-cards" data-action="sessions">← Sessions</button><span class="grow"></span>${state.running ? `<span class="live-label">${dot("amber")} ${esc(state.stage)}</span>` : ""}</header>${transcript()}${composer()}</section></main></div>`;
}
function timelineEvent(event) {
  if (event.kind === "message") return `<div class="timeline-item message-node ${event.role}"><div class="timeline-rail">${dot(event.role === "user" ? "purple" : "blue")}</div><div class="timeline-content"><div class="message-meta"><b>${event.role === "user" ? "You" : "Drycode"}</b><time>${event.time}</time></div><p>${esc(event.text)}</p></div></div>`;
  return `<div class="timeline-item tool-node"><div class="timeline-rail">${dot(event.status === "running" ? "amber" : "blue")}</div><div class="timeline-content">${toolCard(event)}</div></div>`;
}
function variantC() {
  const events = state.messages.map((item) => ({ kind: "message", ...item })).concat(state.tools.map((tool) => ({ kind: "tool", ...tool })));
  return `<div class="frame c">${chrome("transcript timeline")}${topbar(`<button class="timeline-session" data-action="sessions">${dot(state.running ? "amber" : "blue")}<b>${esc(activeSession().title)}</b><span>Switch Session ⌄</span></button>`)}<main class="c-main"><div class="c-title"><div class="section-kicker">SESSION RECORD</div><h1>${esc(activeSession().title)}</h1><p>Messages and Tool facts share one readable timeline.</p></div><div class="timeline">${events.map(timelineEvent).join("")}${state.running ? `<div class="timeline-item now"><div class="timeline-rail">${dot("amber")}</div><div class="timeline-content"><b>Run in progress</b><span>${esc(state.stage)}</span></div></div>` : ""}</div>${composer("timeline-composer")}</main><aside class="c-side"><div class="section-kicker">SESSION</div><div class="session-mini"><span class="avatar">SC</span><b>${esc(activeSession().title)}</b><small>${activeSession().count} records · bound to ${esc(state.workspace.name)}</small></div><button class="primary wide" data-action="new-session">＋ New Session</button><div class="side-rule"></div><div class="section-kicker">MODEL</div>${model()}<button class="text-button" data-action="model">Configure model →</button><div class="side-rule"></div><div class="section-kicker">LIFECYCLE</div><p class="side-copy">Reload replaces the complete UI and Harness Runtime Generation.</p><button class="text-button" data-action="reload">↻ Reload Drycode</button></aside></div></div>`;
}
function inspector() {
  if (state.panel === "model") return `<div class="inspector-body"><div class="section-kicker">MODEL CONFIGURATION</div><h2>Shape the response.</h2><p>Model Provider discovery and credentials stay outside the conversation.</p><button class="model-line" data-action="model">${dot("purple")}<span><b>${esc(state.model.provider)}</b><small>${esc(state.model.name)}</small></span><span>→</span></button><div class="inspector-note">Ready for the next Run</div></div>`;
  if (state.panel === "context") return `<div class="inspector-body"><div class="section-kicker">WORKSPACE CONTEXT</div><h2>One place to work.</h2><p>This Session is permanently bound to the selected Workspace.</p>${workspace()}<div class="path-block mono">${esc(state.workspace.path)}<br><span>local · available</span></div><button class="text-button" data-action="workspace">Switch Workspace →</button></div>`;
  return `<div class="inspector-body"><div class="inspector-title"><div><div class="section-kicker">RUN ACTIVITY</div><h2>${state.running ? "Working now" : "No active Run"}</h2></div>${state.running ? dot("amber") : dot("blue")}</div><p>${state.running ? esc(state.stage) : "The next message starts a fresh Run."}</p>${state.tools.map((tool) => toolCard(tool)).join("")}${state.running ? `<button class="interrupt wide" data-action="interrupt">■ Interrupt Run</button>` : ""}</div>`;
}
function variantD() {
  return `<div class="frame d">${chrome("adaptive inspector")}${topbar(`<button class="d-session" data-action="sessions">${dot(state.running ? "amber" : "blue")}<span><small>SESSION</small><b>${esc(activeSession().title)}</b></span><em>⌄</em></button>`)}<div class="d-layout"><main class="d-chat"><div class="d-chat-head"><div><div class="section-kicker">CHAT</div><h1>What should we shape next?</h1></div><button data-action="new-session">＋ New</button></div>${transcript()}${composer()}</main><aside class="inspector"><nav><button class="${state.panel === "run" ? "active" : ""}" data-panel="run">Run</button><button class="${state.panel === "model" ? "active" : ""}" data-panel="model">Model</button><button class="${state.panel === "context" ? "active" : ""}" data-panel="context">Context</button></nav>${inspector()}</aside></div></div>`;
}
function stackCard(session, index) {
  return `<button class="stack-card ${session.id === state.active ? "selected" : ""} stack-${index}" data-session="${session.id}"><span class="stack-index">0${index + 1}</span><span class="grow"></span>${dot(session.id === state.active && state.running ? "amber" : "blue")}<b>${esc(session.title)}</b><small>${esc(session.note)}</small></button>`;
}
function variantE() {
  return `<div class="frame e">${chrome("conversation stack")}<main class="e-main"><header class="e-top">${workspace()}<div class="stack-control"><span class="section-kicker">SESSION STACK</span><div>${sessionTabs()}</div></div><button class="primary" data-action="new-session">＋ New</button></header><div class="e-layout"><aside class="stack-rail"><div class="stack-label"><span class="eyebrow">RESUME A THREAD</span><button class="quiet" data-action="sessions">All</button></div>${state.sessions.map(stackCard).join("")}<div class="stack-footer">${model()}<button class="text-button" data-action="reload">↻ Reload Runtime</button></div></aside><section class="e-conversation"><header class="e-conversation-head"><div class="section-kicker">ACTIVE SESSION</div><h1>${esc(activeSession().title)}</h1><span>${state.running ? `${dot("amber")} ${esc(state.stage)}` : `${dot("blue")} Ready to run`}</span></header><div class="e-transcript">${state.messages.map((item, index) => `<div class="stack-message ${item.role}"><span class="stack-line"></span><div>${message(item, index)}</div></div>`).join("")}</div>${state.running ? `<div class="e-run-bar"><span>${dot("amber")} <b>Tool activity</b> · ${esc(state.tools.at(-1).detail)}</span><button class="interrupt" data-action="interrupt">Interrupt</button></div>` : ""}${composer()}</section></div></main></div>`;
}
function modal() {
  if (!state.modal) return "";
  if (state.modal === "workspace") return `<div class="backdrop" data-dismiss><section class="modal"><div class="section-kicker">SELECT WORKSPACE</div><h2>Where should Drycode work?</h2><p>Sessions remain bound to the Workspace selected when they are created.</p><div class="options"><button data-workspace="drycode|D:\\app\\drycode">▣ <span><b>drycode</b><small>D:\\app\\drycode</small></span></button><button data-workspace="agent-lab|D:\\app\\agent-lab">▣ <span><b>agent-lab</b><small>D:\\app\\agent-lab</small></span></button><button>＋ <span><b>Choose another folder…</b><small>Uses the native Windows folder picker</small></span></button></div><footer><button data-action="close-modal">Cancel</button></footer></section></div>`;
  if (state.modal === "model") return `<div class="backdrop" data-dismiss><section class="modal"><div class="section-kicker">MODEL PROVIDER</div><h2>Configure model</h2><p>This selection applies to the current Session.</p><label>Provider<select id="provider"><option>Anthropic</option><option>OpenAI</option><option>Google</option></select></label><label>Model<select id="model"><option>Claude Sonnet 4</option><option>Claude Opus 4</option><option>Claude Haiku 3.5</option></select></label><label>Credential<input type="password" value="••••••••••••"></label><footer><button data-action="close-modal">Cancel</button><button class="primary" data-action="save-model">Use model</button></footer></section></div>`;
  if (state.modal === "sessions") return `<div class="backdrop" data-dismiss><section class="modal"><div class="section-kicker">${esc(state.workspace.name)} / SESSIONS</div><h2>Resume a Session</h2><p>Choose a durable, linear conversation or start a new one.</p><div class="modal-sessions">${sessionList()}</div><footer><button data-action="close-modal">Cancel</button><button class="primary" data-action="new-session">＋ New Session</button></footer></section></div>`;
  if (state.modal === "reload") return `<div class="backdrop" data-dismiss><section class="modal"><div class="section-kicker">RUNTIME LIFECYCLE</div><h2>Reload all extensions?</h2><p>Drycode will stop the complete UI and Harness Runtime Generation, then start a fresh generation. Sessions remain available.</p><footer><button data-action="close-modal">Cancel</button><button class="danger" data-action="confirm-reload">Reload Drycode</button></footer></section></div>`;
  return `<div class="backdrop"><section class="modal"><div class="section-kicker">RUNTIME LIFECYCLE</div><h2>Reloading extensions…</h2><p>Starting a fresh UI and Harness pair.</p><div class="reload-status">${dot("amber")} Starting Runtime Generation 19</div></section></div>`;
}
function switcher() { return `<nav class="switcher"><button data-action="previous">←</button><b>${state.variant}</b><span>${variantNames[state.variant]}</span><button data-action="next">→</button></nav>`; }
function render() {
  const view = { A: variantA, B: variantB, C: variantC, D: variantD, E: variantE }[state.variant]();
  document.querySelector("#app").innerHTML = `${view}${switcher()}${modal()}`;
  bind();
}
function cycle(step) {
  const keys = Object.keys(variantNames); const index = keys.indexOf(state.variant);
  state.variant = keys[(index + step + keys.length) % keys.length];
  const url = new URL(location.href); url.searchParams.set("variant", state.variant); history.replaceState(null, "", url); render();
}
function send() {
  const text = state.draft.trim(); if (!text || state.running) return;
  state.messages.push({ role: "user", text, time: "now" }, { role: "assistant", text: "I’ll inspect the Workspace and report each Tool as it runs.", time: "now" });
  state.draft = ""; state.running = true; state.stage = "Inspecting Workspace";
  state.tools.push({ name: "search", label: "Workspace structure", detail: "Session context", status: "running", output: "Searching Workspace…", time: "now" }); render();
}
function bind() {
  document.querySelectorAll("[data-action]").forEach((el) => el.addEventListener("click", () => {
    const action = el.dataset.action;
    if (action === "sessions" && state.variant === "B") { state.bOpen = false; state.modal = null; render(); return; }
    if (["workspace", "model", "sessions", "reload"].includes(action)) state.modal = action;
    if (action === "close-modal") state.modal = null;
    if (action === "previous") return cycle(-1); if (action === "next") return cycle(1);
    if (action === "new-session") { const id = `session-${state.sessions.length + 1}`; state.sessions.unshift({ id, title: "Untitled Session", note: "No messages yet", age: "now", count: 0, state: "idle" }); state.active = id; state.messages = []; state.tools = []; state.running = false; state.bOpen = state.variant === "B"; state.modal = null; }
    if (action === "interrupt") { state.running = false; state.stage = "Interrupted"; state.tools = state.tools.map((tool) => tool.status === "running" ? { ...tool, status: "done", output: `${tool.output}\nInterrupted by user.` } : tool); state.messages.push({ role: "assistant", text: "Run interrupted. Completed messages and Tool results remain in this Session.", time: "now" }); }
    if (action === "send") return send();
    if (action === "save-model") { state.model.name = document.querySelector("#model").value; state.model.provider = document.querySelector("#provider").value; state.modal = null; }
    if (action === "confirm-reload") { state.modal = "reloading"; render(); setTimeout(() => { state.modal = null; state.running = false; state.stage = "Idle"; state.tools = state.tools.map((tool) => ({ ...tool, status: "done" })); render(); }, 1200); return; }
    render();
  }));
  document.querySelectorAll("[data-session]").forEach((el) => el.addEventListener("click", () => { state.active = el.dataset.session; state.modal = null; state.bOpen = state.variant === "B"; state.running = false; state.stage = "Idle"; state.tools = state.tools.map((tool) => ({ ...tool, status: "done" })); render(); }));
  document.querySelectorAll("[data-workspace]").forEach((el) => el.addEventListener("click", () => { const [name, path] = el.dataset.workspace.split("|"); state.workspace = { name, path }; state.modal = null; render(); }));
  document.querySelectorAll("[data-panel]").forEach((el) => el.addEventListener("click", () => { state.panel = el.dataset.panel; render(); }));
  document.querySelectorAll(".backdrop[data-dismiss]").forEach((el) => el.addEventListener("click", (event) => { if (event.target === el) { state.modal = null; render(); } }));
  document.querySelectorAll("textarea").forEach((area) => { area.addEventListener("input", () => { state.draft = area.value; }); area.addEventListener("keydown", (event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); state.draft = area.value; send(); } }); });
  document.querySelectorAll("[data-composer]").forEach((form) => form.addEventListener("submit", (event) => { event.preventDefault(); state.draft = form.querySelector("textarea").value; send(); }));
}
document.addEventListener("keydown", (event) => { const editing = event.target.matches?.("input, textarea, select"); if (!editing && event.key === "ArrowLeft") cycle(-1); if (!editing && event.key === "ArrowRight") cycle(1); if (event.key === "Escape" && state.modal) { state.modal = null; render(); } });
render();
