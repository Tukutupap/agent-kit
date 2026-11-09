---
type: Decision
title: Knowledge base approach
description: Why this folder is the one place for project knowledge, and why it holds only what the code can't show.
tags: [knowledge, agents]
---

# Knowledge base approach

<!-- From the agent kit. -->

## Decision

Keep all project knowledge the code can't supply in this folder: product specs, decisions, workflow, setup and lessons. Agents read the index and open only the pages they need, so its size costs little. No person is expected to verify it. Every change keeps it current in the same pull request, and a periodic knowledge review catches what that misses.

`AGENTS.md`, `CLAUDE.md`, `README.md` and the READMEs beside their code stay outside this folder.

## Why

Don't write pages that summarize the code. Agents can read the code themselves, and summaries cost more to write than they save and go stale as soon as the code changes. Only write down what the code can't show: decisions and their reasons, product rules, assumptions and gaps.

## What to avoid

- Generating pages in bulk, from the code or anything else. Add a page when something is learned.
- A CI check that ties pages to whole source files. A small fix to a large shared file would flag most of the pages.
