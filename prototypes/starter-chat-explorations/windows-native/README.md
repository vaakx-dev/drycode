# Windows-native starter chat explorations

Five dependency-free, throwaway views for `docs: shape the starter chat experience`. Each is an in-memory prototype: workspace, durable Sessions, Model configuration, message sending, Tool observation, Run interruption, and full Runtime Reload are stubbed as useful interactions.

## Run

```sh
node prototypes/starter-chat-explorations/windows-native/server.mjs
```

Open <http://127.0.0.1:4174/?variant=A>. Use the bottom picker, `?variant=A` through `?variant=E`, or the left/right arrow keys.

## Hypotheses

- **A · Navigation view** — A persistent Windows NavigationView makes the current Workspace and resumable Sessions easy to orient around without competing with the conversation.
- **B · Run cockpit** — A three-pane split keeps the conversation, Session list, and live Tool timeline simultaneously visible for operational confidence.
- **C · Workspace hub** — A workspace-first master/detail layout makes resuming a durable Session feel like choosing a document, while keeping setup actions nearby.
- **D · Focus surface** — A centered single conversation with a compact command strip and status bar reduces chrome while preserving every lifecycle control.
- **E · Session tabs** — Top-level Session tabs make switching between a few durable conversations fast; a dedicated activity side pane keeps Tool output observable.
