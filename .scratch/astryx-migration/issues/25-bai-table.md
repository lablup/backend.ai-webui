# 25 — BAITable 완전체 + *Nodes 리플

**Target:** to-astryx
**Blocked by:** 09, 10
**Status:** ready-for-agent

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** 파일럿 BAITableAstryx를 BUI의 정식 BAITable로 승격: 5-플러그인 조합 + 다층 헤더·expandedRowRender 대체·설정 모달·columnOverrides(width 포함) 영속화. 가상화는 유예(확정 결정). *Nodes 소비자들을 새 계약으로 이행.

## Acceptance criteria

- [ ] 기존 BAITable 사용처의 기능 매트릭스 대비 커버/드롭 표
- [ ] 대표 *Nodes 3종 이행 + 스크린샷
- [ ] verify.sh ALL PASS
