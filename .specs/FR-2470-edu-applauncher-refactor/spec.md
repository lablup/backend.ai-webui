# EduAppLauncher React 정식 지원 리팩토링 Spec

## 개요

현재 `EduAppLauncher` 컴포넌트가 React 마이그레이션 시 독립적인 프록시 유틸리티(`appLauncherProxy.ts`)와 DOM CustomEvent 기반 알림, REST API 기반 세션 조회를 사용하고 있다. 이를 Relay/GraphQL 기반 세션 조회로 전환하고, 기존 React 앱 런처 인프라(`useBackendAIAppLauncher` 훅, `useSetBAINotification`)를 정식으로 활용하도록 리팩토링하여, 코드 중복을 줄이고 일관된 사용자 경험을 제공한다.

또한 기존에 빈 화면 + notification만으로 처리되던 UX를 **Step 기반 카드 UI**로 개선하여, 사용자가 인증 → 세션 확인/생성 → 앱 실행 과정의 진행 상태를 시각적으로 확인할 수 있도록 한다.

## 배경 및 사용 맥락

### 외부 플랫폼 연동

EduAppLauncher는 외부 교육 플랫폼에서 Backend.AI의 컴퓨팅 세션을 실행하기 위한 진입점이다. 외부 플랫폼은 자체 UI에서 사용자가 실행할 앱과 리소스를 선택하면, Backend.AI 플러그인을 통해 S-token이 포함된 URL을 생성하고, 이 URL로 EduAppLauncher 페이지를 호출한다.

- **URL 생성 주체**: 외부 플랫폼 (Backend.AI 플러그인의 API를 통해 생성)
- **인증 방식**: URL에 포함된 S-token(access key + secret key)으로 인증. Backend.AI 로그인 UI를 거치지 않음
- **사용 앱**: 주로 Jupyter Lab/Notebook. SSH, VS Code Desktop 등 모달이 필요한 앱의 사용 여부는 추가 확인 필요

### 두 가지 진입 흐름

1. **세션 ID가 있는 경우**: 이미 생성된 세션이 존재하므로, 해당 세션에서 요청된 앱을 바로 실행
2. **세션 ID가 없는 경우**: Edu API(`eduApp.get_mount_folders`, `eduApp.get_user_projects` 등)를 호출하여 마운트 폴더, 프로젝트 정보 등을 받아온 후, 세션 템플릿 기반으로 세션을 생성하고 앱 실행

## 문제 정의

### 현재 상태

1. **UI 부재**: 현재 컴포넌트는 빈 `<></>` fragment만 렌더링하며, 진행 상태나 에러를 시각적으로 표시하지 않음. 에러는 notification으로만 표시되고, 성공 시에도 빈 화면만 남음
2. **`apiEndpoint`가 빈값이 되는 문제**: `EduAppLauncherPage`에서 `useApiEndpoint()` 훅을 사용하여 API 엔드포인트를 가져오고 있으나, 이 훅은 localStorage(`backendaiwebui.api_endpoint`) 또는 `loginConfigState` atom에서 값을 읽는다. EduAppLauncher 페이지는 로그인 페이지를 거치지 않고 토큰 기반으로 직접 접근되기 때문에, 두 값 모두 설정되지 않은 상태이며 결과적으로 빈 문자열(`''`)이 반환된다. 빈 `apiEndpoint`가 `EduAppLauncher` 컴포넌트에 전달되어 클라이언트 초기화가 실패하거나 예기치 않은 동작이 발생할 수 있다.
3. **엔드포인트/프록시 설정**: `EduAppLauncher`가 `fetchAndParseConfig`로 `config.toml`을 직접 읽어 `proxyURL`을 설정하고 있으나, 메인 앱의 표준 클라이언트 초기화 경로(`useSuspendedBackendaiClient`)를 사용하지 않음
4. **앱 런칭**: `appLauncherProxy.ts`의 독립 함수(`openWsproxy`, `connectToProxyWorker`)를 사용 중. 이는 `useBackendAIAppLauncher` 훅의 로직을 별도로 추출한 것으로, 프록시 버전 감지(v1/v2)에서 `scalingGroup`/`projectId` 정보 없이 항상 v1으로 fallback하는 등 동작이 불완전함
5. **알림 시스템**: `CustomEvent('add-bai-notification')` + `NotificationForAnonymous` 컴포넌트라는 우회 방식을 사용 중. React의 정식 알림 시스템(`useSetBAINotification`)을 활용하지 않음
6. **에러 처리**: 세션 생성 실패, 요청한 앱이 세션에서 지원되지 않는 경우 등의 에러 메시지가 불충분함

