---
type: Decision
id: ADR-0001
title: "ADR 0001: Checks ship as versioned composite actions"
description: "The knowledge check, pull request format check and board sync are composite actions in checks/, which projects call at a version tag from their own small workflows."
adr_status: Accepted
---

# ADR 0001: Checks ship as versioned composite actions

## Status

Accepted

## Date

2026-11-08

## Context

The checks are Node scripts. The plan was to wrap them as reusable workflows (`on: workflow_call`). But a reusable workflow runs in the calling repository's checkout, and it has no reliable way to know which version of itself was called, so it can't check out its own scripts at the same version. The usual workaround is an input naming the kit version, which Dependabot doesn't update when it bumps the `uses:` line, so the two drift apart.

## Decision

Each check is a composite action in `checks/<name>/action.yml`. GitHub downloads the whole kit at the version in the `uses:` line, and `$GITHUB_ACTION_PATH` points into that copy, so the action runs `scripts/` from the same version. Projects keep small workflows, written by the Copier template, that say when each check runs and call `Tukutupap/agent-kit/checks/<name>@v1`.

## Consequences

- One reference names the version, and Dependabot's `github-actions` updates bump it.
- Triggers live in each project's workflow, so a change to when a check runs reaches projects through `copier update`, and a change to what it checks reaches them through a version bump.
- The setup-node version inside the actions is updated by hand, because Dependabot only reads `.github/workflows`.
- The same scripts run locally with `npx --yes github:Tukutupap/agent-kit#v1 <command>`.

## Alternatives considered

- Reusable workflows with a `kit-ref` input: the two references drift apart on every Dependabot bump.
- Copying the scripts into each project: every improvement needs a copy in every project.

## Security and compliance impact

The kit is public, so actions resolve without a token. Pull request titles, descriptions and issue numbers reach the scripts only through environment variables, never as command text. The board token stays a secret of each project.
