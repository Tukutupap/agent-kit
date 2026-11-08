---
type: Runbook
title: Releasing the kit
description: Version numbers, tags, the plugin version, and how projects pick up a release.
---

# Releasing the kit

Projects pick up a release three ways, and each needs something from the release:

| Part | How projects get it | What the release needs |
| --- | --- | --- |
| Checks in `checks/` and `scripts/` | Dependabot bumps `uses: Tukutupap/agent-kit/checks/<name>@vN`, or the moved `vN` tag reaches them on the next run | A `vX.Y.Z` tag, and the `vX` tag moved to it |
| Starter files in `template/` | `copier update`, which reads the latest tag | A `vX.Y.Z` tag |
| Skills and hook in `plugin/` | The plugin version, or `copier update` for projects with copies | `version` bumped in `plugin/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` and `package.json`, which a test keeps equal |

## Steps

1. Merge the changes to `main`, with `npm run sync:skills` run if `plugin/` changed. CI must pass.
2. Choose the version. A change that makes a project's workflows, `agent-kit.json` or Copier answers stop working is a new major version. New options are minor, and fixes are patches.
3. Bump the three version fields (`package.json`, `plugin/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`) in a pull request, if they aren't already, and merge it.
4. Run the **Release** workflow (`.github/workflows/release.yml`) with the version, such as `1.0.1`. It checks the version against the three files and the existing tags, runs the tests, tags `main` with `v1.0.1`, and moves `v1` to it. Start it from the Actions tab, or from a session with the GitHub MCP `actions_run_trigger` tool (method `run_workflow`, workflow `release.yml`, ref `main`, input `version`). Then read the run's summary.
5. For a new major version, change `kit_version` in `copier.yml` so new projects call it, and say in the release notes what projects must change.
6. Open a pull request in `Tukutupap/agent-kit-test` to see the checks run from the new tag ([lesson](/lessons/actions-download-the-whole-kit.md)).

The release tag is annotated and the major tag lightweight. With two lightweight tags on one commit, Copier recorded `_commit: v1` in a project, and once `v1` moved, `copier update` saw nothing to update (#8). A project that recorded `_commit: v1` needs that line changed by hand to the release it was made from (such as `v1.0.0`) before its next `copier update`.

Cloud sessions can't push tags, and a local agent's safety check may refuse to, which is why the workflow does it ([ASM-006](/decisions/asm/asm-006-release-workflow.md)).
