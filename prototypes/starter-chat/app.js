const variants = {
  A: "Session rail",
  B: "Activity cockpit",
  C: "Conversation deck",
};

const state = {
  variant: new URLSearchParams(location.search).get("variant")?.toUpperCase() || "A",
  workspace: { name: "drycode", path: "D:\\app\\drycode" },
  model: { provider: "Anthropic", name: "Claude Sonnet 4", ready: true },
  active_session: "architecture",
  running: true,
  run_stage: "Reading UI contracts",
  modal: null,
  draft: "",
  sessions: [
    { id: "architecture", title: "Shape extension architecture", summary: "Working through the shell and bridge boundaries", time: "now" },
    { id: "harness", title: "Extract the agent harness", summary: "Mapped reusable Pi source seams", time: "2h" },
    { id: "installer", title: "Plan the Windows installer", summary: "Stopped after comparing package formats", time: "Fri" },
  ],
  messages: [
    { role: "user", text: "Review the shell contract and tell me what the starter chat needs to own." },
    { role: "assistant", text: "I’ll trace the Shell service, bridge endpoints, and Session operations, then separate chat-owned behavior from Core lifecycle behavior." },
  ],
  tools: [
    { name: "read", detail: "docs/adr/0004-shell-contract.md", status: "completed", output: "Read 184 lines\nShell owns the complete web-content subtree.\nCore exposes no product layout or widget contracts." },
    { name: "search", detail: "Session operations and bridge endpoints", status: "running", output: "Searching CONTEXT.md and planning records…" },
  ],
};

if (!variants[state.variant]) state.variant = "A";

const escape_html = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

function titlebar() {
  return `
    <header class="titlebar">
      <span class="logo-mark"></span>
      <span class="brand">drycode</span>
      <span class="window-drag"></span>
      <span class="status-chip"><span class="dot ${state.running ? "running" : "live"}"></span>${state.running ? "Run active" : "Ready"}</span>
      <div class="window-controls" aria-hidden="true"><span>─</span><span>□</span><span>×</span></div>
    </header>`;
}

function workspace_chip() {
  return `
    <button class="workspace-chip" data-action="workspace" title="Change Workspace">
      <span>◫</span>
      <strong>${escape_html(state.workspace.name)}</strong>
      <span class="dim">⌄</span>
    </button>`;
}

function model_chip() {
  return `
    <button class="model-chip" data-action="model" title="Configure model">
      <span class="dot ${state.model.ready ? "live" : ""}"></span>
      <strong>${escape_html(state.model.name)}</strong>
      <span class="dim">⌄</span>
    </button>`;
}

function sessions() {
  return `
    <div class="session-list">
      ${state.sessions.map((session) => `
        <button class="session-item ${session.id === state.active_session ? "active" : ""}" data-session="${session.id}">
          <span class="session-title">${escape_html(session.title)}</span>
          <span class="session-meta">${session.time}</span>
          <span class="session-summary">${escape_html(session.summary)}</span>
        </button>`).join("")}
    </div>`;
}

function transcript({ compact_tools = false } = {}) {
  const messages = state.messages.map((message) => `
    <article class="message ${message.role}">
      <div class="message-head">
        <span class="avatar">${message.role === "user" ? "YOU" : "DRY"}</span>
        <span>${message.role === "user" ? "You" : "Drycode"}</span>
      </div>
      <p>${escape_html(message.text)}</p>
    </article>`).join("");

  const tools = compact_tools ? "" : state.tools.map((tool) => `
    <details class="tool-card" ${tool.status === "running" ? "open" : ""}>
      <summary>
        <span>${tool.status === "running" ? "◌" : "✓"}</span>
        <strong>${escape_html(tool.name)}</strong>
        <span class="muted">${escape_html(tool.detail)}</span>
        <span class="tool-state ${tool.status}">${tool.status}</span>
      </summary>
      <pre>${escape_html(tool.output)}</pre>
    </details>`).join("");

  return `<section class="transcript">${messages}<div class="message assistant">${tools}</div></section>`;
}

