---
name: astryx-qa-finding
description: >
  Turn a raw Astryx-migration QA observation ("this looks wrong", a screenshot,
  "the sider is clipped") into a well-formed, de-duplicated finding row in
  `.scratch/astryx-migration/QA-FINDINGS.md`. Covers surface capture, the
  legacy oracle (`git show origin/main:<path>`), live measurement, the
  T/L/C/F fix-mechanism classes, severity, the four-way duplicate check
  against the catalog / fix docs / PILOT-DECISIONs / idioms, and when a
  finding is promoted to Jira instead. Use whenever someone reports a visual
  or behavioural regression on the `to-astryx` branch, or when doing a QA
  sweep of migrated screens. Implement the finding with the
  `astryx-migration-fix` skill.
---

# Astryx migration — QA finding intake

The `to-astryx` branch replaced Ant Design with Astryx across the whole app.
QA on it is a loop: **observe → measure → classify → de-duplicate → file →
fix**. This skill owns everything up to *file*; `astryx-migration-fix` owns
*fix*.

A finding filed without measurement is worse than no finding. Two of the audit
diagnoses that *sounded* obvious were simply wrong about the mechanism —
"Configurations should be switches" (legacy was a **checkbox**, and the real
defect was a `direction="column"` wrapper, `SWEEP-FIXES.md` §D) and "the
buttons are not joined" (`ButtonGroup` *was* in place; the primary child was an
antd button that could not read Astryx's context, `POLISH-2.md` §C). Both would
have produced a wrong fix if taken at face value.

---

## 0. Where findings live, and why

| Destination | What goes there |
|---|---|
| **`.scratch/astryx-migration/QA-FINDINGS.md`** | **Default.** Every new QA observation on `to-astryx`. Open, running ledger; rows are appended and marked `FIXED` in place. |
| **Jira (`FR` project)** → GitHub by webhook | Only on *promotion*: the finding will outlive the branch (deferred past the `to-astryx` merge), needs a design/product decision, or belongs to another team. |
| `REGRESSION-CATALOG.md` | **Never appended to.** |
| `issues/*.md`, `CONVERSION-IDIOMS.md` | Never — those are inputs, see §4. |

**Why a separate ledger and not `REGRESSION-CATALOG.md`.** The catalog is a
*dated, pinned audit artifact*: it names the branch SHA it audited, the
baseline it diffed against, the viewport, and it carries a reproduction
procedure (§6) that regenerates its own numbers. Appending live findings to it
destroys exactly that property — a reader can no longer tell which rows the
audit measured and which were bolted on later, and re-running §6 would no
longer reproduce the document. It stays frozen and is *cited* by ID instead.

**Why not Jira first.** The repo rule (`fw:jira-github-bridge`) is that
follow-up issues are authored in Jira and webhook-cloned to GitHub — never
hand-created on GitHub. That rule holds, and applies the moment a finding is
promoted. But the migration QA loop mostly files and fixes inside one session
on an unmerged branch; a Jira round-trip per finding costs more than the fix
and produces tickets that are closed before anyone reads them. So the ledger is
the working surface and Jira is the *escape hatch* for anything that survives
the branch.

**Promotion is one-way and recorded.** When a row is promoted, put the key in
its `Status` cell (`PROMOTED FR-1234`) and keep the row. Create the issue with
the `fw:jira-workflow` skill against `.jira.config` (project `FR`); do not
create a parallel GitHub issue — the webhook clones it, and a hand-made one has
to be closed as a duplicate.

### Ledger format

`QA-FINDINGS.md` uses the **same seven columns as the catalog's finding tables**
so a row can be moved or cited without reshaping:

```markdown
| # | What / where | Legacy expected | Measured current | Class | Sev | Status / fix |
```

IDs are `Q-<n>`, allocated sequentially, never reused. `Q-` deliberately does
not collide with the catalog's own prefixes: `G-` global tokens, `S-` app
shell, `T-` table pages, `O-` overlays, `F-` forms & controls, `R-` per-route.

