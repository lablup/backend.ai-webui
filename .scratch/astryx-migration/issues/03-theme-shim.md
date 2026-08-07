# 03 — theme 셰임 반입 (expand)

**Target:** main
**Blocked by:** 01, 02
**Status:** ready-for-agent

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** antd theme.useToken() 시그니처의 드롭인 셰임이 저장소에 들어가고 1개 페이지에서 검증됨. spike/astryx-theme-shim의 640 LOC(실값 반환)를 반입, @ant-design/colors 의존분 ~200 LOC 벤더/대체, codemod(85 LOC)를 툴킷으로 등록. 대량 적용은 티켓 09/10 — 여기서는 expand만.

## Acceptance criteria

- [ ] 1개 페이지 셰임 적용 후 픽셀 diff 0 재현
- [ ] codemod 스크립트가 툴킷 위치에 등록됨
- [ ] verify.sh ALL PASS
