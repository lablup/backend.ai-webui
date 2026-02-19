# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development

- `pnpm run server:d` - Start development server with watch mode
- `pnpm run build:d` - Build with watch mode for development
- `pnpm run wsproxy` - Start websocket proxy (required for local development)

### Build and Production

- `pnpm run build` - Full production build (cleans, copies resources, runs rollup)
- `pnpm run build:react-only` - Build only React components
- `pnpm run build:plugin` - Build plugins separately (Lit plugin system removed; kept as no-op)

### Quality Control

- `pnpm run lint` - Run ESLint (exits with 0 to not break builds)
- `pnpm run lint-fix` - Auto-fix ESLint issues
- `pnpm run format` - Check code formatting with Prettier
- `pnpm run format-fix` - Auto-fix code formatting

### Testing

- `pnpm run test` - Run Jest tests
- `pnpm run test` (in /react directory) - Run React-specific tests
- E2E tests: some require a Backend.AI cluster, but **mock-based visual regression tests** only need `pnpm run server:d`
- `pnpm exec playwright test e2e/visual_regression/ --project=chromium` - Run mock-based visual regression tests

### Electron App

- `pnpm run electron:d` - Run Electron app in development mode
- `make clean && make dep` - Prepare dependencies for Electron
- `make mac` / `make win` / `make linux` - Build platform-specific apps

## Architecture Overview

### Architecture

This is a **React web application** using React + Ant Design + Relay (GraphQL).
The legacy Lit-Element web components have been removed.

### Key Technologies

- **Build System**: Vite (React), Rollup (service worker only), pnpm for package management
- **Styling**: Ant Design (React)
- **State Management**: Jotai, Relay (GraphQL)
- **GraphQL**: Relay compiler for React components
- **Testing**: Jest for unit tests, Playwright for E2E tests
- **Electron**: Desktop app wrapper with websocket proxy

### Project Structure

```
src/                    # Legacy utilities and websocket proxy
  lib/                  # Shared libraries and utilities
  wsproxy/              # WebSocket proxy for desktop app
react/                  # React application (main UI)
  src/                  # React application code
  components/           # React UI components
resources/              # Static assets, i18n files, themes
packages/               # Monorepo workspace packages
e2e/                    # End-to-end tests
```

### Development Workflow

1. **Dual Server Setup**: Run both `pnpm run server:d` and `pnpm run wsproxy` for full development
2. **Build Process**: Multi-stage build copying resources, running TypeScript, and bundling
3. **Testing**: Both Jest unit tests and Playwright E2E tests
4. **Linting**: ESLint + Prettier with pre-commit hooks via husky

# Additional Workflow Description

- All work items are created in Jira and serve as the starting point for understanding and resolving tasks.
- Work items are cloned as GitHub issues in the corresponding repository.
- GitHub PR titles follow this format:

  - prefix
    - feat: New features or feature improvements and changes
    - fix: Bug fixes
    - refactor: Refactoring
    - style: Design changes without functional changes
    - chore: Other small tasks
  - Format: `prefix(JIRA-ISSUE-NUMBER): title`
  - GitHub PR content starts with `Resolves #1234(FR-1234)` where #1234 is the cloned issue number and FR-1234 is the Jira issue number

- **CRITICAL - MCP Tool Requirements (No CLI alternatives)**:
  - **Jira**: Use Atlassian MCP (`mcp__Atlassian__*`) for ALL operations
    - `mcp__Atlassian__searchJiraIssuesUsingJql` - Search/query issues
    - `mcp__Atlassian__getJiraIssue` - Get issue details
    - `mcp__Atlassian__createJiraIssue` - Create issues
    - `mcp__Atlassian__editJiraIssue` - Update issues
  - **GitHub**: Use GitHub MCP (`mcp__github__*`) or `gh` CLI
    - `mcp__github__search_issues` - Search issues
    - `mcp__github__issue_read` - Get issue details
  - **Git/PR**: Use Graphite MCP (`mcp__graphite__run_gt_cmd`) for branch/commit/push
    - Do NOT use `git commit`, `git push`, `git checkout -b` directly
    - Allowed: `git status`, `git diff`, `git add`, `git log`, `git stash`
- If MCP authentication fails, re-authenticate and retry before proceeding.
- Follow Graphite's Stacked PR strategy. Write work by appropriately stacking individual PRs.

