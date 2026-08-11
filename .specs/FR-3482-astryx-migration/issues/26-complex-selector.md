# 26 — ComplexSelector 코어 + BAISelect 기반

**Target:** to-astryx
**Blocked by:** 08
**Status:** done

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** spike/astryx-select의 무한스크롤(loadNext)+labelInValue 어댑터를 정식 BAISelect 기반으로 승격. 키보드 내비/ARIA는 합리 범위(단순성 정책), 가상화 유예.

## Acceptance criteria

- [x] Relay 페이지네이션 셀렉트 1종 실동(스크롤 로드 실측)
- [x] labelInValue 값 계약 보존 — Form.Item 연동 확인
- [x] verify.sh ALL PASS

## Implementation notes

### 산출물

| 경로 | 내용 |
|---|---|
| `packages/backend.ai-ui/src/components/BAIComplexSelect.tsx` | **코어.** Astryx `ComplexSelector` 위에 팝업 본문(검색 입력·옵션 리스트박스·스크롤 컨테이너·키보드/ARIA·푸터)을 직접 구현. 값 계약 = antd `labelInValue` |
| `packages/backend.ai-ui/src/components/fragments/BAIUserSelectAstryx.tsx` | **실증 소비자 1종.** Relay offset 페이지네이션 + 스크롤 `loadNext` + 서버 검색 + 선택값 label 해석 + single/multiple |
| `packages/backend.ai-ui/src/locale/*.json` (21개) | `comp:BAIComplexSelect.Search` / `.NoResults` — 21개 로케일 전량, 파리티 유지 |
| `react/theme-probe/select26.{html,tsx,-env.ts}`, `shoot26.mjs` | 실측 하네스(mock Relay 환경이 `offset`/`limit`에 따라 다른 페이지를 반환) |
| `.scratch/astryx-migration/shots/26/` | `measure-26.json` + 스크린샷 3장 + **ticket 27 CONVERSION-BRIEF.md** |

`BAISelect`(antd)와 기존 `*Select` 래퍼 22종은 **손대지 않았다** — 프런티어 규칙.
전량 이행은 ticket 27.

### 왜 ComplexSelector인가 (12번 티켓 결론의 실행)

Astryx의 4종 셀렉트는 이 저장소의 지배적 셀렉트 형태(Relay 커넥션 10개씩
페이지네이션 + 스크롤 로드 + 서버 검색 + labelInValue)를 **어느 하나도** 표현
하지 못한다. `Selector`/`MultiSelector`는 닫혀 있어도 전 옵션을 DOM에 마운트
하고 값에 label이 없다. `Typeahead`/`Tokenizer`는 label-in-value이지만
`SearchSource`가 결과를 **교체**하고 `maxMenuItems`로 하드 슬라이스하므로
`loadNext`가 붙을 곳이 없다. `ComplexSelector`만 팝업 본문을 render prop으로
돌려주므로 `onPopupScroll` 술어를 그대로 이식할 수 있다.

`BAISelect.handlePopupScroll`의 술어
(`scrollHeight - scrollTop - clientHeight <= atBottomThreshold`)와 **엣지
트리거**(바닥 진입 순간에만 1회 발화) 동작을 문자 그대로 옮겼다.

### 실측 (headless Chromium, `.scratch/astryx-migration/shots/26/measure-26.json`)

`?case=relay` — `BAIUserSelectAstryx`, 57개 사용자, 페이지 10개:

```
A_initialRows        10
A_rowsAfterScroll    [20, 30, 40, 50, 57, 57]     ← 바닥 도달 6회
A_pageFetches        ["0/10","10/10","20/10","30/10","40/10","50/10"]
A_hasActiveDescendant true
A_valueAfterKeyboardEnter  "probe-user-002@backend.ai"  ← ↓↓ + Enter = 3번째 행
consoleErrors []   pageErrors []
```

`?case=form` — antd `Form` + `BAIFormItem` + `BAIComplexSelect`:

```
B_initialFormValue           {"owner":{"label":"Option 3","value":"opt-3"}}
B_triggerShowsInitialLabel   "Option 3"
B_formValueAfterSingleSelect {"owner":{"label":"Option 5","value":"opt-5"}}
B_formValueAfterMultiSelect  ...,"reviewers":[{"label":"Option 1","value":"opt-1"},
                                              {"label":"Option 2","value":"opt-2"}]
B_submittedPayload           (동일 — onFinish 페이로드 무변경)
```

즉 **`getValueProps`/`normalize` 없이** `Form.Item`/`BAIFormItem`의 clone-with-props
계약을 통과한다. mutation 페이로드 형태도 antd `labelInValue`와 동일.

