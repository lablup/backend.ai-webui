# 26 — ComplexSelector 코어 + BAISelect 기반

**Target:** to-astryx
**Blocked by:** 08
**Status:** ready-for-agent

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** spike/astryx-select의 무한스크롤(loadNext)+labelInValue 어댑터를 정식 BAISelect 기반으로 승격. 키보드 내비/ARIA는 합리 범위(단순성 정책), 가상화 유예.

## Acceptance criteria

- [ ] Relay 페이지네이션 셀렉트 1종 실동(스크롤 로드 실측)
- [ ] labelInValue 값 계약 보존 — Form.Item 연동 확인
- [ ] verify.sh ALL PASS
