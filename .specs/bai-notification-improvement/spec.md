# BAI Notification 시스템 개선 Spec

## 개요

Backend.AI WebUI의 알림(notification) 시스템을 개선하여 세션 생성 경로/타입별 알림 구분, 세션 생성 제안 알림, 일괄 관리 기능을 추가한다. 현재 BAI 알림 시스템에 들어오는 세션 알림은 `session-launcher:`(interactive/batch 런처) prefix 하나뿐이며, 각 알림이 어떤 경로/타입인지 구조적으로 식별되지 않는다. 모델 배포 생성은 알림 시스템과 연동되지 않고 모달의 휘발성 antd `message` 토스트로만 처리되어 Drawer에 남지 않으며, 배포가 생성하는 inference 세션(replica)도 알림되지 않는다. 이를 명시적 origin·sessionType 체계로 통일·확장하고, Drawer의 필터/관리 기능을 강화한다.

## 문제 정의

### 현재 한계

1. **세션 알림 구분 부재**: interactive/batch 세션 생성 알림이 `session-launcher:` 하나의 prefix로만 동작하여, 어떤 경로(import, sftp, filebrowser 등)에서 생성했는지, 어떤 타입(interactive, batch)인지 알 수 없다. 모델 배포(deployment) 생성은 BAI 알림 시스템과 연동되지 않고 모달의 휘발성 `message` 토스트로만 처리되며, 배포가 생성하는 inference 세션(replica)도 개별적으로 식별·알림되지 않는다(아래 "deployment와 inference 세션" 참고).
2. **Import 후속 안내 없음**: Start Page에서 GitHub/GitLab import로 batch 세션을 실행한 뒤, 완료 후 해당 vfolder를 활용한 후속 세션 생성을 안내하는 플로우가 없다.
3. **알림 관리 불편**: 토스트가 다수 쌓이면 하나씩 닫아야 하며, Drawer에서는 전체 삭제만 가능하고 선택적 삭제가 불가하다.
4. **필터 부족**: Drawer 필터가 "전체"/"진행 중" 2개로 한정되어 있어, 카테고리별 탐색이 어렵다.

### 현재 시스템 구조

- **상태 관리**: `useBAINotification.tsx`에서 Jotai atom(`notificationListState`) 기반 전역 상태, `upsertNotification`/`clearNotification` 등 핵심 함수 제공
- **노드 알림**: `BAINodeNotificationItem`이 `ComputeSessionNode`, `VFolder`(V2, FR-2573 — 신규 경로), `VirtualFolderNode`(V1, deprecated) 3종류를 디스패치 (그 외 타입은 `null` 반환)
- **세션 알림(interactive/batch)**: `useStartSession`이 `session-launcher:` prefix로 생성, `BAIComputeSessionNodeNotificationItem`에서 상태 구독, TERMINATED/CANCELLED 시 3초 후 자동 닫힘
- **배포 생성(알림 시스템 미연동)**: `ModelCardDeployModal`/`VFolderDeployModal`/`DeploymentSettingModal`에서 `deployVfolderV2`/`deployModelCardV2`/`createModelDeployment` mutation을 호출하고, 성공/실패는 antd `App.useApp().message` 토스트(`modelStore.DeploySuccess` 등)로만 표시한다. BAI 알림 시스템(`upsertNotification`)을 사용하지 않으므로 Drawer/뱃지에 남지 않는다. (구 `useDeploymentLauncher` 훅은 FR-2822에서 모달 방식으로 대체된 **미사용 레거시**이며 `deployment-launcher-` prefix도 이 죽은 코드에만 존재한다.)
- **Drawer**: `WEBUINotificationDrawer` (280px, "전체"/"진행 중" Segmented 필터, Clear All 메뉴)
- **알림 상한**: 100개 초과 시 가장 오래된 알림 제거. 현재 `useBAINotification.tsx`의 `upsertNotification`에 매직 넘버 `100`으로 하드코딩되어 있다(별도 상수 없음). R3(토스트 제한)·R7(지속성 상한)이 같은 값을 재사용하므로, 구현 시 이 값을 명명된 공유 상수(예: `MAX_NOTIFICATION_COUNT`)로 추출해 단일 출처로 관리한다.

#### deployment와 inference 세션

