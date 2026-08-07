# 09 — theme 셰임 대량 적용 — react/src

**Target:** main
**Blocked by:** 03, 06
**Status:** ready-for-agent

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** react/src의 theme.useToken() 사용 전체(≈218파일+)를 셰임 import로 codemod 전환. 잔여(토큰 생산자 9파일: darkAlgorithm/getDesignToken)는 스킵 목록 명시.

## Acceptance criteria

- [ ] codemod 적용 + tsc 0 + verify.sh ALL PASS
- [ ] 대표 페이지 3종 픽셀 diff 0(시각 하네스)
- [ ] 잔여 파일 목록과 사유 기록
