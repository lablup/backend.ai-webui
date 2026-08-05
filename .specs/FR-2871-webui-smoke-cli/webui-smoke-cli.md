# WebUI Smoke CLI — 설치 검증용 E2E 러너 계획

## 1. 배경 / 목적

Field-Ops 엔지니어가 고객사에 Backend.AI를 설치한 직후, **WebUI 상의 핵심 기능이 실제로 동작하는지** 빠르게 검증할 수단이 필요하다. 현재 `e2e/` 디렉터리에는 Playwright 기반의 풍부한 테스트가 있지만, 그것은 **CI / 개발자 환경**을 전제로 설계되어 있다 (`pnpm`, monorepo, `e2e/envs/.env.playwright` 직접 편집, dev server 동시 기동 등).

이 계획의 목적은 그 자산을 재사용하되, **에어갭 고객사 환경에서 단일 바이너리(또는 단일 아카이브) 하나로 실행할 수 있는 smoke-test CLI**를 별도 sub-project로 추가하는 것이다.

비-목적 (out of scope):
- **비주얼 리그레션 테스트**는 포함하지 않는다. 기능 검증만.
- Backend.AI 백엔드 자체의 설치/헬스체크 — 그건 Manager/Agent 진단 도구가 별도로 다룸. 이 CLI는 어디까지나 **WebUI에서 본 동작**을 검증한다.
- 부하/성능 테스트.

## 2. 핵심 요구사항 (사용자 요청에서 도출)

1. **CLI 한 번 실행**으로 끝나야 한다.
2. **인자**로 webserver/webui endpoint + 계정정보를 받는다.
3. **에어갭 환경**에서 동작해야 한다 → 인터넷에서 브라우저 / 의존성을 받아오면 안 된다.
4. **계정의 권한**(admin vs user)에 따라 실행될 테스트가 자동 분기된다.
5. **리포트**가 산출물로 떨어진다 (HTML + JSON, 디렉터리째 고객에게 전달 가능).
6. **선택 옵션**: 페이지/카테고리/태그 단위로 부분 실행.

## 3. 산출물 개요

새 워크스페이스 패키지 하나 추가:

```
packages/backend.ai-smoke-cli/        # (가칭)
├── package.json
├── tsconfig.json
├── src/
│   ├── cli.ts                        # 엔트리포인트 (commander 기반)
│   ├── runner.ts                     # Playwright 프로그래매틱 실행 래퍼
│   ├── config.ts                     # CLI 인자 → env / playwright 옵션 변환
│   ├── report.ts                     # HTML/JSON 후처리, 요약 생성
│   ├── catalog.ts                    # 카테고리/태그 메타데이터 (도움말, --list용)
│   └── preflight.ts                  # endpoint 도달성 / 로그인 가능성 사전 체크
├── playwright.smoke.config.ts        # smoke 전용 config (e2e의 것을 import 후 override)
├── tests/                            # smoke 전용 신규 spec (재사용 어려운 항목만)
└── dist/                             # tsup/esbuild 번들 산출물 (pkg/SEA 입력)
```

기존 `e2e/` 디렉터리는 **그대로 둔다**. Smoke CLI는 그 spec들 중 **smoke 태그가 붙은 것만 골라서** 실행한다 (§6 참조).

배포 형태:
- 1순위: **Node.js SEA(Single Executable Application)** 또는 `pkg`로 빌드한 단일 바이너리 (`bai-smoke-linux-x64`, `bai-smoke-mac-arm64`, `bai-smoke-win-x64.exe`).
- 함께 동봉할 자원:
  - `browsers/` — Playwright Chromium 번들 (플랫폼별)
  - `tests/` — 컴파일된 spec js 파일 (또는 바이너리에 내장)
  - `LICENSES.md`, `README.md` (운영자용 1페이지)

전체를 `.tar.gz` / `.zip` 하나로 패키징하여 USB로 옮길 수 있게 한다.

## 4. CLI UX

```
bai-smoke run \
  --endpoint https://webui.customer.local \
  --webserver https://api.customer.local \
  --email admin@customer.local \
  --password '****' \
  --role auto \                       # auto | admin | user (기본 auto)
  --include @critical,@dashboard \    # 태그 OR
  --exclude @visual,@flaky \
  --pages session,vfolder \           # 카테고리(디렉터리) 단위
  --workers 2 \
  --timeout 180s \
  --output ./smoke-report-2026-05-12 \
  --headed                            # 디버깅용 (기본 headless)
```

추가 서브커맨드:
- `bai-smoke list` — 사용 가능한 카테고리/태그 출력 (catalog.ts).
- `bai-smoke doctor` — endpoint 도달성, 로그인, 브라우저 바이너리 존재, 디스크 공간만 점검 (테스트는 안 돌림). air-gap 환경에서 "이게 왜 안 돼?" 진단용.
- `bai-smoke version` — CLI / 번들된 webui git sha / playwright 버전.

