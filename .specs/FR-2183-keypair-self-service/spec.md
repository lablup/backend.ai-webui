# 셀프서비스 키페어 관리 & 메인 액세스 키 전환

## 개요

일반 사용자가 WebUI를 통해 자신의 API 키페어를 관리(발급, 비활성화, 활성화, 삭제, 메인 전환)할 수 있도록 합니다. 백엔드 API는 이미 완성되어 있으며, 4개의 Strawberry GraphQL 뮤테이션(`issueMyKeypair`, `updateMyKeypair`, `revokeMyKeypair`, `switchMyMainAccessKey`)과 1개의 Strawberry 쿼리(`myKeypairs`)를 제공합니다.

## 문제 정의

현재 WebUI의 키페어 관리는 관리자 전용(`/credential` 페이지)입니다. 일반 사용자는 읽기 전용 모달(`MyKeypairInfoModal`)에서만 키페어를 확인할 수 있습니다. 사용자가 할 수 없는 것들:
- 서로 다른 환경이나 애플리케이션을 위한 추가 키페어 생성
- 키페어 비활성화 또는 재활성화
- 사용하지 않는 키페어의 영구 삭제
- 메인 액세스 키 전환

## 요구사항

### 필수 (Must Have)

- [ ] **컴포넌트 분리 전략:**
  - 기존 `MyKeypairInfoModal`을 `MyKeypairInfoModalLegacy`로 리네임하고, 컴포넌트 상단에 `// TODO: 27.4.0 이후 삭제 (26.4.0 미만 백엔드 호환용)` 주석 추가
  - 새로운 `MyKeypairManagementModal` 컴포넌트를 생성하여 Strawberry `myKeypairs` 쿼리 기반으로 구현
  - `@since(version: "26.4.0")` 분기에 따라 `MyKeypairManagementModal` 또는 `MyKeypairInfoModalLegacy`를 렌더링
- [ ] 새 `MyKeypairManagementModal`에서 발급/비활성화/활성화/삭제/전환 액션 지원
- [ ] **활성 / 비활성 탭** — 관리자 `UserCredentialList` 패턴처럼 `BAIRadioGroup`을 사용한 탭 전환으로 활성/비활성 키페어 분리. 탭 전환 시 사용자 필터/정렬 상태 유지 (`ComputeSessionListPage` 패턴과 동일)
- [ ] `issueMyKeypair` 뮤테이션을 호출하는 "새 키페어 발급" 버튼 (입력값 불필요) — 활성/비활성 탭 모두에서 항상 표시. 발급 후 활성 탭으로 자동 전환
- [ ] **키페어 발급 결과 모달:** 키페어 발급 후, 생성된 자격 증명 정보를 별도 모달로 표시 (`IssueMyKeypairPayload`의 `keypair: KeyPairGQL!`과 `secretKey: String!`):
  - `keypair.accessKey`, `secretKey`, `keypair.sshPublicKey`를 각각 클립보드 복사 버튼과 함께 표시
  - "이 정보는 이 창을 닫으면 다시 확인할 수 없습니다. 반드시 안전한 곳에 저장해 주세요." 경고 메시지 표시
  - Footer: "CSV 다운로드" 버튼 (primary) 하나만 배치 — 발급 시 표시되는 모든 정보 포함 (`accessKey`, `secretKey`, `sshPublicKey`)
  - 닫기는 모달 상단 X 버튼으로 처리
  - `maskClosable={false}`로 모달 바깥 클릭 시 실수로 닫히지 않도록 방지
- [ ] **탭별 제어 버튼:**
  - **활성 탭:** "메인으로 설정" 액션 (`switchMyMainAccessKey` 호출), "비활성화" 액션 (`updateMyKeypair(input: { accessKey, isActive: false })` 호출 — 소프트, 되돌릴 수 있음)
  - **비활성 탭:** "활성화" 액션 (`updateMyKeypair(input: { accessKey, isActive: true })` 호출 — 복원), "삭제" 액션 (`revokeMyKeypair(input: { accessKey })` 호출 — 영구 삭제, 되돌릴 수 없음)