### 이전 Lit 컴포넌트(`backend-ai-edu-applauncher.ts`)와의 차이

이전 Lit 버전은 `backend-ai-app-launcher` 컴포넌트의 `_open_wsproxy`와 `_connectToProxyWorker` 메서드를 직접 호출하여 앱을 실행했다. React 마이그레이션 시 이 부분이 `appLauncherProxy.ts`라는 독립 유틸리티로 대체되었으나, 메인 앱 런처 훅(`useBackendAIAppLauncher`)의 전체 기능(알림 통합, 프로그레스 표시, 에러 해석 등)을 활용하지 못하고 있다.

## 요구사항

### Must Have

- [ ] **Step 기반 카드 UI**: 빈 화면 대신 화면 가운데에 카드를 배치하고, 진행 단계(인증 확인 → 세션 확인/생성 → 앱 실행)를 시각적으로 표시
  - 각 스텝의 진행 중/완료/에러 상태를 카드 내에서 표시
  - 현재 실행 플로우와 직접 관련된 에러는 **카드 내에 에러 메시지로 표시하는 것을 원칙**으로 하며, notification이 이를 대체하지 않도록 역할을 분리
  - 리트라이는 브라우저 새로고침으로 처리 (별도 리트라이 버튼 불필요)
  - 앱 실행 완료 시 원래 페이지의 카드에는 "새 창에서 앱을 확인하세요" 등의 완료 메시지를 표시하고, 필요 시 notification은 보조 안내로만 사용
- [ ] `EduAppLauncherPage`에서 `useApiEndpoint()` 대신 `config.toml`에서 직접 API 엔드포인트를 읽어오거나, 로그인을 거치지 않는 독립 페이지에서도 엔드포인트가 올바르게 설정되는 방식으로 변경. 로그인 과정 없이 직접 접근하는 페이지에서 `apiEndpoint`가 빈값이 되는 문제를 해결
- [ ] 기존 REST API 기반 세션 조회/목록 API(예: `computeSession.list` 등) 기반 흐름을 Relay/GraphQL 기반으로 전환. URL에 session ID가 전달되면 Relay로 세션을 조회하고, session ID가 없으면 세션 생성 후 Relay로 조회하여 `ComputeSessionNode` fragment 데이터를 확보
- [ ] `appLauncherProxy.ts`의 독립 프록시 함수 대신 `useBackendAIAppLauncher` 훅을 Relay fragment 데이터와 함께 직접 사용하도록 변경
- [ ] `_dispatchNotification`(CustomEvent 기반) 대신 `useSetBAINotification`의 `upsertNotification`을 사용하여 React 알림 시스템을 정식으로 활용하되, 이는 **보조적인 글로벌 알림 채널**(예: 앱 실행 완료/새 창 열림 안내, 백그라운드 진행 알림, 카드 자체를 표시할 수 없는 치명적 오류)로 한정
- [ ] 세션 생성 실패 시 구체적인 에러 메시지를 사용자에게 표시 (예: 리소스 부족, 템플릿 미존재, 타임아웃 등 원인별 분류). 이때 해당 실패 원인은 카드 내 주 UI에서 확인 가능해야 함
- [ ] URL 파라미터로 요청된 앱(`app` 파라미터)이 세션의 `service_ports`에 존재하지 않을 때 명확한 에러 메시지 표시. 이 에러 역시 카드 내에서 우선 표시
- [ ] `NotificationForAnonymous` 컴포넌트 의존을 제거하고, `EduAppLauncherPage`에서 React 알림 시스템이 위 원칙에 따른 **보조 수단**으로 정상 동작하도록 구성
- [ ] 엔드포인트 초기화 시 `config.toml`의 `wsproxy.proxyURL` 설정이 정상적으로 클라이언트에 반영되도록 보장 (현재 로직 유지하되 표준 경로와 일관성 확보)
- [ ] 앱 실행 시 새 창(`window.open`)으로 앱 URL을 열고, 원래 페이지에는 완료 상태를 표시

