# 개발 환경 Portless 통합 스펙

> **Epic**: FR-2320 ([링크](https://lablup.atlassian.net/browse/FR-2320))

> **Update (2026-04-24):** FR-2702 retired the `PORTLESS=0` escape hatch. Portless is now the only supported local dev path.

## 개요

기존 포트 번호 기반 로컬 개발 설정(`scripts/dev-config.js`, `BAI_WEBUI_DEV_PORT_OFFSET` 등)을 [Portless](https://github.com/vercel-labs/portless)로 대체합니다. 이를 통해 개발자는 `http://localhost:9081` 대신 `http://webui.localhost:1355`와 같이 안정적이고 사람이 읽기 쉬운 `.localhost` URL을 사용할 수 있습니다. 이 변경으로 다중 인스턴스 개발이 간소화되고, 수동 포트 관리가 필요 없어지며, 프로덕션에 더 가까운 로컬 개발 환경을 제공합니다.

## 문제 정의

현재 개발 환경은 개발자에게 다음을 요구합니다:

1. **포트 번호 기억 및 관리** -- React dev 서버의 기본 포트는 9081이지만, 여러 인스턴스를 실행할 경우 포트 충돌을 피하기 위해 `.env.development.local`에서 `BAI_WEBUI_DEV_PORT_OFFSET`을 수동으로 설정해야 합니다.
2. **별도 설정 단계 실행** -- `dev` 스크립트는 dev 서버를 시작하기 전에 `scripts/dev-config.js`를 실행하여 포트 오프셋을 계산하고 환경 변수를 내보냅니다.
3. **서비스 간 포트 조율** -- WebSocket 프록시는 포트 5050, Storybook은 6006, React dev 서버는 9081+오프셋을 사용합니다. 개발자는 각 서비스에 해당하는 포트를 알고 있어야 합니다.
4. **다중 클론 간 충돌** -- 여러 프로젝트 클론을 유지하는 개발자(예: 다른 브랜치용 클론 3개)는 포트 충돌을 피하기 위해 각 클론에 서로 다른 포트 오프셋을 수동으로 할당해야 합니다.

Portless는 이름 붙여진 `.localhost` URL 뒤에서 임시 포트를 자동 할당하여 이 문제를 해결합니다. 개발자는 포트 번호를 신경 쓸 필요가 없으며, 각 클론은 디렉토리 이름에서 파생된 고유 URL을 자동으로 갖게 됩니다.

## 요구사항

### 필수 항목

- [ ] `pnpm run dev`를 실행하면 Portless가 관리하는 URL(예: `http://webui.localhost:1355`) 뒤에서 React dev 서버가 시작됩니다.
- [ ] Portless는 전역 도구 요구사항으로 설치되며, 프로젝트 README와 `DEV_ENVIRONMENT.md`에 문서화됩니다.
- [ ] `package.json`의 `dev` 스크립트가 Portless를 통해 React dev 서버를 실행하도록 업데이트됩니다(예: `portless webui <기존 시작 명령>`).
- [ ] `scripts/dev-config.js`의 포트 오프셋 시스템이 제거되거나 deprecated됩니다. 포트 할당은 Portless가 자동으로 처리합니다.
- [ ] 수동 설정 없이 다중 인스턴스 개발이 가능합니다. 각 git worktree 또는 프로젝트 클론은 고유 URL을 자동으로 갖습니다. 앱 이름은 프로젝트 디렉토리 이름에서 파생됩니다(예: 디렉토리 `webui` → `http://webui.localhost:1355`, 디렉토리 `webui-feature` → `http://webui-feature.localhost:1355`). 여러 클론을 실행하는 개발자는 추가 설정 없이 각자 고유 URL을 갖게 됩니다.
- [ ] dev 서버가 시작될 때 할당된 Portless URL이 터미널에 명확히 출력되어 개발자가 접속 주소를 알 수 있습니다.
- [ ] 기존 개발자 워크플로(TypeScript watch, Relay watch, React dev 서버)가 현재와 동일하게 동시에 실행됩니다.
- [ ] `PORTLESS=0`을 설정하면 Portless를 우회하는 탈출구(escape hatch)를 제공합니다. `PORTLESS=0 pnpm run dev`는 기존 포트 기반 설정으로 폴백하고, `pnpm run wsproxy`는 포트 5050으로, Storybook은 포트 6006으로 각각 폴백합니다.
- [ ] **[V1 프록시 전용]** WebSocket 프록시(`pnpm run wsproxy`)도 Portless로 관리되며 이름 붙여진 URL(예: `http://wsproxy.webui.localhost:1355`)을 갖습니다. 이 항목은 로컬 Node.js wsproxy(V1 프록시 모드)를 사용하는 경우에만 적용됩니다. Backend.AI 웹서버(V2 프록시 모드)를 실행하는 개발자는 로컬 wsproxy가 전혀 필요 없으며, 웹서버에 내장된 프록시가 세션 앱 연결을 직접 처리합니다.
- [ ] Storybook(`packages/backend.ai-ui/`의 `pnpm run storybook`)이 Portless URL(예: `http://storybook.webui.localhost:1355`) 뒤에서 실행됩니다.
- [ ] 테마 색상 구분(현재 `.env.development.local`의 `THEME_HEADER_COLOR`로 설정)이 Portless와 함께 계속 작동합니다. `scripts/dev-config.js`가 제거될 경우, 테마 색상 주입은 업데이트된 `dev` 스크립트나 간소화된 설정 헬퍼에서 처리되어야 합니다.

### 선택 항목

- [ ] 백엔드 엔드포인트가 HTTPS를 사용하는 시나리오를 위해 `portless proxy start --https`를 통한 HTTPS 모드를 지원합니다.

## 사용자 스토리

- 개발자로서 `pnpm run dev`를 실행하면 `http://webui.localhost:1355`와 같이 기억하기 쉬운 URL로 앱에 접속하고 싶습니다. 포트 번호를 기억할 필요가 없도록 하기 위해서입니다.
- 여러 브랜치를 동시에 작업하는 개발자로서(git worktree 사용 시), 각 worktree가 자동으로 고유 URL을 가지기를 원합니다. 설정 없이 여러 dev 서버를 실행하기 위해서입니다.
- 개발자로서 단일 환경 변수(`PORTLESS=0`)로 Portless를 비활성화하고, 필요 시 기존 포트 기반 설정으로 돌아갈 수 있기를 원합니다.
- 신규 팀원으로서 Portless 설치 및 시작에 대한 명확한 설정 가이드를 원합니다. 빠르게 개발 환경을 구성하기 위해서입니다.
- V1 프록시 모드를 사용하는 개발자로서 WebSocket 프록시가 메인 앱과 함께 이름 붙여진 URL로 접근 가능하기를 원합니다. 각 서비스의 포트 번호를 별도로 기억할 필요가 없도록 하기 위해서입니다.
- V2 프록시 모드(Backend.AI 웹서버)를 사용하는 개발자로서 로컬 wsproxy 없이 Portless가 동작하기를 원합니다. 웹서버가 프록시를 기본으로 처리하기 때문입니다.

## 인수 기준

- [ ] `pnpm run dev`를 실행하면 React dev 서버가 시작되고 `http://webui.localhost:1355`(또는 설정된 Portless 프록시 포트)로 접근할 수 있습니다.
- [ ] `portless list`를 실행하면 등록된 `webui` 앱과 해당 임시 포트가 표시됩니다.
- [ ] 두 개의 dev 서버 인스턴스를 동시에 실행할 경우(예: 서로 다른 git worktree 또는 별도 프로젝트 클론), 각각 디렉토리 이름에서 파생된 고유 URL을 갖고 충돌이 없습니다.
- [ ] `PORTLESS=0`을 설정한 상태로 `pnpm run dev`를 실행하면 Portless 없이 기존 포트(예: 9081)로 dev 서버가 시작됩니다. 동일한 탈출구가 `pnpm run wsproxy`(포트 5050으로 폴백)와 Storybook(포트 6006으로 폴백)에도 적용됩니다.
- [ ] TypeScript watch(`tsc --watch`), Relay watch, React dev 서버가 기존과 동일하게 동시에 실행됩니다.
- [ ] HMR(Hot Module Replacement)이 Portless 프록시를 통해 정상적으로 동작합니다.
- [ ] **[V1 프록시 전용]** Portless를 통해 시작했을 때 WebSocket 프록시가 Portless URL로 접근 가능합니다. 참고: Portless는 wsproxy 리스너 포트(기본값 5050)만 관리합니다. wsproxy가 개별 세션 앱에 할당하는 동적 앱 포트(10000-30000)는 Portless가 관리하지 않으며 localhost에서 직접 접근 가능한 상태로 유지됩니다.
- [ ] **[V2 프록시]** Backend.AI 웹서버를 사용하는 경우 로컬 wsproxy는 필요 없고, Portless가 이를 관리할 필요도 없습니다. 웹서버의 내장 프록시가 세션 앱 연결을 처리합니다.
- [ ] Portless를 통해 시작했을 때 Storybook이 Portless URL로 접근 가능합니다.
- [ ] `DEV_ENVIRONMENT.md`와 `README.md`가 Portless 설정 가이드(설치, 프록시 시작, 사용법)로 업데이트됩니다.
- [ ] `scripts/dev-config.js`의 포트 오프셋 로직이 제거됩니다. 파일은 삭제되거나, 포트 관련 설정이 아닌 로직(예: 테마 색상)만 남도록 간소화됩니다.
- [ ] `.env.development.local.sample`에서 `BAI_WEBUI_DEV_PORT_OFFSET`이 제거됩니다.
- [ ] `dev` 스크립트 실행 시 Portless 프록시가 이미 실행 중이지 않으면 자동으로 시작됩니다. 개발자가 별도의 수동 단계를 실행할 필요가 없습니다.

## 범위 외

- 프로덕션 빌드 또는 CI/CD 파이프라인을 위한 Portless 통합 — Portless는 로컬 개발 도구 전용입니다.
- Electron 앱 개발 워크플로를 위한 Portless 통합
- 커스텀 TLD 지원(예: `.localhost` 대신 `.test`) — 기본 `.localhost`로 충분합니다.
- postinstall 스크립트를 통한 Portless 자동 설치 — 개발자가 한 번만 전역으로 설치합니다.

## 의존성 및 제약사항

- **Portless는 Node.js 20+ 필요** -- 이 프로젝트는 Node 24(`.nvmrc`)를 사용하므로 요구사항을 충족합니다.
- **Portless 프록시 자동 시작** -- `dev` 스크립트는 Portless 프록시가 아직 실행 중이지 않으면 자동으로 시작을 시도해야 합니다. 별도의 `portless proxy start` 단계가 필요 없어집니다. 자동 시작에 실패하면(예: Portless가 설치되지 않은 경우) 설치 안내가 담긴 명확한 오류 메시지를 출력해야 합니다.
- **Safari 사용자**는 `.localhost` 서브도메인 해석을 위해 `sudo portless hosts sync`를 실행해야 할 수 있습니다. 이 사항은 문서화되어야 합니다.
- **CRA/Craco dev 서버**는 Portless가 주입하는 `PORT` 환경 변수를 따라야 합니다. 현재 `dev` 스크립트가 `PORT=$BAI_WEBUI_DEV_REACT_PORT`를 전달하고 있으므로 이미 충족되어 있습니다.
- **WebSocket 프록시**(`src/wsproxy/local_proxy.js`)는 `PORT`가 아닌 `PROXYBASEPORT` 환경 변수를 읽습니다. `wsproxy` 스크립트에서 Portless가 주입한 `PORT`를 `PROXYBASEPORT`로 매핑하거나(예: `PROXYBASEPORT=$PORT node ...`), `local_proxy.js`가 `PROXYBASEPORT`가 설정되지 않은 경우 `PORT`로 폴백하도록 수정해야 합니다.
- **V1 vs V2 프록시 모드** -- 로컬 Node.js wsproxy(`src/wsproxy/`)는 V1 프록시 모드에서만 필요합니다. Backend.AI 웹서버(V2 프록시 모드)를 실행하는 경우, 웹서버에 내장된 프록시(`ai.backend.web.proxy`)가 세션 앱 연결을 기본으로 처리합니다. 따라서 wsproxy에 대한 Portless 통합은 V1 모드 사용자에게만 해당하며, V2 모드 사용자는 React dev 서버와 Storybook에만 Portless가 필요합니다.
- **wsproxy 동적 포트** -- Portless가 wsproxy 리스너 포트(기본값 5050)를 관리하더라도, wsproxy가 개별 세션 앱에 할당하는 동적 앱 포트(10000-30000)는 Portless가 관리할 수 없습니다. 이 포트들은 localhost에서 직접 접근 가능한 상태로 유지됩니다. 이는 구조적 한계이며, Portless의 핵심 가치(dev 서버 URL 관리)에는 영향을 주지 않습니다.
- **Portless는 사용자 단위 전역 도구** -- Portless는 머신당 단일 프록시 데몬을 포트 1355에서 실행하므로, 각 개발자가 독립적으로 설치하고 관리합니다. 이는 의도적인 설계입니다. 여러 클론을 실행하는 개발자는 단일 프록시가 디렉토리 이름 기반으로 모두 라우팅하는 방식의 혜택을 받습니다. `dev` 스크립트 변경 외에 프로젝트 수준의 Portless 설정은 필요하지 않습니다.

## 영향 받는 파일

다음 파일들이 이 작업의 일부로 수정되거나 제거될 예정입니다:

| 파일 | 변경 내용 |
|------|-----------|
| `package.json` | `dev`와 `wsproxy` 스크립트를 Portless 실행 방식으로 업데이트(wsproxy는 **업데이트**, 제거 아님); `dev:config`와 `dev:setup` 스크립트 제거(진단/설정 전용으로 더 이상 필요 없음) |
| `packages/backend.ai-ui/package.json` | `storybook` 스크립트를 Portless 사용 방식으로 업데이트 |
| `scripts/dev-config.js` | 제거하거나 간소화(필요한 경우 테마 색상 로직만 유지) |
| `scripts/dev-config.test.ts` | 포트 오프셋 로직에 대한 테스트 업데이트 또는 제거 |
| `.env.development.local.sample` | `BAI_WEBUI_DEV_PORT_OFFSET` 제거; `THEME_HEADER_COLOR` 및 프리셋 유지 |
| `src/wsproxy/local_proxy.js` | **[V1 프록시 전용]** `PROXYBASEPORT`가 설정되지 않은 경우 `PORT` 환경 변수로 폴백하도록 업데이트(Portless 호환성) |
| `DEV_ENVIRONMENT.md` | Portless 기반 가이드로 전면 재작성 |
| `README.md` | dev 설정 섹션 업데이트 |
| `CLAUDE.md` | dev 명령어 및 포트 참조 업데이트 |
| `AGENTS.md` | 포트 설정 참조 업데이트 |

## 관련 이슈

- FR-2304: WebUI 개발 환경에 Portless 통합
- GitHub #5986: WebUI 개발 환경에 Portless 통합
