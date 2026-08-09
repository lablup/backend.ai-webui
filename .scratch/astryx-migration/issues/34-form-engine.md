# 34 — Form 엔진 구현 + 드롭인 교체

**Target:** to-astryx
**Blocked by:** 31, 32, 33
**Status:** **LIVE** — unparked, localized and switched on 2026-08-09 (see
"UNPARKED" below). Parked 2026-08-08 → 2026-08-09 only.

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** 수용 테스트 29건(Session Launcher, answers/08의 file:line)을 antd 기준으로 먼저 그린 확인 → 자체 엔진(1,320–1,720 LOC, 실사용 13메서드+rule 9종만) 구현 → Form/Form.Item/FormInstance 드롭인 교체. 호출부 109파일 불변이 검증 기준.

## UNPARKED — 자체 엔진으로 전환 완료 (2026-08-09)

아래 "PARKED" 절은 **2026-08-08~09 하루 동안의 상태**를 기록한 것이다. 그
파킹은 해제됐다. 지금 앱은 자체 엔진 위에서 돈다.

### 무엇을 뒤집었나 — 다시 별칭 한 겹

리버트가 별칭 한 겹이었던 것과 정확히 대칭으로, 복구도 별칭 한 겹이다. 115개
파일의 `from '../form-engine'` 임포트는 **또 한 줄도 바뀌지 않았다.**

| 파일 | 파킹 중 | 지금 |
|---|---|---|
| `packages/backend.ai-ui/src/form-engine/index.ts` | antd 재수출 | `export * from './engine'` (+ default) |
| `react/src/form-engine/index.ts` | antd 직접 재수출 | `backend.ai-ui` 재수출, 34가 수출하던 이름 전부 복원 |
| `packages/backend.ai-ui/src/index.ts` | 제거 | `export * from './form-engine'` 복귀 |
| `react/src/components/BAIFormItem.tsx` | 티켓 05 원본(antd 바인딩) | **엔진 재수출**. `BAIFormItem.css` 삭제(엔진의 `FormItemVisual.css`가 동일 파일) |
| `react/src/components/DefaultProviders.tsx` | `<ConfigProvider form={{…}}>` | **`<FormConfigProvider requiredMark={…}>`** |
| e2e 셀렉터 8파일 | `.ant-form-*` | `[data-bai-form-item*]` (34가 만든 버전 그대로 복원) |
| `BAIBulkEditFormItem.test.tsx` | `.ant-form-item-required` | `[data-bai-form-item-required]` |

`requiredMark` **함수**는 antd provider에서 엔진 provider로 그대로 옮겼다.
`validateMessages`는 **이제 안 넘긴다** — provider가 기본값으로 채운다(아래).

### validateMessages 로컬라이제이션 — antd 로케일 번들 제거

MERGE-CHECKLIST가 언파킹의 선결 조건으로 지목했던 항목이다. 유일한 로컬라이즈
소스가 `antdLocale.Form.defaultValidateMessages`였고, 엔진의
`messages.ts`는 영어 `${name}` 폴백뿐이었다.

- **템플릿 21종 × 21개 언어**를 antd 자체 로케일 파일(MIT)에서 그대로 포팅해
  각 `packages/backend.ai-ui/src/locale/*.json`의 `form.validateMessages`
  아래에 넣었다. 추출 스크립트는
  `.scratch/astryx-migration/extract-validate-messages.mjs`(출처 주석 포함).
  키 모양은 BUI 스키마(`i18n.schema.json`)를 따른다 — 소문자 키는 중첩
  객체, 대문자 키는 문자열 리프. 그래서 `types.String`, `string.Max`다.
- **`FormConfigProvider`를 `context.ts`에서 분리**해
  `form-engine/FormConfigProvider.tsx`로 옮겼다. `context.ts`는 엔진 코어라
  (`Field`/`FormStore`/`FormItem`이 전부 임포트한다) i18next를 끌어들이면 안
  된다. provider를 **마운트하는** 쪽만 그 비용을 낸다.
- provider가 `validateMessages`를 **기본값으로** 채운다. 호출부는 아무것도
  넘기지 않고, 언어가 바뀌면 테이블이 다시 계산된다. 명시적 prop과
  `<Form validateMessages>`는 여전히 우선한다.
- `${label}`/`${max}`/`${type}`는 **엔진의** 템플릿 문법이고 i18next의 것이
  아니다. BUI i18next는 `prefix: '{{'`라 그대로 통과시킨다.