> Watch the letter collision: in the **Class** column `F` means *sibling agent
> in flight*, while `F-1` in the **#** column means *forms & controls finding
> 1*. They are unrelated.

If `QA-FINDINGS.md` does not exist yet, create it with this header:

```markdown
# Astryx migration — running QA findings

Live ledger for QA on `to-astryx`, in the finding format of
`REGRESSION-CATALOG.md` §0 (fix-mechanism class T/L/C/F, severity High/Med/Low).
The catalog is a frozen audit; this file is open. Rows are appended, then
marked `FIXED <sha>` or `PROMOTED FR-####` in place — never deleted.

Intake procedure: `.claude/skills/astryx-qa-finding/SKILL.md`.
Fix procedure: `.claude/skills/astryx-migration-fix/SKILL.md`.

| # | What / where | Legacy expected | Measured current | Class | Sev | Status / fix |
|---|---|---|---|---|---|---|
```

---

## 1. Capture the surface

A finding is worthless without a reproducible address. Record all of:

- **Route** — the URL path as the app renders it (`/admin/users`,
  `/session/start`, …). If the surface is scope-dependent, say which scope
  (project / project-admin / admin) — the audit found tokens that differ
  between scopes (`T-5`).
- **Overlay** — modal / drawer / menu / toast / tooltip, plus the *exact*
  deterministic selector that opens it. Overlays are the surface class most
  often described ambiguously.
- **Mode** — light, dark, or both. Never assume; several defects existed in
  only one mode (`G-4` hover is invisible only in dark; the header-dropdown
  `MediaTheme` bleed looked broken only in light, `issues/p3-w3b.md`).
- **Viewport** — the audit baseline is **1600×1000**. A layout complaint at
  another width is a different finding.
- **Component / file** — the actual call site, found by grep, not guessed.

---

## 2. Get the legacy value — `origin/main` is the oracle

antd is gone from this branch, so the legacy build **cannot be run**. The
legacy value is *derived*, and there are exactly three legitimate sources:

1. **`git show origin/main:<path>`** — the pre-migration source of the same
   component. This is the primary oracle. It tells you what the component
   actually rendered, which is how the checkbox-vs-switch and the
   `Input width:100%`-as-flex-item questions were settled
   (`SWEEP-FIXES.md` §D, `POLISH-3.md` §5).
2. **The measured antd parity tables** —
   `packages/backend.ai-ui/src/theme-shim/antdParity.ts` (`ANTD_ALIGN_TOKENS`,
   `ANTD_DARK_ALGORITHM_OUTPUT`, `ANTD_BOX_SHADOW_SECONDARY`),
   `selfTokens.ts`, and the operator seeds in `resources/theme.json`. These are
   measured `theme.getDesignToken()` captures, not recollections.
3. **antd 6.5.0's own formulas** for a token neither of the above carries —
   state the derivation in the row.

Never write "legacy was probably…". If you cannot derive it, say
`legacy: UNKNOWN` in the row and mark the finding **Low** until someone can.

---

## 3. Measure the current value live

Static reading is not evidence. Run the app and measure.

- Dev server + credentials: see the **`dev-server`** and
  **`webui-connection-info`** skills. Do not restate endpoints here. The audit
  ran vite directly on a fixed port against the shared test cluster.
- Log in once and persist Playwright storage state, then reuse it —
  `.scratch/astryx-migration/audit1-login.mjs` is the reference; `qa2b-lib.mjs`
  is a small reusable `launch()` / `login()` / `shotOf()` helper.
- **Dark mode must be entered through the header `Dark mode` button**, not by
  setting `colorScheme` alone — the button is the `useThemeMode` path the app
  actually ships. Then assert it took:

  ```js
  await page.getByRole('button', { name: /^dark mode$/i }).first().click();
  const t = await page.evaluate(() => document.documentElement.dataset.theme);
  if (t !== 'dark') throw new Error('theme toggle did not take');
  ```

- **Wait for skeletons to clear before capturing.** The first audit pass caught
  23 of 38 routes mid-skeleton and had to be thrown away; `audit1-sweep.mjs`
  carries the settle loop — reuse it.
- Capture `getBoundingClientRect()` + the specific `getComputedStyle()`
  properties in question, in **both** modes. Record numbers, not adjectives.
- Screenshots go to `.scratch/astryx-migration/shots/<topic>/` as
  `{before,after}-<surface>-{light,dark}.png`.
- Watch `pageerror` / `console.error` while probing — zero page errors is part
  of the baseline (`REGRESSION-CATALOG.md` §4).
- **Read-only.** Open overlays with explicit selectors and dismiss with
  `Escape`. Never click OK / Confirm / Delete, never fire a mutation against the
  shared cluster.
- Credentials live only in gitignored `.env.development.local`; the Playwright
  storage state (`*-state.json`) is gitignored and must not be committed.

---

## 4. De-duplicate BEFORE writing the row

Four sources, four different verdicts. Check all four — this is the step that
keeps the ledger useful.

```bash
# 1. already catalogued? (68 findings, frozen audit)
grep -in "<keyword>" .scratch/astryx-migration/REGRESSION-CATALOG.md

