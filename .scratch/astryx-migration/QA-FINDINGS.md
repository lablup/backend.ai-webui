# Astryx migration — running QA findings

Live ledger for QA on `to-astryx`, in the finding format of
`REGRESSION-CATALOG.md` §0 (fix-mechanism class **T** theme / **L** layout
composition / **C** component work / **F** in flight elsewhere; severity
High / Med / Low).

The catalog is a **frozen** audit — it pins the branch SHA, the baseline, the
viewport, and carries a reproduction procedure (§6) that regenerates its own
numbers. Appending to it would destroy that. This file is the open one: rows
are appended, then marked `FIXED <sha>` or `PROMOTED FR-####` in place — never
deleted, so a re-opened defect is visible as a second row citing the first.

- Intake, measurement and de-duplication: `.claude/skills/astryx-qa-finding/SKILL.md`
- Implementation and verification: `.claude/skills/astryx-migration-fix/SKILL.md`

IDs are `Q-<n>`, sequential, never reused. They do not collide with the
catalog's prefixes (`G-` global tokens, `S-` app shell, `T-` table pages,
`O-` overlays, `F-` forms & controls, `R-` per-route). A row that tracks a
catalog finding cites it: `Q-7 (tracks G-3)`.

Baseline for every measurement unless the row says otherwise: viewport
**1600×1000**, both modes, dark entered through the header `Dark mode` button
with `document.documentElement.dataset.theme` asserted `dark`. Legacy values
are derived from `git show origin/main:<path>`, the measured parity tables in
`packages/backend.ai-ui/src/theme-shim/`, or antd 6.5.0's own formulas — the
legacy build cannot be run on this branch.

| # | What / where | Legacy expected | Measured current | Class | Sev | Status / fix |
|---|---|---|---|---|---|---|
| **Q-1** | **Typing into any `rules`-bearing field loses focus after the FIRST character** (`react/src/components/astryxFormControls.tsx`, `useFormControlStatusProps`). Reported on the login endpoint field (`LoginFormPanel.tsx` `api_endpoint`, rule `pattern:/^https?:\/\//`), but the mechanism is app-wide: every Astryx control built on `Field` (TextInput, TextArea, NumberInput, Selector, MultiSelector, RadioList, Tokenizer). Light + dark, 1600×1000 | antd's controls read `FormItemInputContext` and repainted in place; the `<input>` node was never replaced, so focus and the caret survived validation | char 1 lands, then the `<input>` DOM node is REPLACED (tagged-node probe: `tagPresent:false`) and `document.activeElement` falls back to `<body>`; chars 2..n go nowhere — value froze at `"h"` after typing `http://abc`. Mechanism: the hook returned `{}` while pristine and `{statusVariant:'detached'}` on error, and Astryx `Field` wraps `{children}` in an extra `<div>` only when `statusVariant==='attached'` (its default) → element-structure swap → React unmount/remount. `.scratch/astryx-migration/qa3-remount-trace.mjs` shows `astryx-field` removing `DIV#A2` and adding a fresh `astryx-text-input` | **C** | **High** | FIXED — `statusVariant` pinned constant `'detached'`; `Switch`/`CheckboxInput` (not `Field`-based, no `statusVariant` prop) moved to a new `useFormControlStatusOnly()`. Regression test: `astryxFormControls.parity.test.tsx` › "the control is not remounted when its status changes" (2 cases; both fail on the old hook) |
| **Q-2** | **Login screen rhythm** — the modal body is padded twice (`react/src/components/LoginFormPanel.tsx`), the logo overflows its header line box, and the "Advanced" disclosure link inherits the dialog's 16px base. Light + dark, 1600×1000 | antd 6.5.0 oracle (rebuilt outside the repo from `origin/main`'s markup + `BAIModal`'s style defaults + `resources/theme.json` seeds): dialog **400×295**, form **352** wide at **24px** from each edge, form top **81**, bottom pad **20**, logo top **19**, logo→form **27**, Advanced link **14px/22px** | before: dialog **400×324**, form **304** wide at **48px** (Astryx `LayoutContent` already pays the 24px, so `styles.body={padding:paddingLG}` became additive), form top **87**, bottom pad **40**, logo top **12** (35px `<img>` inline in a 27px line box), logo→form **40**, Advanced link **16px/24px**. `/tmp/login-before-light.json` vs `/tmp/oracle-light.json` | **L** | **High** | FIXED — drop `styles.body` padding (the layout slot owns it); logo title becomes a flex row + `marginTop: var(--spacing-1)` to reclaim `DialogHeader`'s text-optical `marginBlock:-4px`; `Link isStandalone` and `Text type="inherit"`. After: 400×292 / 352 @ 24 / top 79 / bottom 16 / logo top 16 / logo→form 28 / 14px/21.9996px — every box within 4px of legacy |
| **Q-3** (regresses `issues/p3-w3b.md` §D1) | **Every floating surface the header band opens is pinned dark in BOTH modes** (`react/src/components/BAINotificationButton.tsx`, `UserDropdownMenu.tsx`). `MediaTheme mode="dark"` wraps the whole `Tooltip` / `DropdownMenu`, but both render trigger and `[popover]` panel as SIBLINGS, so the panel inherits `color-scheme: dark` + the on-dark tokens. Light + dark, 1600×1000 | legacy `ReverseThemeProvider` inverted against the app mode; QA directive is stronger — band chrome on-dark, floating surfaces resolve the APP mode (as `ProjectSelect`'s panel already does) | bell tooltip `bg rgb(255,255,255)` with `--color-text-primary` forced `#ffffff` → the `]` `Kbd` is **white on white in both modes** (Astryx's tooltip surface is deliberately inverted, so the forced scheme flipped it to white); user menu `bg rgb(48,48,48)` / white text in LIGHT mode. `/tmp/header-before-{light,dark}.json` | **C** | **High** | FIXED — on-dark context moved onto the trigger element (`data-astryx-media="dark"`, which IS what `MediaTheme` renders; `BaseProps` admits `data-*`), tooltip CONTENT wrapped in `MediaTheme mode={opposite of app}` per `SIDER-FIXES.md` §2. After: tooltip `rgb(20,20,20)`/white in light, `rgb(255,255,255)`/`rgb(23,23,23)` in dark; user menu `rgb(255,255,255)`/`rgb(20,20,20)` in light, `rgb(48,48,48)`/white in dark; band `rgb(255,255,255)` on `rgb(255,151,41)`/`rgb(232,138,40)` unchanged; the three user-menu dialogs still page-mode (p3-w3b holds) |
