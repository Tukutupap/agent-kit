---
type: Decision
id: ADR-kit-uses-its-own-template
title: "The kit uses its own template"
description: "This repository is rendered from its own template with copier copy, updates with copier update, and runs its checks at @v1 like any project."
---

# The kit uses its own template

## Status

Accepted

## Date

2026-11-09

## Context

The kit's own `AGENTS.md`, `CLAUDE.md` and `knowledge/` were written by hand beside the template. They had the pull request template and check, which is why the kit's pull requests follow the format, but not `knowledge/decisions/issue-workflow.md`, the page that gives the issue format. GitHub applies `.github/ISSUE_TEMPLATE/issue.md` only in the browser, so issues opened by agents through the API (#10, #12, #14) didn't follow it. Nothing the template gained since reached the kit itself, and its checks ran from the local `./checks/...` folders, not the way projects call them.

## Decision

The repository is rendered from its own template with `copier copy gh:Tukutupap/agent-kit` at 1.1.0 (skills copied in, no board), and recorded in `.copier-answers.yml`. Its product sections describe the kit. After each release it runs `copier update` like any project. Its Knowledge structure and Pull request format workflows are the template's, calling `Tukutupap/agent-kit/checks/...@v1`. CI keeps the tests and a knowledge check from the branch, so a change to the check is tried on the kit's own pages before release.

## Consequences

- Issues, pull requests and `knowledge/` follow the same format as any project, and the kit sees the template the way projects do, including what `copier update` does to its own edits.
- A change to a check reaches the kit's own pull requests only after it's released. A change the released check would reject in the kit's own files goes in two pull requests: the check first, then the files. That's what projects go through, so it keeps checks backward compatible.
- The skills and hook exist three times: `plugin/`, `template/.agents/` (kept equal by `npm run sync:skills`) and the repository's own `.agents/`, which follows the last release.
- Some generic rules, such as the database parts of Gate 4, don't apply to the kit. The acceptance gates say so.

## Alternatives considered

- Keep the hand-written files and add the missing pages: cheaper now, but the kit would keep drifting from what it ships.
- Use the plugin instead of copied skills: avoids a third copy, but whether cloud sessions load a project's plugins is unverified ([GAP-001](/launch/gaps/gap-001-plugin-in-cloud-sessions.md)).
- Run the checks from `./checks/...` only: tests unreleased checks, but not the way projects use them.

## Security and compliance impact

None. The kit stays public and generic.

## Related files

- `.copier-answers.yml`
- `.github/workflows/knowledge.yml`, `.github/workflows/pr-format.yml`, `.github/workflows/ci.yml`
- `AGENTS.md`, `CLAUDE.md`
