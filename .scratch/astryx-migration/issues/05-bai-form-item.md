# 05 — BAIFormItem 반입

**Target:** main
**Blocked by:** 01, 02
**Status:** ready-for-agent

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** 폼 비주얼을 antd CSS에서 독립시키는 BAIFormItem(자체 라벨/필수/에러 UI + Form.Item noStyle 엔진, 422 LOC — spike/astryx-form-split) 반입. NoStyleItemContext 에러 집계·이중 보고 방지 포함. 적용 확산은 페이지군 티켓에서.

## Acceptance criteria

- [ ] 대표 폼 1개에서 동작 프로브 7종 동등 + 스크린샷 동등
- [ ] antd CSS 제거 상태에서도 정상 렌더 재현
- [ ] verify.sh ALL PASS
