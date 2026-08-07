# 32 — Storybook 재작성

**Target:** to-astryx
**Blocked by:** 30
**Status:** ready-for-agent

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** BUI 재편 결과 기준으로 스토리 재작성(CSF 3, storybook-patterns 준수). 해체된 래퍼의 스토리는 삭제, 신규 BAI* 스토리 작성.

## Acceptance criteria

- [ ] 신규/유지 BAI* 전 컴포넌트 스토리 존재
- [ ] storybook 빌드 PASS
