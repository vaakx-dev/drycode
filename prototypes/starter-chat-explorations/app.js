const explorations = [
  {
    id: "chat-first",
    name: "Chat-first",
    description: "Conversation hierarchy and familiar chat navigation.",
    variants: ["Context rail", "Session shelf", "Run lane", "Focus canvas", "Start / resume"],
  },
  {
    id: "ide-density",
    name: "IDE density",
    description: "Dense desktop information structures without IDE features.",
    variants: ["Command strip", "Split console", "Focus stack", "Workbench matrix", "Run timeline"],
  },
  {
    id: "windows-native",
    name: "Windows native",
    description: "Fluent-inspired command, navigation, and split-view patterns.",
    variants: ["Navigation view", "Run cockpit", "Workspace hub", "Focus surface", "Session tabs"],
  },
  {
    id: "minimal-command",
    name: "Minimal command",
    description: "Focused canvases, transient navigation, and compact controls.",
    variants: ["Command deck", "Focus canvas", "Session shelf", "Run ledger", "Launcher home"],
  },
  {
    id: "experimental",
    name: "Experimental",
    description: "Alternative hierarchies for Sessions, Runs, and Tool activity.",
    variants: ["Run stage", "Session cards", "Transcript timeline", "Adaptive inspector", "Conversation stack"],
  },
];

let filter = "all";
const keys = ["A", "B", "C", "D", "E"];

function render_filters() {
  const choices = [{ id: "all", name: "All views" }, ...explorations];
  document.querySelector("#filters").innerHTML = choices.map((choice) => `
    <button class="${choice.id === filter ? "active" : ""}" data-filter="${choice.id}">${choice.name}</button>
  `).join("");

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      filter = button.dataset.filter;
      render();
    });
  });
}

function render_gallery() {
  const visible = filter === "all" ? explorations : explorations.filter((group) => group.id === filter);
  document.querySelector("#gallery").innerHTML = visible.map((group) => `
    <article class="group">
      <div class="group-heading">
        <div><span class="eyebrow">${group.name}</span><h2>${group.description}</h2></div>
        <a href="./${group.id}/README.md" target="_blank">Read hypotheses</a>
      </div>
      <div class="cards">
        ${group.variants.map((name, index) => `
          <a class="card" href="./${group.id}/?variant=${keys[index]}" target="_blank">
            <span class="variant">${keys[index]}</span>
            <strong>${name}</strong>
            <span class="open">Open view ↗</span>
          </a>
        `).join("")}
      </div>
    </article>
  `).join("");
}

function render() {
  render_filters();
  render_gallery();
}

render();
