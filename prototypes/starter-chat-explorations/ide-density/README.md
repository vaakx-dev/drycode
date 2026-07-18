# IDE-density starter chat explorations

Five throwaway, dependency-free Windows chat layouts for `docs: shape the starter chat experience`. They intentionally contain no editor, file tree, terminal, or source-control surfaces.

## Run

```sh
node prototypes/starter-chat-explorations/ide-density/server.mjs
```

Open <http://127.0.0.1:4174/?variant=A>. Switch with the lower-right arrows, `←` / `→`, or change `variant` to `A`–`E`.

## Layout hypotheses

- **A · Command strip** — keep Workspace, Session, Model, New session, Reload, and run state in one compact command row; let the conversation own the center.
- **B · Split console** — persistent Session index and Run activity columns make operational state scannable without covering the chat.
- **C · Focus stack** — optimize for one active Session: a small context ribbon and an activity drawer preserve a wide, calm conversation column.
- **D · Workbench matrix** — treat the Session as a dossier: recent Sessions, conversation, and durable Session/Tool metadata are visible together.
- **E · Run timeline** — make the linear Run/event sequence the primary reading order, with the composer as the next event and controls alongside it.

Workspace selection, durable Session resume/creation, Model configuration, message sending, Tool activity, Run interruption, and Reload are visible and stubbed in in-memory interactions.
