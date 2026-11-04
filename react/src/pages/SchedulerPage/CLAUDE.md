# SchedulerPage

- Route: `/admin/scheduler` (menu "Scheduler"), superadmin only.
- Fair share scheduling: a step view across resource group, domain, project and user, with weight settings and usage buckets (`components/FairShareItems/`).
- Project-agnostic admin page (ADR 0001): `react/eslint.config.js` bans reading the ambient current project anywhere in this folder.
