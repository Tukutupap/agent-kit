---
type: Decision
id: ADR-pages-named-by-topic
title: "Knowledge pages are named by topic"
description: "New assumptions, ADRs, gaps and feature pages are named by topic, and the name is the ID, instead of taking the number of their issue."
---

# Knowledge pages are named by topic

## Status

Accepted

## Date

2026-11-09

## Context

Pages took the number of the issue they came from, such as `asm-298-topic.md` with `id: ASM-298`. That stopped two pull requests running at once from picking the same number, which a "next free number" doesn't. But it tied every page to an issue, needed `-b` and `-c` letters when one issue made two pages of a kind, and gave ADRs four digits and everything else three.

## Decision

From 1.1.0, a new page is named by its topic, a few lowercase words joined by hyphens, and the name after the prefix is the ID: `asm-client-ip-behind-a-proxy.md` is `ASM-client-ip-behind-a-proxy`. The templates are `*-template.md`. The knowledge check still accepts pages named by issue number, so no project has to rename anything. The `numbered` key in `agent-kit.json` keeps its name for the same reason, and `digits` now only applies to those older pages.

## Consequences

- Two pull requests only clash if they pick the same name. Git or the check's duplicate-ID rule catches that, and it usually means both are about the same thing.
- IDs say what a page is about, and no issue is needed to name one.
- IDs are longer, and renaming a merged page changes its ID, so pages keep their first name.
- A project has two styles side by side until its older pages are replaced.

## Alternatives considered

- Keep issue numbers, with the same digit count for every kind: still tied to issues and still needs letters, and existing projects would have to rename files.
- Next free number: parallel branches see the same number.
- A date or random suffix: avoids clashes but gives IDs that say nothing.

## Security and compliance impact

None.

## Related files

- `scripts/knowledge-check.mjs`
- `template/knowledge/index.md.jinja`
