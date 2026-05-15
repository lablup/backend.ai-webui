# 주기적 LTS × main E2E 매트릭스 검증 Spec

## Overview

Backend.AI WebUI `main` 브랜치는 출시된 Backend.AI 서버의 **현재 LTS (Long-Term Support) 버전**과의 하위 호환성을 지속적으로 유지해야 한다. 현재 E2E 파이프라인은 WebUI `main` × 단일 백엔드 endpoint 조합만 검증하므로, LTS 사이드에서 발생한 회귀(WebUI 변경으로 인한 것이든, 서버 스펙 차이로 인한 것이든)를 개발 과정에서 조기에 포착하기 어렵다.

본 스펙은 WebUI `main` 빌드를 **두 개의 Backend.AI manager endpoint** — (1) 개발 중인 `main` 서버 endpoint, (2) 현재 `latest LTS` 서버 endpoint — 에 대해 **주기적으로 교차 실행(매트릭스 실행)** 하고, 각 매트릭스 셀의 결과를 구분해서 리포팅·추적하는 시스템의 요구사항을 정의한다.

구체적인 실행 인프라(GitHub Actions / 자체 runner / 독립 VM / 기타)는 **본 스펙에서 강제하지 않는다**. 본 스펙은 "어떻게 돌아가야 하는가(WHAT)"에 집중하며, 실행 환경 선택은 후속 구현 Task의 몫이다.

## Problem Statement

### 현재 상태

- WebUI `main` 브랜치에 대한 기존 E2E 자동화(`e2e-watchdog`, `e2e-healer`)는 단일 백엔드 endpoint(`E2E_WEBUI_ENDPOINT`)에 대해서만 실행된다.
- LTS 백엔드와의 호환성은 release/patch 시점에 사람이 직접 수동으로 확인하거나, 릴리즈 후 필드에서 리포트로 알게 되는 경우가 많다.
- `main` 서버에서만 재현되는 이슈인지, LTS 서버에서도 재현되는 이슈인지, 또는 양쪽 모두에서 재현되는 이슈인지를 한눈에 분리해서 보기 어렵다.

### 영향

- LTS 유저에게 영향을 주는 WebUI 회귀가 **release 임박 시점**에야 발견된다.
- "이 이슈는 LTS 백엔드에서만 발생한다"는 정보를 수동으로 재현해가며 얻어야 한다.
- 백엔드 LTS 유지보수 담당자와 WebUI 담당자가 같은 이슈를 중복 분류하는 비용이 발생한다.

### 원하는 상태

- 정해진 주기(일/주 단위 중 선택)로 WebUI `main` 빌드를 두 매니저에 대해 자동 실행한다.
- 각 실행 결과는 "어느 매트릭스 셀에서 실패했는지"가 명확히 식별되는 형태로 리포트된다.
- 공통 실패와 한쪽만 실패하는 케이스가 알림/이슈 수준에서 구분된다.
- LTS 쪽에서만 실패한 경우 별도 태그/라벨이 붙어 담당자가 바로 인지할 수 있다.

## Goals

1. WebUI `main` 빌드에 대해 **둘 이상의 Backend.AI manager endpoint**(최소 `main`, `latest LTS`)를 대상으로 E2E 스위트를 주기적으로 실행한다.
2. 각 매트릭스 셀의 실행 결과를 **독립적으로 집계**하고, 셀별 식별자(예: `webui-main × manager-main`, `webui-main × manager-lts`)를 리포트/이슈/알림에 포함한다.
3. 실패 시나리오를 **원인 분류가 가능한 형태**로 리포트한다 (LTS-only / main-only / both / infrastructure).
4. 기존에 열려 있는 동일 실패 이슈와 **중복 생성을 방지**하고, 이전 실패가 해소된 경우 **자동 해제(resolve/comment)** 를 수행한다.
5. 실행 인프라를 추상화하여, 향후 runner/스케줄러를 교체하더라도 본 스펙의 기능 요구사항은 유지되도록 한다.

## Non-Goals

본 스펙은 의도적으로 아래 항목을 **범위에서 제외**한다:

