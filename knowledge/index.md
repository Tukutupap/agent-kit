---
okf_version: "0.2"
---

# Agent kit project knowledge

This repository is the agent kit, set up from its own template like any project that uses it. The only home for what the code can't tell you: product specs, decisions, how the team works, setup and lessons. Every agent and person reads this first, and keeps it current as part of every change. It uses the [Open Knowledge Format](https://github.com/GoogleCloudPlatform/open-knowledge-format) v0.2. Open only the pages a task needs.

## Rules

1. Add what can't be found in the code, tests or git history. Summaries of code don't belong here.
2. Add it when it's learned, not in bulk. One topic per page, and keep pages short. [Knowledge base approach](/decisions/knowledge-base-approach.md) says why.
3. The code wins. If a page disagrees with the code, trust the code and fix the page.
4. Never add passwords, keys, tokens or customer data.
5. Don't keep shared running files, because every pull request then collides. Each new assumption, decision or gap gets its own file, and what changed goes in the pull request.
6. Add each new page to this index, under its section.
7. Don't keep project knowledge in private agent memory, or in Markdown outside this folder.

## Keeping it current

Update this folder in the same pull request as the work. `AGENTS.md` section 2 says what to do for each kind of change.

- **New:** copy the template in the folder, name it by its topic, and fill in the header, including a one-sentence `description`. The topic is a few lowercase words joined by hyphens, and the name after the prefix is the ID: an assumption about client IPs behind a proxy is `asm-client-ip-behind-a-proxy.md` with `id: ASM-client-ip-behind-a-proxy`. This works the same for assumptions, gaps, ADRs and feature pages. Keep the name once it's merged, because other pages refer to it. Pull requests running in parallel only clash if they pick the same name, and the check catches that. Older pages named by issue number, such as `asm-298-topic.md` with `id: ASM-298`, keep their names. The templates are `adr-template.md`, `asm-template.md`, `gap-template.md` and `fea-template.md`.
- **Changed:** edit the page. For a feature, keep its `## Product requirements` section accurate, and put a change that overrides it in the [Later decisions](/product/prd.md) table.
- **Finished:** set a gap's `gap_status` to `resolved` and its `status` to `deprecated`, and add a short `## Status` section saying why.
- **Replaced:** add `superseded_by:` with the new assumption's ID to the old assumption's header, or set an ADR's `adr_status` to `Superseded`, and add `status: deprecated` to either. Keep the old file, because it records why things were done.
- **Status:** `status` is the Open Knowledge Format's lifecycle field, so it only takes `draft`, `stable` or `deprecated`, and leaving it out means `stable`. Gaps keep their own state in `gap_status`, and ADRs in `adr_status`.
- **Obsolete:** delete pages that are simply no longer true. Git keeps them.

Before pushing, run `npx --yes github:Tukutupap/agent-kit#v1 knowledge-check` from the project root. CI runs the same check on pull requests that change this folder and after every merge to `main`, covering headers, IDs, links and this index. The folder layout it expects is in `agent-kit.json`. It can't tell whether a page is true, so each sweep reviews the pages in its area, and the knowledge-review skill checks the whole folder for stale, conflicting or low-value content.

## Product

- [Product requirements](/product/prd.md): What the product is, who it's for, what changed later, and where each requirement lives.
- [Acceptance gates](/product/acceptance-gates.md): The checks that decide when work is done.

The kit's parts are described in the [README](https://github.com/Tukutupap/agent-kit#readme).

### Features

One page per feature, in `product/features/`, named `fea-<topic>.md`. These are the functional specs. Each has its product requirements at the top, which carry PRD precedence, and functional detail below. New features use the [template](/product/features/fea-template.md).

<!-- List feature pages here as they're added, grouped by who uses them. -->

- [Agents add the kit from its link](/product/features/fea-agent-install.md): The install guide an agent follows to add the kit to a repository.

## Decisions

- [How we work on issues](/decisions/issue-workflow.md): Proposals first, the issue and pull request formats, and how issues are discussed, built, reviewed and merged.
- [Knowledge base approach](/decisions/knowledge-base-approach.md): Why this folder is the one place for project knowledge.

### Architecture decisions

- [ADR 0001: Checks ship as versioned composite actions](/decisions/adr/adr-0001-checks-as-composite-actions.md)
- [ADR 0001-b: Starter files ship as a Copier template](/decisions/adr/adr-0001-b-copier-template.md)
- [ADR 0001-c: Skills and the hook ship as a plugin, and can be copied in](/decisions/adr/adr-0001-c-plugin-and-copied-skills.md)
- [Knowledge pages are named by topic](/decisions/adr/adr-pages-named-by-topic.md)
- [The kit uses its own template](/decisions/adr/adr-kit-uses-its-own-template.md)

New ADRs use the [template](/decisions/adr/adr-template.md).

### Assumptions

Each assumption is a file in `decisions/asm/`, named `asm-<topic>.md`. Find them by searching that folder for a topic or an ID. They aren't listed here, because a shared list would collide on every new one. New assumptions use the [template](/decisions/asm/asm-template.md).

## Environment

- [Testing](/environment/testing.md): Which suite covers what, how to run it, and how CI behaves on GitHub.

## Runbooks

- [Releasing the kit](/runbooks/releasing.md): Version numbers, tags, the plugin version, and how projects pick up a release.

## Launch

### Gaps

Each mock, deferred item or launch risk is a file in `launch/gaps/`, with a status of `open` or `resolved` in its header. Search that folder by topic, ID or status. New gaps use the [template](/launch/gaps/gap-template.md).

## Lessons

- [Agents in cloud sessions](/lessons/cloud-sessions.md): What a Claude cloud session can and can't reach, and how to work around it.
- [Actions download the whole kit](/lessons/actions-download-the-whole-kit.md): Why a broken symlink anywhere in the kit breaks every check, and why release tags are annotated.

## References

- [Site sweeps](/references/site-sweeps.md): The sweeps this product runs, what each one checks, and where reports live.

## Sweeps

Reports are in `sweeps/`, named by the UTC time they finished and the sweep.
