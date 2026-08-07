# 08 — 갭 컴포넌트 5종 반입

**Target:** main
**Blocked by:** 01, 02
**Status:** ready-for-agent

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** BAISkeleton·useBAIBreakpoint(+브레이크포인트 토큰)·BAIPopconfirm·BAIBadgeCount·BAINotificationStack(표현층+어댑터)을 spike/astryx-pilot에서 반입, 데모 라우트 포함, 앱에서는 아직 미사용. bare-SVG 아이콘 버튼 2건(BAISelectionLabel ✕, BAICopyableText) IconButton 전환 후속 포함.

## Acceptance criteria

- [ ] 데모 라우트에서 5종 상태별 렌더 + 스크린샷(라이트/다크)
- [ ] P8/P9/P19 체크리스트 통과
- [ ] verify.sh ALL PASS