- **deployment는 세션을 생성한다(간접).** 모델 배포의 각 `ModelReplica`는 별도의 `inference` 타입 ComputeSession으로 실행된다(`ModelReplica.sessionV2`, 26.4.3+). 즉 `ComputeSessionNode.type === "inference"`인 세션은 전부 배포 replica이다.
- **생성 경로가 세션 런처와 완전히 분리되어 있다.** interactive/batch는 `useStartSession`(`startSession`/`createSession`)을 타지만, 배포는 위 배포 모달들의 `deployVfolderV2`/`deployModelCardV2` 또는 `createModelDeployment` mutation을 탄다. 배포 플로우에는 `sessionType` 파라미터가 없고 백엔드가 `inference`로 고정한다.
- **역참조가 없다.** `ComputeSessionNode`에는 deployment/endpoint/routing으로의 역방향 필드가 없다. 관계는 `ModelDeployment → ModelReplica → (sessionV2) ComputeSession` 단방향이다. 따라서 inference 세션 단위 알림을 붙이려면 replica/세션 식별을 배포 생성 시점(배포 모달)에서 직접 연결해야 한다.

## 요구사항

### Must Have (P0)

#### R1. 세션 생성 경로(origin) 및 타입(sessionType) 구분

- [ ] 알림에 세션 생성 경로(origin) 정보가 포함되어야 한다
  - 지원 origin 목록: `session-launcher`, `import`, `sftp`, `filebrowser`, `deployment`
  - `origin`은 union 타입 + `'unknown'` fallback으로 설계한다. 초기엔 세션 런처 경로(`session-launcher`/`import`/`sftp`/`filebrowser`)만 실제로 채워지고, scheduled session 등 신규 경로는 union 확장으로 무중단 추가한다.
  - `deployment`는 모델 배포가 생성하는 inference 세션(replica)의 origin이다. 배포 생성 자체는 현재 알림 시스템에 들어오지 않으므로(휘발성 `message` 토스트만 존재), 이 origin은 inference 세션 편입 시 활성화한다(범위 외 참고).
- [ ] 알림에 세션 타입(sessionType) 정보가 포함되어야 한다
  - 지원 타입: `interactive`, `batch`, `inference`
  - `inference`는 세션 런처가 아니라 배포 모달을 통해 생성되며, origin은 항상 `deployment`이다.
- [ ] origin별로 구분 가능한 아이콘 또는 라벨이 표시되어야 한다
- [ ] sessionType별로 알림 메시지 템플릿이 차별화되어야 한다
  - batch 세션: "실행 완료 후 자동 종료됩니다" 안내 문구 포함
  - inference 세션: 소속 배포(deployment) 및 엔드포인트 관련 안내 포함
- [ ] 기존 `session-launcher:` prefix 기반 알림이 하위 호환성을 유지해야 한다

#### R2. 세션 생성 제안 알림 (Session Suggestion Notification)

- [ ] origin이 `import`인 batch 세션이 `TERMINATED` 상태가 되었을 때 제안 알림이 발생해야 한다
  - 타이밍: 기존 세션 알림이 TERMINATED 후 3초 뒤 자동으로 닫히고(현재 시스템 구조의 자동 닫힘 동작), 그 직후 별도의 제안 알림이 새로 표시된다(동시 표시가 아니라 순차).
  - `CANCELLED` 상태에서는 제안 알림이 발생하지 않아야 한다
- [ ] 제안 알림 메시지: "Import가 완료되었습니다. 해당 폴더를 마운트하여 새 세션을 생성하시겠습니까?"
- [ ] "세션 생성" 액션 버튼 클릭 시, import 때 생성된 vfolder가 마운트된 상태로 Session Launcher 페이지로 이동해야 한다
  - 마운트할 vfolder는 import 세션 생성 시점에 알림 `extraData`에 담아 전달한다(완료 후 별도 조회 없이 그 값으로 Session Launcher mount를 채운다 — 세션 종료 후 정보 유실 방지).
- [ ] 제안 알림은 닫기/무시가 가능해야 한다
- [ ] 제안 알림은 자동 만료 없이 사용자가 닫거나 "세션 생성"을 실행할 때까지 Drawer에 유지된다 (정리는 100개 상한 정책에 위임)
- [ ] 제안 알림은 토스트와 Drawer 양쪽에 모두 표시되어야 한다

### Must Have (P1)

#### R3. 알림 일괄 관리 개선

- [ ] 토스트 최대 동시 표시 개수는 3개로 제한한다 (antd `notification`의 관례적 `maxCount`와 일치). 초과분은 토스트를 띄우지 않고 Drawer에만 누적하며, 진행 중(pending) 알림은 완료/실패 전까지 우선 유지한다.
- [ ] 토스트가 3개 이상 표시되면 "모두 닫기" 버튼이 표시되어야 한다
- [ ] Drawer에서 체크박스로 여러 알림을 선택하여 일괄 삭제할 수 있어야 한다
- [ ] Drawer에서 상태별 일괄 닫기가 가능해야 한다 (R5의 "카테고리"와 구분되는 backgroundTask 상태 기준)
  - "완료된 알림 모두 지우기"
  - "에러 알림 모두 지우기"

#### R4. 알림 액션 확장

