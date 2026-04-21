# sToken 로그인 경계 컴포넌트 (sToken Login Boundary)

## 개요

URL 쿼리 파라미터 `sToken`을 통해 Backend.AI에 SSO 방식으로 로그인하는 플로우를, 재사용 가능한 단일 React 컴포넌트로 추출한다. 현재 동일한 sToken 인증 로직이 `LoginView.tsx`와 `EduAppLauncher.tsx` 두 곳에 각각 다른 형태로 복제되어 있어, 쿠키 인코딩, URL 파라미터 대소문자 처리, `backend-ai-connected` 이벤트 디스패치 시점 등이 서로 다르게 구현되어 있다. 이 불일치는 향후 외부 플랫폼 통합(교육·파트너·SSO 엔트리 포인트 추가)이 늘어날 때마다 동일한 버그와 보안 고려사항을 반복해서 해결해야 하는 문제를 만든다.

본 스펙은 이 플로우를 에러 바운더리와 유사한 "로그인 경계 컴포넌트"로 추출하여, 자식 트리가 마운트되기 전 sToken 인증을 완료하고 Relay 환경이 안전하게 동작할 수 있는 상태를 보장하는 것을 목표로 한다.

## 문제 정의

### 현재 상태의 중복과 불일치

현재 sToken 기반 로그인 로직은 다음 두 호출 지점에 독립적으로 구현되어 있다.

**1. `react/src/components/LoginView.tsx` — `connectUsingSession()` (lines 405–490)**

- URL 파라미터는 `sToken`만 인식 (`urlParams.get('sToken')`, 대소문자 구분)
- 쿠키 값을 **인코딩하지 않음**: `document.cookie = sToken=${sToken}; ...`
- `helper/loginSessionAuth.ts:175`의 `tokenLogin(client, sToken, cfg, endpoints)` 헬퍼 사용 (extraParams 전달 경로 없음)
- 성공 시 `postConnectSetup(client)` 실행 — `last_login` 카운터, `clearSavedLoginInfo`, `backend-ai-connected` 이벤트 디스패치, 엔드포인트 localStorage 저장, `main-layout-ready` 대기 후 패널 닫기
- 성공 시 `window.history.replaceState({}, '', '/')` 로 URL에서 sToken 제거
- 멀티탭/자동 로그아웃/config 게이팅은 `useLoginOrchestration()` 훅이 담당

**2. `react/src/components/EduAppLauncher.tsx` — `_token_login()` (lines 201–237)**

- URL 파라미터는 `sToken`과 `stoken` **둘 다 허용** (대소문자 혼용)
- 쿠키 값을 `encodeURIComponent(sToken)`으로 **인코딩**
- 다른 URL 파라미터를 모두 `extraParams`로 수집하여 `client.token_login(sToken, extraParams)`로 전달
- URL에서 sToken을 **제거하지 않음** (URL이 그대로 브라우저 히스토리에 남음)
- `backend-ai-connected` 이벤트를 `_launch()` 내부 별도 위치(line 787)에서 수동 디스패치하며, `LoginView`를 경유하지 않음
- 자체 상태 머신(`idle → auth → session → launching → done/error`) 관리

### 이 중복이 만드는 구체적 위험

1. **Relay 환경 race**: `RelayEnvironment.ts`의 `waitForBAIClient()`는 `'backend-ai-connected'` 이벤트를 기다려야만 해제된다. 두 호출 지점에서 이벤트 디스패치 순서가 다르기 때문에, 새로운 진입 지점을 추가할 때마다 Relay 쿼리 블로킹 규칙을 재학습해야 한다.
2. **URL sToken 유출**: EduAppLauncher 경로에서는 sToken이 URL에 남아 브라우저 히스토리·referer·공유 링크를 통해 유출될 위험이 있다.
3. **쿠키 인코딩 불일치**: 한쪽은 인코딩하고 다른 쪽은 하지 않아, 백엔드 쿠키 파서가 두 형식 모두를 허용한다는 암묵적 가정에 의존하고 있다.
4. **파라미터 이름 규칙 부재**: `sToken` vs `stoken` 허용 여부가 경로별로 다르며, 외부 플랫폼 문서화 없이 내부 코드 관찰로만 알 수 있다.
5. **유지보수 비용**: 신규 SSO 진입점을 추가할 때마다 두 구현 중 하나를 모방하게 되며, 모방 대상에 따라 보안·UX 기본값이 달라진다.

## 목표 / 비목표

### 목표

