# Quiet activity

A throwaway refinement of Windows-native Variant A (Navigation view). It keeps the Windows NavigationView, Workspace and durable Session rail, and central chat, while replacing the always-open Tool cards with a compact contextual activity strip. `View details` is a restrained disclosure for the event rows; the amber Run state and red `Interrupt Run` controls stay immediately available while work is active.

Workspace selection, new/resumed Sessions, Model configuration, message send, Tool activity, Run interruption, and Runtime Reload are all in-memory interaction stubs. The palette is intentionally neutral dark with blue, amber, and muted red accents. Icons use the Lucide browser CDN and are initialized with `lucide.createIcons()`.

## Run

```sh
node prototypes/starter-chat-refinements/quiet-activity/server.mjs
```

Open <http://127.0.0.1:4175/>.
