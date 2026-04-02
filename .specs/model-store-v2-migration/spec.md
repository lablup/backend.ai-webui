# 사용자 모델 스토어 페이지 modelCardV2 마이그레이션 Spec

## 개요

사용자 메뉴의 Model Store 페이지(`ModelStoreListPage`)가 현재 사용하는 레거시 `model_cards` (Graphene) GQL API를 새로운 `modelCardsV2` (Strawberry) API로 전환한다. 기존 Row/Col 그리드 카드 레이아웃을 유지하면서, 서버 사이드 페이지네이션/필터링/정렬을 도입하고, 모델 카드 상세 모달의 서비스 시작 UX를 개선한다.

## 문제 정의

1. **레거시 API 의존**: 현재 `ModelStoreListPage`는 Graphene 기반의 `model_cards` query를 사용한다. 이 API는 `first: 200`으로 전체를 가져온 뒤 클라이언트에서 필터링/정렬하는 구조라 성능이 좋지 않고, 백엔드의 새로운 `model_cards` 테이블(PR #10703)이 제공하는 서버 사이드 기능을 활용하지 못한다.
2. **페이지네이션 부재**: 모델 카드가 많아질 경우 전체를 한번에 로드하므로 느리고, GQL 응답이 과도하게 크다.
3. **서비스 시작 UX 개선 필요**: `ModelTryContentButton`이 모달 footer에 위치하며, `service-definition.toml`과 `model-definition.yaml` 파일 존재 여부에 의존하는 구조이다. modelCardV2 기반으로 전환하면서 `runtime_variants` 기반의 새로운 서비스 시작 플로우가 필요하다.
4. **데이터 구조 차이**: `ModelCard`(v1)은 flat 구조이고, `ModelCardV2`는 메타데이터가 `metadata` 서브 타입으로 분리되어 있다. `error_msg`, `min_resource`, `vfolder_node` 필드가 v2에 없고, 대신 `vfolderId`(UUID)로 대체된다.

## 요구사항

### Must Have

- [ ] 백엔드 버전에 따른 컴포넌트 분기
  - [ ] modelCardV2 지원 버전: 새로운 v2 컴포넌트 표시
  - [ ] modelCardV2 미지원 버전: 기존 컴포넌트를 Legacy로 리네이밍하여 표시 (`LegacyModelStoreListPage`, `LegacyModelCardModal` 등)
  - [ ] `baiClient.supports()` 또는 `isManagerVersionCompatibleWith()`로 버전 분기
- [ ] 새 `ModelStoreListPage`의 GQL query를 `modelCardsV2`로 구성
- [ ] `modelCardsV2`의 `ModelCardV2Filter`에 포함된 필드만 사용한 서버 사이드 필터링
  - [ ] 이름(name) 필터: `StringFilter` (contains 등) 사용
  - [ ] 도메인(domainName) 필터: 현재 도메인 자동 적용
  - [ ] 프로젝트(projectId) 필터: 현재 프로젝트 자동 적용
  - [ ] 기존 category/task/label 클라이언트 필터는 제거 (ModelCardV2Filter에 미포함)
- [ ] `ModelCardV2OrderBy`를 사용한 서버 사이드 정렬
  - [ ] NAME (ASC/DESC) 정렬
  - [ ] CREATED_AT (ASC/DESC) 정렬
- [ ] Relay cursor 기반 페이지네이션 (`first`, `after`) + "더 보기" 버튼 방식의 점진적 로딩 적용 (카드 그리드에 적합)
- [ ] 기존 Row/Col 그리드 카드 레이아웃 유지
  - [ ] 각 카드에 name, `metadata.title`, `createdAt`/`updatedAt` 표시
  - [ ] 태그(task, category, label 등)는 카드의 description 영역으로 이동
  - [ ] 모든 태그 색상을 default로 통일 (기존 success, blue, geekblue 등 제거)
  - [ ] 카드 클릭 시 모델 카드 상세 모달 열기
- [ ] `ModelCardModal`을 `ModelCardV2` 타입으로 전환
  - [ ] fragment를 `ModelCardV2` 타입 기반으로 재작성
  - [ ] `metadata` 서브 타입에서 author, title, description, task, category, architecture, framework, label, license 표시
  - [ ] 모달 내 태그(task, category, label, license)도 모두 default 색상으로 통일
  - [ ] `readme` 필드로 README 마크다운 렌더링
  - [ ] `vfolderId`를 File Browser 링크로 표시 (data 페이지의 file browser 열기 링크 활용)
- [ ] 모델 카드 상세 모달 - 서비스 시작 UX 변경
  - [ ] 기존 `ModelTryContentButton` (footer 버튼) 제거
  - [ ] Alert (antd, type="info", showIcon)로 "원하는 자원 그룹을 선택하여 이 모델의 서비스를 시작해보세요." 메시지 표시
  - [ ] 오른쪽 action 영역에 `BAIResourceGroupSelect` 컴포넌트와 "서비스 시작" 버튼 배치
  - [ ] 서비스 실행 시 해당 모델 카드의 vfolder를 반드시 마운트
  - [ ] TODO(needs-backend): `runtime_variants` 필드가 `ModelCardV2`에 추가된 후 아래 동작 구현
    - [ ] runtime_variants가 여러 개인 경우: 사용자가 선택하여 서비스 시작
    - [ ] runtime_variants가 0개(미지정)인 경우: 모델 카드가 비활성(draft) 상태로 간주됨
      - [ ] `available_presets` 요청 시 error 응답으로 전달됨 (optional none 동작)
      - [ ] 서비스 시작 버튼 비활성화 + "Runtime variants가 지정되지 않아 서비스를 시작할 수 없습니다" 안내 표시
      - [ ] 서비스 런처 페이지로 이동하는 링크/버튼 제공
    - [ ] runtime_variants가 1개인 경우: 선택 없이 바로 서비스 실행
  - [ ] TODO(needs-backend): 모델 카드 활성화 상태 필드 (draft/public 등) 추가 시 반영
    - [ ] runtime_variants 미지정 모델 카드는 활성화 불가 (사실상 필수 값)
    - [ ] 비활성 모델 카드는 목록에서 시각적으로 구분 (예: 뱃지, 흐린 카드 등)
- [ ] 기존 클라이언트 사이드 필터링(category, task, label Select) 제거
  - [ ] `ModelCardV2Filter`에 포함된 필드(name, domainName, projectId)만 사용
- [ ] 기존 `ModelBrandIcon` 유지 (모델 이름 기반 아이콘)

### Nice to Have

- [ ] 검색어 입력 시 debounce 적용하여 서버 요청 최적화
- [ ] 빈 상태(모델 카드 없음) UI 개선
- [ ] 모델 카드 로딩 시 스켈레톤 카드 표시

## 사용자 스토리

- 사용자로서, 모델 스토어에서 모델 카드 목록을 빠르게 조회하고 싶다. 서버 사이드 페이지네이션으로 초기 로딩이 빨라야 한다.
- 사용자로서, 모델 이름으로 검색하고, 생성일/이름 기준으로 정렬하여 원하는 모델을 쉽게 찾고 싶다.
- 사용자로서, 모델 카드를 클릭하면 상세 정보(메타데이터, README)를 확인하고 싶다.
- 사용자로서, 모델 카드 상세에서 자원 그룹을 선택하고 바로 서비스를 시작하고 싶다. 별도의 definition 파일 유무를 신경 쓰지 않아도 되어야 한다.
- 사용자로서, runtime variants가 여러 개인 모델에서 원하는 런타임을 선택하여 서비스를 시작하고 싶다.
- 사용자로서, runtime variants가 설정되지 않은 모델의 경우, 안내를 받고 서비스 런처 페이지에서 직접 구성할 수 있어야 한다.

## 인수 조건 (Acceptance Criteria)

### 목록 페이지

- [ ] `modelCardsV2` query를 사용하여 모델 카드 목록을 조회함
- [ ] 현재 도메인과 프로젝트에 맞는 모델 카드만 자동 필터링됨
- [ ] 이름 검색 시 `ModelCardV2Filter.name` (StringFilter)을 사용하여 서버에서 필터링됨
- [ ] 정렬 드롭다운에서 NAME/CREATED_AT (ASC/DESC) 선택 가능하고, 서버에서 정렬됨
- [ ] cursor 기반 페이지네이션 + "더 보기" 버튼으로 점진적 로딩이 동작함
- [ ] 각 모델 카드에 title(또는 name), task, category, 업데이트 시간이 표시됨
- [ ] Row/Col 그리드 레이아웃이 기존과 동일하게 유지됨 (xs~sm: 24, lg: 12)
- [ ] 새로고침 버튼으로 목록을 다시 불러올 수 있음

### 모델 카드 상세 모달

- [ ] `ModelCardV2` 타입의 데이터를 기반으로 상세 정보가 표시됨
- [ ] `metadata` 내 author, title, description, task, category, architecture, framework, label, license가 적절히 표시됨
- [ ] `readme` 필드의 마크다운이 렌더링됨
- [ ] VFolder가 `vfolderId`를 통해 File Browser 링크로 표시됨 (클릭 시 data 페이지의 file browser 열림)
- [ ] 기존 모달 footer 전체 제거 (`ModelTryContentButton`, 폴더로 클론 버튼 등 모두 제거)
- [ ] Alert info 메시지가 표시됨: "원하는 자원 그룹을 선택하여 이 모델의 서비스를 시작해보세요."
- [ ] `BAIResourceGroupSelect`와 "서비스 시작" 버튼이 action 영역에 배치됨
- [ ] 서비스 실행 시 해당 모델 카드의 vfolder가 마운트됨

### runtime_variants 기반 동작 (백엔드 필드 추가 후)

- [ ] runtime_variants가 여러 개: 드롭다운/선택 UI로 런타임 선택 후 서비스 시작
- [ ] runtime_variants가 0개(미지정): 서비스 시작 버튼 비활성화 + 안내 메시지 표시 + 서비스 런처 이동 링크
  - [ ] `available_presets` 요청 시 error 응답 처리 (optional none 동작)
- [ ] runtime_variants가 1개: 별도 선택 없이 해당 런타임으로 바로 서비스 실행

### 모델 카드 활성화 상태 (백엔드 필드 추가 후)

- [ ] runtime_variants 미지정 모델 카드는 비활성(draft) 상태로 표시됨
- [ ] 비활성 모델 카드는 목록에서 시각적으로 구분됨 (뱃지, 흐린 카드 등)
- [ ] 비활성 모델 카드의 서비스 시작 기능은 비활성화됨

### 데이터 마이그레이션 호환성

- [ ] v1 `ModelCard` 필드와 v2 `ModelCardV2` 필드의 차이가 UI에 반영됨
  - `error_msg`: v2에 없음 -- error 표시 로직 제거
  - `min_resource`: v2 GQL에서 미노출 -- 최소 리소스 표시 제거
  - `vfolder_node`: v2에서는 `vfolderId` (UUID)로 대체 -- 별도 VFolder 조회 필요
  - `metadata` 서브 타입: author, title, description 등이 nested 구조

## 범위 밖 (Out of Scope)

- 관리자 모델 카드 관리 (CRUD) -- 별도 스펙 (`admin-model-card-management`)
- 동적 Args/Env 폼 시스템 -- 별도 스펙 (`dynamic-args-env-form-system`)
- 모델 파일 업로드/다운로드/버전 관리
- 모델 카드 생성/수정/삭제 (사용자는 읽기 전용)
- `runtime_variants` 필드의 백엔드 구현 (코어 팀 담당, 아직 PR 없음)
- 기존 model_cards (v1) Legacy 컴포넌트 제거 (v2 안정화 이후 별도 진행)
- 모델 목록 UI를 리스트 형태로 변경 (FR-1927 스펙에서 다룸)

## V1 vs V2 필드 매핑 참고

| v1 ModelCard 필드 | v2 ModelCardV2 필드 | 비고 |
|---|---|---|
| id (Relay ID) | id (Relay ID) | 동일 |
| name | name | 동일 |
| row_id | vfolderId | v1 VFolder ID(UUID) → v2 vfolderId |
| (없음) | rowId | v2 전용 모델 카드 DB 식별자 |
| author | metadata.author | nested |
| title | metadata.title | nested |
| version | metadata.modelVersion | 이름 변경 + nested |
| description | metadata.description | nested |
| task | metadata.task | nested |
| category | metadata.category | nested |
| architecture | metadata.architecture | nested |
| framework | metadata.framework | nested |
| label | metadata.label | nested |
| license | metadata.license | nested |
| readme | readme | 동일 (top-level) |
| created_at | createdAt | 네이밍 변경 |
| modified_at | updatedAt | 이름 변경 |
| vfolder_node | vfolderId (UUID) | 관계 -> ID로 변경 |
| error_msg | (없음) | v2에서 제거됨 |
| min_resource | (GQL 미노출) | DB에만 존재 |
| readme_filetype | (없음) | v2에서 제거됨 |

## 백엔드 API 레퍼런스

### modelCardsV2 Query

```graphql
modelCardsV2(
  filter: ModelCardV2Filter,
  orderBy: [ModelCardV2OrderBy!],
  before: String, after: String,
  first: Int, last: Int,
  limit: Int, offset: Int
): ModelCardV2Connection
```

### modelCardV2 단건 조회

```graphql
modelCardV2(id: UUID!): ModelCardV2  # id는 rowId(UUID)를 의미, Relay 글로벌 ID가 아님
```

### ModelCardV2Filter

```graphql
input ModelCardV2Filter {
  name: StringFilter = null       # 이름 필터 (contains, equals 등)
  domainName: String = null       # 도메인 필터 (exact)
  projectId: UUID = null          # 프로젝트 필터 (exact)
}
```

### ModelCardV2OrderBy

```graphql
input ModelCardV2OrderBy {
  field: ModelCardV2OrderField!   # NAME | CREATED_AT
  direction: String! = "ASC"      # ASC | DESC
}
```

### 백엔드에 아직 없는 기능 (follow-up 필요)

1. **`runtime_variants` 필드**: `ModelCardV2` 타입에 runtime_variants 필드가 아직 없음. 코어에서 추가 예정이나 관련 PR 없음. runtime_variants 미지정 시 `available_presets`는 error로 전달됨 (optional none).
2. **활성화 상태 필드**: draft/public 같은 활성화 상태 필드명 미확정. runtime_variants가 사실상 필수 값이므로, 미지정 모델 카드는 활성화 불가로 처리해야 함.
3. **VFolder 연관 조회**: `ModelCardV2`에 `vfolder_node` 관계 필드가 없고 `vfolderId`(UUID)만 존재. 현재는 File Browser 링크로 대응하되, 추후 VFolder 이름 표시 등이 필요하면 관계 필드 추가 요청.

## 관련 이슈

- [admin-model-card-management spec](../admin-model-card-management/spec.md) -- 관리자 모델 카드 CRUD 스펙
- [FR-1927 model-store-improvement spec](../FR-1927-model-store-improvement/spec.md) -- 모델 스토어 UI/UX 개선 스펙
- [backend.ai#10703](https://github.com/lablup/backend.ai/pull/10703) -- feat: add ModelCard entity with full CRUD stack
