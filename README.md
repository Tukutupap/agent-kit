# Agent kit

Everything a product needs so AI coding agents work on it the same way every time: rules they follow, a knowledge base they keep current, skills for reviews and sweeps, and GitHub checks that keep the format honest. Start a project with it, and pick up later improvements without losing the project's own edits.

It came out of a real product, where the setup was built and tested. Only the generic parts are here.

## What's in it

| Part | What it gives a project | How updates arrive |
| --- | --- | --- |
| **Starter files** (`template/`, applied with [Copier](https://copier.readthedocs.io)) | `AGENTS.md`, `CLAUDE.md` and `GEMINI.md` with a marked product section; a `knowledge/` folder with its rules, templates for ADRs, assumptions, gaps and features, the issue workflow, acceptance gates and lessons; issue and pull request templates; Dependabot; and workflows that call the checks | `copier update`, which keeps the project's own edits |
| **Checks** (`checks/`) | GitHub actions for the knowledge check, the pull request format check and board sync | A version tag, which Dependabot proposes |
| **Plugin** (`plugin/`) | A Claude Code plugin with the knowledge-review and site-sweep skills and a Stop hook that reminds the agent when code changed but `knowledge/` didn't | The plugin version, or `copier update` for projects that keep copies |

A project's own `knowledge/` content is never touched by any of these.

## Start a project

You need Python with Copier (`pipx install copier` or `pip install copier`) and Node 20 or later.

```sh
cd my-product
copier copy gh:Tukutupap/agent-kit .
```

It asks for:

- The product's name, and one sentence about it.
- The GitHub owner and repository.
- The GitHub Projects board number, or 0 for no board. With a board, it adds the Board sync workflow.
- The command that runs the full test suite.
- Where Claude Code gets the skills and hook: copied into the repository (the default, which works in every agent and in cloud sessions), or the plugin.

Then:

1. Fill in the sections marked `Product` in `AGENTS.md`, `CLAUDE.md`, `knowledge/product/prd.md`, `knowledge/product/acceptance-gates.md`, `knowledge/decisions/issue-workflow.md` ("Who's who"), `knowledge/environment/testing.md` and `knowledge/references/site-sweeps.md`.
2. Commit, push and open a pull request. The **Knowledge structure** and **Pull request format** checks run on it.
3. With a board, add a `PROJECT_TOKEN` repository secret: a fine-grained token whose resource owner is the board's owner, with Projects read and write, and read access to Issues, Pull requests and Metadata. Without it the board jobs skip with a warning.
4. Protect `main`, and make the two checks required.

## Keep it current

- **Starter files:** run `copier update` in the project. Resolve any conflicts where the kit changed text the project also edited.
- **Checks:** Dependabot opens a pull request when a new major version is out. Within a major version, `@v1` always runs the latest `v1` release.
- **Plugin:** Claude Code updates it with the marketplace. Projects with copied skills get them through `copier update`.

## Run the checks locally

```sh
npx --yes github:Tukutupap/agent-kit#v1 knowledge-check
PR_TITLE="Add search" PR_BODY="$(cat body.md)" npx --yes github:Tukutupap/agent-kit#v1 pr-check
```

## Configure the checks

`agent-kit.json` at the project root changes what the knowledge check expects. Anything left out keeps the default, which matches the template. For example, to give RFCs their own IDs, named like `rfc-<topic>.md`, and stop checking feature page names:

```json
{
  "knowledge": {
    "numbered": {
      "decisions/rfc": { "prefix": "RFC" },
      "product/features": null
    },
    "notInIndex": ["decisions/asm/", "launch/gaps/", "sweeps/"]
  },
  "pullRequests": {
    "exemptAuthors": ["dependabot[bot]", "renovate[bot]"]
  }
}
```

The defaults are in [`scripts/config.mjs`](scripts/config.mjs).

## Use the plugin directly

In a project's `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "agent-kit": { "source": { "source": "github", "repo": "Tukutupap/agent-kit" } }
  },
  "enabledPlugins": { "agent-kit@agent-kit": true }
}
```

Or by hand: `/plugin marketplace add Tukutupap/agent-kit`, then `/plugin install agent-kit@agent-kit`. Whether claude.ai cloud sessions load a project's plugins hasn't been checked yet ([GAP-001](knowledge/launch/gaps/gap-001-plugin-in-cloud-sessions.md)).

## Working on the kit

See [AGENTS.md](AGENTS.md) and [knowledge/](knowledge/index.md). `npm test` runs the tests, and renders the template when Copier is installed. [Releasing](knowledge/runbooks/releasing.md) covers tags and versions.

## License

[MIT](LICENSE)