설계 원칙:
- **모든 입력은 CLI 인자 또는 ENV** (`BAI_SMOKE_*`). `.env` 파일을 편집하라고 요구하지 않는다 (고객사에서 부담).
- 비밀번호는 `--password-stdin` 도 지원해서 shell history에 남지 않게.
- `--role auto` 가 기본. CLI가 로그인 직후 `is_admin` 같은 신호를 보고 admin/user 경로를 자동 선택. 명시적 override도 허용.

## 5. 권한 분기 (admin / user)

현재 `e2e/utils/test-util.ts` 는 admin/user/user2/monitor 계정을 **동시에** 요구한다 (cross-user 시나리오 때문). Smoke 시나리오는 그렇게 못 한다 — 고객은 보통 계정 하나만 줄 수 있다.

해결:
1. **smoke spec은 단일 계정만 사용**하도록 작성. 두 계정이 필요한 RBAC 교차 시나리오는 smoke 범주에서 제외.
2. CLI가 로그인 후 사용자 role을 감지 → 해당 role에 매칭된 태그(`@smoke-admin`, `@smoke-user`, `@smoke-any`)만 실행.
3. role 감지는 webserver의 기존 API(로그인 응답 또는 `/server/login-check` 류)를 재사용. 새 백엔드 API를 만들지 않는다.

## 6. 테스트 큐레이션 — `@smoke` 태그 도입

기존 e2e spec에 점진적으로 태그를 부여한다:

| 태그 | 의미 |
|---|---|
| `@smoke` | smoke CLI 기본 셋. 단일 계정으로 5–10분 내 끝나야 함. |
| `@smoke-admin` | admin 계정으로만 의미 있는 검증 (사용자 관리, 자원 정책, 등) |
| `@smoke-user` | 일반 사용자 시점 검증 (세션 생성, vfolder, 등) |
| `@smoke-any` | role 무관 |
| `@smoke-extended` | 옵셔널 — `--profile extended` 일 때만 |

initial coverage 후보 (전부 신규 작성 아님, 기존 spec에 태그만 추가):
- 로그인/로그아웃, 토큰 만료 핸들링
- Dashboard 로딩, 주요 카드 렌더링
- Session 라이프사이클: create batch session → 상태 polling → terminate
- VFolder: 생성, 파일 업로드 1개, 다운로드, 삭제
- Environment/Image 목록 로딩
- (admin) User 목록, Resource policy 목록, Agent 목록
- App launcher: 세션에 jupyter/terminal 1개 띄우고 페이지 열림 확인 (proxy 동작 검증)

App launcher는 **고객사에서 가장 자주 깨지는 곳**이므로 smoke의 핵심.

## 7. 에어갭 대응

문제는 Playwright가 평소엔 `npx playwright install` 로 브라우저를 받는다는 점.

해결:
1. **빌드 시점에 Chromium을 함께 번들**한다. `PLAYWRIGHT_BROWSERS_PATH=0` 를 쓰면 `node_modules/playwright-core/.local-browsers` 에 들어가는데, 우리는 명시적인 `<bundle>/browsers/` 경로를 가리키도록 런타임에 `PLAYWRIGHT_BROWSERS_PATH` 환경변수를 세팅한다.
2. SEA / pkg 빌드 시 브라우저는 **바이너리에 내장하지 않고** 같은 디렉터리에 동봉. 바이너리 크기·서명 이슈 회피.
3. 어떤 origin도 외부로 나가지 않게 spec에서 `cdn.jsdelivr.net`, Google Fonts 등 외부 호출을 차단(이미 e2e가 그렇게 동작) — `context.route('**/*', …)` 화이트리스트 적용.
4. HTTPS 인증서 검증 옵션: 고객사가 self-signed 인증서를 쓰는 경우가 많음 → `--insecure-tls` 플래그로 `ignoreHTTPSErrors: true`. 기본은 검증.

## 8. 리포트

`--output` 디렉터리에 다음을 생성:

```
smoke-report-2026-05-12/
├── index.html              # 자체 완결 (이미지/CSS 인라인 또는 동일 폴더)
├── summary.json            # 기계가 읽을 결과 (배포 자동화에서 활용 가능)
├── environment.json        # endpoint, role, CLI ver, webui ver, OS, browser ver
├── traces/                 # 실패한 케이스의 Playwright trace
├── videos/                 # 실패한 케이스만 (성공은 즉시 삭제, 용량 절약)
└── logs/
    ├── console-*.log       # 브라우저 콘솔
    └── network-*.har       # HAR (실패 시에만)
```

리포트 핵심 화면 (index.html):
- 상단: PASS/FAIL 개수, 총 시간, 환경 요약.
- 카테고리별 그리드 (세션/VFolder/유저/…)
- 각 케이스: 상태 + 첫 실패 스크린샷 + "trace 열기" 링크.
- 실패 케이스에는 **고객/지원 엔지니어가 그대로 복사해 보낼 수 있는 진단 블록** — endpoint, role, webui sha, 콘솔 마지막 20줄, 네트워크 4xx/5xx 요약.

구현: Playwright `html` reporter를 1차 산출물로 쓰되, `runner.ts` 가 끝난 뒤 `summary.json` 과 진단 블록을 후처리로 추가. (자체 reporter를 굳이 새로 만들지 않는다.)