- **"최신 LTS가 무엇인가"의 자동 감지**: LTS 버전 선택 및 manager endpoint 결정 로직은 본 시스템을 호스팅하는 **독립 인스턴스 내부 스크립트**가 담당한다. 본 스펙은 "외부로부터 두 개의 유효한 manager endpoint가 입력으로 주어진다"는 전제를 사용한다.
- **실행 인프라 선택 강제**: GitHub Actions, 자체 runner, 상시 VM, cron 기반 스크립트 등 어떤 실행 환경을 사용할지는 본 스펙의 관심 밖이다. 단, 관련 진행 중 Task(FR-2560~2565)는 GitHub Actions 기반을 가정하고 있다는 사실만 "Related Work" 섹션에 기술한다.
- **Manager 서버 provisioning 세부**: manager endpoint가 어떻게 기동되고 유지되는지(Docker spin-up, 상시 cluster, staging 환경 재활용 등)는 외부에서 보장되는 전제이며 본 스펙 범위가 아니다.
- **LTS EOL 처리**: 지원 종료된 LTS를 매트릭스에서 제거하는 정책/절차는 독립 인스턴스 관리자의 몫이다.
- **WebUI `main` 이외 브랜치 검증**: release 브랜치, feature 브랜치 등에 대한 LTS 매트릭스 검증은 후속 확장 과제로 미룬다.
- **E2E 테스트 케이스 자체의 신규 작성**: 본 스펙은 "기존 E2E 스위트를 매트릭스로 돌리는" 시스템에 대한 것이며, 개별 테스트 커버리지 추가는 별도 과제다.
- **자동 힐링(self-healing PR 생성)**: `e2e-healer`는 본 스펙에 포함되지 않는다. 실패 인지·리포팅·추적까지만 다룬다.

## User Stories

### 프론트엔드 엔지니어 (WebUI 담당)

- **S-FE-1**: WebUI 엔지니어로서, 내가 main에 머지한 코드가 LTS 백엔드에서도 문제없이 동작하는지 **다음 주기 실행 결과**로 확인하고 싶다. 그래야 release 임박 시점에 급히 패치할 일이 줄어든다.
- **S-FE-2**: WebUI 엔지니어로서, 실패 리포트를 볼 때 "main 서버에서만 깨진 것"과 "LTS 서버에서만 깨진 것"을 **한눈에 구분**하고 싶다. 그래야 원인 범위를 빠르게 좁힐 수 있다.

### 백엔드 LTS 유지보수 담당자

- **S-BE-1**: LTS 백엔드 유지보수 담당자로서, LTS manager에서만 실패하는 E2E 케이스가 있으면 **LTS 식별 라벨**이 달린 이슈로 받고 싶다. 그래야 LTS 백엔드 쪽 이슈인지 여부를 판단할 맥락을 얻을 수 있다.

### QA / Release 매니저

- **S-QA-1**: QA 담당자로서, 최근 N일간의 매트릭스 실행 성공/실패 추이를 한 곳에서 보고 싶다. 그래야 release readiness를 평가할 수 있다.
- **S-QA-2**: Release 매니저로서, 특정 WebUI commit × 특정 manager 버전 조합으로 **on-demand 재현**을 트리거할 수 있어야 한다. 그래야 릴리즈 차단 여부를 결정할 근거를 만들 수 있다.

## Functional Requirements

### Must Have

- [ ] **FR-A. 매트릭스 실행**: 시스템은 주어진 N개의 manager endpoint(최소 2개: `main`, `latest LTS`)에 대해 동일한 WebUI `main` 빌드를 반복 실행할 수 있어야 한다.
- [ ] **FR-B. 주기적 trigger**: 시스템은 사전에 정의된 주기(예: 매 영업일 1회)에 따라 자동 실행되어야 한다. 수동 trigger도 지원해야 한다.
- [ ] **FR-C. 셀 식별자**: 각 매트릭스 실행은 `{webui-build-id} × {manager-cell-id}` 형태의 **고유 식별자**를 가진다. 이 식별자는 모든 리포트/이슈/알림에 포함된다.
- [ ] **FR-D. 셀별 결과 분리**: 각 매트릭스 셀의 pass/fail 결과는 **다른 셀과 섞이지 않는 형태**로 기록·리포트된다.
- [ ] **FR-E. 실패 분류**: 실패가 발생하면 시스템은 아래 중 하나로 분류한다:
  - `main-only`: main manager에서만 실패
  - `lts-only`: LTS manager에서만 실패
  - `both`: 두 cell 모두에서 동일 테스트가 실패 (공통 회귀 후보)
  - `infrastructure`: 테스트 실행 이전 단계(endpoint 접속 불가 등)에서 실패
