---
type: Decision
title: Knowledge base approach
description: Why this folder is the one place for project knowledge, and what a trial of code-derived pages showed.
tags: [knowledge, agents]
---

# Knowledge base approach

<!-- From the agent kit. The trial below was run on another product, before this one started. -->

## Decision

Keep all project knowledge the code can't supply in this folder: product specs, decisions, workflow, setup and lessons. Agents read the index and open only the pages they need, so its size costs little. No person is expected to verify it. Don't bulk-generate pages from the code. Every change keeps it current in the same pull request, and a periodic knowledge review catches what that misses.

`AGENTS.md`, `CLAUDE.md`, `README.md` and the READMEs beside their code stay outside this folder.

## Why

In November 2026 the kit's first project tried bulk pages about one area of its code. An agent wrote 12 pages from the repository as it stood before a set of real fixes. Fresh sessions then redid four of those fixes, once with the pages and once without.

- Tokens: about 767k with pages and 797k without, roughly 4% less. Writing the pages cost 398k.
- Tests from the real fixes tied, on the two tasks they could score.
- Blind scoring of the code was stopped early, so this is weak evidence: one run per group per task.

The pages contained nothing a session couldn't find itself. [An ETH Zurich study](https://arxiv.org/html/2602.11988) found much the same for auto-generated repository context files: slightly lower success and over 20% more cost.

## What to avoid

- A hard CI check tied to whole source files. Replaying real commits, a 10-line fix flagged 9 of the 12 pages, because most pages depended on the same large service file.
- Long multi-agent trials, unless the owner agrees to the cost first.

## Worth keeping

Writing the pages did work as a code audit. It flagged real gaps, which were fixed separately. Treat findings like these as candidates until they're reproduced.
