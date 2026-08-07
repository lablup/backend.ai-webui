# 04 — App 셰임 반입 (expand)

**Target:** main
**Blocked by:** 01, 02
**Status:** ready-for-agent

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** App.useApp() 드롭인 셰임(BAIAppProvider + 싱글턴 브리지, message 4종/modal confirm·error·info, LayerProvider 루트 마운트) 반입. 파일럿의 app-shim(205 LOC)을 일반화(~450 LOC 설계는 answers/07). 대량 적용은 티켓 11.

## Acceptance criteria

- [ ] 파일럿 수준 message/modal 흐름 재현(Promise 반환·자동 닫힘 의미론)
- [ ] 1개 화면에서 실동 검증
- [ ] verify.sh ALL PASS