function composer({ show_context = false } = {}) {
  return `
    <div class="composer-shell">
      <div class="composer">
        <textarea aria-label="Message" placeholder="Ask Drycode to work in this Workspace…">${escape_html(state.draft)}</textarea>
        <div class="composer-actions">
          <button class="ghost" title="Attach context">＋</button>
          ${show_context ? `<span class="composer-hint mono">${escape_html(state.workspace.name)} · ${escape_html(state.model.name)}</span>` : model_chip()}
          <span class="spacer"></span>
          <span class="composer-hint">Enter to send · Shift+Enter for newline</span>
          ${state.running
            ? `<button class="danger send-button" data-action="interrupt">■ Interrupt</button>`
            : `<button class="primary send-button" data-action="send">Send ↑</button>`}
        </div>
        ${show_context ? `
          <div class="context-line">
            <span>Workspace: <strong>${escape_html(state.workspace.path)}</strong></span>
            <span>·</span>
            <button class="ghost" data-action="model">Model settings</button>
          </div>` : ""}
      </div>
    </div>`;
}

function variant_a() {
  const active = state.sessions.find((session) => session.id === state.active_session);
  return `
    <div class="app-frame variant-a">
      ${titlebar()}
      <div class="body">
        <aside class="rail">
          <div class="rail-top">
            ${workspace_chip()}
            <button class="primary" data-action="new-session">＋ New session</button>
          </div>
          <div class="sessions">
            <span class="eyebrow">Sessions</span>
            ${sessions()}
          </div>
          <div class="rail-bottom">
            <button class="ghost" data-action="model">⚙ Model configuration</button>
            <button class="ghost" data-action="reload">↻ Reload extensions</button>
          </div>
        </aside>
        <section class="main">
          <header class="chat-head">
            <h1>${escape_html(active.title)}</h1>
            <span class="spacer"></span>
            ${state.running ? `<span class="run-banner"><span class="dot running"></span>${escape_html(state.run_stage)}</span>` : ""}
            <button class="icon-button" title="Session actions">···</button>
          </header>
          ${transcript()}
          ${composer()}
        </section>
      </div>
    </div>`;
}

function activity_feed() {
  return `
    <div class="activity-feed">
      <div class="activity-event"><strong>run_started</strong>Session run began<code>run 0190…d42a</code></div>
      <div class="activity-event"><strong>message_finished</strong>Plan prepared<code>assistant · 312 tokens</code></div>
      ${state.tools.map((tool) => `
        <div class="activity-event ${tool.status === "running" ? "live" : ""}">
          <strong>${tool.status === "running" ? "tool_progress" : "tool_finished"}</strong>
          ${escape_html(tool.name)} · ${escape_html(tool.status)}
          <code>${escape_html(tool.detail)}</code>
        </div>`).join("")}
    </div>`;
}

function variant_b() {
  const active = state.sessions.find((session) => session.id === state.active_session);
  return `
    <div class="app-frame variant-b">
      ${titlebar()}
      <header class="commandbar">
        ${workspace_chip()}
        <button data-action="new-session">＋ Session</button>
        <span class="spacer"></span>
        ${model_chip()}
        <button data-action="reload" title="Reload complete Runtime Generation">↻ Reload</button>
      </header>
      <div class="grid">
        <aside class="sessions-panel">
          <div class="panel-heading"><span class="eyebrow">Workspace sessions</span><span class="spacer"></span><button class="icon-button ghost">⌕</button></div>
          ${sessions()}
        </aside>
        <section class="center">
          <header class="center-title">
            <span class="dot ${state.running ? "running" : "live"}"></span>
            <strong>${escape_html(active.title)}</strong>
            <span class="spacer"></span>
            <span class="mono dim">${state.running ? "RUNNING" : "IDLE"}</span>
          </header>
          ${transcript({ compact_tools: true })}
          ${composer({ show_context: true })}
        </section>
        <aside class="activity-panel">
          <div class="panel-heading"><span class="eyebrow">Run activity</span><span class="spacer"></span><span class="mono dim">LIVE</span></div>
          ${activity_feed()}
          <div class="activity-footer">
            ${state.running ? `<button class="danger" data-action="interrupt">■ Interrupt active run</button>` : `<span class="muted">No active run</span>`}
            <button class="ghost">Copy run details</button>
          </div>
        </aside>
      </div>
    </div>`;
}

