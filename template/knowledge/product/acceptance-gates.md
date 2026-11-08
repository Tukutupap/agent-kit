---
type: Product
title: Acceptance gates
description: The engineering and documentation checks that decide when work is done, plus this product's own gates.
tags: [product, quality]
---

# Acceptance gates

These gates are non-negotiable acceptance criteria. Gates 1 to 4 come from the agent kit and apply to any product. Add the product's own gates under [Product gates](#product-gates).

## Gate 1: Repository and local development

- The repository installs with one documented command.
- The repository has clear local setup instructions.
- `.env.example` includes all required environment variables with safe placeholder values.
- Local dependencies, such as a database, start with one documented command.
- Common commands are exposed as scripts.
- CI can run lint, typecheck, tests, and build without manual local-only assumptions.

## Gate 2: Test coverage

At minimum, automated tests must cover:

- Authentication and authorization, checked on the server.
- Every path that moves money, changes who can see what, or can't be undone.
- Webhooks: signature checks and repeated deliveries.
<!-- Product: add the critical paths for this product. -->

## Gate 3: Documentation and traceability

- Assumptions are recorded in `knowledge/decisions/asm`, and major decisions in `knowledge/decisions/adr`.
- Pull request descriptions say what changed, why, and what wasn't covered.
- `knowledge/launch/gaps` lists all stubs, mocks, and incomplete items.
- The README explains local setup, test commands, and deployment.
- Generated code and docs do not claim external provider integrations are production-active unless credentials and real integrations are configured.

## Gate 4: Code design

Every change follows these rules, or its pull request says which one it breaks and why. Follow them in new code even where older code nearby doesn't.

- **One owner per rule.** Each business rule, such as how money is calculated, which status changes are allowed, or who owns a record, lives in one place. Don't write a rule out again where it's needed; call its owner, or create one.
- **The database refuses bad data.** A rule the data must always follow (non-negative amounts, allowed states, one record where only one may exist, references to rows that exist) also gets a constraint, foreign key or unique index in the migration.
- **Audit with the change.** An audit record is written in the same transaction as the change it describes.
- **Bounded queries.** Every list is paged and filtered in the query. Related rows are loaded together or with one keyed lookup, not a query inside a loop.
- **Typed responses.** A new or changed API response is described by a shared schema that both the server and its clients use, not a type declared beside the page.
- **Real-database tests.** Tests of code that depends on the database run on the real database engine. An in-memory fake is only for logic that doesn't.
- **No provider calls inside a transaction.** Claim the row, commit, call the provider, then record the result.
- **Page data loads safely.** A page ignores a response that arrives after the person moved on, and shows an error when a request fails.
<!-- Product: name where each shared owner lives, such as the fee calculator or the shared schema package, so agents find it. -->

## Product gates

<!-- Product: gates for this product's security, trust, payments, design and deployment, numbered from Gate 5. -->

## Definition of done

The work is not done until:

1. It works end to end, wired to the real API, not to fakes.
2. All critical security gates pass.
3. Tests run successfully, locally and in CI.
4. Local development setup works.
5. Known gaps are explicit in `knowledge/launch/gaps`.
6. No security-sensitive shortcuts are hidden.
7. The change follows Gate 4, or says which rule it breaks and why.