### PILOT-DECISIONs

| # | 결정 |
|---|---|
| **P26-1** | **가상화 유예(확정).** 로드된 옵션 1개당 DOM 행 1개. 경계를 지키는 것은 페이지네이션 창(10–20행)뿐 — 그래서 무한스크롤 UX를 "검색어당 상위 N"으로 바꾸지 않은 결정이 여기서 값을 한다. ticket 27은 페이지네이션을 **절대 제거하지 말 것**. |
| **P26-2** | **키보드/ARIA는 합리적 부분집합.** 구현: ↓로 열기(ComplexSelector 자체), ↑/↓/Home/End 로빙 하이라이트, Enter 선택, Escape 닫기(popover), `role="listbox"`+`role="option"`+`aria-selected`+검색 입력의 `aria-activedescendant`, 하이라이트 `scrollIntoView`, 카운트 polite live region. **드롭:** 인쇄 문자 타입어헤드(검색창이 대체), PageUp/PageDown, shift+화살표 범위 선택, 트리거↔리스트박스 combobox 결합(ComplexSelector가 popover를 `role="dialog"`로 고정 — dialog 안의 listbox 구조로 남음). |
| **P26-3** | **`label`은 `string`으로 좁힌다.** antd `optionRender`/`labelRender`의 ReactNode label은 복원하지 않는다. 리치 콘텐츠는 `description`/`extra` 슬롯으로 분리. Astryx가 트리거 텍스트·접근성 이름·live region에 문자열을 요구하기 때문. |
| **P26-4** | **트리거 칩은 표시 전용.** `ComplexSelector`가 `triggerLabel`을 자기 `<button>` 안에 렌더하므로 `Token onRemove`는 button-in-button(잘못된 HTML)이 된다 — 실제로 프로브에서 React 경고 2건으로 관측되어 제거했다. 선택 해제는 옵션 행 재클릭. `tagRender`도 없음. |
| **P26-5** | 래퍼는 `useControllableValue`(ahooks)를 유지 — controlled/uncontrolled 양쪽 호출부에 드롭인. |
| **P26-6** | `open ? 'network-only' : 'store-only'` fetchPolicy 스위치는 **살아남는다.** `ComplexSelector`가 감추는 open 상태를 `BAIComplexSelect.onOpenChange`가 되꺼내 준다(팝업 서브트리는 native `popover`로 숨겨질 뿐 항상 마운트되므로 양쪽 엣지가 모두 관측된다). 단 **읽기 전용** — 팝오버를 밖에서 열 수는 없다. |
| **P26-7** | `notFoundContent={<Skeleton.Input/>}` 첫 로드 플레이스홀더 드롭. 이행된 표면에 antd를 다시 끌어들이지 않기 위해 공용 "No results" 텍스트로 통일. |
| **P26-8** | `allowClear`, 제어 `open`, `ref.focus()` 드롭. 래퍼는 기존 `refetch` ref만 유지. |

### 프런티어 (전환하지 않음)

- `BAISelect.tsx`(antd) 및 `*Select` 래퍼 22종 — ticket 27.
- `mode="tags"` 12개 호출부 — `Tokenizer`(`hasCreate`)행이고 ticket 27이
  선언한 18종(재작성 필요 래퍼)에 포함되지 않는다. CONVERSION-BRIEF §2-D 참조.
- 정적 옵션 소형 셀렉트 — 이미 `AstryxFormSelector`/`AstryxFormMultiSelector`
  (ticket 18/20)가 소관. 경계선은 MAPPING §3.1 그대로.

### ticket 27 이행 레시피

`.scratch/astryx-migration/shots/26/CONVERSION-BRIEF.md` 에 전문.
요지: (A) Relay 페이지네이션·name 값 — `BAIUserSelectAstryx.tsx`를 복사하고
`graphql` 태그 2개·`keyOfNode`·`options` 매퍼·placeholder 키 **4곳만** 교체.
(B) id 값 — `keyOfNode`만 `toLocalId(node.id)`. (C) `usePaginationFragment`
(현재 `BAIAdminResourceGroupSelect` 1종) — `endReached`→`loadNext(pageSize)`.
(D) `mode="tags"` — `BAIComplexSelect` 대상 아님. (E) 정적 옵션 —
`AstryxFormSelector` 유지.

**절대 놓치면 안 되는 것:** 선택값 label 해석 쿼리는 antd에서는 *편의*였지만
Astryx에서는 **필수 인프라**다. 트리거가 label을 값에서 읽고, 1페이지에서 고른
값은 `loadNext` 이후 `options`에서 사라지기 때문. 래퍼들은 이미 이 쿼리를
갖고 있으니 지우지 말 것.
