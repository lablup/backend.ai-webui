# Session history resource restore

<!-- wayfinder:map -->

Related: FR-3394 (https://lablup.atlassian.net/browse/FR-3394) — reported bug. The
issue also carries a second report (environment variable values disappearing);
that one was investigated and ruled out as intended behaviour, so it is out of
scope for this map. FR-3394 itself is left untouched.

## Destination

Pin down the rule that decides which resource values survive a "Start session
from recent history" restore, and land the patch that makes accelerator
selections (e.g. `fgpu`) survive it.

## Notes

- Domain: React session launcher (`react/src/pages/SessionLauncherPage.tsx`) and
  its resource form (`react/src/components/SessionFormItems/ResourceAllocationFormItems.tsx`).
- This map **overrides the plan-only default**: the destination includes the
  merged patch, not just the decision. Tickets that are decisions still resolve
  as decisions.
- Skills to consult: `react-form`, `react-url-state`, `react-hooks-extraction`,
  `use-effect-event` rule, `react-compiler-memoization` rule.
- Verification harness: `bash scripts/verify.sh`.
- Reproduction needs a live Backend.AI cluster with a fractional GPU slot
  (`cuda.shares`) available — see `webui-connection-info` skill.

### What is already known (do not re-derive)

The restore path:

```
performLaunch()                        SessionLauncherPage.tsx:437
  usedSearchParams = search            ← useLocation().search captured synchronously
  pushSessionHistory({ params })       :474  → localStorage
                                        ↑ URL is only refreshed by a 500ms
                                          debounced (trailing) sync at :254-280

SessionTemplateModal click             SessionTemplateModal.tsx:199-207
  URLSearchParams(record.params).get('formValues') → JSON.parse
SessionLauncherPage.tsx:1410-1450
  _.merge(reset defaults, formValue) → form.setFieldsValue → jump to review step
```

`environments.image` is deliberately stripped from the synced URL
(`SessionLauncherPage.tsx:262-268`), so a restore carries only
`environments.version`. `ImageEnvironmentSelectFormItems.tsx:393` re-resolves the
image asynchronously afterwards, which makes `currentImage`
(`ResourceAllocationFormItems.tsx:215`) change *after* the restored values are
already in the form.

Four sites can then rewrite `resource.accelerator` / `resource.acceleratorType`:

| Site | Fires when | Effect |
|---|---|---|
| `ResourceAllocationFormItems.tsx:605-609` | `allocationPreset === 'minimum-required'` | `updateResourceFieldsBasedOnImage(true)` — `force=true` skips the current-value comparison, so accelerator drops to the image minimum (usually 0) |
| `:547-591` | `allocationPreset === 'auto-select'` | picks the first allocatable preset and calls `updateResourceFieldsBasedOnPreset`, replacing accelerator |
| `:286-302` | `supportedAcceleratorTypesInRGByImage?.length === 0` | sets `resource.accelerator = 0` |
| `:348-367` | `acceleratorSlotsInRG[type]` unresolved | replaces `acceleratorType` with the first key |

Steps are hidden with `display: none`, not unmounted
(`SessionLauncherPage.tsx:1013-1018`), so `ImageEnvironmentSelectFormItems` stays
mounted and its effect does run after the jump to the review step.

## Decisions so far

<!-- one line per closed ticket -->

_none yet_

## Not yet specified

- The patch itself and its e2e regression coverage — shape depends on
  [Choose where the restore rule is enforced](tickets/choose-where-the-restore-rule-is-enforced.md).
- Whether the debounce staleness (history can store a pre-edit URL when Start is
  clicked within 500ms of the last change) is part of this bug or a separate one.
  [Instrument the restore path and catch fgpu being overwritten](tickets/instrument-the-restore-path.md)
  should split this.

## Out of scope

- Environment variable values disappearing on restore (the second report on
  FR-3394). Root cause confirmed: `sanitizeSensitiveEnv`
  (`react/src/components/EnvVarFormList.tsx:261-295`) blanks a value when the
  variable *name* substring-matches a sensitive pattern — `TIKTOKEN_CACHE_DIR`
  hits `/TOKEN/i`. Judged intended behaviour (false positive, not a defect) for
  now, so it is not on this route.
- The legacy Lit session launcher.
