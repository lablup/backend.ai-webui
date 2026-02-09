---
description: |
  Run Playwright E2E tests on weekdays at 09:00 KST (00:00 UTC) and report failures as GitHub issues.

on:
  workflow_dispatch:
  schedule:
    - cron: "0 0 * * 1-5"

permissions: read-all

timeout-minutes: 120

engine: copilot

env:
  # Endpoints
  E2E_WEBUI_ENDPOINT: ${{ vars.E2E_WEBUI_ENDPOINT }}
  E2E_WEBSERVER_ENDPOINT: ${{ vars.E2E_WEBSERVER_ENDPOINT }}
  # Admin credentials
  E2E_ADMIN_EMAIL: ${{ vars.E2E_ADMIN_EMAIL }}
  E2E_ADMIN_PASSWORD: ${{ secrets.E2E_ADMIN_PASSWORD }}
  # User credentials
  E2E_USER_EMAIL: ${{ vars.E2E_USER_EMAIL }}
  E2E_USER_PASSWORD: ${{ secrets.E2E_USER_PASSWORD }}
  # User2 credentials
  E2E_USER2_EMAIL: ${{ vars.E2E_USER2_EMAIL }}
  E2E_USER2_PASSWORD: ${{ secrets.E2E_USER2_PASSWORD }}
  # Monitor credentials
  E2E_MONITOR_EMAIL: ${{ vars.E2E_MONITOR_EMAIL }}
  E2E_MONITOR_PASSWORD: ${{ secrets.E2E_MONITOR_PASSWORD }}
  # Domain admin credentials
  E2E_DOMAIN_ADMIN_EMAIL: ${{ vars.E2E_DOMAIN_ADMIN_EMAIL }}
  E2E_DOMAIN_ADMIN_PASSWORD: ${{ secrets.E2E_DOMAIN_ADMIN_PASSWORD }}

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
  add-comment:
    target: "*"

steps:
  - uses: actions/setup-node@v4
    with:
      node-version: '20'
  - uses: pnpm/action-setup@v4
    with:
      version: 10
  - name: Print E2E endpoints
    run: |
      echo "=== E2E Test Configuration ==="
      echo "E2E_WEBUI_ENDPOINT: $E2E_WEBUI_ENDPOINT"
      echo "E2E_WEBSERVER_ENDPOINT: $E2E_WEBSERVER_ENDPOINT"
  - run: pnpm install --frozen-lockfile --prefer-offline
  - name: Get Playwright version
    id: playwright-version
    run: echo "version=$(pnpm exec playwright --version | cut -d' ' -f2)" >> $GITHUB_OUTPUT
  - name: Cache Playwright browsers
    uses: actions/cache@v4
    id: playwright-cache
    with:
      path: ~/.cache/ms-playwright
      key: playwright-${{ runner.os }}-${{ steps.playwright-version.outputs.version }}
  - name: Install Playwright browsers
    if: steps.playwright-cache.outputs.cache-hit != 'true'
    run: pnpm exec playwright install --with-deps chromium
  - name: Run E2E tests
    id: e2e-tests
    continue-on-error: true
    run: pnpm playwright test e2e/ --grep-invert @visual --reporter=html,json --output=test-results
  - name: Save test results
    run: |
      mkdir -p /tmp/gh-aw/e2e-results
      cp -r playwright-report /tmp/gh-aw/e2e-results/ 2>/dev/null || true
      cp -r test-results /tmp/gh-aw/e2e-results/ 2>/dev/null || true
      echo "TEST_EXIT_CODE=${{ steps.e2e-tests.outcome == 'success' && '0' || '1' }}" >> /tmp/gh-aw/e2e-results/summary.env
  - uses: actions/upload-artifact@v4
    if: always()
    with:
      name: playwright-report
      path: playwright-report/
      retention-days: 30

tools:
  github:
    toolsets: [default, issues]
  bash:
    - "ls*"
    - "cat*"
    - "git status*"
---

# E2E Watchdog

You are an AI ops engineer for `${{ github.repository }}`. Run weekday Playwright E2E tests at 09:00 KST (00:00 UTC) or on manual dispatch, and report any failures as GitHub issues.

## Environment
- Dependencies and Playwright browsers are pre-installed in the `steps` phase.
- E2E tests have already been executed in the `steps` phase before the agent starts.
- Test results are available at `/tmp/gh-aw/e2e-results/` directory.
- Tests run against the deployed endpoint: `E2E_WEBUI_ENDPOINT` (set via repository variables).

## CRITICAL: Secret Protection Rules
**NEVER include any of the following in issues, comments, or logs:**
- Passwords, API keys, tokens, or any credential values
- Email addresses used for authentication (E2E_*_EMAIL values)
- Any environment variable values that contain sensitive data
- URLs with embedded credentials or tokens

**When reporting issues:**
- Use `[REDACTED]` for any sensitive values
- Only mention that credentials are "configured" or "missing", never show actual values
- For endpoints, you may show the URL but redact any auth tokens in query strings

## Execution plan
1) Analyze: Read test results from `/tmp/gh-aw/e2e-results/`. Check `summary.env` for overall status and `playwright-report/` for detailed results.
2) Failure analysis:
   - Collect failing specs (file, title, error, screenshot/video paths).
   - Review recent WebUI changes: Use GitHub MCP to fetch recent commits and merged PRs on `main` branch (last 7 days or ~20 commits).
   - For each failure, determine the likely cause category:
     - **WebUI change**: If a recent PR modified related components/pages, mention the PR number and title.
     - **Backend change**: If the failure appears unrelated to recent WebUI changes (e.g., API response changes, new required fields, authentication issues).
     - **Server/config issue**: If the failure suggests environment problems (e.g., timeout, connection refused, missing resources, permission errors).
   - Summarize findings in Markdown with cause category for each failure.
3) Issue creation:
   - Open/refresh a single issue via `safe-outputs.create-issue` (title prefix `e2e:`) with:
     - Commit SHA, workflow run link, env file used
     - Failing cases list with **cause analysis** (WebUI PR / Backend / Server issue)
     - Related PRs if applicable (link to PR numbers)
     - Repro command
   - Attach key log snippets; avoid uploading large artifacts directly to the issue body.
4) Housekeeping: keep output minimal and focused on actionable information.

## Output expectations
- Always produce a short run summary (pass/fail, counts, env source) in the workflow log.
- Issues must use safe outputs (no direct write APIs). One issue max per run; reuse if already open for current failures.
