# Inline context

A dependency-light, in-memory throwaway refinement of Windows-native Variant A (Navigation view). The NavigationView and chat transcript remain intact, while Workspace, Session, and Model context move into one compact header and a matching composer context line. Model configuration no longer occupies a separate navigation footer surface; Reload remains in the NavigationView footer.

Workspace selection, Session creation/resuming, Model configuration, message sending, expandable Tool observation, Run interruption, and Runtime Reload are useful browser-only stubs.

## Run

```sh
node prototypes/starter-chat-refinements/inline-context/server.mjs
```

Open <http://127.0.0.1:4174/>. Icons are provided by the Lucide browser CDN and hydrated with `lucide.createIcons()`.
