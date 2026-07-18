# Starter chat prototype

The selected direction for `docs: shape the starter chat experience`. This dependency-light, in-memory prototype pairs a label-free chat transcript with a T3-inspired Session sidebar beneath a full-width top bar: compact Search and New Session actions, filtering by Workspace, prominent cards for every active Session, quiet settled Sessions, and footer settings. User messages align right without bubbles. The Workspace plus button opens the operating-system folder picker directly.

Workspace selection, Session creation/resuming, Model configuration, message sending, expandable Tool observation, Run interruption, and Runtime Reload are useful browser-only stubs.

## Run

```sh
node prototypes/starter-chat/server.mjs
```

Open <http://127.0.0.1:4180/>. Icons are provided by the pinned Lucide browser CDN and hydrated with `lucide.createIcons()`.