- [ ] 현재 메인 액세스 키 행에 "메인" 배지 표시
- [ ] **메인 키 식별:** `User` 타입의 `main_access_key: String` 필드를 `myKeypairs`와 같은 쿼리에서 함께 조회하여 현재 메인 키를 식별. 각 키페어 행의 `accessKey`와 비교하여 "메인" 배지 표시 및 제어 버튼 상태 결정
- [ ] 메인 액세스 키 행의 "비활성화" 버튼을 비활성화하고 툴팁 표시: 먼저 메인을 전환해야 함
- [ ] 비활성화 확인: 간단한 확인 다이얼로그 (되돌릴 수 있는 작업)
- [ ] 삭제 확인: 사용자가 액세스 키를 직접 입력해야 하는 `BAIConfirmModalWithInput` 사용 (되돌릴 수 없는 영구 삭제)
- [ ] **메인 키 정보 배너:** 테이블 위에 현재 메인 액세스 키 정보 배너 표시 (백엔드 `KeypairFilter`에 main key 필터 없으므로 테이블 필터와 독립적으로 항상 노출)
- [ ] **비밀 키:** 테이블에 비밀 키 컬럼을 표시하지 않음. `KeyPairGQL` 노드에 `secretKey` 필드가 없으며, 비밀 키는 발급 시 결과 모달에서만 확인 가능
- [ ] **`@since` 디렉티브 및 폴백:** `myKeypairs` 쿼리에 `@since(version: "26.4.0")` 클라이언트 디렉티브 적용. 26.4.0 미만 백엔드에서는 기존 `MyKeypairInfoModalLegacy` (읽기 전용)를 렌더링하여 호환성 유지

#### 테이블 개선

- [ ] **추가 컬럼:** 키페어 테이블에 `createdAt`, `lastUsed`, `modifiedAt` 컬럼 추가 (`KeyPairGQL` 노드에서 제공)
- [ ] **정렬:** `KeypairOrderBy` 입력을 사용한 컬럼 기반 정렬 — UI에서 사용할 `KeypairOrderField` 값: `CREATED_AT`, `LAST_USED`, `ACCESS_KEY`, `RESOURCE_POLICY` (기본 방향: `DESC`). 참고: `IS_ACTIVE`는 enum에 존재하지만 탭 전환으로 처리되므로 정렬 UI에서 제외
- [ ] **페이지네이션:** Relay 커서 기반 페이지네이션 (`first`/`after`, `last`/`before`) 또는 오프셋 기반 (`limit`/`offset`) 지원 — `KeyPairConnection` 타입의 `pageInfo`, `count` 활용
- [ ] **필터링:** `BAIGraphQLPropertyFilter` 컴포넌트를 사용하여 필터 기능 추가 (Strawberry 구조화 필터)
  - `myKeypairs` 쿼리는 Strawberry `KeypairFilter` 입력 타입을 사용 — `BAIGraphQLPropertyFilter` (`packages/backend.ai-ui/src/components/BAIGraphQLPropertyFilter.tsx`) 적용
  - 필터 가능 필드: `accessKey` (StringFilter), `resourcePolicy` (StringFilter), `createdAt` (DateTimeFilter), `lastUsed` (DateTimeFilter), `isAdmin` (Boolean)
  - 참고: `isActive`는 탭 전환으로 이미 처리되므로 필터 속성에서 제외하고, 탭 상태를 `filter` 파라미터의 `isActive` 필드로 전달
  - 논리 조합: `AND`, `OR`, `NOT` 지원
- [ ] 키페어 목록 조회를 현재 레거시 REST API(`baiClient.keypair.list()`)에서 Strawberry GraphQL `myKeypairs` 쿼리로 마이그레이션
  - `myKeypairs`는 인증된 사용자 본인의 키페어만 반환 (내부적으로 `current_user()` 호출)
  - Relay `useLazyLoadQuery` 사용