**동등성 증거 2종:**

1. **브라우저(7개 언어)** — `/theme-probe/form.html?state=error&lang=<x>`가
   같은 폼을 antd 스택과 엔진 스택에 나란히 렌더한다. `message` 없는
   `{ required: true }` 규칙이 만드는 텍스트가 en/ko/ja/de/zh-CN/ru/th
   **전부 바이트 동일**. 즉 사용자에게 보이는 문자열이 하나도 안 바뀌었다.
2. **CI** — `packages/backend.ai-ui/src/form-engine/FormConfigProvider.test.tsx`
   8건: 4개 언어, 번역된 템플릿 안에서의 `${max}`/`${type}` 보간,
   명시적 prop 우선순위, 그리고 `cimode`에서 점 찍힌 i18n 키가 절대
   새어나오지 않는다는 폴백.

### 시각 동등성 재검증 (티켓 05 하네스 재조준)

`react/theme-probe/form.tsx`는 05 시점엔 **한 엔진 위의 두 아이템 렌더러**를
비교했다(antd `Form.Item` vs `BAIFormItem`). 34가 엔진을 갈아치웠으므로 이제
의미 있는 비교는 **스택 대 스택**이다 — 같은 폼 본문, 한쪽은 antd `<Form>` +
`<Form.Item>`, 다른 쪽은 엔진. 양쪽 모두 앱의 `requiredMark` 함수를 받는다.

`light|dark × pristine|error × vertical|horizontal` 8조합에서
**아이템 수 · 라벨 텍스트 · 에러 텍스트 · extra 텍스트 · 그려진 asterisk 수 ·
아이템 높이/컨트롤 오프셋 · `validateFields` reject 모양**이 전부 일치했고
페이지 에러 0. (`.scratch/astryx-migration/probe-form-parity.mjs`)

측정 도중 실제 결함 2건을 찾아 고쳤다:

1. **`.ant-select`가 100% 폭으로 늘어나지 않았다.** antd Select는 자기
   `FormItemInputContext`를 읽어 `ant-select-in-form-item` 클래스를 붙이고,
   그 클래스가 폭을 만든다. 엔진 아이템 안에서는 그 클래스가 안 붙는다.
   `FormItemVisual.css`에 이미 있던 stretch 규칙이 정답인데, **프로브가 BUI
   빌드 CSS를 임포트하지 않아 페이지에 도달하지 못하고 있었다**(앱 dev
   서버는 `backend.ai-ui`를 소스로 aliasing하므로 영향 없음). 프로브에
   `import 'backend.ai-ui/styles.css'` 추가로 해결, 폭 742/742 일치.
2. **에러 상태에서 antd 컨트롤의 테두리가 빨개지지 않았다.** 같은 원인 —
   antd `Input`/`InputNumber`는 `antd/es/form/context`의
   `FormItemInputContext`에서 status를 읽는다. React로 고치려면 엔진이 antd를
   다시 임포트해야 하므로, `FormItemVisual.css`에 **시각 셸이 이미 발행하는
   `data-status`를 키로 한 CSS 브리지**를 넣었다. antd 임포트 0, 마지막 antd
   컨트롤이 마이그레이션되면 규칙도 같이 사라진다.

### 남은 차이 2건 (의도적, 측정됨)

1. **다크 모드 에러 빨강의 색조.** antd `rgb(220,68,70)` vs 엔진
   `rgb(190,61,63)`. 엔진은 `var(--color-error)`(Astryx 토큰)를 쓴다 — 이건
   티켓 05가 **에러 메시지 텍스트**에 대해 이미 내린 선택이고, 새 테두리
   규칙이 같은 토큰을 따라간 것이다. 결과적으로 엔진 안에서는 테두리와
   텍스트가 일치한다. 라이트 모드에서는 양쪽 다 `rgb(255,77,79)`로 완전히
   같다. "시각값은 테마가 소유한다"는 MIGRATION-SPEC §0 정책 그대로.
2. **`layout="horizontal"`에서 라벨이 길면 줄바꿈된다.** 시각 셸의
   `--bai-form-item-label-width`가 120px 고정이라(티켓 05 결정), 9개 아이템
   중 1개("Cooldown (seconds)")가 antd보다 12px 높다. 저장소의
   `<Form layout>` 66건 중 65건이 vertical이고, `<BAIFormItem layout>` 11건은
   이 120px를 전제로 디자인됐다. 그 11건을 흔들 이유가 없어 그대로 둔다.

