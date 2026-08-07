# 31 — E2E 셀렉터 data-* 전환

**Target:** to-astryx
**Blocked by:** 30
**Status:** ready-for-agent

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** .ant-* 셀렉터(Form 82곳 포함 전 스위트)를 data-* 훅으로 전환(티켓 08 답변의 사상표 활용).

## Acceptance criteria

- [ ] e2e 스위트에서 .ant-* 참조 0
- [ ] 전환 후 스위트 통과율이 전환 전과 동등 이상
