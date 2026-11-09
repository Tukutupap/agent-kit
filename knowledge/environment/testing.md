---
type: Guide
title: Testing
description: Which suite covers what, how to run it locally, and how CI behaves on GitHub.
---

# Testing

<!-- Product: written once by the agent kit, then owned by this project. Describe each suite, what it needs, and which checks are required on main. -->

## Locally

`npm test` runs the full suite: the scripts' unit tests, the plugin manifests, the symlink and skill-copy checks, and, with Copier installed (`pip install 'copier>=9.4,<10'`), the template rendered both ways and checked with the kit's own checks. Set `REQUIRE_COPIER=true` to fail instead of skipping when Copier is missing. Run it before opening a pull request ready for review.

- `npm run knowledge:check` checks `knowledge/` with this branch's check.
- `PR_TITLE=... PR_BODY="$(cat body.md)" npm run pr:check` checks a pull request's title and description.

## On GitHub

- **Knowledge structure** checks `knowledge/` on pull requests that change it, and after every merge to `main`.
- **Pull request format** checks the title and description of every pull request.

Both run from `Tukutupap/agent-kit/checks/...@v1`, the released version, the way projects call them.

- **Tests and template** (`ci.yml`) runs `npm test` with Copier required.
- **Knowledge check from this branch** (`ci.yml`) runs this branch's knowledge check on `knowledge/`, so a change to the check is tried on the kit's own pages before it's released.
