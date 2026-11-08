---
type: Lesson
title: Actions download the whole kit
description: GitHub downloads the entire kit to run any of its actions, so a broken symlink anywhere in the repository breaks every check in every project.
---

# Actions download the whole kit

When a project's workflow calls `Tukutupap/agent-kit/checks/knowledge@v1`, GitHub downloads and unpacks the whole repository at that tag, not just `checks/knowledge`. In `v1.0.0`, two symlinks in `template/.claude/skills/` pointed at `../../.agents/skills/...`, a folder that only exists once Copier renders the template. The download failed on them, so both checks failed in every project before running a step (#4).

- Every symlink in the kit must point at something inside the kit. A test in `tests/template.test.mjs` checks this.
- Copier renders symlink targets as templates, so a link in `template/` can point at a Jinja-named folder in the template and come out right in the project.
- The kit's own CI calls its actions with `./checks/...`, from the checkout, so it can't catch a problem with the download. Only a project calling the tag shows it, which is why [GAP-001-b](/launch/gaps/gap-001-b-end-to-end-test.md) matters for every release.