- sToken 기반 로그인 흐름을 재사용 가능한 React 컴포넌트 하나로 추출한다.
- 컴포넌트의 API는 호출자가 부가적인 후처리(패널 닫기, 멀티탭 상태, `last_login` 카운터 등)를 자유롭게 수행할 수 있도록 **최소한의 책임**만 갖는다.
- `LoginView`와 `EduAppLauncher` 양쪽을 새 컴포넌트로 마이그레이션하여 중복 로직을 제거한다.
- 마이그레이션은 **각 호출 지점마다 독립된 PR**로 분리하여 스택 기반으로 진행한다.
- 쿠키 인코딩, URL 정리, 파라미터 이름 규칙을 컴포넌트 내부에 **단일 표준**으로 고정한다.

### 비목표 (Out of Scope)

- `useLoginOrchestration`이 담당하는 멀티탭 동기화, 자동 로그아웃, config 게이팅은 컴포넌트 범위에 포함하지 않는다. LoginView가 계속 담당한다.
- 일반 세션 로그인(ID/PW) 플로우의 추출은 이 스펙에 포함하지 않는다. 본 컴포넌트는 **sToken 경로 전용**이다.
- 동시 로그인 세션(Concurrent Login) 모달 UI는 이 컴포넌트가 제공하지 않는다. 에러 종류로만 노출하며, 처리는 `.specs/draft-concurrent-login-guard/spec.md`를 따른다.
- `last_login` 카운터, `clearSavedLoginInfo`, `localStorage('backendaiwebui.api_endpoint')` 저장, `setPluginApiEndpoint`, `main-layout-ready` 대기, 로그인 패널 닫기 등 **호출자 고유의 후처리**는 컴포넌트가 수행하지 않는다. 호출자가 `onSuccess` 콜백에서 처리한다.
- Backend.AI Manager 서버 측 변경은 포함하지 않는다.
- Storybook 스토리 작성은 이 스펙의 필수 항목이 아니다 (후속 dev-plan에서 결정).

## 사용자 시나리오

### 시나리오 1: `LoginView`를 통한 sToken URL 진입

1. 외부 시스템이 `https://webui.example.com/?sToken=...`로 사용자를 리다이렉트한다.
2. `LoginView`가 마운트되면서 경계 컴포넌트로 자식 트리를 감싼다.
3. 경계 컴포넌트가 URL에서 `sToken`을 읽고, 기본 fallback(연결 중 카드)을 표시한다.
4. 쿠키 설정 → 엔드포인트 resolve → 클라이언트 생성 → `client.token_login(sToken)` → `globalThis.backendaiclient` 설정 → `'backend-ai-connected'` 이벤트 디스패치 → URL에서 sToken 제거 순으로 수행한다.
5. 성공 시 `onSuccess(client)` 콜백이 호출되며, `LoginView`는 기존 `postConnectSetup` 로직(패널 닫기, `last_login` 카운터, localStorage 저장 등)을 실행한다.
6. 자식 트리(메인 레이아웃)가 마운트되고, 내부 Relay 쿼리가 정상적으로 인증된 클라이언트로 수행된다.

### 시나리오 2: `EduAppLauncher`를 통한 sToken URL 진입

1. 외부 교육 플랫폼이 `https://webui.example.com/eduapi?sToken=...&app=jupyter&session_id=...`로 사용자를 리다이렉트한다.
2. `EduAppLauncherPage`가 엔드포인트 resolve 후 `EduAppLauncher`를 렌더하며, `EduAppLauncher`는 자신의 스테퍼 UI 내부에서 경계 컴포넌트로 자식 트리를 감싼다.
3. 경계 컴포넌트가 URL에서 `sToken`/`stoken`을 읽고 나머지 파라미터를 `extraParams`로 전달받아 `client.token_login(sToken, extraParams)`를 호출한다.
4. `extraParams`(app, session_id, cpu, mem 등)은 그대로 백엔드에 전달되어 기존 동작을 유지한다.
5. 성공 후 `EduAppLauncher`는 `onSuccess` 콜백에서 기존 `_prepareProjectInformation` → 세션 조회/생성 → 앱 런칭 스텝을 이어서 진행한다.
6. URL에서 sToken은 제거되지만 나머지 파라미터는 유지된다 (EduAppLauncher가 URL 파라미터를 여전히 참조하므로).

### 시나리오 3: 미래의 제3 SSO 엔트리 포인트 (비전, 이 스펙 범위 밖)

- 향후 추가될 수 있는 파트너 통합·이메일 매직 링크 등의 진입점은 경계 컴포넌트를 그대로 재사용하여 Relay 환경 초기화 race와 URL 정리·쿠키 인코딩 등 기본 보안 요구를 자동으로 만족한다. 이 스펙은 그 기반을 제공하는 것이 목표이다.

