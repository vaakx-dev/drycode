# Quiet command bar

A throwaway refinement of `starter-chat-explorations/windows-native/?variant=A` (Navigation view).

## What changed from Windows-native A

- Kept the persistent Windows NavigationView, Workspace switcher, Workspace/Session hierarchy, Recent Sessions, and the familiar linear chat/composer.
- Reduced top-level chrome: a shorter title bar, a tighter navigation column, and a 48px session heading with one consolidated More menu for secondary Session actions.
- Kept Model configuration and Reload immediately available together in the quiet navigation footer rather than adding another command strip.
- Calmed the center conversation with a narrower reading measure, more breathing room, fewer message rules, and compact inline Tool activity cards.
- Preserved visible Run state and an Interrupt action in the composer; inactive Sessions still expose the send affordance.
- Replaced prototype glyphs with official Lucide icons loaded from the browser CDN and initialized with `lucide.createIcons()`.

## Run

```sh
node prototypes/starter-chat-refinements/quiet-command-bar/server.mjs
```

Then open <http://127.0.0.1:4175/>. Everything is static, dependency-light, and in-memory; Workspace, Session, Model, send, Tool, interrupt, and Reload interactions are useful stubs.
