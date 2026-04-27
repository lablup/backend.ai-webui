# FR-2320 — Portless 기반 개발 환경 전환

## 배경

기존 개발 환경은 `scripts/dev-config.js`를 통해 `BAI_WEBUI_DEV_PORT_OFFSET`으로 포트를 오프셋하는 방식이었다. worktree/브랜치마다 오프셋을 수동으로 관리해야 했고 URL도 `localhost:9081` 형태로만 구분됐다.

[Portless](https://github.com/vercel-labs/portless) 는 프로젝트 디렉터리 + 브랜치로부터 `*.localhost` 서브도메인을 자동 유도한다. 데몬 기동·포트 할당·URL 출력을 모두 자체적으로 처리하므로 WebUI 측에서 감쌀 필요가 거의 없다.

## 목표

- `pnpm run dev`(CRA dev server)와 Storybook을 Portless 위에서 실행한다.
- 포트 오프셋 기반 설정(`scripts/dev-config.js`, `BAI_WEBUI_DEV_PORT_OFFSET`)을 제거한다.
- `.env.development.local`의 `THEME_HEADER_COLOR`를 CRA(`REACT_APP_THEME_COLOR`)로 그대로 전달해 테마 색 구분 기능을 유지한다.

## 범위 및 설계 원칙

**Portless를 CLI로 직접 쓴다.** Portless가 이미 하는 일을 래퍼 스크립트로 재구현하지 않는다.

- 데몬 자동 기동 → Portless 네이티브.
- 서브도메인 유도 → Portless 네이티브 (worktree + 브랜치 반영).
- URL 출력 → Portless 네이티브.
- 미설치 대응 → 셸이 `portless: command not found`로 처리. 설치 안내는 `DEV_ENVIRONMENT.md`.

WebUI 쪽 코드는 최소한만 둔다:

1. **`scripts/dev.mjs`** (~50줄) — 세 가지 일만 한다.
   - `.env.development.local`에서 `THEME_HEADER_COLOR`를 읽어 `REACT_APP_THEME_COLOR`로 내보낸다.
   - 현재 git 브랜치명에서 `FR-XXXX` 패턴을 추출해 `portless <fr-xxxx> --force [--app-port $PORT]`로 실행한다 (없으면 `portless run --force` 폴백). `--force`는 좀비 등록 자동 override.
   - `concurrently`로 `tsc --watch`, Relay watch, 위 portless 명령을 묶어 실행하고 SIGINT/SIGTERM을 자식으로 전달한다.
2. **`packages/backend.ai-ui/package.json` `storybook`** — 인라인으로 `"portless run --force --app-port 6006 -- storybook dev -p 6006"`. Portless URL 뒤에서 접근 가능.

`portless ... --` 구분자를 쓰는 이유는 `pnpm --prefix` 같은 사용자 명령의 플래그를 Portless가 자기 옵션으로 파싱하지 않도록 하기 위함이다. `FR-XXXX` 호스트명 변환은 (a) 짧고 외우기 쉬워서, (b) Portless 0.6.0이 긴 호스트명에서 HTTPS cert 발급에 실패하는 회피 목적이다.

## Portless로 감싸지 않는 것

- **`pnpm run wsproxy`** — 포트 5050 고정. wsproxy는 브라우저가 직접 접근하지 않고 WebUI 런타임이 프로그래밍적으로 호출하므로 URL 브랜딩이 무의미하다. 추가 복잡도 없이 기존 동작을 유지한다.

## 삭제 대상

- `scripts/dev-config.js`
- `scripts/dev-config.test.ts`
- `.env.development.local.sample`의 `BAI_WEBUI_DEV_PORT_OFFSET` 블록
- `package.json`의 `dev:config`, `dev:setup` 스크립트

## 문서 업데이트

- `DEV_ENVIRONMENT.md` — Portless 중심으로 재작성 (설치, 멀티 worktree, Safari hosts sync, 테마 색, 트러블슈팅). wsproxy는 고정 포트 5050이며 Portless와 무관함을 명시.
- `README.md` — dev 섹션을 Portless 플로로 축소.
- `AGENTS.md` / `CLAUDE.md` — dev 명령과 URL 안내 갱신.
- `.claude/skills/webui-connection-info/SKILL.md` — `localhost:9081` 및 포트 오프셋 참조 제거, `*.localhost` 설명으로 대체.

## 제외 사항 (이전 시도에서 과도하게 설계되어 폐기)

- Portless 데몬 자동 기동 래퍼 (Portless가 이미 한다).
- 명시적 URL 출력 래퍼 (Portless가 이미 한다).
- `PORTLESS=0` 이스케이프 해치 (불필요한 분기).
- 디렉터리 이름 슬러그화/`--name` 플래그 (Portless가 이미 한다).
- wsproxy Portless 래핑 + `PROXYBASEPORT → PORT` 폴백 (wsproxy는 내부 호출이라 URL 브랜딩 이익 없음).

## 선택 기능

- **포트 고정**: `PORT=9081 pnpm run dev`처럼 환경 변수로 React dev 서버의 백엔드 포트를 고정할 수 있다. 미지정 시 Portless가 자동 할당.
- **HTTPS / HTTP/2**: `portless proxy stop && portless proxy start --https`로 데몬을 HTTPS 모드 전환. 최초 1회 local CA를 시스템 키체인에 등록 (sudo 불필요). `~/.zshrc`에 `export PORTLESS_HTTPS=1`로 영구화.
- **Service Worker**: `index.html`의 SW 등록 가드가 `*.localhost` 호스트도 제외하므로 dev에서 `/sw.js` 로드 실패 에러가 발생하지 않는다.

## 수용 기준 (Acceptance Criteria)

1. `pnpm run dev`가 `concurrently`로 CRA(Portless 프록시 뒤) + tsc watch + Relay watch를 동시 기동한다. 브랜치명에 `FR-XXXX`가 있으면 `http://fr-XXXX.localhost:1355`, 없으면 `http://<branch>.<project>.localhost:1355` 형태 URL이 출력되고 HTTP 200으로 응답한다.
2. `pnpm run wsproxy`가 고정 포트 5050에서 기동되어 `http://localhost:5050/`이 HTTP 200으로 응답한다.
3. `pnpm --filter backend.ai-ui run storybook`이 Portless 프록시 뒤에서 Storybook을 6006 포트로 띄우고 `*.localhost:1355` URL에서 접근 가능하다.
4. `.env.development.local`에 `THEME_HEADER_COLOR=#xxxxxx`를 설정하면 CRA 런타임 env에 `REACT_APP_THEME_COLOR`가 주입되어 테마 색이 적용된다.
5. 두 개 이상의 worktree에서 `pnpm run dev`를 동시에 실행해도 충돌 없이 각기 다른 `*.localhost` URL로 접근 가능하다.
6. `scripts/dev-config.js`, `scripts/dev-config.test.ts`, `BAI_WEBUI_DEV_PORT_OFFSET`이 리포지토리에 더 이상 존재하지 않는다.
7. `bash scripts/verify.sh`가 `=== ALL PASS ===`로 종료되고 `pnpm run test`가 통과한다.

## 관련 PR

- 본 PR: 단일 통합 구현.
- Superseded (closed): #6030, #6978, #6979, #6980 — 위 "제외 사항"을 포함한 과설계로 폐기.
