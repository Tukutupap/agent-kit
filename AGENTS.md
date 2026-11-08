# AGENTS.md

Instructions for agents working on the agent kit itself. Projects that use the kit get their own `AGENTS.md` from `template/AGENTS.md.jinja`.

## What this repository is

A kit that gives any product the same agent setup: rules agents follow, a `knowledge/` folder they keep current, skills, and GitHub checks that enforce the format. The [README](README.md) explains the three parts and how projects adopt them.

## Rules

- The kit is public and generic. Never add a product's name, people, environments, secrets or ids. A test fails on the first project's name.
- The kit follows its own rules. Read `knowledge/index.md` first, and update `knowledge/` in the same pull request as the change: an assumption in `knowledge/decisions/asm`, a major decision in `knowledge/decisions/adr`, anything missing or unverified in `knowledge/launch/gaps`.
- Every change needs an issue, linked from its pull request with `Fixes #N`, and the pull request follows `.github/pull_request_template.md`, which is the same template the kit ships.
- `plugin/` is the source of the skills and the hook. After changing it, run `npm run sync:skills` so the template's copies match.
- Think about projects that already use the kit. A change to `template/` reaches them through `copier update`, and a change to `checks/` or `scripts/` through a version bump. Anything that would break a project's workflow, `agent-kit.json` or Copier answers needs a new major version ([Releasing](knowledge/runbooks/releasing.md)).
- Keep scripts dependency-free Node, so the actions need no install.

## Checks

- `npm test` runs every test. With Copier installed (`pip install copier`), it also renders the template both ways and checks the result.
- `npm run knowledge:check` checks this repository's `knowledge/`.
- Before opening a pull request, set `PR_TITLE` and `PR_BODY` and run `npm run pr:check`.
