---
type: Reference
title: Source map
description: Where each part of the kit came from in its first project, so improvements can flow both ways.
---

# Source map

The kit was built from the first project's repository at commit `97a85fd` (2026-11-08). Paths on the left are in that repository.

| First project | Kit | Changed |
| --- | --- | --- |
| `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` | `template/AGENTS.md.jinja`, `CLAUDE.md.jinja`, `GEMINI.md` | Product sections became placeholders. The conflict order lost the product's contract files. |
| `knowledge/index.md` | `template/knowledge/index.md.jinja` | Rules and numbering kept; product pages removed. |
| The four `*-000-template.md` files | `template/knowledge/...` | The ADR template's impact list is generic. The feature template gained its two headings. |
| `knowledge/decisions/knowledge-base-approach.md` | `template/knowledge/decisions/knowledge-base-approach.md` | Product details removed; the trial's numbers kept. |
| `knowledge/decisions/issue-workflow.md` | `template/knowledge/decisions/issue-workflow.md.jinja` | People, hosting, board ids and the product's CI checks removed. Board sections only render with a board. |
| `knowledge/product/acceptance-gates.md` | `template/knowledge/product/acceptance-gates.md` | Gates 1, 11, 12 and 13 became Gates 1 to 4, without file paths. Definition of done generalized. |
| `knowledge/lessons/local-browser-tests.md` | `template/knowledge/lessons/cloud-sessions.md` | Only the cloud-session lessons that apply to any project. |
| `scripts/knowledge-check.mjs` + test | `scripts/knowledge-check.mjs`, `scripts/config.mjs` + test | Folder map from `agent-kit.json`, with the old map as the default. |
| `scripts/pr-format-check.mjs` + test | `scripts/pr-format-check.mjs` + test | Template path and exempt bots from config. The issue and knowledge rules apply only when those sections exist. |
| `scripts/board-sync.mjs` + test | `scripts/board-sync.mjs` + test | Board number and owner are inputs; user boards work. |
| `.github/workflows/knowledge.yml`, `pr-format.yml`, `board-sync.yml` | `checks/*/action.yml`, and stubs in `template/.github/workflows/` | See [ADR 0001](/decisions/adr/adr-0001-checks-as-composite-actions.md). |
| `.github/pull_request_template.md`, `ISSUE_TEMPLATE/issue.md`, `dependabot.yml` | `template/.github/` | The pull request template names no test command. |
| `.agents/skills/knowledge-review/` | `plugin/skills/knowledge-review/` | Product name, launch page and history removed. History lives in the project's `knowledge/references/knowledge-reviews.md`. The script finds the project from where it runs. |
| `.agents/skills/site-sweep/` | `plugin/skills/site-sweep/` | The method only. Each project's sweeps live in its `knowledge/references/site-sweeps.md`. The crawler and sign-in scripts stayed behind, because they're product-specific. |
| None | `plugin/hooks/knowledge-reminder.mjs` | New: the Stop hook. |