### 라이브 검증 (dev 서버 5980 → 10.82.0.130:8090)

실제 폼 5개를 en/ko 양쪽에서 왕복했다 — 세션 런처(아이템 28), 폴더 생성
모달(6), 리소스 정책 생성 모달(21), 사용자 생성 모달(17), 프로젝트 설정
모달(10). 전부:

- `[data-bai-form-item]`만, `.ant-form-item` **0**, `form.ant-form` **0**;
- 그려진 asterisk **0**, 비필수 라벨에 `(optional)`/`(선택)`/`(任意)` —
  `requiredMark` 함수 계약 유지 (`general.Optional`이 en에서 소문자
  "optional"인 것은 원래 그렇다);
- 폴더 생성 모달 빈 제출 → 엔진의 explain 슬롯에 검증 에러 표시, 제출 차단;
- `/admin/deployments/deployment-presets/new`를 en/ko/ja로 열어 라벨·설명·
  requiredMark 접미사까지 전부 로컬라이즈되는 것 확인;
- **pageErrors 0** (모든 화면, 모든 언어).

스크립트: `.scratch/astryx-migration/live-form-smoke.mjs`,
`live-validate-messages.mjs`. 스크린샷: `.scratch/astryx-migration/live/`.

### 검증 (언파킹 시점)

`bash scripts/verify.sh` → **ALL PASS**. react vitest **1171 passed / 64
files**, BUI vitest **471 passed / 1 skipped**, 수용 스위트 **59 passed**
(antd 29 + 엔진 29 + 별칭 가드 1). `pnpm --filter backend.ai-ui build` 성공,
`pnpm run build:react-only` 성공.

수용 스위트의 `engine` 행 임포트를 `../form-engine`(별칭)로 되돌려, 이제
스위트가 **배선까지** 고정한다. 별칭이 다시 antd로 향하면 두 행이 똑같아져
29건이 아무것도 단언하지 않게 되므로, `EngineForm !== AntdForm`을 검사하는
가드 테스트 1건을 추가했다.

---

## PARKED — 런타임을 antd로 되돌림 (2026-08-08, 사용자 결정) — *해제됨, 위 참조*

아래 "Implementation notes"는 **티켓 34가 무엇을 만들었는지**에 대한 기록이며,
그대로 유효하다. 다만 **앱은 더 이상 그 엔진 위에서 돌지 않는다.** UI 컴포넌트
마이그레이션이 진행되는 동안 폼 동작 변화를 0으로 유지하기 위해, 사용자가
런타임을 antd 엔진 + antd `Form.Item` 시각으로 되돌리기로 결정했다. 엔진 코드와
수용 테스트는 트리에 그대로 남는다.

### 무엇을 뒤집었나 — 별칭 한 겹

티켓 34가 **호출부를 건드리지 않고** 엔진을 갈아끼울 수 있도록 만든 간접층이
그대로 되돌리는 수단이 됐다. 115개 파일의 `from '../form-engine'` 임포트는 **한
줄도 바뀌지 않았다.**

| 파일 | 34에서 | 지금 |
|---|---|---|
| `packages/backend.ai-ui/src/form-engine/index.ts` | 엔진 공개 표면 | **antd 재수출** (엔진 표면은 `engine.ts`로 이동) |
| `react/src/form-engine/index.ts` | `backend.ai-ui` 재수출 | **antd 직접 재수출** |
| `packages/backend.ai-ui/src/index.ts` | `export * from './form-engine'` | 제거 (BUI 공개 API에 antd `Form`을 다시 실을 이유가 없다) |
| `react/src/components/BAIFormItem.tsx` | 엔진으로 가는 재수출 | **티켓 05 원본 복원** (`Form.Item noStyle` + `NoStyleItemContext` antd 바인딩) + `BAIFormItem.css` 복원 |
| `react/src/components/DefaultProviders.tsx` | `<FormConfigProvider>` | **`<ConfigProvider form={{validateMessages, requiredMark}}>` 복원** |

`requiredMark`가 **함수**인 것이 핵심이다 — asterisk를 억제하고 비필수 라벨에
"(Optional)"을 붙인다. 이건 기본값이 아니라 의도된 제품 동작이고, 반드시 antd
provider 쪽으로 돌아가야 했다(엔진 provider는 이제 아무도 읽지 않는다).