- [ ] 알림에 임의 개수의 액션 버튼 배열(`actions`)을 지원해야 한다
  - 현황: `NotificationState`에 단일 `to`/`toText` 링크 + `onCancel` + `onRetry` 필드가 이미 존재하나, 고정된 3개 슬롯이라 임의 개수/순서의 액션을 표현할 수 없다.
  - 결정: `actions` 배열로 일반화한다. 기존 `onCancel`/`onRetry`는 deprecated alias로 한동안 병행하며, 내부적으로 `actions`로 매핑해 렌더링을 일원화하고 호출부는 점진적으로 마이그레이션한다(하위 호환 유지).
- [ ] 각 액션 버튼은 label과 onClick 핸들러를 가져야 한다

#### R5. 알림 카테고리/필터 강화

- [ ] Drawer 필터에 카테고리 기반 필터가 추가되어야 한다
  - 기본 카테고리: 전체, 세션, 폴더, 시스템, 제안
  - 매핑: `세션`=interactive/batch/inference 세션 알림(inference=배포 replica), `폴더`=VFolder 알림, `제안`=R2 제안 알림, `시스템`=그 외 일반 알림
- [ ] origin 또는 sessionType 기반 세부 필터가 가능해야 한다 (예: origin=`deployment`, sessionType=`inference`)

### Nice to Have (P2)

#### R6. 알림 그룹핑

- [ ] 동일 시점에 다수의 세션이 생성될 경우, 하나의 그룹 알림으로 묶어서 표시할 수 있어야 한다
  - 예: "3개 세션 생성 중 (2/3 완료)"
  - 그룹 기준은 동일 요청(batch) 기반 공통 `groupId`로 한다 (시간 윈도우 그룹핑은 무관한 알림이 섞일 오탐 위험이 커서 지양).
- [ ] 그룹 알림을 펼쳐 개별 세션 상태를 확인할 수 있어야 한다

### Nice to Have (P3)

#### R7. 알림 지속성

- [ ] 알림 히스토리는 localStorage에 최근 100개(메모리 상한과 동일)까지 메타데이터(`key`, `created`, 메시지, `category`, `origin`)만 직렬화해 저장하고 새로고침 후 복원한다. node 기반 알림은 로드 시 GraphQL로 재조회·정합성 검증한다(만료/삭제된 리소스는 드롭). IndexedDB는 이 규모에선 과하므로 사용하지 않는다.
- [ ] 지속성 저장 대상은 Drawer에 표시되는 알림 목록에 한정한다 (토스트 재표시는 하지 않음)

#### R8. 알림 설정 세분화

- [ ] 사용자가 카테고리별로 알림 on/off를 설정할 수 있어야 한다
- [ ] 방해금지 모드: 토스트를 숨기고 Drawer에만 알림을 쌓는 모드를 지원해야 한다

#### R9. 에러 알림 개선

- [ ] 에러 알림에 사용자 친화적 요약 메시지가 표시되어야 한다 (raw 에러는 기존 `extraDescription` "자세히 보기" 토글로 노출)

## 사용자 스토리

### 세션 생성 경로/타입 구분

- 사용자로서, 알림을 보고 어떤 경로(import, session launcher 등)에서 세션이 생성되었는지 즉시 파악하고 싶다.
- 사용자로서, batch 세션 생성 시 "실행 완료 후 자동 종료됩니다"라는 안내를 받아 세션 동작을 이해하고 싶다.
- 사용자로서, 모델 배포(deployment)로 생성된 inference 세션 알림을 일반 interactive/batch 세션과 구분해서 보고 싶다.

### 세션 생성 제안

- 사용자로서, GitHub에서 코드를 import하여 batch 세션이 완료된 후, 해당 폴더로 바로 새 세션을 시작할 수 있는 안내를 받고 싶다.
- 사용자로서, import 세션을 직접 취소한 경우에는 후속 세션 제안을 받지 않고 싶다.

### 알림 일괄 관리

- 사용자로서, 쌓인 토스트를 한 번에 모두 닫아 화면을 정리하고 싶다.
- 사용자로서, Drawer에서 완료된 알림만 선택하여 일괄 삭제하고 싶다.
- 사용자로서, 에러 알림만 골라서 한꺼번에 지우고 싶다.

### 알림 필터

- 사용자로서, Drawer에서 세션 관련 알림만 필터링하여 확인하고 싶다.
- 사용자로서, 제안 알림만 모아서 미처리된 항목을 확인하고 싶다.

## 수용 기준

### R1: 세션 생성 경로/타입 구분

- [ ] `NotificationState`에 `origin`, `sessionType`, `category` 필드가 추가되어야 한다
- [ ] origin이 `import`인 알림과 `session-launcher`인 알림이 서로 다른 아이콘/라벨로 표시된다
- [ ] batch 타입 세션 생성 시 알림 메시지에 자동 종료 안내 문구가 포함된다
- [ ] 기존 `session-launcher:` prefix만 사용하는 코드 경로에서도 알림이 정상 동작한다 (하위 호환)

