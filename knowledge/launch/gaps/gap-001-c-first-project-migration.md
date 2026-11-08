---
type: Gap
id: GAP-001-c
title: "GAP-001-c: The first project doesn't use the kit yet"
description: "The project the kit came from still has its own copies of the rules, checks and skills."
gap_status: open
severity: "Low"
date: 2026-11-08
area: "Adoption"
---

# GAP-001-c: The first project doesn't use the kit yet

## Gap

The kit was built from the first project's files, which still live there as copies. Improvements made in either place don't reach the other on their own.

## Recommended resolution

Move the first project onto the kit as an issue and pull request in that project, keeping its product content: run `copier copy` over it, keep its own sections, swap its check workflows for the kit's actions, and delete its copies of the scripts. Its CI has to run, so do it when its Actions minutes allow. [Source map](/references/source-map.md) lists what maps to what.