## 9. 빌드 / 배포 파이프라인

1. `pnpm --filter backend.ai-smoke-cli build` — tsup으로 ESM/CJS 번들.
2. `pnpm --filter backend.ai-smoke-cli bundle:linux|mac|win` — Node SEA 또는 pkg.
3. 동일 스크립트가 플랫폼별 Chromium을 `playwright install --dry-run` 으로 경로만 얻은 뒤 복사.
4. `tar.gz` / `zip` 패키징.
5. GitHub Release 또는 내부 artifact storage로 업로드 (`@smoke-cli-vX.Y.Z`).
6. CI: 새로운 e2e spec이 `@smoke` 태그를 갖는다면 매 PR마다 smoke CLI 자체-검증을 dev 클러스터 대상으로 1회 실행 (회귀 방지).

버전 표기는 `webui-vX.Y.Z+smoke.N` 처럼 webui 버전을 prefix로. 고객사에서 webui 버전과 smoke 결과를 매칭하기 쉽게.

## 10. 단계별 이슈 분해 (Jira)

각 항목은 별도 Jira issue (FR-XXXX)로 끊고 stacked PR로 진행한다. 의존성 순서:

1. **FR-A**: `@smoke` 태그 컨벤션 도입, `E2E-TEST-NAMING-GUIDELINES.md` 보강. 기존 spec 5–10개에 태그 부여 (no-op 변경).
2. **FR-B**: `packages/backend.ai-smoke-cli` 워크스페이스 스캐폴드. `bai-smoke list`, `bai-smoke version` 만 먼저.
3. **FR-C**: `playwright.smoke.config.ts` + `runner.ts` — 기존 e2e spec을 태그로 골라 실행, env 주입.
4. **FR-D**: `preflight` / `doctor` 서브커맨드 + role 자동 감지.
5. **FR-E**: 리포트 후처리 (`summary.json`, 진단 블록).
6. **FR-F**: 단일 계정 가정에 맞춰 cross-user 의존성 있는 utility를 분리, smoke-safe 단일 계정 헬퍼 추가.
7. **FR-G**: Chromium 번들링 + air-gap 모드(`PLAYWRIGHT_BROWSERS_PATH` 런타임 주입) + `--insecure-tls`.
8. **FR-H**: SEA/pkg 바이너리 빌드 + 릴리스 워크플로.
9. **FR-I**: 운영자용 1페이지 README (한/영) + 트러블슈팅.
10. **FR-J** (이후): smoke coverage 확장 — App launcher, model serving, RBAC 기본 케이스.

FR-A ~ FR-C 가 MVP. 이 셋만 머지되어도 사내 staging 검증용으로는 쓸 수 있음. FR-G/H 가 끝나야 실제 고객사 전달 가능.

## 11. 리스크 / 미해결 질문

- **계정 부작용**: smoke가 진짜 세션을 만들고 vfolder를 만든다. 고객 운영 데이터를 더럽히지 않으려면 모든 리소스를 `bai-smoke-<timestamp>-` prefix로 만들고 종료 시 cleanup. 실패해 남은 잔재를 위해 `bai-smoke cleanup --prefix bai-smoke-` 도 제공.
- **Plugin 변형**: 고객사마다 webui 플러그인/테마 구성이 다름 → 셀렉터가 깨질 수 있음. smoke spec은 **role/text 기반 셀렉터**를 더 엄격히 강제 (data-testid 우선).
- **인증 방식**: SSO / SAML 환경에서 ID/PW 직접 로그인이 막혀 있는 케이스. v1은 기본 로그인만 지원, SSO는 `--cookie-file` 로 사전 발급한 세션 쿠키 주입을 옵션으로 추후.
- **바이너리 서명**: macOS Gatekeeper / Windows SmartScreen. 사내 코드서명 인증서 필요. 첫 릴리스는 "압축 해제 후 chmod +x" 로 시작하되 quarantine 우회 가이드를 README에 명시.
- **WebUI 버전과 smoke 버전 미스매치**: 고객이 구버전 webui에 신버전 smoke를 돌리면 셀렉터 미스. `bai-smoke doctor` 가 webui `/manifest.json` 또는 `index.html` 메타에서 sha를 읽어 호환 매트릭스와 비교, 경고.

## 12. 결정 요청

진행하기 전에 합의가 필요한 항목:

1. **패키지 이름**: `backend.ai-smoke-cli` / `bai-field-check` / 다른 안?
2. **배포 채널**: GitHub Release public / 내부 artifact only?
3. **App launcher smoke**가 핵심이라는 데 동의? (앱 프록시 의존이 커서 가장 자주 깨지는 곳이라 우선순위 1로 봤다.)
4. **MVP 범위를 FR-A ~ FR-C** 로 시작해도 되는지 — 즉, "staging에서 돌아가는 CLI" 까지가 1차 마일스톤.

위 4개에 대해 답이 나오면 바로 FR-A Jira 이슈부터 만들겠다.
