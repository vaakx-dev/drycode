# Variation 10 · Control surface

A standalone Drycode Settings concept that treats settings as a **control surface** for the local extension host, rather than a model-preferences form.

## Run

Open `index.html` directly in a browser, or serve this directory with any static server. The only external dependency is Lucide's icon CDN; the page remains usable without it.

## Interaction notes

- Switch between Overview, Extension Graph, Model Providers, Runtime Generation, and Drycode Home from the settings rail.
- Expand graph members to inspect ownership, service slots, entry points, and dependencies.
- Filter the resolved Extension Graph, manage provider-owned credential references, copy the Drycode Home path, export diagnostics, and clear derived cache.
- Toggle session defaults, collapse the recognizable Drycode shell, choose a Workspace, and trigger a simulated Runtime Generation replacement.
- Reload demonstrates the stop-then-start lifecycle: the paired UI and Harness runtimes are replaced together while durable Sessions remain available.

## Architecture shown

The concept intentionally makes these boundaries explicit:

- **One atomic Extension Graph:** Core accepts or rejects the complete deterministic graph. Extensions are fully trusted local code, so there are no per-extension enable switches or capability prompts.
- **Runtime Generation:** UI Runtime, Harness Runtime, and their generation-scoped UI–Harness Bridge start and stop as one supervised unit. Reload does not mean a desktop-window restart.
- **Provider-owned credentials:** a Model Provider owns model discovery, credential resolution, requests, and normalized streaming. Core composes the Service Slot without becoming a credential vault.
- **No IDE scope:** Workspaces are local folders supplied as Session context. The concept does not add an editor, project index, source-control settings, or workspace configuration.
