# Drycode Settings · variation 06

A standalone settings surface for the existing Drycode starter chat product. It keeps the compact desktop topbar, session-aware sidebar, dark neutral palette, and Lucide icon language while making Drycode's local extensibility the center of Settings.

## What this explores

- **Extension Graph** — a visual, deterministic view of discovered local Extension Manifests and their dependency edges. The copy makes the atomic graph boundary explicit: the graph is accepted or rejected as a whole.
- **Service Slots** — the effective providers in the frozen UI and Harness registries for the current Runtime Generation.
- **Runtime Generation** — lifecycle timeline and Reload behavior for a paired UI runtime, Harness runtime, and generation-scoped UI-Harness Bridge.
- **Extensions** — inspect manifest identity, compatibility, entry point, and dependencies; stage a local package through the Add local Extension flow.
- **Overview** — a compact composition view that connects the graph, registries, and generation to the Sessions users already know from Chat.

## Run

This variation is dependency-light and browser-only. Serve the repository (or this folder) over HTTP and open `index.html`; ES modules work best from a local server.

```sh
npx serve .
```

The prototype uses the pinned Lucide browser CDN for interface icons. Interactions are in-memory: sidebar collapse, section navigation, Extension inspection, staging a local manifest, graph diagnostics, and the complete Runtime Reload confirmation/progress flow are all functional browser stubs.

## Notes

The extension list represents a resolved local graph rather than a marketplace package manager. Adding an Extension stages a manifest for the next Reload. Reload stops and starts the complete generation while leaving the durable Session list represented in the sidebar.
