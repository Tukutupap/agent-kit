---
name: site-sweep
description: Run one of the project's sweeps (such as API, app, platform or product) to find bugs, weak points and security holes, and write a dated report of issues ready to file. Use when asked for a sweep, review or audit of the site or app, or to create issues from a sweep report.
---

# Site sweep

A sweep tries to break one part of the product before a customer or attacker does. A working happy path proves little, so focus on what happens when things go wrong.

The result is a short report of issues, each detailed enough for any person or agent to file and fix without having seen the sweep.

This skill holds the method. What's specific to the project lives in `knowledge/references/site-sweeps.md`: which sweeps exist, what each checks, which knowledge pages each reviews, where to run them and how to sign in. Read that page first. If it doesn't exist or has no sweeps, stop and offer to write it with the owner, starting from the four usual sweeps: API, app, platform and product.

Run one sweep at a time. If none is named, ask which, and suggest the one that ran longest ago. A full sweep means all of them, one at a time.

## Rules

- **Be honest.** It's fine to say an area is good. Don't pad the list.
- **Keep the report short.** Only the result, what wasn't covered, the issues, out-of-date knowledge and the candidates.
- **Create no issues** unless someone asks, as described below.
- **Reproduce before listing.** Test each finding as you find it, and say how in the issue. Anything untested stays a candidate, with the reason.
- **Stay in your sweep.** List a problem from another sweep's area as a candidate and move on.
- **Attack only what's ours.** Run load, attack tools and anything destructive on a local copy, because shared environments are shared. Never test production or a provider's systems.
- **Never merge, and make no real payments.** Test data is allowed where the project's page says so; say what you created and clean up what you can.
- **Reports are stored in the repo,** so never put passwords, keys, tokens or customer data in one.
- **Logins** come from where the project's page says, usually a git-ignored file. Never repeat their values or commit them.
- **Delete throwaway tests** and leave the checkout clean.

## Steps

1. **Check for a recent sweep.** About one a week per sweep is enough. Run `git fetch origin`, then find this sweep's newest report in `knowledge/sweeps` on `origin/main`, and in `git ls-remote --heads origin 'refs/heads/sweep/*'`, which can show a report that isn't merged yet. If it finished under 7 days ago, say when and where its report is, and wait for a yes before starting.
2. **Read what's known.** Read the project's sweeps page, `knowledge/launch/gaps`, this sweep's latest report, and open and closed GitHub issues. Leave out or mark anything already tracked.
3. **Recheck last time.** Confirm that issues closed since this sweep last ran are fixed, and retest its candidates.
4. **Keep notes outside the repo,** because long sessions can lose context.
5. **Run the sweep** as the project's page describes it, including everything new in its area: `git log --oneline <its last commit>..main`.
6. **Review the knowledge in its area.** Compare the pages the project's page lists for this sweep with the code and what you saw, and treat anything out of date as a finding. Fix what's clearly wrong in the report's pull request, including finished gaps. List what needs a person's decision in the report.
7. **Check your findings.** Remove what's weak, and check each number against your notes.
8. **Write the report.** Get the time with `date -u +%Y-%m-%d-%H%M`, and write `knowledge/sweeps/<time>-<sweep>.md`, such as `knowledge/sweeps/2026-11-06-1530-api.md`, from [report-template.md](report-template.md). Number issues S1, S2 and so on, highest priority first. Fill in every field, and check that file links exist on `main`.
9. **Hand it over.** Commit the report, with any knowledge fixes, on a new branch from the latest `main`, named `sweep/<time>-<sweep>` (with any prefix your agent requires), and open a pull request. It's only Markdown, so it doesn't need the full local test run, but run the knowledge check named in `knowledge/index.md`. Tell the user the report's path, how many issues it lists, and that creating them needs someone to ask.

## Creating issues from a report

Only when someone asks, such as "Create S1, S3 and S4 from `knowledge/sweeps/2026-11-06-1530-api.md`". That approves only the items named. If the report isn't merged yet, read it from its branch. For each item:

1. **Check it isn't filed:**

   ```bash
   gh issue list --state all --search '"2026-11-06-1530-api" "item S3" in:body'
   ```

2. **Check it still applies** on the latest `main`. If it's gone, skip it and say so.
3. **Create the issue** from the item's title and sections, raising the headings to `##`. They follow the issue format in `knowledge/decisions/issue-workflow.md`. End the body with `---` and this line, linking the report's name to its full path on `main`:

   `Found in site sweep 2026-11-06-1530-api.md, item S3`

4. **Set it up.** Set the type, labels and priority, and the board fields if the project keeps a board. Then read them back.

Don't edit the report afterward: the search in step 1 shows what was filed.

## Known limits

- Sign-in providers often lock an account after repeated wrong passwords, so never loop sign-ins.
- A full-page screenshot can hang on a long page, so give it a timeout.
