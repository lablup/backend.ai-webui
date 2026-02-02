# Backend.AI WebUI E2E Tests

## Overview

This directory contains End-to-End tests for Backend.AI WebUI. Tests are automated and validated using Playwright to simulate real user scenarios.

## Directory Structure

```
e2e/
├── auth/                           # 인증 관련 테스트
│   └── login.test.ts               # 로그인, 로그인 전/후, 실패 케이스
│
├── user/                           # 사용자 관리 테스트
│   └── user-crud.test.ts           # 사용자 생성, 수정, 삭제, Purge
│
├── vfolder/                        # 가상 폴더 관리 테스트
│   ├── vfolder-crud.test.ts        # VFolder 생성, 수정, 삭제, 공유
│   ├── vfolder-explorer-modal.test.ts  # 폴더 탐색기 모달
│   └── vfolder-consecutive-deletion.test.ts  # 연속 삭제 테스트
│
├── session/                        # 세션 관리 테스트
│   ├── session-creation.test.ts    # 세션 생성 (Interactive/Batch)
│   └── session-lifecycle.test.ts   # 세션 라이프사이클
│
├── serving/                        # 서비스 엔드포인트 테스트
│   └── endpoint-lifecycle.test.ts  # 엔드포인트 라이프사이클
│
├── environment/                    # 환경 및 이미지 관리 테스트
│   └── environment.test.ts         # 이미지 리스트, 리소스 제한, 앱 관리
│
├── agent/                          # 에이전트 관리 테스트
│   └── agent.test.ts               # 에이전트 리스트 및 상태
│
├── maintenance/                    # Maintenance page tests
│   └── maintenance.test.ts         # Recalculate Usage, Rescan Images
│
├── app-launcher/                   # 앱 런처 테스트
│   ├── app-launcher-basic.test.ts  # 앱 런처 기본 인터랙션
│   └── app-launcher-launch.test.ts # 앱 실행 테스트
│
├── config/                         # 설정 및 접근 제어 테스트
│   ├── config.test.ts              # config.toml 설정
│   └── page-access-control.test.ts # 페이지 접근 제어 (404/401)
│
├── visual_regression/              # Visual regression tests
│   └── [existing structure]
│
└── utils/                          # Utilities
    ├── classes/                    # Page Object Model classes
    │   ├── base/
    │   │   ├── BasePage.ts
    │   │   └── BaseModal.ts
    │   ├── common/
    │   │   ├── StartPage.ts
    │   │   └── NotificationHandler.ts
    │   ├── session/
    │   │   ├── SessionLauncher.ts
    │   │   ├── SessionDetailPage.ts
    │   │   └── AppLauncherModal.ts
    │   ├── user/
    │   │   ├── UserSettingModal.ts
    │   │   ├── KeyPairModal.ts
    │   │   ├── UserInfoModal.ts
    │   │   └── PurgeUsersModal.ts
    │   ├── vfolder/
    │   │   ├── FolderCreationModal.ts
    │   │   └── FolderExplorerModal.ts
    │   ├── serving/
    │   │   └── EndpointPage.ts
    │   └── ...
    ├── test-util.ts                # Common utilities
    └── test-util-antd.ts           # Ant Design utilities
```

## Test Tags

### Execution Priority
- `@smoke` - Most critical core paths (~5 min, for PR checks)
- `@critical` - Important feature tests (~15 min, before merge)
- `@regression` - Full regression tests (~1 hour, nightly)

### Feature Areas
- `@auth` - Authentication
- `@user` - User management
- `@vfolder` - Virtual folders
- `@session` - Session management
- `@serving` - Service endpoints
- `@environment` - Environment management
- `@agent` - Agent management
- `@maintenance` - Maintenance
- `@app-launcher` - App launcher
- `@config` - Configuration and access control

### Test Types
- `@functional` - Functional tests
- `@visual` - Visual regression tests
- `@integration` - Integration tests

## Running Tests

### Run all tests
```bash
pnpm exec playwright test
```