- [ ] **뮤테이션 후 UI 갱신:** 모든 뮤테이션(`issueMyKeypair`, `updateMyKeypair`, `revokeMyKeypair`, `switchMyMainAccessKey`) 성공 후 Relay `refetch`로 키페어 목록 및 사용자 정보(메인 키) 갱신. `issueMyKeypair`와 `updateMyKeypair`는 `keypair: KeyPairGQL!`을 반환하므로 Relay 스토어 직접 업데이트도 고려 가능

### 있으면 좋은 것 (Nice to Have)
- [ ] 키페어 발급 결과 모달에서 액세스 키, 비밀 키, SSH 공개 키를 한번에 복사하는 "전체 자격 증명 복사" 버튼 추가

## 사용자 스토리

- **일반 사용자**로서, 서로 다른 애플리케이션이나 환경에 별도의 자격 증명을 사용할 수 있도록 새 API 키페어를 발급하고 싶습니다.
- **일반 사용자**로서, 키페어를 영구적으로 잃지 않고 임시로 비활성화할 수 있도록 키페어를 비활성화하고 싶습니다.
- **일반 사용자**로서, 필요할 때 복원할 수 있도록 이전에 비활성화한 키페어를 다시 활성화하고 싶습니다.
- **일반 사용자**로서, 더 이상 필요 없는 자격 증명을 정리할 수 있도록 사용하지 않는 키페어를 영구 삭제하고 싶습니다.
- **일반 사용자**로서, 계정을 활성 상태로 유지하면서 자격 증명을 교체할 수 있도록 메인 액세스 키를 전환하고 싶습니다.
- **일반 사용자**로서, 기본 인증을 제어하는 키페어가 무엇인지 알 수 있도록 어떤 키페어가 메인 액세스 키인지 명확하게 확인하고 싶습니다.
- **일반 사용자**로서, 효과적으로 관리할 수 있도록 활성/비활성 상태별로 구분된 키페어를 보고 싶습니다.
- **일반 사용자**로서, 필요한 키페어를 빠르게 찾을 수 있도록 키페어를 정렬하고 필터링하고 싶습니다.

## 인수 기준 (Acceptance Criteria)

**진입점:**
- [ ] 모달은 사용자 설정 페이지의 기존 "My Keypair Info" 설정 버튼을 통해 접근 가능
  - 네비게이션 경로: **사용자 아바타 (우측 상단)** → **환경 설정** → `/usersettings` → **환경 설정** 섹션 → **"My Keypair Info"** Config 버튼
  - 컴포넌트: `UserSettingsPage` (`react/src/pages/UserSettingsPage.tsx`)에서 백엔드 버전에 따라 `MyKeypairManagementModal` (26.4.0+) 또는 `MyKeypairInfoModalLegacy` (26.4.0 미만) 열기

**활성 / 비활성 탭:**
- [ ] "활성"과 "비활성" 옵션이 있는 `BAIRadioGroup` 탭 스위처 추가 (관리자 `UserCredentialList`과 동일한 패턴)
- [ ] 활성 탭에는 "메인으로 설정", "비활성화" 액션이 있는 활성 키페어 표시
- [ ] 비활성 탭에는 "활성화" (복원), "삭제" (영구 삭제) 액션이 있는 비활성 키페어 표시
- [ ] 탭 선택 시 `myKeypairs` 쿼리의 `filter: { isActive: true/false }` 파라미터로 키페어 목록 필터링
- [ ] 탭 전환 시 사용자 필터/정렬 상태 유지 (`ComputeSessionListPage` 패턴과 동일)

