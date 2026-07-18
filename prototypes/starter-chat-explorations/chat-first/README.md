# Chat-first starter exploration

Five throwaway, static/in-memory Windows desktop views for `docs: shape the starter chat experience`. They are intentionally chat-first: no editor, file tree, terminal, or source-control surfaces.

## Run

From the repository root:

```sh
node prototypes/starter-chat-explorations/chat-first/server.mjs
```

Open <http://127.0.0.1:4173/?variant=A>. Switch with the arrows in the bottom pill, keyboard left/right, or change `variant` to `A`, `B`, `C`, `D`, or `E`.

## Views and hypotheses

- **A · Context rail** — Persistent Workspace, Session, and Model context on the left with a dedicated Run activity drawer on the right. Hypothesis: durable operating context should remain one glance away while the conversation stays central.
- **B · Session shelf** — A focused conversation stage with a quiet session shelf and a single command strip above it. Hypothesis: a stable session list plus a large reading area makes resume behavior feel obvious without turning the app into an IDE.
- **C · Run lane** — Conversation on the left and a vertical Run lane on the right, with Tool cards aligned to the active response. Hypothesis: separating operational activity from the transcript keeps Tool detail available without interrupting chat hierarchy.
- **D · Focus canvas** — One centered conversation canvas with compact Workspace / Session / Model context and a single activity status row. Hypothesis: the smallest surface should make sending the next message feel primary; deeper activity can be requested in place.
- **E · Start / resume** — An explicit start panel sits beside the active conversation, pairing recent durable Sessions with a clear Workspace and latest-Run card. Hypothesis: onboarding and returning users benefit from seeing “pick up the work” as the first navigation decision.

All views visibly represent Workspace selection, durable Session switching/creation, Model configuration, message sending, Tool activity, Run interruption, and full Reload. Interactions are local and ephemeral; no persistence or backend is included.
