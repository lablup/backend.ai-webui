# Multi-Step Async Notification 컴포넌트 및 Hook

> **Status**: Implemented
> **Date**: 2026-03-26
> **Implemented**: PR [#6234](https://github.com/lablup/backend.ai-webui/pull/6234)

## 개요

기존 notification 시스템 위에서 동작하는 재사용 가능한 multi-step 비동기 진행 표시 컴포넌트와 React hook. 각 단계(예: model definition 확인 → service definition 확인 → 결과 액션)가 step counter("Step 2/4") 형태로 notification에 표시되며, 단계별 설명과 액션 버튼을 제공한다. Hook이 Promise 체인과 SSE 기반 작업을 오케스트레이션하여 notification을 자동으로 업데이트한다.

## 문제 정의

현재 notification 시스템(`useBAINotification`)은 단일 작업 진행만 지원한다(하나의 `backgroundTask`, pending → resolved/rejected 라이프사이클). 다음과 같은 multi-step 비동기 작업을 표현할 표준화된 방법이 없다:

- 여러 순차 async 단계가 순서대로 완료되어야 하는 경우
- 각 단계마다 고유한 상태, 설명, 액션 버튼이 필요한 경우
- 특정 단계 실패 시 해당 단계만 retry하고 전체를 재시작하지 않아야 하는 경우
- notification이 in-place 업데이트되어 현재 활성 단계와 완료된 단계를 반영해야 하는 경우

이 요구사항은 Model Store 개선 스펙(FR-2382)에서 식별되었으며, model folder 서비스 런칭과 Model Store "Clone & Start Service"에 단계별 notification flow가 필요하다. 다만, 컴포넌트와 hook은 애플리케이션 내 모든 multi-step async flow에서 재사용 가능하도록 범용적으로 설계한다.

## 사용자 스토리

- **개발자로서**, async step 목록을 넘기면 각 단계를 거치며 notification 상태 전환을 자동 관리해주는 hook이 필요하다. 이를 통해 multi-step flow마다 notification 상태를 수동으로 관리할 필요가 없다.
- **개발자로서**, 단계별 설명, 성공/실패 메시지, 액션 버튼을 선언적으로 정의하고 싶다. 각 flow가 오케스트레이션 로직을 재구현하지 않고도 notification 내용을 커스터마이징할 수 있어야 한다.
- **사용자로서**, multi-step 작업 중 현재 어느 단계가 실행 중인지(예: "Step 2/4") 확인하여 전체 진행 상황을 파악하고 싶다.
- **사용자로서**, 단계 실패 시 명확한 에러 메시지와 retry 옵션을 보고, 전체 flow를 처음부터 재시작하지 않고 복구하고 싶다.
- **개발자로서**, hook이 Promise 기반과 SSE 기반 async 작업을 모두 step 타입으로 지원하여, 다양한 백엔드 상호작용(API 호출, 스트리밍 이벤트)에 활용하고 싶다.

## 요구사항

### Must Have

- [x] step 정의 배열을 받아 각 단계를 오케스트레이션하는 React hook (예: `useMultiStepNotification`)
- [x] 각 step 정의에 포함되는 항목:
  - notification에 표시할 label/description
  - async executor 함수 (Promise 반환 또는 SSE 스트림 구독)
  - 상태별 메시지 오버라이드 (pending, resolved, rejected) — 현재 `backgroundTask.onChange`와 동일한 패턴 (선택)
  - 상태별 액션 버튼 설정 (예: resolve 시 "서비스 상세 보기", reject 시 "폴더 열기") (선택)
  - 이전 단계 결과에 대한 데이터 의존성 여부를 나타내는 `dependsOn` 플래그/설정 (선택)
- [x] **Eager execution with sequential display**: 이전 단계 결과에 의존하지 않는 단계(`dependsOn: false` 또는 데이터 의존성 없음)는 이전 단계와 병렬로 즉시 실행을 시작할 수 있다. 단, UI는 항상 순차적으로 진행을 표시한다(Step 1 → Step 2 → Step 3). notification의 step counter는 이전 단계가 모두 완료된 후에만 다음으로 넘어가며, 선형적인 사용자 경험을 유지하면서 총 대기 시간을 줄인다.
- [x] 기존 `useBAINotification` 시스템과 호환되는 notification 상태 생성 (동일 notification list에 upsert, 동일 notification key 재사용)
- [x] notification에 step counter 표시: 현재 단계 인덱스와 전체 수 (예: "Step 2/4: Checking service definition")
- [x] 단계 resolve 시 hook이 자동으로 다음 단계로 진행하고 notification 업데이트
- [x] 단계 reject 시 notification에 에러 표시 및 해당 단계에 대한 retry 액션 제공 (step 1부터 재시작하지 않음)
- [x] retry 성공 후 다음 단계부터 정상 진행
- [x] 모든 단계 성공 완료 시 설정 가능한 메시지와 액션이 포함된 최종 resolved 상태로 전환
- [x] 명령적 제어 노출: `start()`, `retry()`, `cancel()`
- [x] 취소 시 현재 단계 중단(가능한 경우) 및 cancelled 상태로 표시
- [x] 두 가지 async 작업 타입 지원:
  - **Promise**: step executor가 `Promise<T>` 반환 — resolve/reject에 따라 notification 업데이트
  - **SSE**: step executor가 SSE 구독 설정(task ID) 반환 — 기존 SSE listener 인프라를 통해 notification 업데이트, 가능한 경우 진행률 표시
- [x] 컴포넌트와 hook은 범용적으로 설계 (Model Store에 종속되지 않음), 모든 multi-step flow에서 사용 가능

### Nice to Have

- [x] 완료된 단계가 위로 스크롤되고 다음 단계가 나타나는 스크롤 애니메이션으로, 여러 단계가 진행되고 있다는 시각적 피드백 제공
- [x] notification drawer에서 단계 타임라인/히스토리 보기 (완료된 모든 단계와 상태를 접힌 형태로 표시)
- [x] 최종 상태별 auto-dismiss 설정 (예: 성공 시 N초 후 자동 닫기, 실패 시 유지)

## 인수 조건

### Hook API

- [x] `useMultiStepNotification`이 설정 객체를 받음: notification 메타데이터(message, key), step 정의 배열, 최종 상태 설정(선택)
- [x] `start()` 호출 시 첫 단계부터 실행 시작 및 notification 열림
- [x] 각 단계 전환 시 notification을 in-place 업데이트 (동일 key)하여 새로운 step counter와 설명 표시
- [x] step counter 형식: "{current}/{total}: {step label}" (예: "1/3: Checking model definition")
- [x] notification 아이콘이 현재 전체 상태를 반영: 실행 중 pending(시계), 전체 완료 시 success(체크), 단계 실패 시 error(X)

### Promise Steps

- [x] Promise executor가 있는 단계는 promise 시작 시 notification을 "pending" 상태로 업데이트
- [x] promise resolve 시 단계를 resolved로 표시하고 다음 단계 자동 시작
- [x] promise reject 시 단계를 rejected로 표시하고 에러 메시지 표시 및 retry 버튼 표시
- [x] resolved promise의 반환 데이터는 다음 단계가 의존성을 선언한 경우 해당 executor의 input으로 전달 (의존 단계 간 data chaining)
- [x] eager-executed 단계(의존성 없음)의 executor는 이전 단계의 input을 받지 않고 즉시 시작

### SSE Steps

- [x] SSE executor가 있는 단계는 기존 `listenToBackgroundTask` 인프라에 task ID를 전달
- [x] SSE 이벤트의 진행률을 notification에 표시 (`BAINotificationBackgroundProgress` 재사용)
- [x] SSE 완료(onDone) 시 단계를 resolved로 표시하고 다음 단계로 진행
- [x] SSE 실패(onTaskFailed/onFailed) 시 단계를 rejected로 표시하고 에러 상세 표시

### 에러 처리 및 Retry

- [x] 단계 실패 시 rejected promise 또는 SSE failure 이벤트의 에러 메시지를 notification에 표시
- [x] 단계 실패 시 notification에 "Retry" 액션 버튼 표시
- [x] "Retry" 클릭 시 실패한 단계만 재실행 (이전 단계는 재실행하지 않음)
- [x] retry 성공 시 다음 단계로 정상 진행
- [x] 첫 버전에서는 retry 횟수 제한 없음

### Eager Execution

- [x] 이전 단계에 대한 데이터 의존성이 없는 단계는 step 배열 내 위치와 무관하게 `start()` 호출 시 즉시 실행 시작
- [x] UI step counter는 단계 1부터 N-1까지 모두 완료된 후에만 단계 N으로 진행 (순차 표시 보장)
- [x] 앞 단계가 실패했을 때 이미 실행 중인 뒤 eager 단계는 계속 진행하되 결과를 보유 — 실패한 단계의 retry 시 이미 완료된 eager 단계를 재실행하지 않음
- [x] eager 단계가 표시 순서상 차례보다 먼저 완료되면, counter가 해당 단계에 도달했을 때 즉시 완료 상태로 표시 (인위적 지연 없음)

### 취소

- [x] `cancel()` 호출 시 현재 실행을 중단하고 notification을 cancelled 상태로 업데이트
- [x] cancelled 상태는 에러와 구분되는 별도 설명 메시지 표시

### 기존 시스템과의 통합

- [x] multi-step notification이 기존 notification drawer(`WEBUINotificationDrawer`)에 표시됨
- [x] multi-step notification popup(우하단)이 기존 notification과 동일한 시각적 컨테이너 사용
- [x] hook이 내부적으로 `useSetBAINotification().upsertNotification`을 호출 — 기존 notification 시스템을 우회하지 않음
- [x] Desktop notification(활성화된 경우)은 최종 상태(전체 완료 또는 실패)에서만 발생, 중간 단계에서는 발생하지 않음

## 범위 외

- Background task polling을 async 작업 타입으로 지원 (첫 버전에서는 Promise와 SSE만 지원)
- 비순차적 표시를 동반한 완전 독립 병렬 단계 (eager execution은 지원하되, UI 표시 순서는 항상 순차적)
- hook 내 단계 의존성 그래프 또는 조건 분기 (호출자가 자체 step executor 로직에서 분기 처리)
- 페이지 새로고침 시 notification 상태 유지 (현재 동작과 동일하게 ephemeral)
- notification 위치 커스터마이징 (현재와 동일하게 항상 우하단)
- 기존 `useBAINotification` hook 인터페이스 변경 (새 hook은 기존 위에 구축)

## 기술 컨텍스트

### 기존 Notification 인프라

현재 notification 시스템의 구성요소:

- **`useBAINotification` hook** (`react/src/hooks/useBAINotification.tsx`): Jotai atom(`notificationListState`)으로 `NotificationState` 객체를 관리. 단일 작업 라이프사이클(pending/resolved/rejected)의 `backgroundTask`, `listenToBackgroundTask`를 통한 SSE, Promise 추적을 지원.
- **`BAIGeneralNotificationItem`** (`react/src/components/BAIGeneralNotificationItem.tsx`): 아이콘, 메시지, 설명, 액션 링크, 선택적 progress bar가 포함된 개별 notification 항목 렌더링.
- **`BAINotificationBackgroundProgress`** (`react/src/components/BAINotificationBackgroundProgress.tsx`): 백그라운드 작업의 진행률 progress bar 렌더링.
- **Ant Design `App.notification`**: 기반 notification popup 시스템.

새 hook은 이 인프라를 대체하지 않고 조합하여 사용해야 한다. `upsertNotification`을 호출하여 notification 상태를 업데이트하고, 기존 SSE listener 패턴을 재사용한다.

### 대상 유스케이스 (FR-2382 기반)

1. **Model folder 서비스 런칭** (구현됨, FR-2406):
   - Step 1: service-definition.toml 다운로드 및 파싱 → `runtime_variants` 확인
     - `runtime_variants` 단일 값 → 해당 값으로 서비스 생성 진행
     - `runtime_variants = "custom"` → model-definition.yaml 존재 확인 (없으면 Error + "폴더 열기")
     - `runtime_variants` 복수 또는 미지정 → StepWarning으로 서비스 시작 페이지 리다이렉트
     - 파싱 에러 → Error + "폴더 열기" 버튼
     - service-definition.toml 없음 → StepWarning으로 서비스 시작 페이지 리다이렉트
   - Step 2: 서비스 생성 (Step 1에서 결정된 `runtime_variant` 사용)
   - 완료 시 서비스 상세 페이지로 자동 네비게이션
   - `StepWarning` 활용: warning 시 `onRejected`에서 `instanceof StepWarning` 분기로 서비스 시작 페이지 자동 리다이렉트, error 시 "폴더 열기" 액션 버튼 표시
2. **Model Store clone & start**: clone → definition 확인 → 서비스 생성 → 결과 액션 (향후)
3. **HuggingFace 모델 import**: 다운로드 → definition 생성 → 완료 (향후)

## 관련 이슈

- FR-2391: Multi-step async notification 컴포넌트 및 hook 스펙 정의 (본 스펙의 소스 이슈)
- FR-1927: Model Store 개선 (상위 Epic)
- FR-2382: Model Store 개선 기능 스펙 (본 스펙을 소비하는 스펙)
