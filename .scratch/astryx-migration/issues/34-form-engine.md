# 34 — Form 엔진 구현 + 드롭인 교체

**Target:** to-astryx
**Blocked by:** 31, 32, 33
**Status:** ready-for-agent

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** 수용 테스트 29건(Session Launcher, answers/08의 file:line)을 antd 기준으로 먼저 그린 확인 → 자체 엔진(1,320–1,720 LOC, 실사용 13메서드+rule 9종만) 구현 → Form/Form.Item/FormInstance 드롭인 교체. 호출부 109파일 불변이 검증 기준.

## Acceptance criteria

- [ ] 수용 테스트 29건이 antd에서 그린 → 자체 엔진에서 그린
- [ ] 호출부 diff 0 (import 경로 제외)
- [ ] reject 모양 {message,values,errorFields} 바이트 동등