### Nice to Have

- [ ] `appLauncherProxy.ts` 파일이 `EduAppLauncher` 전용으로만 사용된다면, 리팩토링 후 해당 파일 제거
- [ ] EduAppLauncher에서 `globalThis.backendaiclient`를 직접 생성/관리하는 부분을 표준 클라이언트 초기화 경로로 통합 가능성 검토
- [ ] SSH, VS Code Desktop 등 모달 기반 앱 런칭 지원 (사용 범위 확인 후 결정)

## 사용자 시나리오

### 시나리오 1: 기존 세션에서 앱 실행 (session ID가 URL에 있는 경우)

1. 외부 교육 플랫폼에서 사용자가 앱 실행 버튼을 클릭
2. S-token + session ID + app 이름이 포함된 URL로 EduAppLauncher 페이지 진입
3. 카드 UI에 "인증 확인 중..." 스텝 표시
4. S-token으로 토큰 인증 수행
5. 카드 UI에 "세션 확인 중..." 스텝 표시
6. 전달받은 session ID로 세션 조회 → 세션이 RUNNING 상태인지 확인
7. 카드 UI에 "앱 실행 중..." 스텝 표시
8. 프록시 연결 후 새 창에 앱(Jupyter 등) 열기
9. 원래 페이지 카드에 "완료 — 새 창에서 앱을 확인하세요" 표시

### 시나리오 2: 새 세션 생성 후 앱 실행 (session ID가 없는 경우)

1. 외부 플랫폼에서 S-token + 리소스(cpu, mem 등) + app 이름이 포함된 URL로 진입
2. 카드 UI에 "인증 확인 중..." 스텝 표시
3. S-token으로 토큰 인증 수행
4. 카드 UI에 "세션 생성 중..." 스텝 표시
5. Edu API 호출(`eduApp.get_mount_folders`, `eduApp.get_user_projects` 등)로 마운트 폴더, 프로젝트 정보 확보
6. 세션 템플릿 기반으로 세션 생성
7. 카드 UI에 "앱 실행 중..." 스텝 표시
8. 프록시 연결 후 새 창에 앱 열기
9. 원래 페이지 카드에 "완료" 표시

### 시나리오 3: 에러 발생

- **인증 실패**: 카드의 "인증 확인" 스텝에서 에러 메시지 표시 (예: "토큰 인증에 실패했습니다")
- **세션 생성 실패**: 카드의 "세션 생성" 스텝에서 원인별 에러 표시
  - 리소스 부족 / 할당 초과
  - 세션 템플릿 미존재
  - 세션 생성 타임아웃 (408)
  - 다른 이미지의 세션이 이미 존재
- **앱 실행 불가**: 카드의 "앱 실행" 스텝에서 에러 표시 (예: "요청한 앱을 이 세션에서 실행할 수 없습니다")
- 모든 에러 상태에서 브라우저 새로고침으로 재시도 가능

## 인수 조건

### UI/UX

- [ ] EduAppLauncher 페이지 진입 시 화면 가운데에 카드가 표시되며, 진행 단계(인증 확인 / 세션 확인·생성 / 앱 실행)가 시각적으로 구분된다
- [ ] 각 스텝의 진행 중 상태가 표시된다 (로딩 인디케이터 등)
- [ ] 에러 발생 시 해당 스텝에서 에러 메시지가 카드 내에 표시된다
- [ ] 앱 실행 완료 후 새 창에 앱이 열리고, 원래 페이지에는 완료 상태가 표시된다
- [ ] 브라우저 새로고침으로 전체 흐름을 재시도할 수 있다

