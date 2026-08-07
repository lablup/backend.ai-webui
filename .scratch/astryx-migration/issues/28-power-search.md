# 28 — PowerSearch 일반화

**Target:** to-astryx
**Blocked by:** 09
**Status:** ready-for-agent

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** 파일럿의 PowerSearch 스왑(직렬화+역파서)을 BAIPropertyFilter 사용처 전면으로 일반화. 연산자 라벨 i18n 연결 범위 명시.

## Acceptance criteria

- [ ] BAIPropertyFilter 사용처 전환 완료
- [ ] URL 필터 상태 왕복 보존(공유 링크 회귀 없음)
- [ ] verify.sh ALL PASS