결과: 평범한 `<Form.Item>` 277개 사이트가 편집 없이 **antd 시각(`.ant-form-item*`
DOM) + antd 엔진**으로 복귀했다. 명시적 `<BAIFormItem>` 사이트(티켓 18–23)는
그대로 두었다 — 원래부터 `Form.Item noStyle` 위에 얹힌 구조라 **동작은 antd**이고
라벨/에러 시각만 BAI다. 로그인 화면이 정확히 이 모양이다(폼 루트는
`form.ant-form.ant-form-vertical`, 아이템 4개는 `[data-bai-form-item]`).

### 별칭 모듈의 두 가지 제약 (주석에도 박아뒀다)

1. **재수출만 한다.** `const FormItem = Form.Item` 같은 모듈 최상위 프로퍼티
   접근은 금지다. `vi.mock('antd', () => ({…}))`로 antd를 통째로 갈아치우는
   테스트(`MyResourceWithinResourceGroup.test.tsx`)는 mock에 `Form`이 없어서
   즉시 터진다 — 실제로 이 리버트 도중 한 번 터뜨렸고, 지연 재수출로 고쳤다.
   이 모듈은 BUI 배럴을 타고 거의 모든 테스트에 딸려 들어간다.
2. **실측 표면만 수출한다.** 엔진의 `FormItem`/`FormList`/`useForm`/`useWatch`/
   `useFormInstance` 이름수출은 소비처가 0이라(호출부는 `Form` 복합
   컴포넌트에서 꺼내 쓴다) 일부러 뺐다. `FormConfigProvider`·`FormStore`·
   `BAIFormItemVisual`은 antd 대응물 자체가 없다.

### 파킹된 엔진은 썩지 않는다

- `engine.ts` 상단에 파킹 배너 + 재활성화 체크리스트.
- 수용 테스트 29건은 **양쪽 행 모두 그린 유지**(58 passed). `engine` 행은
  별칭을 우회해 `packages/backend.ai-ui/src/form-engine/engine`를 **상대 경로로
  직접** 임포트한다 — 별칭을 타면 antd를 두 번 돌리는 무의미한 스위트가 된다.
- 엔진 전체가 여전히 `tsc`/`eslint` 대상이다(react tsconfig의 `include`가 BUI
  소스를 덮는다).

### E2E 셀렉터 — 별칭 사이트만 되돌림

티켓 34가 `.ant-form-*` → BAI 앵커로 바꾼 8개 파일을 34 이전 상태로 복원했다.
근거가 정확히 뒤집혔기 때문이다(그 컴포넌트들은 별칭 때문에 BAI 셸을 렌더했고,
지금은 다시 antd DOM을 렌더한다).

- `preset-integration.spec.ts`, `rbac-role-crud.spec.ts`,
  `add-revision-manual-image.spec.ts`, `deployment-lifecycle.spec.ts`,
  `serving-deploy-lifecycle.spec.ts`, `session-cluster-mode.spec.ts`
  → `.ant-form-item` / `.ant-form-item-row` / `.ant-form-item-explain-error`.
- `serving-deploy-lifecycle.spec.ts`의 페이지 전역 에러 스캔은 **BAI + antd 이중
  셀렉터**로 복귀 — 지금 화면은 실제로 두 모양이 섞여 있다.
- `e2e/utils/test-util-antd.ts`의 `getFormItemControlByLabel`도 **dual-mode
  복원**. 같은 이유다.
- `FolderCreationModal.ts`는 BAI 앵커를 **유지**(FolderCreateModalV2는 명시적
  `BAIFormItem` 사이트다). 주석만 34 이전 문구로 되돌렸다.
- `BAIBulkEditFormItem.test.tsx`도 `.ant-form-item-required`로 복원 — 이
  컴포넌트는 별칭 `Form.Item`을 쓰므로 antd DOM이다. (임포트는 `../form-engine`
  그대로 둔다.)
- **남긴 것**: `visual_regression`의 구조 결합 체인 6개. 34가 손대지 않았고
  이번에도 손대지 않는다.

FRONTIER 주석 9곳도 사실에 맞게 고쳤다("self-hosted since ticket 34" →
"antd's; ticket 34's engine is parked").

### 재활성화 방법

1. `packages/backend.ai-ui/src/form-engine/index.ts` → `export * from './engine'`
   (+ `export { default } from './engine'`, `export { Form } from './engine'`).
