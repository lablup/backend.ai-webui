# 35 — 최종 contract: antd 제거 + main 스위치

**Target:** to-astryx
**Blocked by:** 34
**Status:** ready-for-agent

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** antd·antd-style deps 제거, type-only 잔여 정리, antd-zero-gate(a)(b) 그린 확인, to-astryx에서 전체 게이트 그린 → main 단일 merge 스위치. 릴리스 노트/문서 갱신 포함.

## Acceptance criteria

- [ ] antd-zero-gate.sh 완전 그린(prod 그래프 0 + 번들 스캔 0)
- [ ] 전체 e2e + verify.sh + 시각 게이트 그린
- [ ] to-astryx → main merge 완료
