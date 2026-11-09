---
type: Reference
title: Site sweeps
description: The sweeps Agent kit runs, what each one checks, and where reports live.
---

# Site sweeps

The site-sweep skill reads this page. It holds the method; this page holds what's specific to Agent kit: which sweeps exist, what each one checks, where to run them, and how to sign in. Keep secrets out of it.

Reports are written to `knowledge/sweeps/`, named by the UTC time they finished and the sweep, such as `2026-11-06-1530-api.md`.

## Sweeps

<!-- Product: one `###` section per sweep, such as API, App, Platform and Product. For each, say what to test, in what order, and the questions to ask. -->

### Template

Render the template with `copier copy` both ways (skills copied, and plugin), with and without a board, then run `copier update` from the previous release.

| Check | Question |
| --- | --- |
| Checks | Does a rendered project pass Knowledge structure and Pull request format? |
| Updates | Does `copier update` keep a project's own edits and `_skip_if_exists` files? |
| Links | Do the `.claude/skills` links and every page link resolve? |
| Generic | Does anything name a product, person, environment or id? |

### Checks

Run each action in `checks/` from a test project at `@v1`, with good and bad input.

| Check | Question |
| --- | --- |
| Input | Can a pull request title or body, or a version, reach a shell as command text? |
| Config | Does every `agent-kit.json` key behave as `scripts/config.mjs` says, and is a bad one reported clearly? |
| Failure | Does a check fail with a message that says what to fix? |

### Platform

Workflows and their permissions, Dependabot, the Release workflow and tags, and the plugin marketplace.

## Knowledge each sweep reviews

- Template: the README, the [releasing runbook](/runbooks/releasing.md) and the gaps.
- Checks: the ADRs and assumptions.
- Platform: the [releasing runbook](/runbooks/releasing.md) and [lessons](/lessons/actions-download-the-whole-kit.md).

## Where to run, and signing in

Locally or in a cloud session for Template; `Tukutupap/agent-kit-test` for Checks and Platform. No sign-in is needed beyond GitHub access.
