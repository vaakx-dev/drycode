# Drycode Settings · Variation 03

A standalone settings destination for the Drycode starter chat experience. This direction treats Settings as a Core composition and lifecycle surface rather than a generic model preferences page.

## What to review

- **Extension Graph** is the primary view: the accepted graph, resolved Extensions, Service Slot contributions, dependencies, and a manifest inspector are visible together.
- **Service Slots** shows the frozen effective providers for the UI and Harness runtimes.
- **Lifecycle** explains Runtime Generation and Reload semantics, including what remains durable.
- **Drycode Home** keeps installed Extensions and durable, diagnostic, cache, and temporary data grounded in `~/.drycode/`.
- Sidebar collapse, Extension selection, manifest inspection, graph filtering, settings navigation, workspace filters, and Reload confirmation/progress are interactive browser-only stubs.

## Run

Open `index.html` directly, or serve the repository with any static server. Icons use the pinned Lucide browser CDN. All state is in-memory and no files outside this variation are touched.