function variant_c() {
  const active = state.sessions.find((session) => session.id === state.active_session);
  const compact_tool = state.tools.at(-1);
  return `
    <div class="app-frame variant-c">
      ${titlebar()}
      <nav class="nav">
        <div class="nav-left">${workspace_chip()}</div>
        <button class="session-jump" data-action="sessions">
          <span class="dot ${state.running ? "running" : "live"}"></span>
          <strong>${escape_html(active.title)}</strong>
          <span class="muted">Sessions ⌄</span>
        </button>
        <div class="nav-right">
          <button class="icon-button" data-action="new-session" title="New session">＋</button>
          <button class="icon-button" data-action="model" title="Model configuration">⚙</button>
          <button class="icon-button" data-action="reload" title="Reload extensions">↻</button>
        </div>
      </nav>
      ${transcript({ compact_tools: true })}
      ${state.running ? `
        <div class="inline-run">
          <span class="dot running"></span>
          <strong>${escape_html(compact_tool.name)}</strong>
          <span class="muted">${escape_html(compact_tool.detail)}</span>
          <span class="spacer"></span>
          <button class="danger" data-action="interrupt">■ Interrupt</button>
        </div>` : ""}
      ${composer({ show_context: true })}
    </div>`;
}

function switcher() {
  return `
    <aside class="prototype-switcher" aria-label="Prototype variants">
      <button data-action="previous-variant" aria-label="Previous variant">←</button>
      <span class="prototype-label">${state.variant} · ${variants[state.variant]}</span>
      <button data-action="next-variant" aria-label="Next variant">→</button>
    </aside>`;
}

function modal() {
  if (!state.modal) return "";

  if (state.modal === "workspace") {
    return `
      <div class="modal-backdrop" data-dismiss="true">
        <section class="modal" role="dialog" aria-modal="true">
          <span class="eyebrow">Select Workspace</span>
          <h2>Where should Drycode work?</h2>
          <p>A Session remains permanently bound to the Workspace selected when it is created.</p>
          <div class="path-list">
            <button class="path-option" data-workspace="drycode|D:\\app\\drycode"><span>◫</span><span><strong>drycode</strong><small>D:\\app\\drycode</small></span></button>
            <button class="path-option" data-workspace="agent-lab|D:\\app\\agent-lab"><span>◫</span><span><strong>agent-lab</strong><small>D:\\app\\agent-lab</small></span></button>
            <button class="path-option"><span>＋</span><span><strong>Choose another folder…</strong><small>Uses the native Windows folder picker</small></span></button>
          </div>
          <div class="modal-actions"><button data-action="close-modal">Cancel</button></div>
        </section>
      </div>`;
  }

  if (state.modal === "model") {
    return `
      <div class="modal-backdrop" data-dismiss="true">
        <section class="modal" role="dialog" aria-modal="true">
          <span class="eyebrow">Session model</span>
          <h2>Configure model</h2>
          <p>The Model Provider owns credentials and discovery. This selection applies to the current Session.</p>
          <label>Provider<select id="provider"><option>Anthropic</option><option>OpenAI</option><option>Google</option></select></label>
          <label>Model<select id="model"><option>Claude Sonnet 4</option><option>Claude Opus 4</option><option>Claude Haiku 3.5</option></select></label>
          <label>API credential<input type="password" value="••••••••••••" aria-label="API credential"></label>
          <div class="modal-actions"><button data-action="close-modal">Cancel</button><button class="primary" data-action="save-model">Use model</button></div>
        </section>
      </div>`;
  }

  if (state.modal === "sessions") {
    return `
      <div class="modal-backdrop" data-dismiss="true">
        <section class="modal" role="dialog" aria-modal="true">
          <span class="eyebrow">${escape_html(state.workspace.name)}</span>
          <h2>Open a Session</h2>
          <p>Resume a durable conversation or start a new one in this Workspace.</p>
          ${sessions()}
          <div class="modal-actions"><button data-action="close-modal">Cancel</button><button class="primary" data-action="new-session">＋ New session</button></div>
        </section>
      </div>`;
  }

  if (state.modal === "reload") {
    return `
      <div class="modal-backdrop" data-dismiss="true">
        <section class="modal" role="dialog" aria-modal="true">
          <span class="eyebrow">Runtime lifecycle</span>
          <h2>Reload all extensions?</h2>
          <p>Drycode will interrupt active work, stop the complete UI and Harness Runtime Generation, then start a fresh generation. Durable Sessions remain available.</p>
          <div class="modal-actions"><button data-action="close-modal">Cancel</button><button class="danger" data-action="confirm-reload">Reload Drycode</button></div>
        </section>
      </div>`;
  }

  return `
    <div class="modal-backdrop">
      <section class="modal" role="dialog" aria-modal="true">
        <span class="eyebrow">Runtime lifecycle</span>
        <h2>Reloading extensions…</h2>
        <p>Stopping Runtime Generation 18 and starting a fresh UI and Harness pair.</p>
        <div class="status-chip"><span class="dot running"></span>Starting Runtime Generation 19</div>
      </section>
    </div>`;
}

