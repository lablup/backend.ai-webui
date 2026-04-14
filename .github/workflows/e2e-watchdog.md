---
description: |
  Run Playwright E2E tests on weekdays at 09:00 KST (00:00 UTC) and report failures as GitHub issues.
  Optionally sends results to Microsoft Teams and creates/updates Jira issues on failure.

on:
  workflow_dispatch:
    inputs:
      test_filter:
        description: "Playwright grep filter (e.g. @smoke, @critical, auth/login)"
        required: false
        default: ""
      notify_teams:
        description: "Send results to Teams webhook"
        required: false
        default: "true"
  schedule:
    - cron: "0 0 * * 1-5"

permissions: read-all

timeout-minutes: 120

engine: copilot

strict: false

env:
  # Endpoints (non-secret vars — safe to expose to agent)
  E2E_WEBUI_ENDPOINT: ${{ vars.E2E_WEBUI_ENDPOINT }}
  E2E_WEBSERVER_ENDPOINT: ${{ vars.E2E_WEBSERVER_ENDPOINT }}
  # Account emails (non-secret vars)
  E2E_ADMIN_EMAIL: ${{ vars.E2E_ADMIN_EMAIL }}
  E2E_USER_EMAIL: ${{ vars.E2E_USER_EMAIL }}
  E2E_USER2_EMAIL: ${{ vars.E2E_USER2_EMAIL }}
  E2E_MONITOR_EMAIL: ${{ vars.E2E_MONITOR_EMAIL }}
  E2E_DOMAIN_ADMIN_EMAIL: ${{ vars.E2E_DOMAIN_ADMIN_EMAIL }}
  # Note: password secrets are scoped to the 'Run E2E tests' step only

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
  - name: Determine test filter
    id: test-filter
    env:
      INPUT_TEST_FILTER: ${{ inputs.test_filter }}
    run: |
      if [ -n "$INPUT_TEST_FILTER" ]; then
        echo "args=--grep $INPUT_TEST_FILTER" >> $GITHUB_OUTPUT
      else
        echo "args=--grep-invert @visual" >> $GITHUB_OUTPUT
      fi
  - name: Run E2E tests
    id: e2e-tests
    continue-on-error: true
    env:
      TEST_ARGS: ${{ steps.test-filter.outputs.args }}
      # Password secrets scoped to this step only (not exposed to agent)
      E2E_ADMIN_PASSWORD: ${{ secrets.E2E_ADMIN_PASSWORD }}
      E2E_USER_PASSWORD: ${{ secrets.E2E_USER_PASSWORD }}
      E2E_USER2_PASSWORD: ${{ secrets.E2E_USER2_PASSWORD }}
      E2E_MONITOR_PASSWORD: ${{ secrets.E2E_MONITOR_PASSWORD }}
      E2E_DOMAIN_ADMIN_PASSWORD: ${{ secrets.E2E_DOMAIN_ADMIN_PASSWORD }}
    run: pnpm playwright test e2e/ $TEST_ARGS --reporter=html,json --output=test-results
  - name: Save test results
    env:
      E2E_OUTCOME: ${{ steps.e2e-tests.outcome }}
    run: |
      mkdir -p /tmp/gh-aw/e2e-results
      cp -r playwright-report /tmp/gh-aw/e2e-results/ 2>/dev/null || true
      cp -r test-results /tmp/gh-aw/e2e-results/ 2>/dev/null || true
      TEST_EXIT_CODE=0
      [ "$E2E_OUTCOME" != "success" ] && TEST_EXIT_CODE=1
      echo "TEST_EXIT_CODE=${TEST_EXIT_CODE}" >> /tmp/gh-aw/e2e-results/summary.env
  - uses: actions/upload-artifact@v4
    if: always()
    with:
      name: playwright-report
      path: playwright-report/
      retention-days: 30

  # --- FR-2561: Structured result parsing ---
  - name: Parse Playwright JSON results
    id: parse-results
    if: always()
    env:
      E2E_OUTCOME: ${{ steps.e2e-tests.outcome }}
    run: |
      JSON_REPORT=""
      # Playwright JSON reporter outputs to the current directory
      for f in test-results.json playwright-report/results.json report.json; do
        if [ -f "$f" ]; then JSON_REPORT="$f"; break; fi
      done
      # Fallback: search for any JSON report
      if [ -z "$JSON_REPORT" ]; then
        JSON_REPORT=$(find . -maxdepth 2 -name '*.json' -path '*report*' -o -name 'test-results.json' 2>/dev/null | head -1)
      fi

      if [ -z "$JSON_REPORT" ] || [ ! -f "$JSON_REPORT" ]; then
        echo "::warning::No Playwright JSON report found, using fallback values"
        echo "total=0" >> $GITHUB_OUTPUT
        echo "passed=0" >> $GITHUB_OUTPUT
        echo "failed=0" >> $GITHUB_OUTPUT
        echo "skipped=0" >> $GITHUB_OUTPUT
        FALLBACK_STATUS="fail"; [ "$E2E_OUTCOME" = "success" ] && FALLBACK_STATUS="pass"
        echo "status=${FALLBACK_STATUS}" >> $GITHUB_OUTPUT
        echo "duration=0" >> $GITHUB_OUTPUT
        echo "failed_tests=[]" >> $GITHUB_OUTPUT
        exit 0
      fi

      echo "Found JSON report: $JSON_REPORT"

      # Parse with Node.js for reliable JSON handling
      node -e "
        const fs = require('fs');
        const data = JSON.parse(fs.readFileSync('$JSON_REPORT', 'utf8'));

        let total = 0, passed = 0, failed = 0, skipped = 0, duration = 0;
        const failedTests = [];

        function walkSuites(suites) {
          for (const suite of suites || []) {
            for (const spec of suite.specs || []) {
              for (const test of spec.tests || []) {
                total++;
                const result = test.results?.[test.results.length - 1];
                const status = result?.status || test.status || 'unknown';
                duration += result?.duration || 0;
                if (status === 'passed' || status === 'expected') passed++;
                else if (status === 'skipped') skipped++;
                else {
                  failed++;
                  failedTests.push({
                    title: spec.title,
                    file: spec.file || suite.file || '',
                    error: (result?.error?.message || '').slice(0, 200)
                  });
                }
              }
            }
            walkSuites(suite.suites);
          }
        }
        walkSuites(data.suites);

        const durationSec = Math.round(duration / 1000);
        const status = failed > 0 ? 'fail' : 'pass';

        // Write to GITHUB_OUTPUT
        const output = [
          'total=' + total,
          'passed=' + passed,
          'failed=' + failed,
          'skipped=' + skipped,
          'status=' + status,
          'duration=' + durationSec,
        ].join('\n');
        fs.appendFileSync(process.env.GITHUB_OUTPUT, output + '\n');

        // Multi-line output for failed tests JSON
        const failedJson = JSON.stringify(failedTests);
        fs.appendFileSync(process.env.GITHUB_OUTPUT, 'failed_tests=' + failedJson + '\n');

        console.log('Parsed: ' + total + ' total, ' + passed + ' passed, ' + failed + ' failed, ' + skipped + ' skipped (' + durationSec + 's)');
      "

  # --- FR-2560: Teams webhook notification ---
  - name: Send Teams notification
    if: always() && (inputs.notify_teams != 'false')
    env:
      TEAMS_WEBHOOK_URL: ${{ secrets.TEAMS_WEBHOOK_URL }}
      PARSE_STATUS: ${{ steps.parse-results.outputs.status }}
      PARSE_TOTAL: ${{ steps.parse-results.outputs.total }}
      PARSE_PASSED: ${{ steps.parse-results.outputs.passed }}
      PARSE_FAILED: ${{ steps.parse-results.outputs.failed }}
      PARSE_SKIPPED: ${{ steps.parse-results.outputs.skipped }}
      PARSE_DURATION: ${{ steps.parse-results.outputs.duration }}
      PARSE_FAILED_TESTS: ${{ steps.parse-results.outputs.failed_tests }}
      GH_SERVER_URL: ${{ github.server_url }}
      GH_REPOSITORY: ${{ github.repository }}
      GH_RUN_ID: ${{ github.run_id }}
      GH_EVENT_NAME: ${{ github.event_name }}
    run: |
      if [ -z "$TEAMS_WEBHOOK_URL" ]; then
        echo "::notice::TEAMS_WEBHOOK_URL secret not configured, skipping Teams notification"
        exit 0
      fi

      STATUS="$PARSE_STATUS"
      TOTAL="$PARSE_TOTAL"
      PASSED="$PARSE_PASSED"
      FAILED="$PARSE_FAILED"
      SKIPPED="$PARSE_SKIPPED"
      DURATION="$PARSE_DURATION"
      RUN_URL="${GH_SERVER_URL}/${GH_REPOSITORY}/actions/runs/${GH_RUN_ID}"
      DATE=$(date -u +"%Y-%m-%d")
      TRIGGER="$GH_EVENT_NAME"

      if [ "$STATUS" = "pass" ]; then
        STATUS_EMOJI="✅"
        STATUS_TEXT="All Passed"
        THEME_COLOR="good"
      else
        STATUS_EMOJI="❌"
        STATUS_TEXT="${FAILED} Failed"
        THEME_COLOR="attention"
      fi

      # Build failed test list for the card
      FAILED_TESTS="$PARSE_FAILED_TESTS"
      FAILED_LIST=""
      if [ "$FAILED" != "0" ] && [ -n "$FAILED_TESTS" ] && [ "$FAILED_TESTS" != "[]" ]; then
        FAILED_LIST=$(node -e "
          const tests = JSON.parse(process.argv[1]);
          const lines = tests.slice(0, 10).map(t => '- **' + t.file + '**: ' + t.title);
          if (tests.length > 10) lines.push('- ... and ' + (tests.length - 10) + ' more');
          console.log(lines.join('\n'));
        " "$FAILED_TESTS")
      fi

      # Build Adaptive Card JSON
      CARD_JSON=$(node -e "
        const card = {
          type: 'message',
          attachments: [{
            contentType: 'application/vnd.microsoft.card.adaptive',
            content: {
              '\$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
              type: 'AdaptiveCard',
              version: '1.4',
              body: [
                {
                  type: 'TextBlock',
                  text: '${STATUS_EMOJI} E2E Test Report — ${DATE}',
                  weight: 'bolder',
                  size: 'medium',
                  wrap: true
                },
                {
                  type: 'FactSet',
                  facts: [
                    { title: 'Status', value: '${STATUS_TEXT}' },
                    { title: 'Total', value: '${TOTAL}' },
                    { title: 'Passed', value: '${PASSED}' },
                    { title: 'Failed', value: '${FAILED}' },
                    { title: 'Skipped', value: '${SKIPPED}' },
                    { title: 'Duration', value: '${DURATION}s' },
                    { title: 'Trigger', value: '${TRIGGER}' }
                  ]
                }
              ],
              actions: [
                {
                  type: 'Action.OpenUrl',
                  title: 'View GitHub Actions Run',
                  url: '${RUN_URL}'
                }
              ]
            }
          }]
        };

        const failedList = process.argv[1];
        if (failedList) {
          card.attachments[0].content.body.push({
            type: 'TextBlock',
            text: '**Failed Tests:**',
            weight: 'bolder',
            wrap: true,
            separator: true
          });
          card.attachments[0].content.body.push({
            type: 'TextBlock',
            text: failedList,
            wrap: true,
            isSubtle: true
          });
        }

        console.log(JSON.stringify(card));
      " "${FAILED_LIST}")

      # Send to Teams
      HTTP_CODE=$(curl -s -o /tmp/teams-response.txt -w "%{http_code}" \
        -H "Content-Type: application/json" \
        -d "$CARD_JSON" \
        "$TEAMS_WEBHOOK_URL")

      if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
        echo "Teams notification sent successfully (HTTP $HTTP_CODE)"
      else
        echo "::warning::Teams notification failed (HTTP $HTTP_CODE)"
        cat /tmp/teams-response.txt 2>/dev/null || true
      fi

  # --- FR-2563: Jira issue creation/update on failure ---
  - name: Create or update Jira issue on failure
    if: always() && steps.parse-results.outputs.status == 'fail'
    env:
      ATLASSIAN_EMAIL: ${{ secrets.ATLASSIAN_EMAIL }}
      ATLASSIAN_API_TOKEN: ${{ secrets.ATLASSIAN_API_TOKEN }}
      JIRA_SITE: ${{ vars.JIRA_SITE || 'lablup.atlassian.net' }}
      JIRA_PROJECT: ${{ vars.JIRA_PROJECT || 'FR' }}
      PARSE_FAILED: ${{ steps.parse-results.outputs.failed }}
      PARSE_TOTAL: ${{ steps.parse-results.outputs.total }}
      PARSE_PASSED: ${{ steps.parse-results.outputs.passed }}
      PARSE_FAILED_TESTS: ${{ steps.parse-results.outputs.failed_tests }}
      GH_SERVER_URL: ${{ github.server_url }}
      GH_REPOSITORY: ${{ github.repository }}
      GH_RUN_ID: ${{ github.run_id }}
      GH_SHA: ${{ github.sha }}
    run: |
      if [ -z "$ATLASSIAN_EMAIL" ] || [ -z "$ATLASSIAN_API_TOKEN" ]; then
        echo "::notice::Jira credentials not configured, skipping Jira integration"
        exit 0
      fi

      JIRA_BASE="https://${JIRA_SITE}/rest/api/3"
      AUTH=$(echo -n "${ATLASSIAN_EMAIL}:${ATLASSIAN_API_TOKEN}" | base64)
      DATE=$(date -u +"%Y-%m-%d")
      RUN_URL="${GH_SERVER_URL}/${GH_REPOSITORY}/actions/runs/${GH_RUN_ID}"
      FAILED="$PARSE_FAILED"
      TOTAL="$PARSE_TOTAL"
      PASSED="$PARSE_PASSED"

      # Build description (ADF format via Markdown-like content)
      FAILED_TESTS="$PARSE_FAILED_TESTS"
      FAILED_SECTION=""
      if [ -n "$FAILED_TESTS" ] && [ "$FAILED_TESTS" != "[]" ]; then
        FAILED_SECTION=$(node -e "
          const tests = JSON.parse(process.argv[1]);
          const lines = tests.slice(0, 20).map(t => '- **' + t.file + '**: ' + t.title);
          if (tests.length > 20) lines.push('- ... and ' + (tests.length - 20) + ' more');
          console.log(lines.join('\n'));
        " "$FAILED_TESTS")
      fi

      DESC=$(printf 'E2E Test Failure Report — %s\n\nResults: %s failed / %s passed / %s total\n\nFailed Tests:\n%s\n\nLinks:\n- GitHub Actions Run: %s\n- Commit: %s' \
        "${DATE}" "${FAILED}" "${PASSED}" "${TOTAL}" "${FAILED_SECTION}" "${RUN_URL}" "${GH_SHA}")

      # Search for existing open e2e-failure issue
      JQL="project = ${JIRA_PROJECT} AND labels = e2e-failure AND labels = automated AND resolution = Unresolved"
      SEARCH_RESULT=$(curl -s -H "Authorization: Basic ${AUTH}" \
        -H "Content-Type: application/json" \
        "${JIRA_BASE}/search?jql=$(python3 -c "import urllib.parse; print(urllib.parse.quote('${JQL}'))")&maxResults=1&fields=key,summary")

      EXISTING_KEY=$(echo "$SEARCH_RESULT" | node -e "
        const data = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
        const key = data.issues?.[0]?.key || '';
        process.stdout.write(key);
      ")

      if [ -n "$EXISTING_KEY" ]; then
        echo "Updating existing Jira issue: $EXISTING_KEY"
        # Add comment with latest results
        COMMENT_BODY=$(node -e "
          console.log(JSON.stringify({
            body: {
              version: 1,
              type: 'doc',
              content: [{
                type: 'paragraph',
                content: [{
                  type: 'text',
                  text: 'E2E Watchdog Update (${DATE}): ${FAILED} failed / ${PASSED} passed / ${TOTAL} total. '
                }, {
                  type: 'text',
                  text: 'View run',
                  marks: [{ type: 'link', attrs: { href: '${RUN_URL}' } }]
                }]
              }]
            }
          }));
        ")
        curl -s -o /dev/null -w "Jira comment: HTTP %{http_code}\n" \
          -H "Authorization: Basic ${AUTH}" \
          -H "Content-Type: application/json" \
          -X POST \
          -d "$COMMENT_BODY" \
          "${JIRA_BASE}/issue/${EXISTING_KEY}/comment"
      else
        echo "Creating new Jira issue for E2E failure"
        # Create new issue
        ISSUE_BODY=$(node -e "
          const desc = process.argv[1];
          // Convert markdown to simple ADF
          const lines = desc.split('\n');
          const content = lines.map(line => ({
            type: 'paragraph',
            content: [{ type: 'text', text: line }]
          }));
          console.log(JSON.stringify({
            fields: {
              project: { key: '${JIRA_PROJECT}' },
              summary: '[E2E Watchdog] Test failures — ${DATE}',
              issuetype: { name: 'Task' },
              labels: ['e2e-failure', 'automated'],
              description: {
                version: 1,
                type: 'doc',
                content: content
              }
            }
          }));
        " "$DESC")

        RESULT=$(curl -s -H "Authorization: Basic ${AUTH}" \
          -H "Content-Type: application/json" \
          -X POST \
          -d "$ISSUE_BODY" \
          "${JIRA_BASE}/issue")

        NEW_KEY=$(echo "$RESULT" | node -e "
          const data = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
          process.stdout.write(data.key || 'FAILED');
        ")
        echo "Created Jira issue: $NEW_KEY"
      fi

  # --- FR-2563: Auto-resolve Jira issue when tests pass ---
  - name: Resolve Jira issue on all-pass
    if: always() && steps.parse-results.outputs.status == 'pass'
    env:
      ATLASSIAN_EMAIL: ${{ secrets.ATLASSIAN_EMAIL }}
      ATLASSIAN_API_TOKEN: ${{ secrets.ATLASSIAN_API_TOKEN }}
      JIRA_SITE: ${{ vars.JIRA_SITE || 'lablup.atlassian.net' }}
      JIRA_PROJECT: ${{ vars.JIRA_PROJECT || 'FR' }}
      GH_SERVER_URL: ${{ github.server_url }}
      GH_REPOSITORY: ${{ github.repository }}
      GH_RUN_ID: ${{ github.run_id }}
    run: |
      if [ -z "$ATLASSIAN_EMAIL" ] || [ -z "$ATLASSIAN_API_TOKEN" ]; then
        exit 0
      fi

      JIRA_BASE="https://${JIRA_SITE}/rest/api/3"
      AUTH=$(echo -n "${ATLASSIAN_EMAIL}:${ATLASSIAN_API_TOKEN}" | base64)
      DATE=$(date -u +"%Y-%m-%d")
      RUN_URL="${GH_SERVER_URL}/${GH_REPOSITORY}/actions/runs/${GH_RUN_ID}"

      # Search for existing open e2e-failure issue
      JQL="project = ${JIRA_PROJECT} AND labels = e2e-failure AND labels = automated AND resolution = Unresolved"
      SEARCH_RESULT=$(curl -s -H "Authorization: Basic ${AUTH}" \
        -H "Content-Type: application/json" \
        "${JIRA_BASE}/search?jql=$(python3 -c "import urllib.parse; print(urllib.parse.quote('${JQL}'))")&maxResults=1&fields=key")

      EXISTING_KEY=$(echo "$SEARCH_RESULT" | node -e "
        const data = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
        process.stdout.write(data.issues?.[0]?.key || '');
      ")

      if [ -z "$EXISTING_KEY" ]; then
        echo "No open e2e-failure issue found, nothing to resolve"
        exit 0
      fi

      echo "Resolving Jira issue: $EXISTING_KEY (all tests passing)"

      # Add comment
      COMMENT_BODY=$(node -e "
        console.log(JSON.stringify({
          body: {
            version: 1,
            type: 'doc',
            content: [{
              type: 'paragraph',
              content: [{
                type: 'text',
                text: 'All E2E tests passing as of ${DATE}. Auto-resolving. '
              }, {
                type: 'text',
                text: 'View run',
                marks: [{ type: 'link', attrs: { href: '${RUN_URL}' } }]
              }]
            }]
          }
        }));
      ")
      curl -s -o /dev/null \
        -H "Authorization: Basic ${AUTH}" \
        -H "Content-Type: application/json" \
        -X POST \
        -d "$COMMENT_BODY" \
        "${JIRA_BASE}/issue/${EXISTING_KEY}/comment"

      # Get available transitions
      TRANSITIONS=$(curl -s -H "Authorization: Basic ${AUTH}" \
        "${JIRA_BASE}/issue/${EXISTING_KEY}/transitions")

      DONE_ID=$(echo "$TRANSITIONS" | node -e "
        const data = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
        const done = (data.transitions || []).find(t => /done|완료|resolve/i.test(t.name));
        process.stdout.write(done?.id || '');
      ")

      if [ -n "$DONE_ID" ]; then
        curl -s -o /dev/null -w "Jira transition: HTTP %{http_code}\n" \
          -H "Authorization: Basic ${AUTH}" \
          -H "Content-Type: application/json" \
          -X POST \
          -d "{\"transition\":{\"id\":\"${DONE_ID}\"}}" \
          "${JIRA_BASE}/issue/${EXISTING_KEY}/transitions"
      else
        echo "::warning::Could not find Done transition for $EXISTING_KEY"
      fi

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
- Parsed results (total, passed, failed, skipped, failed test names) are available via the `parse-results` step outputs.
- Tests run against the deployed endpoint: `E2E_WEBUI_ENDPOINT` (set via repository variables).
- Teams and Jira notifications are handled automatically by the `steps` phase — no agent action needed.

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

## Required Secrets and Variables

### GitHub Secrets (Settings > Secrets and variables > Actions > Secrets)
| Secret | Purpose |
|--------|---------|
| `E2E_ADMIN_PASSWORD` | Admin account password for E2E tests |
| `E2E_USER_PASSWORD` | Regular user password for E2E tests |
| `E2E_USER2_PASSWORD` | Second user password for E2E tests |
| `E2E_MONITOR_PASSWORD` | Monitor account password for E2E tests |
| `E2E_DOMAIN_ADMIN_PASSWORD` | Domain admin password for E2E tests |
| `TEAMS_WEBHOOK_URL` | Microsoft Teams Incoming Webhook URL (optional — skip notification if not set) |
| `ATLASSIAN_API_TOKEN` | Jira API token for issue creation (optional — skip if not set) |
| `ATLASSIAN_EMAIL` | Jira account email for API authentication (optional — skip if not set) |

### GitHub Variables (Settings > Secrets and variables > Actions > Variables)
| Variable | Purpose |
|----------|---------|
| `E2E_WEBUI_ENDPOINT` | WebUI URL for E2E tests (e.g., `http://10.82.1.152:9083`) |
| `E2E_WEBSERVER_ENDPOINT` | Backend.AI API server URL |
| `E2E_ADMIN_EMAIL` | Admin account email |
| `E2E_USER_EMAIL` | Regular user email |
| `E2E_USER2_EMAIL` | Second user email |
| `E2E_MONITOR_EMAIL` | Monitor account email |
| `E2E_DOMAIN_ADMIN_EMAIL` | Domain admin email |
| `JIRA_SITE` | Jira site hostname (default: `lablup.atlassian.net`) |
| `JIRA_PROJECT` | Jira project key (default: `FR`) |

### Teams Webhook Setup
1. In Microsoft Teams, go to the target channel > Manage channel > Connectors
2. Add "Incoming Webhook", name it (e.g., "E2E Watchdog"), and copy the URL
3. Add the URL as `TEAMS_WEBHOOK_URL` secret in GitHub repository settings
