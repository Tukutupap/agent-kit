---
type: Lesson
title: Agents in cloud sessions
description: What a Claude cloud session can and can't reach, and how to work around it.
tags: [agents, testing]
---

# Agents in cloud sessions

<!-- From the agent kit. Learned on its first project in November 2026. Add what this product's sessions run into. -->

- **No GitHub GraphQL or Projects API.** The session's proxy refuses both, whatever the token, so a session can't change a Projects board directly. It can start a workflow, which is why board changes go through the Board sync workflow.
- **No Docker.** Run services from the image instead. For Postgres, use the binaries in `/usr/lib/postgresql/<version>/bin`, run as the `postgres` user with its data and socket under `/var/tmp`. A container restart stops it, so start it again after deleting a stale `postmaster.pid`.
- **Chromium is preinstalled** under `/opt/pw-browsers` for Playwright. Don't run `playwright install`. If the installed Playwright wants a different headless shell build, symlink the existing `chromium_headless_shell-*` folder to the path it reports missing. Edge and WebKit aren't available.
- **Outbound network is limited** to what the environment allows. Live checks on deployed sites may need a person.
- **Clocks and time zones:** the container runs in UTC. Tests that pass on a laptop in another zone can fail there, so assert times in an explicit zone.
