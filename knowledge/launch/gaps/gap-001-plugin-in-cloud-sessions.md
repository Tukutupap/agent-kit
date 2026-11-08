---
type: Gap
id: GAP-001
title: "GAP-001: Plugin loading in cloud sessions is unverified"
description: "Nobody has checked whether claude.ai cloud sessions load a plugin that a project enables in .claude/settings.json."
gap_status: open
severity: "Medium"
date: 2026-11-08
area: "Plugin"
---

# GAP-001: Plugin loading in cloud sessions is unverified

## Gap

Projects can enable the agent-kit plugin through `extraKnownMarketplaces` and `enabledPlugins` in `.claude/settings.json`. It's not known whether a claude.ai cloud session installs and loads it at start. Until then, the template defaults to copying the skills and hook into the repository ([ADR 0001-c](/decisions/adr/adr-0001-c-plugin-and-copied-skills.md)).

## Recommended resolution

Render a scratch project with `skills_from=plugin`, push it, start a cloud session on it, and check that the `agent-kit:knowledge-review` skill is listed and the Stop hook runs. Do the same locally with `claude`. Record the result here, and change the default if it works everywhere.
