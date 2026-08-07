# 07 — 아이콘 사상표 + 어댑터 (expand)

**Target:** main
**Blocked by:** 01
**Status:** ready-for-agent

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** @ant-design/icons → lucide-react 전환 기반. 실사용 아이콘 99종 사상표, Icon/CustomIconComponentProps(51파일) 대응 어댑터/re-export 셈, lucide 메이저 충돌(^0.552 vs ^1.18) 해소, 배치 전환 codemod 제작. 배치 적용은 티켓 12.

## Acceptance criteria

- [ ] 사상표가 실사용 99종 전부 커버(미대응은 자체 SVG 경로 명시)
- [ ] codemod가 샘플 디렉터리에서 동작 증명
- [ ] lucide 단일 메이저로 수렴, verify.sh ALL PASS