- [ ] **FR-F. 이슈 생성·갱신**: 테스트 실패 시 이슈 트래커(예: Jira / GitHub Issues / 기타 구성 가능)에 이슈가 생성된다. 동일 실패가 다음 주기에도 지속되면 **새 이슈를 중복 생성하지 않고 기존 이슈에 갱신 코멘트**를 남긴다.
- [ ] **FR-G. 이전 실패 복구 감지**: 이전 run에서 실패했던 케이스가 다음 run에서 통과하면 해당 이슈에 **resolve 혹은 통과 코멘트**를 자동 기록한다.
- [ ] **FR-H. 자격증명 주입**: 각 manager endpoint별 자격증명(관리자·일반유저 계정)은 플랫폼 중립적 방법으로 실행 환경에 주입 가능해야 한다. 자격증명 값은 리포트/로그에 **절대 노출되지 않는다** (REDACTED 처리).
- [ ] **FR-I. 인프라 오류 분리**: manager endpoint 자체 접속 불가, 네트워크 오류 등 **테스트 로직 외 오류**는 테스트 실패 리포트와 **별도 채널**(혹은 별도 라벨)로 보고된다. 테스트 실패 noise와 섞이면 안 된다.

### Nice to Have

- [ ] **FR-J. 단순 flake 재시도**: 1차 실패한 테스트를 동일 run 내 자동 재시도(최대 N회)하여, 재시도 통과 시 "flaky"로 태깅하고 실패 리포트를 생성하지 않는다. 재시도 횟수와 flake 처리 정책은 설정 가능.
- [ ] **FR-K. 수동 재현 trigger**: 담당자가 "이 WebUI commit × 이 manager endpoint" 조합으로 on-demand 실행을 걸 수 있다.
- [ ] **FR-L. 히스토리 대시보드**: 최근 N회 실행의 셀별 pass-rate / flake-rate를 조회할 수 있는 뷰가 존재한다. (구현체는 단순 정적 페이지·스프레드시트·Grafana 등 자유)
- [ ] **FR-M. 부분 셀 재실행**: 전체 매트릭스 중 실패한 일부 셀만 재실행할 수 있다.

## Scenarios

시스템이 만족해야 할 실행 흐름을 시나리오 단위로 기술한다. 각 시나리오는 Acceptance Criteria로 검증된다.

### S1. 정기 실행 성공 (Happy Path)

**Given** 주기적 trigger가 발동되고,
**And** 두 manager endpoint(`manager-main`, `manager-lts`)가 모두 정상이며,
**When** WebUI `main` 빌드가 두 endpoint에 대해 E2E 스위트를 실행하고,
**Then** 두 셀 모두 통과하고,
**And** 성공 기록만 히스토리에 남으며, 이슈나 알림은 생성되지 않는다.

### S2. main 매트릭스 단독 실패

**Given** S1과 동일한 조건에서,
**When** `manager-main` 셀의 테스트 `T`만 실패하고 `manager-lts`에서는 통과,
**Then** 이슈/알림에는 **`main-only`** 분류와 매트릭스 셀 ID가 포함되고,
**And** 동일 테스트에 대한 기존 open 이슈가 없으면 신규 생성, 있으면 해당 이슈에 갱신 코멘트가 달린다.

### S3. LTS 매트릭스 단독 실패