### Configuration

- Main config: `config.toml` (copied from `config.toml.sample`)
- Multiple environments supported via `configs/` directory
- Electron app config: `build/electron-app/app/config.toml`

### Key Libraries

- **antd** - Ant Design for React components
- **relay-runtime** - GraphQL client for React
- **electron** - Desktop app framework

### GraphQL/Relay Setup

- Schema files in `/data/`
- Relay compiler configured for React components
- Run `pnpm run relay` to compile GraphQL queries

### Internationalization

- JSON files in `resources/i18n/`
- Use `_t`, `_tr`, `_text` functions for translations
- Run `make i18n` to extract translation strings

### Build Output

- Production build: `build/rollup/`
- Electron app: `build/electron-app/`
- Static assets copied to build directories

## Mock-based Visual Regression Tests

Backend.AI 클러스터 없이 Playwright `page.route()` 네트워크 인터셉션으로 대시보드 등의 페이지를 렌더링하고 스크린샷을 비교하는 테스트입니다.

### 실행 방법

```bash
# dev server 실행 필수
pnpm run server:d

# 테스트 실행
pnpm exec playwright test e2e/visual_regression/dashboard/ --project=chromium

# 브라우저 창 확인
pnpm exec playwright test e2e/visual_regression/dashboard/ --project=chromium --headed

# 스냅샷 baseline 갱신 (UI 변경 후)
pnpm exec playwright test e2e/visual_regression/dashboard/ --project=chromium --update-snapshots
```

### 파일 구조

```
e2e/
  mocks/
    mock-api.ts                          # 핵심 오케스트레이터
    fixtures/
      login-responses.ts                 # REST 로그인 응답 (role별)
      server-info.ts                     # 서버 버전, resource-slots
      graphql/
        login-flow-queries.ts            # 로그인 GQL 응답 (keypair, user, group 등)
        dashboard-queries.ts             # DashboardPageQuery GQL 응답
  visual_regression/
    dashboard/
      mocked_dashboard_page.test.ts      # 대시보드 테스트 (user + superadmin)
      snapshot/                          # baseline 스크린샷 (git 추적)
```

### 핵심 API

| 함수 | 설명 |
|------|------|
| `mockLogin(page, request, { role })` | mock 설정 + 로그인 UI 상호작용까지 한번에 수행. 테스트에서 주로 사용 |
| `setupMockApi(page, request, { role })` | mock route만 설정 (로그인 없이) |

### 새 페이지의 mock 테스트 추가 방법

1. **페이지가 필요로 하는 API 파악**: 브라우저 DevTools Network 탭이나 `page.on('request')` 로깅으로 확인
2. **GQL fixture 추가**: `e2e/mocks/fixtures/graphql/`에 해당 페이지 쿼리의 mock 응답 함수 작성
3. **mock-api.ts에 matcher 등록**: `matchGraphQLQuery()` 함수에 `operationName` 또는 query 텍스트 키워드 매칭 추가
4. **REST endpoint 추가**: `handleMockRoute()`에 path + method 매칭 추가
5. **테스트 작성**: `mockLogin()` → `navigateTo()` → assertion → `toHaveScreenshot()`

### mock-api.ts가 인터셉트하는 주요 엔드포인트

**REST**:
- `POST /server/login`, `/server/login-check` — 로그인 플로우
- `GET /func/` — 서버 버전 (feature flag 결정)
- `GET /func/config/resource-slots` — 리소스 슬롯 타입
- `GET /func/config/resource-slots/details` — 리소스 슬롯 상세 메타데이터
- `POST /func/resource/check-presets` — 리소스 프리셋 및 사용량
- `GET /func/scaling-groups` — 스케일링 그룹 목록
- `GET /func/folders/_/hosts` — vfolder 호스트 정보

**GraphQL (POST /func/admin/gql)**:
- 로그인 플로우: `keypair`, `user` (full_name), `groups` (is_active)
- Relay 쿼리: `DashboardPageQuery`, `ProjectSelectorQuery`, `NoResourceGroupAlertQuery` 등
- Legacy 쿼리: `compute_session_list`, `keypair_resource_policy`, `agent_summary_list` 등

### 주의사항

