---
name: knowledge-review
description: Review the project's knowledge/ folder so it stays true and short. Finds finished gaps, conflicting or replaced assumptions and ADRs, stale claims, and content that adds little, and fixes what needs it in one pull request. Finding nothing to change is a valid result. Use when asked to review, audit, clean up or trim the knowledge base, or to check it after a lot of change.
---

# Knowledge review

Each pull request keeps `knowledge/` current for its own change. This review catches what that misses: work that finished elsewhere, decisions that quietly replaced older ones, and notes that were only useful for a day.

The job is to find out whether anything needs changing. "No changes needed" is a good result, not a failed review, and every change needs evidence behind it.

The project's knowledge folder is `knowledge/` unless `agent-kit.json` names another one in `knowledge.root`. Past reviews are recorded in `knowledge/references/knowledge-reviews.md`. If that page doesn't exist, this is the first review: read everything in step 3, and create the page in step 11 from the shape in [Recording a review](#recording-a-review).

## When to run it

Run it when someone asks, after a large batch of merges, and before a release. The history page shows the last review. If it was recent and little has merged, say so rather than run another.

Work through it yourself in one session. Don't start agents to split the work unless the owner agrees to the cost first.

## What earns a change

Change something only if at least one of these is true, and you can point to the evidence:

- It's wrong, or the code or a newer decision contradicts it.
- It points to something that no longer exists.
- It would mislead someone searching, or it plainly repeats another page or the code.

Don't reword, restyle or reformat a page that's true, or shorten it just because it could be shorter. Don't aim for a word count or a number of changes. If it's a judgment call, leave it. A second opinion isn't new evidence, so never reverse an earlier review's call unless something has changed.

## Steps

1. **Read first.** Read the history page and `knowledge/index.md`. Note the last reviewed commit, what was kept on purpose, and which area is next. Change nothing yet, and don't file an issue or start a branch.
2. **Get the candidates.** Run the script in this skill's `scripts/` folder from the project root, passing that commit:

   ```bash
   node <this skill's folder>/scripts/review.mjs <last reviewed commit>
   ```

   Every line is something to check, not a verdict. It catches IDs and paths that no longer exist, gaps whose issues are all closed (when the `gh` command is available), wording that goes stale, and code changes that left `knowledge/` alone. It also lists every code file changed since the last review. Read those diffs, even for a commit that updated a page, because that page may not cover everything it changed. The script never comes back empty, so a long list doesn't mean there's work to do.

3. **Set the scope.** A review covers only what merged since the last reviewed commit, what the script newly flags, and the next unreviewed area from the history page. Don't go back over anything else. The first review reads everything, so nothing needs a full read again unless the owner asks for one.
4. **Skip what was kept.** An item in a history entry's **Kept on purpose** list is reopened only if the code or a decision it depends on has changed since that review.
5. **Review the gaps in scope,** and sort each one using the table below.
6. **Refresh the launch checklist, if the project has one.** If `knowledge/index.md` lists a launch or release readiness checklist, compare it with every gap that has `gap_status: open`, not only those in scope, because a gap can start blocking launch without changing. Every open gap should be either an item on the checklist or in a list of gaps that don't block launch. Moving a gap onto or off the launch list is a person's call when it's about payments, safety, legal or the launch scope, so list those for the owner rather than deciding.
7. **Review the assumptions and ADRs in scope.** Look for what a later page replaced or contradicts. Search by topic, because the older page rarely names the newer one.
8. **Review the other pages in scope.** Compare them with the code. Confirm that recent decisions overriding a requirement are in the Later decisions table in `knowledge/product/prd.md`.
9. **Trim,** using the rules below.
10. **Decide whether anything changes.** If nothing met the bar, stop: tell the owner no changes are needed, what you checked, and what you'd look at next. Leave the repository alone, with no issue, branch or pull request.
11. **Hand it over.** If something did meet the bar, file an issue, because every change needs one, and start a branch from the latest `main`. Make the changes, run the script again to confirm them, and run the knowledge check named in `knowledge/index.md`. Add an entry to the history page, including what you checked and kept. Open a draft pull request in the format from `knowledge/decisions/issue-workflow.md`. Never merge without the owner's approval.

## Sorting gaps

| What you find | What to do |
| --- | --- |
| Something mocked, missing or risky that someone still has to act on | Keep it `open`, and correct whatever has gone stale |
| The work is finished | Set it to `resolved`, with a `## Status` saying what proves it |
| It only records what one pull request didn't test | Delete it |
| It describes behavior that works as decided | Delete it, and make sure an assumption records the decision |
| Several gaps describe one risk | Merge them into the most specific one, delete the rest, and repoint links |

## Evidence

- **Check the code or the issue tracker, not the page.** A gap saying "partly resolved" or "not deployed" only tells you what was true when it was written. To mark something finished, find what proves it, and name that in the `## Status`.
- **A closed issue proves only what it covered.** Read what's left in the gap before resolving it. Many stay open for a different reason, such as a live provider.
- **Check how far a replacement goes.** Before marking a page superseded, confirm the new decision covers all of it. When only part changed, edit the sentence instead.
- **If you can't tell, leave it open** and list it for a person. A wrong "resolved" is worse than an old gap.
- **The code wins** over any page, but it can't answer what was intended. If code and a decision disagree, that may be a bug, so raise it rather than rewriting the decision.

## Replaced decisions

- **Assumption replaced:** add `superseded_by: <ID>` and `status: deprecated` to the header, and a short `## Status` saying what changed. Keep the file.
- **ADR replaced:** set its `adr_status` to `Superseded` and its `status` to `deprecated`, and say why in its `## Status`. Keep the file.
- **Never a lasting decision:** delete assumptions that only set the scope of one piece of work, or that the code now states plainly, such as tool versions.
- **Real conflict, no clear winner:** don't choose. List it for the owner. Payment, safety and legal rules count as a person's decision, even when one answer looks obvious.

## Trimming

Size alone isn't a problem, because agents open only the pages they need. Trim only what meets the bar in [What earns a change](#what-earns-a-change), such as a note that records a moment rather than a fact someone will need again.

- **Cut:** finished plans, test notes from one pull request, step-by-step history, and text that repeats another page or the code.
- **Keep:** why a decision was made, security and compliance reasoning, what the code can't show, and gaps for anything mocked.
- **Don't trim** the sections of `knowledge/product/features` headed `Product requirements`. They carry PRD precedence, so changing one needs a decision.
- **Don't delete** reports in `knowledge/sweeps`.

Git keeps everything deleted, so a deletion is safe when the fact is no longer useful. Don't add a new page to summarize what you removed. The pull request says what changed.

## Recording a review

Add an entry to the top of `knowledge/references/knowledge-reviews.md` for each review that changes something. A review with no changes leaves the repository alone, so the last reviewed commit stays the same. If the page doesn't exist yet, create it with an OKF header (`type: Reference`, a `title` and a one-sentence `description`) and list it in `knowledge/index.md` under References.

```markdown
## <Date>: <first, second, ...> review

- **Code:** `<short commit>` on `main`. Pass this commit to `review.mjs` next time.
- **Pull request:** <link>.
- **Result:** <what was checked, and how many gaps were resolved, deleted, merged and kept>.
- **Most useful:** <what found the real problems, so the next review starts there>.
- **Not covered:** <what wasn't reviewed>.
- **Kept on purpose:** <what was checked and left alone, and why>.
- **Next time:** <the next unreviewed area>.
```

## Hand over

When there's a pull request, it should say how many gaps were resolved, deleted, merged and kept, and which assumptions and ADRs changed. Then list:

- What needs a decision, with the pages that conflict.
- What you didn't review, so the next review can start there.

## Known limits

- The script can't tell whether a page is true, only where to look.
- The candidate lists include false positives. Older ADRs can name a path to say it wasn't used. Record these under **Kept on purpose**.
- Two runs won't match word for word, but with nothing new they should both end with no changes.
- Don't read passwords or sign in to anything for this review. Say what you couldn't verify without signing in.