# 2. already fixed once? -> this is a REGRESSION of a fix, not a new defect
grep -rin "<keyword>" .scratch/astryx-migration/{SWEEP-1,SWEEP-FIXES,POLISH-2,POLISH-3,SIDER-FIXES,DARK-MODE-FIX}.md

# 3. deliberately dropped? -> PILOT-DECISION, needs a design ticket, not a bug
grep -rin "<keyword>" .scratch/astryx-migration/issues/
grep -rn "PILOT-DECISION" react/src packages/backend.ai-ui/src

# 4. already has a ratified recipe? -> not a finding, a misapplication
grep -in "<keyword>" .scratch/astryx-migration/CONVERSION-IDIOMS.md \
                     .scratch/astryx-migration/RESPONSIVE-POLICY.md

# 5. the open ledger itself
grep -in "<keyword>" .scratch/astryx-migration/QA-FINDINGS.md
```

Verdicts:

| Hit in | Verdict |
|---|---|
| `REGRESSION-CATALOG.md` | **Duplicate.** Do not add a row. If you measured something new, add the numbers to the *existing* `QA-FINDINGS.md` row that tracks it, or open one citing the catalog ID (`Q-7 (tracks G-3)`). |
| a fix doc (`POLISH-*`, `SWEEP-*`, `SIDER-FIXES`, `DARK-MODE-FIX`) | **Regression of a landed fix.** File it, severity **at least Med**, and name the doc + section in `What / where`. Regressions matter more than fresh defects because something un-did verified work — a stale built theme artifact is the usual culprit (see `astryx-migration-fix` §Traps). |
| an `issues/*.md` PILOT-DECISION | **Not a bug.** A capability was dropped on purpose with reasoning. Either accept it or promote a *design-change* request to Jira. Do not "fix" it silently — check `CONVERSION-IDIOMS.md` first, because a ratified idiom can supersede a PILOT-DECISION (idiom §1 superseded ticket 22's). |
| `CONVERSION-IDIOMS.md` / `RESPONSIVE-POLICY.md` | **Misapplied recipe**, not a missing capability. File it as **L** (layout composition) pointing at the recipe that was not followed. |
| `REGRESSION-CATALOG.md` §4 ("What did NOT regress") | **Sanctioned parity.** The value was measured as *correct*. Re-measure before filing; if your number disagrees with §4, that itself is the finding. |
| nothing | New. Write the row. |

Also check §1.3 of the catalog: if your finding is closed by a token pin
already ranked there, say so — it changes the fix from "a change" to "one more
symptom of pin #N", and pins close 3–4 symptoms each.

Finally, before promoting anything to Jira, search Jira for an existing FR
(`fw:jira-workflow`). The webhook clones Jira → GitHub, so a GitHub-side search
alone can miss a just-filed ticket.

---

## 5. Classify the fix mechanism (T / L / C / F)

Same four classes as `REGRESSION-CATALOG.md` §0. The class decides *who fixes
it and where*, so getting it right is most of the value of the row.

| Class | Meaning | Lands in |
|---|---|---|
| **T** | An Astryx **theme** setting — a `defineTheme()` token or a `components: {}` block. One edit, global effect. | `react/src/astryx-theme/backendAiTheme.ts`, `packages/backend.ai-ui/src/theme-shim/antdParity.ts` |
| **L** | **Layout composition** with Astryx primitives (`Layout` / `LayoutPanel` / `Grid` / `Toolbar` / `BAIFlex` gap) at the call site. | the page / component call site |
| **C** | **Component-level code** — structure, a new prop, conditional logic. | the BUI or app component |
| **F** | Already **in flight** elsewhere. Record the measurements for the owner; do not analyse deeply. | — |

Compound classes are allowed (`T / C`, `C / L`); count under the **primary** one
— the one doing most of the work.

**Decision order — always try T first.** In the audit, 26 of 68 findings (38%)
were theme-primary and carried 7 of the 19 High items. A token pin is one edit
with an app-wide effect; a call-site fix is N edits with N chances to drift. Ask
in order:

1. Is there an Astryx **token or `components:` block** that expresses this?
   → **T**. (Symptoms across many unrelated surfaces are the tell: colour ramps,
   type scale, radius, line-height, elevation, control heights.)
2. Can it be expressed as **props on the existing Astryx components** or a
   different **composition** of them? → **L**. Run
   `pnpm exec astryx component <Name>` / `astryx search "<thing>"` /
   `astryx template --list` before concluding a capability is missing — the
   vertical-tabs idiom exists precisely because a component-level lookup said
   "impossible" while a *page template* did it (`CONVERSION-IDIOMS.md` §1).
3. Only then → **C**.

### Severity

- **High** — broken layout, illegible or unreachable content, or a brand /
  identity signal that is simply gone.
- **Med** — noticeably off against legacy; a user who knew the old UI spots it.
- **Low** — minor drift, visible only side by side.

Reachability beats aesthetics: `S-1` (sider clipped, last two admin items
unreachable at 1000px) is High; a 4px radius drift is Low even app-wide.

---

## 6. Write the row

```markdown
| **Q-12** | Sider "Model Store" icon overflows its 16px box on every admin route (`packages/backend.ai-ui/src/icons/iconShim.tsx`), light + dark, 1600×1000 | `origin/main:react/src/components/BAISider.tsx` renders it at 16×16 inside the rail | measured `24×24`, overflowing the row box by 8px; `shots/sider/before-modelstore-light.png` | **C** | Med | open |
```

Rules for the row:

- **Bold the ID.** One row per *defect*, not per symptom — if one token pin
  closes four symptoms, that is one row listing them.
- `What / where` names the **file**, the **route(s)**, the **modes**, and how
  many surfaces are affected ("14 of 15 table routes, both modes" is what made
  `T-1` rank first).
- `Legacy expected` and `Measured current` are **numbers with units**, split
  `light / dark`. Include the artefact path (screenshot, probe JSON).
- `Status / fix` starts as `open` and carries the *suggested* mechanism when
  known; it becomes `FIXED <sha>` or `PROMOTED FR-####` later.
- Keep the whole row on one line — the catalog tables are one-line rows and
  mixed styles break `grep`-based dedup.

Then reply to the reporter with: the ID, the class, the severity, the
duplicate verdict, and the one-line mechanism. Not a wall of measurements.

---

## Related

- `astryx-migration-fix` — the standing rules for actually fixing a finding.
- `dev-server`, `webui-connection-info` — how to run the app and log in.
- `.scratch/astryx-migration/REGRESSION-CATALOG.md` — the frozen 68-finding
  audit; §0 defines the classes, §1.3 the token pins, §4 what is sanctioned,
  §6 how to reproduce the probes.
- `.scratch/astryx-migration/CONVERSION-IDIOMS.md`,
  `RESPONSIVE-POLICY.md` — ratified recipes; check before calling something
  impossible.
- `fw:jira-workflow`, `fw:jira-github-bridge` — for promoted findings only.