- **REST 응답은 raw JSON body**: `_wrapWithPromise()`로 호출되는 REST API는 response body를 그대로 반환. `resource_slots` 같은 필드는 object로 반환해야 함 (JSON string이 아님)
- **GQL 응답은 `{ data: { ... } }` 형태**: `query()`로 호출되는 GQL은 response에서 `.data`를 추출
- **GQL 매칭 순서 중요**: 특정 패턴이 먼저, 일반 패턴이 나중에 와야 함 (예: `keypair_resource_policies` → `keypair_resource_policy`)
- **role별 분기**: `MockRole` (`'user' | 'admin' | 'superadmin'`)에 따라 서버 버전, 사용자 정보, 대시보드 쿼리 응답이 달라짐

## Important Notes

- Always run websocket proxy (`pnpm run wsproxy`) for local development
- Pre-commit hooks run linting and formatting automatically
- Use `make clean` before building if encountering issues
- Electron app requires special build process with `make dep`
- React components use Relay; ensure GraphQL schema is up to date

## GitHub Copilot Custom Instructions

This repository includes custom instructions for GitHub Copilot to provide more accurate code reviews and suggestions. These instructions are automatically applied when using GitHub Copilot on github.com, VS Code, and Visual Studio. When writing new code or refactoring, please make sure to refer to these instructions.

### Instruction Files

Custom instructions are located in the `.github/` directory:

- **`.github/copilot-instructions.md`** - Repository-wide guidelines

  - General code review principles
  - Security best practices (OWASP Top 10)
  - TypeScript conventions
  - Architecture awareness (Lit-Element + React hybrid)
  - Git workflow and commit message format
  - Testing and performance guidelines

- **`.github/instructions/react.instructions.md`** - React component guidelines

  - React Compiler optimization (`'use memo'` directive)
  - React composability principles
  - GraphQL/Relay patterns (`useLazyLoadQuery`, `useFragment`, `useRefetchableFragment`)
  - Backend.AI UI component library (`BAI*` components preferred over Ant Design)
  - Custom utilities (`useFetchKey`, `BAIUnmountAfterClose`)
  - Error boundaries (`ErrorBoundaryWithNullFallback`, `BAIErrorBoundary`)
  - Recoil for global state management
  - Ant Design usage patterns (prefer `App.useApp()` for modals)

- **`.github/instructions/i18n.instructions.md`** - Internationalization guidelines
  - Translation key naming conventions
    - Main WebUI: `category.key` format
    - Backend.AI UI package: `comp:ComponentName.key` format
  - Placeholder preservation
  - Language-specific guidelines (Korean, Japanese, Chinese)
  - Backend.AI platform context awareness

- **`.github/instructions/storybook.instructions.md`** - Storybook story guidelines
  - CSF 3 format with TypeScript
  - Meta configuration (title, tags, parameters, argTypes)
  - Story patterns (args-based, render function, Relay fragment)
  - Documentation best practices
  - Story organization and naming conventions
  - Complete templates and checklists

### How It Works

- GitHub Copilot automatically applies these instructions when working in this repository
- Instructions use path-based targeting with `applyTo` frontmatter:
  - React instructions apply to `react/**/*.tsx` and `react/**/*.ts`
  - i18n instructions apply to translation JSON files and all TypeScript/TSX files
- The instructions help Copilot provide more contextually relevant suggestions and code reviews

### Key Guidelines for AI Assistants

When reviewing or writing code:

1. **React Components**: Always prefer `'use memo'` directive over manual `useMemo`/`useCallback`
2. **UI Components**: Use `BAI*` components from `backend.ai-ui` package instead of Ant Design equivalents
3. **i18n**: Never hard-code user-facing text; always use translation functions with proper key formats
4. **Composability**: Check for proper component composition, avoid props drilling
5. **Custom Hooks**: Verify `useFetchKey` and `BAIUnmountAfterClose` are used where appropriate
6. **Error Handling**: Use pre-defined error boundaries instead of creating new ones
7. **Storybook Stories**: Follow CSF 3 format, include `tags: ['autodocs']`, document with argTypes and descriptions

## Other guidelines

Read and follow below guides:

- @guides-for-ai/react-component-guide.md
- @.github/copilot-instructions.md
- @.github/instructions/react.instructions.md
- @.github/instructions/i18n.instructions.md
- @.github/instructions/storybook.instructions.md
- @.github/instructions/docs.instructions.md
