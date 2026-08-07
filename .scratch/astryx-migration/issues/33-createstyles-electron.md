# 33 — createStyles contract + Electron 검증

**Target:** to-astryx
**Blocked by:** 30
**Status:** ready-for-agent

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** antd-style createStyles 49파일을 plain CSS/xstyle + var(--…)로 최종 전환(P6/P17 grep 게이트로 무음 사망 방지), antd-style 의존 제거 준비. Electron 빌드 경로 실검증.

## Acceptance criteria

- [ ] antd-style import 0
- [ ] Electron 앱 기동 + 대표 화면 스모크
- [ ] verify.sh ALL PASS
