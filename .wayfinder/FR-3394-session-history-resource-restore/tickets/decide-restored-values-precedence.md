---
title: Decide whether restored resource values outrank image-derived defaults
type: wayfinder:grilling
mode: HITL
status: open
assignee:
blocked_by: []
---

# Decide whether restored resource values outrank image-derived defaults

## Question

When a restored configuration and the launcher's own derivation logic disagree
about a resource value, which one wins — and does the answer change per case?

## Why this is not obvious

"Restored values always win" is the intuitive answer and it fixes the reported
symptom, but it is not obviously right. The derivation exists because the world
moves under a saved config: images get rebuilt, resource groups get
reconfigured, presets get edited. Silently preserving a stale value can produce
a session that simply fails to launch, which is a worse failure than a reset
field the user can see.

## Cases to settle

1. The saved image no longer advertises the saved accelerator type
   (`supportedAcceleratorTypesInRGByImage` is empty for it) — keep the value and
   let the launch fail, reset to 0, or keep it and surface a warning?
2. The saved `allocationPreset` is a **named preset** whose definition has since
   changed — does restore mean "the preset called X" (re-derive from today's
   definition) or "the numbers I ran last time" (pin raw values)?
3. The saved config is below the image's stated minimum — the current
   `updateResourceFieldsBasedOnImage` raises values to the minimum. Should
   restore still do this? (Probably yes; confirm.)
4. Unified-memory accelerator slots deliberately clear
   `resource.accelerator` (`syncUnifiedAcceleratorIfNeeded`,
   `ResourceAllocationFormItems.tsx:337-346`) — restore must not fight this.
5. Does the answer differ between the two entry points that share this code —
   clicking a history entry, and loading a shared/reloaded URL with
   `formValues`?

## Answer should record

A single invariant sentence that a future session can implement against, plus
the per-case exceptions to it.

## Not blocked

Deliberately unblocked: the invariant can be argued before knowing which code
site misbehaves. Runs in parallel with
[Instrument the restore path and catch fgpu being overwritten](instrument-the-restore-path.md).
