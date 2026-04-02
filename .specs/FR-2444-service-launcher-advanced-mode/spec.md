# 모델 서비스 런처 Advanced 모드 스펙

> **Epic**: FR-2444 ([link](https://lablup.atlassian.net/browse/FR-2444))

## 개요

모델 서비스 런처에 Advanced 모드 토글을 추가하여, 필수 입력 항목과 고급 설정을 분리한다. 기본 모드에서는 서비스 생성에 필요한 핵심 필드만 표시하고, 고급 설정(환경 변수, 추가 마운트, 클러스터 모드)은 접힌 섹션 뒤에 숨겨 일반 워크플로우의 인지 부담을 줄인다.

## 문제 정의

현재 서비스 런처는 모든 설정 옵션을 하나의 플랫 폼에 나열한다. 대부분의 사용자에게 클러스터 모드, 환경 변수, 추가 마운트의 기본값은 충분하다. 모든 옵션을 동등하게 노출하면 폼이 시각적으로 복잡해지고, 핵심 설정(모델, 런타임, 이미지, 리소스 프리셋)만 필요한 사용자에게 부담이 된다. 고급 사용자는 여전히 이 설정들에 접근할 수 있어야 하지만, 항상 보이는 것이 아닌 필요할 때 열어보는 방식이어야 한다.

## 요구사항

### 필수 (Must Have)

- [ ] 런처 폼의 첫 번째 Card(서비스 설정 카드) 하단에 Advanced 모드 토글 버튼 추가
- [ ] Advanced 섹션은 `SessionOwnerSetterCard`와 동일한 패턴으로 구현: Card + 토글 버튼 + `display: none/block`으로 내용 표시/숨김 (DOM에 항상 존재하여 Form validation이 접힌 상태에서도 동작)
- [ ] 새 서비스 생성 시 Advanced 모드는 기본적으로 접힌(off) 상태
- [ ] **환경 변수** (`EnvVarFormList`, 런타임 variant의 필수 환경 변수 포함)를 Advanced 섹션으로 이동
- [ ] **추가 마운트** (현재 `VFolderTableFormItem`)를 Advanced 섹션으로 이동하고, `BAIVFolderSelect` multi-select 모드로 교체
- [ ] **클러스터 모드 및 클러스터 사이즈**를 Advanced 섹션으로 이동
- [ ] 클러스터 모드의 helper tooltip 아이콘을 info icon(ℹ️)에서 물음표(?)로 변경
- [ ] Advanced 모드 토글 상태를 다른 폼 값과 함께 URL 쿼리 파라미터에 유지
- [ ] 모든 폼 필드(기본 + Advanced)가 동일한 Ant Design `Form` 인스턴스를 공유하여 교차 필드 validation이 정상 동작 (예: 리소스 프리셋이 리소스 그룹에 의존, 클러스터 모드가 리소스 validation에 영향)
- [ ] 폼 제출 시 기본 + Advanced 섹션의 모든 값 수집

### 있으면 좋은 것 (Nice to Have)

- [ ] Advanced 섹션의 부드러운 펼침/접힘 애니메이션
- [ ] Advanced 토글이 접힌 상태에서 기본값이 아닌 Advanced 필드가 있을 때 시각적 표시(배지 또는 점)
- [ ] `useBAISettingUserState`를 통해 사용자의 Advanced 모드 선호 기억 (우선순위: URL 쿼리 파라미터 > userState — URL에 명시된 값이 있으면 저장된 선호보다 우선)

## 사용자 스토리

- **일반 사용자**로서, 서비스 생성 시 핵심 필드(서비스 이름, 모델, 런타임, 이미지, 레플리카, 리소스 프리셋)만 보고 빠르게 서비스를 시작하고 싶다.
- **고급 사용자**로서, Advanced 설정을 펼쳐 환경 변수, 추가 스토리지 마운트, 클러스터 모드를 구성하여 서비스 배포를 세밀하게 조정하고 싶다.
- **사용자**로서, Advanced 모드 상태가 URL에 보존되어 공유 링크나 페이지 새로고침 시 뷰 설정이 유지되길 원한다.

## 인수 조건 (Acceptance Criteria)

### Advanced 모드 토글

- [ ] 서비스 설정 카드 하단에 토글 버튼 렌더링
- [ ] 토글 클릭 시 Advanced 섹션 표시/숨김 (`display: none/block` 패턴, `SessionOwnerSetterCard`와 동일 — DOM에 항상 유지하여 validation 보장)
- [ ] 토글 상태를 URL 쿼리 파라미터에 동기화 (예: `advancedMode=true`)
- [ ] 페이지 로드 시 URL에 `advancedMode=true`가 있으면 Advanced 섹션 펼침

### Advanced 섹션 내용

- [ ] 환경 변수 (`EnvVarFormList`)가 기존 기능 그대로(런타임 variant의 필수/선택 환경 변수, validation, 추가/삭제) Advanced 섹션에 렌더링
- [ ] 추가 마운트가 `BAIVFolderSelect` multi-select로 Advanced 섹션에 렌더링. 기존 추가 마운트 선택의 필터링 조건과 동일하게 적용: 주 모델 폴더 제외, `ready` 상태, `model` usage mode 제외, 시스템 폴더(`.`으로 시작하는 이름) 제외
- [ ] 클러스터 모드(single-node / multi-node 라디오)와 클러스터 사이즈 슬라이더가 Advanced 섹션에 렌더링

### 폼 동작

- [ ] 모든 폼 validation이 기본 + Advanced 섹션에 걸쳐 동작 (예: 필수 환경 변수는 Advanced 섹션이 접혀 있어도 validation)
- [ ] `Form.Provider`의 `onFormChange`가 Advanced 필드 포함 모든 필드의 URL 동기화 트리거
- [ ] 폼 제출 시 (`validateFields`) 접힌 Advanced 섹션의 필드 포함 모든 필드 validation
- [ ] Advanced 필드의 초기값이 URL 쿼리 파라미터 및 기존 엔드포인트 데이터(편집 모드)에서 올바르게 채워짐

## 범위 밖 (Out of Scope)

- `ResourceAllocationFormItems` 분리 (`visibleFields` prop, 프리셋 기반 슬라이더 숨김 등) — 별도 이슈로 구현 방향을 잡고 pipeline을 통해 구현
- 기존 서비스 편집 시 Advanced 섹션 자동 펼침 (auto-expand)
- 설명된 것 이상으로 기본(항상 보이는) 폼 필드 재구성 또는 재설계
- 기존 API 요청 형식 변경 — 서비스 생성/수정 페이로드는 동일하게 유지
- 지정된 3가지(환경 변수, 추가 마운트, 클러스터 모드) 외 새 설정 옵션을 Advanced 섹션에 추가
- 멀티 스텝 위자드 또는 기본/고급 설정을 위한 별도 페이지
- 역할 기반 Advanced 모드 가시성 (모든 사용자가 토글 가능)
- 세션 런처 변경 — 이 스펙은 모델 서비스 런처에만 적용

## 영향받는 주요 컴포넌트

- `react/src/components/ServiceLauncherPageContent.tsx` — 메인 폼 레이아웃, 토글 로직, URL 동기화
- `react/src/components/SessionFormItems/ResourceAllocationFormItems.tsx` — 클러스터 모드/사이즈 Advanced 섹션 이동
- `react/src/components/EnvVarFormList.tsx` — Advanced 섹션으로 이동 (내부 변경 없을 것으로 예상)
- `react/src/components/VFolderTableFormItem.tsx` — 서비스 런처에서 추가 마운트용 `BAIVFolderSelect`로 대체
- `packages/backend.ai-ui/src/components/fragments/BAIVFolderSelect.tsx` — 추가 마운트용 multi-select 모드로 사용

## 관련 이슈

- FR-2444: Epic — 모델 서비스 런처 Advanced 모드
- FR-2445: Task — 피처 스펙 정의
