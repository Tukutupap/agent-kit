---
type: Assumption
id: ASM-001
title: "ASM-001: Choices made while building the first version"
description: "The first version of the kit assumes an MIT license, a v1 major tag, a test command instead of a package manager question, and generic gates renumbered 1 to 4."
date: 2026-11-08
area: "Kit"
---

# ASM-001: Choices made while building the first version

## Assumption

- **License:** MIT, so any project, public or private, can use the kit.
- **Versions:** releases are tagged `vX.Y.Z`, and the major tag `vX` moves to the latest release in that major version. Projects call `@v1`. A change that breaks a project's workflows or config needs a new major version.
- **Copier asks for the test command,** not the package manager, because the command is what the pages need, and not every project uses Node.
- **Gates:** the generic gates from the first project (repository and local development, test coverage, documentation and traceability, code design) are Gates 1 to 4. Product gates start at Gate 5. The test coverage gate lists only paths every product has, and the code design gate names no files.
- **Board sync works for user and organization boards,** found through `repositoryOwner`, and the board number has no default.
- **The knowledge check's folder map** defaults to the template's layout, so `agent-kit.json` only lists what a project changes.
- **The issue workflow** keeps the first project's rules but drops its people, environments and board ids. "Who's who" is a placeholder.

## Rationale

These were open in the brief, or followed from making the pieces generic. Each can change in a later version.
