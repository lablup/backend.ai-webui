# 05 — BAIFormItem 반입

**Target:** main
**Blocked by:** 01, 02
**Status:** done

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** 폼 비주얼을 antd CSS에서 독립시키는 BAIFormItem(자체 라벨/필수/에러 UI + Form.Item noStyle 엔진, 422 LOC — spike/astryx-form-split) 반입. NoStyleItemContext 에러 집계·이중 보고 방지 포함. 적용 확산은 페이지군 티켓에서.

## Acceptance criteria

- [x] 대표 폼 1개에서 동작 프로브 7종 동등 + 스크린샷 동등
- [x] antd CSS 제거 상태에서도 정상 렌더 재현
- [x] verify.sh ALL PASS

## Implementation notes

- **Component:** `react/src/components/BAIFormItem.tsx` + co-located
  `BAIFormItem.css` (P17). Spike prototype imported and adapted, not
  rewritten. Architecture unchanged: `BAIFormItem` (public, antd-shaped
  `FormItemProps` surface) → `<Form.Item noStyle help={false}>` state engine →
  `BAIFormItemBridge` (reads `Form.Item.useStatus()`, re-provides
  `NoStyleItemContext` for sub-item error aggregation, `help={false}` prevents
  double-reporting of nested BAIFormItems) → `BAIFormItemVisual` (pure
  presentational shell, exported separately for the future engine swap).
  Placed in `react/src/components/` per ticket direction; BUI relocation
  happens with the BUI re-basing phase.
- **Adaptations vs spike:**
  - Token values now resolve in 3 steps: `--bai-form-item-*` override hook →
    Astryx theme token (`--color-text-primary/-text-secondary/-error/-warning`,
    `--font-size-base`, `--spacing-2/-6` — all verified declared, P19) →
    antd-parity literal fallback (renders with zero providers).
  - `BAIFlex` dependency dropped (plain flex divs) so the visual layer's
    import graph is React + the antd engine only.
  - antd-parity layout mechanics measured against antd 6.5 and reproduced:
    vertical label→control gap is **8px** (answers/08 appendix said 4px —
    measured wrong), explain/extra blocks get `min-height: 24px`
    (controlHeightSM), and an `ant-form-item-margin-offset` equivalent
    (`margin-bottom: calc(-1 * margin)`) floats the explain block INTO the
    item margin — single-line errors cause no layout jump and the margin
    keeps collapsing with adjacent siblings (e.g. `Divider`).
- **PILOT-DECISION (in component header):** visual shell is hand-rendered,
  not Astryx `Field` — `Field.label` is a required *string* (378 ReactNode
  label sites), `Field.status` is single-message (we aggregate error lists),
  and the frontier policy keeps the public surface antd-shaped. Revisit at
  the form page-group tickets.
- **PILOT-DECISION (in component header):** inline styles + CSS custom
  properties, not `stylex.create()` — must render in harnesses without the
  StyleX compiler and with zero theme provider.
- **PILOT-DECISION (deferred):** `tooltip` renders the given node statically
  in the label's tooltip slot (antd wraps it in a hover `Tooltip` with a
  QuestionCircle icon). Hover behavior lands with rollout (candidate: Astryx
  Tooltip). No caller migrates in this ticket, so nothing regresses.
- **Harness:** `react/theme-probe/form.html` + `form.tsx` (served by the
  existing theme-probe Vite config, port 9198). Renders the representative
  form (lifted from `AutoScalingRuleEditorModal.tsx`: dependencies
  cross-validation, layout item + nested noStyle fields, async validator,
  shouldUpdate conditional mount, valuePropName, Form.List) side by side —
  antd `Form.Item` baseline vs `BAIFormItem` — inside the ticket-02 brand
  `Theme`, with `?strip=form|all` to delete antd's injected CSS post-mount.
- **Measurement:** `node .scratch/astryx-migration/shots/measure-05-form-item.mjs`
  (auto-starts/stops the harness server) — **21/21 PASS**:
  - 7 behaviour probes (answers/08 / spike `shoot.mjs` set) antd vs BAI
    deep-equal: reject shape, dependencies revalidation, Form.List nested
    paths, preserve:false unmount, async validator, setFields injection,
    isFieldsTouched/resetFields.
  - DOM: BAI column renders zero `Form.Item`-originated `.ant-form-*` DOM
    (only the 3 `<Form>`-root classes); rendered error texts identical (7).
  - Screenshot equivalence: label/error geometry within ±4px, error color
    identical (`rgb(255,77,79)`), form heights **exactly equal** (841/841,
    881/881), pixel diff **0.196%** (baseline) / **0.261%** (error state).
  - antd-CSS-removed (`strip=all`, 27 style tags dropped): BAI column keeps
    red required markers, red error texts, 24px rhythm, no label/error
    overlap — antd column collapses (`03-stripall-both.png`, the spike's
    `04-stripall` result reproduced).
  - Shots + `results.json` in `.scratch/astryx-migration/shots/05/`;
    `inspect-antd-item.mjs` is the DOM-inspection helper used to measure
    antd's margin-offset mechanics.
- **verify.sh:** `=== ALL PASS ===`.
- **Follow-ups for rollout tickets:** `.ant-form-item-has-error` selector
  dependency in `DeploymentAddRevisionModal.tsx:1031` →
  `[data-bai-form-item][data-status="error"]`; E2E `.ant-form-*` selector
  migration (82 sites, mapping table in answers/08 부록); antd pinned at
  6.5.0 (the `antd/es/form/context` deep import is the one unstable
  coupling — gone when the engine is reimplemented).