**메인 키 식별:**
- [ ] `User` 타입의 `main_access_key` 필드를 `myKeypairs`와 같은 쿼리에서 함께 조회
- [ ] 각 키페어 행의 `accessKey`와 `main_access_key`를 비교하여 "메인" 배지 표시
- [ ] 메인 키 정보 배너를 테이블 위에 표시 (백엔드에서 `KeypairFilter`로 메인 키 필터링은 지원하지 않음)

**키페어 테이블:**
- [ ] 컬럼: 액세스 키 (`accessKey`), 메인 표시기 (배지), 리소스 정책 (`resourcePolicy`), 생성일 (`createdAt`), 마지막 사용일 (`lastUsed`), 수정일 (`modifiedAt`)
- [ ] 비밀 키 컬럼은 표시하지 않음 — 비밀 키는 발급 시 결과 모달에서만 확인 가능
- [ ] `BAIGraphQLPropertyFilter`를 사용한 필터링:
  - 필터 속성: `accessKey` (string, `iContains`), `resourcePolicy` (string, `iContains`), `createdAt` (datetime), `lastUsed` (datetime)
  - `isActive`는 탭 전환으로 처리되므로 `BAIGraphQLPropertyFilter` 속성에서 제외
  - `isAdmin`은 일반 사용자 관점에서 유용하지 않으므로 필터 UI에서 제외
- [ ] `KeypairOrderBy`를 사용한 컬럼 정렬: `CREATED_AT` (기본), `LAST_USED`, `ACCESS_KEY`, `RESOURCE_POLICY`
- [ ] Relay 커서 기반 페이지네이션 (`first`/`after`) 또는 오프셋 기반 (`limit`/`offset`) — `KeyPairConnection.count`로 총 개수 표시

**키페어 발급:**
- [ ] 테이블 위에 "새 키페어 발급" 버튼 — 활성/비활성 탭 모두에서 항상 표시
- [ ] 발급 성공 후 활성 탭으로 자동 전환 (새 키페어는 활성 상태로 생성됨)
- [ ] `issueMyKeypair` 호출 후, 결과 모달 표시 (`IssueMyKeypairPayload` 반환):
  - Body: `keypair.accessKey`, `secretKey`, `keypair.sshPublicKey`를 각각 복사 버튼과 함께 표시 + "이 정보는 이 창을 닫으면 다시 확인할 수 없습니다. 반드시 안전한 곳에 저장해 주세요." 경고
  - Footer: "CSV 다운로드" (primary) 하나만 배치, 닫기는 상단 X 버튼, `maskClosable={false}`
  - CSV 다운로드 내용: 발급 시 표시되는 모든 정보 포함 (`accessKey`, `secretKey`, `sshPublicKey`)
- [ ] 키페어 설정 (resource_policy, rate_limit, is_admin)은 현재 메인 키페어에서 자동 상속 — 사용자 입력 불필요

**제어 버튼 (활성 탭):**
- [ ] 메인이 아닌 각 키페어 행에 "메인으로 설정" 버튼 — `switchMyMainAccessKey(input: { accessKey })` 호출
- [ ] "메인으로 설정" 클릭 시 `Popconfirm`으로 확인: "이 키페어를 메인 액세스 키로 설정하시겠습니까?" (인증에 영향을 주는 작업이므로 실수 방지)
- [ ] 메인 액세스 키 전환 후, refetch로 "메인" 표시기가 새 메인 키페어로 이동
- [ ] 각 키페어 행에 "비활성화" 버튼 — `updateMyKeypair(input: { accessKey, isActive: false })` 호출
- [ ] 비활성화는 소프트/되돌릴 수 있는 작업 — 간단한 확인 다이얼로그 사용 (`BAIConfirmModalWithInput` 아님)
- [ ] 메인 키페어 행의 "비활성화" 버튼은 툴팁과 함께 비활성화: "메인 액세스 키는 비활성화할 수 없습니다. 먼저 다른 키로 전환하세요."

