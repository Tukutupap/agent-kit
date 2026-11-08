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

- The actions running in a project's workflows from the `v1` tag.
- Board sync against a real board, for a user-owned and an organization-owned board.
- `copier update` after a new kit release, and a Dependabot pull request bumping the checks.
- An agent following the rendered rules on a small task.

## Recommended resolution

Once `v1` is tagged, create a blank repository, run `copier copy`, push it, and open a pull request to see the checks run. Then change the kit, release `v1.0.1`, and run `copier update` in the project.