2. `react/src/form-engine/index.ts` → `backend.ai-ui`(또는 엔진)를 다시 가리키게
   하고, 34가 수출하던 이름들(`FormConfigProvider`, `BAIFormItem`, …)을 복원.
3. `packages/backend.ai-ui/src/index.ts`에 `export * from './form-engine'` 복귀.
4. `DefaultProviders.tsx`: `<ConfigProvider form={{…}}>` → `<FormConfigProvider>`
   (**`requiredMark` 함수를 반드시 옮길 것**).
5. `react/src/components/BAIFormItem.tsx`를 엔진 재수출로 되돌리고
   `BAIFormItem.css` 삭제(엔진의 `FormItemVisual.css`가 동일 파일이다).
6. 위 E2E 셀렉터를 다시 BAI 앵커로.
7. 수용 테스트의 `engine` 행 임포트를 `../form-engine`로 되돌려도 된다.

### 검증 (리버트 시점)

`bash scripts/verify.sh` → **ALL PASS**. react vitest **1164 passed / 62 files**,
BUI vitest **441 passed / 1 skipped**, 수용 스위트 **58 passed** (antd 29 + 엔진
29). `pnpm --filter backend.ai-ui build` 성공. 로그인 화면 라이브 스모크: 폼
루트가 `ant-form`, 페이지 에러 0, 콘솔 에러는 기존 CSP 폰트 경고 2건과 React의
`-webkit-app-region` 경고 1건뿐(리버트와 무관).

## Acceptance criteria

- [x] 수용 테스트 29건이 antd에서 그린 → 자체 엔진에서 그린 — `react/src/form-engine/formEngineAcceptance.test.tsx`, `describe.each`로 두 구현을 동시에 돌린다. **58 passed (29 × 2)**.
- [x] 호출부 diff 0 (import 경로 제외) — 115파일이 codemod로 import만 바뀌었다. 예외 3건은 아래 "호출부 diff 감사"에 전수 기록.
- [x] reject 모양 {message,values,errorFields} 바이트 동등 — 수용 테스트 29가 4키(`message`/`values`/`errorFields`/`outOfDate`) 전수, `errorFields[].name` 숫자 인덱스 경로, 등록 순서, `instanceof Error === false`까지 고정.
- [x] `bash scripts/verify.sh` ALL PASS
- [x] react vitest 1164 passed / BUI vitest 441 passed

## Implementation notes

### 결과 요약

antd `Form`/`Form.Item`/`FormInstance`/`Form.List`/`Form.Provider`/`useWatch`/
`useFormInstance`/`Form.ErrorList`/`Form.Item.useStatus` 전부를 자체 엔진으로
교체했다. **앱 소스에 antd Form 임포트가 0개 남았다** (`git grep "Form" | grep
"from 'antd"` → 0). 티켓 05가 분리해 둔 시각 레이어는 한 줄도 바뀌지 않았고,
엔진만 갈아끼웠다 — 그 분리가 존재했던 이유다.

부수 효과 하나가 크다: 티켓 05가 유일한 불안정 결합으로 지목했던
`import { NoStyleItemContext } from 'antd/es/form/context'` 딥임포트가 사라졌다.
그에 딸린 "antd 버전 고정 권고"도 함께 무효가 된다.

### 엔진 규모 (실측)

`packages/backend.ai-ui/src/form-engine/` — **4,548 LOC** (주석 포함).
견적은 1,320–1,720 TS LOC였고, 견적 대비 초과분은 전부 **주석·타입 선언·시각
레이어 이관분**이다:

| 모듈 | LOC | 견적 대응 |
|---|---:|---|
| `FormStore.ts` | 1,046 | 스토어 + 필드 등록/preserve + dependencies + 검증 오케스트레이션 (견적 600–780) |
| `Field.tsx` | 582 | 필드 엔티티 + 재렌더 판정 + 컨트롤 바인딩 |
| `validate.ts` | 545 | rule 엔진 9키 (견적 350–450) |
| `FormItem.tsx` | 466 | 시각 바인딩 (= BAIFormItem) — **견적 밖** |
| `namePath.ts` | 332 | 경로 유틸 + NameMap + `DeepNamePath` |
| `Form.tsx` | 327 | `<Form>` + `Form.Provider` |
| `interface.ts` | 276 | 타입 선언 전용 — **견적 밖** |
| `FormItemVisual.tsx` | 242 | 티켓 05에서 **이관**된 시각 셸 — **견적 밖** |
| `List.tsx` | 188 | Form.List + key 관리 |
| `context.ts` | 165 | 컨텍스트 6종 |
| `useWatch.ts` | 132 | useWatch + useFormInstance |
| `index.ts` / `messages.ts` / `ErrorList.tsx` | 247 | 공개 표면 + 기본 메시지 + ErrorList |

