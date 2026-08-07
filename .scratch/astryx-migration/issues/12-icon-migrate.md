# 12 — 아이콘 배치 전환

**Target:** to-astryx
**Blocked by:** 06, 07
**Status:** ready-for-agent

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** @ant-design/icons 사용 225파일을 사상표 codemod로 lucide 전환. 아이콘 외관이 달라지므로 to-astryx 대상.

## Acceptance criteria

- [ ] @ant-design/icons import 0(프런티어 주석 제외)
- [ ] 대표 화면 스크린샷으로 아이콘 크기/정렬 확인
- [ ] verify.sh ALL PASS