### 기술적 요구사항

- [ ] 로그인 과정을 거치지 않고 EduAppLauncher 페이지에 직접 접근했을 때, `apiEndpoint`가 빈값이 아닌 올바른 API 엔드포인트 값으로 설정된다
- [ ] EduAppLauncher에서 `appLauncherProxy.ts`의 `openWsproxy`, `connectToProxyWorker` 함수를 직접 호출하지 않는다
- [ ] 세션 조회가 Relay/GraphQL 기반으로 이루어지며, `ComputeSessionNode` fragment 데이터를 `useBackendAIAppLauncher` 훅에 전달한다
- [ ] 앱 런칭 시 `useBackendAIAppLauncher` 훅의 프록시 연결 로직을 직접 사용한다 (별도 프록시 유틸리티 미사용)
- [ ] 모든 사용자 알림이 `useSetBAINotification`의 `upsertNotification`을 통해 발생한다
- [ ] `document.dispatchEvent(new CustomEvent('add-bai-notification', ...))` 호출이 `EduAppLauncher.tsx`에서 제거된다
- [ ] 세션 생성 실패 시, 에러 타입에 따라 아래 케이스들을 구분하여 카드 내에 표시한다:
  - 리소스 부족 / 할당 초과
  - 세션 템플릿 미존재
  - 세션 생성 타임아웃 (408)
  - 다른 이미지의 세션이 이미 존재
  - 기타 API 에러
- [ ] `app` URL 파라미터로 요청한 앱이 세션의 `service_ports`에 없을 때 "요청한 앱을 이 세션에서 실행할 수 없습니다" 류의 에러 메시지가 카드 내에 표시된다
- [ ] 기존 EduAppLauncher의 토큰 인증, 세션 재사용, 세션 생성 흐름은 기능적으로 동일하게 유지된다
- [ ] `wsproxy.proxyURL` 설정이 프록시 연결 시 정상적으로 사용된다

## 범위 밖 (Out of Scope)

- EduAppLauncher의 토큰 인증(`_token_login`) 로직 변경
- 세션 템플릿 기반 세션 생성 로직 자체의 변경
- EduAppLauncher의 URL 파라미터 체계 변경
- `globalThis.backendaiclient` 초기화 방식의 전면적 리팩토링 (독립 실행 페이지 특성상 별도 클라이언트 초기화 필요)
- i18n 키 추가/변경 (기존 키 활용, 필요 시 최소한의 추가만)
- EduAppLauncher URL 생성 기능 (외부 플랫폼/플러그인의 책임)
- SSH, VS Code Desktop 등 모달 기반 앱 런칭 (사용 범위 확인 후 별도 이슈로 처리)

## 관련 파일

- `react/src/components/EduAppLauncher.tsx` - 리팩토링 대상 메인 컴포넌트
- `react/src/pages/EduAppLauncherPage.tsx` - EduAppLauncher 페이지 (알림 시스템 구성 변경 필요)
- `react/src/helper/appLauncherProxy.ts` - 제거 대상 독립 프록시 유틸리티
- `react/src/hooks/useBackendAIAppLauncher.tsx` - 활용해야 할 앱 런처 훅
- `react/src/hooks/useBAINotification.tsx` - 활용해야 할 알림 훅
- `react/src/components/MainLayout/MainLayout.tsx` - `NotificationForAnonymous` 정의 위치

## 기술적 고려사항

### Step 기반 카드 UI 구현

현재 `EduAppLauncher`는 빈 fragment(`<></>`)만 렌더링하며 모든 피드백을 notification에 의존한다. 이를 화면 가운데 배치된 카드 컴포넌트로 변경한다.

