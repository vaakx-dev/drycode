# Starter chat explorations · experimental

Five disposable, dependency-free hypotheses for the Windows starter chat. They share a small in-memory interaction stub so the structure—not a backend—can be compared.

## Run

From the repository root:

```sh
node prototypes/starter-chat-explorations/experimental/server.mjs
```

Open `http://127.0.0.1:4174/?variant=A` and switch with the bottom control, keyboard arrows, or the URL:

- `A` — **Run stage**: makes the active Run the primary object. A step rail explains where the agent is, while the conversation remains adjacent.
- `B` — **Session cards**: treats resuming a Session as the home-screen decision. Cards carry enough context to choose without opening each transcript; selecting one opens the chat surface.
- `C` — **Transcript timeline**: interleaves messages and Tool facts on one chronological spine, with Workspace, Session, Model, and lifecycle context in a compact sidecar.
- `D` — **Adaptive inspector**: keeps a stable conversation surface while a small Run / Model / Context inspector changes role to answer the question at hand.
- `E` — **Conversation stack**: uses a shallow stack of resumable Sessions and gives the active conversation the deepest, quietest surface; current Tool activity is a focused strip.

Workspace selection, Session switching/creation, Model configuration, message sending, Tool details, Run interruption, and full Reload are clickable in memory. Nothing is persisted. This is chat-only: no editors, file explorers, terminals, or source-control surfaces.
