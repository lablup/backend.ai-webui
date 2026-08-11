# FR-3482 — Ant Design → Astryx migration records

Durable decision records relocated from the migration working directory
(`.scratch/astryx-migration/`, deleted in FR-3488) after the migration merged
in #8626.

- `issues/` — wave plans, tickets, and PILOT-DECISION documents. Shipping
  source comments in `packages/backend.ai-ui/` and `react/` cite these by
  path; they record why a wrapper deliberately accepts-and-ignores a prop,
  why a behavior was dropped, or how a conversion idiom was chosen.
- `CONVERSION-IDIOMS.md` — antd-era → Astryx conversion recipes used during
  the migration; still useful when touching not-yet-idiomatic code.
- `RESPONSIVE-POLICY.md` — the responsive/breakpoint policy adopted for the
  migrated UI (referenced by the `react-layout` skill).

Ephemeral artifacts (QA ledger, regression catalog snapshots, probe scripts,
~1,500 screenshots) were deleted with FR-3488; see git history of #8626 if
they are ever needed.
