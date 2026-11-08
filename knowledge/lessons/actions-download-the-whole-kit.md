---
type: Lesson
title: Actions download the whole kit
description: GitHub downloads the entire kit to run any of its actions, so a broken symlink anywhere in it breaks every check, and the moving major tag needs care so Copier still records exact releases.
---

# Actions download the whole kit

When a project's workflow calls `Tukutupap/agent-kit/checks/knowledge@v1`, GitHub downloads and unpacks the whole repository at that tag, not just `checks/knowledge`. In `v1.0.0`, two symlinks in `template/.claude/skills/` pointed at `../../.agents/skills/...`, a folder that only exists once Copier renders the template. The download failed on them, so both checks failed in every project before running a step (#4).

- Every symlink in the kit must point at something inside the kit. A test in `tests/template.test.mjs` checks this.
- Copier renders symlink targets as templates, so a link in `template/` can point at a Jinja-named folder in the template and come out right in the project.
- The kit's own CI calls its actions with `./checks/...`, from the checkout, so it can't catch a problem with the download. Only a project calling the tag shows it, which is why [GAP-001-b](/launch/gaps/gap-001-b-end-to-end-test.md) matters for every release.

## Moving tags and Copier

The moving `v1` tag that actions need confuses Copier unless the exact release tag is annotated: Copier records whichever tag `git describe` names, and with two lightweight tags on one commit that can be `v1`. Once `v1` moves, the project has no record of which release it came from (#8). The Release workflow makes the release tag annotated, and a test in `tests/template.test.mjs` checks that copy and update use exact versions.
