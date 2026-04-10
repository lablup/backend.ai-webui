# BAI Notification 시스템 개선 Spec

## 개요

Backend.AI WebUI의 알림(notification) 시스템을 개선하여 세션 생성 경로/타입별 알림 구분, 세션 생성 제안 알림, 일괄 관리 기능을 추가한다. 현재 단일 패턴(`session-launcher:`)으로만 존재하는 세션 알림을 다양한 origin과 sessionType으로 확장하고, Drawer의 필터/관리 기능을 강화한다.

## 문제 정의

### 현재 한계

1. **세션 알림 구분 부재**: 세션 생성 알림이 `session-launcher:` 하나의 prefix로만 동작하여, 어떤 경로(import, sftp, model-serving 등)에서 생성했는지, 어떤 타입(interactive, batch, inference)인지 알 수 없다.
2. **Import 후속 안내 없음**: Start Page에서 GitHub/GitLab import로 batch 세션을 실행한 뒤, 완료 후 해당 vfolder를 활용한 후속 세션 생성을 안내하는 플로우가 없다.
3. **알림 관리 불편**: 토스트가 다수 쌓이면 하나씩 닫아야 하며, Drawer에서는 전체 삭제만 가능하고 선택적 삭제가 불가하다.
4. **필터 부족**: Drawer 필터가 "전체"/"진행 중" 2개로 한정되어 있어, 카테고리별 탐색이 어렵다.

### 현재 시스템 구조

- **상태 관리**: `useBAINotification.tsx`에서 Jotai atom(`notificationListState`) 기반 전역 상태, `upsertNotification`/`clearNotification` 등 핵심 함수 제공
- **노드 알림**: `BAINodeNotificationItem`이 `ComputeSessionNode`/`VirtualFolderNode` 2종류를 디스패치
- **세션 알림**: `BAIComputeSessionNodeNotificationItem`에서 상태 구독, TERMINATED/CANCELLED 시 3초 후 자동 닫힘
- **Drawer**: `WEBUINotificationDrawer` (280px, "전체"/"진행 중" Segmented 필터, Clear All 메뉴)
- **알림 상한**: 100개 초과 시 가장 오래된 알림 제거 (코드 내 하드코딩)

## 요구사항

### Must Have (P0)

#### R1. 세션 생성 경로(origin) 및 타입(sessionType) 구분

- [ ] 알림에 세션 생성 경로(origin) 정보가 포함되어야 한다
  - 지원 origin 목록: `session-launcher`, `import`, `sftp`, `filebrowser`, `model-serving`, `pipeline`
- [ ] 알림에 세션 타입(sessionType) 정보가 포함되어야 한다
  - 지원 타입: `interactive`, `batch`, `inference`
- [ ] origin별로 구분 가능한 아이콘 또는 라벨이 표시되어야 한다
- [ ] sessionType별로 알림 메시지 템플릿이 차별화되어야 한다
  - batch 세션: "실행 완료 후 자동 종료됩니다" 안내 문구 포함
  - inference 세션: 엔드포인트 관련 안내 포함
- [ ] 기존 `session-launcher:` prefix 기반 알림이 하위 호환성을 유지해야 한다

#### R2. 세션 생성 제안 알림 (Session Suggestion Notification)

- [ ] origin이 `import`인 batch 세션이 `TERMINATED` 상태가 되었을 때 제안 알림이 발생해야 한다
  - `CANCELLED` 상태에서는 제안 알림이 발생하지 않아야 한다
- [ ] 제안 알림 메시지: "Import가 완료되었습니다. 해당 폴더를 마운트하여 새 세션을 생성하시겠습니까?"
- [ ] "세션 생성" 액션 버튼 클릭 시, import 때 생성된 vfolder가 마운트된 상태로 Session Launcher 페이지로 이동해야 한다
- [ ] 제안 알림은 닫기/무시가 가능해야 한다
- [ ] 제안 알림은 토스트와 Drawer 양쪽에 모두 표시되어야 한다

### Must Have (P1)

#### R3. 알림 일괄 관리 개선

- [ ] 토스트가 일정 개수(N개) 이상 쌓이면 "모두 닫기" 버튼이 표시되어야 한다
- [ ] 토스트 최대 동시 표시 개수가 제한되어야 한다 (초과분은 Drawer에만 쌓임)
- [ ] Drawer에서 체크박스로 여러 알림을 선택하여 일괄 삭제할 수 있어야 한다
- [ ] Drawer에서 카테고리별 일괄 닫기가 가능해야 한다
  - "완료된 알림 모두 지우기"
  - "에러 알림 모두 지우기"

#### R4. 알림 액션 확장

- [ ] 알림에 다중 액션 버튼을 지원해야 한다 (현재 단일 to/toText 링크만 가능)
- [ ] 각 액션 버튼은 label과 onClick 핸들러를 가져야 한다

#### R5. 알림 카테고리/필터 강화

- [ ] Drawer 필터에 카테고리 기반 필터가 추가되어야 한다
  - 기본 카테고리: 전체, 세션, 폴더, 시스템, 제안
- [ ] origin 또는 sessionType 기반 세부 필터가 가능해야 한다

### Nice to Have (P2)

#### R6. 알림 그룹핑

