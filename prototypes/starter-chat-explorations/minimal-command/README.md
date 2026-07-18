# Minimal command explorations

Five deliberately throwaway, dependency-free static views for the `docs: shape the starter chat experience` wayfinding exploration. Drycode is treated as a local chat surface—not an IDE: there are no files, editor, terminal, or source-control concepts here.

## Run

From the repository root:

```sh
node prototypes/starter-chat-explorations/minimal-command/server.mjs
```

Open <http://127.0.0.1:4175/?variant=A>. The bottom switcher and Left/Right arrows move between views. The views are also directly addressable as `?variant=A`, `?variant=B`, `?variant=C`, `?variant=D`, and `?variant=E`.

All data is in-memory. Stub interactions include Workspace selection, Session resume and creation, Model configuration, message sending, expandable Tool output, Run interruption, Reload confirmation, and `Ctrl/Cmd+K` command menu.

## Variants and hypotheses

- **A · Command deck** — A horizontal `Workspace → Session` strip makes the operating context explicit, and a bottom Tool tray keeps the conversation clean while activity remains visible. **Tradeoff:** a bottom tray has limited room and competes with the composer.
- **B · Focus canvas** — One centered conversation canvas prioritizes reading and writing. A narrow status rail exposes Workspace, Model, current stage, and interruption without a permanent session rail. **Tradeoff:** resuming another Session is one overlay away and the canvas is less information-dense.
- **C · Session shelf** — A persistent Session shelf makes durable conversations and “Start new session” the main wayfinding object. A separate status column gives Tools a stable home. **Tradeoff:** two side columns reduce message width and make this feel more like an operations surface.
- **D · Run ledger** — Chat and a durable-looking Run ledger share the window. The ledger treats Tool activity, run identity, and interruption as first-class operational information. **Tradeoff:** it is the least minimal view and can make a simple question feel like a job monitor.
- **E · Launcher home** — A command/search launcher and recent Session list are always visible, providing strong first-use affordance while the current conversation stays focused. **Tradeoff:** the starter view spends precious space on navigation and the launcher can imply more commands than Drycode actually has.

The palette is neutral slate with restrained blue, violet, amber, and muted red accents. No persistence, backend, tests, or production abstractions are intended.