**제어 버튼 (비활성 탭):**
- [ ] 키페어 재활성화를 위한 "활성화" 버튼 — `updateMyKeypair(input: { accessKey, isActive: true })` 호출
- [ ] 비활성 키페어 영구 삭제를 위한 "삭제" 버튼 — `revokeMyKeypair(input: { accessKey })` 호출
- [ ] 삭제 확인 시 사용자가 액세스 키를 입력해야 하는 `BAIConfirmModalWithInput` 사용 (되돌릴 수 없는 데이터베이스 영구 삭제)

**상태 전환 후 UX:**
- [ ] 활성 탭에서 "비활성화" 성공 후: 해당 행이 활성 탭 목록에서 사라짐 (refetch). 성공 메시지 토스트 표시
- [ ] 비활성 탭에서 "활성화" 성공 후: 해당 행이 비활성 탭 목록에서 사라짐 (refetch). 성공 메시지 토스트 표시
- [ ] 비활성 탭에서 "삭제" 성공 후: 해당 행이 목록에서 영구 제거. 성공 메시지 토스트 표시

**빈 상태 (Empty State):**
- [ ] 각 탭에 키페어가 없을 때 빈 상태 UI 표시
  - 활성 탭: "활성 키페어가 없습니다." (메인 키는 항상 활성이므로 실질적으로 발생하지 않음)
  - 비활성 탭: "비활성 키페어가 없습니다."

**테이블 컬럼 설정:**
- [ ] `BAITable`의 컬럼 설정 버튼 추가 — 사용자가 표시할 컬럼을 선택 가능 (세션 런처 패턴)

**데이터 마이그레이션:**
- [ ] 키페어 목록 조회를 현재 레거시 REST API(`baiClient.keypair.list()`)에서 Strawberry `myKeypairs` 쿼리로 마이그레이션 (Relay `useLazyLoadQuery` 사용)
- [ ] `myKeypairs` 쿼리에 `@since(version: "26.4.0")` 클라이언트 디렉티브 적용

**UI 갱신:**
- [ ] 모든 뮤테이션 성공 후 Relay `refetch`로 키페어 목록 및 사용자 정보(메인 키) 갱신. 단, `issueMyKeypair`와 `updateMyKeypair`는 반환된 `keypair: KeyPairGQL!` 객체를 활용하여 Relay 스토어 직접 업데이트도 고려 가능 (목록 추가/상태 변경의 경우)
- [ ] refetch 시 `useTransition`으로 감싸서 현재 UI를 유지한 채 백그라운드 로딩 — 깜빡임 방지. `isPending` 상태로 테이블에 subtle한 로딩 표시 (예: opacity 낮추기)
- [ ] 테이블 상단에 `BAIFetchKeyButton`을 배치하여 수동 목록 새로고침 지원 (자동 갱신 불필요)

**에러 처리:**
- [ ] 적절한 에러 메시지로 에러 상태 처리 (예: 메인 키 비활성화 시도 시 백엔드 에러 반환, 네트워크 장애)

## 백엔드 API 참조

### 셀프서비스 뮤테이션 (Strawberry)

| 뮤테이션 | 입력 타입 | 출력 타입 | 비고 |
|---|---|---|---|
| `issueMyKeypair` | 없음 | `IssueMyKeypairPayload { keypair: KeyPairGQL!, secretKey: String! }` | 메인 키페어에서 resource_policy, rate_limit, is_admin 상속. 키는 자동 생성 (AKIA + 랜덤). `keypair` 필드에서 `accessKey`, `sshPublicKey` 등 키페어 정보 조회 가능. |
| `updateMyKeypair` | `input: UpdateMyKeypairInput! { accessKey: String!, isActive: Boolean! }` | `UpdateMyKeypairPayload { keypair: KeyPairGQL! }` | 소프트 비활성화/활성화 토글. 소유권 검증 (에러: "Cannot update another user's keypair"). 키페어 존재 확인 (에러: "Keypair {accessKey} not found"). 반환된 `keypair`로 Relay 스토어 업데이트 가능. |
| `revokeMyKeypair` | `input: RevokeMyKeypairInput! { accessKey: String! }` | `RevokeMyKeypairPayload { success: Boolean! }` | **영구 삭제**. 메인 액세스 키는 삭제 불가 (에러: "Cannot revoke the main access key. Switch main access key first."); 소유권 검증 (에러: "Cannot revoke another user's keypair"). |
| `switchMyMainAccessKey` | `input: SwitchMyMainAccessKeyInput! { accessKey: String! }` | `SwitchMyMainAccessKeyPayload { success: Boolean! }` | 대상이 활성 상태여야 함 (에러: "Cannot set an inactive keypair as the main access key.") 및 사용자 소유여야 함 (에러: "Cannot set another user's access key as the main access key."). |

