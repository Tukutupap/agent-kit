---
type: Gap
id: GAP-001-b
title: "GAP-001-b: Not yet tested end to end on GitHub"
description: "The checks have run locally and in tests, but not as actions in a real project, and copier update and a Dependabot bump haven't been tried against a released tag."
gap_status: open
severity: "High"
date: 2026-11-08
area: "Kit"
---

# GAP-001-b: Not yet tested end to end on GitHub

## Gap

The first version was tested locally: the scripts' tests, rendering the template both ways, the rendered project passing the knowledge check, and the hook in a scratch git repository. These haven't been tried yet:

- The actions running in a project's workflows from the `v1` tag. Tried on 2026-11-08 in `Tukutupap/agent-kit-test`: `v1.0.0` failed to download, fixed in #4 ([lesson](/lessons/actions-download-the-whole-kit.md)).
- Board sync against a real board, for a user-owned and an organization-owned board.
- `copier update` after a new kit release, and a Dependabot pull request bumping the checks.
- An agent following the rendered rules on a small task.

## Recommended resolution

`Tukutupap/agent-kit-test` is the test project. After each release, open a pull request there to see the checks run from the tag, and run `copier update` in it.
