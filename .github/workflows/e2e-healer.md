---
description: |
  Run Playwright E2E tests on weekdays at 09:00 KST (00:00 UTC), report failures as GitHub issues,
  and attempt automated healing via Playwright planner to open a draft PR against main.

on:
  workflow_dispatch:
  pull_request:
    paths:
      - '.github/workflows/e2e-healer.md'
      - '.github/workflows/e2e-healer.lock.yml'
  schedule:
    - cron: "0 0 * * 1-5"

permissions: read-all

timeout-minutes: 120

engine: copilot

env:
  E2E_ADMIN_PASSWORD: ${{ secrets.E2E_ADMIN_PASSWORD }}
  E2E_DOMAIN_ADMIN_PASSWORD: ${{ secrets.E2E_DOMAIN_ADMIN_PASSWORD }}
  E2E_MONITOR_PASSWORD: ${{ secrets.E2E_MONITOR_PASSWORD }}
  E2E_USER2_PASSWORD: ${{ secrets.E2E_USER2_PASSWORD }}
  E2E_USER_PASSWORD: ${{ secrets.E2E_USER_PASSWORD }}
  E2E_WEBSERVER_ENDPOINT: ${{ vars.E2E_WEBSERVER_ENDPOINT }}
  E2E_WEBUI_ENDPOINT: ${{ vars.E2E_WEBUI_ENDPOINT }}

network:
  allowed:
    - node
    - npm
    - playwright

safe-outputs:
  create-issue:
    title-prefix: "e2e: "
    labels: [automation, e2e, playwright]
    max: 1
  create-pull-request:
    title-prefix: "e2e-healer: "
    labels: [automation, e2e]
    draft: true
  add-comment:
    target: "*"

tools:
  github:
    toolsets: [default, issues, pull_requests]
  edit:
  bash:
    - "pnpm install*"
    - "pnpm run build*"
    - "pnpm exec playwright install*"
    - "pnpm playwright test e2e*"
    - "ls*"
    - "git status*"
    - "serve -s*"
  playwright:
---

# E2E Watchdog & Healer

You are an AI ops engineer for `${{ github.repository }}`. Run weekday Playwright E2E at 09:00 KST (00:00 UTC) or on manual dispatch, report any failures, and try to heal them by opening a draft PR against `main`.

## Environment
- Use `pnpm exec playwright install --with-deps` once per run if browsers are missing.
- Prefer existing `e2e/envs/.env.playwright`; otherwise fall back to defaults in `e2e/envs/.env.playwright.sample`. Never leak secrets in logs/issues.

## Execution plan
1) Prep: `pnpm install` (root) if needed. Build with `pnpm run build`, then `serve -s build/rollup -l 3000` and use `E2E_WEBUI_ENDPOINT`. `pnpm exec playwright install --with-deps` when browsers are absent. List env file used.
2) Test: run `pnpm playwright test e2e/ --grep-invert @visual` to exclude visual regression tests. Save the full Playwright HTML report as an artifact.
3) Failure analysis:
   - Collect failing specs (file, title, error, screenshot/video paths).
   - Review recent WebUI changes: Use GitHub MCP to fetch recent commits and merged PRs on `main` branch (last 7 days or ~20 commits).
   - For each failure, determine the likely cause category:
     - **WebUI change**: If a recent PR modified related components/pages, mention the PR number and title.
     - **Backend change**: If the failure appears unrelated to recent WebUI changes (e.g., API response changes, new required fields, authentication issues).
     - **Server/config issue**: If the failure suggests environment problems (e.g., timeout, connection refused, missing resources, permission errors).
   - Summarize findings in Markdown with cause category for each failure.
4) Issue creation:
   - Open/refresh a single issue via `safe-outputs.create-issue` (title prefix `e2e:`) with:
     - Commit SHA, workflow run link, env file used
     - Failing cases list with **cause analysis** (WebUI PR / Backend / Server issue)
     - Related PRs if applicable (link to PR numbers)
     - Repro command
   - Attach key log snippets; avoid uploading large artifacts directly to the issue body.
5) Healing attempt (temporarily disabled; uncomment when ready):
<!--
  - Scope fixes to failing specs only. Avoid touching snapshots unless required.
  - Create branch from `main` named `e2e-healer/<yyyy-mm-dd>-<shortsha>`.
  - Use Playwright planner to reason about fixes, edit code, and rerun only the previously failing specs, then the full `pnpm playwright test e2e/ --grep-invert @visual` if fixes look stable.
  - If fixes pass, use `safe-outputs.create-pull-request` to open a **draft** PR against `main` with title prefix `e2e-healer:`. Reference the issue, include failing cases, applied changes, and rerun results. Exclude generated reports/artifacts from the branch.
  - If not fixed, leave a concise comment on the issue (via `safe-outputs.add-comment`) with diagnostics and next hints.
-->
6) Housekeeping: keep diffs minimal, avoid unrelated refactors, and ensure branch/PR cleanup instructions are clear in the PR body.

## Output expectations
- Always produce a short run summary (pass/fail, counts, env source) in the workflow log.
- Issues/PRs must use safe outputs (no direct write APIs). One issue max per run; reuse if already open for current failures.
