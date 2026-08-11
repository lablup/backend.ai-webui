# 13 — Tag status→variant 전역 룩업 (prefactor)

**Target:** to-astryx
**Blocked by:** 01
**Status:** done

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** Tag color 74지점(hex/토큰 난립)을 처리할 저장소 전역 상태→Astryx variant 룩업 모듈 제작. 페이지군 티켓들이 이 룩업만 참조하게 만든다.

## Acceptance criteria

- [x] 실사용 color 값 전수 조사 표 (아래 census)
- [x] 룩업 모듈 + 미대응 값 정책(드롭 or theme) 명시 — `packages/backend.ai-ui/src/helper/astryxTagVariant.ts`
- [x] verify.sh ALL PASS

## Census — antd Tag-like JSX color usage (2026-08-07 실측)

Method: regex sweep over `react/src` + `packages/backend.ai-ui/src` for
`<Tag|BAITag|BAIDoubleTag|DoubleTag|BooleanTag|BAITagList>` elements and their
`color` props, plus manual resolution of every dynamic color map. Excludes
`__generated__`, `*.stories.tsx`, `*.test.tsx`.

**Totals: 195 production tag-like JSX sites in 95 files; 79 pass a `color`
prop (37 literal, 42 dynamic via maps/expressions).** Ticket's estimate of 74
was for plain `<Tag color>`; this sweep additionally includes the BAI wrappers.

### Literal color histogram (production sites)

| value | count | class |
|---|---|---|
| `blue` | 10 | palette preset |
| `green` | 9 | palette preset |
| `default` | 4 | status preset |
| `success` | 3 | status preset |
| `warning` | 3 | status preset |
| `gold` | 2 | palette preset (no Astryx hue) |
| `error`, `red`, `purple`, `orange` | 1 each | preset |
| `orange-inverse`, `blue-inverse` | 1 each | inverse preset (AIAgentPage) |

### Dynamic color sources (all resolved)

