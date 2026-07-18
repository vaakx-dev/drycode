# Balanced minimal

A single throwaway refinement of Windows-native A (Navigation view). It keeps the persistent Workspace and Session rail, with Model and Reload in the quiet footer, while reducing padding, decorative borders, and duplicate labels so the conversation is the daily default. Tool observation remains inline and the active Run can be interrupted from the composer.

## Run

```sh
node prototypes/starter-chat-refinements/balanced-minimal/server.mjs
```

Open <http://127.0.0.1:4174/>. Everything is static and in memory. Workspace, Model, Session, send, Tool, interruption, and Reload controls are useful stubs.

Lucide icons are loaded from the browser CDN and initialized with `lucide.createIcons()`.
