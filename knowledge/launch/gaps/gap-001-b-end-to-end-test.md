---
type: Gap
id: GAP-001-b
title: "GAP-001-b: Not yet tested end to end on GitHub"
description: "The checks run from the v1 tag and copier update work in a real project. Board sync, a Dependabot bump and an agent following the rules are still untested."
gap_status: open
severity: "Medium"
date: 2026-11-08
area: "Kit"
---

# GAP-001-b: Not yet tested end to end on GitHub

## Gap

The first version was tested locally: the scripts' tests, rendering the template both ways, the rendered project passing the knowledge check, and the hook in a scratch git repository. On 2026-11-08, `Tukutupap/agent-kit-test` verified the actions running from the `v1` tag, `copier update` from `v1.0.0` to `v1.0.2`, and releasing from the Release workflow. What broke along the way is in the [lesson](/lessons/actions-download-the-whole-kit.md).

Still untested:

- Board sync against a real board, for a user-owned and an organization-owned board.
- A Dependabot pull request bumping the checks.
- An agent following the rendered rules on a small task.

## Recommended resolution

`Tukutupap/agent-kit-test` is the test project. After each release, open a pull request there to see the checks run from the tag, and run `copier update` in it.