| source (file) | states → antd colors | meaning |
|---|---|---|
| `SessionStatusTag.tsx` `statusTagColor` | transitional→`blue`, RUNNING→`green`, ERROR→`red`, finished→undefined | session status (V1) |
| `BAISessionNodesV2.tsx` `STATUS_COLOR_MAP` | PENDING/TERMINATED→`default`, transitional→`blue`, RUNNING→`green`, DEPRIORITIZING/TERMINATING→`orange`, CANCELLED→`red` | session status (V2) — **PENDING conflicts with V1 (blue); V2 wins** |
| `ConnectedKernelList.tsx` `kernelStatusTagColor` | prepare→`blue`, running family→`green`, terminated family→`default`, ERROR→`red` | kernel status |
| `SessionStatusDetailModal.tsx` `statusInfoTagColor` | benign reasons→`green`, failure reasons→`red` | session status_info |
| `BAISessionTypeTag[V2].tsx` `typeTagColor` | INTERACTIVE→`geekblue`, BATCH→`cyan`, INFERENCE→`purple` | session type (category) |
| `VFolderNodes.tsx` / `VFolderNodesV2.tsx` `statusTagColor` | mountable→`warning`, delete-*→`default`, error→`error` (V1 kebab + V2 UPPER 병존) | vfolder status |
| `BAIDeploymentStatusTag.tsx` `deploymentStatusSemanticMap` → `useSemanticColorMap` | HEALTHY/READY→success, DEPLOYING/SCALING/PENDING→info, DEGRADED/UNHEALTHY/STOPPING→warning, rest→default → **token hex** (colorSuccess/Info/Warning/Error/colorBorder) | deployment status |
| `BAIRouteNodes.tsx` `routeStatusSemanticMap`/`routeHealthStatusSemanticMap` → `useSemanticColorMap` | PROVISIONING→info, RUNNING/HEALTHY→success, TERMINATING/UNHEALTHY/DEGRADED→warning, FAILED_TO_START→error, rest→default → token hex | route status/health |
| `ReplicaStatusTag.tsx` `replicaStatusColorMap` | HEALTHY/RUNNING→`success`, UNHEALTHY/FAILED_TO_START→`error`, DEGRADED/TERMINATING→`warning`, PROVISIONING/WARMING_UP→`processing`, rest→`default` | replica status (이미 status-preset 정규화됨) |
| `BAILoginHistoryTable.tsx` `loginHistoryResultColorMap` → `useSemanticColorMap` | SUCCESS→success, FAILED_*→error, REVOKED_BY_ADMIN/EVICTED→warning, rest→default → token hex | login attempt result |
| `AgentStatusTag.tsx` `getStatusColor` | ALIVE→`green`, LOST→`red`, RESTARTING→`orange`, TERMINATED→undefined | agent status |
| `ScopedRolePermissionCard.tsx` `GRANT_STATE_TAG_COLOR` | full→`success`, partial→`warning`, none→undefined | RBAC grant state |
| `RoleNodes.tsx` / `RoleDetailDrawerContent.tsx` inline | SYSTEM→`default`/custom→`green`; ACTIVE→`green`, INACTIVE→`orange`, DELETED→`red`; autoAssign→`green` | role source/status |
| `ValidationStatusTag.tsx` `getStatusColor` | default/finished→`default`, processing→`processing`, error→`error`, success→`success` | model service validation |
| `AgentList.tsx` `platformData` | aws/amazon→`orange`, azure→`blue`, gcp/google→**`lightblue`** (비프리셋 CSS 색), nbp/naver/dgx→`green`, openstack→`red`, local/unknown→`yellow` | cloud platform (category) |
| `StorageProxyList.tsx` `backendType` | xfs→`blue`, ceph/cephfs→`geekblue`, vfs/nfs/dgx/spectrumscale→`green`, purestorage→`red`, weka→`purple`, unknown→`gold` | storage backend (category) |
| `VFolderPermissionTag.tsx` / `SummaryItemInvitation.tsx` | r→`green`, w→`blue`, d→`red`, o→`orange` | vfolder permission letters |
| `ReservoirAuditLogList.tsx` inline ternary | success→`green`, failed→`red`, else→`blue` | audit log status |
| `DeploymentReplicasCard.tsx` inline | ACTIVE→`success`, else→`default` | revision active state |
| `AdminModelCard.tsx` inline | PUBLIC→`green`, else→`default` | access level |
| customized-image sites (`ImageTags`, `ImageNodeSimpleTag`, `BAIImageNodeSimpleTagV2`, `AliasedImageDoubleTags`, `SessionLauncherPreview`, `ImageEnvironmentSelectFormItems`) | isCustomized→`cyan`, else `blue`/undefined | customized image marker |
| `ImageList.tsx` | Installing/Installed→`gold` | image install state |
| `ImageEnvironmentSelectFormItems.tsx` `label.color` | **runtime-arbitrary string** (image metadata JSON) | image metadata label |
| `PortSelectFormItem.tsx`, `UserProfileSettingModal.tsx`, `UserSettingModal.tsx`, `MyKeypairInfoModalLegacy.tsx` | invalid→`red` | validation error marker |
| `AdminUserCredentialList.tsx`, `KeypairInfoModal.tsx` ×2 | **`token.colorPrimary`** (브랜드 hex) + `green` | main access key marker |
| `BAIDoubleTag.tsx` 내부 기본값 | string values→`color: 'blue'` | double tag default |
| `BulkCreateUserFromCSVModal.tsx` | `error` | CSV row error |
| `BAIBoardItemTitle`/`BAIProjectTable`/`ResourceGroupList`/`LegacyRolePermissionTab`/`LoginView`/`ReservoirArtifactDetailPage`/`BAIArtifactRevisionTable` | `blue` | misc category markers |
| `AIAgentPage.tsx` | `orange-inverse`, `blue-inverse`, `orange` | agent endpoint/custom/edited markers |

