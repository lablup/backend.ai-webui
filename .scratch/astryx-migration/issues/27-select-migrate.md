# 27 — 무한스크롤 셀렉트 이행 배치

**Target:** to-astryx
**Blocked by:** 26
**Status:** ready-for-agent

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** 셀렉트 래퍼 22종 중 재작성 필요 18종을 새 BAISelect 기반으로 배치 이행(프런티어 규칙 적용).

## Acceptance criteria

- [ ] 18종 이행 완료 표(native/frontier 구분)
- [ ] 대표 5종 실동 스크린샷
- [ ] verify.sh ALL PASS
