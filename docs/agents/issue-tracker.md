# Issue tracker: GitHub

Issues and planning artifacts live in `vaakx-dev/drycode` on GitHub. Use the `gh` CLI for all operations and infer the repository from the Git remote.

## Conventions

- Create an issue with `gh issue create --title "..." --body "..."`.
- Read an issue with `gh issue view <number> --comments`.
- List issues with `gh issue list` and the appropriate state and label filters.
- Comment with `gh issue comment <number> --body "..."`.
- Apply or remove labels with `gh issue edit`.
- Close with `gh issue close <number>`.

## Pull requests as a triage surface

**PRs as a request surface: no.**

## Publishing and fetching

When a skill says to publish to the issue tracker, create a GitHub issue. When a skill says to fetch a ticket, read the GitHub issue and its comments.

## Wayfinding operations

- A map is an issue labelled `wayfinder:map`.
- Decision tickets are GitHub sub-issues labelled `wayfinder:research`, `wayfinder:prototype`, `wayfinder:grilling`, or `wayfinder:task`.
- Use GitHub native issue dependencies for blocking relationships. If unavailable, record `Blocked by: #<number>` in the ticket body.
- The frontier contains open map children with no open blockers and no assignee.
- Claim a ticket before working by assigning it to `@me`.
- Resolve a ticket by posting its answer as a comment, closing it, and appending a linked gist to the map's Decisions-so-far section.
