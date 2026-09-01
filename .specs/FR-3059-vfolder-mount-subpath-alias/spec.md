# VFolder 마운트 Subpath · Alias 설정 컴포넌트 Spec

> **Source Issue**: [FR-3059](https://lablup.atlassian.net/browse/FR-3059) · [GitHub #7756](https://github.com/lablup/backend.ai-webui/issues/7756)
> **Epic**: (생성 예정)

## 개요 (Overview)

VFolder를 마운트할 때, 현재 UI는 vfolder의 **루트(root)** 만 마운트 소스로 사용할 수 있고, 마운트 대상 경로(컨테이너 내부 경로 = alias)만 지정할 수 있다. 백엔드는 이미 vfolder의 **하위 경로(subpath)** 를 마운트 소스로 지정하는 옵션을 지원한다(26.4.4부터 `ExtraVFolderMountInput.subpath`, `ModelMountConfigInput.subpath`).

본 스펙은 사용자가 **(1) vfolder를 선택하고, (2) 선택된 각 폴더에 대해 마운트 대상 경로(alias)와 마운트 소스 subpath를 개별 입력**할 수 있는 **재사용 가능한 폼 아이템 컴포넌트**를 정의한다. 이 컴포넌트는 세션 생성과 Deployment(모델 서비스) revision 설정 양쪽에서 공통으로 사용되며, 특정 화면이나 GraphQL 뮤테이션에 종속되지 않는다.

## 문제 정의 (Problem Statement)

- vfolder 안의 특정 하위 디렉터리(예: `dataset/train`)만 마운트하고 싶어도, 현재 UI는 항상 vfolder 루트를 마운트한다. 사용자는 컨테이너 안에서 직접 하위 경로로 이동해야 하며, 경로가 길어지고 실수가 발생한다.
- 백엔드는 이미 subpath를 지원하지만 프런트엔드에는 이를 노출하는 UI가 전혀 없다.
- 마운트 설정 UI가 세션 생성용(`VFolderMountFormItem` / `VFolderTableFormItem`)과 Deployment revision용(`DeploymentAddRevisionModal` 내부)으로 분산되어 있어, subpath를 추가하려면 여러 곳을 중복 수정해야 한다. 재사용 가능한 단일 컴포넌트가 필요하다.

## 용어 정리 (Terminology)

마운트는 **소스(source)** 와 **대상(target)** 두 축으로 구성된다. 본 컴포넌트는 이 둘을 명확히 분리한다.

| 항목 | 의미 | 기존 UI | 본 스펙 |
|---|---|---|---|
| **Subpath** (마운트 소스) | vfolder **내부**의 어떤 하위 경로를 마운트할지 | 없음 (항상 루트) | 신규 입력 (선택) |
| **Alias / 마운트 대상 경로** | 컨테이너 **내부**의 어디에 마운트될지 (예: `/home/work/{name}`) | 기존 입력 (`mount_id_map`) | 유지 |

> "경로 & 대체이름"(첨부 목업의 입력 라벨)은 기존의 **마운트 대상 경로(alias)** 입력을 의미한다. 본 스펙은 여기에 **소스 subpath** 입력을 추가한다.

## 요구사항 (Requirements)

### Must Have

- [ ] 재사용 가능한 단일 컴포넌트로 vfolder 마운트 설정 UI를 제공한다. 세션 생성과 Deployment revision 양쪽에서 동일 컴포넌트를 사용한다.
- [ ] 사용자가 vfolder를 (다중) 선택하면, 선택된 각 폴더가 셀렉트 아래에 **리스트(행)** 형태로 표시된다.
- [ ] 각 행에서 **마운트 대상 경로(alias)** 를 입력할 수 있다. (기존 동작 유지)
- [ ] 각 행에서 **subpath** 를 free-text input으로 입력할 수 있다. (신규)
- [ ] subpath는 **선택 입력(optional)** 이다. 비워두면 기존과 동일하게 vfolder 루트가 마운트 소스가 된다.
- [ ] 컴포넌트는 GraphQL 스키마/뮤테이션에 종속되지 않는다. antd `Form` 필드를 통해 값을 부모 폼에 노출하고, 부모(세션/Deployment)가 각자의 입력 타입으로 매핑한다.
- [ ] 각 행 오른쪽에 제거(✕) 버튼을 두어, 셀렉트를 열지 않고도 해당 폴더를 마운트 목록에서 바로 제거할 수 있다.
- [ ] 폴더를 선택 해제하거나 행에서 제거하면 해당 폴더의 alias·subpath 값도 함께 정리된다.
- [ ] subpath 입력에 대한 라이트한 형식 검증을 수행한다(아래 "검증 규칙" 참고). 실제 경로 존재 여부는 백엔드가 검증한다.

### Nice to Have

- [ ] subpath 입력 옆/헤더에 의미를 설명하는 툴팁(`?`) 제공 (목업의 "경로 & 대체이름 ?"와 동일 패턴).
- [ ] subpath 입력 시 폴더 탐색기로 하위 경로를 선택하는 picker (※ 본 스펙 범위 밖, 아래 Out of Scope 참고).

## 사용자 스토리 (User Stories)

### US-1: vfolder 선택 후 행 단위 설정
- **As a** 세션/서비스를 만드는 사용자, **I want** 여러 vfolder를 선택한 뒤 각 폴더별로 마운트 설정을 행 단위로 보고 편집하고 **so that** 어떤 폴더가 어디에/어느 하위 경로로 마운트되는지 한눈에 관리할 수 있다.
- Acceptance criteria:
  - [ ] 셀렉트에서 vfolder를 선택하면 아래에 폴더명 + 입력 필드로 구성된 행이 추가된다.
  - [ ] 셀렉트에서 선택 해제하거나 행의 제거 버튼을 누르면 해당 행과 값이 사라진다.
  - [ ] 행 순서는 선택 순서를 따른다.

### US-2: 마운트 대상 경로(alias) 지정
- **As a** 사용자, **I want** 각 폴더가 컨테이너 내부 어디에 마운트될지 지정하고 **so that** 워크로드가 기대하는 경로에 데이터를 둘 수 있다.
- Acceptance criteria:
  - [ ] 각 행에 마운트 대상 경로 입력이 있다.
  - [ ] 미입력 시 기본값 `/home/work/{folderName}` 이 적용된다. (기존 `DEFAULT_ALIAS_BASE_PATH` 동작 유지)
  - [ ] 경로가 `vFolderAliasNameRegExp`(`^[a-zA-Z0-9_/.-]*$`)을 만족하지 않으면 에러를 표시한다.
  - [ ] 서로 다른 폴더의 마운트 대상 경로가 중복되면 에러를 표시한다. (기존 overlap 검증 유지)

### US-3: subpath(마운트 소스 하위 경로) 지정
- **As a** 사용자, **I want** vfolder 내부의 특정 하위 경로만 마운트하고 **so that** 큰 vfolder에서 필요한 디렉터리만 컨테이너에 노출할 수 있다.
- Acceptance criteria:
  - [ ] 각 행에 subpath free-text 입력이 있다.
  - [ ] subpath는 선택 입력이며, 비우면 vfolder 루트가 마운트된다.
  - [ ] subpath 입력값은 부모 폼에 폴더별로 노출되어, 부모가 마운트 입력으로 전달할 수 있다.
  - [ ] 형식 검증(검증 규칙 절)을 위반하면 에러를 표시한다.

### US-4: 세션·Deployment 공통 사용
- **As a** 개발자(컴포넌트 소비자), **I want** 동일한 컴포넌트를 세션 생성과 Deployment revision 양쪽에 붙이고 **so that** 마운트 UI/검증 로직을 중복 구현하지 않는다.
- Acceptance criteria:
  - [ ] 컴포넌트는 antd `Form` 컨텍스트 안에서 동작하며, 노출하는 폼 필드 이름/형태가 문서화된다.
  - [ ] 세션 생성 경로(`SessionLauncherPage` 등)에서 alias·subpath 값을 extra mount 입력으로 매핑할 수 있다.
  - [ ] Deployment revision 경로(`DeploymentAddRevisionModal`의 extra mounts)에서 동일하게 매핑할 수 있다.
  - [ ] 컴포넌트 내부에 GraphQL 뮤테이션/입력 타입 의존성이 없다.

## UX / 레이아웃 (제안)

첨부 목업을 기준으로, 셀렉트 하단 각 행을 다음과 같이 구성한다:

```
이름            경로 & 대체이름 (alias)          subpath (소스, 선택)
────────────────────────────────────────────────────────────────────
qwen3-0.6B     [ /home/work/qwen3-0.6B   ]      [ 예: dataset/train     ]   ✕
```

- 헤더: `이름` / `경로 & 대체이름` (툴팁 `?`) / `subpath`.
- 각 행: 폴더명(ellipsis + tooltip) · alias 입력 · subpath 입력 · 제거(✕) 버튼.
- subpath 입력은 항상 표시(인라인). placeholder로 예시·선택 입력임을 안내한다.
- 빈 alias 입력 아래에는 기존처럼 적용될 기본 경로를 보조 텍스트로 노출(`/home/work/{name}`).

> 행 내 입력 배치(인라인 2열 vs 별도 advanced 영역)는 구현 단계에서 디자인 확인 후 확정. 본 스펙은 "행 단위 인라인 표시"를 기본 방향으로 한다.

## 검증 규칙 (Validation)

- **Alias (마운트 대상 경로)**: 기존 규칙 유지 — `vFolderAliasNameRegExp` 통과, 폴더 간 경로 중복 불가.
- **Subpath (마운트 소스)**:
  - 선택 입력. 공백만 입력 시 미지정(루트)으로 처리(trim).
  - 프런트엔드는 라이트한 형식 검증을 수행하며, 다음 두 경우를 **명시적으로 에러로 막는다**(입력 필드에 에러 표시):
    1. 절대경로 — `/`로 시작하는 입력.
    2. 상위 경로 탈출 — 세그먼트에 `..`가 포함된 입력.
  - 위 두 경우 외의 문자 집합 검증은 백엔드에 위임한다.
  - **실제 하위 경로 존재 여부는 프런트엔드가 검증하지 않는다.** 백엔드가 검증·에러를 반환한다.

## 컴포넌트 API (요구 수준)

> 정확한 필드 명/값 형태는 구현 시 확정하되, 다음 원칙을 만족해야 한다.

- 컴포넌트는 부모 antd `Form`에 폴더별 **alias**, **subpath** 값을 노출한다.
- 현행 `VFolderMountFormItem`은 `mount_ids: string[]` + `mount_id_map: Record<localId, alias>` 를 사용한다. subpath는 이에 대응하는 **별도 맵**(예: `mount_subpath_map: Record<localId, subpath>`) 또는 구조화된 단일 맵으로 확장한다. 둘 중 택1은 구현 단계 결정 사항.
- 소비자(세션/Deployment)는 이 폼 값을 자신의 마운트 입력(`ExtraVFolderMountInput { vfolderId, mountDestination, subpath }` 등)으로 매핑한다. 매핑 로직은 **소비자 쪽**에 둔다.

## 범위 밖 (Out of Scope)

- 백엔드/스키마 변경 — `subpath` 입력은 이미 존재한다. 본 스펙은 프런트엔드 UI만 다룬다.
- subpath를 고르는 **폴더 탐색기 picker** — 본 스펙은 free-text 입력만 다룬다. picker는 후속 과제.
- Deployment의 **모델 마운트(model mount, `ModelMountConfigInput`)** 에 대한 subpath UI — 1차 범위는 extra mounts. 모델 마운트 확장은 후속 검토(아래 Open Questions).
- **마운트 미리보기(SessionLauncherPreview 등)에 subpath 정보 표시** — 본 스펙 범위 밖. 후속 과제로 둔다.

## Open Questions

1. subpath UI를 **모델 마운트**(Deployment)에도 1차에 포함할지, extra mounts에만 먼저 적용할지.
2. 폼 값 형태: 기존 `mount_id_map`과 평행한 `mount_subpath_map`(마이그레이션 최소) vs `{ alias, subpath }` 구조화 맵(API 정돈) 중 선택.
3. subpath 형식 검증 강도: 어디까지 프런트에서 막고 어디부터 백엔드에 위임할지.

## 관련 이슈 (Related Issues)

- FR-3059 — VFolder selector component supporting subpath as mount source (source)
- FR-464 — Duplicated mount list is shown in compute session list (참고)

## 변경 이력 (Change Log)

- 2026-06-16: 초안 작성 (FR-3059 기반, 재사용 컴포넌트 + subpath/alias 인라인 입력 방향)