### 메인 키 식별 — `User.main_access_key`

```graphql
# User 타입 (Graphene) — main_access_key 필드
type User {
  main_access_key: String  # 24.03.0+
  # ... 기타 필드
}
```

`myKeypairs`와 같은 쿼리에서 User 정보를 함께 조회하여 `main_access_key` 값을 가져오고, 각 `KeyPairGQL.accessKey`와 비교하여 메인 키를 식별합니다.

### 키페어 목록 쿼리 — `myKeypairs` (Strawberry, `@since(version: "26.4.0")`)

> 백엔드 PR #10404 (BA-5296)에서 추가. 레거시 Graphene `keypair_list` 대신 사용.

```graphql
myKeypairs(
  filter: KeypairFilter = null
  orderBy: [KeypairOrderBy!] = null
  before: String = null
  after: String = null
  first: Int = null
  last: Int = null
  limit: Int = null
  offset: Int = null
): KeyPairConnection!
```

#### `KeyPairConnection` 타입

```graphql
type KeyPairConnection {
  pageInfo: PageInfo!
  edges: [KeyPairGQLEdge!]!
  count: Int!          # 필터 조건에 맞는 총 레코드 수
}
```

#### `KeyPairGQL` 노드 (Relay Node)

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | `ID!` | Relay 글로벌 ID (`access_key` 기반 인코딩) |
| `accessKey` | `String!` | 액세스 키 문자열 |
| `isActive` | `Boolean` | 활성 상태 |
| `isAdmin` | `Boolean` | 관리자 권한 여부 |
| `createdAt` | `DateTime` | 생성 일시 |
| `modifiedAt` | `DateTime` | 수정 일시 |
| `lastUsed` | `DateTime` | 마지막 사용 일시 |
| `rateLimit` | `Int!` | API 속도 제한 (분당 요청수) |
| `numQueries` | `Int!` | 총 API 쿼리 수 |
| `resourcePolicy` | `String!` | 리소스 정책명 |
| `sshPublicKey` | `String` | SSH 공개 키 |
| `userId` | `UUID!` | 소유자 UUID |

> **참고:** `secretKey`는 보안상 `KeyPairGQL` 노드에서 **제외**됨. 비밀 키는 `issueMyKeypair` 발급 시에만 반환되며, 이후에는 다시 조회할 수 없음. 따라서 테이블에 비밀 키 컬럼을 표시하지 않음.

#### `KeypairFilter` 입력 (구조화 필터)

| 필드 | 타입 | 설명 |
|---|---|---|
| `isActive` | `Boolean` | 활성 상태 필터 (탭 전환에 사용) |
| `isAdmin` | `Boolean` | 관리자 여부 필터 |
| `accessKey` | `StringFilter` | 액세스 키 문자열 필터 (`contains`, `startsWith`, `equals`, `iContains` 등) |
| `resourcePolicy` | `StringFilter` | 리소스 정책 문자열 필터 |
| `createdAt` | `DateTimeFilter` | 생성 일시 필터 (`before`, `after`, `equals`, `notEquals`) |
| `lastUsed` | `DateTimeFilter` | 마지막 사용 일시 필터 (`before`, `after`, `equals`, `notEquals`) |
| `AND` | `[KeypairFilter!]` | 논리 AND 조합 |
| `OR` | `[KeypairFilter!]` | 논리 OR 조합 |
| `NOT` | `[KeypairFilter!]` | 논리 NOT 조합 |

