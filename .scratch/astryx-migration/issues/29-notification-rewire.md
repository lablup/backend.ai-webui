# 29 — BAINotificationStack 재배선

**Target:** to-astryx
**Blocked by:** 08, 11
**Status:** ready-for-agent

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** useBAINotification.tsx(1파일)를 갭 컴포넌트 표현층으로 재배선. 열린 결정 #3(hover 일시정지 손실 수용 여부) 확정 포함 — 수용이면 드롭 기록, 아니면 자체 구현(단순 타이머 일시정지 수준이면 진행).

## Acceptance criteria

- [ ] 백그라운드 작업 알림 시나리오 실동(진행률·자동 닫힘·액션)
- [ ] antd notification 의존 0
- [ ] verify.sh ALL PASS
