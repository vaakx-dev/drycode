# Starter chat refinements

Five slight, more-minimal refinements of the selected Windows-native Navigation view for [docs: shape the starter chat experience](https://github.com/vaakx-dev/drycode/issues/14).

## Run

```sh
node prototypes/starter-chat-refinements/server.mjs
```

Open <http://127.0.0.1:4180/> and switch between:

- Quiet command bar
- Compact navigation
- Inline context
- Quiet Tool activity
- Balanced minimalism

Every refinement retains Workspace selection, durable Session creation and resume, Model configuration, messaging, Tool observation, Run interruption, and Reload. All icons come from Lucide. State is in memory and the code is intentionally disposable.