Not observed in app code (stories/tests only): `magenta`, hex (`#ff0000`),
`rgb()`. Never observed: `volcano`, `lime`, `purple-inverse` 등 기타 inverse.

### 값 클래스 요약

1. **antd status presets** — `success/processing/error/warning/default`
2. **antd palette presets** — `blue green red orange cyan purple geekblue gold yellow`
3. **inverse presets** — `orange-inverse`, `blue-inverse` (2지점)
4. **theme token refs** — `token.colorPrimary` (3지점), `useSemanticColorMap` 경유 semantic token hex (3개 컴포넌트)
5. **비프리셋/런타임 임의 문자열** — `lightblue` (1 map), image metadata `label.color`

## Implementation notes

- **Module:** `packages/backend.ai-ui/src/helper/astryxTagVariant.ts`, exported
  from BUI (`backend.ai-ui`) via `helper/index.ts` re-export. **Placement
  rationale:** tickets 10/11 moved the theme/App shims into BUI; both `react/`
  and BUI fragments (BAIRouteNodes, BAISessionNodesV2, BAILoginHistoryTable 등)
  consume tag colors, and BUI cannot import from `react/src` — so BUI is the
  only location both sides can reach.
- **API** (page tickets 15–24 reference ONLY these):
  - `badgeVariantForTagColor(color?) → AstryxBadgeVariant` — any antd Tag color
    value → Badge variant (읽기 전용 pill 대상).
  - `tokenColorForTagColor(color?) → AstryxTokenColor` — closable Tag → Token 대상.
  - `STATUS_BADGE_VARIANT` + `badgeVariantForStatus(domain, value?)` /
    `tokenColorForStatus(domain, value?)` — 도메인 상태 직접 조회. Domains:
    `session kernel sessionStatusInfo sessionType vfolder deployment route
    replica agent loginHistory grantState role validation cloudPlatform
    storageBackend vfolderPermission`.
  - `PRIMARY_TAG_VARIANT` — `token.colorPrimary` 3지점의 단일 대체값 (`'green'`).
- **Unmapped-value policy (per class, stated in module JSDoc):**
  1. status presets → 동명 semantic variant, `processing`→`info` (스피너 아이콘은 호출부 유지)
  2. palette presets → 동일 hue; Astryx에 없는 hue는 최근접 병합: `geekblue`→`blue`, `gold`→`yellow`, `magenta`→`pink`, `volcano`→`orange`, `lime`→`green`
  3. `-inverse` → base hue로 **드롭** (Badge에 filled/inverse 축 없음 — defaults-first, 재구현 금지)
  4. `token.colorPrimary` → `PRIMARY_TAG_VARIANT`(`green`) 단일 상수 (theme 라우팅은 이 1건만, 그 외 임의 theme 라우팅 미지원)
  5. 임의 hex/CSS명/런타임 문자열 → 프리셋 테이블 정규화 시도 후 실패 시 **`neutral`/`default`로 드롭** (`lightblue`→`cyan`은 census 실측이라 테이블에 명시)
  6. BUI `SemanticColor` 값(`info` 포함)은 직접 수용
- **Conflict resolutions (문서화된 판단):** session `PENDING` — V1 `blue` vs V2
  `default` → V2 채택(`neutral`); 상태 도메인의 antd `blue`(전이 상태)는 palette
  `blue`가 아니라 semantic `info`로 승격 (Astryx Badge 가이드: semantic loud
  variant는 주의가 필요한 상태에만, 기본/종료 상태는 quiet).
- **Astryx vocabulary (discover-don't-guess, `astryx component` 실행 결과, core 0.3.0):**
  Badge.variant 14종 / Token.color 11종 / StatusDot.variant 5종 — 모듈 상단
  JSDoc에 기록.
- **Test:** `astryxTagVariant.test.ts` — 17 cases (정규화·병합·inverse 드롭·미지값
  드롭·도메인 조회·V1/V2 병존·불변식) — BUI vitest PASS.
- 호출부 일괄 전환은 이 티켓 범위 아님 (페이지군 티켓 15–24의 일).
