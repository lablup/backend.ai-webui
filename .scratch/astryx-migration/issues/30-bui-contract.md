# 30 — BUI 계약 재정의 + i18n 정리 + @lobehub 자체 구현

**Target:** to-astryx
**Blocked by:** 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29
**Status:** ready-for-agent

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** BUI peerDependencies에서 antd 계열 제거, @astryxdesign/core+테마 계약 추가, CSS export 신설, sideEffects 수정, 소비자 @layer 요구 문서화. BUI 이중 i18n(P13) 정리. @lobehub/icons(3)+fluent-emoji(1) 사용 표면 자체 구현 후 패키지 제거.

## Acceptance criteria

- [ ] BUI가 antd 없는 peer 계약으로 빌드·소비됨
- [ ] @lobehub 패키지 제거 후 rc-* 비-antd 경로 소멸(pnpm why 확인)
- [ ] verify.sh ALL PASS
