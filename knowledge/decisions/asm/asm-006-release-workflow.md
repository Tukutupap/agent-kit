---
type: Assumption
id: ASM-006
title: "ASM-006: Releases are tagged by a workflow"
description: "The Release workflow tags main and moves the major tag with the workflow's own token, so releasing doesn't need a person at a terminal."
date: 2026-11-08
area: "Releases"
---

# ASM-006: Releases are tagged by a workflow

## Assumption

Releases are tagged by `.github/workflows/release.yml`, run by hand or by a session, using the workflow's `GITHUB_TOKEN` with `contents: write`. It only tags `main`, only after the tests pass, and only a version that matches the version files and isn't tagged yet. Moving the major tag is a force push of that one tag.

## Rationale

Cloud sessions can't push tags (their git proxy only allows their own branch), and on 2026-11-08 a local agent's safety check refused to push them, so `v1.0.1` waited on a person. The owner asked for releases that don't need anyone running commands (2026-11-08). Issue #6.