견적 대상(순수 엔진: FormStore + Field + validate + namePath + Form + List +
context + useWatch)만 세면 **3,065 LOC**, 주석·빈 줄을 빼면 대략 1,900. 견적
상한을 약간 넘는데, 초과분은 (a) 모든 비자명 결정에 근거 주석을 붙였고
(b) `DeepNamePath` 같은 타입 데이터를 원본에서 그대로 옮겼기 때문이다.

### 메서드 / rule 커버리지

`FormInstance` — answers/08 §1.1의 실사용 13메서드 전부 + 엔진이 스스로 쓰는
4개.

| 메서드 | 상태 | 비고 |
|---|---|---|
| `getFieldValue` | 구현 | |
| `getFieldsValue` | 구현 | `()` / `(true)` / `(nameList)` / `({filter})` 4형태 |
| `getFieldError` / `getFieldWarning` / `getFieldsError` | 구현 | warningOnly 채널 분리 |
| `setFieldValue` / `setFieldsValue` / `setFields` | 구현 | `setFieldsValue`는 중첩 partial merge(배열은 통째 교체) |
| `resetFields` | 구현 | **호출 시점의** `initialValues` 재적용 |
| `validateFields` | 구현 | `recursive` / `dirty` / `triggerName` 옵션 |
| `submit` | 구현 | |
| `isFieldsTouched` | 구현 | |
| `scrollToField` / `focusField` | **얇게** 구현 | 생성된 `id`로 DOM 조회. 유일한 소비처가 이미 antd 동작을 거부하고 DOM을 직접 뒤진다 (answers/08 §4) |
| `isFieldTouched` / `isFieldValidating` / `isFieldsValidating` | 구현 | 엔진 내부용, 공짜 |
| `getFieldInstance` | 얇게 | `id` 기준 DOM 노드 반환. 앱 호출 0 |
| `getInternalHooks` | 엔진 전용 | `HOOK_MARK` 가드, 외부 호출 0 |

Rule 9키 전부 구현: `required` `message` `validator` `type` `max` `min`
`pattern` `warningOnly` `whitespace`. `type`은 실사용 5종(`number` `string`
`email` `url` `object`)만. **미복제(사용 0)**: `enum` `len` `transform`
`defaultField` `fields`, `date`/`regexp`/`hex`/`float`/`integer`/`method`/
`array`/`boolean` 타입, `Form.Item normalize`, `Form.List move`.

async-validator의 두 가지 기벽을 **의도적으로 재현**했다(주석에 근거 명시):
`Object.keys(rule)` 모양으로 validator를 고르는 디스패치(→ `{max:64}`가 문자열
타입 에러도 같이 내고, `{pattern, max}`는 `max`를 무시함), 그리고 `message`가
생성 텍스트를 **치환**한다는 것(→ `''`는 "텍스트 없는 에러 상태", 9곳이 의존).

### 드롭인 교체 방식

`scripts/codemods/antd-form-to-engine.mjs` — app-shim(티켓 11)/theme-shim과
동일한 패턴.

- 스캔 루트 2개: `react/src` → `react/src/form-engine` (재수출),
  `packages/backend.ai-ui/src` → `.../src/form-engine` (엔진 본체).
  BUI가 자기 자신을 `backend.ai-ui`로 임포트할 수 없어 갈라진다.
- 소스 4종에서 form 관련 심볼만 뽑아 재작성: `'antd'`, `'antd/lib'`,
  `'antd/es/form'`, `'antd/lib/form'`, `'antd/es/form/context'`.
  `GetRef`(Select ref용)처럼 form과 무관한 심볼은 건드리지 않는다.
- **115파일 재작성, 61건은 import 분할**.

`Form.Item`이 곧 `BAIFormItem`이다. 그래서 아직 `<Form.Item>`으로 남아 있던
**277개 사이트가 편집 없이 BAI 시각 셸로 전환**됐다 — 티켓 05의 시각/엔진
분리가 노린 지점이 정확히 여기다. `react/src/components/BAIFormItem.tsx`는
41개 상대 임포트를 지키기 위한 재수출만 남았다.

