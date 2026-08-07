# 01 — Astryx 도입 + StyleX 빌드 배선

**Target:** main
**Blocked by:** None — can start immediately
**Status:** ready-for-agent

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** Astryx가 설치되고 xstyle 저작이 가능한 빌드. deps(@astryxdesign/core·theme-neutral·@stylexjs/stylex + unplugin·babel-plugin·unplugin 0.19.0 exact pin), pnpm allowBuilds, 글로벌 CSS @layer 선언 + reset.css/astryx.css import, stylexVite 설정(useCSSLayers:false, cssInjectionTarget 필수 — spike/astryx-stylex-authoring 브랜치의 검증된 설정 재사용), verify.sh에 cssInjectionTarget 센티널 체크 추가, react/에서 astryx init --features agents 실행(생성된 xstyle 지침에 '프런티어/미전환 antd 파일 제외' 완화 주석). 프로브 페이지에서 Astryx Button + xstyle 오버라이드 렌더로 검증.

## Acceptance criteria

- [ ] pnpm run build:react-only PASS, Astryx CSS 방출 확인
- [ ] xstyle 오버라이드가 컴포넌트 기본 스타일을 이김(computed style 확인)
- [ ] verify.sh ALL PASS + 센티널 체크 동작
- [ ] CLAUDE.md ASTRYX 블록이 StyleX 모드로 갱신됨
