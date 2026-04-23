# 복수 세션 동시 시작 드롭다운 및 자원 프리뷰 스펙

> **Jira**: [FR-2324](https://lablup.atlassian.net/browse/FR-2324)
> **GitHub Issue**: [#6044](https://github.com/lablup/backend.ai-webui/issues/6044)
> **PR**: [#6045](https://github.com/lablup/backend.ai-webui/pull/6045)

## 개요

세션 런처에서 "동일 설정으로 세션 N개 동시 시작(batch launch)" UX를 Resource Allocation 단계의 `Number of Sessions` 컨트롤에서 최종 단계의 **Launch** 버튼 옆 드롭다운 액션으로 이동시킵니다. 새 흐름은 모달을 열어 세션 개수를 입력받고, `num_of_sessions` 와 `cluster_size` 를 모두 반영한 실제 총 소비 자원량을 실시간으로 보여줍니다.

기존 위치 — 항상 노출되던 `num_of_sessions` 슬라이더가 `cluster_size > 1` 일 때 강제로 비활성화되는 구조 — 는 lit 기반 UI 에서 물려받은 어색한 관용이었습니다. 세션당 설정과 시작 시점의 배수(multiplier)를 한데 묶어 잘못된 멘탈 모델을 유도했고, 비활성화 조건에도 기술적 근거가 없었습니다. 새 흐름은 "동일 세션 여러 개"를 폼 필드가 아닌 **시작 액션**으로 취급하고, 자의적인 `cluster_size > 1` 제약을 제거합니다.

## 문제 정의

현재 세션 런처는 **Resource Allocation** 카드 안에 `num_of_sessions` 를 제어하는 "Sessions" 슬라이더를 노출합니다. 다음 세 가지 문제가 있습니다.

1. **의미론적 위치** — `num_of_sessions` 는 동일 세션 N개를 띄우는 시작 시점 배수입니다. 세션당 자원 파라미터(CPU/memory/accelerator)와 같은 카드에 두면 잘못된 개념 모델을 유도합니다.
2. **`cluster_size` 에 따른 자의적 비활성화** — `cluster_size > 1` 이면 슬라이더가 `1` 로 초기화되고 비활성화됩니다(`ClusterModeFormItems.tsx:262`). 멀티 노드 세션을 batch 로 띄우는 것은 기술적으로 유효하며 허용돼야 합니다.
3. **자원 프리뷰 부재** — 세션 개수를 크게 잡았을 때 실제 쿼터 영향을 가늠할 수 없습니다. 리뷰 단계의 "Total Allocation" 도 `num_of_sessions` 와 `cluster_size` 중 큰 쪽만 보여주고 둘의 곱은 보여주지 않아 실제 소비량이 **과소 표기**됩니다.

진행 중인 PR #6045 (FR-2324) 가 (1)과 (2)를 드롭다운 이동으로 해결합니다. 본 스펙은 그 작업을 (3)까지 확장하고 최종 수용 기준을 확정합니다.

## 요구사항

### 반드시 포함 (Must Have)

- [ ] `ResourceAllocationFormItems` 의 `enableNumOfSessions` prop 과 대응하는 "Sessions" 슬라이더 카드를 완전히 제거합니다. 호출부에서도 `enableNumOfSessions` 를 더 이상 전달하지 않습니다.
- [ ] `ClusterModeFormItems` 는 `cluster_size > 1` 일 때 `num_of_sessions` 를 `1` 로 강제 초기화하지 않습니다. 두 필드는 서로 독립적으로 설정 가능해야 합니다.
- [ ] 최종 단계의 Launch 버튼은 다음으로 구성된 `Space.Compact` 그룹이 됩니다.
  - 기본 Launch 버튼 (단일 세션 시작 동작은 기존과 동일)
  - `EllipsisOutlined` 아이콘의 `Dropdown` 트리거. 메뉴 항목은 **"Launch Multiple Sessions"** 하나.
- [ ] 드롭다운 트리거는 Launch 버튼의 비활성화 상태를 공유합니다(폼 검증 에러가 있으면 함께 비활성화).
- [ ] **"Launch Multiple Sessions"** 선택 시 열리는 모달은 다음을 포함합니다.
  - 기능에 대한 간략 안내 문구
  - 세션 개수 입력(`InputNumber`). `min = 2` 는 `InputNumber` 에 직접 걸고, **`max` 는 `Form.Item` 의 `rules` 로 검증**합니다. `max` 값은 기존 `ResourceAllocationFormItems` 의 sessions 슬라이더와 동일하게 `useCurrentKeyPairResourcePolicyLazyLoadQuery` 의 `sessionLimitAndRemaining.max`(사용자 keypair resource policy 의 `max_concurrent_sessions` 기반)로 결정합니다. 기본값 `= 2`. 초과 입력 시 rule 메시지(`session.launcher.LaunchMultipleSessionsMaxExceeded`)가 노출되어 제출이 차단됩니다.
  - 실시간 **Resource Preview**. 먼저 **세션 1개당 필요한 자원**을 표시하고, 그 아래에 **입력된 세션 개수에 따른 총 필요 자원**을 표시합니다. 두 값 모두 리뷰 단계의 "Total Allocation" 카드와 동일한 `BAIResourceNumberWithIcon` 시각화를 사용합니다.
    - 세션당 자원 = `per_container × cluster_size`
    - 총 자원 = `per_container × cluster_size × num_of_sessions`
  - 프리뷰 블록에는 현재 리소스 그룹명과 클러스터 모드도 함께 노출해 결정 맥락을 제공합니다. 클러스터 모드는 `SessionNodes` 목록의 `cluster_mode` 컬럼(`BAISessionClusterMode`)과 동일한 방식으로 모드 축약 라벨과 `cluster_size` 를 함께 표시합니다. 예: `단일 (1)`, `다중 (4)` — 모드 라벨은 메인 앱 i18n 에 신규 추가하는 `session.launcher.SingleNodeShort` / `session.launcher.MultiNodeShort` 키를 사용하고(backend.ai-ui 패키지의 `comp:BAISessionClusterMode.*` 키와 동일한 "단일"/"다중" 번역을 유지), 괄호 안 숫자는 secondary typography 로 렌더합니다.
  - `num_of_sessions × cluster_size` 가 사용자 남은 세션/슬롯 쿼터를 초과하면 비차단 경고(Alert 등)를 모달 내에 노출합니다. 기존 `showRemainingWarning` 철학과 일관되게 제출은 계속 가능하며, 경고는 정보 제공용입니다.
  - 주 액션 **Start**, 보조 액션 **Cancel**.
- [ ] 확정 시 현재 폼 값에 `num_of_sessions: <입력된 값>` 을 병합해 `startSession` 을 호출합니다. 성공/실패 처리(알림, `/job` 이동, `session_create_already-exists` 처리)는 단일 시작 경로와 동일합니다.
- [ ] 모달 내에서 사용자가 개수를 수정하면 자원 프리뷰가 즉시 갱신됩니다(디바운스는 선택).
- [ ] 단일/배치 모두 마운트된 폴더가 없으면 기존 `NoFolderMounted` 확인 다이얼로그를 일관되게 노출합니다.
- [ ] 신규 표시 문자열의 i18n 키는 최소 `en`, `ko` 에 추가합니다. 나머지 로케일은 표준 `/fw:i18n` 후속 작업에 위임합니다.
- [ ] `RESOURCE_ALLOCATION_INITIAL_FORM_VALUES.num_of_sessions = 1` 기본값은 유지합니다. 배치 액션을 쓰지 않더라도 폼이 값을 추적해야 하기 때문입니다.

### 있으면 좋음 (Nice to Have)

- [ ] 마지막에 사용한 개수를 `localStorage` 에 저장해, 파워 유저가 매번 재입력하지 않도록 합니다.

## 사용자 스토리

- 연구자로서, 동일한 세션 설정을 한 번의 액션으로 N번 띄우고 싶습니다. 수동 반복 없이 실험을 병렬화할 수 있어야 합니다.
- 멀티 노드(`cluster_size > 1`) 작업을 구성하는 연구자로서, 같은 설정을 여러 벌 batch 로 띄울 수 있어야 합니다. 단일 세션으로 강제되는 현재 제약에는 근거가 없습니다.
- batch 를 시작하기 직전의 사용자로서, 클러스터 크기와 세션 개수가 모두 반영된 실제 총 자원 영향을 확인하고 확정하고 싶습니다. 스케줄러에 도달하기 전 쿼터 초과 요청을 걸러낼 수 있어야 합니다.
- 최종 단계에서 작업을 검토하는 사용자로서, 자원 관련 컨트롤(CPU/메모리/액셀러레이터)은 Resource Allocation 카드에, 시작 수정자(세션 개수)는 Launch 액션 옆에 있어 폼 구조가 저의 멘탈 모델과 일치하길 바랍니다.

## 수용 기준 (Acceptance Criteria)

- [ ] **제거**: `ResourceAllocationFormItemsProps.enableNumOfSessions` 가 더 이상 존재하지 않고, `ResourceAllocationFormItems` 내부에도 `num_of_sessions` 폼 아이템/슬라이더가 없습니다.
- [ ] **cluster_size 독립성**: `cluster_size` 를 어떤 값(>1 포함)으로 바꾸어도 `num_of_sessions` 가 변경되지 않고, 배치 런치 모달을 열거나 제출하는 동작이 막히지 않습니다.
- [ ] **드롭다운 존재**: 최종(리뷰) 단계에서 Launch 버튼은 기본 Launch 버튼과 `EllipsisOutlined` 드롭다운 트리거로 구성된 `Space.Compact` 로 렌더됩니다. `cluster_size`, `session_type`, `num_of_sessions` 와 무관합니다.
- [ ] **드롭다운 비활성화**: 폼에 검증 에러가 있으면 Launch 버튼과 드롭다운 트리거가 함께 비활성화되고, hover 시 "Please complete form" 툴팁이 노출됩니다.
- [ ] **모달 구성**: 배치 런치 모달은 순서대로 다음을 렌더합니다.
  - (a) 기능에 대한 간략 설명 문단
  - (b) `min=2` 가 `InputNumber` 에 걸린 `Form.Item`. `max` 는 `Form.Item.rules` 로 `sessionLimitAndRemaining.max`(사용자 keypair resource policy 기반) 를 검증. `suffix` = 현지화된 "Sessions"
  - (c) 리소스 그룹명 + 클러스터 모드 요약 — 클러스터 모드는 `SessionNodes` 의 `cluster_mode` 컬럼(`BAISessionClusterMode`)과 동일한 `<모드 축약 라벨> (<cluster_size>)` 포맷으로 표시 (예: `다중 (1)`)
  - (d) **세션 1개당** 자원(`per_container × cluster_size`) 블록
  - (e) **총** 자원(`per_container × cluster_size × num_of_sessions`) 블록
  - (f) `num_of_sessions × cluster_size` 가 남은 쿼터를 초과하면 비차단 경고 Alert
- [ ] **실시간 프리뷰**: 모달에서 개수를 수정하면 모달을 재열지 않아도 세션당/총 자원 값과 쿼터 경고가 즉시 갱신됩니다.
- [ ] **제출 흐름**: 모달 확정 시 `num_of_sessions = <입력된 값>`, `cluster_size` 는 유지한 채 `startSession` 이 호출됩니다. 기존 `${sessionName}-${randomSuffix}-${i}` 명명 규칙으로 N개의 고유 세션이 생성되고, 성공 알림 후 `/job` 으로 이동합니다.
- [ ] **에러 처리**: `session_create_already-exists` 는 기존 "Session already exists" 모달로 노출하며, 기타 백엔드 에러는 표준 `error.title` + `getErrorMessage` 모달로 노출합니다.
- [ ] **NoFolderMounted 일관성**: `mount_ids` 가 비어 있으면 단일/배치 모두 기존 확인 다이얼로그가 선행된 뒤에야 진행됩니다.
- [ ] **i18n**: 신규 키 `session.launcher.LaunchMultipleSessions`, `session.launcher.LaunchMultipleSessionsDescription`, 기타 모달 전용 문구가 최소 `en.json`, `ko.json` 에 존재합니다. 컴포넌트 내 하드코딩된 영문 문자열이 없어야 합니다.
- [ ] **검증**: `bash scripts/verify.sh` 가 기능 브랜치에서 `=== ALL PASS ===` 를 출력합니다.

## 범위 외 (Out of Scope)

- `cluster_mode`, `cluster_size`, 세션당 자원 필드의 수집 방식 변경. UI/검증/폼 구조는 기존 그대로 유지합니다.
- 리뷰 단계 "Total Allocation" 카드의 재작업. (`cluster_size × num_of_sessions` 를 일관 표시하려면 후속 수정이 필요할 수 있으나 별도 트래킹. 본 이슈에서는 기존 동작을 유지하거나 새 공식을 거울처럼 반영하는 소규모 수정 중 어느 쪽이든 수용합니다.)
- 사용자별 배치 런치 상한의 서버 측 강제. 클라이언트는 keypair resource policy 를 기반으로 가드하며 백엔드 정책이 최종 권위입니다.
- 템플릿 편집/저장. `SessionTemplateModal` 은 기존대로 `num_of_sessions: 1` 로 초기화됩니다.
- `en`/`ko` 외 로케일. 표준 번역 워크플로우를 따릅니다.
- 신규 모달 흐름에 대한 Playwright E2E 커버리지. (후속 태스크로 추가 가능, 스펙 완료의 차단 조건은 아님.)

## 설계 결정 (기록된 가정)

FR-2324 의 의도와 현재 코드베이스를 근거로 스펙 작성 중 결정된 사항입니다. 잘못된 가정이면 재검토합니다.

1. **자원 공식** — total = `per_container × cluster_size × num_of_sessions`. 논리적 세션 하나가 `cluster_size` 개의 컨테이너를 가지므로, N개 세션 × cluster_size 컨테이너 × 세션당 자원이 정확한 배수입니다. 현재 리뷰 단계 프리뷰는 `max(cluster_size, num_of_sessions)` 를 쓰고 있어 둘 다 >1 일 때 과소 표기됩니다. 새 모달은 곱을 분명히 사용합니다.
2. **최소/최대** — `min=2`. `max` 는 기존 `ResourceAllocationFormItems` 의 sessions 슬라이더와 동일하게 `useCurrentKeyPairResourcePolicyLazyLoadQuery` 의 `sessionLimitAndRemaining.max`(keypair resource policy 의 `max_concurrent_sessions` 기반)를 사용합니다. PR #6045 의 하드코딩된 `max=50` 은 대체됩니다. "batch" 의 의미(≥2)는 유지됩니다.
3. **쿼터 검증** — 경고만, 제출은 허용. 기존 `showRemainingWarning` 철학과 일관. 하드 블로킹은 본 이슈 범위 외.
4. **NoFolderMounted 일관성** — 단일/배치 모두 확인. 지속 스토리지 없이 세션을 띄우는 위험이 동일하기 때문.
5. **드롭다운 가시성** — 무조건 노출. 피처 플래그/역할 기반 게이팅 없음.
6. **로케일** — `en`/`ko` 필수, 나머지는 `/fw:i18n` 후속.

## 관련 이슈

- [FR-2324](https://lablup.atlassian.net/browse/FR-2324) — 본 스펙이 문서화하는 Jira 이슈. GitHub Issue [#6044](https://github.com/lablup/backend.ai-webui/issues/6044), PR [#6045](https://github.com/lablup/backend.ai-webui/pull/6045) 에서 진행 중.
- FR-1385 — 상위 로드맵 "Improve Session creation UX". 본 이슈는 해당 로드맵의 일부.
