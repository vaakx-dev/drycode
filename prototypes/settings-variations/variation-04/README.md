# Drycode Settings · variation 04

A standalone settings-page exploration for Drycode. This direction treats settings as a map of the locally composed system rather than a model picker: Runtime Generation lifecycle, the resolved Extension Graph, provider-owned connection references, diagnostics, Drycode Home, and extension-owned configuration are all first-class.

## Run

Open `index.html` directly, or serve this folder with any static server. The only external dependency is the pinned Lucide icon browser bundle.

## Review interactions

- Use the settings rail to move through Runtime Generation, Extensions, Providers, Diagnostics, and Drycode Home.
- Select an extension or provider to open its detail/configuration drawer.
- Try extension filtering, Run checks, Export report, data cleanup confirmations, and Reload generation.
- Collapse the existing Drycode navigation chrome to review the narrow shell state.

All behavior is an in-memory browser prototype; no provider secrets or files are changed.
