---
type: Decision
id: ADR-0001-c
title: "ADR 0001-c: Skills and the hook ship as a plugin, and can be copied in"
description: "The knowledge-review and site-sweep skills and the knowledge reminder hook are a Claude Code plugin with the kit as its marketplace; projects choose the plugin or copies in .agents/, and copies are the default."
adr_status: Accepted
---

# ADR 0001-c: Skills and the hook ship as a plugin, and can be copied in

## Status

Accepted

## Date

2026-11-08

## Context

Skills and hooks should update without copying files into every project. A Claude Code plugin does that, but whether claude.ai cloud sessions load plugins a project enables in `.claude/settings.json` hasn't been checked ([GAP-001](/launch/gaps/gap-001-plugin-in-cloud-sessions.md)). Agents other than Claude Code can't use the plugin at all.

## Decision

- `plugin/` is the plugin, and `.claude-plugin/marketplace.json` makes the kit its own marketplace. The plugin is the source of the skills and the hook.
- The Copier question `skills_from` chooses how a project gets them. `repo`, the default, copies them into `.agents/skills` and `.agents/hooks`, links `.claude/skills` to them, and registers the hook in `.claude/settings.json`. `plugin` enables the plugin there instead.
- `npm run sync:skills` copies the plugin into the template, and a test fails when the two differ.
- Anything project-specific a skill needs lives in the project's `knowledge/`: the sweeps in `knowledge/references/site-sweeps.md`, and the review history in `knowledge/references/knowledge-reviews.md`. A skill never keeps its own history file, because a plugin's folder isn't the project's.

## Consequences

- Copies update through `copier update`, and the plugin through its version.
- The default works in every agent and in cloud sessions, at the cost of updates arriving by `copier update` rather than automatically.
- Once GAP-001 is checked, the default can change.

## Alternatives considered

- Plugin only: may not load in cloud sessions, and other agents can't use it.
- Copies only: no automatic updates for projects that can use the plugin.

## Security and compliance impact

The hook only reads git state and writes a small file under the system temp folder. It never fails the session and can be turned off with `AGENT_KIT_KNOWLEDGE_REMINDER=off`.
