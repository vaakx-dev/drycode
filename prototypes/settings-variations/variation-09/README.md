# Drycode Settings · Variation 09

A standalone settings-page direction for Drycode's local, extension-composed AI coding application. It keeps the starter chat's full-width desktop topbar, workspace tabs, Session list, Search/New Session actions, collapsed sidebar mode, and Settings entry point, while turning the main surface into a Runtime Operations view.

## Direction

This variation treats Settings as an operational map rather than a provider catalog. The page makes the current Runtime Generation legible at a glance, then exposes the lifecycle surfaces that matter to Drycode:

- complete Extension Graph resolution and deterministic graph identity;
- separate effective UI Runtime and Harness Runtime Service Registries;
- generation-scoped UI-Harness Bridge Calls and Streams;
- Drycode Home locations for local durable state, cache, and diagnostics;
- the Core-owned Recovery Surface and stop-then-start Reload behavior.

The graph and registry rows are intentionally descriptive rather than individual enable controls: Drycode accepts or rejects the Extension Graph as a whole, and effective Service Slots have one provider or no provider in a runtime generation.

## Run

This prototype is dependency-light and can be opened directly as `index.html`. For a local server, from the repository root run:

```sh
npx serve prototypes/settings-variations/variation-09
```

The Lucide icon script is loaded from its pinned CDN URL. All interaction state is in-memory browser state; folder selection uses the browser directory picker when available.

## Interactive surfaces

- Collapse/expand the integrated sidebar and filter its Workspaces.
- Inspect the complete Extension Graph.
- Expand the resolved extension list.
- View Bridge activity.
- Clear the graph cache or open Drycode Home (desktop-host stubs).
- Confirm Reload to see a new Runtime Generation start.
- Use `Ctrl K` and `Ctrl Shift O` for the shell's Search and New Session stubs.
