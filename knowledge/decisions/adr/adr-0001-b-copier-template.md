---
type: Decision
id: ADR-0001-b
title: "ADR 0001-b: Starter files ship as a Copier template"
description: "AGENTS.md, CLAUDE.md, the knowledge skeleton and the GitHub files are a Copier template, so projects can pull later kit changes with copier update."
adr_status: Accepted
---

# ADR 0001-b: Starter files ship as a Copier template

## Status

Accepted

## Date

2026-11-08

## Context

A GitHub template repository copies once and never updates. Projects need later wording and templates from the kit without losing their own edits.

## Decision

`copier.yml` and `template/` make the kit a [Copier](https://copier.readthedocs.io) template. It asks for the product name, GitHub owner and repository, board number and owner, test command, and where skills come from. `copier update` replays the kit's changes since the project's last update as a three-way merge, so the project's edits stay.

Product sections are marked with `Product` comments and hold placeholders. Pages that are pure product content (`prd.md`, `site-sweeps.md`, `testing.md` and `agent-kit.json`) are in `_skip_if_exists`, so the kit writes them once and never again.

## Consequences

- Starting a project: `copier copy gh:Tukutupap/agent-kit .`. Updating: `copier update`, which can run in CI and open a pull request per project.
- Kit edits to a section a project rewrote can conflict. Copier leaves conflict markers for a person to resolve.
- The template needs Python and Copier on the machine that runs it, not in the project.

## Alternatives considered

- GitHub template repository: no updates.
- A script that writes files: would need its own merge logic.

## Security and compliance impact

No tasks or migrations run, so `--trust` isn't needed. The template holds no secrets.
