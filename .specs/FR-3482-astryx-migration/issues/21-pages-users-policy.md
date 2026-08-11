# 21 — 페이지군 ⑦ Users/Credentials/ResourcePolicy

**Target:** to-astryx
**Blocked by:** 09, 10, 11, 12, 13, 14
**Status:** done

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** 해당 메뉴 영역의 페이지·컴포넌트를 MAPPING.md(DIRECT+PROP-CONDITIONAL)로 전환. 원본 레이아웃 충실도 유지, 공유 컴포넌트는 프런티어 번역, 갭 컴포넌트(08) 사용. 복잡해지는 antd 기능은 단순성 정책대로 드롭+기록.

## Acceptance criteria

- [x] 영역 내 antd 컴포넌트 렌더 0(Form 계열·프런티어 제외) — P15 리졸버로 증명
      (아래 "P15 evidence")
- [x] 페이지별 before/after 스크린샷(라이트/다크) 시각 게이트 통과
      (`shots/21/{before,after}-{credentials,toolbar,keypair}-{light,dark}.png`)
- [x] PILOT-DECISION/드롭 목록 기록 (아래)
- [x] verify.sh ALL PASS

## Implementation notes

### Scope (converted files, 22개)

Pages: `AdminUsersPage`, `ProjectAdminUsersPage`, `ResourcePolicyPage`
(전부 `Skeleton`→`BAISkeletonAstryx`만 변경, `BAICard`/`tabList`/
`activeTabKey`/`onTabChange`는 ticket-18 `AdminDeploymentPage` 선례대로
frontier 유지 — `CardTabListType`는 `// frontier type import` 주석).

User/Credential: `AdminUserCredentialList`, `AdminUserManagement`,
`BulkCreateUserFromCSVModal`, `PurgeUsersModal`, `UpdateUsersModal`,
`UserInfoModal`, `UserSettingModal`, `GeneratedKeypairListModal`,
`KeypairInfoModal`, `KeypairSettingModal`.

ResourcePolicy: `KeypairResourcePolicyList`, `KeypairResourcePolicyInfoModal`,
`KeypairResourcePolicySettingModal`, `UserResourcePolicyList`,
`UserResourcePolicySettingModal`, `UserResourcePolicyV2`(변경 없음 — 이미
antd-free 확인), `UserResourcePolicyV2SettingModal`,
`ProjectResourcePolicyList`, `ProjectResourcePolicySettingModal`,
`FormItemWithUnlimited`(3개 SettingModal이 공유하는 Form.Item 래퍼).

전환 방식은 3개 병렬 배치(user/credential 7파일, settings/keypair 4파일,
resource-policy 9파일 + 페이지 3개는 오케스트레이터 직접)로 수행, MAPPING.md
§3-4 rename table + ticket 13(Tag lookup)/16/18 선례를 그대로 적용.

### Frontier (전환하지 않음, 사유 기록)

- `BAITable`/`BAIAdminUserV2Table` 내부, `ColumnsType`/`ColumnType`/
  `AnyObject` 타입 전용 임포트(`KeypairResourcePolicyList`,
  `UserResourcePolicyList`, `ProjectResourcePolicyList`) — ticket 25.
- `BAIGraphQLPropertyFilter`, `BAIRadioGroup`, `BAICard`(페이지 3개),
  `CardTabListType`, `BAIModal`+`ModalProps`(`KeypairInfoModal`,
  `KeypairSettingModal` — BUI 래퍼 그대로 유지) — 각 소관 티켓.
- `KeypairResourcePolicySelect`, `UserResourcePolicySelect`, `UserSelect`
  (raw antd `Select`+`SelectProps`) — ComplexSelector 재구축은 tickets
  26/27. `UserSelect`는 현재 라이브 그래프에서 도달 불가(0 importer)라
  미전환.