### R2: 세션 생성 제안 알림

- [ ] origin=`import`, sessionType=`batch`인 세션이 TERMINATED되면 기존 세션 알림이 자동으로 닫힌 뒤(3초 딜레이 후) 별도의 제안 알림이 새로 표시된다
- [ ] 제안 알림의 "세션 생성" 버튼 클릭 시 Session Launcher 페이지로 이동하며, 해당 vfolder가 마운트 목록에 포함되어 있다
- [ ] origin=`import`, sessionType=`batch`인 세션이 CANCELLED되면 제안 알림이 표시되지 않는다
- [ ] 제안 알림을 닫아도 Drawer에서 다시 확인할 수 있다

### R3: 알림 일괄 관리

- [ ] 토스트가 최대 동시 표시 개수(3개) 이상 표시된 상태에서 "모두 닫기" 버튼이 나타난다
- [ ] 토스트 최대 동시 표시 개수를 초과하면 새 알림은 Drawer에만 추가된다
- [ ] Drawer에서 2개 이상의 알림을 체크박스로 선택하고 "삭제" 버튼을 누르면 선택된 알림이 모두 제거된다
- [ ] "완료된 알림 모두 지우기" 클릭 시 backgroundTask.status가 `resolved` 또는 `rejected`인 알림이 모두 제거된다

### R4: 알림 액션 확장

- [ ] 알림에 2개 이상의 액션 버튼이 표시될 수 있다
- [ ] 각 버튼 클릭 시 지정된 onClick 핸들러가 실행된다

### R5: 알림 카테고리/필터

- [ ] Drawer에서 "세션" 필터 선택 시 세션 관련 알림만 표시된다
- [ ] Drawer에서 "제안" 필터 선택 시 제안 알림만 표시된다
- [ ] 필터 변경 시 목록이 즉시 갱신된다

## 범위 외 (Out of Scope)

- 서버 사이드 알림 저장 및 동기화 (알림은 클라이언트 전용)
- 알림 소리/진동 설정
- 알림 우선순위 기반 정렬 (시간순 정렬 유지)
- 이메일/슬랙 등 외부 채널 알림 연동
- 알림 내용의 실시간 번역 (기존 i18n 체계 사용)
- 백엔드 API 변경이 필요한 기능 (클라이언트에서 가용한 정보 범위 내에서 동작)
- 배포 생성·inference 세션(replica)의 BAI 알림 시스템 편입 — 현재 배포 모달의 휘발성 `message` 토스트를 유지하며, 편입은 후속 작업으로 분리한다. 편입 시에는 ① 배포 생성 모달이 `upsertNotification`을 호출하도록 전환하고, ② replica 세션 알림을 R6 그룹핑("N개 replica 중 M개 준비됨")과 결합해 배포 1건당 1개의 그룹 알림으로 묶는다(replica→deployment 매핑은 배포 생성 시점에 `extraData`로 연결).

## 관련 파일

| 파일 | 역할 |
|------|------|
| `react/src/hooks/useBAINotification.tsx` | NotificationState 인터페이스, Jotai atom 상태, upsertNotification 등 핵심 훅 |
| `react/src/components/BAINodeNotificationItem.tsx` | ComputeSessionNode / VFolder(V2) / VirtualFolderNode(V1) 디스패처 |
| `react/src/components/BAIVirtualFolderNodeNotificationItemV2.tsx` | VFolder(V2, FR-2573) 알림 컴포넌트 |
| `react/src/components/BAIComputeSessionNodeNotificationItem.tsx` | 세션 알림 컴포넌트 (상태 구독, 자동 닫힘, 액션 버튼) |
| `react/src/components/BAIVirtualFolderNodeNotificationItem.tsx` | VFolder 알림 컴포넌트 |
| `react/src/components/BAIGeneralNotificationItem.tsx` | 일반 알림 컴포넌트 (진행률, 아이콘, 액션 링크) |
| `react/src/components/WEBUINotificationDrawer.tsx` | Drawer UI (280px, 필터, Clear All) |
| `react/src/components/BAINotificationButton.tsx` | 벨 아이콘 버튼, 뱃지, Drawer 토글 |
| `react/src/hooks/useStartSession.tsx` | interactive/batch 세션 생성 시 알림 (`SESSION_LAUNCHER_NOTI_PREFIX`) |
| `react/src/components/{ModelCardDeployModal,VFolderDeployModal,DeploymentSettingModal}.tsx` | 모델 배포 생성 진입점 (inference 세션/replica 생성). 현재 antd `message` 토스트만 사용, 알림 시스템 미연동 |