### 호출부 diff 감사 (예외 3건)

import 외 변경은 정확히 3종이고, 전부 기록된 필연이다.

1. `packages/backend.ai-ui/src/index.ts` — `export * from './form-engine'`.
   인프라(app-shim/theme-shim과 동형).
2. `BAIBulkEditFormItem.test.tsx:460` — `.ant-form-item-required` →
   `[data-bai-form-item-required]`. answers/08 §4가 미리 지목한 앱 소스
   셀렉터 의존 중 마지막 1건.
3. **주석만** 바뀐 파일 14개. "antd Form 엔진은 티켓 34까지 유지한다"는
   FRONTIER 주석들이 이 티켓으로 사실과 반대가 됐다. 코드·props·동작 무변경.

### 앱 배선 1곳 — `DefaultProviders.tsx`

`<ConfigProvider form={{validateMessages, requiredMark}}>`가 자체 엔진에는
닿지 않으므로 `<FormConfigProvider>`로 옮겼다. 값은 그대로다:

- `validateMessages`는 계속 antd **로케일 번들**에서 온다. 엔진 자체 템플릿은
  `${name}` 기반 영어 폴백이고, 사용자가 보는 건 `${label}` 로케일 쪽이다.
  로케일 번들 자체의 이관은 티켓 35.
- `requiredMark`가 **함수**면 asterisk를 완전히 억제하고 비필수 라벨에
  "(Optional)"을 붙인다(antd 규칙, 엔진이 그대로 재현). 이건 기본값이 아니라
  의도된 제품 동작이라 반드시 살려야 했다 — 빠뜨렸으면 앱 전체 필수 필드에
  asterisk가 돋아났다.

### 발견해서 고친 실제 버그 1건

레이아웃 전용 아이템(`name` 없음)에서 명시 `required` prop이 무시됐다.
`BAIBulkEditFormItem`이 정확히 그 모양(아이템에서 `name`을 떼고 마커를 직접
제어)이라 기존 BUI 테스트가 잡아냈다. `renderLayout`이 rules 파생값만 보고
prop을 안 보던 문제 — antd는 `required ?? isRequired`.

### antd 대비 의도적 차이 3건 (전부 주석에 근거 기록)

1. **`layout` 기본값이 `vertical`** (antd는 `horizontal`). 저장소의 66개 선언
   중 65개가 vertical이고 나머지 1개는 명시적이다.
2. **`useWatch`가 첫 렌더에서 스토어를 읽는다.** 원본은 `undefined`로 시작해
   마운트 이펙트에서 동기화하므로 `useWatch`로 게이팅된 서브트리가 한 프레임
   깜빡인다. 렌더 1회와 그 깜빡임이 사라진다. 수용 테스트 11/18/19가 커버.
3. **`tooltip` 오브젝트형은 `title`만 살린다.** `{title, placement, icon}`을
   쓰는 3개 사이트(`ResourceAllocationFormItems`)에서 `placement`/`icon`이
   드롭된다. 시각 셸이 라벨 옆에 **인라인**으로 힌트를 그리는 티켓 05
   PILOT-DECISION을 그대로 계승한 것 — 진짜 hover 툴팁을 그리려면
   의도적으로 무의존성인 시각 셸에 antd `Tooltip`을 끌어와야 한다.
   툴팁 표현 방식 자체는 시각 레이어 과제이므로 티켓 35 이후로 넘긴다.

### E2E 셀렉터 (엔진 밖 비용, answers/08 §6.3이 예고한 항목)

티켓 31은 "해당 컴포넌트가 아직 raw antd `Form.Item`을 렌더한다"는 이유로
`.ant-form-*` 셀렉터 일부를 의도적으로 남겨뒀다. 이 티켓이 그 전제를 없앴다.

- 기능 스펙 6파일 마이그레이션 (`.ant-form-item` → `[data-bai-form-item]`,
  `-row` → 동일, `-explain-error` → `[data-bai-form-item-explain-error]`).
- `e2e/utils/test-util-antd.ts`의 공용 헬퍼 `getFormItemControlByLabel`에서
  dual-mode를 제거 — antd 쪽 가지는 이제 절대 매치되지 않는다.
- `FormItemVisual`에 `data-bai-form-item-control-input-content` 추가:
  `.ant-form-item-control-input-content` 대응이 비어 있었다.