**Given** S1과 동일한 조건에서,
**When** `manager-lts` 셀의 테스트 `T`만 실패하고 `manager-main`에서는 통과,
**Then** 이슈/알림에는 **`lts-only`** 분류와 LTS 식별 라벨(예: `lts-regression`, `backend-lts:{version}`)이 포함되고,
**And** 담당자 그룹이 LTS 유지보수 담당자를 포함하도록 구성 가능하다.

### S4. 양쪽 모두 실패 (공통 회귀)

**Given** S1과 동일한 조건에서,
**When** 테스트 `T`가 두 셀에서 모두 실패,
**Then** 단일 이슈에 **`both`** 분류로 기록되고 각 셀의 실패 상세(로그/스크린샷 경로)가 셀 ID와 함께 첨부된다.
**And** 동일 테스트에 대해 셀별로 이슈를 이중 생성하지 않는다.

### S5. Flaky 테스트

**Given** S1과 동일한 조건에서,
**When** 테스트 `T`가 1차 실패 후 자동 재시도에서 통과,
**Then** 실패 리포트는 생성되지 않고, 해당 run은 전체적으로 성공으로 집계된다.
**And** 셀별 flake 카운터는 증가한다 (히스토리 조회 시 확인 가능).

### S6. 수동 재현 실행

**Given** 담당자가 특정 WebUI commit `C`와 특정 manager endpoint `E`를 지정하여 on-demand 실행을 트리거,
**When** 해당 조합으로 E2E 스위트가 실행,
**Then** 결과는 주기 실행과 동일한 형식으로 리포트되며,
**And** 결과 식별자에는 "수동 실행" 표식이 포함되어 정기 실행 히스토리와 구분된다.

### S7. Manager 접속 불가 (Infrastructure Error)

**Given** `manager-lts` endpoint가 응답 불가 상태,
**When** 매트릭스 실행이 시작,
**Then** 해당 셀은 **`infrastructure`** 분류로 즉시 기록되고 테스트 실행 자체는 건너뛴다.
**And** 이 오류는 테스트 실패 채널과 **분리된 채널/라벨**로 보고된다.
**And** 다른 정상 endpoint(`manager-main`)의 셀 실행은 영향을 받지 않고 계속 진행된다.

### S8. 중복 실패 집계 (Noise 방지)

**Given** 테스트 `T`의 실패에 대해 이미 open 상태의 이슈 `I`가 존재,
**When** 다음 주기 실행에서도 `T`가 동일한 셀에서 실패,
**Then** 신규 이슈는 생성되지 않고, 기존 이슈 `I`에 "실패 지속" 코멘트(run link, commit SHA, 셀 ID 포함)가 추가된다.
**And** 실패가 N회 이상 연속되면 이슈의 우선순위/라벨이 상향 조정될 수 있다 (정책은 설정 가능).

### S9. 이전 실패 복구

**Given** 테스트 `T`에 대해 이전 run에서 발생한 open 이슈 `I`가 존재,
**When** 다음 주기 실행에서 `T`가 해당 셀에서 통과,
**Then** 이슈 `I`에 "복구 확인" 코멘트 + 해당 run link가 추가되고,
**And** 정책에 따라 이슈가 자동 resolve 되거나 담당자 검토 대기 상태로 전환된다.

## Acceptance Criteria

- [ ] **AC-1**: 두 개 이상의 manager endpoint에 대해 매트릭스 실행이 성공적으로 완료되는 것을 확인할 수 있다. (S1 검증)
- [ ] **AC-2**: 임의의 셀 하나에서만 실패가 발생했을 때, 리포트/이슈가 해당 셀을 정확히 식별한다. (S2, S3 검증)
- [ ] **AC-3**: 두 셀에서 동일 테스트가 실패할 때, 단일 이슈에 `both` 분류로 기록된다. (S4 검증)
- [ ] **AC-4**: LTS 셀 실패에는 LTS 식별 라벨이 자동 부착된다. (S3 검증)
- [ ] **AC-5**: 동일 테스트의 동일 실패에 대해 두 번째 run 이후 신규 이슈가 중복 생성되지 않는다. (S8 검증)
- [ ] **AC-6**: 이전에 실패한 테스트가 다음 run에서 통과하면 해당 이슈에 자동 코멘트 또는 resolve 액션이 기록된다. (S9 검증)
- [ ] **AC-7**: endpoint 접속 불가 같은 인프라 오류는 테스트 실패 리포트와 구분된 형태로 보고된다. (S7 검증)
- [ ] **AC-8**: 자격증명 값이 리포트/이슈/로그 본문에 평문으로 노출되지 않는다 (REDACTED 혹은 "configured/missing"만 표기). (FR-H 검증)
- [ ] **AC-9**: 수동 trigger로 특정 WebUI commit × manager endpoint 조합 실행이 가능하다. (S6 검증)
- [ ] **AC-10**: 각 매트릭스 실행 결과에는 고유한 셀 식별자, run link, WebUI commit SHA가 항상 포함된다. (FR-C 검증)

