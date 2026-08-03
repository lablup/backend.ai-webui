---
title: Instrument the restore path and catch fgpu being overwritten
type: wayfinder:task
mode: HITL
status: open
assignee:
blocked_by: []
---

# Instrument the restore path and catch fgpu being overwritten

## Question

Which of the four overwrite sites actually clears `resource.accelerator` on a
recent-history restore — and is the value even present in the saved params to
begin with?

## Why it is HITL

Needs a live cluster with a fractional GPU slot (`cuda.shares`) to create a real
session with fgpu and get a real history entry. See the `webui-connection-info`
skill for the dev server and endpoint.

## What to do

1. Create a session with a non-zero accelerator allocation, so a history entry is
   written by `pushSessionHistory` (`SessionLauncherPage.tsx:474`).
2. **Dump the saved params first.** Read
   `localStorage['backendaiwebui.settings.user.recentSessionHistory']` and check
   whether `formValues.resource.accelerator` / `.acceleratorType` /
   `.allocationPreset` are actually in there.
   - If they are **missing or stale**, this is a *save-side* defect and the
     debounce staleness (`SessionLauncherPage.tsx:254-280` writes the URL 500ms
     after the last change; `:437` captures `search` synchronously) is the
     prime suspect — record that and the map's "Not yet specified" entry about
     the debounce graduates into its own ticket.
   - If they are **correct**, it is a *restore-side* defect — continue.
3. Instrument the four sites listed in the map's "What is already known" table
   (`ResourceAllocationFormItems.tsx` `:605-609`, `:547-591`, `:286-302`,
   `:348-367`) — log entry, the value before, and the value after.
4. Click the history entry and capture the ordered log.

## Answer should record

- Save-side or restore-side (or both).
- Which site fires, in what order, and what `allocationPreset` was restored as —
  the preset value determines which of `:605-609` and `:547-591` is even
  reachable.
- Whether `currentImage` resolves before or after the offending write.
