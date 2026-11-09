---
type: Decision
title: How we work on issues
description: The agreed way to take a GitHub issue from discussion to a merged change, including how bug fixes are grouped and batched.
tags: [workflow, github]
---

# How we work on issues

<!-- From the agent kit. Add the people who work on Agent kit, who owns it and who approves what, under "Who's who". -->

## Who's who

<!-- Product: who owns the project, who opens and fixes issues, and whose approval is needed for what. -->

- The repository's owner, `Tukutupap`, owns the kit and decides what goes in it, including new major versions.
- Agent sessions open issues and pull requests, and may merge a kit pull request once every required check passes.

- Agent sessions work in the same repository and follow this page like everyone else.
- Write issues, pull requests, proposals and knowledge pages in English, so everyone can read them.

## Proposals before changes

- Show a proposal before changing anything visible or behavioural: what's wrong today, what would change, and the decisions needed. For screens, include mockups. Start building once it's approved.
- A screen change isn't done until it's wired to the real API and tested end to end. Don't ship screens backed by fakes, or with known bugs.

## Starting

- "Let's discuss #N" is read only. Change nothing, offer options, and record the outcome on the issue once agreed. Treat `decision` issues as discussions first.
- "Work on #N" goes through to a merged pull request, stopping only for a real product decision. Asking for issues to be worked approves the whole way: once the fixes pass the local checks, push, open the pull request ready for review, and merge it when every required check passes on GitHub, without asking again at each step. Stop and ask only for a product decision, a check that fails for a reason you can't fix, or a change that needs extra review.
- When work starts, assign the issue, so the team can see who's working on what.

## Filing issues

- Reproduce a problem before filing it, and say how it was reproduced. Findings from reading code alone stay as candidates until tested, so the tracker holds nothing we can't replicate.
- Check a finding against `knowledge/launch/gaps` and the PRD first, because some gaps are known or deliberate.
- Set one issue type, which says what kind of work it is:
  - **Bug:** something doesn't work as it should.
  - **Feature:** something new, or an improvement to something that already exists. An improvement also gets the `enhancement` label.
  - **Task:** content, decisions, process and other work that doesn't change how the product behaves.
- Use labels only for extra information, such as `enhancement`, `decision`, `question` or a product area, plus one priority label, `P1`, `P2` or `P3`. A label never repeats the type, and `enhancement` only goes on a Feature.
- Make every file mentioned in an issue, pull request or comment a link to that file on `main` (`https://github.com/Tukutupap/agent-kit/blob/main/<path>`), using its full path as the link text.
- Use the issue format below.

Every open issue has a priority:

- **P1:** breaks a core flow, payments, trust or privacy, or blocks other work. Do it now.
- **P2:** something people clearly see or use that's wrong or missing. Do it soon.
- **P3:** polish, small cosmetic problems, and future improvements.

Use one priority label at a time; when it changes, remove the old one.

### Issue format

Every issue looks the same, whoever's agent opens it. GitHub fills in `.github/ISSUE_TEMPLATE/issue.md` only in the browser, so an agent using the API or `gh` has to follow this itself.

**Title:** what should be true afterward, in plain words, such as "Let a customer retry a payment after a declined card". No issue numbers, and no prefix such as `fix:`.

**Sections:** use these as `##` headings, in this order.

| Section | What goes in it | When |
| --- | --- | --- |
| User story | As a person, I want an outcome, so that a reason | Always |
| How to see it | Where it was reproduced, then numbered steps with what happened and what should have. For a feature or a process task, what happens today | Always |
| Acceptance criteria | Checkboxes with results someone can check, including a test where one fits | Always |
| Code notes | Where the problem is, with file links. Add "Decision needed:" if the fix depends on one | When known |
| Related | Other issues | When there are any |

Put anything else under a `###` heading in the section it belongs to.

## Fixing bugs in batches

Bug-fix pull requests opened in parallel keep needing updates from `main`, rerun CI again and again, and conflict in shared code.

- **Group bugs by code area** before starting, for example payments, accounts, or styling.
- **Bugs in the same area are fixed one after another**, by one person or one agent session, never in parallel.
- **Only truly separate areas run in parallel**, each with its own owner. If two groups turn out to touch the same files, merge them into one group.
- **One branch and one pull request per group**, named `<area>-bugs` (for example `payments-bugs`, with any prefix your agent requires). Each issue is its own commit whose message contains `Fixes #N`, so every issue closes when the pull request merges and stays easy to review.
- **Open the pull request once the fixes pass the local checks**, ready for review, with a `Fixes #N` line in the description for every issue it fixes. A draft is still useful when you want GitHub's checks on unfinished work, or someone's eyes on it before it's done.
- A single bug that touches nothing else can still have its own pull request.

## Building

- Every change needs an issue, including documentation and process work. If there isn't one, create it before opening the pull request, and add `Fixes #N` to the pull request description.
- Branch from the latest `main`.
- **Before opening it ready, or marking a draft ready**, run `npm test`, which runs locally what GitHub runs. [Testing](/environment/testing.md) says what it covers.
- After it's ready, avoid small follow-up pushes: each one reruns the full CI. Put remaining fixes in one push.
- Others merge during long test runs, so fetch `main` just before pushing. If it moved, merge it in and rerun everything.
- When a suite fails, run it on untouched `main` before calling the failure unrelated.

## Pull requests

- Use the pull request format below.
- Update `knowledge/` in the same pull request, as `AGENTS.md` section 2 says. A change isn't finished until the knowledge matches it.
- Say what changed, why, and what wasn't covered in the description. That replaces an implementation log, which every change would have to edit, so open pull requests would keep conflicting.

### Pull request format

Every pull request looks the same, whoever's agent opens it. GitHub fills in `.github/pull_request_template.md` only in the browser, so an agent using the API or `gh` has to copy that file and fill it in.

**Title:** what's now true, in plain words, starting with a verb, such as "Keep dependency caches on main". No issue numbers, because they go in the description and the squash merge adds the pull request number. No prefix such as `fix:`.

**Sections:** use all of these as `##` headings, in this order.

| Section | What goes in it |
| --- | --- |
| What this fixes | A `Fixes #N` line for every issue |
| What changed | The change, in plain words |
| Why | The reason for it |
| How it was checked | What was run, with the template's checkboxes, and what happened |
| What wasn't covered | What wasn't tested or done, or "Nothing" |
| Knowledge | Tick one box: what was updated, or why nothing needed updating |

Put anything else under a `###` heading in the section it belongs to, such as a decision for review under What changed.

The `Pull request format` check on GitHub fails when the title or sections don't match. It reruns when the title or description is edited. To check before opening one, set `PR_TITLE` and `PR_BODY` and run `npx --yes github:Tukutupap/agent-kit#v1 pr-check`.

Dependabot's pull requests are the one exception. Dependabot writes its own title and release notes and can't fill in the template, so the check skips pull requests opened by `dependabot[bot]` and they don't need an issue. Whoever merges one reads its release notes and checks that CI passed. Everyone else's pull requests, including agents', are checked in full.

## Merging

- Nothing reaches `main` without approval from the person driving it. Asking for issues to be worked is that approval, for a pull request that fixes those issues and passes every required check (see [Starting](#starting)). Anything else, such as work nobody asked for, needs explicit approval for that pull request, and auto-merge counts as merging.
- Protect `main` with required checks, and don't bypass or relax them to merge.
- Squash merge. For a batch, keep every `Fixes #N` line in the squash commit message so all its issues close.
- After merging, confirm the deployment and recheck the issue's steps where it's deployed.
