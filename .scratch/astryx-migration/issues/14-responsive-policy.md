# 14 — Row/Col 반응형 방침 확정 + 레시피

**Target:** to-astryx
**Blocked by:** 08
**Status:** ready-for-agent

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** 열린 결정 #5 확정 포함(사용자와 논의): 79개 브레이크포인트 지점의 전역 방침 — useBAIBreakpoint 유지 vs Grid minWidth 모델. 확정 후 전환 레시피 문서 + 대표 사례 3건 실전환.

## Acceptance criteria

- [ ] 방침이 사용자 승인으로 확정되어 기록됨
- [ ] 레시피 문서 + 실전환 3건 스크린샷
- [ ] verify.sh ALL PASS
