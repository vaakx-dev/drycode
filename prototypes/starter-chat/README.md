# Starter chat experience prototype

Three structural variants of Drycode's smallest coherent Windows chat experience, switchable with `?variant=`, on a standalone throwaway surface because no application UI exists yet.

## Run

```sh
node prototypes/starter-chat/server.mjs
```

Open <http://127.0.0.1:4173/?variant=A>.

Use the floating arrows or the keyboard left and right arrows to compare:

- `A`: persistent Session rail with inline Tool activity
- `B`: three-pane operational view with a dedicated Run activity timeline
- `C`: single conversation surface with modal Session switching and compact inline activity

Workspace selection, Session switching and creation, model configuration, sending, interruption, and Reload are interactive in memory.
