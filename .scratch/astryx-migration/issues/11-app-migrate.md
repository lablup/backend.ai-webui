# 11 — App 셰임 대량 적용

**Target:** main
**Blocked by:** 04, 06
**Status:** ready-for-agent

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** App.useApp() 호출 134지점 import 교체(95% 기계) + 6곳 소정리 + 진짜 갭 1곳(VFolderTextFileEditorModal 3버튼 footer) 재작성.

## Acceptance criteria

- [ ] 전 지점 전환, antd App import 0(프런티어 제외)
- [ ] 파괴적 액션 흐름(typed confirm) 회귀 없음 — e2e 스모크
- [ ] verify.sh ALL PASS
