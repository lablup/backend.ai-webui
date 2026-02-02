# Backend.AI WebUI E2E Tests

## Overview

This directory contains End-to-End tests for Backend.AI WebUI. Tests are automated and validated using Playwright to simulate real user scenarios.

## Directory Structure

```
e2e/
├── critical/                       # 핵심 필수 기능 테스트 (@critical)
│   ├── auth/                       # 인증 및 로그인
│   ├── user/                       # 사용자 관리 (CRUD)
│   ├── vfolder/                    # 가상 폴더 관리
│   ├── session/                    # 컴퓨트 세션 라이프사이클
│   │   └── session-lifecycle.test.ts   ✅ 구현됨
│   └── serving/                    # 서비스 엔드포인트
│       └── endpoint-lifecycle.test.ts  ✅ 구현됨
│
├── features/                       # 추가 기능 테스트
│   ├── resource/                   # 리소스 관리 및 정책
│   ├── environment/                # 환경 및 이미지 관리
│   ├── project/                    # 프로젝트 관리
│   ├── data/                       # 데이터 가져오기/내보내기
│   └── dashboard/                  # 대시보드 인터랙션
│
├── integration/                    # 통합 테스트
│   ├── user-session-vfolder.test.ts
│   ├── project-resource-session.test.ts
│   └── end-to-end-workflows.test.ts
│
├── edge-cases/                     # 엣지 케이스 및 에러 처리
│   ├── error-handling.test.ts
│   ├── concurrent-operations.test.ts
│   ├── network-failures.test.ts
│   └── permission-violations.test.ts
│
├── performance/                    # 성능 테스트
│   ├── load-testing.test.ts
│   └── stress-testing.test.ts
│
├── visual_regression/              # Visual regression tests
│   └── [existing structure]
│
└── utils/                          # Utilities
    ├── classes/                    # Page Object Model classes
    │   ├── base/                   ✅ 구현됨
    │   │   ├── BasePage.ts
    │   │   └── BaseModal.ts
    │   ├── session/                ✅ 구현됨
    │   │   └── SessionDetailPage.ts
    │   ├── serving/                ✅ 구현됨
    │   │   └── EndpointPage.ts
    │   └── ...
    ├── fixtures/                   # 테스트 픽스처
    ├── helpers/                    # 헬퍼 함수
    ├── test-util.ts               # 기존 유틸리티
    ├── test-util-antd.ts          # Ant Design 유틸리티
    └── tags.ts                    # 테스트 태그 정의
```

## 🏷️ Test Tags

### 실행 우선순위
- `@smoke` - 가장 중요한 핵심 경로 (~5분)
- `@critical` - 중요 기능 테스트 (~15분)
- `@regression` - 전체 회귀 테스트 (~1시간)

### 기능 영역
- `@auth` - 인증
- `@user` - 사용자 관리
- `@vfolder` - 가상 폴더
- `@session` - 세션 관리
- `@serving` - 서비스 엔드포인트
- `@resource` - 리소스 관리
- `@environment` - 환경 관리
- `@project` - 프로젝트 관리

### 테스트 타입
- `@functional` - 기능 테스트
- `@visual` - 시각적 회귀 테스트
- `@integration` - 통합 테스트
- `@performance` - 성능 테스트

## 🚀 Running Tests

### 모든 테스트 실행
```bash
pnpm exec playwright test
```

### Run by tag
```bash
# Run smoke tests only (for PR checks)
pnpm exec playwright test --grep @smoke

# Critical tests 실행
pnpm exec playwright test --grep @critical

# Run specific feature tests
pnpm exec playwright test --grep @session
pnpm exec playwright test --grep @serving
```

### Run specific file
```bash
pnpm exec playwright test e2e/critical/session/session-lifecycle.test.ts
pnpm exec playwright test e2e/critical/serving/endpoint-lifecycle.test.ts
```

### Exclude visual regression
```bash
pnpm exec playwright test --grep-invert @visual
```

### Parallel execution
```bash
# Run with 4 shards
pnpm exec playwright test --shard=1/4
pnpm exec playwright test --shard=2/4
pnpm exec playwright test --shard=3/4
pnpm exec playwright test --shard=4/4
```

## Writing Tests

### Page Object Model Pattern

All tests follow the Page Object Model (POM) pattern.

#### Base Classes