function render() {
  const view = state.variant === "A" ? variant_a() : state.variant === "B" ? variant_b() : variant_c();
  document.querySelector("#app").innerHTML = `${view}${switcher()}${modal()}`;
  bind();
}

function cycle_variant(step) {
  const keys = Object.keys(variants);
  const index = keys.indexOf(state.variant);
  state.variant = keys[(index + step + keys.length) % keys.length];
  const url = new URL(location.href);
  url.searchParams.set("variant", state.variant);
  history.replaceState(null, "", url);
  render();
}

function select_session(id) {
  state.active_session = id;
  state.modal = null;
  state.running = false;
  state.run_stage = "Idle";
  state.tools = state.tools.map((tool) => ({ ...tool, status: "completed" }));
  render();
}

function send() {
  const text = state.draft.trim();
  if (!text || state.running) return;
  state.messages.push({ role: "user", text });
  state.messages.push({ role: "assistant", text: "I’ll inspect the Workspace and report each Tool as it runs." });
  state.draft = "";
  state.running = true;
  state.run_stage = "Inspecting Workspace";
  state.tools.push({ name: "search", detail: "Workspace structure", status: "running", output: "Searching files…" });
  render();
}

function bind() {
  document.querySelectorAll("[data-action]").forEach((element) => {
    element.addEventListener("click", () => {
      const action = element.dataset.action;
      if (action === "workspace" || action === "model" || action === "sessions" || action === "reload") state.modal = action;
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
        state.modal = null;
      }
      if (action === "interrupt") {
        state.running = false;
        state.run_stage = "Interrupted";
        state.tools = state.tools.map((tool) => tool.status === "running" ? { ...tool, status: "completed", output: `${tool.output}\nInterrupted by user.` } : tool);
        state.messages.push({ role: "assistant", text: "Run interrupted. Completed messages and Tool results remain in this Session." });
      }
      if (action === "send") return send();
      if (action === "save-model") {
        state.model.name = document.querySelector("#model").value;
        state.model.provider = document.querySelector("#provider").value;
        state.model.ready = true;
        state.modal = null;
      }
      if (action === "confirm-reload") {
        state.modal = "reloading";
        render();
        window.setTimeout(() => {
          state.modal = null;
          state.running = false;
          state.run_stage = "Idle";
          state.tools = state.tools.map((tool) => ({ ...tool, status: "completed" }));
          render();
        }, 1600);
        return;
      }
      render();
    });
  });

  document.querySelectorAll("[data-session]").forEach((element) => {
    element.addEventListener("click", () => select_session(element.dataset.session));
  });

  document.querySelectorAll("[data-workspace]").forEach((element) => {
    element.addEventListener("click", () => {
      const [name, path] = element.dataset.workspace.split("|");
      state.workspace = { name, path };
      state.modal = null;
      render();
    });
  });

  document.querySelectorAll(".modal-backdrop[data-dismiss]").forEach((element) => {
    element.addEventListener("click", (event) => {
      if (event.target === element) {
        state.modal = null;
        render();
      }
    });
  });

  document.querySelectorAll("textarea").forEach((textarea) => {
    textarea.addEventListener("input", () => { state.draft = textarea.value; });
    textarea.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        state.draft = textarea.value;
        send();
      }
    });
  });
}

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const editing = target.matches("input, textarea, select, [contenteditable]");
  if (!editing && event.key === "ArrowLeft") cycle_variant(-1);
  if (!editing && event.key === "ArrowRight") cycle_variant(1);
  if (event.key === "Escape" && state.modal) {
    state.modal = null;
    render();
  }
});

render();
