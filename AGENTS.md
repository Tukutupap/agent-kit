# AGENTS.md

<!-- The generic sections come from the agent kit (https://github.com/Tukutupap/agent-kit) and update with `copier update`. Sections marked "Product" belong to this project: fill them in and keep them current. -->

## 1. Purpose

This file gives coding agents their operating instructions for Agent kit. Read it before changing code.

## 2. Project knowledge

`knowledge/` is the only home for project knowledge: product requirements, decisions, assumptions, known gaps, setup, runbooks and lessons. Start every task by reading `knowledge/index.md`, then open only the pages the task needs.

Keeping it current is part of every change, not a separate task. Do it in the same pull request as the work:

| When | Do this |
| --- | --- |
| You make an assumption | Add a file in `knowledge/decisions/asm` |
| You make a major architecture decision | Add an ADR in `knowledge/decisions/adr` |
| You add a mock, stub, deferred item or launch risk | Add a file in `knowledge/launch/gaps` |
| You finish work that a gap describes | Set the gap's `gap_status` to `resolved` and its `status` to `deprecated`, and say why |
| You add a feature, or change how one behaves | Add or update its page in `knowledge/product/features` |
| A decision overrides a requirement | Add it to the Later decisions table in `knowledge/product/prd.md` |
| Setup, deployment, workflow or operations change | Update the page that covers them |
| You learn something the repository can't show | Add it to `knowledge/lessons`, or to the page it belongs on |
| Something becomes wrong or obsolete | Fix it or delete it. If a newer decision replaces an assumption or ADR, keep the old file and mark it as superseded |

If a page disagrees with the code, trust the code and fix the page in the same pull request. If nothing needed updating, say so in the pull request.

Don't keep project knowledge in private agent memory, or in Markdown files outside `knowledge/`. Private memory is only for what's personal or specific to one machine.

Page formats and rules are at the top of `knowledge/index.md`. Each folder of assumptions, decisions, gaps and features has a template.

To review `knowledge/` itself, use the knowledge-review skill. For a sweep of the product, to find bugs, weak points and security holes, use the site-sweep skill, which reads this project's sweeps from `knowledge/references/site-sweeps.md`. Both are in `.agents/skills`, and `.claude/skills` links to the same folders for Claude Code. Agents that support skills find them there on their own; others read the `SKILL.md` and follow it.

## 3. Conflict resolution

When requirements conflict, use this precedence:

1. Security, privacy, payment safety, trust and safety, and legal and compliance safety.
2. Accepted ADRs and dated assumptions in `knowledge/decisions`, where they're newer than the PRD.
3. `knowledge/product/prd.md`, and the `Product requirements` sections of pages in `knowledge/product/features`.
4. `knowledge/product/acceptance-gates.md`.
5. Machine-readable contracts kept with the code, listed in section 5.
6. Other pages in `knowledge/`.
7. Implementation convenience.

Never choose implementation convenience over security, privacy, trust or payment correctness, or over the product rules in section 5.

## 4. Execution behavior

- Follow `knowledge/decisions/issue-workflow.md`. In short: every change needs an issue, linked from its pull request with `Fixes #N`; group bugs by code area; bugs in the same area are fixed one after another by one person or session, never in parallel; one branch and one pull request per area, with one `Fixes #N` commit per issue; run the full suite locally before opening it ready. Asking you to work on issues approves pushing, opening the pull request and merging it once every required check passes; stop only for a product decision, a failure you can't fix, or a change that needs extra review.
- Enforce the gates in `knowledge/product/acceptance-gates.md`.
- Do not ask clarifying questions unless a blocking secret, credential, or provider account decision is required.
- Make reasonable secure assumptions, and record them as section 2 says.
- Say what changed, why, and what wasn't covered in the pull request description. Don't keep a running log in the repository.
- Prefer working foundations over fake UI-only flows.
- Add tests for critical paths.
- Keep provider integrations behind adapters, and use local mock providers for development.
- Keep secrets and sensitive data out of the repository and out of logs.
- Keep code type-safe.

## 5. Product rules

<!-- Product: this section belongs to Agent kit. Replace the placeholders, and keep it short. The kit never changes it. -->

### Core flow

1. A project runs `copier copy gh:Tukutupap/agent-kit .` and gets the starter files, with its own sections marked `Product`.
2. Its pull requests run the Knowledge structure and Pull request format checks from `Tukutupap/agent-kit/checks/...@v1`.
3. Its agents follow `AGENTS.md`, keep `knowledge/` current, and use the knowledge-review and site-sweep skills and the knowledge reminder hook.
4. After a release, `copier update` brings in the kit's changes and keeps the project's own edits, and the moved `v1` tag or a Dependabot bump brings in the checks.

This repository is both the kit and a project that uses it: it's rendered from its own `template/`, so every step above must keep working here too.

### Security rules

Do not implement:

- Client-only authorization.
- Secrets in `.env.example`, tests, seed data, or docs.
- Unverified webhooks.

And for the kit:

- The kit is public and generic. Never add a product's name, people, environments, secrets or ids, here or in `template/`, `plugin/`, `checks/` or `scripts/`.
- Workflow inputs such as titles, bodies and versions reach scripts through the environment, never as command text.

### Contracts

1. `copier.yml` questions and the `.copier-answers.yml` they write.
2. The inputs of the actions in `checks/`, and `agent-kit.json` with its defaults in `scripts/config.mjs`.
3. `.github/pull_request_template.md` and `.github/ISSUE_TEMPLATE/issue.md`, which `scripts/pr-format-check.mjs` reads.
4. The plugin manifests in `plugin/.claude-plugin/` and `.claude-plugin/`.

Changing any of these in a way that breaks a project's workflow, `agent-kit.json` or Copier answers needs a new major version ([Releasing](knowledge/runbooks/releasing.md)).

### Working on the kit

- `plugin/` is the source of the skills and the hook. After changing it, run `npm run sync:skills` so the template's copies match. The copies in this repository's own `.agents/` update with `copier update`, like a project's.
- A change to `template/` reaches projects, and this repository, through `copier update` after a release, and a change to `checks/` or `scripts/` through the moved `v1` tag. Think about projects that already use the kit.
- This repository's own checks run at `@v1`, so a change to a check reaches the kit's own pull requests only after it's released. A change that the released check would reject in the kit's own files goes in two steps: release the check first, then change the files.
- Keep scripts dependency-free Node, so the actions need no install.
- `npm test` runs every test. With Copier installed (`pip install copier`), it also renders the template both ways and checks the result.

## 6. Quality bar

A release is good enough when a project made with `copier copy` from it, and this repository, pass every check, and `copier update` from the previous release keeps a project's own edits.

Do not ship a toy prototype, a generic template, or a shallow visual-only build.
