---
title: Establish the blast radius across other fields and the URL-reload path
type: wayfinder:task
mode: AFK
status: open
assignee:
blocked_by:
  - instrument-the-restore-path
---

# Establish the blast radius across other fields and the URL-reload path

## Question

Is the accelerator the only casualty, or do `cpu` / `mem` / `shmem` /
`cluster_size` lose restored values the same way — and does a plain URL reload
(no history entry involved) reproduce it?

## Why it matters

It decides whether the fix is allowed to be accelerator-specific. If the same
mechanism eats `mem` and `cpu`, a patch that special-cases the accelerator is
the wrong shape and will leave the rest broken.

## What to do

Reuse the instrumentation from
[Instrument the restore path and catch fgpu being overwritten](instrument-the-restore-path.md)
— that is why this is blocked on it — and re-run for:

- each resource field written by `updateResourceFieldsBasedOnImage` and
  `updateResourceFieldsBasedOnPreset` (`ResourceAllocationFormItems.tsx:369-542`);
- a page reload on a `?formValues=...` URL, which reaches the same merge at
  `SessionLauncherPage.tsx:324-331` without going through
  `SessionTemplateModal`.

## Answer should record

The set of fields affected, and whether the reload path shares the defect. If it
does, the fix and its regression test must cover both entry points.