**카드 레이아웃**:
- 화면 중앙에 적당한 크기의 카드 배치 (Ant Design `Card` 또는 커스텀)
- 카드 상단에 제목 (예: "앱 실행")
- 카드 내부에 스텝 목록:
  1. **인증 확인** — S-token 검증 및 클라이언트 초기화
  2. **세션 확인/생성** — 기존 세션 조회 또는 새 세션 생성
  3. **앱 실행** — 프록시 연결 및 앱 URL 열기
- 각 스텝은 진행 중(로딩)/완료(체크)/에러(에러 메시지) 상태를 표시
- Ant Design `Steps` 컴포넌트 활용 가능

**앱 실행 완료 후**:
- 앱은 `window.open`으로 새 창에서 열림 (기존 `_self` 대신)
- 원래 페이지의 카드에는 "완료 — 새 창에서 앱을 확인하세요" 메시지 표시
- 사용자가 나중에 이 탭으로 돌아와도 완료 상태를 확인할 수 있음

### Relay 기반 전환 접근 방식

`useBackendAIAppLauncher` 훅은 Relay `useFragment`를 통해 `ComputeSessionNode` fragment 데이터에 의존한다. 기존 EduAppLauncher는 REST API로 세션을 조회했으나, 이를 Relay/GraphQL 기반으로 전환하면 fragment 데이터를 자연스럽게 확보할 수 있다.

- **session ID가 URL에 있는 경우**: Relay `useLazyLoadQuery`로 해당 세션을 조회하여 fragment 데이터 확보
- **session ID가 없는 경우**: 세션 생성 후 반환된 session ID로 Relay 조회

이를 통해 `useBackendAIAppLauncher` 훅을 별도 인터페이스 확장 없이 그대로 사용할 수 있으며, 프록시 버전 감지에 필요한 `scaling_group`, `project_id` 등의 정보도 Relay fragment에서 자연스럽게 제공된다.

### 독립 실행 페이지 특성

EduAppLauncherPage는 MainLayout 밖에서 렌더링되지만, `DefaultProvidersForReactRoot` 내부에 위치하므로 기본 React context와 `RelayEnvironmentProvider`는 이미 사용 가능하다. 따라서 Relay 기반 전환에서 필요한 것은 EduAppLauncherPage 내부에 Provider를 추가로 구성하는 것이 아니라, 토큰 인증 완료 후 확정되는 API 엔드포인트/인증 상태에 맞춰 기존 Relay Environment를 어떻게 초기화하거나 갱신할지(필요 시 별도 환경을 사용할지)를 정의하는 것이다. 알림 시스템 통합도 이 기존 context 안에서 이루어진다.

### `apiEndpoint` 빈값 문제

`useApiEndpoint()` 훅은 다음 순서로 엔드포인트를 결정한다:
1. `localStorage.getItem('backendaiwebui.api_endpoint')` - 로그인 시 설정됨
2. `loginConfigState` atom - `useInitializeConfig`에 의해 설정됨
3. 빈 문자열 fallback

EduAppLauncher 페이지는 로그인 플로우를 거치지 않으므로 1, 2가 모두 비어있어 빈 문자열이 반환된다. 같은 패턴을 사용하는 `EmailVerificationPage`, `ChangePasswordPage` 등 다른 독립 페이지에서도 동일한 문제가 있을 수 있다. 현재 `EduAppLauncher` 컴포넌트 내부에서는 `fetchAndParseConfig`로 `config.toml`을 직접 읽어 `proxyURL`을 설정하고 있으나, 페이지 레벨에서 전달되는 `apiEndpoint` prop 자체가 빈값인 것이 근본적인 문제이다.

### 확인 필요 사항

- [ ] EduAppLauncher URL을 생성하는 정확한 주체 및 방식 (Backend.AI 플러그인 API 확인 필요 — 조민님 문의)
- [ ] 사용 앱 범위: Jupyter 외에 SSH, VS Code Desktop 등 모달이 필요한 앱의 사용 여부
- [ ] Edu API(`eduApp.get_mount_folders`, `eduApp.get_user_projects`, `eduApp.get_user_credential`)의 현재 동작 상태 확인 (앱 프록시 이슈로 테스트 미완)
