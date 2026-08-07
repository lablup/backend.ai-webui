# 02 — 브랜드 테마 패키지

**Target:** main
**Blocked by:** 01
**Status:** ready-for-agent

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** Backend.AI 브랜드 테마가 라이트/다크/admin 중첩에서 동작. defineTheme: resources/theme.json 시드, 다크는 antd darkAlgorithm 산출값을 실측 추출해 [light,dark] 튜플 고정(확정 결정), 값차 6종(borderRadiusLG 등)을 tokens 오버라이드로 antd 값에 정렬 — 목표는 현행 외관 근사. AstryxAdminTheme/AstryxSecondaryTheme(mode 명시 상속 어댑터 — 중첩 Theme은 mode 비상속), 테마 name 채번 규칙(패밀리 4종 대비), astryx theme build 프로덕션 경로 + theme.json 런타임 재정의 경로. spike/astryx-pilot의 테마 작업 재사용.

## Acceptance criteria

- [ ] 파일럿 페이지에서 브랜드 오렌지 라이트/다크 정확 렌더(computed style)
- [ ] admin 중첩 테마 최근접 우선 + 부모 mode 추종
- [ ] 현행 화면과 나란히 스크린샷으로 근사 확인
- [ ] verify.sh ALL PASS