## 컴포넌트 설계

### 이름과 배치

**이름**: `STokenLoginBoundary`

**근거**: 사용자 요청에서 "에러 바운더리 이런 식으로"라고 표현된 비유를 따른다. React의 ErrorBoundary가 자식 트리 렌더링 중 발생하는 에러를 경계에서 차단·처리하듯, 이 컴포넌트는 자식 트리 마운트 전에 sToken 인증이라는 **전제 조건**을 해결한다. 인증이 완료되기 전에는 자식을 렌더하지 않는다는 점에서 "boundary"라는 명명이 의미적으로 맞다.

**배치**: `react/src/components/STokenLoginBoundary.tsx` — 다른 주요 컴포넌트들과 동일한 경로. 관련 타입(`STokenLoginError`)은 동일 파일에서 export하거나, 파일이 커지면 `react/src/components/STokenLoginBoundary/` 디렉터리로 분리한다.

### Props API

```tsx
interface STokenLoginBoundaryProps {
  // 필수
  children: React.ReactNode;

  // 선택 — 생략 시 URL 쿼리에서 추출 (sToken canonical, stoken deprecated)
  sToken?: string;

  // client.token_login에 두 번째 인자로 그대로 전달되는 추가 파라미터
  extraParams?: Record<string, string>;

  // 생명주기 훅 — 호출자가 자신의 후처리를 수행
  onSuccess?: (client: BackendAIClient) => void;
  onError?: (error: STokenLoginError) => void;

  // 렌더 슬롯 — 둘 다 선택, 기본 UI 제공
  fallback?: React.ReactNode;
  errorFallback?: (error: STokenLoginError, retry: () => void) => React.ReactNode;
}
```

**주의: `apiEndpoint` prop은 제공하지 않는다.** 엔드포인트는 컴포넌트 내부에서 config.toml 기반 훅으로 resolve한다. 테스트용 override는 첫 이터레이션에 포함하지 않으며, 필요해질 경우 후속 이슈에서 결정한다.

### 에러 분류 (`STokenLoginError`)

```tsx
type STokenLoginError =
  | { kind: 'missing-token' }                          // URL·prop 모두에서 sToken을 찾지 못함
  | { kind: 'endpoint-unresolved'; cause: unknown }     // config.toml fetch/parse 실패 또는 엔드포인트 빈 문자열
  | { kind: 'server-unreachable'; cause: unknown }      // get_manager_version 등 사전 확인 실패
  | { kind: 'token-invalid'; cause: unknown }           // token_login이 false 반환 또는 인증 실패 예외
  | { kind: 'concurrent-session'; cause: unknown }      // 서버가 동시 세션 상태를 반환한 경우 (상세는 concurrent-login-guard 스펙 참조)
  | { kind: 'unknown'; cause: unknown };                // 상기 분류에 해당하지 않는 기타 예외
```

각 분류는 `onError`로 전달되며, 기본 에러 카드 UI도 분류별 메시지를 표시한다. `cause`는 원본 예외를 보존한다.

### 내부 동작 시퀀스

경계 컴포넌트는 성공 상태가 되기 전까지 **절대 자식을 렌더하지 않는다**. 동작 순서는 다음과 같다.