**남긴 것**: `e2e/visual_regression/{serving,session}/*_page.test.ts` 6개
셀렉터. `div:nth-child(3) > .ant-row > .ant-col > .ant-form-item-control-input
> …` 형태의 구조 결합 체인이라 기계적 치환이 불가능하고, 라이브 실행 없이는
재도출할 수 없다. 애초에 티켓 05 시점부터 이미 깨져 있었고, 두 스펙 모두
`FIXME(FR-3111/stale-baseline)` + FR-3115 연기가 파일 상단에 명시돼 있다.
E2E auto-heal 패스 또는 티켓 35에서 라이브로 재도출할 것.

### 수용 테스트 설계

`describe.each([['antd', AntdForm], ['engine', EngineForm]])` — 29건이 두 구현
위에서 각각 돈다. antd 행을 계속 그린으로 유지하는 게 핵심이다: 테스트가
"엔진이 하는 일"이 아니라 "antd가 하던 일"을 서술한다는 증거이고, antd가
제거되는 티켓 35까지 오라클로 남는다. 그 시점에 antd 행만 지우면 평범한
회귀 스위트가 된다.

작성 규칙은 파일 상단에 박아뒀다: **FormInstance API와 렌더된 텍스트로만**
단언한다. antd 클래스명이나 BAI `data-*` 앵커에 단언하면 한쪽 행에서만
통과하는, 시맨틱과 무관한 테스트가 된다.

첫 실행에서 58건 중 52건이 통과하고 6건이 **antd·엔진 양쪽에서 동일하게**
실패했다 — 즉 엔진이 아니라 테스트의 전제가 틀린 경우였다. 셋 다 실제 antd
동작에 맞춰 고쳤고, 그 과정에서 문서화된 사실 3개를 정정했다:

- **1번 (rules 배열 교체)**: 규칙이 빈 배열이 되면 그 필드는 검증에서
  **통째로 스킵**되므로 기존 에러가 저절로 소거되지 않는다. 실제로 지우는 건
  페이지가 뒤이어 호출하는 `setFieldValue`다. answers/08은 "소거돼야 한다"고
  적었지만 측정 결과 antd는 그렇게 동작하지 않는다.
- **18번 (preserve)**: 값은 **스토어에** 남지만, 언마운트된 필드는 등록
  집합에서 빠지므로 `getFieldsValue()`(및 `validateFields()`의 resolve 값)에는
  안 들어온다. 읽기는 `getFieldValue` / `getFieldsValue(true)`로 한다.
- **25번 (`Form.Provider onFormChange`)**: `setFieldValue` 자체는
  `onFieldsChange`를 발화시키지 않는다. `onFormChange`가 프로그래매틱 변경을
  볼 수 있는 건 그 뒤에 도는 **검증**(`validateFields` → `triggerOnFieldsChange`)
  경로 덕분이다. 채널 폭의 차이지 "프로그래매틱 감지" 기능이 아니다.

### antd에 남긴 코너

**없다.** 폼 엔진 표면에서 antd로 남겨둔 것은 하나도 없다. `Form.Item`
**안에 들어가는 컨트롤**(`Input`, `InputNumber`, `Radio`, `Select`,
`Checkbox`, `Switch`, `Tooltip` …)은 여전히 antd지만 그건 이 티켓의 범위가
아니라 컴포넌트 티켓들의 프런티어다.

`outOfDate`는 모양만 유지하고 항상 `lastValidatePromise` 비교로 채운다 —
읽는 코드가 저장소에 없어 정확한 발생 조건 재현은 defer(answers/08 §6.2와
동일 판단).

### 다음 티켓(35)이 이어받을 것

- `antd-zero-gate.sh`는 이 티켓 **전에도 후에도** FAIL이다(폼과 무관한
  컴포넌트 임포트가 여전히 antd를 끌어온다). 게이트를 닫는 건 35의 일이다.
- 수용 테스트의 `antd` 행 제거.
- `visual_regression` 셀렉터 6개 라이브 재도출.
- `NamePath`를 antd의 `DeepNamePath` 복제본에서 실제로 엄격한 타입으로
  좁히기 — 지금은 untyped store에서 `any`로 붕괴하는 antd 시맨틱을 그대로
  베꼈다(그래야 호출부 diff가 0이 된다). 스토어에 타입을 붙이는 작업과
  묶어야 한다.