## Reporting Options (결정 미정)

실패 리포트/이슈 표현 방식은 본 스펙에서 **하나로 확정하지 않는다**. 후속 구현 Task(FR-2563 등)에서 아래 옵션 중 택일하거나 조합한다. 본 섹션은 트레이드오프 정리가 목적.

### Option A. 통합 이슈 + 셀 메타데이터 (추천 기본값)

- 동일 실패 테스트에 대해 **단일 이슈**를 생성/갱신하고, 이슈 본문 또는 라벨에 영향받은 셀(`main`, `lts`, `both`)을 메타데이터로 기입.
- **장점**: 이슈 수가 테스트 실패 수에 비례하여 덜 부풀어 오름. 동일 이슈의 history가 한 곳에 모임.
- **단점**: LTS만 관심 있는 담당자가 filter로 LTS 관련만 추려봐야 함 (라벨로 해결 가능).

### Option B. 셀별 병렬 이슈

- `main-only` 실패와 `lts-only` 실패에 대해 **별개의 이슈**를 생성.
- **장점**: 백엔드 LTS 담당자가 LTS 이슈만 모아서 트리아지하기 쉬움.
- **단점**: 한 테스트가 양쪽에서 실패하면 이슈가 둘로 갈려 history가 분산됨. 중복 상태 관리 복잡도 증가.

### Option C. 집계 리포트 전용 + 이슈 최소화

- 개별 실패마다 이슈를 만들지 않고, **run별 집계 리포트 문서** 하나만 고정 위치(고정 이슈 / wiki 페이지 / 대시보드)에 갱신.
- **장점**: 이슈 트래커 noise 최소.
- **단점**: action item이 unclear하게 됨. 담당자 할당/우선순위 관리가 리포트 내부에서 일어나야 함.

**기본 제안**: **Option A (통합 이슈 + 셀 메타데이터)** 를 기본값으로 하고, LTS 전용 라벨과 필요 시 LTS 담당 그룹 멘션만 추가. 최종 결정은 FR-2563 구현 Task에서 확정.

## Related Work

현재 FR-2559 Epic 아래에는 이미 GitHub Actions 기반 구현을 가정한 하위 Task들이 존재한다. 본 스펙은 이들과 모순되지 않으면서 **인프라 중립적으로 상위 요구사항**을 재정의한다. 하위 Task의 인프라 선택(GitHub Actions)은 본 스펙이 강제하는 바가 아니며, 필요 시 변경 가능하다.

- **FR-2560 ~ FR-2565**: 주기 실행 workflow, 매니저 endpoint별 셀 분리, 알림 라우팅, 이슈 중복 방지 등에 대한 현재 GitHub Actions 기반 구현 Task들. 본 스펙에 정의된 요구사항(FR-A ~ FR-I, S1~S9)을 충족해야 한다.
- **`.github/workflows/e2e-watchdog.md`**: 현재 단일 endpoint 기반 주기 E2E 리포팅 workflow. 본 스펙은 이를 **매트릭스화**하는 진화 방향을 제시하되, 구현이 반드시 해당 파일을 확장하는 형태여야 함을 요구하지는 않는다.
- **`.github/workflows/e2e-healer.md`**: 자동 힐링 시도 workflow. 본 스펙 범위 밖 (Non-Goals 참조).
- **`e2e/README.md`**: 기존 태그 전략(`@smoke`, `@critical`, `@regression`, `@visual`). 매트릭스 실행 범위를 어느 태그로 할지는 Open Questions 참조.