- `UserProfileSettingModal`/`UserDropdownMenu`(헤더, ticket 24),
  `MyKeypairInfoModalLegacy`/`MyKeypairManagementModal`(개인 설정, ticket
  22), `UserFolderPermissionPanel(V2)`/`KeypairResourcePolicyStoragePermission
  Table(V2)`(세션/모델 페이지 소유, ticket 16 note 참조),
  `UserSessionsMetrics`(StatisticsPage), `RBACManagementPage`/
  `RoleFormModal`/`RoleScopePermissionEditModal`(RBAC은 별도 메뉴, 티켓
  범위 밖) — 전부 census에서 제외.
- `BulkCreateUserFromCSVModal`의 CSV 미리보기 그리드(raw antd `Table` ×2 +
  전용 cell renderer 헬퍼) — 12개 조건부 컬럼·per-cell 스타일링을 가진
  bespoke validation grid로, Astryx `Table` 원시 컴포넌트 자체가 아직
  없음(ticket 25 `BAITable` 재구축 전제). §0 단순성 정책대로 드롭 대신
  "한 섬으로 격리 + 기록"을 택함 — 파일 내 PILOT-DECISION 주석 참조.

### PILOT-DECISIONs (요약, 상세는 각 파일 in-code 주석)

1. `AdminUserCredentialList`/`KeypairInfoModal`(×2): `Tag color={token.
   colorPrimary}` → `Badge variant={PRIMARY_TAG_VARIANT}`('green', ticket
   13 lookup에 이미 이 3개 사이트가 근거로 기록됨), `color="green"` →
   `variant="green"`.
2. `PurgeUsersModal`: `BAIDeleteConfirmModal`(antd)+`Form`+`Checkbox` 조합
   전체를 `BAIDeleteConfirmModalAstryx`로 컴포넌트 단위 교체
   (`requireConfirmInput`로 단일 대상 purge도 타이핑 확인 강제 —
   destructive-confirmation.md 준수). ticket-16
   `DeleteForeverVFolderModalV2` 선례와 동일 패턴.
3. `AdminUserManagement`: `Space.Compact`→`ButtonGroup`,
   `Dropdown menu={{items}}`→`DropdownMenu`.
4. `UserInfoModal`/`KeypairResourcePolicyInfoModal`/`KeypairInfoModal`:
   `Descriptions`(`bordered`/`size="small"`/반응형 `column`)→`MetadataList`
   +`MetadataListItem`(기본값만), `Spin spinning`(dim-and-overlay)→
   `Spinner`(콘텐츠 교체 방식으로 단순화).
5. `UserSettingModal`: `Select mode="tags"`→`Tokenizer`(`tokenSeparators`
   드롭, per-tag invalid 하이라이트는 필드 `rules` 에러 텍스트로 흡수),
   `Switch`(totp, `isLoading` 필요)용 로컬 `TotpSwitch` 브릿지(공유
   어댑터 미확장), `Input prefix="@"` 드롭.
6. `KeypairResourcePolicySettingModal`: `Row`/`Col`(`xs`/`md` breakpoint)→
   단일 `HStack`+고정 flex-basis(반응형 브레이크포인트 미지원, P5).
   `KeypairSettingModal`: 동일 문제를 `Grid columns={24}`+`GridSpan`으로
   해결(파일별 재량, 둘 다 유효한 Astryx-native 해법).
7. `KeypairResourcePolicySettingModal`: `requiredMark={false}`(Form-level
   marker 억제) → `BAIFormItem`에 대응 prop 없어 각 필드의 `required`를
   드롭(검증 `rules`는 불변).
8. `BulkCreateUserFromCSVModal`: `Upload.Dragger`(`beforeUpload`+
   `showUploadList={false}` 패턴)→`FileInput mode="dropzone"`(자연스러운
   1:1 대응), CSV-row `Tag color="error"`→`Badge variant=
   {badgeVariantForTagColor('error')}`.
