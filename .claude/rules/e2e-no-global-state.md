# E2E Tests Must Not Change Server-Global State

E2E tests in `e2e/` and `e2e-agent/` run against shared servers. A test must not create, change or delete anything that applies across the server, **even if it restores it afterwards**: a killed run can't restore, and concurrent runs and people on the server see the change while it is in place.

## What counts as server-global

Writes to any of these, through the UI, GraphQL or REST:

- **Data retention policies.**
- **RBAC:** roles, permissions, role presets, and role assignments on shared accounts.
- **Domains and global configuration:** domain settings, app config at domain or system scope, System Settings (image auto-pull, overlay network, scheduler).
- **Resource policies:** the `default` keypair, user and project policies, and any policy other accounts use.
- **Container registries**, and image operations (rescan, alias, forget, resource limits).
- **Resource groups in actual use:** scheduler options, default session and deployment options, fair share weights, allowed domains and projects.
- **Maintenance actions:** Recalculate Usage, Rescan Images, announcements.
- **Client IP masking policies, login client types, notification channels and rules.**
- **Presets other users can pick:** resource, deployment revision, runtime variant and Prometheus query presets not scoped to the test's own entity.

When unsure whether something is global, treat it as global.

## What to do instead

- **Read-only checks** of those pages: columns, filters, sorting, and opening a modal then cancelling.
- **Mocked responses** with `page.route`, as in `e2e/session/mocking/`, including mocking the mutation to test a create, edit or delete flow.
- **Entities the test itself created that can't affect anyone else**, such as the agent-less resource group in `e2e/agent-summary/agent-summary.spec.ts`. Name them with the `e2e-` prefix and clean them up.

## A dedicated RBAC role for one test

A role with its own test user, both created by the test, is not written by automation. A role shows up in every admin's list and can be left behind by a killed run, so whether the coverage is worth it is a human's decision, stated in the PR.

## When a flow can only be tested by changing global state

Don't write the test. Record the flow as not covered, with the reason, in the PR body or the job's result. Reviewers can then decide whether to test it some other way.

Existing specs that break this rule are not a pattern to copy.