- [ ] 동일 시점에 다수의 세션이 생성될 경우, 하나의 그룹 알림으로 묶어서 표시할 수 있어야 한다
  - 예: "3개 세션 생성 중 (2/3 완료)"
- [ ] 그룹 알림을 펼쳐 개별 세션 상태를 확인할 수 있어야 한다

#### R7. Node 타입 확장

- [ ] `BAINodeNotificationItem`이 `EndpointNode`, `PipelineNode` 등 추가 노드 타입을 지원해야 한다
- [ ] 새로운 노드 타입 추가 시 기존 디스패처 패턴을 따라야 한다

### Nice to Have (P3)

#### R8. 알림 지속성

- [ ] 알림 히스토리가 localStorage 또는 IndexedDB에 저장되어 새로고침 후에도 유지될 수 있어야 한다
- [ ] 지속성 저장 대상은 Drawer에 표시되는 알림 목록에 한정한다 (토스트 재표시는 하지 않음)

#### R9. 알림 설정 세분화

- [ ] 사용자가 카테고리별로 알림 on/off를 설정할 수 있어야 한다
- [ ] 방해금지 모드: 토스트를 숨기고 Drawer에만 알림을 쌓는 모드를 지원해야 한다

#### R10. 에러 알림 개선

- [ ] 에러 알림에 사용자 친화적 요약 메시지가 표시되어야 한다
- [ ] "자세히 보기" 토글로 raw 에러 메시지를 확인할 수 있어야 한다

## 사용자 스토리

### 세션 생성 경로/타입 구분

- 사용자로서, 알림을 보고 어떤 경로(import, session launcher 등)에서 세션이 생성되었는지 즉시 파악하고 싶다.
- 사용자로서, batch 세션 생성 시 "실행 완료 후 자동 종료됩니다"라는 안내를 받아 세션 동작을 이해하고 싶다.

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

- [ ] `NotificationState`에 `origin`과 `category` 필드가 존재한다
- [ ] origin이 `import`인 알림과 `session-launcher`인 알림이 서로 다른 아이콘/라벨로 표시된다
- [ ] batch 타입 세션 생성 시 알림 메시지에 자동 종료 안내 문구가 포함된다
- [ ] 기존 `session-launcher:` prefix만 사용하는 코드 경로에서도 알림이 정상 동작한다 (하위 호환)

### R2: 세션 생성 제안 알림

- [ ] origin=`import`, sessionType=`batch`인 세션이 TERMINATED되면 3초 이내에 제안 알림이 표시된다
- [ ] 제안 알림의 "세션 생성" 버튼 클릭 시 Session Launcher 페이지로 이동하며, 해당 vfolder가 마운트 목록에 포함되어 있다
- [ ] origin=`import`, sessionType=`batch`인 세션이 CANCELLED되면 제안 알림이 표시되지 않는다
- [ ] 제안 알림을 닫아도 Drawer에서 다시 확인할 수 있다

### R3: 알림 일괄 관리

- [ ] 토스트가 3개 이상 표시된 상태에서 "모두 닫기" 버튼이 나타난다
- [ ] 토스트 최대 동시 표시 개수를 초과하면 새 알림은 Drawer에만 추가된다
- [ ] Drawer에서 2개 이상의 알림을 체크박스로 선택하고 "삭제" 버튼을 누르면 선택된 알림이 모두 제거된다
- [ ] "완료된 알림 모두 지우기" 클릭 시 backgroundTask.status가 `resolved`인 알림이 모두 제거된다

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

## 관련 파일

| 파일 | 역할 |
|------|------|
| `react/src/hooks/useBAINotification.tsx` | NotificationState 인터페이스, Jotai atom 상태, upsertNotification 등 핵심 훅 |
| `react/src/components/BAINodeNotificationItem.tsx` | ComputeSessionNode/VirtualFolderNode 디스패처 |
| `react/src/components/BAIComputeSessionNodeNotificationItem.tsx` | 세션 알림 컴포넌트 (상태 구독, 자동 닫힘, 액션 버튼) |
| `react/src/components/BAIVirtualFolderNodeNotificationItem.tsx` | VFolder 알림 컴포넌트 |
| `react/src/components/BAIGeneralNotificationItem.tsx` | 일반 알림 컴포넌트 (진행률, 아이콘, 액션 링크) |
| `react/src/components/WEBUINotificationDrawer.tsx` | Drawer UI (280px, 필터, Clear All) |
| `react/src/components/BAINotificationButton.tsx` | 벨 아이콘 버튼, 뱃지, Drawer 토글 |
| `react/src/hooks/useStartSession.tsx` | 세션 생성 시 알림 (`SESSION_LAUNCHER_NOTI_PREFIX`) |

## 열린 질문

1. 토스트 최대 동시 표시 개수의 적정값은? (3개? 5개?)
2. 제안 알림의 자동 만료 시간이 필요한가? (예: 24시간 후 자동 제거)
3. 알림 그룹핑(R6)의 그룹 기준은 시간 기반인가, 동일 요청 기반인가?
4. 알림 지속성(R8) 적용 시 저장 용량 상한은?
5. origin 목록에 추가가 필요한 경로가 있는가? (예: scheduled session, model store 등)