9. `UserSettingModal`: `import { message } from 'antd'`이 이미 파일에 있던
   `App.useApp()`(`app-shim`) 구조분해에 합류되지 않은 기존 불일치를 이번
   전환에서 함께 정리(`const { modal, message } = App.useApp()`) — P15
   "0 antd render" 기준 충족에 필요했던 실제 버그성 잔재.

### P15 evidence

`shots/21/p15-{before,after}-area.txt` (`shots/21/p15-area.sh HEAD|WORK`로
재생성). 영역 22파일의 direct antd value-import: before 27줄(파일당 여러
줄 포함) → after 잔여는 전부 예외 클래스만:
- Form 계열(`Form`/`FormInstance`) — 9개 SettingModal/Modal, 엔진 유지.
- 타입 전용 frontier(`CardTabListType`, `ModalProps`×2, `ColumnType`×3,
  `ColumnsType`+`AnyObject`×1) — ticket 18/25/30 소관.
- `BulkCreateUserFromCSVModal`의 CSV 프리뷰 Table 섬(위 Frontier 항목 8번,
  in-code 주석 포함) — 유일한 non-Form, non-type-only 잔존 antd value
  import.

`.ant-*` 셀렉터 게이트(`ant-selector-gate.mjs --strict`): 영역 22파일
app-source hit 0(레포 전역 1028건은 대부분 `e2e/`, ticket 31 소관).
`astryx-token-gate.mjs --strict`: 영역 22파일 undeclared `var()` 0(레포
전역 잔여 9건은 전부 `theme-probe/deployments.tsx`/`BAIModal.tsx`, 이
티켓 무관).

### Visual gate

`react/theme-probe/users21.{html,tsx}` + `users21-env.ts`(backend client
스텁, ticket-16 스텁을 이 영역 훅 — `useTOTPSupported`/`useCSVExport`/
`useCurrentUserRole`용으로 확장) — 이 영역 3개 컴포넌트는 전부 자체
top-level `useLazyLoadQuery`를 쓰므로(페이지 쿼리 fragment-spread 방식이
아님) ticket-16의 `createOperationDescriptor`+`commitPayload` 대신 ticket
18 방식의 interval 기반 catch-all `MockPayloadGenerator` 리졸버로 단순화.
케이스: `credentials`(`AdminUserCredentialList` — Tag→Badge),
`toolbar`(`AdminUserManagement` — Space.Compact/Dropdown→ButtonGroup/
DropdownMenu, `bulk-create-user` 스텁 지원 활성화로 split-button 렌더),
`keypair`(`KeypairResourcePolicyList` — Button/Tooltip). 실행:
`cd react && pnpm exec vite --config theme-probe/vite.config.mts --port
5675 --strictPort` → `node .scratch/astryx-migration/shots/21/capture.mjs
<tag>`. before는 3개 소스 파일만 `git checkout HEAD~1 --` 후 동일
프로브로 캡처, 이후 작업 상태로 복원. 판정: 컬럼 구성·행 구조·타이틀
동일, Tag→Badge 색상 차이(예: `PRIMARY_TAG_VARIANT` 초록)는 ticket-13
문서화된 시각값 정책 변경.

### 참고

- `UserSettingModal`의 `message` 정리를 제외하면 이 티켓은 순수 시각
  레이어 치환 — GraphQL fragment 스프레드/쿼리 변수는 무변경.
- `KeypairResourcePolicySettingModal`/`UserResourcePolicySettingModal`류가
  공유하는 `FormItemWithUnlimited`는 이번에 `BAIFormItem`+플레인 Astryx
  `CheckboxInput`(Form.Item 값 바인딩 계약 밖에서 독립 상태로 동작)으로
  재작성 — 소비 4개 파일 모두 기존 prop 그대로 호환.
- `BAITabs`/`BAIRadioGroup`류처럼 이 영역이 독점 소유한 프런티어 컴포넌트는
  없음(전부 다른 티켓 소관) — 시블링 티켓과의 cherry-pick 충돌 위험 낮음.
