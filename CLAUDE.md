# CLAUDE.md

Rules, a knowledge base, skills and GitHub checks that give any product the same AI coding agent setup, kept current with Copier.

## Start here

@AGENTS.md

## Technology direction

<!-- Product: the stack, where it runs, and the decisions an agent should not reopen, each with its ADR. -->

- Starter files are a Copier template in `template/` ([ADR 0001-b](knowledge/decisions/adr/adr-0001-b-copier-template.md)), and this repository is rendered from it ([ADR](knowledge/decisions/adr/adr-kit-uses-its-own-template.md)).
- Checks are composite GitHub actions in `checks/`, called at `@v1` ([ADR 0001](knowledge/decisions/adr/adr-0001-checks-as-composite-actions.md)).
- Skills and the hook are a Claude Code plugin in `plugin/`, with copies in `template/` ([ADR 0001-c](knowledge/decisions/adr/adr-0001-c-plugin-and-copied-skills.md)).
- Scripts are dependency-free Node 20 or later. Releases run through the Release workflow ([Releasing](knowledge/runbooks/releasing.md)).

## Non-negotiables

<!-- Product: the rules that must never break, one per line. Keep them in step with AGENTS.md section 5. -->

- All mocks and gaps must be documented.
- The kit is public and generic: no product names, people, environments, secrets or ids.
- Nothing may break a project that uses `@v1` or `copier update` without a new major version.

## Agent behavior

Do not stop for non-blocking ambiguity. Make secure assumptions, implement them, and record each one as a new file in `knowledge/decisions/asm`. If an external provider requires credentials, build the adapter, mock implementation, configuration contract, and documented setup path.
