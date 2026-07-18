# Drycode Settings · Variation 08

A standalone review prototype for a Settings surface organized around **local Extensions and Runtime lifecycle**, rather than a provider-only preference list.

## Direction

Variation 08 keeps the starter chat's compact topbar, restrained sidebar, typography, and neutral dark canvas, then gives Settings its own control-center architecture:

- **Extensions** is the landing surface. It shows locally discovered Extension Manifests, contribution areas, graph state, and a selected Extension inspector.
- The inspector makes the Extension Graph contract explicit: packages are fully trusted and graph-controlled, so there are no misleading per-extension enable/disable switches that could create a partial graph.
- **Lifecycle** shows Discover → Resolve graph → Start generation → Run, paired UI/Harness status, the generation-scoped Bridge, reload consequences, and the Recovery Surface.
- **Overview**, **Workspaces**, **Sessions**, **Appearance**, **Shortcuts**, and **Data & diagnostics** cover practical app configuration without turning the surface into an IDE or a model picker.
- Model Provider and model defaults appear only where they belong: as new-Run configuration, with discovery and credential resolution owned by an Extension.

## Run

Open `index.html` directly in a browser, or serve this directory with any static file server. No build step is required.

For example:

```sh
npx serve prototypes/settings-variations/variation-08
```

The pinned Lucide browser CDN supplies interface icons. All state is intentionally in-memory.

## Interactions to review

- Navigate between Settings areas in the sidebar; collapse the sidebar with the topbar control or `Ctrl B`.
- Search/filter the local Extension list, select packages, inspect their manifest preview, and copy paths.
- Refresh local discovery, move through lifecycle, and open the Reload confirmation. Reload simulates a stop/start replacement and preserves the Settings window.
- Change Workspace, Session, Run, and Appearance controls. Switches are limited to valid local presentation/storage preferences; Extensions themselves are not individually toggled.
- Add a Workspace with the browser folder picker where supported, copy diagnostic data, and clear temporary data through its confirmation dialog.

This prototype is browser-only and does not read or modify the actual `~/.drycode` directory.
