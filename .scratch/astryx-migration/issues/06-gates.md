# 06 — 게이트 일체 구축·CI 연결

**Target:** main
**Blocked by:** 01
**Status:** ready-for-agent

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** 마이그레이션 게이트가 CI에서 정보성으로 가동. antd-zero-gate.sh 반입 + P15 임포트 그래프 리졸버 보강, .ant-* 셀렉터 grep 게이트, P19 var() 미선언 토큰 대조 게이트, 시각 비교 하네스(페이지 before/after 라이트/다크 — 판정 기준은 픽셀 일치가 아니라 레이아웃 해부도+토큰 준수).

## Acceptance criteria

- [ ] CI에서 게이트가 돌고 현재 위반을 리포트(정보성, 비차단)
- [ ] 시각 하네스로 파일럿 페이지 비교 1건 산출
- [ ] P19 게이트가 기지의 무음 패턴을 실제로 검출함을 테스트로 증명
