# Compact Navigation

A single throwaway refinement of Windows-native Variant A (Navigation view). The left NavigationView keeps Workspace, New Session, a simple Sessions entry, and a low-weight **Resume a Session** list. Model configuration and Reload stay persistent in the footer, while the center remains the chat and inline Tool activity surface.

Compared with Windows-native A, this variation removes the duplicated Workspace navigation action, reduces rail width and row density, and makes resuming durable Sessions the primary rail affordance. It retains Workspace selection, new/resumed Sessions, Model configuration, messages, Tool activity, Run interruption, and Runtime Reload as in-memory stubs.

## Run

```sh
node prototypes/starter-chat-refinements/compact-navigation/server.mjs
```

Open <http://127.0.0.1:4175/>. Send a message, interrupt the stub Run, switch Sessions, open Workspace or Model configuration, and try Reload Runtime.

Icons use the official Lucide browser CDN and are hydrated with `lucide.createIcons()`.
