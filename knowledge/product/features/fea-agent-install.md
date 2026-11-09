---
type: Product
id: FEA-agent-install
title: "Agents add the kit from its link"
description: "An agent given the kit's link and asked to add it sets the kit up in a repository end to end, with no prompts."
---

# Agents add the kit from its link

## Product requirements

- A person can give any AI coding agent the kit's repository link and ask it to add the kit, and the agent knows what to do without further explanation.
- It works where Copier can't ask questions, such as cloud sessions: every answer is inferred from the repository or has a safe default.
- It keeps what the repository already had. Existing agent rules, pull request and issue templates, Dependabot and Claude Code settings are merged into the kit's files, never just replaced or just kept.
- It ends with one issue and one pull request that pass the kit's checks, and a short message telling the person what only they can do.

## How it works

- The guide is [INSTALL.md](https://github.com/Tukutupap/agent-kit/blob/main/INSTALL.md) at the kit's root, outside `template/`, so projects don't get a copy. The README's first section and `llms.txt` point agents to it.
- The copy runs `copier copy --defaults --overwrite` with every answer passed as `--data`. Without `--overwrite`, a non-interactive copy stops at the first file the repository already has, after writing only some of the files. The repository must be committed first, so `git diff` shows what the kit replaced and the agent merges it back.
- The adoption pull request is checked by the Pull request format check it adds, so it needs an issue and the kit's format.
- Tests keep the guide in step: every question in `copier.yml` must appear in it, and its copy must work on a repository with existing files.
- Checked in November 2026 by a fresh agent given only the link, on a scratch Next.js repository with its own `CLAUDE.md`, pull request template, Dependabot and Claude Code settings. Its suggestions are in the guide.
