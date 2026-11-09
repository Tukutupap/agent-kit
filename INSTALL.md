# Add the agent kit to a repository

This guide is written for an AI coding agent. If someone gave you a link to this repository and asked you to add it, incorporate it or set it up in their repository, follow these steps in order, in their repository. You don't need to ask them anything first: every answer can be found in the repository or has a safe default. People can follow it too.

The result is one pull request that adds the kit's starter files, keeps everything the repository already had, and passes the kit's checks. Afterwards you tell the person the few things only they can do.

## 1. Check the repository

Run these from the repository's root.

1. It must be a git repository with a GitHub remote. `git remote get-url origin` gives the owner and name, such as `https://github.com/acme/shop.git` or `git@github.com:acme/shop.git`.
2. Commit or stash any uncommitted work first, so `git diff` shows exactly what the kit changed. `git status --short` must print nothing.
3. Create a branch from the default branch, such as `add-agent-kit`, or the branch your session requires.
4. If `.copier-answers.yml` exists and has `_src_path: gh:Tukutupap/agent-kit`, the kit is already there. Don't run this guide. To bring in a newer release, run `copier update --defaults` on a branch instead, resolve any conflicts, and open a pull request.

## 2. Get Copier

The kit is a [Copier](https://copier.readthedocs.io) template, and needs Copier 9.4 or later and Node 20 or later. Use the first of these that works:

| You have | Run Copier as |
| --- | --- |
| `copier --version` prints 9.4 or later | `copier` |
| `uvx` | `uvx --from 'copier>=9.4,<10' copier` |
| `pipx` | `pipx run --spec 'copier>=9.4,<10' copier` |
| `pip` | `pip install 'copier>=9.4,<10'`, then `copier` |

Copier fetches the kit with git over HTTPS from github.com, so the network must allow it.

## 3. Work out the answers

Copier asks a handful of questions. Agents usually can't answer prompts, so pass every answer with `--data`. Work each one out from the repository:

| Answer | Where to find it | If you can't tell |
| --- | --- | --- |
| `product_name` | What the README's first heading, `package.json` `name`, `pyproject.toml` or the person calls the product, written as people write it (`Shop`, not `shop-web`) | The repository name, with spaces for hyphens and a capital first letter |
| `product_summary` | One sentence on what the product is and who it's for, from the README or the person's request | Leave it out. The files then keep a comment asking for it |
| `github_owner` | The owner in the `origin` URL | Required: ask the person only if there's no GitHub remote |
| `github_repo` | The repository name in the `origin` URL, without `.git` | Required, as above |
| `test_command` | The command that runs the whole test suite locally: `npm test`, `pnpm test`, `yarn test` or `bun test` from the lockfile and `package.json` `scripts.test`, otherwise `pytest`, `go test ./...`, `cargo test`, `make test` or what the README and CI workflows run | `npm test` |
| `board_number` | The number at the end of the GitHub Projects board URL, only if the person mentioned a board | `0`, meaning no board. Board sync can be added later with `copier update` |
| `board_owner` | Only with a board: the user or organization in the board's URL (`github.com/orgs/<owner>/projects/N` or `github.com/users/<owner>/projects/N`) | `github_owner` |

Leave `skills_from` at its default, `repo`, which copies the kit's skills and hook into the repository so they work in every agent and in cloud sessions. Use `plugin` only if the person asks for the Claude Code plugin.

## 4. Run Copier

Replace the answers, and `copier` with the command from step 2:

```sh
copier copy --defaults --overwrite \
  --data product_name="Shop" \
  --data product_summary="An online shop for independent bakeries." \
  --data github_owner="acme" \
  --data github_repo="shop" \
  --data test_command="pnpm test" \
  --data board_number=0 \
  gh:Tukutupap/agent-kit .
```

- `--defaults` stops Copier from asking anything, and `--overwrite` lets it write files the repository already has. Without `--overwrite`, a non-interactive run stops at the first existing file after writing only some of the files.
- Don't pass `--vcs-ref`. Copier uses the latest release.
- The kit runs no scripts during the copy, so `--trust` isn't needed.

Copier prints `conflict` and then `overwrite` for each file the repository already had. That's expected.

Then run `git status --short`. New files are the kit's. Modified files (` M`) are ones the repository already had and the kit replaced. Step 5 puts their content back.

## 5. Keep what the repository already had

For every modified file, read the old version with `git diff <file>` or `git show HEAD:<file>`, then merge it into the kit's version. Never just restore the old file with `git checkout`, because the checks and other agents expect the kit's structure. The kit's files mark the sections that belong to the project with `Product` comments: that's where the project's own content goes.

| File the repository had | Where its content goes |
| --- | --- |
| `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.cursorrules`, `.github/copilot-instructions.md` or other agent rules | The stack and decisions agents shouldn't reopen go in `CLAUDE.md` under "Technology direction". Rules that must never break go under "Non-negotiables" in `CLAUDE.md` and in `AGENTS.md` section 5. Rules about what must never be built, such as charging before an order is confirmed, also go under "Security rules" in `AGENTS.md` section 5, and the product's main flow under "Core flow". Setup and commands go in `knowledge/environment/testing.md` or a new page in `knowledge/runbooks/`. Keep `@AGENTS.md` in `CLAUDE.md`, and keep the kit's generic sections as they are. Only `CLAUDE.md`, `AGENTS.md` and `GEMINI.md` are replaced; other agents' files stay, and can be shortened to point at `AGENTS.md` |
| `.github/pull_request_template.md` | Keep the kit's `##` sections in their order: the Pull request format check reads them. Add the project's extra checklist items under the section they belong to, and its other sections as new `##` sections at the end. Drop an old section only when a kit section already asks for the same thing, such as "Summary" and "What changed" |
| `.github/ISSUE_TEMPLATE/issue.md` | The same: keep the kit's sections and add the project's |
| `.github/dependabot.yml` | Keep both: the project's ecosystems and the kit's `github-actions` entry, under one `updates:` list |
| `.claude/settings.json` | Merge the JSON: keep the project's permissions, hooks and plugins, and add the kit's `Stop` hook and anything else the kit's version adds |
| A workflow with the same name in `.github/workflows/` | Rename the project's one and keep both |
| Anything in `knowledge/` | Keep the project's pages, and fit them to the rules at the top of `knowledge/index.md`: add the header fields and list each page in the index |

If the repository has project knowledge in other Markdown files, such as `docs/architecture.md` or decision records, you may leave them for now and say so in the pull request. Moving them into `knowledge/` is a good follow-up issue, because `AGENTS.md` makes `knowledge/` the only home for it.

## 6. Fill in the Product sections

Search for them with `grep -rn "Product:" AGENTS.md CLAUDE.md knowledge/`. Fill in what the repository shows, and leave the comment in place where it doesn't, so the person sees what's missing. Don't invent product facts.

- `CLAUDE.md`: Technology direction, from the dependencies, frameworks, hosting config and CI. Non-negotiables, from existing rules only.
- `AGENTS.md` section 5: Core flow, Security rules beyond the kit's, and Contracts such as an OpenAPI file, database schema or event formats that exist in the repository.
- `knowledge/product/prd.md`: what the product is, who it's for and its scope, from the README.
- `knowledge/environment/testing.md`: each test suite, how to run it, what it needs, and which CI checks run.
- `knowledge/decisions/issue-workflow.md`, "Who's who": the repository's owner from step 3. Leave the rest for the person.
- `knowledge/product/acceptance-gates.md` and `knowledge/references/site-sweeps.md`: fill in only what the repository makes clear.

Write in plain English, and don't add product names, people or secrets that aren't already in the repository.

## 7. Check it

```sh
npx --yes github:Tukutupap/agent-kit#v1 knowledge-check
```

It must print `knowledge/ is well-formed`. The kit's tools run with `npx` even in a repository that uses pnpm, yarn or bun: they need nothing installed in the project. Also run the project's own test command if anything you merged could affect it, and check that `.claude/skills/*` are symbolic links that resolve (`ls -L .claude/skills/*/SKILL.md`) when `skills_from` is `repo`.

## 8. Open the issue and pull request

The pull request runs the kit's two checks as soon as it's opened, so it must follow the kit's own format, described in `knowledge/decisions/issue-workflow.md`:

1. **Issue first.** Create an issue titled something like "Set up the agent kit", with the sections `## User story`, `## How to see it` and `## Acceptance criteria`.
2. **Commit** everything on the branch, including `.copier-answers.yml`, and push.
3. **Pull request:** a title starting with a verb and without an issue number or `fix:` prefix, such as "Add the agent kit". Fill in the sections of `.github/pull_request_template.md` as the repository now has it, with `Fixes #N` for the issue under "What this fixes". Say in "What changed" which existing files you merged and which `Product` sections still need the person. Under "How it was checked", tick only what you ran: the knowledge check counts as a quick check, and say so if you didn't run the project's tests because no code changed.
4. **Check the format** before opening it, if you can run Node: `PR_TITLE="Add the agent kit" PR_BODY="$(cat body.md)" npx --yes github:Tukutupap/agent-kit#v1 pr-check`.
5. Wait for the **Knowledge structure** and **Pull request format** checks to pass. Don't merge it yourself unless the person asked you to.

## 9. Tell the person what only they can do

End by telling the person, in a short message with the pull request link:

1. Review and merge the pull request, and fill in any `Product` sections you left marked.
2. Protect the default branch and make **Knowledge structure** and **Pull request format** required checks (Settings, Rules or Branches). Check names appear there only after the checks have run once.
3. With a board: add a `PROJECT_TOKEN` repository secret, a fine-grained token whose resource owner is the board's owner, with Projects read and write and read access to Issues, Pull requests and Metadata. Until then the board jobs skip with a warning.
4. From now on, agents read `AGENTS.md` and `knowledge/index.md` first. `copier update` brings in later kit releases and keeps the project's edits, and Dependabot proposes new major versions of the checks.
