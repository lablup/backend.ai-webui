# 21 — 페이지군 ⑦ Users/Credentials/ResourcePolicy

**Target:** to-astryx
**Blocked by:** 09, 10, 11, 12, 13, 14
**Status:** ready-for-agent

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** 해당 메뉴 영역의 페이지·컴포넌트를 MAPPING.md(DIRECT+PROP-CONDITIONAL)로 전환. 원본 레이아웃 충실도 유지, 공유 컴포넌트는 프런티어 번역, 갭 컴포넌트(08) 사용. 복잡해지는 antd 기능은 단순성 정책대로 드롭+기록.

## Acceptance criteria

- [ ] 영역 내 antd 컴포넌트 렌더 0(Form 계열·프런티어 제외) — P15 리졸버로 증명
- [ ] 페이지별 before/after 스크린샷(라이트/다크) 시각 게이트 통과
- [ ] PILOT-DECISION/드롭 목록 기록
- [ ] verify.sh ALL PASS