### Run by tag
```bash
# Run smoke tests only (for PR checks)
pnpm exec playwright test --grep @smoke

# Run critical tests (before merge)
pnpm exec playwright test --grep @critical

# Run regression tests (nightly builds)
pnpm exec playwright test --grep @regression

# Run specific feature tests
pnpm exec playwright test --grep @auth
pnpm exec playwright test --grep @session
pnpm exec playwright test --grep @vfolder
pnpm exec playwright test --grep @serving
```

### Run specific directory
```bash
pnpm exec playwright test e2e/auth/
pnpm exec playwright test e2e/session/
pnpm exec playwright test e2e/vfolder/
```

### Run specific file
```bash
pnpm exec playwright test e2e/auth/login.test.ts
pnpm exec playwright test e2e/session/session-lifecycle.test.ts
pnpm exec playwright test e2e/serving/endpoint-lifecycle.test.ts
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
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import { MyPage } from '../utils/classes/MyPage';

test.describe('My Feature', { tag: ['@critical', '@myfeature', '@functional'] }, () => {
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

### File Naming Convention

- 모든 테스트 파일은 `.test.ts` 확장자를 사용합니다
- kebab-case를 사용합니다
- 기능-동작 형태를 따릅니다: `{feature}-{action}.test.ts`
  - 예: `user-crud.test.ts`, `session-lifecycle.test.ts`

## Current Implementation Status

### Completed

#### Base Infrastructure
- Feature-based directory structure (auth, user, vfolder, session, serving, etc.)
- Base POM classes (BasePage, BaseModal)
- Consistent tag strategy (@smoke, @critical, @regression)
- Standardized naming conventions

#### Authentication (@auth)
- Login tests
- Login failure cases

#### User Management (@user)
- User CRUD tests
- User Purge tests

#### VFolder Management (@vfolder)
- VFolder CRUD tests
- VFolder sharing tests
- Folder explorer modal tests
- Consecutive deletion tests

#### Session Management (@session)
- SessionDetailPage POM class
- SessionLauncher POM class
- Session creation tests (Interactive/Batch)
- Session lifecycle tests
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

#### App Launcher (@app-launcher)
- App launcher basic interaction tests
- App launch tests

#### Environment Management (@environment)
- Image list rendering
- Resource limit modification
- App management

#### Agent Management (@agent)
- Agent list tests

#### Maintenance (@maintenance)
- Recalculate Usage tests
- Rescan Images tests

#### Configuration (@config)
- config.toml settings tests
- Page access control tests (404/401)

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

## 🤝 Contributing

새로운 테스트를 작성할 때 다음 가이드라인을 따르세요:

1. **디렉토리 구조**: 테스트를 적절한 기능 디렉토리에 배치
   - 인증: `auth/`
   - 사용자 관리: `user/`
   - 가상 폴더: `vfolder/`
   - 세션 관리: `session/`
   - 서비스 엔드포인트: `serving/`
   - 환경 관리: `environment/`
   - 에이전트: `agent/`
   - 유지보수: `maintenance/`
   - 앱 런처: `app-launcher/`
   - 설정: `config/`

2. **파일 명명 규칙**:
   - `.test.ts` 확장자 사용 (`.spec.ts` 사용하지 않음)
   - kebab-case 사용
   - 기능-동작 형태: `{feature}-{action}.test.ts`

3. **태그 추가**: 모든 `test.describe` 블록에 적절한 태그 추가
   ```typescript
   test.describe('Feature Name', { tag: ['@priority', '@feature', '@type'] }, () => {
     // tests
   });
   ```
   - Priority: `@smoke`, `@critical`, `@regression`
   - Feature: `@auth`, `@user`, `@vfolder`, `@session`, etc.
   - Type: `@functional`, `@visual`, `@integration`

4. **POM Pattern**: All tests follow Page Object Model pattern
   - Inherit from base classes (`BasePage`, `BaseModal`)
   - Write reusable methods
   - Encapsulate locators in POM classes

5. **Cleanup**: Include cleanup logic after tests (`afterEach`, `afterAll`)

6. **Domain Constraints**: Adhere to Backend.AI domain constraints

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Test Fixtures](https://playwright.dev/docs/test-fixtures)
