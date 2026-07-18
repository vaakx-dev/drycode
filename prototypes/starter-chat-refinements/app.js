const variants = [
  { id: "quiet-command-bar", name: "Quiet bar", icon: "panel-top" },
  { id: "compact-navigation", name: "Compact rail", icon: "panel-left-close" },
  { id: "inline-context", name: "Inline context", icon: "align-horizontal-space-around" },
  { id: "quiet-activity", name: "Quiet activity", icon: "activity" },
  { id: "balanced-minimal", name: "Balanced", icon: "scale" },
];

const requested = new URLSearchParams(location.search).get("variant");
let active = variants.some((variant) => variant.id === requested) ? requested : variants[0].id;

function render() {
  document.querySelector("#variants").innerHTML = variants.map((variant) => `
    <button class="variant ${variant.id === active ? "active" : ""}" data-variant="${variant.id}">
      <i data-lucide="${variant.icon}" aria-hidden="true"></i>
      <span>${variant.name}</span>
    </button>
  `).join("");

  const path = `./${active}/`;
  document.querySelector("#preview").src = path;
  document.querySelector("#open").href = path;

  document.querySelectorAll("[data-variant]").forEach((button) => {
    button.addEventListener("click", () => {
      active = button.dataset.variant;
      const url = new URL(location.href);
      url.searchParams.set("variant", active);
      history.replaceState(null, "", url);
      render();
    });
  });

  window.lucide?.createIcons();
}

render();
