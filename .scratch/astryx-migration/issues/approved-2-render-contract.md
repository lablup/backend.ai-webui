# approved-2 (amended) — the table cell-value contract is Astryx-native, the rc-table `dataIndex` quirk is NOT emulated

**Supersedes** the engine change shipped in the first cut of `approved-2`
("restore image path cell text, add bordered MetadataList variant").
**Direction:** the user, on reviewing that commit: *do not re-implement the antd
quirk in the engine — solve it within Astryx's native table contract instead.*
**Status:** ratified. The emulation is reverted; the call sites carry the fix.
**Evidence:** `.scratch/astryx-migration/shots/approved-2/*.png`; probes
`approved2-render-check.mjs`, `approved2-render-check2.mjs` (credentials read
from `LC_*` env vars, never committed), census `scan-render.py`.

---

## What the first cut did (and why it is now reverted)

R-3 in `REGRESSION-CATALOG.md` — the Environments `Full image path` column
rendering as a lone copy button with no path — was traced to `readDataIndex` in
`packages/backend.ai-ui/src/components/Table/BAITableAstryx.tsx` returning
`undefined` for a column that declares no `dataIndex`, where rc-table returns
the **whole record**:

```js
// rc-table/src/utils/valueUtil.ts
function getPathValue(record, path) {
  if (!path && typeof path !== 'number') return record;  // <- the whole row
  ...
}
```

The first cut fixed it *at the seam*: `readDataIndex` was taught to return the
record for a missing / empty `dataIndex`, so `render: (row) => …` call sites
recovered untouched, and the no-`render` fallback grew a guard so a
`dataIndex`-less column would not print `"[object Object]"`.

That is faithful to antd, and it is exactly what this migration should not do.
Reproducing a *quirk of the engine being retired* inside the engine replacing it
carries the old engine's accidents forward forever: every future reader of
`BAITableAstryx` has to know rc-table to predict what `render` receives, and the
type signature (`render: (value, record, index)`) keeps lying about the first
argument. The migration's whole premise is that Astryx's contract is the
contract.

## The contract, stated once

`render(value, record, index)` — nothing more.

- `value` is the cell value **read out of `dataIndex`**. A column with no
  `dataIndex` has no cell value, so `value` is `undefined`.
- The **record** is always the second argument. A computed column writes
  `render: (_value, row) => …`.

`readDataIndex` is back to its pre-`approved-2` body (`dataIndex == null →
undefined`), the `isMissingDataIndex` helper and the no-`render` guard are gone,
and the reason is recorded in a comment on `readDataIndex` so the emulation is
not "restored" by a future reader who finds the rc-table source first.

## Call sites (full census, not just the reported one)

A JSX-aware scan (`.scratch/astryx-migration/scan-render.py`) of `react/src` +
`packages/backend.ai-ui/src` for a **single-parameter `render` on a column
object that carries no `dataIndex`** returns exactly three production sites —
one more than the first cut's census found:

| Site | Column | Before | After |
|---|---|---|---|
| `react/src/components/ImageList.tsx:206` | `fullImagePath` (the reported R-3 bug) | `render: (row) =>` | `render: (_value, row) =>` |
| `react/src/components/CustomizedImageList.tsx:228` | `fullImagePath` (My Environments) | `render: (row) =>` | `render: (_value, row) =>` |
| `react/src/components/AdminUserCredentialList.tsx:599` | `allocation` (Users → Credentials) | `render: (record: Keypair) =>` | `render: (_value, record: Keypair) =>` |

The third was **missed** by the first cut's census, which searched for the
`(row)` spelling and reasoned about "everything else spreads `...column` with a
`dataIndex`". It is the same defect with a different parameter name, and under
the reverted engine it throws (`record.concurrency_used` on `undefined`) rather
than blanking — i.e. the emulation was hiding a live crash on the Credentials
tab, not just a blank cell. Verified live after the fix (see below).

`BAIArtifactTable`'s `controls` column already used `(_value, record)` from
W2-D; only its comment changed — it had been rewritten in the first cut to say
the idiom was *correct antd and the engine was wrong*, which is now backwards.

Everything else that reads a record inside `render` either takes it from the
second argument already, or sits on a column that carries a `dataIndex`.

## Tests

`packages/backend.ai-ui/src/components/Table/BAITableAstryx.cellValue.test.tsx`
was pinning the emulation. It now pins the **native** contract, deliberately in
both directions so neither behaviour can drift back in silently:

- the record is reachable through `render`'s **second** argument on a
  `dataIndex`-less column;
- the **first** argument on such a column is `undefined` — asserted explicitly,
  which is the test that fails the moment anyone re-adds the quirk;
- a column *with* `dataIndex` still receives the field value;
- the second argument is identity-equal to the `dataSource` entry;
- a column with neither `dataIndex` nor `render` prints nothing (not
  `"[object Object]"`);
- nested `dataIndex` paths still resolve.

6 tests, green.

## Kept from the first cut

Unchanged and still wanted — these were never about the quirk:

- `BAICopyableText` releasing `min-width` (mirrors `.bai-text-row` in `BAIText`)
  so the copy control cannot be shoved out of an Astryx cell, which is
  `white-space: nowrap; overflow: hidden`;
- the image-path column's `maxLines={1}` + Astryx's built-in truncation tooltip,
  matching the Digest column beside it;
- `BAIMetadataList` and its `bordered` variant, and its adoption in
  `KeypairResourcePolicyInfoModal`.

## Verification

- Live against `10.82.0.130` on the running dev server: `admin/environment`
  `Full image path` renders `cr.backend.ai/stable/python-tensorflow:2.15-…`
  with the copy button, truncated to one line (20 rows, no `pageerror`);
  `admin/users` → **Credentials** tab renders the `Allocation` column
  (`0 Sessions / 10000 Req per 15 min / 656 Queries`) with no error — the site
  the first cut's census missed. My Environments (`CustomizedImageList`) renders
  its header row; that backend has no committed images, so no row could be
  photographed — the column is line-for-line the `ImageList` one.
- `bash scripts/verify.sh` → `=== ALL PASS ===`.
- BUI 538 tests green, react 1170 tests green,
  `pnpm --filter backend.ai-ui build` clean.

## Follow-on for the rest of the migration

Any future table conversion that finds a cell rendering blank should check the
**call site's `render` signature first**, not the engine. The idiom is recorded
in `CONVERSION-IDIOMS.md` §2.
