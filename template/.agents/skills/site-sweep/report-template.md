---
type: Report
title: "<Sweep> sweep, <date>"
description: "<One sentence: what this sweep found.>"
finished: <UTC time, such as 2026-11-06T15:30Z>
sweep: <the sweep's name, as knowledge/references/site-sweeps.md gives it>
commit: <short commit reviewed on main>
---

# <Sweep> sweep, <date>

**Result:** <Issues at each priority, and what was found fine, in two or three sentences.>

**Not covered:** <What wasn't tested, and why.>

## Issues

### S1. <What should be true, in plain words>

Type: <Bug, Feature or Task> · Priority: <P1, P2 or P3> · Labels: <existing labels>

#### User story

As a <person>, I want <outcome>, so that <reason>.

#### How to see it

<Where it was reproduced, then numbered steps with what happened and what should have.>

#### Acceptance criteria

- [ ] <A result someone can check.>
- [ ] <A test covers it, where one fits.>

#### Code notes

<Where the problem is, linking each file by its full path on `main`. Add "Decision needed:" if the fix depends on one.>

#### Related

<Other issues. Leave this out if there are none.>

## Out-of-date knowledge

- `<page>`: <what is wrong, and what needs deciding>

## Candidates

- <Not reproduced>: <why it couldn't be tested>
