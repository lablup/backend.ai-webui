---
title: Choose where the restore rule is enforced
type: wayfinder:grilling
mode: HITL
status: open
assignee:
blocked_by:
  - instrument-the-restore-path
  - decide-restored-values-precedence
  - establish-the-blast-radius
---

# Choose where the restore rule is enforced

## Question

Given the invariant from
[Decide whether restored resource values outrank image-derived defaults](decide-restored-values-precedence.md)
and the failing site from
[Instrument the restore path and catch fgpu being overwritten](instrument-the-restore-path.md),
where in the form lifecycle should the rule live?

## Candidates

1. **Force `allocationPreset: 'custom'` on restore** — narrowest. Restoring the
   raw numbers as a custom allocation sidesteps both preset-driven effects
   (`:547-591`, `:605-609`). Cheap, but it silently discards the fact that the
   user originally picked a named preset, and it does nothing for `:286-302`.
2. **A restore-mode guard** — a flag that suppresses derivation effects until the
   image has resolved, then releases. Directly models "these values are already
   final", but adds a state machine to a form that currently has none, and every
   derivation effect has to learn about it.
3. **Resolve `environments.image` synchronously** — persist enough in the URL
   (or resolve before `setFieldsValue`) that derivation runs once with correct
   inputs instead of racing. Removes the race rather than papering over it, but
   `environments.image` was stripped from the URL on purpose
   (`SessionLauncherPage.tsx:262-268`); understand why before undoing it.
4. **Per-field "user-set" marking** — derivation only overwrites fields it owns.
   The most general answer and the largest change.

## Answer should record

The chosen option and, explicitly, why the rejected ones distort the invariant
more. Then graduate the patch and its e2e regression coverage out of the map's
"Not yet specified" into a ticket.
