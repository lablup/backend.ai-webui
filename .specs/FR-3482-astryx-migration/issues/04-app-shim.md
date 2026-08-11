# 04 — App 셰임 반입 (expand)

**Target:** main
**Blocked by:** 01, 02
**Status:** done

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** App.useApp() 드롭인 셰임(BAIAppProvider + 싱글턴 브리지, message 4종/modal confirm·error·info, LayerProvider 루트 마운트) 반입. 파일럿의 app-shim(205 LOC)을 일반화(~450 LOC 설계는 answers/07). 대량 적용은 티켓 11.

## Acceptance criteria

- [x] 파일럿 수준 message/modal 흐름 재현(Promise 반환·자동 닫힘 의미론) —
      message 4종은 antd `MessageType`(close 함수 + thenable) 반환, 초 단위
      duration/`0`=sticky/`onClose`/`key`→uniqueID; modal confirm·error·info·
      warning·success는 antd 핸들(`destroy` + thenable, ok→true/cancel→false),
      async `onOk`는 로딩 표시 후 resolve 시 닫힘·reject 시 열림 유지.
- [x] 1개 화면에서 실동 검증 — 로그인 화면(LoginView + LoginFormPanel)을
      셰임으로 전환, dev 서버 + Playwright로 12/12 체크 통과
      (`shots/measure-04-app-shim.mjs`, 스크린샷 `shots/04/`).
- [x] verify.sh ALL PASS

## Implementation notes (2026-08-07)

**Built — `react/src/app-shim/` (core 702 LOC + tests 153 LOC):**

- `bridge.ts` (70) — toast 싱글턴 브리지. `registerBridge`/`withBridge` +
  마운트 전 호출 큐(파일럿 설계 유지), 여기에 `<App message={{duration}}>`
  대응 전역 message 설정(`setMessageConfig`) 추가. **modal은 브리지를 쓰지
  않음** — 태스크 스토어가 호스트 마운트 전 호출을 자연 보관.
- `message.tsx` (185) — antd `message` 드롭인. 4종 + `open({type})` +
  ArgsProps 객체형(`isValidElement` 가드로 JSX 콘텐츠 오판 방지, answers/07
  리스크 2 대응). 반환값은 antd `MessageType`(close 함수이면서 thenable —
  닫힘 시 resolve). 초→ms 변환, `duration 0`=sticky, `key`→`uniqueID`
  (+'overwrite' = antd keyed-replace와 동일). `loading`/`destroy`는 0 usage
  라 명시적 throw(무음 드롭 방지).
- `modal.tsx` (329) — antd `modal.confirm/error/info/warning/success` 드롭인.
  Astryx `useImperativeAlertDialog`는 **cancel 신호를 삼키고**(내부
  onOpenChange가 닫기만 함) show 후 `isActionLoading` 갱신도 불가라서 훅 대신
  **모듈 스토어 + `useSyncExternalStore` 호스트** 구조로 일반화: 태스크별
  ok-로딩 상태·cancel 콜백·동시 다중 모달을 모두 지원. 분기(answers/07 §4):
  confirm+평문 title/content → `AlertDialog`(role=alertdialog, Escape=cancel,
  backdrop 차단 = antd confirm 기본값), 그 외(ReactNode content, 단일 버튼
  error/info류 — AlertDialog는 cancel 버튼 강제라서) → `Dialog`+`Layout`+
  `DialogHeader`+`Button` 수동 조립(purpose="form"). Promise 의미론: async
  `onOk` resolve→닫힘+true, reject→열림 유지(antd 동일), cancel/Escape/헤더
  X→`onCancel()`+false, `destroy()`→콜백 없이 false resolve. `update()`는
  0 real usage라 throw.
- `index.tsx` (118) — `useApp()`/`App.useApp` 드롭인 + `BAIAppProvider`
  (LayerProvider + 브리지 마운트 + 모달 호스트, `message`/`toast` 설정 prop).
  dev 전용 `window.__baiAppShim` 핸들(백엔드 필요 트리거 — 409 concurrent
  session 등 — 없이 실동 검증용; 프로덕션 번들에서 트리쉐이킹).
- `appShim.test.tsx` (153) — vitest 10건: 4종→2way 매핑, duration 의미론
  (기본 3s/설정 4s/0=sticky), ArgsProps+onClose, close 핸들 thenable,
  마운트 전 큐잉+선닫힘 드롭, loud stub, modal 핸들(thenable/destroy 무콜백/
  동시 태스크 독립).

**Wiring:**

- `DefaultProviders.tsx` — `<BAIAppProvider message={commonAppProps.message}>`
  를 ThemeShimProvider 안, antd `<App>` 밖에 마운트(파일럿과 동일 위상 —
  미전환 파일은 antd `<App>`을, 전환 파일은 셰임을 읽음).
- 적용 1화면: 로그인 — `LoginView.tsx`(modal.confirm, 409 concurrent-session
  분기)와 `LoginFormPanel.tsx`(message.success/error, TOTP·비밀번호 변경
  메일 흐름)의 `import { App } from 'antd'` → `'../app-shim'` 스왑.
  LoginView의 중첩 antd `<App>` **엘리먼트**는 `App as AntdApp`으로 유지 —
  이 서브트리의 미전환 자식(SignupModal 등)이 antd 컨텍스트를 계속 읽음
  (번역 프런티어).

**Measured (재현: dev 서버 5299 + `node .scratch/astryx-migration/shots/measure-04-app-shim.mjs`):**

12/12 PASS — 셰임 로드(스크린 임포트 경유), message thenable 자동닫힘
(1066ms≈1s), sticky+성공 글리프, close 핸들 resolve, error 토스트
data-type=error, `.ant-message` 부재(Astryx가 토스트 소유), modal.confirm
alertdialog 렌더, cancel→onCancel+false, async onOk 로딩중 열림→resolve 후
닫힘+true, reject→열림 유지+Escape cancel, modal.error OK 단일 버튼+true.
스크린샷: `shots/04/{message-error-toast,modal-confirm-alertdialog,modal-error-dialog}.png`.

**PILOT-DECISION:**

- **토스트 위치는 Astryx 기본(bottom-end) 유지** — antd message는 top-center
  지만 defaults-first 정책. 조정 필요 시 `BAIAppProvider toast={{position}}`
  한 줄.
- **4종→2종 축약**: success/warning→`info` + 리딩 글리프(lucide `CheckIcon`/
  `TriangleAlertIcon`, currentColor — 토큰명 오기 리스크(P19) 회피), 색 복원은
  theme 확장으로만. info/error는 글리프 없음(Astryx가 배경색으로 구분).
- **무대응 antd props는 수용 후 무시**: `centered`(Astryx 항상 중앙),
  `zIndex`(native `<dialog>` top-layer), `icon`(슬롯 없음),
  `maskClosable`/`keyboard`(purpose가 지배 — antd confirm 기본값 고정).
- **JSX title은 텍스트 평탄화**(`toText`) — DialogHeader.title이 string.

**Deferred:**

- 대량 적용(~134 call sites)은 티켓 11. `Modal.useModal()`/`message.useMessage()`
  /정적 `import {message}` 6파일 + `VFolderTextFileEditorModal` 커스텀 푸터
  1건은 answers/07 §5의 수동 목록.
- `notification` 레그는 비범위 — `useBAINotification.tsx` 단일 파일에 격리
  (answers/07 §2), 독립 티켓.