**BasePage** - Base class for all page classes
```typescript
import { BasePage } from '../utils/classes/base/BasePage';

export class MyPage extends BasePage {
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async verifyPageLoaded(): Promise<void> {
    const element = this.page.locator('#main-content');
    await this.waitForVisible(element);
  }
}
```

**BaseModal** - Base class for all modal classes
```typescript
import { BaseModal } from '../utils/classes/base/BaseModal';

export class MyModal extends BaseModal {
  async waitForModalOpen(): Promise<void> {
    const modal = this.page.getByRole('dialog');
    await this.waitForVisible(modal);
  }

  async waitForModalClose(): Promise<void> {
    const modal = this.page.getByRole('dialog');
    await this.waitForHidden(modal);
  }
}
```

### Test Example

```typescript
import { test, expect } from '@playwright/test';
import { loginAsAdmin, navigateTo } from '../../utils/test-util';
import { MyPage } from '../../utils/classes/MyPage';

test.describe('My Feature', { tag: ['@critical', '@myfeature'] }, () => {
  let myPage: MyPage;

  test.beforeEach(async ({ page, request }) => {
    await loginAsAdmin(page, request);
    await navigateTo(page, 'mypage');
    myPage = new MyPage(page);
    await myPage.verifyPageLoaded();
  });

  test('Should do something', async () => {
    // Test implementation
    await myPage.doSomething();
    expect(await myPage.getSomething()).toBe('expected');
  });
});
```

## Current Implementation Status

### ✅ Completed (Phase 1)

#### Base Infrastructure
- ✅ Directory structure (critical, features, integration, etc.)
- ✅ Base POM classes (BasePage, BaseModal)
- ✅ Test organization by priority and feature

#### Session Management (@session)
- ✅ SessionDetailPage POM class
- ✅ Session lifecycle tests
  - Create, monitor, terminate interactive session
  - Batch session auto-completion
  - Container logs viewing
  - Resource usage monitoring
  - Status transition validation
  - Bulk operation constraints

#### Serving/Endpoint Management (@serving)
- EndpointPage POM class
- Endpoint lifecycle tests
  - Endpoint creation
  - Configuration updates
  - Status monitoring
  - Lifecycle stage filtering
  - Deletion workflow
  - Environment variable configuration
  - Validation error handling

### 🔄 In Progress

- VFolder file operations tests
- Resource management tests

### 📋 Planned (Phase 2-3)

- Environment management tests
- Project management tests
- Dashboard interaction tests
- Integration tests
- Edge case tests
- Performance tests

## Backend.AI Domain Constraints

Consider Backend.AI domain constraints when writing tests:

### Session Constraints
- Sessions are **immutable after termination** (TERMINATED/CANCELLED state)
- **No pause/restart** - only terminate is available
- Only RUNNING sessions can be selected for bulk operations
- State transitions: PENDING → PREPARING → RUNNING → TERMINATED

### VFolder Constraints
- **Only READY state can be mounted**
- Pipeline folders cannot be deleted/restored
- Only DELETE_PENDING state can be restored
- Permission-based operation control (delete_vfolder, update_attribute)

### Resource Constraints
- **3-tier resource policy** (Keypair → User → Project)
- Only activated scaling groups can be selected
- Image minimum resource requirements must be met

### RBAC Constraints
- ✅ superadmin, admin, monitor, user 역할별 권한
- ✅ 역할별 UI 가시성 및 작업 제한

자세한 내용은 계획 문서를 참조하세요: `/Users/codejong/.claude/plans/expressive-greeting-pinwheel.md`

## 📊 Coverage Goals

| Phase | Target Coverage | Timeline |
|-------|----------------|----------|
| Phase 1 | 35% → 55% | Sprint 1-2 (4주) |
| Phase 2 | 55% → 70% | Sprint 3-4 (4주) |
| Phase 3 | 70% → 80%+ | Sprint 5-6 (4주) |

## 🤝 Contributing

1. 새로운 테스트는 적절한 디렉토리에 배치
2. POM 패턴을 따라 클래스 작성
3. 적절한 태그 추가 (`@critical`, `@feature`)
4. Cleanup 로직 포함 (afterEach)
5. 도메인 제약사항 준수

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Test Fixtures](https://playwright.dev/docs/test-fixtures)
- [Backend.AI Domain Constraints](/.claude/plans/expressive-greeting-pinwheel.md)
