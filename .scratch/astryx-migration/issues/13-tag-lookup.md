# 13 — Tag status→variant 전역 룩업 (prefactor)

**Target:** to-astryx
**Blocked by:** 01
**Status:** ready-for-agent

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** Tag color 74지점(hex/토큰 난립)을 처리할 저장소 전역 상태→Astryx variant 룩업 모듈 제작. 페이지군 티켓들이 이 룩업만 참조하게 만든다.

## Acceptance criteria

- [ ] 실사용 color 값 전수 조사 표
- [ ] 룩업 모듈 + 미대응 값 정책(드롭 or theme) 명시
- [ ] verify.sh ALL PASS
