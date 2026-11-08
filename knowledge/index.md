---
okf_version: "0.2"
---

# Agent kit knowledge

What the code can't tell you about the kit itself: why it's built this way, what it assumes, what's missing, and how to release it. The kit follows the rules it ships, so this folder works like a project's `knowledge/`: it uses the [Open Knowledge Format](https://github.com/GoogleCloudPlatform/open-knowledge-format) v0.2, and every change updates it in the same pull request. Open only the pages a task needs.

## Rules

1. Add what can't be found in the code, tests or git history.
2. Add it when it's learned, not in bulk. One topic per page, and keep pages short.
3. The code wins. If a page disagrees with the code, trust the code and fix the page.
4. Never add passwords, keys or tokens. The kit is public.
5. Each new assumption, decision or gap gets its own file, numbered by its issue, as in a project. The templates are `adr-0000`, `asm-000`, `gap-000` and `fea-000`.
6. Add each new page to this index, under its section.
7. Nothing about a particular product belongs in the kit, here or anywhere else.

Run `npm run knowledge:check` before pushing. CI runs the same check with the kit's own action.

## Decisions

### Architecture decisions

- [ADR 0001: Checks ship as versioned composite actions](/decisions/adr/adr-0001-checks-as-composite-actions.md)
- [ADR 0001-b: Starter files ship as a Copier template](/decisions/adr/adr-0001-b-copier-template.md)
- [ADR 0001-c: Skills and the hook ship as a plugin, and can be copied in](/decisions/adr/adr-0001-c-plugin-and-copied-skills.md)

New ADRs use the [template](/decisions/adr/adr-0000-template.md).

### Assumptions

Each assumption is a file in `decisions/asm/`, named `asm-NNN-topic.md`. Search that folder by topic or ID. New ones use the [template](/decisions/asm/asm-000-template.md).

## Product

The kit's parts are described in the [README](https://github.com/Tukutupap/agent-kit#readme). Feature pages, if any, use the [template](/product/features/fea-000-template.md).

## Runbooks

- [Releasing the kit](/runbooks/releasing.md): Version numbers, tags, the plugin version, and how projects pick up a release.

## Launch

### Gaps

Each missing, unverified or deferred item is a file in `launch/gaps/`, with `gap_status` `open` or `resolved`. Search that folder by topic, ID or status. New ones use the [template](/launch/gaps/gap-000-template.md).

## Lessons

- [Actions download the whole kit](/lessons/actions-download-the-whole-kit.md): Why a broken symlink anywhere in the kit breaks every check, and why release tags are annotated.

## References

- [Source map](/references/source-map.md): Where each part of the kit came from, so improvements can flow both ways.
