const variations = [
  {
    id: "control-center",
    title: "Control Center",
    kind: "Architecture-led",
    description: "A complete Drycode control center organized around Overview, Extensions, Providers, Runtime, Data and Logs, and About.",
    tags: ["overview", "extension graph", "runtime", "providers"],
  },
  {
    id: "ownership-first",
    title: "Ownership First",
    kind: "Architecture-led",
    description: "Settings grouped by Drycode, Starter Shell, and extension ownership so every configuration surface has a clear responsible component.",
    tags: ["ownership", "extensions", "diagnostics", "data"],
  },
  {
    id: "variation-03",
    title: "Composition Inspector",
    kind: "Independent exploration",
    description: "Extension Graph and Service Slot composition become the primary settings experience, supported by lifecycle and Drycode Home views.",
    tags: ["graph first", "service slots", "manifests"],
  },
  {
    id: "variation-04",
    title: "System Map",
    kind: "Independent exploration",
    description: "A visual map of the current Runtime Generation with graph visualization, extension-owned drawers, providers, diagnostics, and storage.",
    tags: ["system map", "drawers", "diagnostics"],
  },
  {
    id: "variation-05",
    title: "Operating Picture",
    kind: "Independent exploration",
    description: "A dense operational overview that keeps Runtime Generation, Extension Graph, provider access, local data, and diagnostics visible together.",
    tags: ["operations", "search", "lifecycle"],
  },
  {
    id: "variation-06",
    title: "Graph Workbench",
    kind: "Independent exploration",
    description: "A graph-centered workbench for Extension manifests, Service Slots, Runtime Generation, and staging local packages for Reload.",
    tags: ["workbench", "local extensions", "reload"],
  },
  {
    id: "variation-07",
    title: "Control Plane",
    kind: "Independent exploration",
    description: "A sticky control-plane index connects graph inspection, runtime health, Drycode Home, providers, and Shell-owned preferences.",
    tags: ["control plane", "shell settings", "storage"],
  },
  {
    id: "variation-08",
    title: "Extension Manager",
    kind: "Independent exploration",
    description: "Extensions lead a broader practical settings system spanning lifecycle, Workspaces, Sessions, appearance, shortcuts, and diagnostics.",
    tags: ["extensions", "practical settings", "appearance"],
  },
  {
    id: "variation-09",
    title: "Runtime Operations",
    kind: "Independent exploration",
    description: "A runtime operations direction exposing UI and Harness registries, Bridge activity, Recovery, Reload, and Drycode Home.",
    tags: ["runtime", "bridge", "recovery", "registries"],
  },
  {
    id: "variation-10",
    title: "Control Surface",
    kind: "Independent exploration",
    description: "A balanced control surface for graph inspection, provider-owned credentials, runtime lifecycle, preferences, diagnostics, and cache.",
    tags: ["balanced", "providers", "diagnostics"],
  },
];

const list = document.querySelector("#variation-list");
const frame = document.querySelector("#variation-frame");
const title = document.querySelector("#variation-title");
const kind = document.querySelector("#variation-kind");
const description = document.querySelector("#variation-description");
const tags = document.querySelector("#variation-tags");
const open = document.querySelector("#open-variation");
let selected = Math.max(0, variations.findIndex((item) => item.id === new URLSearchParams(location.search).get("view")));

function renderList() {
  list.innerHTML = variations.map((variation, index) => `<button class="variation-item ${index === selected ? "selected" : ""}" data-index="${index}"><span class="variation-number">${String(index + 1).padStart(2, "0")}</span><span><b>${variation.title}</b><small>${variation.kind}</small></span></button>`).join("");
  list.querySelectorAll("[data-index]").forEach((button) => button.addEventListener("click", () => select(Number(button.dataset.index))));
}

function select(index) {
  selected = (index + variations.length) % variations.length;
  const variation = variations[selected];
  title.textContent = variation.title;
  kind.textContent = variation.kind;
  description.textContent = variation.description;
  tags.innerHTML = variation.tags.map((tag) => `<span>${tag}</span>`).join("");
  frame.src = `./${variation.id}/index.html`;
  open.href = `./${variation.id}/index.html`;
  history.replaceState(null, "", `?view=${variation.id}`);
  renderList();
}

document.querySelector("#previous").addEventListener("click", () => select(selected - 1));
document.querySelector("#next").addEventListener("click", () => select(selected + 1));
document.addEventListener("keydown", (event) => {
  if (event.altKey && event.key === "ArrowLeft") select(selected - 1);
  if (event.altKey && event.key === "ArrowRight") select(selected + 1);
});

select(selected);