> `BAIGraphQLPropertyFilter` 컴포넌트와 직접 호환되는 구조화 필터 형식.

#### `KeypairOrderBy` 입력

| 필드 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `field` | `KeypairOrderField!` | `CREATED_AT` | 정렬 필드 |
| `direction` | `OrderDirection!` | `DESC` | 정렬 방향 (`ASC` / `DESC`) |

#### `KeypairOrderField` enum

| 값 | 설명 |
|---|---|
| `CREATED_AT` | 생성 일시 기준 |
| `LAST_USED` | 마지막 사용 일시 기준 |
| `ACCESS_KEY` | 액세스 키 알파벳순 |
| `IS_ACTIVE` | 활성 상태 기준 |
| `RESOURCE_POLICY` | 리소스 정책명 기준 |

## 영향받는 컴포넌트

| 컴포넌트 | 변경 사항 |
|---|---|
| `MyKeypairInfoModal` → `MyKeypairInfoModalLegacy` | 기존 읽기 전용 모달을 리네임. 컴포넌트 상단에 `// TODO: 27.4.0 이후 삭제` 주석 추가. 26.4.0 미만 백엔드에서만 사용 |
| `MyKeypairManagementModal` (신규) | Strawberry `myKeypairs` 쿼리 기반 새 모달. 탭, 테이블 개선, 필터/정렬/페이지네이션, 제어 버튼, `BAIGraphQLPropertyFilter` 사용 |
| `UserSettingsPage` | `@since` 분기에 따라 `MyKeypairManagementModal` 또는 `MyKeypairInfoModalLegacy` 렌더링 |
| `KeypairInfoModal` | 변경 없음 (이미 메인 키 태그 표시) |
| `KeypairSettingModal` | 변경 없음 |
| `UserSettingModal` | 변경 없음 (이미 main_access_key 필드 보유) |

## 범위 외 (Out of Scope)

- 백엔드 API 변경 (이미 완료: BA-4764 PR #10066, PR #10309, BA-5296 PR #10404, PR #10415)
- 관리자 키페어 관리 개선 (이미 구현됨)
- 관리자가 사용자를 대신하여 키페어 생성 (기존 `create_keypair` 뮤테이션이 이미 처리)
- 일반 사용자의 키페어 리소스 정책 또는 속도 제한 수정 (셀프서비스 키페어는 메인 키페어의 설정을 상속)
- SSH 키페어 관리 (별도 기능, 이미 자체 모달 보유: `SSHKeypairManagementModal`)
- 키페어 만료 또는 시간 기반 교체 정책
- 대량 키페어 작업
- 키페어 작업 감사 로그

## 관련 이슈

- FR-2183: 셀프서비스 키페어 관리 및 메인 액세스 키 전환 UI 추가 (원본 이슈)
- BA-4764: 셀프서비스 키페어 관리 백엔드 API (백엔드, 완료, PR #10066 머지됨)
- BA-5296: `myKeypairs` Strawberry GQL 쿼리 추가 (백엔드, PR #10404)
- BA-4762: 상위 에픽 (스케줄러, 사용자 관리, 스토리지 클론 API 개선)
- 백엔드 PR #10309: 소프트 비활성화/활성화를 위한 `updateMyKeypair` 뮤테이션 추가
- 백엔드 PR #10415: 뮤테이션 페이로드 개선 — `IssueMyKeypairPayload`와 `UpdateMyKeypairPayload`가 `KeyPairGQL` 객체를 반환하도록 변경
- GitHub #5675: webui 저장소의 클론된 이슈
