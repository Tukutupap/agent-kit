---
type: Product
title: Product requirements
description: What Agent kit is, who it's for, what changed later, and where each requirement lives.
---

# Agent kit product requirements

<!-- Product: written once by the agent kit, then owned by this project. -->

## What it is

Rules, a knowledge base, skills and GitHub checks that give any product the same AI coding agent setup, kept current with Copier.

## Who it's for

- **People starting or running a product with AI coding agents,** who want every agent, in any tool or cloud session, to follow the same rules, keep the same knowledge base and open issues and pull requests in the same format.
- **Agents working in those projects,** which need the rules in files they read on their own (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `knowledge/index.md`) and checks that tell them when they've drifted.

## Scope

- Starter files rendered with Copier, updatable with `copier update` without losing a project's own edits.
- The Knowledge structure, Pull request format and Board sync checks, as versioned GitHub actions.
- The knowledge-review and site-sweep skills and the knowledge reminder hook, as a Claude Code plugin or copied into the project.
- Left out: anything about a particular product, and any hosted service. The kit runs only in a project's repository and GitHub Actions.

The [README](https://github.com/Tukutupap/agent-kit#readme) describes each part, and this repository uses the kit itself ([ADR](/decisions/adr/adr-kit-uses-its-own-template.md)).

## Where requirements live

Each feature's requirements are in the `## Product requirements` section of its page in `knowledge/product/features`. They carry the same precedence as this page.

## Later decisions

Decisions that override a requirement on this page or a feature page. Newest first.

| Date | Decision | Overrides | Record |
| --- | --- | --- | --- |
