# Starter chat prototype

The selected Inline context direction for `docs: shape the starter chat experience`. This dependency-light, in-memory prototype keeps the Windows NavigationView and chat transcript while placing Workspace, Session, and Model context in one compact header and a matching composer context line. Model configuration does not occupy a separate navigation footer surface; Reload remains in the NavigationView footer.

Workspace selection, Session creation/resuming, Model configuration, message sending, expandable Tool observation, Run interruption, and Runtime Reload are useful browser-only stubs.

## Run

```sh
node prototypes/starter-chat/server.mjs
```

Open <http://127.0.0.1:4180/>. Icons are provided by the pinned Lucide browser CDN and hydrated with `lucide.createIcons()`.