### 본 스펙이 하위 Task에 **추가로 요구하는 사항**

- 각 workflow run/실행 record는 **매트릭스 셀 식별자**(`{webui-build-id} × {manager-cell-id}`)를 명시적으로 포함해야 한다.
- 이슈 생성 로직은 셀 식별자를 보고 중복/갱신을 판단해야 한다 (단순 테스트 이름만으로 판단 불가).
- LTS 식별 라벨/메타데이터를 자동 부착하는 경로가 있어야 한다.
- 인프라 오류(endpoint 접속 불가)와 테스트 실패를 **서로 다른 채널/라벨**로 분리해야 한다.

## Open Questions

본 스펙 승인 후 또는 후속 구현 Task에서 결정해야 할 항목:

1. **실행 주기**: 매 영업일 1회 / 매일 1회 / main 머지 시마다 / 주 1회 — 중 어느 것? (FR-B)
2. **테스트 범위**: 매트릭스에서 실행할 태그 스코프는? `@smoke` (빠른 검증) / `@critical` / `@regression` (완전) / 비-`@visual` 전체? run 시간 예산과의 균형 필요.
3. **Flake 정책**: 자동 재시도 최대 횟수 N, flake로 태깅할 임계, quarantine(격리 실행) 정책. (FR-J)
4. **리포팅 방식 최종 결정**: 위 "Reporting Options" A / B / C 중 어느 것? (기본값은 A 제안)
5. **히스토리 대시보드의 필요성 및 구현 수단**: 필요하다면 정적 페이지 / 이슈 트래커 query / 외부 대시보드(Grafana 등) 중 무엇? (FR-L)
6. **이슈 트래커 선택**: Jira 전용 / GitHub Issues 전용 / 양쪽 동기화? 이슈 생성 통합 정책.
7. **LTS 담당자 라우팅**: LTS 셀 실패 이슈의 기본 담당자/멘션 그룹은 누구?
8. **연속 실패 N회 임계**: 우선순위 상향 조정 기준(예: 3연속 실패 시 priority 상향)?
9. **매니저 endpoint 목록 관리**: 외부 독립 인스턴스 스크립트와 시스템 사이의 endpoint 전달 계약(파일 / 환경변수 / API)?

## Glossary

| 용어 | 정의 |
|---|---|
| **매트릭스 셀 (matrix cell)** | WebUI 빌드 하나와 manager endpoint 하나의 조합. 본 스펙의 최소 실행 단위. |
| **셀 식별자 (cell id)** | `{webui-build-id} × {manager-cell-id}` 형태의 문자열. 리포트 상 고유 key. |
| **main manager** | 개발 중인 Backend.AI `main` 브랜치 서버를 가리키는 endpoint. |
| **latest LTS manager** | 현재 지원 대상인 최신 LTS 버전의 Backend.AI 서버 endpoint. 구체 버전은 외부에서 결정됨. |
| **독립 인스턴스 (independent host)** | 본 시스템을 호스팅하는 VM/서버. LTS 버전 결정, manager endpoint 관리, 자격증명 주입 등을 스크립트로 수행. 본 스펙은 이 인스턴스의 존재를 전제로 한다. |
| **인프라 오류 (infrastructure error)** | endpoint 접속 불가, 네트워크 오류, 자격증명 누락 등 테스트 실행 이전 단계에서 발생한 오류. 테스트 실패와 별도로 분류. |
| **Flaky 테스트** | 동일 조건에서 재실행 시 결과가 달라지는 테스트. 본 스펙에서는 1차 실패 후 재시도에서 통과하는 케이스를 지칭. |

## Related Issues

- FR-2559 (Epic, 본 스펙 루트)
- FR-2560 ~ FR-2565: 하위 구현 Task들 (본 스펙의 요구사항을 만족해야 함)
