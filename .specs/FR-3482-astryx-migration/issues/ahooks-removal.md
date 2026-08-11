# ahooks 제거 — BUI 자체 훅으로 대체

**Target:** to-astryx
**Status:** done

**What:** `ahooks` 의존성을 완전히 제거하고, 실제로 쓰이던 훅 12종을
`packages/backend.ai-ui/src/hooks/` 에 이식했다. 새 의존성은 0개
(`lodash-es`, React 19.2 프리미티브, 기존 BUI 훅만 사용).

원본은 [ahooks (alibaba/hooks)](https://github.com/alibaba/hooks), **MIT**.
각 모듈 상단 doc comment 에 어느 훅을 이식했는지 명시했다.

## Census (`to-astryx` @ 629b96e2a 기준)

| 훅                       | 호출부 수 | 실제로 쓰인 옵션                                                                | 미이식(드롭) 옵션                                                                           |
| ------------------------ | --------: | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `useControllableValue`   |        40 | `defaultValue`, `valuePropName`, `defaultValuePropName`, `trigger` (전량)       | — (전 옵션 이식)                                                                            |
| `useToggle`              |        36 | `useToggle()` / `useToggle(false)`; actions `toggle`/`set`/`setLeft`/`setRight` | — (2-인자 오버로드까지 이식)                                                                |
| `useSessionStorageState` |         6 | `defaultValue`                                                                  | `listenStorageChange`/`serializer`/`deserializer`/`onError` 는 호출부 미사용이나 **이식함** |
| `useUpdateEffect`        |         3 | `(effect, deps)`                                                                | `useUpdateLayoutEffect` 변종 미이식                                                         |
| `useNetwork`             |         2 | `.online`                                                                       | — (전체 `NetworkState` 이식)                                                                |
| `useDebounceFn`          |         2 | `wait`                                                                          | `leading`/`trailing`/`maxWait` 미사용이나 lodash 위임이라 자동 지원                         |
| `useDebounce`            |         2 | `wait`, `leading`, `trailing`                                                   | `maxWait` 미사용이나 지원                                                                   |
| `useThrottleFn`          |         1 | `wait`, `leading`, `trailing`                                                   | —                                                                                           |
| `usePrevious`            |         1 | 기본 `shouldUpdate`                                                             | — (custom comparator 도 이식)                                                               |
| `useLocalStorageState`   |         1 | `defaultValue`                                                                  | 위 storage-state 와 동일                                                                    |
| `useHover`               |         1 | target(ref)만                                                                   | `onEnter`/`onLeave`/`onChange` 미사용이나 이식                                              |
| `useEventListener`       |         1 | 기본 target(window)                                                             | `target`/`capture`/`once`/`passive`/`enable` 전부 이식                                      |

`import type { DebounceOptions } from 'ahooks/lib/useDebounce/debounceOptions'`
(deep import) 1건은 BUI `useDebounceFn` 가 export 하는 동명 타입으로 대체.

**Census 에 없던 훅** — `useMemoizedFn`, `useDynamicList`, `useClickAway`,
`useSize`/`useResizeObserver`, `useRequest`, `useMount`, `useInterval`,
`useRafState` 는 이 저장소에 **사용처가 없었다**. 따라서 이식하지 않았다.
(`useMemoizedFn` 은 `.claude/rules/use-effect-event.md` 규약대로 이미 제거된 상태.)

## PILOT-DECISIONs

| #         | 결정                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **PA-1**  | 새 훅은 전부 **BUI**(`packages/backend.ai-ui/src/hooks/`)에 둔다. `react/` 는 `backend.ai-ui` 에서 import, BUI 내부는 상대경로. 호출부는 **import specifier 만** 바뀌고 호출 형태는 그대로 — 90개 파일이 순수 import 치환.                                                                                                                                                                                                                                                                                                                                         |
| **PA-2**  | 이름에 `BAI` 접두사를 **붙이지 않는다**. BUI 는 이미 `useInterval`/`useEventNotStable` 같은 무접두 훅을 export 하고 있고, 접두사를 붙이면 76개 호출부가 이름까지 바뀌어 diff 가 커진다. 공개 표면 충돌은 없음(사전 확인).                                                                                                                                                                                                                                                                                                                                          |
| **PA-3**  | debounce/throttle 타이밍은 **직접 구현하지 않고 `lodash-es` 의 `debounce`/`throttle` 에 위임**한다. ahooks 자신이 `lodash/debounce` 를 쓰므로(`utils/lodash-polyfill.js` 는 lodash re-export 일 뿐) 이게 가장 충실한 이식이고, `lodash-es` 는 이미 `react`/`backend.ai-ui` 양쪽의 dependency 라 **새 의존성이 아니다**. leading/trailing/maxWait 시맨틱이 바이트 단위로 동일.                                                                                                                                                                                      |
| **PA-4**  | ahooks 의 `useMemoizedFn`(안정 identity + 최신 클로저)은 `useControllableValue`/storage-state 의 "setter identity 는 절대 안 바뀐다" 계약에 필수라 **내부 전용** `useLatestCallback` 으로 이식했다 (`hooks/internal/useLatest.ts`). 기존 `useEventNotStable` 를 쓰지 않은 이유: 그쪽은 ref 를 **layout effect** 에서 갱신해서, 자식이 자기 layout effect 안에서 setter 를 부르면 한 커밋 늦은 구현을 실행한다. ahooks 는 **렌더 중** 갱신한다. 애플리케이션 코드는 계속 `useEffectEvent` 를 써야 하며, 이 사실을 doc comment 와 `use-effect-event.md` 에 명시했다. |
| **PA-5**  | `useControllableValue`/`usePrevious`/`useLatest` 는 **렌더 중 ref read/write** 가 본질이다 (controlled 값은 그 렌더에서 보여야 하고, "이전 값"은 변화를 관측한 그 렌더에서 읽혀야 한다). `react-hooks/refs` 를 **해당 라인/블록에 한정해서** disable 하고 이유를 주석으로 남겼다. eslint.config.js 에 파일 단위 override 를 넣는 방식은 미래 코드까지 구멍을 뚫으므로 채택하지 않았다.                                                                                                                                                                             |
| **PA-6**  | `'use memo'` 는 컴파일러가 실제로 이득을 주는 훅(`useHover`, `useNetwork`)에만 붙였다. ref 배관 위주 훅(`useLatest`, `usePrevious`, `useControllableValue`, `useEffectWithTarget`)은 메모이제이션 대상이 없고 컴파일러가 렌더 중 ref 변형을 싫어하므로 붙이지 않았다. `useMemo`/`useCallback` 은 새로 도입하지 않았다 — ahooks 가 `useMemo(…, [])` 로 하던 "한 번만 만든다"는 전부 `useState` lazy initializer 로 바꿨다.                                                                                                                                          |
| **PA-7**  | `useEventListener` 의 target 배관(`createEffectWithTarget`)은 **정직하게 이식**했다. dep array 없는 effect + 해석된 DOM 엘리먼트 수동 비교. ref target 은 리렌더 없이 바뀔 수 있어 일반 dep array 로는 관측이 불가능하다 — 단순화했다면 `useHover(siderRef)` 가 조용히 깨졌을 것.                                                                                                                                                                                                                                                                                  |
| **PA-8**  | storage-state 의 `listenStorageChange`/`serializer`/`deserializer`/`onError` 는 이 저장소에 호출부가 없지만 **이식했다**. 훅 본체가 이미 그 분기를 갖고 있어 제거해도 코드가 줄지 않고, 두 개 이상의 인스턴스가 같은 키를 공유하는 기존 패턴(`WebUISider`/`WebUIHeader` 의 `last_visited_general_path`)에서 언제든 필요해질 수 있다. `undefined` 만 엔트리를 지우고 `null` 은 직렬화되는 ahooks `isUndef` 의 미묘한 동작까지 그대로 옮겼다.                                                                                                                        |
| **PA-9**  | 테스트 목(mock) 3건은 `vi.mock('ahooks')` → `vi.mock('backend.ai-ui')` 로 옮기면서 **부분 목**으로 바꿨다. `NetworkStatusBanner.test.tsx` 는 `importActual('backend.ai-ui')` 가 BUI 로케일 부트스트랩을 끌고 오므로 `react-i18next` 목도 `importOriginal` 기반으로 넓혔다. `useKeyboardShortcut.test.ts` 만 factory 목 유지 — 그 훅은 BUI 에서 `useEventListener` 하나만 쓴다.                                                                                                                                                                                     |
| **PA-10** | `react/vite.config.ts` 의 `optimizeDeps.include` 에서 `'ahooks'` 를 제거했다. 남겨두면 dev server 가 매 부팅마다 `Failed to resolve dependency: ahooks` 를 찍는다.                                                                                                                                                                                                                                                                                                                                                                                                 |

## 산출물

| 경로                                                                                                                                                                             | 내용                                                                                          |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `packages/backend.ai-ui/src/hooks/internal/useLatest.ts`                                                                                                                         | `useLatest` + `useLatestCallback` (내부 전용)                                                 |
| `packages/backend.ai-ui/src/hooks/internal/domTarget.ts`                                                                                                                         | `BasicTarget`/`getTargetElement`/`useEffectWithTarget`                                        |
| `.../hooks/useControllableValue.ts`                                                                                                                                              | + `.test.tsx` (14 케이스)                                                                     |
| `.../hooks/useToggle.ts`                                                                                                                                                         | + `.test.ts` (5)                                                                              |
| `.../hooks/useStorageState.ts`                                                                                                                                                   | `createUseStorageState` / `useLocalStorageState` / `useSessionStorageState` + `.test.ts` (12) |
| `.../hooks/useUpdateEffect.ts`                                                                                                                                                   | + `.test.ts` (5)                                                                              |
| `.../hooks/useNetwork.ts`                                                                                                                                                        | + `.test.ts` (3)                                                                              |
| `.../hooks/useDebounce.ts`                                                                                                                                                       | + `.test.ts` (5)                                                                              |
| `.../hooks/useDebounceFn.ts`                                                                                                                                                     | + `.test.ts` (6)                                                                              |
| `.../hooks/useThrottleFn.ts`                                                                                                                                                     | + `.test.ts` (4)                                                                              |
| `.../hooks/usePrevious.ts`                                                                                                                                                       | + `.test.ts` (4)                                                                              |
| `.../hooks/useHover.ts`                                                                                                                                                          | + `.test.tsx` (4)                                                                             |
| `.../hooks/useEventListener.ts`                                                                                                                                                  | + `.test.tsx` (7)                                                                             |
| `.../hooks/index.ts`                                                                                                                                                             | 공개 export                                                                                   |
| 호출부 90개 파일                                                                                                                                                                 | import specifier 치환 (호출 형태 무변경)                                                      |
| `react/package.json`, `packages/backend.ai-ui/package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `.cspell.json`, `packages/backend.ai-ui/README.md`, `react/vite.config.ts` | ahooks 제거                                                                                   |
| `.claude/rules/use-effect-event.md`, `.claude/skills/{react-component-basics,react-hooks-extraction,relay-infinite-scroll-select}`                                               | ahooks 를 가리키던 에이전트 문서 갱신                                                         |

**남은 `ahooks` 문자열** — (1) 이식 모듈의 MIT 출처 표기, (2) `use-effect-event.md`
의 "더 이상 의존성이 아니다"라는 역사적 서술, (3)
`pnpm-lock.chore!fr-2856-enable-global-virtual-store.yaml` (FR-2866 이전에 실수로
커밋된 브랜치 락파일 유물 — 이 티켓 범위 밖), (4)
`.scratch/astryx-migration/issues/26-complex-selector.md` 의 P26-5 기록(당시 결정의
역사적 기록이므로 보존; 본 티켓이 그 결정을 대체한다).

## 검증

- BUI hook 단위 테스트 **69 케이스** 전부 green (`vi.useFakeTimers()` 로 타이밍 고정)
- BUI 전체 vitest: 532 passed / 1 skipped
- react 전체 vitest: 1170 passed (64 파일)
- `bash scripts/verify.sh` → `=== ALL PASS ===`
- `pnpm --filter backend.ai-ui build` OK, `pnpm run build:react-only` OK
- `pnpm why ahooks` 출력 없음, `pnpm-lock.yaml` 내 `ahooks` 0건
- 라이브 스모크(vite :5990, 실 백엔드): 12/12 PASS, **pageErrors 0**
  (`.scratch/astryx-migration/shots/ahooks/`, light+dark)