1. **마운트**: 컴포넌트가 마운트되면 `fallback`(기본: 연결 중 카드) 렌더.
2. **sToken 읽기**: prop으로 받았으면 그 값을 사용. 아니면 `new URLSearchParams(window.location.search)`에서 `sToken` → (없으면) `stoken` 순으로 조회. `stoken`(소문자)을 사용한 경우 `logger.warn`을 1회 호출하고 `sToken`(대소문자 유지)을 canonical로 취급.
3. **부재 시 에러**: sToken 값이 비어 있거나 없으면 `{ kind: 'missing-token' }` 에러 상태로 전이.
4. **엔드포인트 resolve**: 공용 엔드포인트 resolve 훅을 사용하여 config.toml에서 엔드포인트를 얻는다 (#엔드포인트-resolve-훅 섹션 참조). 실패 시 `{ kind: 'endpoint-unresolved', cause }`.
5. **쿠키 설정**: `document.cookie = sToken=${encodeURIComponent(sToken)}; path=/; Secure; SameSite=Lax; expires=Session`로 설정. 값은 **항상 인코딩**한다.
6. **클라이언트 생성**: `createBackendAIClient('', '', endpoint, 'SESSION')`로 Backend.AI 클라이언트 인스턴스를 만들고 `globalThis.backendaiclient`에 할당한다.
7. **서버 ping (선택적 방어 단계)**: `client.get_manager_version()`을 호출하여 서버 도달 가능 여부를 사전 확인. 실패 시 `{ kind: 'server-unreachable', cause }`.
8. **토큰 로그인**: `await client.token_login(sToken, extraParams ?? {})`. 반환이 falsy거나 예외 발생 시 `{ kind: 'token-invalid', cause }` 또는 서버 응답으로부터 동시 세션이 감지되면 `{ kind: 'concurrent-session', cause }`로 분류.
9. **GQL 연결**: `connectViaGQL(client, loginConfig, endpoints)`를 호출해 사용자 정보 및 리소스 정책을 로드.
10. **이벤트 디스패치**: `document.dispatchEvent(new CustomEvent('backend-ai-connected', { detail: client }))`를 **정확히 한 번** 디스패치한다. 이 이벤트는 `RelayEnvironment.ts`의 `waitForBAIClient()`를 해제하는 핵심 신호이다.
11. **URL 정리**: `window.history.replaceState()`로 쿼리스트링에서 `sToken`과 `stoken`만 제거한다. 다른 쿼리 파라미터는 유지한다 (EduAppLauncher가 `session_id`, `app` 등을 후속 단계에서 사용함).
12. **성공 콜백**: `onSuccess?.(client)` 호출. 호출자는 이 시점에서 자신의 후처리(패널 닫기, `last_login` 등)를 수행.
13. **자식 렌더**: 성공 상태 전이 후 `children`을 렌더.

### 멱등성과 재시도

- Retry 동작은 내부 상태를 초기 상태(idle)로 되돌린 뒤 위 시퀀스를 재실행한다.
- 쿠키 재설정은 동일 값으로 덮어쓰므로 문제가 없다.
- `'backend-ai-connected'` 이벤트는 **성공한 최종 시도에서만 1회 디스패치**되어야 한다. 재시도 과정에서 이전 실패 시에 이벤트가 누출되지 않도록 한다.
- `globalThis.backendaiclient`는 성공 시점에 최신 client 인스턴스로 할당한다.

## 에러 처리 & 기본 에러 카드 UI

호출자가 자체 에러 UI를 제공하지 않을 경우, 컴포넌트는 **기본 내장 에러 카드**를 렌더한다. 사용자가 "무언가를 할 수 있는" 카드여야 하며, 단순 텍스트 에러 메시지로는 불충분하다.

### 요구 사항

- 에러 카드는 `BAICard` 기반으로 구성한다 (프로젝트 컴포넌트 컨벤션 따름).
- 카드 헤더에는 에러 분류(`STokenLoginError.kind`)에 맞춘 i18n 제목을 표시한다.
- 카드 본문에는 사람이 읽을 수 있는 설명 + 원본 예외 메시지를 접힘/펼침 가능한 영역에 표시한다.
- 카드 액션은 최소 두 개를 제공한다:
  - **Retry** (`BAIButton`의 `action` prop 사용 — 비동기 재시도 중 자동 로딩 상태 표시)
  - **Copy error details** (에러 분류 + cause의 JSON 직렬화 결과를 클립보드에 복사, 지원 문의 시 사용)
- `errorFallback` prop이 주어지면 기본 카드 대신 호출자 정의 렌더를 사용한다. 이 경우 `retry` 함수가 두 번째 인자로 전달되며, 호출자가 원하는 UI에서 이를 트리거한다.
- EduAppLauncher는 자체 스테퍼 UI와 통합된 에러 표시가 필요하므로 `errorFallback`을 사용한다.

### 에러 분류별 UX 원칙 (참고)

| kind | 기본 UX | 커스텀 UX 예시 |
|------|---------|----------------|
| `missing-token` | "토큰이 URL에 포함되지 않았습니다" + Retry(새로고침과 동일) | LoginView: 경계 컴포넌트를 감싸지 않고 sToken 존재 시에만 렌더하도록 분기 |
| `endpoint-unresolved` | "서버 설정을 불러오지 못했습니다" + Retry + Copy | 관리자 안내 문구 추가 |
| `server-unreachable` | "서버에 연결할 수 없습니다" + Retry + Copy | — |
| `token-invalid` | "토큰이 만료되었거나 유효하지 않습니다" + Retry 없음/있음(정책 결정) | 외부 플랫폼으로 돌아가는 링크 노출 |
| `concurrent-session` | 기본 카드에 간단한 안내만, 상세 처리는 호출자 책임 (LoginView의 모달) | LoginView: 기존 동시 세션 확인 다이얼로그 |
| `unknown` | 일반 에러 메시지 + Retry + Copy | — |

## 엔드포인트 resolve 훅

### 결정

`react/src/hooks/useEduAppApiEndpoint.ts`의 `useEduAppApiEndpoint`가 이미 config.toml을 Suspense-friendly하게 resolve하는 선례다. 이 훅의 책임은 본질적으로 "config.toml → `general.apiEndpoint` → localStorage fallback" 순의 resolution이며 EduAppLauncher 전용이라는 스코프 제한은 코멘트상의 의도일 뿐 로직 자체는 범용이다.

본 스펙은 이 훅을 일반화하여 **`useResolvedApiEndpoint`**(이름은 dev-plan 단계에서 최종 확정)로 이름을 바꾸거나, `useEduAppApiEndpoint`를 그대로 재사용하되 이름의 "Edu"를 제거한 wrapper를 둔다. 선택은 dev-plan 단계에서 결정하며, 본 스펙은 다음을 요구한다.

- 훅은 Suspense-compatible 하게 동작한다 (promise throw 후 결과 캐싱).
- 훅은 `config.toml → localStorage('backendaiwebui.api_endpoint')` 순서로 endpoint를 resolve한다.
- 빈 문자열 반환 시 컴포넌트는 `{ kind: 'endpoint-unresolved' }` 에러로 전이한다.
- `loginConfigState` atom과의 관계: LoginView 경로에서는 이미 atom에 endpoint가 설정되어 있을 수 있으나, 경계 컴포넌트는 **atom에 의존하지 않는다**. LoginView 경로에서는 `LoginView`가 이미 endpoint를 알고 있지만, 경계 컴포넌트가 atom에 관여하기 시작하면 두 플로우 간 결합이 생기므로 파일·config.toml을 단일 source of truth로 고정한다.

### 리팩토링 시 고려사항

- `useEduAppApiEndpoint`는 모듈 스코프에 `cachedEndpoint`와 `inflightPromise`를 보관한다. 일반화 시 동일한 캐시가 여러 호출자를 만족시킬 수 있는지 점검해야 한다 (보통 page lifetime 동안 endpoint는 바뀌지 않으므로 안전하다).
- LoginView 경로에서 `useResolvedApiEndpoint`로 통합할지 여부는 **이 스펙의 story 1에서 결정**하거나 Open Question으로 둔다.

## 마이그레이션 계획

본 스펙은 **세 개의 스택된 PR**로 구현된다. 각 PR은 이전 PR을 기반으로 한다.

### Story 1: `STokenLoginBoundary` 컴포넌트 도입

- 새 파일 `react/src/components/STokenLoginBoundary.tsx` 작성.
- 엔드포인트 resolve 훅을 일반화 (이름 확정 포함).
- `helper/loginSessionAuth.ts`의 `tokenLogin` 헬퍼가 `extraParams`를 받을 수 있도록 확장하거나, 경계 컴포넌트가 `client.token_login` + `connectViaGQL`을 직접 호출하는 경로를 새로 구성한다 ([Open Question 1] 참조).
- 기본 fallback·error card UI 작성.
- 단위 테스트: 각 에러 분류 전이, Retry 멱등성, `backend-ai-connected` 이벤트 1회 발행, URL 정리.
- 기존 호출자는 변경하지 않는다 (Story 2·3에서 순차 마이그레이션).

### Story 2: `LoginView` 마이그레이션

- `connectUsingSession()`의 sToken 분기(현재 lines 455–490)를 제거하고, `STokenLoginBoundary`가 해당 책임을 가져가도록 구조 조정.
- `LoginView`는 URL에 `sToken`이 있으면 `STokenLoginBoundary`로 자식을 감싸고, 그렇지 않으면 기존 로그인 폼을 렌더.
- `onSuccess` 콜백에서 기존 `postConnectSetup`의 책임을 수행: `last_login`/`login_attempt` 카운터, `clearSavedLoginInfo`, `setPluginApiEndpoint`, localStorage endpoint 저장, `main-layout-ready` 대기 후 패널 닫기.
- `useLoginOrchestration`과는 **무관하게** 동작하도록 유지한다. 경계 컴포넌트는 orchestration 훅을 import하지 않는다.
- E2E: 기존 sToken 진입 시나리오가 회귀 없이 통과.

### Story 3: `EduAppLauncher` 마이그레이션

- `_token_login()` 메서드와 수동 `backend-ai-connected` 디스패치(line 787)를 제거.
- `STokenLoginBoundary`를 스테퍼 UI의 "auth" 스텝 내부에 배치하고, `extraParams`는 현재와 동일한 방식으로 URL에서 수집하여 전달.
- `errorFallback` prop으로 스테퍼 UI와 통합된 에러 표시 제공 (기존 `transition({ name: 'error', step: 'auth', ... })` 로직 재사용).
- **동작 변경**: URL에서 sToken이 제거된다 (기존 동작과 달라짐 — 보안 개선). 세션 ID·앱 이름 등 나머지 파라미터는 유지.
- **동작 변경**: 쿠키 인코딩은 기존과 동일 (이미 encoded).
- 내부 상태 머신(idle → auth → session → launching → done/error)은 유지하되, "auth" 단계는 경계 컴포넌트의 상태로 대체.
- E2E: 기존 EduApp 진입 시나리오(세션 ID 있음/없음) 모두 회귀 없이 통과.

## 수락 기준 (Acceptance Criteria)

각 기준은 테스트 가능해야 한다.

### 컴포넌트 자체

- [ ] 컴포넌트가 success 상태가 되기 전까지는 `children` 내부의 Relay 쿼리가 실행되지 않는다. (단위 테스트에서 Relay network spy 또는 mock으로 검증)
- [ ] `'backend-ai-connected'` 이벤트는 성공 시 **정확히 한 번** 디스패치된다. 재시도 중 이전 실패 시에는 발행되지 않는다.
- [ ] 성공 시 `globalThis.backendaiclient`가 새 클라이언트 인스턴스로 설정된다.
- [ ] sToken이 없는 경우 `{ kind: 'missing-token' }` 에러가 `onError`로 전달되고 기본 에러 카드가 렌더된다.
- [ ] URL 쿼리에 `stoken`(소문자)으로 들어온 경우 `logger.warn`이 **1회만** 호출되며, 값은 `sToken`과 동일하게 처리된다.
- [ ] success 시 `window.location.search`에서 `sToken`과 `stoken` 키가 모두 제거되며, 다른 키는 유지된다.
- [ ] `extraParams`가 `client.token_login`의 두 번째 인자로 그대로 전달된다 (prop으로 전달한 객체와 동일한 키·값이 전달됨).
- [ ] 쿠키 `sToken=...`이 설정될 때 값은 `encodeURIComponent(sToken)` 결과와 정확히 일치한다.
- [ ] Retry 재시도 시 쿠키는 동일 값으로 재설정되며, `'backend-ai-connected'` 이벤트는 최종 성공 시점에서만 1회 디스패치된다.
- [ ] `errorFallback`이 제공되면 기본 카드 대신 호출자의 렌더가 사용되며, `retry` 함수 호출 시 인증 시퀀스가 초기 상태부터 재실행된다.
- [ ] Retry 실행 중에는 fallback UI가 다시 표시된다 (또는 `errorFallback` 사용 시 호출자의 로딩 UX로 위임).

### 엔드포인트 resolve

- [ ] 엔드포인트 resolve 훅이 config.toml의 `general.apiEndpoint`를 반환한다.
- [ ] config.toml fetch 실패 시 localStorage `backendaiwebui.api_endpoint` fallback이 동작한다.
- [ ] 두 source 모두 비어 있으면 `{ kind: 'endpoint-unresolved' }` 에러로 전이한다.

### 마이그레이션

- [ ] Story 2 적용 후 LoginView의 sToken 진입 시나리오가 기존 E2E 테스트(또는 수동 회귀 절차)를 통과한다.
- [ ] Story 3 적용 후 EduAppLauncher의 sToken 진입 시나리오(세션 ID 있음·없음)가 회귀 없이 통과한다.
- [ ] 두 호출 지점 모두에서 `useLoginOrchestration`을 경계 컴포넌트가 import하지 않는다 (grep 가능 검증).
- [ ] 마이그레이션 후 `LoginView.tsx`에서 `connectUsingSession()` 내 sToken 분기가 제거되며, `EduAppLauncher.tsx`에서 `_token_login()` 메서드와 수동 `backend-ai-connected` 디스패치가 제거된다.

## Pitfalls 및 유의사항

1. **Relay 환경 초기화 race**: `'backend-ai-connected'` 이벤트 디스패치 이전에 자식 트리를 마운트하면 내부 Relay 쿼리가 영원히 대기한다. 컴포넌트는 이벤트 디스패치 완료 후에만 `children`을 렌더해야 한다 (testable invariant).
2. **`useLoginOrchestration`과의 경계**: 멀티탭 동기화, 자동 로그아웃, config 게이팅은 경계 컴포넌트의 책임이 아니다. 이 부분은 LoginView가 계속 소유한다.
3. **쿠키 인코딩 백엔드 호환성**: `encodeURIComponent(sToken)`으로 설정한 쿠키를 Manager/Webserver가 정상 파싱하는지 **검증이 필요**하다. 대부분의 웹서버는 쿠키 값을 자동으로 `decodeURIComponent` 하지만, Backend.AI 측 구현을 코드 단에서 한 번 확인해야 한다.
4. **`stoken`(소문자) deprecation 경로**: 본 스펙은 인식만 유지하고 경고만 출력한다. 하드 제거 시점은 외부 플랫폼 공지 후 별도 이슈에서 결정한다.
5. **concurrent-session 에러와 동시 로그인 스펙 연계**: `{ kind: 'concurrent-session' }` 에러의 상세 처리(모달, 기존 세션 종료 확인 등)는 `.specs/draft-concurrent-login-guard/`의 LoginView 측 대응과 연계되어야 한다. sToken 플로우에서는 외부 리다이렉트 주체가 모달을 띄우기 어렵기 때문에, 이 에러 분류를 어떻게 surface할지는 dev-plan 단계에서 LoginView의 모달 로직과 함께 설계한다.
6. **Retry 멱등성**: 중복 쿠키 설정은 안전하나, 중복 이벤트 디스패치는 하위 구독자(예: proxy URL 설정, 플러그인 초기화)가 여러 번 실행되어 사이드이펙트를 낳을 수 있다. 구현 단계에서 "이벤트는 최종 성공 시 1회"를 엄격히 지킨다.
7. **URL 파라미터 보존 범위**: sToken/stoken만 제거하고 나머지(`app`, `session_id`, `cpu`, `mem` 등)는 유지해야 EduAppLauncher의 후속 단계가 동작한다. LoginView 기존 동작(`replaceState({}, '', '/')`처럼 전체 쿼리를 날리는)과 달라지므로 마이그레이션 시 검증 필요.
8. **`backendaiclient._config.endpoint` 스테일 closure**: `LoginView`의 기존 `postConnectSetup`은 `apiEndpoint` closure 대신 client의 `_config.endpoint`를 읽어 최신 값을 취한다. 경계 컴포넌트 마이그레이션 시에도 `onSuccess(client)`에서 `client._config.endpoint`를 참조하여 localStorage에 저장해야 한다.
9. **StrictMode 이펙트 2회 실행**: dev StrictMode에서 effect가 2회 실행되는 문제를 guard하기 위해 `useRef` 플래그 또는 key 기반 재마운트를 사용한다. 특히 쿠키 설정·서버 ping·token_login이 중복 수행되지 않도록 `started` flag를 둔다.
10. **Webserver config 병합**: 기존 `loadConfigFromWebServer`는 `apiEndpoint`와 현재 origin이 다를 때 원격 config.toml을 병합하는 단계를 수행한다. 경계 컴포넌트가 이 단계를 포함해야 하는지는 dev-plan에서 결정한다. 포함하지 않으면 호출자가 `onSuccess` 이후 수행할 수도 있다 ([Open Question 2]).

## Risks & Open Questions

1. **`tokenLogin` 헬퍼 확장 vs 우회**: `helper/loginSessionAuth.ts:175`의 `tokenLogin(client, sToken, cfg, endpoints)`는 현재 `client.token_login(sToken)`만 호출한다 (extraParams 전달 경로 없음). 경계 컴포넌트는 두 가지 중 하나를 선택한다.
   - (a) 헬퍼를 `tokenLogin(client, sToken, cfg, endpoints, extraParams?)`로 확장하고 내부에서 `client.token_login(sToken, extraParams)`를 호출하도록 변경. LoginView는 extraParams 없이 호출, EduAppLauncher는 URL 파라미터를 extraParams로 전달.
   - (b) 경계 컴포넌트가 헬퍼를 우회하여 `client.token_login` + `connectViaGQL`을 직접 호출하고, LoginView의 기존 헬퍼 호출 경로는 제거.
   **추천**: (a). 기존 헬퍼의 `connectViaGQL` 호출 책임이 유용하며, extraParams를 optional 파라미터로 추가하는 변경은 기존 LoginView 호출자에 영향이 없다. 최종 결정은 Story 1 dev-plan에서 확정.

2. **`loadConfigFromWebServer` 포함 여부**: LoginView의 일반 로그인 경로는 login 후 webserver config를 병합한다. sToken 경로가 동일하게 병합해야 하는지, 외부 플랫폼 시나리오에서 이것이 관찰되는 동작인지 확인 필요.

3. **엔드포인트 resolve 훅 이름**: `useEduAppApiEndpoint`를 `useResolvedApiEndpoint`로 rename할지, 새 이름의 wrapper를 두고 기존 것을 유지할지는 dev-plan 단계에서 결정.

4. **`errorFallback`으로 처리하지 못하는 치명적 에러**: 예를 들어 `endpoint-unresolved`가 발생한 상태에서는 EduAppLauncher의 스테퍼 UI 자체가 의미 있게 렌더되지 못할 수 있다. 이 경우에도 `errorFallback`이 우선되는지, 아니면 기본 카드로 fall through하는지 정책을 dev-plan에서 확정한다.

5. **쿠키 인코딩 백엔드 호환성**: Manager/Webserver에 실제로 `decodeURIComponent` 파싱 동작이 존재하는지 코드 확인 필요. 만약 서버가 raw 값을 기대한다면 기존 LoginView 동작이 맞고, 이 스펙의 표준이 뒤집힌다.

6. **concurrent-session 에러 감지 신호**: 서버가 이 상태를 어떤 필드로 응답하는지는 `.specs/draft-concurrent-login-guard/`의 Open Question 1에 달려 있다. 본 스펙은 에러 분류만 정의하고 실제 감지 규칙은 concurrent-login 스펙 결정에 위임한다.

## 테스트 전략

### 단위 테스트 (Jest + React Testing Library)

- 각 에러 분류로의 상태 전이 (mock된 client로 각 단계 실패 주입)
- Retry 호출 후 재실행되며 이벤트는 1회만 발행되는지
- URL 정리: `window.history.replaceState` 호출 시 argument 검증
- `stoken`(소문자) warn 호출 검증
- `extraParams`가 `client.token_login`에 그대로 전달되는지
- 기본 에러 카드의 Copy details 버튼이 클립보드에 JSON을 복사하는지

### 통합 테스트

- Relay 환경 mock 하에서 children 내부의 쿼리가 경계 컴포넌트 success 이전에는 suspended, 이후에는 resolved 되는지 확인
- `'backend-ai-connected'` 이벤트 디스패치 전에 children이 마운트되지 않음을 DOM observer 또는 render spy로 검증

### E2E 테스트 (Playwright, 기존 인프라)

- LoginView sToken 진입 시나리오 (story 2 머지 후 회귀 없음 확인)
- EduAppLauncher sToken 진입 시나리오 — 세션 ID 있음·없음 두 경로 모두 (story 3 머지 후)
- 각 경로에서 성공 시 URL에 `sToken`이 남지 않는지 확인
- 잘못된/만료된 sToken으로 진입 시 에러 카드가 표시되고 Retry가 동작하는지

## 영향 받는 컴포넌트 (기존 코드 참조)

| 파일 | 역할 | 변경 예상 |
|------|------|-----------|
| `react/src/components/STokenLoginBoundary.tsx` | (신규) sToken 경계 컴포넌트 | 신규 작성 |
| `react/src/components/LoginView.tsx` | 로그인 플로우 오케스트레이션 | `connectUsingSession` sToken 분기 제거, 경계 컴포넌트 래핑 |
| `react/src/components/EduAppLauncher.tsx` | 교육용 앱 런처 | `_token_login` 제거, 수동 `backend-ai-connected` 디스패치 제거, 경계 컴포넌트 래핑 |
| `react/src/helper/loginSessionAuth.ts` | 로그인 세션 유틸 | `tokenLogin`에 `extraParams` 지원 추가 (Open Question 1 채택 시) |
| `react/src/hooks/useEduAppApiEndpoint.ts` | EduApp 엔드포인트 resolve | 일반화 또는 새 wrapper 훅 추가 |
| `react/src/RelayEnvironment.ts` | GQL 네트워크 레이어 | 변경 없음 (기존 `waitForBAIClient`를 그대로 의존) |
| `resources/i18n/*.json` | 다국어 번역 파일 | 새 메시지 키 추가 (에러 카드 제목/본문, Retry/Copy 버튼) |

## 관련 스펙

- `.specs/draft-concurrent-login-guard/spec.md` — 동시 로그인 세션 제어. 본 스펙의 `concurrent-session` 에러 분류가 이 스펙의 모달/확인 다이얼로그와 연계된다.
- `.specs/FR-2470-edu-applauncher-refactor/spec.md` — EduAppLauncher React 정식 지원 리팩토링. 본 스펙의 story 3(EduAppLauncher 마이그레이션)가 이 스펙과 겹칠 수 있으며, 머지 순서에 따라 조정 필요.

## 관련 이슈

- (Jira 미등록) Epic 제안: "Extract sToken login flow into reusable boundary component"
- (Jira 미등록) Spec Task 제안: "Define sToken login boundary component spec"
- 원본 맥락: 사용자와의 설계 논의에서 도출 (외부 issue 없음)
