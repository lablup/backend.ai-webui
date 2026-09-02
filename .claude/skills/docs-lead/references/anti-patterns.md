# Anti-patterns

Patterns that look reasonable but corrupt the docs-lead workflow over time.
Read this when you're tempted to take a shortcut that "obviously" saves a
turn.

## Workflow shortcuts

- **Calling `docs-update-planner` and `docs-update-writer` in the same turn
  without showing the plan to the user.** Skips the editorial gate. Even if
  the plan is "obviously fine", surfacing it is what teaches the user trust
  in the system. Without trust, the user starts second-guessing every output.

- **Showing the user a 200-line lint report dump instead of a 4-option
  AskUserQuestion summary.** Defeats the purpose of having a triage agent.
  Lint output goes to `packages/backend.ai-webui-docs/.agent-output/docs-lint-report.md`; the user gets a
  decision gate, not a wall of text.

- **Re-running `docs-lint` when a fresh report exists from the last few
  minutes.** Check the timestamp of the top run section — if within 10
  minutes and the user hasn't made changes since (`git status --short` is
  clean for `src/`), reuse the existing report. Each lint run reads dozens
  of files; rerunning is expensive.

- **Treating a worker's "completed" signal as proof of correctness.** Always
  look at the actual diff via `git status --short -- packages/backend.ai-webui-docs/src/`
  and read the reviewer's report. Workers can mis-report what they did.

- **Chaining step 5 for multiple topics in one uninterrupted run.** Even
  when the user picks "all of the above" implicitly, return to the decision
  gate (step 4 or step 6) between topics. Multi-topic runs make rollback
  impossible and inflate context catastrophically.

- **Running two docs-lead invocations against the same `packages/backend.ai-webui-docs/.agent-output/`
  simultaneously.** `docs-lint`'s rotation and `docs-state.md`'s append are
  both read-modify-write without locking. Two parallel runs can clobber
  each other's writes. Within a single worktree the skill is single-runner
  by design — do not fan it out from two terminals.

- **Treating the approval gates as enforced.** The "never call writer
  without AskUserQuestion confirmation" and "never call screenshot-capturer
  without live-app confirmation" rules are honor-system. There is no
  middleware blocking a worker call; the only safeguard is this skill
  reading and following its own Hard Rules. If you find yourself thinking
  "the user obviously wants me to skip this gate", stop and ask anyway —
  the gate is what makes the workflow trustworthy.

## Queue shape

- **Letting the work queue grow without bound.** If step 4 surfaces more
  than 4 options, group lower-priority items into one bundled option
  ("기타 N건 일괄 처리"). The bundle option, when selected, becomes its
  own sub-triage.

- **Skipping the "no work needed" verdict.** When lint + state both come up
  empty, the right output is *"no work needed — most recent run on <date>
  covered everything"*. Do not invent work to justify the invocation.

## Editorial control

- **Auto-fixing terminology drift via the skill.** Even though it's trivial,
  the rule is workers do mutations, the skill does orchestration. Route
  through `docs-update-writer` with a one-line "fix terminology drift listed
  in lint report" plan.

- **`docs-lint` auto-fixing anything.** Lint is diagnosis-only. If you find
  yourself adding `Edit` or `Write` (to docs files) capability to docs-lint,
  stop — that's a `docs-update-writer` job.

- **Re-introducing a Query op.** The skill explicitly excludes Karpathy's
  Query operation. If users ask "can it answer questions about the manual
  too?", point them at the manual itself or escalate to a human writer.
  Adding Query without the same approval-gate pattern as Ingest will erode
  human editorial control over time.

## Data hygiene

- **Writing to user-level `~/.claude/plugins/data/...` instead of
  `packages/backend.ai-webui-docs/.agent-output/`.** docs state is project-and-worktree-bound. User-level
  storage means another worktree on the same machine, or another machine
  entirely, can't see it. Stick with `packages/backend.ai-webui-docs/.agent-output/`.

- **Skipping the rotation policy.** `docs-state.md` rotates at 30 blocks
  into quarterly archives. `docs-lint-report.md` keeps 10 runs with a 256
  KB cap. Don't let either file grow unbounded — git status churn and
  context cost will both bite.

- **Manually editing `docs-state.md` to "clean it up".** It is the
  permanent log. Append-only is the contract. If something needs
  correcting, append a new block describing the correction; don't rewrite
  history.
