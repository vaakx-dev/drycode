# Drycode Settings · variation 05

A standalone settings exploration that treats settings as an operating picture: the current Runtime Generation, complete Extension Graph, provider-owned model access, local Drycode Home data, and diagnostics are visible together without implying partial graph loading or IDE behavior.

## Run

Open `index.html` directly or serve this folder with a static server. The page uses the pinned Lucide browser bundle for icons.

## Interactions

- Move through the settings index and filter contributions with the settings search.
- Open extension/provider drawers to inspect ownership and save local configuration.
- Review the lifecycle, discover a local extension, run diagnostics, export a report, and clear cache/temporary data with confirmations.
- Reload the Runtime Generation to see the stop-then-start lifecycle.
- Collapse the Drycode shell sidebar; shell actions show lightweight handoff feedback.

This is an in-memory browser prototype; it does not write provider secrets or files.
