# Changelog

## v25.16.0 (31/10/2025)

### ✨ Features
- **FR-1500**: add confirmation input modal to file explorer delete dialog by @ironAiken2 [#4391](https://github.com/lablup/backend.ai-webui/pull/4391)
- **FR-1579**: add customizable sorting for image environment groups by @yomybaby [#4434](https://github.com/lablup/backend.ai-webui/pull/4434)
- **FR-1480**: display cluster mode in session detail panel by @ironAiken2 [#4419](https://github.com/lablup/backend.ai-webui/pull/4419)
- **FR-1531**: add active agent list to admin dashboard page by @agatha197 [#4365](https://github.com/lablup/backend.ai-webui/pull/4365)
- **FR-1240**: add agent statistics and resource monitoring capabilities by @agatha197 [#4344](https://github.com/lablup/backend.ai-webui/pull/4344)
- **FR-1462**: enhance BAIText with CSS-based ellipsis and Safari compatibility by @agatha197 [#4397](https://github.com/lablup/backend.ai-webui/pull/4397)
- **FR-873**: set dashboard page as a default by @agatha197 [#3554](https://github.com/lablup/backend.ai-webui/pull/3554)
- **FR-1575**: merge admin dashboard into user dashboard by @agatha197 [#4425](https://github.com/lablup/backend.ai-webui/pull/4425)
- **FR-1572**: improve keyboard interaction and focus management for editable name components by @yomybaby [#4421](https://github.com/lablup/backend.ai-webui/pull/4421)
- **FR-1426**: conditionally show terminal guide based on copy feature support by @ironAiken2 [#4414](https://github.com/lablup/backend.ai-webui/pull/4414)
- **FR-1617**: add user setting for maximum concurrent file upload limit by @ironAiken2 [#4460](https://github.com/lablup/backend.ai-webui/pull/4460)
- **FR-1632**: Set the schedulable field in the agent setting modal to required by @agatha197 [#4486](https://github.com/lablup/backend.ai-webui/pull/4486)
- **FR-1630**: improve error handling for invitation acceptance by @yomybaby [#4484](https://github.com/lablup/backend.ai-webui/pull/4484)
- **FR-1637**: add i18n Ally VSCode extension configuration and translation instructions by @yomybaby [#4498](https://github.com/lablup/backend.ai-webui/pull/4498)
- **FR-1639**: update CHANGELOG.md with missing releases and add automation script by @yomybaby [#4502](https://github.com/lablup/backend.ai-webui/pull/4502)

### 🐛 Bug Fixes
- **FR-1553**: update deprecated props in antd by @agatha197 [#4393](https://github.com/lablup/backend.ai-webui/pull/4393)
- **FR-1558**: Unable to upload multiple files in file explorer by @nowgnuesLee [#4408](https://github.com/lablup/backend.ai-webui/pull/4408)
- handle optional chaining for allowed_vfolder_hosts in resource policy by @yomybaby [#4410](https://github.com/lablup/backend.ai-webui/pull/4410)
- **FR-1605**: resolve plugin page activation issue on initial browser load by @yomybaby [#4450](https://github.com/lablup/backend.ai-webui/pull/4450)
- **FR-1597**: exclude name field from KeypairResourcePolicySettingModal props by @ironAiken2 [#4443](https://github.com/lablup/backend.ai-webui/pull/4443)
- **FR-1602**: update CodeMirror language option from 'shell' to 'sh' by @nowgnuesLee [#4448](https://github.com/lablup/backend.ai-webui/pull/4448)
- **FR-1612**: missing session creation error handling by @yomybaby [#4456](https://github.com/lablup/backend.ai-webui/pull/4456)
- **FR-1501**: fix file upload status tracking and error handling by @ironAiken2 [#4412](https://github.com/lablup/backend.ai-webui/pull/4412)
- **FR-1606**: Prevent dot (.) in model service names for appproxy environment by @agatha197 [#4477](https://github.com/lablup/backend.ai-webui/pull/4477)
- **FR-1628**: user profile setting modal's labels are too narrow by @agatha197 [#4483](https://github.com/lablup/backend.ai-webui/pull/4483)
- **FR-1625**: Visibility on the dashboard page is poor when dark mode is enabled by @agatha197 [#4478](https://github.com/lablup/backend.ai-webui/pull/4478)
- **FR-1623**: Labels misaligned in resource group midification modal by @agatha197 [#4473](https://github.com/lablup/backend.ai-webui/pull/4473)
- **FR-1591**: 'Optional' text overflow in user setting modal by @agatha197 [#4472](https://github.com/lablup/backend.ai-webui/pull/4472)
- **FR-1626**: fix folder name truncation by @nowgnuesLee [#4490](https://github.com/lablup/backend.ai-webui/pull/4490)
- **FR-1629**: fix language reset to work properly by @nowgnuesLee [#4487](https://github.com/lablup/backend.ai-webui/pull/4487)
- **FR-1633**: Success message shows `{{folderlength}}` template variable instead of actual count by @agatha197 [#4494](https://github.com/lablup/backend.ai-webui/pull/4494)
- **FR-1631**: truncate session name in session notification by @nowgnuesLee [#4492](https://github.com/lablup/backend.ai-webui/pull/4492)
- **FR-1582**: enable full visibility of long option text in select dropdowns by @yomybaby [#4504](https://github.com/lablup/backend.ai-webui/pull/4504)
- **FR-1644**: modify to prevent deletion of invited folders by @nowgnuesLee [#4579](https://github.com/lablup/backend.ai-webui/pull/4579)

### 🔨 Refactoring
- **FR-1554**: fix Wrapper component typing and prop passing in SessionActionButtons by @yomybaby [#4398](https://github.com/lablup/backend.ai-webui/pull/4398)
- **FR-1578**: optimize error boundary structure and component unmounting patterns by @yomybaby [#4430](https://github.com/lablup/backend.ai-webui/pull/4430)
- **FR-1627**: remove resource monitor component from import view by @agatha197 [#4481](https://github.com/lablup/backend.ai-webui/pull/4481)
- **FR-1621**: refactor AppLauncherModal to work properly by @nowgnuesLee [#4464](https://github.com/lablup/backend.ai-webui/pull/4464)

### 🛠 Chores
- **FR-1544**: Post 25.15.0 Release - Minor Refactoring and Dependency Updates by @yomybaby [#4380](https://github.com/lablup/backend.ai-webui/pull/4380)
- **FR-1551**: remove legacy folder explorer components by @ironAiken2 [#4387](https://github.com/lablup/backend.ai-webui/pull/4387)
- **FR-1557**: apply react compiler by @nowgnuesLee [#4404](https://github.com/lablup/backend.ai-webui/pull/4404)
- **FR-1558**: refactor code related to #4404 by @yomybaby [#4409](https://github.com/lablup/backend.ai-webui/pull/4409)
- **FR-1583**: Resolving the issue where ESLint cannot find the tsconfig file by @nowgnuesLee [#4431](https://github.com/lablup/backend.ai-webui/pull/4431)

### 🎨 Style
- **FR-1601**: remove unnecessary padding override from ConfigurationsPage Card component by @ironAiken2 [#4446](https://github.com/lablup/backend.ai-webui/pull/4446)
- **FR-1577**: improve dashboard statistics display design and progress visualization by @yomybaby [#4427](https://github.com/lablup/backend.ai-webui/pull/4427)
- **FR-1622**: fix clipped home icon of filebrowser by @agatha197 [#4475](https://github.com/lablup/backend.ai-webui/pull/4475)

### 🌐 i18n
- **FR-1618**: improved internationalization (i18n) translations of vfolder page by @agatha197 [#4462](https://github.com/lablup/backend.ai-webui/pull/4462)

### 🔧 Miscellaneous
- **FR-1614**: make BAIConfigProvider's client optional by @nowgnuesLee [#4458](https://github.com/lablup/backend.ai-webui/pull/4458)

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v25.15.2...v25.16.0

---

## v25.15.2 (24/10/2025)

- fix(FR-1605): resolve plugin page activation issue on initial browser load ([#4450](https://github.com/lablup/backend.ai-webui/issues/4450)) by @yomybaby

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v25.15.1...v25.15.2

---

## v25.15.1 (24/10/2025)

### ✨ Features
- **FR-1500**: Add confirmation input modal to file explorer delete dialog by @ironAiken2 [#4391](https://github.com/lablup/backend.ai-webui/pull/4391)

### 🐛 Bug Fixes
- **FR-1558**: Unable to upload multiple files in file explorer by @nowgnuesLee [#4408](https://github.com/lablup/backend.ai-webui/pull/4408)

### 🔨 Refactoring
- **FR-1554**: Fix Wrapper component typing and prop passing in SessionActionButtons by @yomybaby [#4398](https://github.com/lablup/backend.ai-webui/pull/4398)

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v25.15.0...v25.15.1

---

## v25.15.0 (02/10/2025)

### ✨ Features

- **FR-1286**: replace hardcoded strings with translations in React components by @ironAiken2 in [#4299](https://github.com/lablup/backend.ai-webui/pull/4299)
- **FR-1010**: Implement folder explorer by @ironAiken2 in [#3933](https://github.com/lablup/backend.ai-webui/pull/3933)
- **FR-1316**: implement file upload manager with TUS protocol and cancellation support by @ironAiken2 in [#4050](https://github.com/lablup/backend.ai-webui/pull/4050)
- **FR-1334**: implement drag-and-drop file upload functionality by @ironAiken2 in [#4089](https://github.com/lablup/backend.ai-webui/pull/4089)
- **FR-1342**: Editable name in file explorer by @ironAiken2 in [#4117](https://github.com/lablup/backend.ai-webui/pull/4117)
- **FR-1493**: remove non-functional admin and monitor roles from user management interfaces by @yomybaby in [#4305](https://github.com/lablup/backend.ai-webui/pull/4305)
- **FR-1502**: implement editable folder names with visual identicons in file explorer by @yomybaby in [#4319](https://github.com/lablup/backend.ai-webui/pull/4319)
- Reservoir UI draft by @yomybaby in [#3934](https://github.com/lablup/backend.ai-webui/pull/3934)
- **FR-1262**: intergrated graphql for reservoir by @nowgnuesLee in [#4157](https://github.com/lablup/backend.ai-webui/pull/4157)
- **FR-1409**: implementing import and delete for revision by @nowgnuesLee in [#4230](https://github.com/lablup/backend.ai-webui/pull/4230)
- **FR-1495**: implement progress bar with bai notifiacation by @nowgnuesLee in [#4264](https://github.com/lablup/backend.ai-webui/pull/4264)
- **FR-1496**: update pulling artifact edge after import revisions by @nowgnuesLee in [#4313](https://github.com/lablup/backend.ai-webui/pull/4313)
- **FR-1499**: implement delete and restore artifacts by @nowgnuesLee in [#4317](https://github.com/lablup/backend.ai-webui/pull/4317)
- **FR-1507**: add a value to config.toml to enalbe reservoir page by @nowgnuesLee in [#4327](https://github.com/lablup/backend.ai-webui/pull/4327)
- **FR-1513**: disable user selection in `BAIMenu` component by @rapsealk in [#4334](https://github.com/lablup/backend.ai-webui/pull/4334)
- **FR-1506**: hide terminal and app buttons for system sessions by @ironAiken2 in [#4325](https://github.com/lablup/backend.ai-webui/pull/4325)
- **FR-1355**: improve BAIPropertyFilter display with value labels for better UX by @agatha197 in [#4114](https://github.com/lablup/backend.ai-webui/pull/4114)
- **FR-1365**: auto merge i18n conflicts by @ironAiken2 in [#4136](https://github.com/lablup/backend.ai-webui/pull/4136)
- **FR-1494**: improve UX for session creation related to enqueueOnly and App launcher by @yomybaby in [#4353](https://github.com/lablup/backend.ai-webui/pull/4353)
- **FR-1494**: refactor session notification with dedicated component for improved UX by @yomybaby in [#4359](https://github.com/lablup/backend.ai-webui/pull/4359)
- **FR-1534**: add more filter and order options to NEO session list by @yomybaby in [#4367](https://github.com/lablup/backend.ai-webui/pull/4367)
- **FR-1518**: i18n updates and notification UX improvements by @nowgnuesLee in [#4352](https://github.com/lablup/backend.ai-webui/pull/4352)
- **FR-1512**: add SFTP connection info modal with SSH key download by @ironAiken2 in [#4345](https://github.com/lablup/backend.ai-webui/pull/4345)
- **FR-1417**: improve UI text clarity and endpoint token generation options by @agatha197 in [#4203](https://github.com/lablup/backend.ai-webui/pull/4203)
- **FR-1503**: Adopt pnpm minimumReleaseAge for security by @nowgnuesLee in [#4321](https://github.com/lablup/backend.ai-webui/pull/4321)
- **FR-1539**: add keyboard shortcut and tooltip to notification button by @yomybaby in [#4378](https://github.com/lablup/backend.ai-webui/pull/4378)
- **FR-1530**: Implement window focus check for automatic refresh interval by @agatha197 in [#4358](https://github.com/lablup/backend.ai-webui/pull/4358)
- **FR-1530**: add `useIntervalValue` test code and fix broken test code snapshot by @agatha197 in [#4371](https://github.com/lablup/backend.ai-webui/pull/4371)
- **FR-1154**: make NEO session list default with classic opt-out by @yomybaby in [#4383](https://github.com/lablup/backend.ai-webui/pull/4383)

### 🐛 Bug Fixes

- **FR-1469**: use inclusive checking for GitHub host detection by @ironAiken2 in [#4284](https://github.com/lablup/backend.ai-webui/pull/4284)
- **FR-1324**: Preserve query parameters when navigating via breadcrumb in FileExplorer by @ironAiken2 in [#4071](https://github.com/lablup/backend.ai-webui/pull/4071)
- can't access property "map", `failed_predicates` is undefined by @yomybaby in [#4337](https://github.com/lablup/backend.ai-webui/pull/4337)
- **FR-1477**: Update session status follow up backend changes by @nowgnuesLee in [#4322](https://github.com/lablup/backend.ai-webui/pull/4322)
- **FR-1511**: fix FolderExplorer modal buttons and implement mount-by-id support by @yomybaby in [#4331](https://github.com/lablup/backend.ai-webui/pull/4331)
- **FR-1517**: fix to ensure the gpu accelerator value is loaded correctly by @nowgnuesLee in [#4339](https://github.com/lablup/backend.ai-webui/pull/4339)
- **FR-1470**: preserve board items order after drag and drop by @ironAiken2 in [#4287](https://github.com/lablup/backend.ai-webui/pull/4287)
- **FR-1527**: prevent session modals from reopening during automatic refresh by @ironAiken2 in [#4361](https://github.com/lablup/backend.ai-webui/pull/4361)
- **FR-1509**: fix sidebar menu sorting inconsistency across browsers by @yomybaby in [#4329](https://github.com/lablup/backend.ai-webui/pull/4329)
- **FR-1486**: correct plugin import path from relative to parent directory by @ironAiken2 in [#4298](https://github.com/lablup/backend.ai-webui/pull/4298)
- **FR-1519**: Endpoint lifecycle state change from created to ready not reflected by @agatha197 in [#4342](https://github.com/lablup/backend.ai-webui/pull/4342)
- BAIModal import in SFTPConnectionInfoModal to use backend.ai-ui package by @yomybaby in [#4374](https://github.com/lablup/backend.ai-webui/pull/4374)
- **FR-1526**: apply disabled color to `DynamicUnitInputNumber` unit text when disabled by @rapsealk in [#4350](https://github.com/lablup/backend.ai-webui/pull/4350)
- **FR-1537**: refactor file explorer to use prop-based permissions instead of GraphQL fragments by @ironAiken2 in [#4384](https://github.com/lablup/backend.ai-webui/pull/4384)
- **FR-1540**: remove use-query-params dependency from FileExplorer by @ironAiken2 in [#4381](https://github.com/lablup/backend.ai-webui/pull/4381)
- **FR-1552**: fix infinite re-rendering in useInterval hook by @yomybaby in [#4389](https://github.com/lablup/backend.ai-webui/pull/4389)

### 🔨 Refactoring

- **FR-1536**: move BAIModal component to backend.ai-ui package by @ironAiken2 in [#4373](https://github.com/lablup/backend.ai-webui/pull/4373)

### 🛠 Chores

- **FR-402**: unify the require mark style for form items in the webui by @nowgnuesLee in [#4360](https://github.com/lablup/backend.ai-webui/pull/4360)
- **FR-1515**: define extra globalThis properties by @yomybaby in [#2902](https://github.com/lablup/backend.ai-webui/pull/2902)

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v25.14.4...v25.15.0

---

## v25.14.4 (26/09/2025)

### Cherry pick
- fix(FR-1517): fix to ensure the gpu accelerator value is loaded correctly ([#4339](https://github.com/lablup/backend.ai-webui/issues/4339))

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v25.14.3...v25.14.4

---

## v25.7.3 (26/09/2025)

- feat(FR-1414): allow shmem adjustment when allowCustomResourceAllocation is disabled ([#4195](https://github.com/yomybaby/test-subtree-react-component/issues/4195))

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v25.7.2...v25.7.3

---

## v25.14.3 (22/09/2025)

### ✨ Features
- **FR-55**: support ai.backend.accelerators image label's * value by @yomybaby in [#4301](https://github.com/lablup/backend.ai-webui/pull/4301)
- **FR-1472**: implement GraphQL viewer query for current user information by @yomybaby in [#4310](https://github.com/lablup/backend.ai-webui/pull/4310)

### 🐛 Bug Fixes
- **FR-1498**: remove hyphens from VirtualFolder storage paths by @yomybaby in [#4312](https://github.com/lablup/backend.ai-webui/pull/4312)

### 🔨 Refactoring
- **FR-1492**: extract SharedMemoryFormItems from ResourceAllocationFormItems by @yomybaby in [#4303](https://github.com/lablup/backend.ai-webui/pull/4303)

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v25.14.2...v25.14.3

---

## v25.14.2 (18/09/2025)

### ✨ Features
* **FR-1424**: update to calculate liveStat and capacity per session by @agatha197 in [#4217](https://github.com/lablup/backend.ai-webui/pull/4217)

### 🐛 Bug Fixes
* **FR-1483**: correct queryKey from 'termsOfService' to 'privacyPolicy' by @agatha197 in [#4293](https://github.com/lablup/backend.ai-webui/pull/4293)
* **FR-1474**: handle infinity values in resource progress calculation by @agatha197 in [#4291](https://github.com/lablup/backend.ai-webui/pull/4291)

### 🎨 Style
* **FR-1487**: improve layout and spacing for ImageNodeSimpleTag component by @yomybaby in [#4297](https://github.com/lablup/backend.ai-webui/pull/4297)

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v25.14.1...v25.14.2

---

## v25.7.2 (17/09/2025)

fix: shmem handling in ResourceAllocationFormItems related to preset's shmem

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v25.7.1...v25.7.2

---

## v25.14.1 (16/09/2025)

* fix(FR-1479): remove forced automatic shmem adjustment during session creation by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/4289


**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v25.14.0...v25.14.1

---

## v25.14.0 (15/09/2025)

### ✨ Features
* **FR-1379** add fragment type normalization to GraphQL transformer by @yomybaby in [#4155](https://github.com/lablup/backend.ai-webui/pull/4155)
* **FR-1335** add automated i18n translation Claude Code slash command by @yomybaby in [#4079](https://github.com/lablup/backend.ai-webui/pull/4079)
* **FR-1366** support atom-max.device accelerator by @agatha197 in [#4139](https://github.com/lablup/backend.ai-webui/pull/4139)
* **FR-1400** Improved Kernel Identification with Hostname by @yomybaby in [#4176](https://github.com/lablup/backend.ai-webui/pull/4176)
* **FR-1423** add scheduler page and pending session list by @ironAiken2 in [#4214](https://github.com/lablup/backend.ai-webui/pull/4214)
* **FR-1421** enhance WEBUI help button with additional page mappings by @agatha197 in [#4212](https://github.com/lablup/backend.ai-webui/pull/4212)
* **FR-1435** exclude project type folder from folder selector of service creation page. by @agatha197 in [#4235](https://github.com/lablup/backend.ai-webui/pull/4235)
* **FR-1414** allow shmem adjustment when allowCustomResourceAllocation is disabled by @yomybaby in [#4195](https://github.com/lablup/backend.ai-webui/pull/4195)
* **FR-1419** improve resource terminology and unlimited value display in Dashboard by @yomybaby in [#4208](https://github.com/lablup/backend.ai-webui/pull/4208)
* **FR-1370** Property filter component for GraphQL v2 filter type by @yomybaby in [#4170](https://github.com/lablup/backend.ai-webui/pull/4170)
* **FR-1367** implement flexible CSS-based system for UI element customization by @ironAiken2 in [#4150](https://github.com/lablup/backend.ai-webui/pull/4150)
* **FR-1425** implement BAISessionAgentIds component to improve agent display by @yomybaby in [#4219](https://github.com/lablup/backend.ai-webui/pull/4219)
* **FR-1437** enhance session display with owner information and improved date formatting by @yomybaby in [#4237](https://github.com/lablup/backend.ai-webui/pull/4237)
* **FR-1451** add lint rule to restrict imports from backend.ai-ui by @nowgnuesLee in [#4263](https://github.com/lablup/backend.ai-webui/pull/4263)
* **FR-1439** setup dayjs language settings by @nowgnuesLee in [#4261](https://github.com/lablup/backend.ai-webui/pull/4261)
* **FR-1447** add JSON sort plugin to prettier in the BUI project by @nowgnuesLee in [#4255](https://github.com/lablup/backend.ai-webui/pull/4255)

### 🐛 Bug Fixes
* **FR-1364** remove thorw error on onerror in eventSource to retry automatically by @nowgnuesLee in [#4134](https://github.com/lablup/backend.ai-webui/pull/4134)
* **FR-1383** add missing i18n key and fix HTML tooltip rendering by @yomybaby in [#4161](https://github.com/lablup/backend.ai-webui/pull/4161)
* **FR-1362** fix incorrect percentage bar display in utilization column of device_util by @ironAiken2 in [#4130](https://github.com/lablup/backend.ai-webui/pull/4130)
* remove unexpected class name by @yomybaby in [#4163](https://github.com/lablup/backend.ai-webui/pull/4163)
* **FR-1261** Show fallback UI if there is storage proxy crash issue on faulty node by @agatha197 in [#3978](https://github.com/lablup/backend.ai-webui/pull/3978)
* **FR-1384** handle backend API failures gracefully with Promise.allSettled by @yomybaby in [#4165](https://github.com/lablup/backend.ai-webui/pull/4165)
* **FR-1401** fix state persistence issue in useDeferredQueryParams hook by @yomybaby in [#4179](https://github.com/lablup/backend.ai-webui/pull/4179)
* **FR-1406** fix to enalbe pagination for ConnectedKernelList compnent by @nowgnuesLee in [#4186](https://github.com/lablup/backend.ai-webui/pull/4186)
* **FR-1403** improve lifecycle stage filter logic for active serving instances by @agatha197 in [#4181](https://github.com/lablup/backend.ai-webui/pull/4181)
* **FR-1404** ensure BAIUnmountAfterClose always unmounts after close animations by @yomybaby in [#4183](https://github.com/lablup/backend.ai-webui/pull/4183)
* **FR-1412** optimize agent filtering and fix pagination count by @ironAiken2 in [#4192](https://github.com/lablup/backend.ai-webui/pull/4192)
* **FR-1412** enhance Agent Summary List with URL Query Parameters by @yomybaby in [#4193](https://github.com/lablup/backend.ai-webui/pull/4193)
* `@since` version of `queue_position` by @yomybaby in [#4215](https://github.com/lablup/backend.ai-webui/pull/4215)
* **FR-1378** improve error handling logic in service update flow by @ironAiken2 in [#4166](https://github.com/lablup/backend.ai-webui/pull/4166)
* **FR-1432** Fix user email conditional rendering and remove Korean comments by @ironAiken2 in [#4228](https://github.com/lablup/backend.ai-webui/pull/4228)
* **FR-1434** improve Makefile security and cross-platform compatibility by @yomybaby in [#4232](https://github.com/lablup/backend.ai-webui/pull/4232)
* **FR-1443** fix build error caused by incorrect BAISessionAgentIds component export path by @yomybaby in [#4243](https://github.com/lablup/backend.ai-webui/pull/4243)
* **FR-1431** URL-based state persistence for pagination and filters by @yomybaby in [#4252](https://github.com/lablup/backend.ai-webui/pull/4252)
* **FR-1191** seperate traceback from error message by @ironAiken2 in [#4162](https://github.com/lablup/backend.ai-webui/pull/4162)
* **FR-1450** correct Electron app development mode path configuration by @ironAiken2 in [#4260](https://github.com/lablup/backend.ai-webui/pull/4260)
* **FR-1457** fix dashboard resource panel access based on version compatibility by @yomybaby in [#4268](https://github.com/lablup/backend.ai-webui/pull/4268)
* **FR-1461** show error message for session commit as notifiaction by @nowgnuesLee in [#4275](https://github.com/lablup/backend.ai-webui/pull/4275)
* **FR-1455** correct the incorrect values shown on the dashboard by @nowgnuesLee in [#4269](https://github.com/lablup/backend.ai-webui/pull/4269)

### 🔨 Refactoring
* **FR-1429** backend.ai-ui peerDependencies and dependencies by @yomybaby in [#4223](https://github.com/lablup/backend.ai-webui/pull/4223)
* **FR-1441** improve resource display component architecture and consistency by @yomybaby in [#4241](https://github.com/lablup/backend.ai-webui/pull/4241)
* **FR-1444** consolidate BAIResourceWithSteppedProgress into BAIStatistic by @yomybaby in [#4246](https://github.com/lablup/backend.ai-webui/pull/4246)
* **FR-1445** rename ResourceGroupSelectForCurrentProject to SharedResourceGroupSelectForCurrentProject and add onChangeInTransition by @yomybaby in [#4248](https://github.com/lablup/backend.ai-webui/pull/4248)

### 🛠 Chores
* **FR-1360** improve Storybook settting in backend.ai-ui by @yomybaby in [#4126](https://github.com/lablup/backend.ai-webui/pull/4126)
* **FR-1361** move BAIPropertyFilter to bui by @yomybaby in [#4128](https://github.com/lablup/backend.ai-webui/pull/4128)
* **FR-1377** add icons for vLLM, Modular, and GROMACS by @rapsealk in [#4152](https://github.com/lablup/backend.ai-webui/pull/4152)
* add YAML frontmatter to Claude command files by @yomybaby in [#4206](https://github.com/lablup/backend.ai-webui/pull/4206)
* Update alpha version index to 25.14.0-alpha.0 by @yomybaby in [#4238](https://github.com/lablup/backend.ai-webui/pull/4238)
* **FR-1438** correct Japanese translation by @nowgnuesLee in [#4249](https://github.com/lablup/backend.ai-webui/pull/4249)
* **FR-1449** add script for serving WebUI release bundles locally by @yomybaby in [#4258](https://github.com/lablup/backend.ai-webui/pull/4258)

### 🧪 E2E Tests
* **FR-1221** add visual regression test for summary and session page by @hummingbbird in [#3945](https://github.com/lablup/backend.ai-webui/pull/3945)
* **FR-1221** add visual regression test for config, information, login and maintenance page by @hummingbbird in [#3992](https://github.com/lablup/backend.ai-webui/pull/3992)
* **FR-1221** add visual regression test for serving, ai agents, dashboard and my environments by @hummingbbird in [#3998](https://github.com/lablup/backend.ai-webui/pull/3998)
* **FR-1221** add visual regression test for users, resources, environments and resource policy page by @hummingbbird in [#4034](https://github.com/lablup/backend.ai-webui/pull/4034)
* **FR-1221** add visual regression test for vfolder, import and start page by @hummingbbird in [#3988](https://github.com/lablup/backend.ai-webui/pull/3988)

### 🎨 Style
* **FR-1386** change invite folder modal title from 'Modify Permissions' to 'Share Folder' by @ironAiken2 in [#4169](https://github.com/lablup/backend.ai-webui/pull/4169)

### 🔧 Miscellaneous
* fix typo on translation by @lizable in [#4253](https://github.com/lablup/backend.ai-webui/pull/4253)

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v25.13.0...v25.14.0

---

## v25.13.0 (12/08/2025)

### ✨ Features
- **FR-1239**: Migrate BAICard from components to backend.ai-ui by @agatha197 in [#3950](https://github.com/lablup/backend.ai-webui/pull/3950)
- **FR-1277**: Synchronize service launcher form with url params by @agatha197 in [#3991](https://github.com/lablup/backend.ai-webui/pull/3991)
- **FR-1227**: Enable baiClient Usage in webui from backend.ai-ui by @ironAiken2 in [#3924](https://github.com/lablup/backend.ai-webui/pull/3924)
- **FR-1284**: Add svg icon components to backend.ai-ui by @ironAiken2 in [#3994](https://github.com/lablup/backend.ai-webui/pull/3994)
- **FR-1294**: Setup Claude Code development workflow tools and documentation by @yomybaby in [#4010](https://github.com/lablup/backend.ai-webui/pull/4010)
- **FR-1297**: Setup multi-instance development environment with configurable ports and themes by @yomybaby in [#4013](https://github.com/lablup/backend.ai-webui/pull/4013)
- **FR-1304**: Enhance PR workflow to auto-assign issues to active sprints by @yomybaby in [#4027](https://github.com/lablup/backend.ai-webui/pull/4027)
- **FR-1229**: Migrate BAITable component to backend.ai-ui for File Explorer by @ironAiken2 in [#3940](https://github.com/lablup/backend.ai-webui/pull/3940)
- **FR-1287**: Refactoring Session detail panel data fetching logic by @yomybaby in [#3997](https://github.com/lablup/backend.ai-webui/pull/3997) • Show "No Access" in Explorer, not disable Session Detail by @yomybaby in [#4001](https://github.com/lablup/backend.ai-webui/pull/4001) • Optimize session detail navigation with state caching and GraphQL fragment improvements by @yomybaby in [#4003](https://github.com/lablup/backend.ai-webui/pull/4003)
- **FR-1313**: Improve inline code rendering and styling in ChatMessageContent by @yomybaby in [#4042](https://github.com/lablup/backend.ai-webui/pull/4042)
- **FR-1314**: Improve markdown rendering in chat messages by @yomybaby in [#4044](https://github.com/lablup/backend.ai-webui/pull/4044)
- **FR-1302**: Setup Jest testing environment for backend.ai-ui package by @ironAiken2 in [#4023](https://github.com/lablup/backend.ai-webui/pull/4023)
- **FR-1321**: Add comprehensive Storybook stories for BAICard component by @agatha197 in [#4054](https://github.com/lablup/backend.ai-webui/pull/4054)
- **FR-1331**: Setup Jest testing environment for BAIFlex component by @yomybaby in [#4070](https://github.com/lablup/backend.ai-webui/pull/4070)
- **FR-1218**: Add a css custom variable for backend-ai-dialog title by @agatha197 in [#3917](https://github.com/lablup/backend.ai-webui/pull/3917)
- **FR-1241**: Add configurable resource panels with settings to session page by @agatha197 in [#4051](https://github.com/lablup/backend.ai-webui/pull/4051)
- **FR-1108**: Set up environment for relay component with storybook by @nowgnuesLee in [#3811](https://github.com/lablup/backend.ai-webui/pull/3811)
- **FR-1333**: Improve FolderCreateModal UX with model store restrictions and help text by @agatha197 in [#4074](https://github.com/lablup/backend.ai-webui/pull/4074)
- **FR-1353**: Enhance dashboard component layout with consistent visual design by @yomybaby in [#4110](https://github.com/lablup/backend.ai-webui/pull/4110)
- **FR-1343**: BAIUnmountAfterClose in BUI by @yomybaby in [#4093](https://github.com/lablup/backend.ai-webui/pull/4093)
- **FR-1315**: Integrate column visibility settings into BAITable component by @yomybaby in [#4063](https://github.com/lablup/backend.ai-webui/pull/4063)

### 🐛 Bug Fixes
- **FR-1295**: Preserve necessary GraphQL fragments after client directive filtering by @yomybaby in [#4002](https://github.com/lablup/backend.ai-webui/pull/4002)
- **FR-1292**: Fix BAICard extra content alignment with Flex wrapper by @yomybaby in [#4007](https://github.com/lablup/backend.ai-webui/pull/4007)
- **FR-1269**: Exclude locale/*.json from eslint in pre-commit by @nowgnuesLee in [#3986](https://github.com/lablup/backend.ai-webui/pull/3986)
- **FR-1300**: Improve data page storage panel responsive layout by @yomybaby in [#4019](https://github.com/lablup/backend.ai-webui/pull/4019)
- **FR-1301**: Remove improper key prop usage in SessionMetricGraph component by @ironAiken2 in [#4021](https://github.com/lablup/backend.ai-webui/pull/4021)
- **FR-1312**: Align label in invitations summary panel by @rapsealk in [#4040](https://github.com/lablup/backend.ai-webui/pull/4040)
- **FR-1320**: Prevent sending empty system prompt in Chat API requests by @yomybaby in [#4055](https://github.com/lablup/backend.ai-webui/pull/4055)
- **FR-1325**: Apply babel relay differently for each project by @nowgnuesLee in [#4061](https://github.com/lablup/backend.ai-webui/pull/4061)
- **FR-1308**: Await token login result by @fregataa in [#4033](https://github.com/lablup/backend.ai-webui/pull/4033)
- **FR-1303**: Update caniuse-lite and resolve webpack dev server deprecation warnings by @yomybaby in [#4025](https://github.com/lablup/backend.ai-webui/pull/4025)
- **FR-1332**: Remove try-catch wrapper from use hook in useConnectedBAIClient by @ironAiken2 in [#4076](https://github.com/lablup/backend.ai-webui/pull/4076)
- **FR-1258**: Center guide image and improve layout on narrow pages by @hummingbbird in [#4075](https://github.com/lablup/backend.ai-webui/pull/4075)
- **FR-1350**: Simplify max cluster size calculation in ResourceAllocationFormItems by @yomybaby in [#4103](https://github.com/lablup/backend.ai-webui/pull/4103)
- **FR-1351**: Replace useUpdatableState with useFetchKey in ComputeSessionListPage by @yomybaby in [#4104](https://github.com/lablup/backend.ai-webui/pull/4104)
- **FR-1352**: Catch baseURL check errors in useModels by @yomybaby in [#4105](https://github.com/lablup/backend.ai-webui/pull/4105)
- **FR-1346**: Show descriptive text for model store folder creation by @agatha197 in [#4099](https://github.com/lablup/backend.ai-webui/pull/4099)
- **FR-1357**: Pinned session history cannot be restored from states by @yomybaby in [#4116](https://github.com/lablup/backend.ai-webui/pull/4116)
- **FR-1345**: Enable superadmin to see total resource panel with hide_agents enabled by @agatha197 in [#4097](https://github.com/lablup/backend.ai-webui/pull/4097)
- **FR-1356**: Fix duplicate service name check to exclude terminated services by @hummingbbird in [#4118](https://github.com/lablup/backend.ai-webui/pull/4118)
- **FR-1348**: Correct RAM unit display in resource monitoring by @agatha197 in [#4108](https://github.com/lablup/backend.ai-webui/pull/4108)
- **FR-1347**: Fix extra mounts configuration by @agatha197 in [#4120](https://github.com/lablup/backend.ai-webui/pull/4120)
- **FR-1359**: Hide empty accelerator resource section in BaseResourceItem by @agatha197 in [#4124](https://github.com/lablup/backend.ai-webui/pull/4124)

### 🔨 Refactoring
- **FR-1298**: Replace headerBg token misuse with proper primary color palette by @yomybaby in [#4015](https://github.com/lablup/backend.ai-webui/pull/4015)
- **FR-1305**: Auto-handle tabList styling in BAICard component by @yomybaby in [#4029](https://github.com/lablup/backend.ai-webui/pull/4029)
- **FR-1287**: Remove `service_port` in legacy session fragment by @yomybaby in [#3999](https://github.com/lablup/backend.ai-webui/pull/3999) • Remove image information in legacy session fragment by @yomybaby in [#4000](https://github.com/lablup/backend.ai-webui/pull/4000)
- **FR-1311**: Rename helper utility functions for better clarity and consistency by @yomybaby in [#4038](https://github.com/lablup/backend.ai-webui/pull/4038)
- **FR-1326**: Remove duplicate Flex component and consolidate imports to use backend.ai-ui package by @yomybaby in [#4065](https://github.com/lablup/backend.ai-webui/pull/4065)
- **FR-1354**: Standardize unlimited value handling and resource processing by @agatha197 in [#4112](https://github.com/lablup/backend.ai-webui/pull/4112)
- **FR-1358**: Separate filtering concerns in VFolderTable to fix auto-mount detection by @yomybaby in [#4122](https://github.com/lablup/backend.ai-webui/pull/4122)
- **FR-1363**: Migrate StorageStatusPanelCard to BAIRowWrapWithDividers by @yomybaby in [#4132](https://github.com/lablup/backend.ai-webui/pull/4132)

### 🎨 Style
- **FR-1309**: Improve UI loading states and component styling by @yomybaby in [#4036](https://github.com/lablup/backend.ai-webui/pull/4036)

### 🛠 Chores
- **FR-1293**: Update to version 20 of relay-related packages by @nowgnuesLee in [#4006](https://github.com/lablup/backend.ai-webui/pull/4006)
- **FR-1323**: Improve development environment by @nowgnuesLee in [#4049](https://github.com/lablup/backend.ai-webui/pull/4049)

### 🧪 E2E Tests
- **FR-1337**: Refactor broken e2e test of vfolder and add auto mount vfolder test case by @nowgnuesLee in [#4081](https://github.com/lablup/backend.ai-webui/pull/4081) • Refactor broken e2e test of session and create a class for start page by @nowgnuesLee in [#4087](https://github.com/lablup/backend.ai-webui/pull/4087) • Fix broken e2e test of environments by @nowgnuesLee in [#4091](https://github.com/lablup/backend.ai-webui/pull/4091)

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v25.12.1...v25.13.0
EOF < /dev/null

---

## v25.12.1 (24/07/2025)

* fix(FR-1274): add @change option to api_endpoint to update value immediately by @hummingbbird in https://github.com/lablup/backend.ai-webui/pull/3993
* fix(FR-1282): modify service name rule to validate only when create and apply field name change by @hummingbbird in https://github.com/lablup/backend.ai-webui/pull/3996


**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v25.12.0...v25.12.1

---

## v25.12.0 (23/07/2025)

### ✨ Features
- **FR-1107**: Apply BAIBoard to customize prometheus metrics display by @ironAiken2 in [#3856](https://github.com/lablup/backend.ai-webui/pull/3856)
- **FR-1134**: Add tooltips for prometheus metrics by @ironAiken2 in [#3875](https://github.com/lablup/backend.ai-webui/pull/3875)
- **FR-1161**: Apply BAIBoard component to Start Page by @ironAiken2 in [#3867](https://github.com/lablup/backend.ai-webui/pull/3867)
- **FR-1220**: Add duplicate check logic for session and service names by @hummingbbird in [#3937](https://github.com/lablup/backend.ai-webui/pull/3937)
- **FR-1230**: My resource usage/capacity within the resource group by @agatha197 in [#3939](https://github.com/lablup/backend.ai-webui/pull/3939)
- **FR-1231**: Total resources within resource group by @agatha197 in [#3941](https://github.com/lablup/backend.ai-webui/pull/3941)
- **FR-1232**: Apply BAIBoard to Dashboard page by @agatha197 in [#3944](https://github.com/lablup/backend.ai-webui/pull/3944)
- **FR-735**: Apply NEO style to existing pages using Tabs or Table by @nowgnuesLee in [#3855](https://github.com/lablup/backend.ai-webui/pull/3855)
- **FR-1234**: Let backend.ai-ui support multiple language by @nowgnuesLee in [#3943](https://github.com/lablup/backend.ai-webui/pull/3943)
- **FR-878, FR-1228**: My resource usage/capacity by @agatha197 in [#3927](https://github.com/lablup/backend.ai-webui/pull/3927)
- **FR-1263**: Show pending sessions in the session list immediately after creation by @yomybaby in [#3982](https://github.com/lablup/backend.ai-webui/pull/3982)
- **FR-1074**: Chat interface for model cards by @lizable in [#3759](https://github.com/lablup/backend.ai-webui/pull/3759)

### 🐛 Bug Fixes
- **FR-1160**: Incorrect MIME type for CSS in es6 handler by @ironAiken2 in [#3864](https://github.com/lablup/backend.ai-webui/pull/3864)
- **FR-1169**: Disable deletion for pipeline folders by @ironAiken2 in [#3910](https://github.com/lablup/backend.ai-webui/pull/3910)
- **FR-1178**: Correct the labels for Simplified and Traditional Chinese in the language selection by @nowgnuesLee in [#3879](https://github.com/lablup/backend.ai-webui/pull/3879)
- **FR-1182, FR-1184**: Enable desktop notification when local storage setting is true by @ironAiken2 in [#3891](https://github.com/lablup/backend.ai-webui/pull/3891)
- **FR-1121**: Handle nested object for error title of log page by @agatha197 in [#3831](https://github.com/lablup/backend.ai-webui/pull/3831)
- **FR-1212**: The resource number has different size NVIDIA logos by @agatha197 in [#3908](https://github.com/lablup/backend.ai-webui/pull/3908)
- **FR-1246**: Error when accessing the Classic Session page by @agatha197 in [#3957](https://github.com/lablup/backend.ai-webui/pull/3957)
- **FR-1250**: Add error handler for 409 error to accepting invitation by @nowgnuesLee in [#3961](https://github.com/lablup/backend.ai-webui/pull/3961)
- **FR-1251**: Folder invitation response modal doesn't show latest data by @agatha197 in [#3960](https://github.com/lablup/backend.ai-webui/pull/3960)
- **FR-1252**: Separate untag and forget queries by @nowgnuesLee in [#3969](https://github.com/lablup/backend.ai-webui/pull/3969)
- **FR-1254**: Add desktop notification localStorage setting to callback dependency array by @ironAiken2 in [#3965](https://github.com/lablup/backend.ai-webui/pull/3965)
- **FR-1255**: Fix invalid vfolder selection in session launcher by @agatha197 in [#3964](https://github.com/lablup/backend.ai-webui/pull/3964)
- **FR-1259**: Handle 404 error with JSON body in Chat page by @yomybaby in [#3974](https://github.com/lablup/backend.ai-webui/pull/3974)
- **FR-1260**: Remove `defaultValue` prop of Form.Item when it is controlled by `initialValues` by @yomybaby in [#3976](https://github.com/lablup/backend.ai-webui/pull/3976)

### 🧹 Refactoring & Style
- **FR-583**: Remove compatibility before manager version 24.09 by @ironAiken2 in [#3906](https://github.com/lablup/backend.ai-webui/pull/3906)
- **FR-1232**: Dashboard suspense handling by @yomybaby in [#3989](https://github.com/lablup/backend.ai-webui/pull/3989)
- **FR-1190**: Enhance the UX for resource display on the agent page by @nowgnuesLee in [#3911](https://github.com/lablup/backend.ai-webui/pull/3911)
- **FR-1242**: Folder create panel layout was broken by @agatha197 in [#3955](https://github.com/lablup/backend.ai-webui/pull/3955)
- **FR-1153**: Replace CPU and MEM icons in React by @yomybaby in [#3979](https://github.com/lablup/backend.ai-webui/pull/3979)

### 🛠 Chores
- **FR-1026**: Add copy-config script to deploy for Vercel by @ragingwind in [#3794](https://github.com/lablup/backend.ai-webui/pull/3794)
- **FR-1205**: Run prettier and eslint at pre-commit by @nowgnuesLee in [#3905](https://github.com/lablup/backend.ai-webui/pull/3905), Remove ESLint auto-fix from pre-commit hook in [#3909](https://github.com/lablup/backend.ai-webui/pull/3909)
- **FR-1209**: Change the VSCode workspace window.title pattern by @yomybaby in [#3903](https://github.com/lablup/backend.ai-webui/pull/3903), Revert and add `.code-workspace` files to `.gitignore` in [#3912](https://github.com/lablup/backend.ai-webui/pull/3912)
- **FR-1195**: Modify column setting logic by @hummingbbird in [#3899](https://github.com/lablup/backend.ai-webui/pull/3899)
- **FR-1233**: Change to import local values in the ES modular way by @nowgnuesLee in [#3932](https://github.com/lablup/backend.ai-webui/pull/3932)

### 🌐 i18n
- **FR-1118**: Update terminology to follow proper Korean spacing rules by @rapsealk in [#3824](https://github.com/lablup/backend.ai-webui/pull/3824)

### 🔧 Misc
- **FR-1186**: Update okButtonProps to include disabled and danger in BAIConfirmModalWithInput component by @ironAiken2 in [#3883](https://github.com/lablup/backend.ai-webui/pull/3883)
- **FR-1216**: File browser failed to open in core 25.6 by @agatha197 in [#3914](https://github.com/lablup/backend.ai-webui/pull/3914)

**Full Changelog**: [v25.11.0...v25.12.0](https://github.com/lablup/backend.ai-webui/compare/v25.11.0...v25.12.0)

---

## v25.11.0 (04/07/2025)

### ✨ Features
- **FR-367**: Add keypair resource policy info modal. [#3030](https://github.com/lablup/backend.ai-webui/pull/3030) by @agatha197  
- **FR-1075**: Set up an independent i18n environment in `backend.ai-ui`. [#3771](https://github.com/lablup/backend.ai-webui/pull/3771) by @nowgnuesLee  
- **FR-1088**: Generate VSCode workspace for `webui` and `bui`. [#3778](https://github.com/lablup/backend.ai-webui/pull/3778) by @nowgnuesLee  

### 🐛 Bug Fixes
- **FR-1117**: Ensure unique `key` prop in `ImageNodeSimpleTag`. [#3821](https://github.com/lablup/backend.ai-webui/pull/3821) by @agatha197  
- **FR-1125**: Enable client-side pagination for `BAITable`. [#3842](https://github.com/lablup/backend.ai-webui/pull/3842) by @nowgnuesLee  
- **FR-1126**: Fix duplicated port number in generated URLs. [#3843](https://github.com/lablup/backend.ai-webui/pull/3843) by @ironAiken2  
- **FR-1132**: Hide unmanaged path in vFolder description. [#3849](https://github.com/lablup/backend.ai-webui/pull/3849) by @agatha197  
- **FR-1151**: Refactor `ResourceTypeIcon` to use dynamic device metadata. [#3859](https://github.com/lablup/backend.ai-webui/pull/3859) by @yomybaby  
- **FR-1155**: Set `DynamicUnitInputNumber` to `stringMode`. [#3863](https://github.com/lablup/backend.ai-webui/pull/3863) by @nowgnuesLee  
- **FR-1170**: Fix `BAITable` to correctly control pagination values. [#3874](https://github.com/lablup/backend.ai-webui/pull/3874) by @nowgnuesLee  
- **FR-1056**: Use `fetch-event-source` for authenticated SSE requests. [#3774](https://github.com/lablup/backend.ai-webui/pull/3774) by @ironAiken2  
- **FR-1186**: Add `disabled` and `danger` props to `okButtonProps` in `BAIConfirmModalWithInput`. [#3883](https://github.com/lablup/backend.ai-webui/pull/3883) by @ironAiken2  
- **FR-1187**: Use correct i18n key in folder invitation modal. [#3889](https://github.com/lablup/backend.ai-webui/pull/3889) by @nowgnuesLee  
- **FR-1165**: Improve `AboutBackendAIModal` styling. [#3871](https://github.com/lablup/backend.ai-webui/pull/3871) by @agatha197  
- **FR-1198**: Fix timezone handling in endpoint token select. [#3895](https://github.com/lablup/backend.ai-webui/pull/3895) by @nowgnuesLee  
- **Fix**: Prevent Electron bundle from overriding React web bundle. [#3851](https://github.com/lablup/backend.ai-webui/pull/3851) by @yomybaby  

### 🧪 Hotfix
- **FR-1174**: Fix sFTP upload error and file browser execution timeout. [#3876](https://github.com/lablup/backend.ai-webui/pull/3876) by @agatha197  

### 🔨 Refactoring
- **FR-1124**: Fix import error by correcting path and library. [#3838](https://github.com/lablup/backend.ai-webui/pull/3838) by @lizable  

### 🌐 i18n
- **FR-1118**: Update terminology for proper Korean spacing rules. [#3824](https://github.com/lablup/backend.ai-webui/pull/3824) by @rapsealk  

### 🛠 Chores
- **FR-1197**: Update validation message in environments select. [#3897](https://github.com/lablup/backend.ai-webui/pull/3897) by @hummingbbird  

### 🙌 New Contributors
- @hummingbbird made their first contribution in [#3897](https://github.com/lablup/backend.ai-webui/pull/3897)

---

**Full Changelog**: [v25.10.1...v25.11.0](https://github.com/lablup/backend.ai-webui/compare/v25.10.1...v25.11.0)

---

## v25.10.1 (24/06/2025)

- fix(FR-1125): change BAITable's pagination to support client-side as well ([#3842](https://github.com/lablup/backend.ai-webui/issues/3842))
- fix(FR-1135): React web bundle overrided by electron bundle ([#3851](https://github.com/lablup/backend.ai-webui/issues/3851))

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v25.10.0...v25.10.1

---

## v25.10.0 (20/06/2025)

### ✨ Features
- **FR-954**: Setup BAI UI package environment. [#3622](https://github.com/lablup/backend.ai-webui/pull/3622) by @nowgnuesLee  
- **FR-955**: Move Flex component to `backend.ai-ui` project. [#3640](https://github.com/lablup/backend.ai-webui/pull/3640) by @nowgnuesLee  
- **FR-982**: Add i18n to `backend.ai-ui` project. [#3665](https://github.com/lablup/backend.ai-webui/pull/3665) by @nowgnuesLee  
- **FR-983**: Setup Relay for `backend.ai-ui` and move fragment components. [#3675](https://github.com/lablup/backend.ai-webui/pull/3675) by @nowgnuesLee  
- **FR-1073**: Replace macro with `babel-plugin-relay`. [#3755](https://github.com/lablup/backend.ai-webui/pull/3755) by @nowgnuesLee  
- **FR-739**: Add `FolderInvitationResponseModal` and related hooks. [#3724](https://github.com/lablup/backend.ai-webui/pull/3724) by @agatha197  
- **FR-1045**: Modify WebUI 2FA configs for version compatibility. [#3761](https://github.com/lablup/backend.ai-webui/pull/3761) by @ironAiken2  
- **FR-834**: Improve UX for Auto-Mount Folders creation. [#3600](https://github.com/lablup/backend.ai-webui/pull/3600) by @agatha197  
- **FR-1065**: Add custom label to `EndpointSelect` component. [#3767](https://github.com/lablup/backend.ai-webui/pull/3767) by @lizable  
- **FR-624**: Add chat history. [#3555](https://github.com/lablup/backend.ai-webui/pull/3555) by @ragingwind  
- **FR-1070**: Include new accelerator info in session creation payload. [#3756](https://github.com/lablup/backend.ai-webui/pull/3756) by @agatha197  
- **FR-1105**: Improve session metrics layout and remove CPU used metric. [#3809](https://github.com/lablup/backend.ai-webui/pull/3809) by @ironAiken2  
- **FR-1062**: Replace `ImageResourceFormItem` with improved resource limit UI. [#3747](https://github.com/lablup/backend.ai-webui/pull/3747) by @agatha197  

### 🐛 Bug Fixes
- **FR-1054**: Add `disabled` type to `BAILink` and improve folder access in session details. [#3737](https://github.com/lablup/backend.ai-webui/pull/3737) by @agatha197  
- **FR-1077**: Fix `__generated__` folder path. [#3765](https://github.com/lablup/backend.ai-webui/pull/3765) by @nowgnuesLee  
- **FR-1069**: Improve login failure error handling. [#3758](https://github.com/lablup/backend.ai-webui/pull/3758) by @ironAiken2  
- **FR-949**: Fix incorrect CPU usage display in session usage monitor. [#3779](https://github.com/lablup/backend.ai-webui/pull/3779) by @ironAiken2  
- **FR-1090**: Fix invalid size format error for SHMEM. [#3786](https://github.com/lablup/backend.ai-webui/pull/3786) by @yomybaby  
- **FR-1092**: Remove `ChatRequest`. [#3789](https://github.com/lablup/backend.ai-webui/pull/3789) by @ragingwind  
- **FR-1097**: Fix missing chat messages. [#3792](https://github.com/lablup/backend.ai-webui/pull/3792) by @ragingwind  
- **FR-1100**: Fix image install failure. [#3799](https://github.com/lablup/backend.ai-webui/pull/3799) by @agatha197  
- **FR-1101**: Fix missing sender info in user invitation email. [#3801](https://github.com/lablup/backend.ai-webui/pull/3801) by @agatha197  
- **FR-1104**: Improve backward compatibility in `ResourcePresetSelect`. [#3806](https://github.com/lablup/backend.ai-webui/pull/3806) by @yomybaby  
- **FR-1106**: Prevent automatic SHMEM override from presets. [#3802](https://github.com/lablup/backend.ai-webui/pull/3802) by @yomybaby  
- **FR-957**: Display device names in uppercase on Prometheus metrics. [#3797](https://github.com/lablup/backend.ai-webui/pull/3797) by @ironAiken2  
- **FR-1115**: Show appropriate SHMEM form item based on preset. [#3826](https://github.com/lablup/backend.ai-webui/pull/3826) by @nowgnuesLee  
- **FR-1114**: Set minimum image resource limit regardless of previous value. [#3817](https://github.com/lablup/backend.ai-webui/pull/3817) by @agatha197  
- **FR-1112**: Remove unnecessary form reset in `VFolderTableFormItem`. [#3825](https://github.com/lablup/backend.ai-webui/pull/3825) by @lizable  
- **FR-1116**: Fix missing React rendering flag. [#3819](https://github.com/lablup/backend.ai-webui/pull/3819) by @agatha197  
- **FR-1120**: Use decimal size for I/O metrics. [#3832](https://github.com/lablup/backend.ai-webui/pull/3832) by @ironAiken2  
- **FR-1122**: Use decimal units for network info in session history. [#3835](https://github.com/lablup/backend.ai-webui/pull/3835) by @agatha197  
- **FR-1110**: Adjust tooltip position to avoid overflow in chat. [#3827](https://github.com/lablup/backend.ai-webui/pull/3827) by @lizable  

### 🔨 Refactoring
- **FR-1057**: Refactor size unit formatting in UI components. [#3723](https://github.com/lablup/backend.ai-webui/pull/3723) by @yomybaby  

### 🧪 E2E Tests
- **FR-1079**: Add login failure test cases. [#3769](https://github.com/lablup/backend.ai-webui/pull/3769) by @yomybaby  

### 🛠 Chores
- **FR-1055**: Use virtual folder ID only for identicons. [#3739](https://github.com/lablup/backend.ai-webui/pull/3739) by @rapsealk  
- **FR-1067**: Setup Relay ESLint rules. [#3748](https://github.com/lablup/backend.ai-webui/pull/3748) by @yomybaby  
- **FR-1111**: Enable Relay codegen in dev mode. [#3814](https://github.com/lablup/backend.ai-webui/pull/3814) by @nowgnuesLee  

### 💄 Style
- **FR-1089**: Update styles and transitions in chat. [#3780](https://github.com/lablup/backend.ai-webui/pull/3780), [#3785](https://github.com/lablup/backend.ai-webui/pull/3785) by @yomybaby  

---

**Full Changelog**: [v25.9.1...v25.10.0](https://github.com/lablup/backend.ai-webui/compare/v25.9.1...v25.10.0)

---

## v25.9.1 (04/06/2025)

* fix(FR-1058): handling default value in useDeferredQueryParams by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/3743


**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v25.9.0...v25.9.1

---

## v25.9.0 (30/05/2025)

### ✨ Features
- **FR-738**: Add folder invitation badge. [#3440](https://github.com/lablup/backend.ai-webui/pull/3440)
- **FR-740**: Create modal for accepting/rejecting invitations. [#3465](https://github.com/lablup/backend.ai-webui/pull/3465)
- **FR-918**: Add `BigNumber` support to manage bit values. [#3674](https://github.com/lablup/backend.ai-webui/pull/3674)
- **FR-952**: Enable TOTP registration before login. [#3616](https://github.com/lablup/backend.ai-webui/pull/3616)
- **FR-1016**: Use `folderId` instead of `folderName` when leaving a shared folder. [#3697](https://github.com/lablup/backend.ai-webui/pull/3697)
- **FR-1031**: Resource allocation for SFTP sessions based on image limit. [#3715](https://github.com/lablup/backend.ai-webui/pull/3715)
- **feat**: Add `'ms'` gap size to `Flex` component. [#3629](https://github.com/lablup/backend.ai-webui/pull/3629)

### 🐛 Bug Fixes
- **FR-447**: Fix incorrect logs caused by passing `kernelId`. [#3092](https://github.com/lablup/backend.ai-webui/pull/3092)
- **FR-877**: Allow admins to edit mount permissions for project folders. [#3549](https://github.com/lablup/backend.ai-webui/pull/3549)
- **FR-890**: Fix pagination count in agent summary table. [#3567](https://github.com/lablup/backend.ai-webui/pull/3567)
- **FR-917**: Restrict `VFolderSelect` to only show folders for the current project. [#3706](https://github.com/lablup/backend.ai-webui/pull/3706)
- **FR-956**: Enable desktop notifications. [#3687](https://github.com/lablup/backend.ai-webui/pull/3687)
- **FR-977**: Add “Today” preset option to range picker. [#3711](https://github.com/lablup/backend.ai-webui/pull/3711)
- **FR-1019**: Show appropriate error if user has already accepted a vfolder invitation. [#3693](https://github.com/lablup/backend.ai-webui/pull/3693)
- **FR-1021**: Fix layout shift by rendering tooltip in `document.body`. [#3700](https://github.com/lablup/backend.ai-webui/pull/3700)
- **FR-1039**: Fix selected vfolder count when switching project. [#3720](https://github.com/lablup/backend.ai-webui/pull/3720)
- **FR-1047**: Append `project_id` to query when fetching edited session name. [#3735](https://github.com/lablup/backend.ai-webui/pull/3735)
- **FR-1049**: Display inviter's email in folder invitation. [#3730](https://github.com/lablup/backend.ai-webui/pull/3730)
- **FR-1051**: Only show status info name, hide detailed description. [#3734](https://github.com/lablup/backend.ai-webui/pull/3734)
- **FR-1052**: Prevent admin from viewing folders in other users’ sessions. [#3733](https://github.com/lablup/backend.ai-webui/pull/3733)

### 🔨 Refactoring
- **FR-522**: Remove legacy registry code (pre-24.09). [#3707](https://github.com/lablup/backend.ai-webui/pull/3707)
- **FR-835**: Use `URLSearchParams` to construct query strings. [#3560](https://github.com/lablup/backend.ai-webui/pull/3560)
- **FR-993**: Migrate "About Backend.AI" modal to NEO-style React component. [#3659](https://github.com/lablup/backend.ai-webui/pull/3659)
- **FR-1006**: Remove classic session launcher and set NEO as default. [#3690](https://github.com/lablup/backend.ai-webui/pull/3690)

### 🛠 Chores
- **FR-831**: Display exact memory values in `ResourcePresetSettingModal`. [#3540](https://github.com/lablup/backend.ai-webui/pull/3540)
- **FR-1035**: Remove unused pnpm command for Jest tests. [#3713](https://github.com/lablup/backend.ai-webui/pull/3713)
- **FR-1038**: Improve Korean spacing and text phrasing. [#3718](https://github.com/lablup/backend.ai-webui/pull/3718)
- **chore**: Bump version to `25.9.0-alpha.0`. [#3705](https://github.com/lablup/backend.ai-webui/pull/3705)

---

**Full Changelog**: [v25.8.1...v25.9.0](https://github.com/lablup/backend.ai-webui/compare/v25.8.1...v25.9.0)

---

## v25.8.1 (21/05/2025)

* misc(FR-1015): typo in using i18n translation when commit image name input is invalid by @lizable in https://github.com/lablup/backend.ai-webui/pull/3694
* fix(FR-1020): Change session name update method to use REST API by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/3696


**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v25.8.0...v25.8.1

---

## v25.8.0 (20/05/2025)

### ✨ Features
- **FR-360**: Add `max_pending_session_count` and `max_concurrent_sftp_sessions` to keypair resource policy. [#3025](https://github.com/lablup/backend.ai-webui/pull/3025)
- **FR-564**: Enable folder creation and explorer view in vFolder selection. [#3591](https://github.com/lablup/backend.ai-webui/pull/3591)
- **FR-872**: Move desktop app download link to `UserDropdownMenu`. [#3551](https://github.com/lablup/backend.ai-webui/pull/3551)
- **FR-920**: Automatically set `minimum-required` resources when no preset is available. [#3604](https://github.com/lablup/backend.ai-webui/pull/3604)
- **FR-950**: Add folder detail panel with storage info in explorer. [#3615](https://github.com/lablup/backend.ai-webui/pull/3615)
- **FR-997**: Link to correct model service documentation for start/update. [#3667](https://github.com/lablup/backend.ai-webui/pull/3667)
- **FR-614**: Enable image rescan by project on the registry page. [#3594](https://github.com/lablup/backend.ai-webui/pull/3594)
- **FR-450**: Add LLM parameter to model interface. [#3631](https://github.com/lablup/backend.ai-webui/pull/3631)
- **FR-1002**: Implement infinite scrolling in `EndpointSelect`. [#3670](https://github.com/lablup/backend.ai-webui/pull/3670)
- **FR-976**: Add session live stat badge. [#3634](https://github.com/lablup/backend.ai-webui/pull/3634)
- **FR-966**: Add custom view area next to BAITable's pagination. [#3627](https://github.com/lablup/backend.ai-webui/pull/3627)
- **FR-1007**: Allow creating new folders directly in folder explorer. [#3678](https://github.com/lablup/backend.ai-webui/pull/3678)

### 🐛 Bug Fixes
- **FR-894**: Show error messages for failed image commits. [#3580](https://github.com/lablup/backend.ai-webui/pull/3580)
- **FR-895**: Make resource statistics panel scrollable on the Import & Run page. [#3601](https://github.com/lablup/backend.ai-webui/pull/3601)
- **FR-906**: Fix inability to create/modify resource presets when memory is null. [#3606](https://github.com/lablup/backend.ai-webui/pull/3606)
- **FR-915**: Fix error when deleting/restoring a single folder after multi-select. [#3590](https://github.com/lablup/backend.ai-webui/pull/3590)
- **FR-921**: Fix incorrect access key when terminating another user's session. [#3619](https://github.com/lablup/backend.ai-webui/pull/3619)
- **FR-941**: Prevent `Suspense` fallback when auto-refreshing resource card. [#3602](https://github.com/lablup/backend.ai-webui/pull/3602)
- **FR-948**: Fix incorrect i18n translation for `DescSharedMemory`. [#3623](https://github.com/lablup/backend.ai-webui/pull/3623)
- **FR-978**, **FR-981**: Address version compatibility with backend 24.09.x. [#3647](https://github.com/lablup/backend.ai-webui/pull/3647), [#3642](https://github.com/lablup/backend.ai-webui/pull/3642)
- **FR-994**: Validate TCP app availability when launching via session panel. [#3663](https://github.com/lablup/backend.ai-webui/pull/3663)
- **FR-995**: Add guard for invalid `baseURL`. [#3662](https://github.com/lablup/backend.ai-webui/pull/3662)
- **FR-951**: Apply `white-space: pre-wrap` for code blocks. [#3651](https://github.com/lablup/backend.ai-webui/pull/3651)
- **FR-1003**: Enable scroll overflow for code blocks in chat. [#3671](https://github.com/lablup/backend.ai-webui/pull/3671)
- **FR-1008**: Simplify `EndpointSelectProps` type and remove unused import. [#3680](https://github.com/lablup/backend.ai-webui/pull/3680)

### 🔨 Refactoring
- **FR-773**: Refactor storage list to NEO style. [#3563](https://github.com/lablup/backend.ai-webui/pull/3563)
- **FR-851**: Remove custom duration setting for messages. [#3599](https://github.com/lablup/backend.ai-webui/pull/3599)
- **FR-844**, **FR-992**: Migrate Terms of Service and Privacy Policy modals to NEO-style React components. [#3656](https://github.com/lablup/backend.ai-webui/pull/3656), [#3658](https://github.com/lablup/backend.ai-webui/pull/3658)
- **FR-967 ~ FR-970**: Migrate resource group page (list, modals, actions) to NEO style. [#3626](https://github.com/lablup/backend.ai-webui/pull/3626), [#3633](https://github.com/lablup/backend.ai-webui/pull/3633), [#3635](https://github.com/lablup/backend.ai-webui/pull/3635), [#3636](https://github.com/lablup/backend.ai-webui/pull/3636)

### 🛠 Chores
- **FR-972**: Indicate machine translation for non-English/Korean locales. [#3639](https://github.com/lablup/backend.ai-webui/pull/3639)
- **FR-942**: Replace Backend.AI badge with updated logo. [#3605](https://github.com/lablup/backend.ai-webui/pull/3605)
- **Fix**: Update separator between image name and tag. [#3611](https://github.com/lablup/backend.ai-webui/pull/3611)

### 🧪 E2E Tests
- **FR-757**: Add session creation test cases and configure Playwright locale to English. [#3452](https://github.com/lablup/backend.ai-webui/pull/3452)

---

**Full Changelog**: [v25.7.1...v25.8.0](https://github.com/lablup/backend.ai-webui/compare/v25.7.1...v25.8.0)

---

## v25.7.1 (28/04/2025)

### ✨ Features
- **FR-783**: Refresh application state using `baseURL` and `token`. [#3494](https://github.com/lablup/backend.ai-webui/pull/3494) (@ragingwind)

### 🐛 Bug Fixes
- **FR-386**: Add max value validation to User/Project setting modal. [#3050](https://github.com/lablup/backend.ai-webui/pull/3050) (@nowgnuesLee)
- **FR-899**: Fix to display success message when deleting a resource preset. [#3576](https://github.com/lablup/backend.ai-webui/pull/3576) (@nowgnuesLee)
- **FR-907**: Fix invalid date picker behavior in user session history page. [#3584](https://github.com/lablup/backend.ai-webui/pull/3584) (@agatha197)
- **FR-883**: Implement consistent sorting behavior across table components. [#3586](https://github.com/lablup/backend.ai-webui/pull/3586) (@yomybaby)
- **FR-908**: Add guard for undefined `baseURL`. [#3589](https://github.com/lablup/backend.ai-webui/pull/3589) (@ragingwind)

### 🔨 Refactoring
- **FR-896**: Refactor chat card state management and improve naming conventions. [#3573](https://github.com/lablup/backend.ai-webui/pull/3573) (@yomybaby)

### 🛠 Chores
- **FR-901**: Change info icon to success icon in certain messages. [#3578](https://github.com/lablup/backend.ai-webui/pull/3578) (@nowgnuesLee)
- **FR-852**: Update folder name validation message to allow only English letters. [#3539](https://github.com/lablup/backend.ai-webui/pull/3539) (@nowgnuesLee)

### 🧪 E2E Tests
- **FR-763**: Add `FolderCreationModal` class for E2E testing. [#3467](https://github.com/lablup/backend.ai-webui/pull/3467) (@nowgnuesLee)

---

**Full Changelog**: [v25.7.0...v25.7.1](https://github.com/lablup/backend.ai-webui/compare/v25.7.0...v25.7.1)

---

## v25.7.0 (24/04/2025)

### ✨ Features
- **FR-863**: Add a modal to manage invited folders. [#3533](https://github.com/lablup/backend.ai-webui/pull/3533) (@ironAiken2)
- **FR-559**: Display localized creation dates in the folder explorer. [#3532](https://github.com/lablup/backend.ai-webui/pull/3532) (@nowgnuesLee)
- **FR-887**: Hide model service card on the start page when `enableModelFolders` is `false`. [#3562](https://github.com/lablup/backend.ai-webui/pull/3562) (@agatha197)
- **FR-889**: Add resource group column to the agent summary view. [#3565](https://github.com/lablup/backend.ai-webui/pull/3565) (@agatha197)
- **FR-885**: Disable file explorer for unmanaged folders. [#3571](https://github.com/lablup/backend.ai-webui/pull/3571) (@ironAiken2)

### 🐛 Bug Fixes
- **FR-870**: Fix invalid sorter for file size column in the folder explorer. [#3542](https://github.com/lablup/backend.ai-webui/pull/3542) (@rapsealk)
- **FR-867**: Fix incorrect display of `'wd'` permission value. [#3550](https://github.com/lablup/backend.ai-webui/pull/3550) (@agatha197)

### 🔨 Refactoring
- **FR-557**: Improve language selection UX and refactor fragile code. [#3536](https://github.com/lablup/backend.ai-webui/pull/3536) (@nowgnuesLee)

---

**Full Changelog**: [v25.6.2...v25.7.0](https://github.com/lablup/backend.ai-webui/compare/v25.6.2...v25.7.0)

---

## v25.6.2 (21/04/2025)

### ✨ Features
- **FR-860**: Introduce `ImageNodeSimpleView` to the Endpoint detail page. [#3217](https://github.com/lablup/backend.ai-webui/pull/3217) (@yomybaby)
- **FR-556**: Trim all input fields used during login to prevent input errors. [#3506](https://github.com/lablup/backend.ai-webui/pull/3506) (@nowgnuesLee)
- **FR-558**: Display human-readable file sizes in the folder explorer. [#3529](https://github.com/lablup/backend.ai-webui/pull/3529) (@nowgnuesLee)
- **FR-871**: Improve visibility of committed container names. [#3544](https://github.com/lablup/backend.ai-webui/pull/3544) (@agatha197)

### 🐛 Bug Fixes
- **FR-861**: Fix sync issue between mount permission changes and Lit component state. [#3530](https://github.com/lablup/backend.ai-webui/pull/3530) (@nowgnuesLee)
- **FR-869**: Fix session launcher to correctly display folder types. [#3538](https://github.com/lablup/backend.ai-webui/pull/3538) (@nowgnuesLee)

---

**Full Changelog**: [v25.6.1...v25.6.2](https://github.com/lablup/backend.ai-webui/compare/v25.6.1...v25.6.2)

---

## v25.5.2 (21/04/2025)

- feat(FR-871): improve visibility of committed container names #3544 by @agatha197 

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v25.5.1...v25.5.2

---

## v25.6.1 (16/04/2025)

### ✨ Features
- **FR-833**: Improve metric label formatting in user session history page. [#3500](https://github.com/lablup/backend.ai-webui/pull/3500) (@ironAiken2)
- **FR-826**: Allow role setting when creating a new user. [#3491](https://github.com/lablup/backend.ai-webui/pull/3491) (@agatha197)
- **FR-718**: Change vFolder status category condition. [#3511](https://github.com/lablup/backend.ai-webui/pull/3511) (@agatha197)

### 🐛 Bug Fixes
- **FR-842**: Fix storage status mismatch with virtual nodes total count. [#3510](https://github.com/lablup/backend.ai-webui/pull/3510) (@agatha197)
- **FR-843**: Fix incorrect project folder ownership identification for users with "user" role. [#3509](https://github.com/lablup/backend.ai-webui/pull/3509) (@agatha197)
- **FR-850**: Fix typo errors in folder creation and file upload processes. [#3519](https://github.com/lablup/backend.ai-webui/pull/3519) (@agatha197)
- **FR-839**: Handle rename functionality when `update_attribute` is absent. [#3505](https://github.com/lablup/backend.ai-webui/pull/3505) (@agatha197)
- **FR-830**: Pass exact architecture on session creation for repo import and change default import environment. [#3501](https://github.com/lablup/backend.ai-webui/pull/3501) (@nowgnuesLee)

### 🔥 Hotfixes
- **FR-853**: Disable folder deletion based on user permissions. [#3525](https://github.com/lablup/backend.ai-webui/pull/3525) (@nowgnuesLee)

### 🛠 Chores
- **FR-649**: Clean up unused Lit elements. [#3352](https://github.com/lablup/backend.ai-webui/pull/3352) (@nowgnuesLee)

---

**Full Changelog**: [v25.6.0...v25.6.1](https://github.com/lablup/backend.ai-webui/compare/v25.6.0...v25.6.1)

---

## v25.6.0 (14/04/2025)

### ✨ Features
- **FR-706**: Preserve pagination and filter state of vFolder list. [#3405](https://github.com/lablup/backend.ai-webui/pull/3405) (@yomybaby)
- **FR-327**: Add recently created session card. [#3369](https://github.com/lablup/backend.ai-webui/pull/3369) (@agatha197)
- **FR-330**: Add "My Session" card. [#3370](https://github.com/lablup/backend.ai-webui/pull/3370) (@agatha197)
- **FR-326**: Implement dashboard layout. [#3371](https://github.com/lablup/backend.ai-webui/pull/3371) (@agatha197)
- **FR-732**: Unified dashboard refetch mechanism and UI improvements. [#3425](https://github.com/lablup/backend.ai-webui/pull/3425) (@yomybaby)
- **FR-676**: Add experimental feature support to dashboard. [#3375](https://github.com/lablup/backend.ai-webui/pull/3375) (@agatha197)
- **FR-769**: Show text when no values have changed in `SettingList`. [#3464](https://github.com/lablup/backend.ai-webui/pull/3464) (@nowgnuesLee)
- **FR-409**: Introduce pinned session history. [#3456](https://github.com/lablup/backend.ai-webui/pull/3456) (@yomybaby)
- **FR-540**: Display max/avg session stats in detail panel (UI hidden). [#3432](https://github.com/lablup/backend.ai-webui/pull/3432) (@ironAiken2)
- **FR-688**: Improve chat rendering performance. [#3424](https://github.com/lablup/backend.ai-webui/pull/3424) (@ragingwind)
- **FR-777**: Use resource limit of resource group. [#3480](https://github.com/lablup/backend.ai-webui/pull/3480) (@yomybaby)
- **FR-655**: Show user’s average resource utilization. [#3353](https://github.com/lablup/backend.ai-webui/pull/3353) (@ironAiken2)
- **FR-529**: Add application memory usage bar. [#3473](https://github.com/lablup/backend.ai-webui/pull/3473) (@yomybaby)

### 🐛 Bug Fixes
- **FR-720**: Fix incorrect description and add label to select in user config script modal. [#3416](https://github.com/lablup/backend.ai-webui/pull/3416) (@nowgnuesLee)
- **FR-675**: Fix resource item overlap in narrow windows. [#3373](https://github.com/lablup/backend.ai-webui/pull/3373) (@agatha197)
- **FR-750**: Improve resource slot display in `SessionSlotCell`. [#3438](https://github.com/lablup/backend.ai-webui/pull/3438) (@yomybaby)
- **FR-733**: Use `isActive()` function to disable session termination button. [#3433](https://github.com/lablup/backend.ai-webui/pull/3433) (@lizable)
- **FR-703**: Add `word-break` to mounted folder labels in session detail modal. [#3407](https://github.com/lablup/backend.ai-webui/pull/3407) (@nowgnuesLee)
- **FR-242**: Show vFolder list for delegated users. [#3070](https://github.com/lablup/backend.ai-webui/pull/3070) (@ironAiken2)
- **FR-728**: Hide StartPage items from blocklist/inactivelist in `config.toml`. [#3439](https://github.com/lablup/backend.ai-webui/pull/3439) (@nowgnuesLee)
- **FR-801**: Hide cloneable toggle on reset. [#3477](https://github.com/lablup/backend.ai-webui/pull/3477) (@nowgnuesLee)
- **FR-727**: Adjust `ChatSender` style to match Ant Design. [#3420](https://github.com/lablup/backend.ai-webui/pull/3420) (@nowgnuesLee)
- **FR-681**: Add `lifecycle_stage` filter to `endpoint_list` query. [#3388](https://github.com/lablup/backend.ai-webui/pull/3388) (@nowgnuesLee)
- **FR-764**: Increase agent select page size and add search. [#3455](https://github.com/lablup/backend.ai-webui/pull/3455) (@yomybaby)
- **FR-748**: Update chat ID on model change. [#3436](https://github.com/lablup/backend.ai-webui/pull/3436) (@ragingwind)
- **FR-791**: Add drop container to sender. [#3469](https://github.com/lablup/backend.ai-webui/pull/3469) (@ragingwind)
- **FR-777**: Rename `resource_slot_limit` → `resource_allocation_limit_for_sessions`. [#3488](https://github.com/lablup/backend.ai-webui/pull/3488) (@yomybaby)
- **FR-823**: Fix wide scrollbar issue in empty log message view. [#3487](https://github.com/lablup/backend.ai-webui/pull/3487) (@agatha197)
- **FR-821**: Display agent IDs with comma separation. [#3492](https://github.com/lablup/backend.ai-webui/pull/3492) (@agatha197)
- **FR-819**: Fix resource preset share unit display. [#3489](https://github.com/lablup/backend.ai-webui/pull/3489) (@agatha197)
- **FR-820**: Fix compact sidebar not applying after refresh. [#3495](https://github.com/lablup/backend.ai-webui/pull/3495) (@agatha197)

### 🧪 E2E Tests
- **FR-752**: Fix E2E tests for `showNonInstalledImages` and login. [#3443](https://github.com/lablup/backend.ai-webui/pull/3443) (@yomybaby)
- **FR-759**: Fix and add vFolder restore & invitation test cases.  [#3442](https://github.com/lablup/backend.ai-webui/pull/3442), [#3446](https://github.com/lablup/backend.ai-webui/pull/3446), [#3451](https://github.com/lablup/backend.ai-webui/pull/3451) (@agatha197, @ironAiken2)

### 🔨 Refactoring
- **FR-357**: Refactor NEO configurations page using `SettingList`. [#3077](https://github.com/lablup/backend.ai-webui/pull/3077) (@nowgnuesLee)

### 🛠 Chores
- **FR-616**: Remove unnecessary `#` column and unused code. [#3322](https://github.com/lablup/backend.ai-webui/pull/3322) (@nowgnuesLee)
- **FR-730**: Update React dependencies to latest versions. [#3422](https://github.com/lablup/backend.ai-webui/pull/3422) (@yomybaby)
- **#756**: Remove visual clutter. [#3481](https://github.com/lablup/backend.ai-webui/pull/3481) (@inureyes)

### 💅 Styling
- **FR-816**: Improve Start page grid layout for XXL screens. [#3483](https://github.com/lablup/backend.ai-webui/pull/3483) (@yomybaby)

### 🚑 Hotfixes
- **FR-802**: Disable delete button for users with 'User' role. [#3479](https://github.com/lablup/backend.ai-webui/pull/3479) (@agatha197)

---

**Full Changelog**: [v25.5.1...v25.6.0](https://github.com/lablup/backend.ai-webui/compare/v25.5.1...v25.6.0)

---

## v25.5.1 (27/03/2025)

* feat: move the announcement component to the start page by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/3412
* hotfix(FR-726): plugin menu item doesn't work by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/3417


**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v25.5.0...v25.5.1

---

## v25.5.0 (25/03/2025)

### ✨ Features
- **FR-576**: Add TCP connection guidance dialog. [#3342](https://github.com/lablup/backend.ai-webui/pull/3342) (@agatha197)
- **FR-411**: Support resource presets per resource group. [#3349](https://github.com/lablup/backend.ai-webui/pull/3349) (@agatha197)
- **FR-659**: Display resource group in resource preset list. [#3350](https://github.com/lablup/backend.ai-webui/pull/3350) (@agatha197)
- **FR-678**: Add `resourceGroup` prop to enhance composability of `ResourcePresetSelect`. [#3377](https://github.com/lablup/backend.ai-webui/pull/3377) (@agatha197)
- **FR-679**: Add optional description attribute to `SettingGroup`. [#3381](https://github.com/lablup/backend.ai-webui/pull/3381) (@nowgnuesLee)
- **FR-691**: Add description to experimental setting group. [#3391](https://github.com/lablup/backend.ai-webui/pull/3391) (@yomybaby)
- **FR-663**: Set default category if app is not in app template. [#3348](https://github.com/lablup/backend.ai-webui/pull/3348) (@agatha197)
- **FR-647**: Set NEO vFolder as default. [#3343](https://github.com/lablup/backend.ai-webui/pull/3343) (@agatha197)
- **FR-596**: Add bulk restore folder modal. [#3346](https://github.com/lablup/backend.ai-webui/pull/3346) (@agatha197)
- **FR-563**: Set model usage mode when selected tab is model. [#3362](https://github.com/lablup/backend.ai-webui/pull/3362) (@agatha197)
- **FR-670**: Hide `DELETE_COMPLETE` folders. [#3365](https://github.com/lablup/backend.ai-webui/pull/3365) (@agatha197)
- **FR-404**: Toggle visibility of model folder related info. [#3049](https://github.com/lablup/backend.ai-webui/pull/3049) (@agatha197)
- **FR-639**: Adjust accelerator slider step dynamically based on resource group setting. [#3383](https://github.com/lablup/backend.ai-webui/pull/3383) (@yomybaby)
- **FR-658**: Remove legacy vFolder files. [#3345](https://github.com/lablup/backend.ai-webui/pull/3345) (@agatha197)
- **FR-705**: Introduce NEO `BAIAlert` component. [#3403](https://github.com/lablup/backend.ai-webui/pull/3403) (@yomybaby)
- **FR-622**: Refactor chat components. [#3357](https://github.com/lablup/backend.ai-webui/pull/3357) (@ragingwind)
- **FR-595**: Add identicon to name. [#3363](https://github.com/lablup/backend.ai-webui/pull/3363) (@agatha197)
- **FR-638**: Add `NoResourceGroupBanner` to warn when no resource group is assigned. [#3393](https://github.com/lablup/backend.ai-webui/pull/3393) (@lizable)

### 🔧 Refactoring
- **FR-484**: Refactor statistics page into React component. [#3178](https://github.com/lablup/backend.ai-webui/pull/3178) (@nowgnuesLee)

### 🐛 Bug Fixes
- **FR-611**: Add `babel-preset-react-app` to fix build issue. [#3341](https://github.com/lablup/backend.ai-webui/pull/3341) (@ragingwind)
- **FR-695**: Fix sorting issue in resource preset list. [#3396](https://github.com/lablup/backend.ai-webui/pull/3396) (@agatha197)
- **BA-889**: Remove incorrect TensorFlow image metadata. [#3287](https://github.com/lablup/backend.ai-webui/pull/3287) (@rapsealk)
- **FR-701**: Fix MEM value changing unexpectedly when blurring form item. [#3400](https://github.com/lablup/backend.ai-webui/pull/3400) (@yomybaby)
- **FR-690**: Fix browser freezing during chat message input. [#3390](https://github.com/lablup/backend.ai-webui/pull/3390) (@yomybaby)
- **FR-697**: Fix general tab display issue on Data page. [#3398](https://github.com/lablup/backend.ai-webui/pull/3398) (@agatha197)

### 🛠 Chores
- **FR-656**: Modify icon-related design on the session page. [#3338](https://github.com/lablup/backend.ai-webui/pull/3338) (@nowgnuesLee)
- **FR-666**: Set up pnpm workspace. [#3358](https://github.com/lablup/backend.ai-webui/pull/3358) (@yomybaby)
- **FR-687**: Add `react/recommended` ESLint plugin. [#3386](https://github.com/lablup/backend.ai-webui/pull/3386) (@yomybaby)
- **FR-457**: Clean up unused configuration in `config.toml`. [#3325](https://github.com/lablup/backend.ai-webui/pull/3325) (@ironAiken2)

---

**Full Changelog**: [v25.4.0...v25.5.0](https://github.com/lablup/backend.ai-webui/compare/v25.4.0...v25.5.0)

---

## v25.4.0 (11/03/2025)

### ✨ Features
- **FR-462**: Add CSP nonce string that will be injected by webserver. [#3099](https://github.com/lablup/backend.ai-webui/pull/3099) (@agatha197)
- **FR-567**: Preserve pagination/filter/order data in session/endpoint page. [#3245](https://github.com/lablup/backend.ai-webui/pull/3245) (@yomybaby)
- **FR-48**: WebUI NEO start page basic layout. [#2786](https://github.com/lablup/backend.ai-webui/pull/2786) (@ironAiken2)
- **FR-553**: Add Agents. [#3200](https://github.com/lablup/backend.ai-webui/pull/3200) (@ragingwind)
- **FR-533**: Add fluent-emoji-flat component. [#3265](https://github.com/lablup/backend.ai-webui/pull/3265) (@ragingwind)
- **FR-252**: Introduce session status info modal in session detail panel. [#3190](https://github.com/lablup/backend.ai-webui/pull/3190) (@ironAiken2)
- **FR-512**: NEO storage status panel. [#3176](https://github.com/lablup/backend.ai-webui/pull/3176) (@agatha197)
- **FR-513**: NEO quota per storage volume card. [#3226](https://github.com/lablup/backend.ai-webui/pull/3226) (@agatha197)
- **FR-581**: Add NEO vFolder list page. [#3232](https://github.com/lablup/backend.ai-webui/pull/3232) (@agatha197)
- **FR-592**: NEO vFolder page - delete folders. [#3251](https://github.com/lablup/backend.ai-webui/pull/3251) (@agatha197)
- **FR-511**: Set experimental to NEO vFolder page. [#3258](https://github.com/lablup/backend.ai-webui/pull/3258) (@agatha197)
- **FR-594**: Add folder renaming feature. [#3259](https://github.com/lablup/backend.ai-webui/pull/3259) (@agatha197)
- **FR-598**: Add permission setting button to folder explorer. [#3271](https://github.com/lablup/backend.ai-webui/pull/3271) (@agatha197)
- **FR-597**: Refactor invite folder modal. [#3274](https://github.com/lablup/backend.ai-webui/pull/3274) (@agatha197)
- **FR-602**: Add missing Suspense for page component and match padding/margin styles. [#3249](https://github.com/lablup/backend.ai-webui/pull/3249) (@yomybaby)
- **FR-609**: Add Lablup customer service agent. [#3281](https://github.com/lablup/backend.ai-webui/pull/3281) (@ragingwind)
- **FR-249**: Open folder explorer from session detail panel using `vfolder_nodes`. [#3052](https://github.com/lablup/backend.ai-webui/pull/3052) (@ironAiken2)
- **FR-245**: Migrate session app launcher modal into React component. [#3225](https://github.com/lablup/backend.ai-webui/pull/3225) (@ironAiken2)
- **FR-617**: Add confirmation dialog for folder sharing removal. [#3294](https://github.com/lablup/backend.ai-webui/pull/3294) (@yomybaby)
- **BA-850**: Add option to control interactive login account switch button. [#3261](https://github.com/lablup/backend.ai-webui/pull/3261) (@rapsealk)
- **FR-504**: Group menu hierarchy. [#3285](https://github.com/lablup/backend.ai-webui/pull/3285) (@yomybaby)
- **BA-892**: Update icons for TPU and IPU accelerators. [#3289](https://github.com/lablup/backend.ai-webui/pull/3289) (@rapsealk)

### 🔨 Refactoring
- **FR-593**: Manage endpoint list loading state. [#3224](https://github.com/lablup/backend.ai-webui/pull/3224) (@yomybaby)
- **FR-587**: Refactor start page components. [#2885](https://github.com/lablup/backend.ai-webui/pull/2885) (@yomybaby)
- **FR-608**: Update `SettingList` component style. [#3279](https://github.com/lablup/backend.ai-webui/pull/3279) (@yomybaby)

### 🐛 Bug Fixes
- **FR-582**: Resolve E2E test failures due to i18n and component updates. [#3235](https://github.com/lablup/backend.ai-webui/pull/3235) (@agatha197)
- **FR-578**: Fix resource panel i18n key error. [#3221](https://github.com/lablup/backend.ai-webui/pull/3221) (@agatha197)
- **FR-576**: Remove hyperlink in SFTP/FTP link on app launcher dialog. [#3264](https://github.com/lablup/backend.ai-webui/pull/3264) (@lizable)
- **FR-607**: Fix HPC optimization option being set to `1` even when auto switch is enabled. [#3277](https://github.com/lablup/backend.ai-webui/pull/3277) (@yomybaby)
- **FR-626**: Fix unexpected content size expansion when opening `Select` in Activity panel. [#3309](https://github.com/lablup/backend.ai-webui/pull/3309) (@nowgnuesLee)
- **FR-612**: Increase `max-old-space-size` to 4096 in `package.yml`. [#3312](https://github.com/lablup/backend.ai-webui/pull/3312) (@yomybaby)
- **FR-571**: Remove `showKernelList` configuration. [#3306](https://github.com/lablup/backend.ai-webui/pull/3306) (@ironAiken2)
- **FR-625**: Fix 404 error when using the clone feature in the model store. [#3307](https://github.com/lablup/backend.ai-webui/pull/3307) (@yomybaby)
- **FR-620**: Refresh folder list after updating folder permissions in Folder Explorer. [#3301](https://github.com/lablup/backend.ai-webui/pull/3301) (@yomybaby)
- **FR-585**: Apply conditional rendering using the ternary operator on `VFolderLazyView`. [#3311](https://github.com/lablup/backend.ai-webui/pull/3311) (@ironAiken2)
- **FR-630**: Support modifying resource preset using ID. [#3318](https://github.com/lablup/backend.ai-webui/pull/3318) (@nowgnuesLee)
- **FR-641**: Improve i18n for model token and MEM form item. [#3326](https://github.com/lablup/backend.ai-webui/pull/3326) (@yomybaby)

### 🚀 Hotfixes
- **FR-618**: Replace `BAIBoard` with `Grid` component to fix broken layout in Electron. [#3295](https://github.com/lablup/backend.ai-webui/pull/3295) (@yomybaby)
- **FR-619**: Set default order to `-created_at`. [#3296](https://github.com/lablup/backend.ai-webui/pull/3296) (@yomybaby)

### 🛠 Chores
- **FR-590**: Set up i18n key sorting pre-commit hook. [#3243](https://github.com/lablup/backend.ai-webui/pull/3243) (@yomybaby)
- **FR-591**: Enable recursive sort option for i18n keys. [#3246](https://github.com/lablup/backend.ai-webui/pull/3246) (@yomybaby)
- Delete unnecessary "Add to Project" GitHub Action. [#3273](https://github.com/lablup/backend.ai-webui/pull/3273) (@yomybaby)
- **FR-653**: Comment out `StartFromURL` card from the start page. [#3334](https://github.com/lablup/backend.ai-webui/pull/3334) (@nowgnuesLee)

---

**Full Changelog**: [v25.3.2...v25.4.0](https://github.com/lablup/backend.ai-webui/compare/v25.3.2...v25.4.0)

---

## v25.3.2 (21/02/2025)

### Features
- FR-467: Enhance Sidebar and Card UI by @nowgnuesLee in [#3117](https://github.com/lablup/backend.ai-webui/pull/3117)
- FR-536: Move LLM Playground to the top menu by @ragingwind in [#3195](https://github.com/lablup/backend.ai-webui/pull/3195)
- FR-369: Add icon components for Neo design by @ironAiken2 in [#3223](https://github.com/lablup/backend.ai-webui/pull/3223)
- FR-569: Add Rebellions image metadata by @yomybaby in [#3212](https://github.com/lablup/backend.ai-webui/pull/3212)
- FR-534: Introduce NEO style Tabs and RadioGroup by @yomybaby in [#3139](https://github.com/lablup/backend.ai-webui/pull/3139)

### Fixes
- FR-568: Remove whitespace and update CoolDown text in autoscaling UI by @lizable in [#3189](https://github.com/lablup/backend.ai-webui/pull/3189)
- FR-575: Fix session detail panel's broken layout by @yomybaby in [#3215](https://github.com/lablup/backend.ai-webui/pull/3215)
- FR-579: Resolve blurriness in the credential list content by @agatha197 in [#3228](https://github.com/lablup/backend.ai-webui/pull/3228)

### Refactoring
- FR-535: Refactor endpoint destroying category by @yomybaby in [#3162](https://github.com/lablup/backend.ai-webui/pull/3162)

### Hotfix
- Move the Chat menu under the Serving menu by @yomybaby in [#3234](https://github.com/lablup/backend.ai-webui/pull/3234)

### New Contributors
- @ragingwind made their first contribution in [#3195](https://github.com/lablup/backend.ai-webui/pull/3195)

**Full Changelog**: [v25.3.1...v25.3.2](https://github.com/lablup/backend.ai-webui/compare/v25.3.1...v25.3.2)

---

## v25.3.1 (19/02/2025)

* feat(FR-555): Improve the auto-scaling rule editor interface and list by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/3202
* feat(FR-561): add percentage suffix for kernel metric threshold by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/3203


**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v25.3.0...v25.3.1

---

## v25.3.0 (18/02/2025)

### Features
- open kernel log modal in Kernel list by @yomybaby in [#3100](https://github.com/lablup/backend.ai-webui/pull/3100) FR-503
- introduce UnmountModalAfterClose by @yomybaby in [#3136](https://github.com/lablup/backend.ai-webui/pull/3136) FR-502
- display error_data of model service's route by @yomybaby in [#3173](https://github.com/lablup/backend.ai-webui/pull/3173) FR-532
- terminate sessions in NEO session list by @yomybaby in [#3163](https://github.com/lablup/backend.ai-webui/pull/3163) FR-492
- introduce BAIFetchKeyButton by @yomybaby in [#3169](https://github.com/lablup/backend.ai-webui/pull/3169) FR-527
- Type counts in NEO session list tabs by @yomybaby in [#3170](https://github.com/lablup/backend.ai-webui/pull/3170) FR-448
- support math in model card by @agatha197 in [#3067](https://github.com/lablup/backend.ai-webui/pull/3067) FR-434
- wrap customTags contents with Collapse by @agatha197 in [#3073](https://github.com/lablup/backend.ai-webui/pull/3073) FR-433
- synchronize the file input in the LLM Playground by @agatha197 in [#3032](https://github.com/lablup/backend.ai-webui/pull/3032) FR-255

### Fixes
- session list filter UI in small screen by @yomybaby in [#3172](https://github.com/lablup/backend.ai-webui/pull/3172) FR-528
- Ensure unique values in compute session mount list by @rapsealk in [#3102](https://github.com/lablup/backend.ai-webui/pull/3102) FR-464
- Set the width of the description in the session detail panel to maximum by @ironAiken2 in [#3143](https://github.com/lablup/backend.ai-webui/pull/3143) FR-506
- fix calculate logic for agent list memory usage progress percent by @ironAiken2 in [#3197](https://github.com/lablup/backend.ai-webui/pull/3197) FR-547
- handle session rename error of `modify_compute_session` by @yomybaby in [#3194](https://github.com/lablup/backend.ai-webui/pull/3194) FR-546
- fix cannot reopen vfolder creation modal in session launcher by @yomybaby in [#3199](https://github.com/lablup/backend.ai-webui/pull/3199) FR-552

### Improvements
- Improvement on Korean i18n by @YEONFEEL96 in [#3129](https://github.com/lablup/backend.ai-webui/pull/3129)
- Improvement on English Translation by @YEONFEEL96 in [#3144](https://github.com/lablup/backend.ai-webui/pull/3144)

### Chores
- increase default soft-timeout to 20s by @yomybaby in [#3166](https://github.com/lablup/backend.ai-webui/pull/3166) FR-524
- bump version to 25.3.0-alpha.0 for dev by @yomybaby in [#3168](https://github.com/lablup/backend.ai-webui/pull/3168)

**Full Changelog**: [v25.2.0...v25.3.0](https://github.com/lablup/backend.ai-webui/compare/v25.2.0...v25.3.0)

---

## v25.2.0 (07/02/2025)

### Features
- FR-352: `update-useBAINotification` by @nowgnuesLee in [#3065](https://github.com/lablup/backend.ai-webui/pull/3065)
- FR-393: Add e2e test for maintenance page by @nowgnuesLee in [#3074](https://github.com/lablup/backend.ai-webui/pull/3074)
- FR-247, FR-249: Open folder explorer from session detail panel using `vfolder_mounts` by @ironAiken2 in [#3038](https://github.com/lablup/backend.ai-webui/pull/3038)
- FR-319: Session list NEO by @yomybaby in [#2932](https://github.com/lablup/backend.ai-webui/pull/2932)
- FR-459: User setting for experimental NEO session list by @yomybaby in [#3093](https://github.com/lablup/backend.ai-webui/pull/3093)
- FR-368: Update folder list immediately after creating a new folder by @agatha197 in [#3053](https://github.com/lablup/backend.ai-webui/pull/3053)
- FR-250: Show session idle checker in session detail panel by @ironAiken2 in [#3061](https://github.com/lablup/backend.ai-webui/pull/3061)
- FR-444: Add kernel list into session detail drawer by @ironAiken2 in [#3081](https://github.com/lablup/backend.ai-webui/pull/3081)
- FR-408: Add soft timeout feature to `NetworkStatusBanner` by @yomybaby in [#3107](https://github.com/lablup/backend.ai-webui/pull/3107)
- FR-465: Add prop to enable NEO style in `BAITable` by @yomybaby in [#3104](https://github.com/lablup/backend.ai-webui/pull/3104)
- FR-9: Autoscaling feature UI in model service creation/modification panel by @lizable in [#3024](https://github.com/lablup/backend.ai-webui/pull/3024)

### Bug Fixes
- FR-423: Unknown image error in Image list's control modal by @yomybaby in [#3064](https://github.com/lablup/backend.ai-webui/pull/3064)  
- FR-441: Unexpected disabled download button by @yomybaby in [#3069](https://github.com/lablup/backend.ai-webui/pull/3069)
- FR-453: UserDropdownMenu isn't opening by @yomybaby in [#3085](https://github.com/lablup/backend.ai-webui/pull/3085)
- FR-439: Silent error in interactive-login by @agatha197 in [#3088](https://github.com/lablup/backend.ai-webui/pull/3088)
- FR-458: Set session detail panel version compatibility by @ironAiken2 in [#3097](https://github.com/lablup/backend.ai-webui/pull/3097)
- FR-470: Unable to access service update page by @yomybaby in [#3112](https://github.com/lablup/backend.ai-webui/pull/3112)
- FR-472: Empty resource preset in service launcher by @yomybaby in [#3113](https://github.com/lablup/backend.ai-webui/pull/3113)
- FR-480: Backward version compatibility for Endpoint Autoscaling Rules by @yomybaby in [#3116](https://github.com/lablup/backend.ai-webui/pull/3116)

### Refactoring
- FR-460: Handle undefined value as controlled value in `BAIPropertyFilter` by @yomybaby in [#2999](https://github.com/lablup/backend.ai-webui/pull/2999)

### Miscellaneous
- FR-29: Upgrade to React 19 stable by @yomybaby in [#2926](https://github.com/lablup/backend.ai-webui/pull/2926)
- FR-473: Missing i18n update and remove table token value by @agatha197 in [#3111](https://github.com/lablup/backend.ai-webui/pull/3111)

### Documentation
- Improvement on Korean i18n by @YEONFEEL96 in [#3108](https://github.com/lablup/backend.ai-webui/pull/3108)

### New Contributors
- @YEONFEEL96 made their first contribution in [#3108](https://github.com/lablup/backend.ai-webui/pull/3108)

**Full Changelog**: [v25.1.1...v25.2.0](https://github.com/lablup/backend.ai-webui/compare/v25.1.1...v25.2.0)

---

## v25.1.1 (17/01/2025)

* refactor(FR-372): support id based object resolution by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/3040
* fix(FR-382, FR-384): Handle deprecated image name fields in service launcher and image download by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/3042


**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v25.1.0...v25.1.1

---

## v25.1.0 (15/01/2025)

### Features
- (FR-52) Session usage monitor in react by @ironAiken2 in [#2814](https://github.com/lablup/backend.ai-webui/pull/2814)
- (FR-22) handle image and text attachments in chat modal by @agatha197 in [#2993](https://github.com/lablup/backend.ai-webui/pull/2993)
- (FR-22) provide token-related information by @agatha197 in [#2995](https://github.com/lablup/backend.ai-webui/pull/2995)
- (FR-316) introduce `useTokenCount` using `gpt-tokenizer` by @yomybaby in [#2998](https://github.com/lablup/backend.ai-webui/pull/2998)
- (FR-344) auto screenshot with Playwright by @agatha197 in [#3011](https://github.com/lablup/backend.ai-webui/pull/3011)
- (FR-246) add container commit in the Session Detail Panel by @ironAiken2 in [#3012](https://github.com/lablup/backend.ai-webui/pull/3012)
- (FR-17) update `desired_session_count` field name to `replicas` by @ironAiken2 in [#2963](https://github.com/lablup/backend.ai-webui/pull/2963)
- (FR-244) session renaming in the session detail panel by @yomybaby in [#3034](https://github.com/lablup/backend.ai-webui/pull/3034)

### Fixes
- (FR-7) neo session launcher reset function behavior by @ironAiken2 in [#3002](https://github.com/lablup/backend.ai-webui/pull/3002)
- (FR-341) Page Error on Accessing Agent Summary with a Regular User Account by @agatha197 in [#3004](https://github.com/lablup/backend.ai-webui/pull/3004)
- (FR-240) show vfolder types in folder create modal based on user permission by @ironAiken2 in [#2992](https://github.com/lablup/backend.ai-webui/pull/2992)
- (FR-356) remove `enableLinks` to prevent logs from disappearing in the container log by @agatha197 in [#3016](https://github.com/lablup/backend.ai-webui/pull/3016)
- (FR-5) Set accelerator value to 0 when no accelerator available by @yomybaby in [#3027](https://github.com/lablup/backend.ai-webui/pull/3027)
- (FR-366) remove unnecessary panel disabling via querySelector at vfolder invitation panel in summary view page by @lizable in [#3029](https://github.com/lablup/backend.ai-webui/pull/3029)

### Refactoring
- replace ChatInput with antdx component by @agatha197 in [#2972](https://github.com/lablup/backend.ai-webui/pull/2972)
- (FR-42) modify i18n translation json to conform to conventions by @ironAiken2 in [#2994](https://github.com/lablup/backend.ai-webui/pull/2994)
- (FR-343) migrate maintenance page to react by using SettingList by @nowgnuesLee in [#3009](https://github.com/lablup/backend.ai-webui/pull/3009)

### Chores / Updates
- chores(FR-342): Add ESLint Configuration for JSON Schema Validation by @yomybaby in [#3008](https://github.com/lablup/backend.ai-webui/pull/3008)
- update: Bump copyright year by @inureyes in [#3020](https://github.com/lablup/backend.ai-webui/pull/3020)
- chore: Update PR template to remind mentioning both GitHub/Jira issues by @yomybaby in [#3028](https://github.com/lablup/backend.ai-webui/pull/3028)

### New Contributors
- @nowgnuesLee made their first contribution in [#3009](https://github.com/lablup/backend.ai-webui/pull/3009)

**Full Changelog**: [v24.12.0...v25.1.0](https://github.com/lablup/backend.ai-webui/compare/v24.12.0...v25.1.0)

---

## v24.12.0 (26/12/2024)

### Features
- strict selection mode of BAIPropertyFilter by @yomybaby in [#2931](https://github.com/lablup/backend.ai-webui/pull/2931)
- migrate `/credentials` page to react component by @ironAiken2 in [#2757](https://github.com/lablup/backend.ai-webui/pull/2757)
- user list using `user_nodes` query by @yomybaby in [#2934](https://github.com/lablup/backend.ai-webui/pull/2934)
- support for extra field in registry type by @ironAiken2 in [#2927](https://github.com/lablup/backend.ai-webui/pull/2927)
- migrate user credential list to react component by @ironAiken2 in [#2758](https://github.com/lablup/backend.ai-webui/pull/2758)
- keypair info/setting modal in credential page by @ironAiken2 in [#2940](https://github.com/lablup/backend.ai-webui/pull/2940)
- remove legacy user/credential components by @ironAiken2 in [#2755](https://github.com/lablup/backend.ai-webui/pull/2755)
- Set the initial value of the chat modal to the recently created token by @agatha197 in [#2864](https://github.com/lablup/backend.ai-webui/pull/2864)
- Add `CREATING` session status by @fregataa in [#2849](https://github.com/lablup/backend.ai-webui/pull/2849)

### Fixes
- use combine operator `&` and `|` by @yomybaby in [#2938](https://github.com/lablup/backend.ai-webui/pull/2938)
- Resolve node module macos-alias installation on non-macOS platforms by @studioego in [#2942](https://github.com/lablup/backend.ai-webui/pull/2942)
- enhance resource group name validation logic for spaces and special characters by @ironAiken2 in [#2916](https://github.com/lablup/backend.ai-webui/pull/2916)
- Update resource acquisition notation elements by @agatha197 in [#2945](https://github.com/lablup/backend.ai-webui/pull/2945)
- auto-update inconsistency in ResourceAllocationFormItems by @yomybaby in [#2970](https://github.com/lablup/backend.ai-webui/pull/2970)
- switch to managing hiddenColumnKeys in TableColumnsSettingModal by @agatha197 in [#2888](https://github.com/lablup/backend.ai-webui/pull/2888)
- `sudo_session_enable` setting doesn't work by @agatha197 in [#2965](https://github.com/lablup/backend.ai-webui/pull/2965)
- lint error by @yomybaby in [#2986](https://github.com/lablup/backend.ai-webui/pull/2986)
- resetting the navigate route and modifying the CSS in summary page by @ironAiken2 in [#2990](https://github.com/lablup/backend.ai-webui/pull/2990)
- set `Max Network Count` field to project resource policy by @ironAiken2 in [#2989](https://github.com/lablup/backend.ai-webui/pull/2989)

### Refactoring
- Session log modal transition handling by @yomybaby in [#2943](https://github.com/lablup/backend.ai-webui/pull/2943)
- preview step of SessionLauncher into a separate component by @yomybaby in [#2980](https://github.com/lablup/backend.ai-webui/pull/2980)

### Style
- Add flex-wrap and tag resource group text for improved readability by @agatha197 in [#2954](https://github.com/lablup/backend.ai-webui/pull/2954)

### Chores
- replace title of desktop app download to be more comprehensive by @lizable in [#2922](https://github.com/lablup/backend.ai-webui/pull/2922)
- remove unused component files by @yomybaby in [#2923](https://github.com/lablup/backend.ai-webui/pull/2923)
- update NVIDIA references in image metadata by @rapsealk in [#2971](https://github.com/lablup/backend.ai-webui/pull/2971)

### Update
- pnpm-lock file to apply properly by @lizable in [#2960](https://github.com/lablup/backend.ai-webui/pull/2960)

**Full Changelog**: [v24.09.3...v24.12.0](https://github.com/lablup/backend.ai-webui/compare/v24.09.3...v24.12.0)

---

## v24.09.3 (05/12/2024)

* fix: disabled accelerator select when no GPUs are allowed by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2909
* fix: Add missing container registry types by @jopemachine in https://github.com/lablup/backend.ai-webui/pull/2913
* fix: add 5s delay when session expiration datetime is over by @lizable in https://github.com/lablup/backend.ai-webui/pull/2910
* fix:  Resource group change does not update related data in form by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2912
* feat: Add error view for expired login session by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2917
* fix: allow cmd/ctrl click to open link in new tab by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2919
* fix: enable and remove auto-setting for project name field by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2920


**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v24.09.2+post.0...v24.09.3

---

## v24.09.2+post.0 (29/11/2024)

* fix: compare time is expired by using `asSeconds()` instead of `seconds()` by @lizable in https://github.com/lablup/backend.ai-webui/pull/2900


**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v24.09.2...v24.09.2+post.0

---

## v24.09.2 (29/11/2024)

* fix: notification badge theme color by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2898
* refactor: remove `src/pipeline/lib` because of replaced by fasttrack by @lizable in https://github.com/lablup/backend.ai-webui/pull/2871


**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v24.09.1+post.1...v24.09.2

---

## v24.09.1+post.1 (28/11/2024)

* fix: Convert network live stats to decimal size units. by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2889
* style: set `popupMatchSelectWidth` to false of `ProjectSelect` by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2892


**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v24.09.1+post.0...v24.09.1+post.1

---

## v24.09.1+post.0 (27/11/2024)

### Features
- Session detail panel basic layout by @yomybaby in [#2775](https://github.com/lablup/backend.ai-webui/pull/2775)
- NEO session log modal by @yomybaby in [#2793](https://github.com/lablup/backend.ai-webui/pull/2793)
- Use NEO session log modal in session list by @yomybaby in [#2804](https://github.com/lablup/backend.ai-webui/pull/2804)
- New image parsing on Environment page by @agatha197 in [#2785](https://github.com/lablup/backend.ai-webui/pull/2785)
- Replace name with namespace by @agatha197 in [#2787](https://github.com/lablup/backend.ai-webui/pull/2787)
- Add table column setting to Environments page by @agatha197 in [#2789](https://github.com/lablup/backend.ai-webui/pull/2789)
- Add `AliasedImageDoubleTags` by @agatha197 in [#2796](https://github.com/lablup/backend.ai-webui/pull/2796)
- Migrate create user modal into react component by @ironAiken2 in [#2754](https://github.com/lablup/backend.ai-webui/pull/2754)
- `useMemoWithPrevious` React hook by @yomybaby in [#2820](https://github.com/lablup/backend.ai-webui/pull/2820)
- AgentSelect when hideAgent configuration is disabled by @lizable in [#2599](https://github.com/lablup/backend.ai-webui/pull/2599)
- Display kernel node id and idx in Kernel select component by @yomybaby in [#2832](https://github.com/lablup/backend.ai-webui/pull/2832)
- Make image lists resizable by @agatha197 in [#2823](https://github.com/lablup/backend.ai-webui/pull/2823)
- Support new status `PREPARED` of session and kernel by @fregataa in [#2848](https://github.com/lablup/backend.ai-webui/pull/2848)
- Add batch job timeout duration by @agatha197 in [#2824](https://github.com/lablup/backend.ai-webui/pull/2824)
- Main layout NEO header by @yomybaby in [#2844](https://github.com/lablup/backend.ai-webui/pull/2844)
- WebUILink and WebUINavigate component by @yomybaby in [#2846](https://github.com/lablup/backend.ai-webui/pull/2846)
- User can open a session detail panel in notifications by @yomybaby in [#2858](https://github.com/lablup/backend.ai-webui/pull/2858)
- Global breadcrumb by @yomybaby in [#2847](https://github.com/lablup/backend.ai-webui/pull/2847)
- Main Layout NEO sider by @yomybaby in [#2850](https://github.com/lablup/backend.ai-webui/pull/2850)
- NEO sider's toggle button and refactoring by @yomybaby in [#2853](https://github.com/lablup/backend.ai-webui/pull/2853)
- Delete legacy agent summary files by @agatha197 in [#2883](https://github.com/lablup/backend.ai-webui/pull/2883)
- Hide sFTP upload agents from agent summary page by @agatha197 in [#2884](https://github.com/lablup/backend.ai-webui/pull/2884)

### Fixes
- Used slot calculation in resource broker when hideAgents is false by @ironAiken2 in [#2790](https://github.com/lablup/backend.ai-webui/pull/2790)
- Display Gaudi 2 util in session list by @yomybaby in [#2791](https://github.com/lablup/backend.ai-webui/pull/2791)
- Handle Undefined onResize in BAITable component by @ironAiken2 in [#2799](https://github.com/lablup/backend.ai-webui/pull/2799)
- Show memory usage for each device in session list by @ironAiken2 in [#2802](https://github.com/lablup/backend.ai-webui/pull/2802)
- Missed i18n by @agatha197 in [#2827](https://github.com/lablup/backend.ai-webui/pull/2827)
- Increase request timeout by @agatha197 in [#2826](https://github.com/lablup/backend.ai-webui/pull/2826)
- Resizing column action causes order change in BAITable by @yomybaby in [#2831](https://github.com/lablup/backend.ai-webui/pull/2831)
- Resolve empty value display in `DoubleTag` and update `BAIIntervalView` by @agatha197 in [#2813](https://github.com/lablup/backend.ai-webui/pull/2813)
- Session list fetch failure due to missing version condition for `PREPARED` by @yomybaby in [#2854](https://github.com/lablup/backend.ai-webui/pull/2854)
- Improve clipboard handling with optional chaining by @agatha197 in [#2842](https://github.com/lablup/backend.ai-webui/pull/2842)
- Invalid environment name parsing by @agatha197 in [#2860](https://github.com/lablup/backend.ai-webui/pull/2860)
- Use `||` operator instead of unreachable `??` by @agatha197 in [#2845](https://github.com/lablup/backend.ai-webui/pull/2845)
- Add the missing session `type` argument to the SFTP session creation API by @jopemachine in [#2869](https://github.com/lablup/backend.ai-webui/pull/2869)
- Password is removed from DB if registry is modified without checking the change password option by @agatha197 in [#2875](https://github.com/lablup/backend.ai-webui/pull/2875)
- Smooth transition for Container Registry enable switch by @yomybaby in [#2881](https://github.com/lablup/backend.ai-webui/pull/2881)
- Session visibility in detail panel for < v24.12.0 manager by @yomybaby in [#2887](https://github.com/lablup/backend.ai-webui/pull/2887)

### Refactoring
- `MyEnvironmentPage` into two components by @agatha197 in [#2794](https://github.com/lablup/backend.ai-webui/pull/2794)
- New image parsing on `CustomizedImageList` by @agatha197 in [#2795](https://github.com/lablup/backend.ai-webui/pull/2795)
- Improve image filter of `ImageList` by @agatha197 in [#2805](https://github.com/lablup/backend.ai-webui/pull/2805)
- Session launcher image parsing by @agatha197 in [#2800](https://github.com/lablup/backend.ai-webui/pull/2800)
- Use `filterEmptyItem` for table columns to improve readability by @agatha197 in [#2815](https://github.com/lablup/backend.ai-webui/pull/2815)
- Improve error handling of `CustomizedImageList` by @agatha197 in [#2792](https://github.com/lablup/backend.ai-webui/pull/2792)
- Add more tagReplace patterns by @agatha197 in [#2816](https://github.com/lablup/backend.ai-webui/pull/2816)
- Parsing image data for versions before 24.12 by @agatha197 in [#2817](https://github.com/lablup/backend.ai-webui/pull/2817)
- Parsing image data in session launcher for before 24.12 by @agatha197 in [#2818](https://github.com/lablup/backend.ai-webui/pull/2818)
- Size unit convert functions by @yomybaby in [#2859](https://github.com/lablup/backend.ai-webui/pull/2859)
- New agent summary page by @agatha197 in [#2882](https://github.com/lablup/backend.ai-webui/pull/2882)

### Testing
- Add `getImageFullName` tests by @agatha197 in [#2810](https://github.com/lablup/backend.ai-webui/pull/2810)
- Add image util functions test by @agatha197 in [#2821](https://github.com/lablup/backend.ai-webui/pull/2821)

### Chores
- NVIDIA icon and component by @yomybaby in [#2863](https://github.com/lablup/backend.ai-webui/pull/2863)
- Use `pnpm patch` in `/react` instead of `patch-package` by @yomybaby in [#2661](https://github.com/lablup/backend.ai-webui/pull/2661)
- Suppress Relay warning messages in development mode by @yomybaby in [#2852](https://github.com/lablup/backend.ai-webui/pull/2852)
- Upgrade node modules in `/react` and improve type definitions by @yomybaby in [#2873](https://github.com/lablup/backend.ai-webui/pull/2873)

### End-to-End Testing
- Set timeout to session e2e by @yomybaby in [#2782](https://github.com/lablup/backend.ai-webui/pull/2782)
- Fix broken tests due to NEO mainlayout, Agent select and Image parsing by @yomybaby in [#2851](https://github.com/lablup/backend.ai-webui/pull/2851)

### New Contributors
- @jopemachine made their first contribution in [#2869](https://github.com/lablup/backend.ai-webui/pull/2869)

**Full Changelog**: [v24.09.1...v24.09.1+post.0](https://github.com/lablup/backend.ai-webui/compare/v24.09.1...v24.09.1+post.0)

---

## v24.09.1 (28/10/2024)

### Features
* move architecture column in session list to the very end by @agatha197 in [PR #2735](https://github.com/lablup/backend.ai-webui/pull/2735)
* add BAIPropertyFilter to Endpoint list by @yomybaby in [PR #2689](https://github.com/lablup/backend.ai-webui/pull/2689)
* refetch endpoint's models by @yomybaby in [PR #2747](https://github.com/lablup/backend.ai-webui/pull/2747)
* search image with full name in Environment page by @agatha197 in [PR #2744](https://github.com/lablup/backend.ai-webui/pull/2744)
* move to detail page after modifying model service by @agatha197 in [PR #2724](https://github.com/lablup/backend.ai-webui/pull/2724)
* disable LLM Chat button based on endpoint status by @ironAiken2 in [PR #2750](https://github.com/lablup/backend.ai-webui/pull/2750)
* name-based query search feature on `EndpointSelect` by @ironAiken2 in [PR #2743](https://github.com/lablup/backend.ai-webui/pull/2743)
* user resource policy allocation in user setting modal by @ironAiken2 in [PR #2749](https://github.com/lablup/backend.ai-webui/pull/2749)
* add a space between Environments and Version by @agatha197 in [PR #2737](https://github.com/lablup/backend.ai-webui/pull/2737)
* Introduce `resizable table` component by @ironAiken2 in [PR #2606](https://github.com/lablup/backend.ai-webui/pull/2606)
* resizable columns without specifying width by @yomybaby in [PR #2748](https://github.com/lablup/backend.ai-webui/pull/2748)
* fetch container registries with new nodes query by @agatha197 in [PR #2746](https://github.com/lablup/backend.ai-webui/pull/2746)
* add `TableColumnSettingModal` to `ContainerRegistryList` by @agatha197 in [PR #2752](https://github.com/lablup/backend.ai-webui/pull/2752)
* recent session history by @yomybaby in [PR #2742](https://github.com/lablup/backend.ai-webui/pull/2742)
* display all projects in project quota setting page by @agatha197 in [PR #2759](https://github.com/lablup/backend.ai-webui/pull/2759)
* add session name copy button by @agatha197 in [PR #2736](https://github.com/lablup/backend.ai-webui/pull/2736)
* create folder in the vfolder form item by @yomybaby in [PR #2765](https://github.com/lablup/backend.ai-webui/pull/2765)
* open vFolder in vFolder form item by @yomybaby in [PR #2766](https://github.com/lablup/backend.ai-webui/pull/2766)
* add support for Furiosa RNGD accelerator by @rapsealk in [PR #2776](https://github.com/lablup/backend.ai-webui/pull/2776)

### Fixes
* replace `skip` with `skipOnClient` to avoid runtime errors by @agatha197 in [PR #2751](https://github.com/lablup/backend.ai-webui/pull/2751)
* Fix for container registry form entry validation rules in version earlier 24.09.0 by @ironAiken2 in [PR #2764](https://github.com/lablup/backend.ai-webui/pull/2764)
* hide "compare with other models" in LLM Playground by @yomybaby in [PR #2762](https://github.com/lablup/backend.ai-webui/pull/2762)
* 0 desired routing count in endpoint edit page by @yomybaby in [PR #2768](https://github.com/lablup/backend.ai-webui/pull/2768)
* handle current resource group using initial values in launchers by @yomybaby in [PR #2774](https://github.com/lablup/backend.ai-webui/pull/2774)
* remove period from service name pattern validation by @agatha197 in [PR #2773](https://github.com/lablup/backend.ai-webui/pull/2773)
* container registry password cannot be set when creating by @agatha197 in [PR #2778](https://github.com/lablup/backend.ai-webui/pull/2778)
* hide divider in LLMChatCard by @ironAiken2 in [PR #2771](https://github.com/lablup/backend.ai-webui/pull/2771)

### Refactors
* folder creation modal by @ironAiken2 in [PR #2745](https://github.com/lablup/backend.ai-webui/pull/2745)
* useEventNotStable type by @yomybaby in [PR #2741](https://github.com/lablup/backend.ai-webui/pull/2741)
* move useRecentSessionHistory to a separate file by @yomybaby in [PR #2763](https://github.com/lablup/backend.ai-webui/pull/2763)

### Tests
* e2e test for user page by @ironAiken2 in [PR #2722](https://github.com/lablup/backend.ai-webui/pull/2722)
* refactor test code due to changes in the folder creation modal by @ironAiken2 in [PR #2767](https://github.com/lablup/backend.ai-webui/pull/2767)

### Styles
* improve install image list by @agatha197 in [PR #2777](https://github.com/lablup/backend.ai-webui/pull/2777)


**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v24.09.0...v24.09.1

---

## v24.09.0+post.1 (24/10/2024)

* feat: create folder in the vfolder form item by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2765
* feat: open vFolder in vFolder form item by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2766
* fix: 0 desired routing count in endpoint edit page by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2768
* test: refactor test code due to changes in the folder creation modal by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2767
* fix: handle current resource group using initial values in launchers by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2774


**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v24.09.0+post.0...v24.09.0+post.1

---

## v24.09.0+post.0 (21/10/2024)

> [!NOTE] 
> This release is the post version of [v24.09.0](https://github.com/lablup/backend.ai-webui/releases/tag/v24.09.0). This release note includes changes between [v24.09.0](https://github.com/lablup/backend.ai-webui/releases/tag/v24.09.0) and 24.09.0+post.0 only.

* feat: move architecture column in session list to the very end by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2735
* feat: add BAIPropertyFilter to Endpoint list by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2689
* feat: refetch endpoint's models by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2747
* feat: search image with full name in Environment page by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2744
* feat: move to detail page after modifying model service by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2724
* test: e2e test for user page by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2722
* feat: disable LLM Chat button based on endpoint status by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2750
* feat: name-based query search feature on `EndpointSelect` by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2743
* refactor: folder creation modal by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2745
* feat: user resource policy allocation in user setting modal by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2749
* misc: add a space between Environments and Version by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2737
* feat: Introduce `resizable table` component by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2606
* feat: resizable columns without specifying width by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2748
* fix: replace `skip` with `skipOnClient` to avoid runtime errors by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2751
* feat: fetch container registries with new nodes query by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2746
* feat: add `TableColumnSettingModal` to `ContainerRegistryList` by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2752
* refactor: useEventNotStable type by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2741
* feat: recent session history by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2742
* feat: display all projects in project quota setting page. by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2759
* feat: add session name copy button by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2736
* fix: set autoSelectType to `usage` in FolderCreateModal by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2761
* refactor: move useRecentSessionHistory to a separate file by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2763
* fix: hide "compare with other models" in LLM Playground by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2762
* fix: Fix for container registry form entry validation rules in version earlier 24.09.0 by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2764


**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v24.09.0...v24.09.0+post.0

---

## v24.09.0 (04/10/2024)

* i18n: update korean translation for 'CreateNotebookButton' by @rapsealk in https://github.com/lablup/backend.ai-webui/pull/2703
* fix: use antd color token for invalid mwc-textfield theme by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2704
* Add an 'Import from hugging face' modal by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2514
* feat: add `enableImportFromHuggingFace` option by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2709
* test: e2e test for parsing config.toml and modifying by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2705
* feat: fetch the Hugging Face info using a URL by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2710
* feat: Improve form item and switch to README preview on validation check by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2715
* feat: compare with other models by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2712
* fix: display only active endpoints in EndpointSelect by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2718
* feat: import from HuggingFace and show result with modal by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2717
* add: warning when maximum resources to allocate is not enough to the minimum required resources in selected image by @lizable in https://github.com/lablup/backend.ai-webui/pull/2700
* feat: add copy button for full image name in session launcher and environments page by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2708
* fix: add scroll to the lablup-activity-panel by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2711
* fix: Consider folder state for vfolder invitations by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2667
* fix: separate CUDA FGPU slots from ROCM GPU slots by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2706
* fix: session launcher validation logic when max_concurrent_sessions is set to 0 (unlimited) by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2720
* refactor: move const vaiables to `const-vars.ts` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2728
* refactor: `KeypairResourcePolicySettingModal` update to support policy settings for all available accelerators. by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2654
* refactor: resource preset page by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2656
* fix: Fixed the maximum desired number of sessions value in the Model Launcher modal to follow `max_session_count_per_model_session` by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2726
* fix: ensure valid accelerator type by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2729
* fix: value handling of DynamicUnitInputNumberWithSlider by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2730
* feat: change redirect path of `VfolderLazyView` to current page by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2731
* Improve Vietnamese translation by @nghiahsgs in https://github.com/lablup/backend.ai-webui/pull/2716
* feat: Session owner setting panel in Neo session launcher by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2693
* feat: User setting for the classic session launcher by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2733
* feat: add sensitive env var clearing and e2e tests for session launcher by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2701
* fix: use `id` as a key of Image by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2702
* fix: set max shared memory to 7.999PiB in ResourcePresetSettingModal by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2732

### New Contributors
* @nghiahsgs made their first contribution in https://github.com/lablup/backend.ai-webui/pull/2716

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v24.03.10...v24.09.0

---

## v24.03.10 (10/09/2024)

* feat: migrate image list  by @gahyuun in https://github.com/lablup/backend.ai-webui/pull/2615
* fix: `pnpm install` does not use `/react/.npmrc`. by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2648
* fix: checkboxes in the webui session list are unchecked on auto-refresh, or clicks are not scoped by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2660
* chore: add test code for `getImageMeta` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2663
* feature: set `architecture` as a second-order field in Image Select by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2666
* ui: wrap AgentList with Suspense by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2664
* fix: enable a session log button when `PREPARING` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2669
* fix: apply decimal place rounding to session usage by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2662
* chore: clean up files and update README.md by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2671
* e2e: test NEO session launcher and imageList  by @gahyuun in https://github.com/lablup/backend.ai-webui/pull/2665
* e2e: vfolder invitation by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2658
* fix: useBackendAIImageMetaData test code related to `waitFor` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2674
* add: login session extension feature with UI button by @lizable in https://github.com/lablup/backend.ai-webui/pull/2551
* refactor: login session extension by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2676
* Fix: Resource Number displays an infinity symbol unexpectedly by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2680
* feat: add support for Gaudi 2 Accelerator by @kyujin-cho in https://github.com/lablup/backend.ai-webui/pull/2623
* fix: missing load the `maxGaudi2DevicesPerContainer` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2681
* fix: Remove unused device `gaudi.device` by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2682
* fix: Change resource display basis from Ratio to current amount by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2686
* chore: remove unused backend-ai-agent-list by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2683
* feat: show confirm modal instead of popconfirm when deleting endpoint by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2678
* feat: add endpoint status filtering by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2685
* pagination and filter with deferred values by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2688
* refactor: centralize resource slot type definitions and improve device metadata handling in `/react` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2684
* refactor: percent calcuation and typescript deifinition in agent list by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2690
* fix: modification of "model service's resource" by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2687
* fix: compatibility for lifecycle filter of Endpoint by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2691
* test: add more edge cases of `iSizeToSize` and `parseUnit` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2679
* fix: disable edit button based on endpoint status by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2695
* feat: add max validation rule for CPU and memory in Form.Item. by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2692
* fix: merged resource limit is affected by remaining in the resource group. by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2696
* fix: remove duplicated `form.getFieldValue` in `ensureValidAcceleratorType` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2698
* add: convert showing all environment images including uninstalled ones by config by @lizable in https://github.com/lablup/backend.ai-webui/pull/2697
* fix: object merging with mutation in VFolderTable, hooks, and SessionLauncherPage by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2699


**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v24.03.9...v24.03.10

---

## v24.03.9+post.3 (04/09/2024)

* feat: migrate image list  by @gahyuun in https://github.com/lablup/backend.ai-webui/pull/2615
* fix: `pnpm install` does not use `/react/.npmrc`. by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2648
* fix: checkboxes in the webui session list are unchecked on auto-refresh, or clicks are not scoped by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2660
* chore: add test code for `getImageMeta` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2663
* feature: set `architecture` as a second-order field in Image Select by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2666
* ui: wrap AgentList with Suspense by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2664
* fix: enable a session log button when `PREPARING` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2669
* fix: apply decimal place rounding to session usage by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2662
* fix: Change resource display basis from Ratio to current amount by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2686
* fix: Resource Number displays an infinity symbol unexpectedly by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2680


**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v24.03.9...v24.03.9+post.3

---

## v24.03.9+post.2 (03/09/2024)

* feat: migrate image list  by @gahyuun in https://github.com/lablup/backend.ai-webui/pull/2615
* fix: `pnpm install` does not use `/react/.npmrc`. by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2648
* fix: checkboxes in the webui session list are unchecked on auto-refresh, or clicks are not scoped by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2660
* chore: add test code for `getImageMeta` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2663
* feature: set `architecture` as a second-order field in Image Select by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2666
* ui: wrap AgentList with Suspense by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2664
* fix: enable a session log button when `PREPARING` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2669
* fix: apply decimal place rounding to session usage by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2662


**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v24.03.9...v24.03.9+post.2

---

## v24.03.9 (23/08/2024)

### Features
* add property for calculating resource without per container option by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2592
* BAIProperty filter supports `boolean` type by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2603
* persist current Tab on the Environment page using search param by @gahyuun in https://github.com/lablup/backend.ai-webui/pull/2587
* update packages by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2611
* add `enableLLMPlayground` config by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2620
* Folder Explorer as an independent component by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2529
* Folder Explorer in any page by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2622
* setup Playwright e2e test including vFolder create/delete test by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2647

### Fixes
* eunsure valid acceleartorType in Session Launcher by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2628
* overlapping vscode desktop passwords. by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2625
* unitended `only` condition of graphql transformer test code by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2629
* vaadin table in `backend-ai-folder-explorer` does not output some content when there is scrolling by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2627
* Wrong device name for Rebellions ATOM+ by @rapsealk in https://github.com/lablup/backend.ai-webui/pull/2631
* unnecessary POST request in SSH keypair generation modal by @gahyuun in https://github.com/lablup/backend.ai-webui/pull/2643
* vfolder share button has disappeared by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2646
* cannot search agents in session list by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2635
* "Cannot update an unmounted root" error of `react-to-webcomponent` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2641
* incorrect agent utilization stats by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2636
* change query param update type in folder explorer to 'replaceIn' by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2655
* Unable to revoke shared folder permission and refactor the modify permissions modal. by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2644
* the conditions of allocatablePresetNames by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2652
* Windows architecture mismatch issue when downloading the app. by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2649
* modify the locale of reservation time to the language of Backend.AI by @gahyuun in https://github.com/lablup/backend.ai-webui/pull/2659

### Updates
* update react-query by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2591
* CSpell configuration based on Backend.AI Writing Rules by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2633

### Additions
* Thai language support by @inureyes in https://github.com/lablup/backend.ai-webui/pull/2634
* requested_slots usage for resource display when occupied_slots are empty by @lizable in https://github.com/lablup/backend.ai-webui/pull/2640

### Refactor
* the CSV utility function and add test code by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2638

### Style Updates
* update `BAIPropertyFilter` label and fix overlapped clear icon by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2624
* remove bottom margin of model store error message by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2653


**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v24.03.8...v24.03.9

---

## v24.03.8 (08/08/2024)

### Fixes
- fix: display only callback url's origin to interactive login page by @rapsealk in https://github.com/lablup/backend.ai-webui/pull/2550
- fix: modify runtime variant by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2542
- fix: hide resource slots form items when `allowCustomResourceAllocation` is false by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2557
- fix: agent pagination does not work by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2556
- fix: backward compatibility for extra mounts of a service by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2559
- fix: eslint error of Chat UI components by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2563
- fix: `VFolderSelect` component search feature by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2571
- fix: too many interval network request by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2576
- fix: resource icon and unit are not displayed on KeypairResourcePolicyList by @gahyuun in https://github.com/lablup/backend.ai-webui/pull/2566
- fix: typo error by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2593
- fix: add missing checkbox PR in session list page by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2600
- fix: set notification's description field to empty string by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2601
- fix: use starts_at instead of created_at for session reservation & elapsed time by @gahyuun in https://github.com/lablup/backend.ai-webui/pull/2584
- fix: Maintain consistency in the data of the agent resource by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2605
- fix: apply decimal place rounding by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2518
- fix: initialize detail text after the notification is shown by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2608
- fix: blank `/change-password` page by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2596
- fix: missed prefix function usage in resource panel by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2612
- fix: TOUR error when HTML elements are missing by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2614
- fix: Login modal is disappeared in Electron env by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2617
- fix: batch session schedule date picker in the Classic session launcher by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2618

### Features
- feat: use pnpm instead of npm by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2515
- feat: Improve model card layout and add descriptions to the model store list by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2543
- feat: Chat UI Modal for Model service by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2553
- feat: Add feature to reset chat and set non-LLM models to custom by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2554
- feat: resource preset in Service Launcher by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2562
- feat: Introduce react elapsed time renderer by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2578
- feat: new chatting page by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2560
- feat: synchronized chatting by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2567
- feat: remove password validation for superadmin by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2561
- feat: add a checkbox to select all items in session list by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2519
- feat: re-render once when `backend-ai-page` is inactive by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2581
- feat: copyable i18n key for debug mode by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2595
- feat: introduce `useControllableState` by @gahyuun in https://github.com/lablup/backend.ai-webui/pull/2572
- feat: introduce `useSuspenseQuery` with support for `fetchKey`. by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2590
- feat: introduce exporting CSV module by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2513
- feat: improve wsproxy address validation by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2602
- feat: Individual `error_msg` for cards to prevent total list fetch disruption by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2583
- feat: add confirm dialog before moving to trash bin tab by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2610
- feat: rename 'Sync' to 'Sync input' by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2619
- feat: Disable the time before the current HH:MM:SS for today's date by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2621

### Refactors
- refactor: EndpointSelect by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2565
- refactor: error feedback UX by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2548
- refactor: replace REST method from  to  function when download from session info by @lizable in https://github.com/lablup/backend.ai-webui/pull/2609

### Styles
- style: use token value for border colors by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2579
- style: change `EndpointLLMChatCard` close button color by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2613

### CI Changes
- ci: add Frontend Daily Board project automatically by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2585
- ci: update `add-to-project` github action to add PRs to project by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2594

### New Contributors
* @gahyuun made their first contribution in https://github.com/lablup/backend.ai-webui/pull/2566

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v24.03.7...v24.03.8

---

## v24.03.7 (11/07/2024)

### Features
- vFolder Explorer permalink [#2476](https://github.com/lablup/backend.ai-webui/pull/2476)
- Apply Cloudscape's `Board Component` to Summary Page [#2343](https://github.com/lablup/backend.ai-webui/pull/2343)
- Adjust fetch timeout to 15s for improved UX [#2490](https://github.com/lablup/backend.ai-webui/pull/2490)
- Adjust fetch timeout to 15s for improved user experience (client-esm) [#2491](https://github.com/lablup/backend.ai-webui/pull/2491)
- Memorize board's items using local storage in SummaryPage [#2441](https://github.com/lablup/backend.ai-webui/pull/2441)
- Disable customization of board items in BAIBoard component [#2446](https://github.com/lablup/backend.ai-webui/pull/2446)
- Preserve selected tab in vFolder list page [#2495](https://github.com/lablup/backend.ai-webui/pull/2495)
- Display "Not connected" alert banner in React [#2492](https://github.com/lablup/backend.ai-webui/pull/2492)
- Background task notification for cloning a model folder [#2494](https://github.com/lablup/backend.ai-webui/pull/2494)
- Add link to open a cloned folder in notification [#2497](https://github.com/lablup/backend.ai-webui/pull/2497)
- Support Atom Plus devices [#2504](https://github.com/lablup/backend.ai-webui/pull/2504)
- Support port range type in `PortSelectFormItem` [#2506](https://github.com/lablup/backend.ai-webui/pull/2506)
- Interactive Login for SSO [#2415](https://github.com/lablup/backend.ai-webui/pull/2415)
- Prevent stacking of duplicate notifications [#2502](https://github.com/lablup/backend.ai-webui/pull/2502)
- Add support for `runtime_variant` parameter [#2472](https://github.com/lablup/backend.ai-webui/pull/2472)
- Lucide icon with custom SVGs [#2458](https://github.com/lablup/backend.ai-webui/pull/2458)
- Add `model` query param to start the service with folder mounting [#2520](https://github.com/lablup/backend.ai-webui/pull/2520)
- Import notebook using Neo Session Launcher [#2466](https://github.com/lablup/backend.ai-webui/pull/2466)
- Make model description expandable [#2537](https://github.com/lablup/backend.ai-webui/pull/2537)
- Add finetune model button to model card and fix key warning [#2534](https://github.com/lablup/backend.ai-webui/pull/2534)
- Add confirmation dialog on force-terminate attempt on PULLING/PREPARING/TERMINATING [#2481](https://github.com/lablup/backend.ai-webui/pull/2481)
- Introduce `BAICodeMirror` component and apply it to user setting page's script edit modal [#2467](https://github.com/lablup/backend.ai-webui/pull/2467)

### Bug Fixes
- Set dark theme color for error panel in session detail modal [#2489](https://github.com/lablup/backend.ai-webui/pull/2489)
- Fix Neo session launcher summary page UI for long execution commands in batch sessions [#2488](https://github.com/lablup/backend.ai-webui/pull/2488)
- Correct references to Ubuntu Mono Bold fonts [#2507](https://github.com/lablup/backend.ai-webui/pull/2507)
- Change webui language selection logic [#2500](https://github.com/lablup/backend.ai-webui/pull/2500)
- Migrate husky command to v9 [#2505](https://github.com/lablup/backend.ai-webui/pull/2505)
- Change login input validation logic to support both email and non-email types [#2509](https://github.com/lablup/backend.ai-webui/pull/2509)
- Correct description validating logic in lablup-notification [#2503](https://github.com/lablup/backend.ai-webui/pull/2503)
- Apply one decimal place rounding to per session I/O stat [#2511](https://github.com/lablup/backend.ai-webui/pull/2511)
- Correct mistaken 'rocm_device' in resource monitor [#2516](https://github.com/lablup/backend.ai-webui/pull/2516)
- Fix `allowCustomResourceAllocation` options in Neo session launcher [#2522](https://github.com/lablup/backend.ai-webui/pull/2522)
- Rename `enableModelStore` configuration [#2523](https://github.com/lablup/backend.ai-webui/pull/2523)
- Correct CPU util ratio for cluster sessions [#2521](https://github.com/lablup/backend.ai-webui/pull/2521)
- Workaround for version-compatibility in fetching per container(kernel) logs [#2524](https://github.com/lablup/backend.ai-webui/pull/2524)
- Add `undefined` type to `useResourceSlotsDetails` [#2526](https://github.com/lablup/backend.ai-webui/pull/2526)
- Handle search params using `URLSearchParams` [#2528](https://github.com/lablup/backend.ai-webui/pull/2528)
- Fix "Cannot read properties of null (reading 'slice')" error [#2527](https://github.com/lablup/backend.ai-webui/pull/2527)
- Resetting i18n key of Atom Plus device [#2530](https://github.com/lablup/backend.ai-webui/pull/2530)
- Allow dot (.) input on vFolder aliasing but not for automount folder path [#2531](https://github.com/lablup/backend.ai-webui/pull/2531)
- Fix image environment select form item's wrap style [#2532](https://github.com/lablup/backend.ai-webui/pull/2532)
- Hide auto-mounted vFolder in the service launcher [#2538](https://github.com/lablup/backend.ai-webui/pull/2538)
- Fix 400 error when refreshing container logs [#2536](https://github.com/lablup/backend.ai-webui/pull/2536)
- Fix `index.css` for Lucide icon in Electron environment [#2540](https://github.com/lablup/backend.ai-webui/pull/2540)
- Handle all cloning folder errors as existing name errors [#2539](https://github.com/lablup/backend.ai-webui/pull/2539)
- Set initial values for antd form instances [#2541](https://github.com/lablup/backend.ai-webui/pull/2541)

### Refactoring
- Improve resource allocation form item labels with resource details API [#2485](https://github.com/lablup/backend.ai-webui/pull/2485)
- Migrate settings page to React component [#2465](https://github.com/lablup/backend.ai-webui/pull/2465)
- Show as many agent IDs as the number of agents [#2517](https://github.com/lablup/backend.ai-webui/pull/2517)

### Additions
- Kernel_id parameter for fetching container log by kernel id in session [#2510](https://github.com/lablup/backend.ai-webui/pull/2510)
- Existing environment when modifying or querying endpoint detail [#2525](https://github.com/lablup/backend.ai-webui/pull/2525)

### Style
- Dynamic model card UI [#2533](https://github.com/lablup/backend.ai-webui/pull/2533)

**Full Changelog**: [v24.03.5...v24.03.7](https://github.com/lablup/backend.ai-webui/compare/v24.03.5...v24.03.7)

---

## v24.03.5 (14/06/2024)

* feat: compatibility check function supports multiple conditions by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2449
* feat: add title modification feature to replace-with-brand-name script by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2457
* feat: Add size options to `theme.json` by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2463
* feat: service routes sync button by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2471
* feat: Add copyable button to My Environment page by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2473
* fix: compiled and typo error by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2459
* fix: `supports` type of `useSuspendedBackendaiClient` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2454
* fix: missing `react/pacakge-lock.json` update by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2468
* fix: adjust the position of mwc selection menu items by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2470
* fix: overflow issue in manual image tag by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2474
* fix: PEP440 suffix normalization for `alpha` and `beta` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2475
* fix: all elements are NOT clickable after a page transition with openped modal by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2478
* fix: run form validation after changing preset by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2480
* ci: add permissions for uploading release assets by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2482
* ci: add permissions to Jest report github action by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2464
* refactor: replace Recoil with Jotai by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2461
* refactor: rename page components related to the `Endpoint` type by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2460
* update: node.js packages by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2462

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v24.03.4...v24.03.5

---

## v24.03.4 (03/06/2024)

* refactor: clean up backend-ai-webui.ts by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2350
* feat: current project state using Jotai library by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2331
* update: node.js components to recent versions by @inureyes in https://github.com/lablup/backend.ai-webui/pull/2388
* feat: apply react managing apps modal into web component by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2265
* hotfix: Rename Relay mutation type file name by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2403
* fix: reload behavior of BAIErrorBoundary for Electron by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2397
* fix: normalize copied example command format in sFTP upload agent panel by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2398
* misc: change color of main access key tag to green by @lizable in https://github.com/lablup/backend.ai-webui/pull/2411
* feat: new resources page and support agent pagination by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2406
* fix: TextHighlighter performance by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2413
* fix: i18n missing and plural items by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2414
* feat: introduce SourceCodeViewer component by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2402
* Refactor/add warning msg as a replacement of always enqueue session by @lizable in https://github.com/lablup/backend.ai-webui/pull/2405
* feat: Neo Session Launcher Tour Guide via 'antd tour' by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2284
* feat: the project select supports model store type for admin by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2416
* feat: Property filter component by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2418
* feat: add new resource policy page (keypair, user, project) by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2357
* misc/remove-legacy-keypair-resource-policy-page by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2419
* feature: provide model service validation by @lizable in https://github.com/lablup/backend.ai-webui/pull/2061
* feat: set `maxHeight` to BAIModal by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2420
* style: set footer to null and styling AgentDetailModal by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2424
* fix: missing i18n for BAIPropertyFilter by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2425
* fix: do not apply preset when disabled presets by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2429
* fix: `InputNumber` component does not update the value correctly at first by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2428
* hotfix: replace ellipsis in Notification with `_.turuncate` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2434
* feat: User resource policy page by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2421
* feat: Project resource policy page by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2423
* feat: provide sorted resource presets to NeoSessionLauncher when presets are modifed by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2435
* fix: error handling for ModifyEndpoint GQL fails by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2432
* fix: use `recursive` validation  option for `ResourceAllocationFormItems` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2440
* fix: request update when commit session dialog is opened by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2438
* fix: temporally disable session commit to tar file in commit session dialog by @lizable in https://github.com/lablup/backend.ai-webui/pull/2433
* fix: Mishandling of undefined value in the ModifyImage mutation by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2431
* misc: realign session name of upload session list by @lizable in https://github.com/lablup/backend.ai-webui/pull/2430
* fix: improve `message`'s i18n and duration for model services deletion  by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2439
* fix: empty filter layout of `BAIPropertyFiilter` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2426
* add: providing additional vfolder mounts and arbitrary model definition path in model service launcher by @lizable in https://github.com/lablup/backend.ai-webui/pull/2437
* feature/add-extra-mount-and-mount-destination-on-routing-info by @lizable in https://github.com/lablup/backend.ai-webui/pull/2443
* fix/consider-version-compatibility-on-extra-mounts-in-model-serving by @lizable in https://github.com/lablup/backend.ai-webui/pull/2447
* fix: align button consistency on resource group by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2451
* fix: Add user commit image input validation logic by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2452
* feature: hide user resource policy based on manager version by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2453


**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v24.03.3...v24.03.4

---

## v24.03.3 (30/04/2024)

* ci: display failed-tests annotation only in jest-coverage-report-action by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2347
* hotfix: listup only ready status vfolder on service launcher by @lizable in https://github.com/lablup/backend.ai-webui/pull/2354
* fix: remove container commit interaction button in `upload session` by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2356
* fix: preserve the preset of session launcher using query parameters. by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2361
* fix: parsing valid appConnectUrl by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2358
* fix: default environment as a initial value of the service launcher by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2352
* fix: wrong vFolder validation result occasionally. by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2359
* fix: prevent delete in shared vfolder by permission by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2363
* fix: `onChangeAliasMap` is triggered on every render by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2370
* fix: Change '/session' path to be used as sider's selectedKey 'job' by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2376
* feat: auto mounted vFolder in Neo session launcher by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2381
* fix: include cancel handler in ServiceLauncherModal by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2379
* Omit `onOk` from `BAIModalProps` instead of `onOK` by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2384
* fix: preventing sharing of auto-mounted folders by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2374
* feat: Show instructions for session creation failures by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2385
* build(deps-dev): bump express from 4.19.1 to 4.19.2 by @dependabot in https://github.com/lablup/backend.ai-webui/pull/2273
* build(deps): bump express from 4.18.2 to 4.19.2 in /react by @dependabot in https://github.com/lablup/backend.ai-webui/pull/2274
* ci: Bump actions/labeler from 4 to 5 by @Yaminyam in https://github.com/lablup/backend.ai-webui/pull/2342
* build(deps): bump follow-redirects from 1.15.2 to 1.15.6 in /react by @dependabot in https://github.com/lablup/backend.ai-webui/pull/2263
* build(deps-dev): bump webpack-dev-middleware from 5.3.3 to 5.3.4 in /react by @dependabot in https://github.com/lablup/backend.ai-webui/pull/2266
* hotfix: only show vfolder when mount in session perm is allowed by @lizable in https://github.com/lablup/backend.ai-webui/pull/2348
* fix: add ErrorBoundary on main layout when error occurred during fetching TOTP checker by @lizable in https://github.com/lablup/backend.ai-webui/pull/2380
* feat: add `User work` to VSCode remote connection info by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2375
* feat: add `UserKnownHostsFile` to vs code app guide by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2391
* bug: session list grid resized when data is refetched by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2390
* fix: Modal header buttons are not clickable in the top area of Electron by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2392
* hotfix: set cuda share first as an ai accelerator when both cuda device and shares available by @lizable in https://github.com/lablup/backend.ai-webui/pull/2395


**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v24.03.2...v24.03.3

---

## v24.03.2 (17/04/2024)

* feat: set color for text 'only' by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2322
* fix: check isNaN before set value of DynamicUnitInputNumber by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2324
* style: add css variable to vaadin grid for plugin page by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2325
* fix: set supported language codes to allow all i18n languages by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2329
* fix: unkown scailing group error when user change the project by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2330
* feat: add branding config to theme.json by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2328
* feat: apply filter to png icon when theme is darkmode by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2304
* build(deps): bump actions/labeler from 4 to 5 by @dependabot in https://github.com/lablup/backend.ai-webui/pull/2091
* fix: `_viewStateChanged` is called for same `active` value in `attributeChangedCallback` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2339
* hotfix: regression of showing project list according to allowed group in user info by @lizable in https://github.com/lablup/backend.ai-webui/pull/2340
* fix: vFolder form item validation in Neo session launcher by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2334
* fix: regression of applying default session environment by @lizable in https://github.com/lablup/backend.ai-webui/pull/2337
* feat: add MyEnvironment page to manage per user commit images by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2332
* style: label wrapping, font resizing and numeric token formatting in login panel by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2338
* style: remove `px` when calculating margin of WebUIHeader wrapper by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2344
* fix: use `defaultSessionEnvironment` as a initial `environments.environment` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2345
* hotfix: enable non-accelerator preset when accelerator image by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2346
* revert: "#2344 remove px when calculating margin of WebUIHeader wrapper" by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2349


**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v24.03.1...v24.03.2

---

## v23.09.10 (07/04/2024)

* fix: @typescript-eslint/typescript-estree dependency warning by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2225
* feat: support dark theme by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2193
* feat: add JSON schema files for theme.json by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2232
* fix: Electron live debug mode using `LIVE_DEBUG` and `LIVE_DEBUG_ENDPOINT` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2233
* feat: Introduce `SettingList` component for setting page UI by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2212
* fix: missing commit of UserSettingsPage to rollback by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2234
* feat: add password change request alert to summary page by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2238
* feat: build plugin pages and update electron ver. by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2226
* docs: Update outdated Makefile command for building macOS apps by @rapsealk in https://github.com/lablup/backend.ai-webui/pull/2237
* feat: display announcement alert to every page. by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2239
* fix: unintended console log and import `glob` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2241
* fix: optional chaining and  handle `_requestDestroySession` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2242
* fix: owner info error handling in session launcher by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2243
* fix:  FastTrack menu key to `pipeline` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2245
* hotfix: regression of image info display in serving page by @lizable in https://github.com/lablup/backend.ai-webui/pull/2244
* build(deps): bump es5-ext from 0.10.62 to 0.10.64 by @dependabot in https://github.com/lablup/backend.ai-webui/pull/2231
* build(deps-dev): bump ip from 1.1.8 to 1.1.9 by @dependabot in https://github.com/lablup/backend.ai-webui/pull/2223
* fix: change to select colors via token by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2247
* feat: `theme-logo-url` css variable by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2248
* fix: change disabled slider color and total allocation conditional rendering by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2250
* feat: fixed to be able to dynamically change colors. by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2254
* fix: font-size of the session launcher button by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2258
* style: modify background color more naturally by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2257
* fix: regression of built-in app in session execution when app itself is refreshed in Windows Desktop app by @lizable in https://github.com/lablup/backend.ai-webui/pull/2256
* fix: modify husky config to format both lit and react components by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2262
* revert: lint-staged setting of #2262 by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2264
* fix: regression of imageInfo initialization for categorizing environments by label in metadata by @lizable in https://github.com/lablup/backend.ai-webui/pull/2267
* feat: 'make clean' removes build files in the react folder by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2272
* feat: Quota Scope ID in data page's storage status panel by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2259
* update: node.js packages by @inureyes in https://github.com/lablup/backend.ai-webui/pull/2268
* fix: use `ref` of the `Form` instead of the `useForm` function in the Modal by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2270
* feat: Neo session launcher as a default by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2220
* feat: update year of copyright by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2276
* style: fix the broken select UI of the new storage folder dialog by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2280
* style: update hard coded colors and missed translations by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2277
* feat: support vfolder trash bin by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2204
* fix: regression of listing connected agent with null-check on live_stat from response by @lizable in https://github.com/lablup/backend.ai-webui/pull/2286
* feat: display `Quota per storage volume` info if quota is available by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2285
* fix: If the language setting is not 'en' or 'kr', change the language value to 'en'. by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2291
* fix: update exporting session list by @lizable in https://github.com/lablup/backend.ai-webui/pull/2279
* fix: disable download button when download perm is not allowed by @lizable in https://github.com/lablup/backend.ai-webui/pull/2295
* feat: expose TCP apps from browser-based WebUI by @kyujin-cho in https://github.com/lablup/backend.ai-webui/pull/2188
* Fix: TOTP activation modal not opening for non-TOTP users with `forceTotp` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2299
* feat: support per user image push by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2300
* feat: destroy-all function in stacked notification by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2289
* misc: update description of type of login account in login panel by @lizable in https://github.com/lablup/backend.ai-webui/pull/2301
* feat: add support for Hyperaccel LPU devices by @kyujin-cho in https://github.com/lablup/backend.ai-webui/pull/2134
* fix: created count in `StorageStatusPanel` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2302
* fix: modify compatible manager version of trash bin by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2303
* feat: match field version compatibility for vfolder v3 by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2292
* feat: display accelerator key instead of empty string by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2294
* fix: `vfolder-trash-bin` is duplicated by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2305
* fix: vFolder field has incorrect value in editing by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2306
* fix: session list fetch error by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2307
* fix: apply AI accelerator allocation when selecting resource preset in neo session launcher by @lizable in https://github.com/lablup/backend.ai-webui/pull/2308
* hotfix: neo session launcher on cloud by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2310
* feat: add tooltip for submit button by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2311
* remove remaining session limit validation error by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2312
* fix: use `max_resoure_policy` of `user_resource_policy` since 23.09.6 by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2313
* hotfix: touchup container commit feature by @lizable in https://github.com/lablup/backend.ai-webui/pull/2314
* fix: update imageify availability status on `input` event by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2315
* fix: notarization not working by @kyujin-cho in https://github.com/lablup/backend.ai-webui/pull/2320


**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v23.09.9...v23.09.10

---

## v24.03.1 (07/04/2024)

* fix: notarization not working by @kyujin-cho in https://github.com/lablup/backend.ai-webui/pull/2320
* fix: Electron packaging stuck due to apple app signing changes by @inureyes (#2319)


**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v24.03.0...v24.03.1

---

## v24.03.0 (06/04/2024)
## What's Changed
* fix: @typescript-eslint/typescript-estree dependency warning by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2225
* feat: support dark theme by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2193
* feat: add JSON schema files for theme.json by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2232
* fix: Electron live debug mode using `LIVE_DEBUG` and `LIVE_DEBUG_ENDPOINT` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2233
* feat: Introduce `SettingList` component for setting page UI by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2212
* fix: missing commit of UserSettingsPage to rollback by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2234
* feat: add password change request alert to summary page by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2238
* feat: build plugin pages and update electron ver. by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2226
* docs: Update outdated Makefile command for building macOS apps by @rapsealk in https://github.com/lablup/backend.ai-webui/pull/2237
* feat: display announcement alert to every page. by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2239
* fix: unintended console log and import `glob` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2241
* fix: optional chaining and  handle `_requestDestroySession` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2242
* fix: owner info error handling in session launcher by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2243
* fix:  FastTrack menu key to `pipeline` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2245
* hotfix: regression of image info display in serving page by @lizable in https://github.com/lablup/backend.ai-webui/pull/2244
* build(deps): bump es5-ext from 0.10.62 to 0.10.64 by @dependabot in https://github.com/lablup/backend.ai-webui/pull/2231
* build(deps-dev): bump ip from 1.1.8 to 1.1.9 by @dependabot in https://github.com/lablup/backend.ai-webui/pull/2223
* fix: change to select colors via token by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2247
* feat: `theme-logo-url` css variable by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2248
* fix: change disabled slider color and total allocation conditional rendering by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2250
* feat: fixed to be able to dynamically change colors. by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2254
* fix: font-size of the session launcher button by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2258
* style: modify background color more naturally by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2257
* fix: regression of built-in app in session execution when app itself is refreshed in Windows Desktop app by @lizable in https://github.com/lablup/backend.ai-webui/pull/2256
* fix: modify husky config to format both lit and react components by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2262
* revert: lint-staged setting of #2262 by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2264
* fix: regression of imageInfo initialization for categorizing environments by label in metadata by @lizable in https://github.com/lablup/backend.ai-webui/pull/2267
* feat: 'make clean' removes build files in the react folder by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2272
* feat: Quota Scope ID in data page's storage status panel by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2259
* update: node.js packages by @inureyes in https://github.com/lablup/backend.ai-webui/pull/2268
* fix: use `ref` of the `Form` instead of the `useForm` function in the Modal by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2270
* feat: Neo session launcher as a default by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2220
* feat: update year of copyright by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2276
* style: fix the broken select UI of the new storage folder dialog by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2280
* style: update hard coded colors and missed translations by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2277
* feat: support vfolder trash bin by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2204
* fix: regression of listing connected agent with null-check on live_stat from response by @lizable in https://github.com/lablup/backend.ai-webui/pull/2286
* feat: display `Quota per storage volume` info if quota is available by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2285
* fix: If the language setting is not 'en' or 'kr', change the language value to 'en'. by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2291
* fix: update exporting session list by @lizable in https://github.com/lablup/backend.ai-webui/pull/2279
* fix: disable download button when download perm is not allowed by @lizable in https://github.com/lablup/backend.ai-webui/pull/2295
* feat: expose TCP apps from browser-based WebUI by @kyujin-cho in https://github.com/lablup/backend.ai-webui/pull/2188
* Fix: TOTP activation modal not opening for non-TOTP users with `forceTotp` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2299
* feat: support per user image push by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2300
* feat: destroy-all function in stacked notification by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2289
* misc: update description of type of login account in login panel by @lizable in https://github.com/lablup/backend.ai-webui/pull/2301
* feat: add support for Hyperaccel LPU devices by @kyujin-cho in https://github.com/lablup/backend.ai-webui/pull/2134
* fix: created count in `StorageStatusPanel` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2302
* fix: modify compatible manager version of trash bin by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2303
* feat: match field version compatibility for vfolder v3 by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2292
* feat: display accelerator key instead of empty string by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2294
* fix: `vfolder-trash-bin` is duplicated by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2305
* fix: vFolder field has incorrect value in editing by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2306
* fix: session list fetch error by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2307
* fix: apply AI accelerator allocation when selecting resource preset in neo session launcher by @lizable in https://github.com/lablup/backend.ai-webui/pull/2308
* hotfix: neo session launcher on cloud by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2310
* feat: add tooltip for submit button by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2311
* remove remaining session limit validation error by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2312
* fix: use `max_resoure_policy` of `user_resource_policy` since 23.09.6 by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2313
* hotfix: touchup container commit feature by @lizable in https://github.com/lablup/backend.ai-webui/pull/2314
* fix: update imageify availability status on `input` event by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2315

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v23.09.9...v24.03.0

---

## v23.09.10-rc.1 (06/03/2024)
## What's Changed
* fix: @typescript-eslint/typescript-estree dependency warning by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2225
* feat: support dark theme by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2193
* feat: add JSON schema files for theme.json by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2232
* fix: Electron live debug mode using `LIVE_DEBUG` and `LIVE_DEBUG_ENDPOINT` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2233
* feat: Introduce `SettingList` component for setting page UI by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2212
* fix: missing commit of UserSettingsPage to rollback by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2234
* feat: add password change request alert to summary page by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2238
* feat: build plugin pages and update electron ver. by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2226
* docs: Update outdated Makefile command for building macOS apps by @rapsealk in https://github.com/lablup/backend.ai-webui/pull/2237
* feat: display announcement alert to every page. by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2239
* fix: unintended console log and import `glob` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2241
* fix: optional chaining and  handle `_requestDestroySession` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2242
* fix: owner info error handling in session launcher by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2243

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v23.09.9...v23.09.10-rc.1

---

## v23.09.9 (22/02/2024)
## What's Changed
* fix: version comparison function based on  PEP440 by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2139
* fix: mapping `servicePorts` instead string array when get services. by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2177
* feat: filter props of VFolderTableFormItem by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2173
* fix: `initialValues` props of `<Form/>` under Modal doesn't work in Electron by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2178
* feat: React root including MainLayout, useBAINotification by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2121
* Fix/draggable header for electron by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2184
* fix: remove ROCm icon from resource monitor by @rapsealk in https://github.com/lablup/backend.ai-webui/pull/2185
* feat: separate the formatting and linting configuration by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2162
* feat: add draggable prop of BAIModal to drag modal by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/2179
* fix: image info(metadata) can be `undefined` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2197
* fix:  regular expression for validating registry URL by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2192
* fix:modify guide description of TOTPActivateModal by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/2174
* fix: modify zIndex of BAIModal to prevent manipulation of the notification drawer by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/2186
* fix: update logo image for AMD ROCm by @rapsealk in https://github.com/lablup/backend.ai-webui/pull/2182
* feat: update VFolder operation statuses by @rapsealk in https://github.com/lablup/backend.ai-webui/pull/2031
* feat: prevent modifying DESTROYING status services by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2200
* fix: ResourceGroupSelect is layout and support search highlight by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/2166
* feat: apply ellipsis into notification by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2199
* fix: display credential-list when `keypair`button in `summary` page is clicked by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/2194
* feat: autoSelectDefault and showUsageStatus props of StorageSelector by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2180
* fix: general setting page is empty after navigation from log tab by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2211
* fix: when user menu is clicked, credential tab is shown instead of user. by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/2208
* feature: provide UI for updating resource allocation in model service by @lizable in https://github.com/lablup/backend.ai-webui/pull/2168
* fix: current project doesn't apply to vfolder list and session list by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2218
* fix: resource-monitor is shown at out of layout by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/2207
* feat: refactor batch session date picker component with react component by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2215
* fix:  main layout header appears behind fixed column table by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2206
* add: type for date by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2224

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v23.09.8...v23.09.9

---

## v23.09.8 (20/01/2024)
## What's Changed
* fix: Correct hyphen usage in input validator regex by @adrysn in https://github.com/lablup/backend.ai-webui/pull/2052
* fix: add omitted html tag in folder explorer by @lizable in https://github.com/lablup/backend.ai-webui/pull/2057
* feat: set `singleAttributePerLine` prettier option to `false` (default:false) by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2053
* fix: remove `unhandled promise rejection` in UserProfileSettingModal  by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/2048
* fix: typo error by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2060
* fix: remove comment applied in controls column in vfolder list by @lizable in https://github.com/lablup/backend.ai-webui/pull/2063
* fix: reflect changed desktop app download link by architecture by @inureyes in https://github.com/lablup/backend.ai-webui/pull/2065
* add: BUILD_NUMBER as a number of commits on build target branch by @inureyes in https://github.com/lablup/backend.ai-webui/pull/2072
* feat: add model store tab to storage page by @inureyes in https://github.com/lablup/backend.ai-webui/pull/2064
* feat: recover folder cloneable option in folder create/setting modal. by @lizable in https://github.com/lablup/backend.ai-webui/pull/2069
* fix: modify small tag to follow main branch by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/2074
* fix: rename to mode_card by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2076
* fix: Sharing vfolder dialog is not closed when user click outside of dialog by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/2078
* build(deps-dev): bump browserify-sign from 4.2.1 to 4.2.2 by @dependabot in https://github.com/lablup/backend.ai-webui/pull/2000
* build(deps-dev): bump @adobe/css-tools from 4.3.1 to 4.3.2 by @dependabot in https://github.com/lablup/backend.ai-webui/pull/2068
* build(deps): bump @babel/traverse from 7.22.15 to 7.23.2 in /react by @dependabot in https://github.com/lablup/backend.ai-webui/pull/1977
* build(deps): bump @adobe/css-tools from 4.3.1 to 4.3.2 in /react by @dependabot in https://github.com/lablup/backend.ai-webui/pull/2070
* feat: Disable primary keypair deletion by @lizable in https://github.com/lablup/backend.ai-webui/pull/2083
* feat: re-arrange my account dialog by @lizable in https://github.com/lablup/backend.ai-webui/pull/2087
* fix: Change to setting.Pulgins to setting.OpensourcePlugins by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/2080
* fix: adjust support version check for main access key by @lizable in https://github.com/lablup/backend.ai-webui/pull/2088
* feat: remaining marks in environment allocation slider by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2030
* fix:activated and disabled mwc-switch's color is shown shadow color by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/2092
* refactor: rewrite protocol interceptor / buffer handler to new format introduced from Electron 25 by @inureyes in https://github.com/lablup/backend.ai-webui/pull/2067
* fix: user signup without confirmation by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/2046
* feat: Expose endpoint and created user in model serving list by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/2047
* fix:The Credential View displays a list that does not match the sub-tab by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/2055
* feat: Add table columns setting component by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/2071
* fix: calculate liveStat by considering all containers by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2086
* fix: Remove unnecessary spaces in sFTP upload session commands by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/2107
* feat: run `relay:watch` with nodemon by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2097
* fix: Image name exceptions of `ImageEnvironmentSelectFormItem` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2109
* docs: fix GitHub branding by @Yaminyam in https://github.com/lablup/backend.ai-webui/pull/2111
* feat: Set resource limitation in service launcher by @lizable in https://github.com/lablup/backend.ai-webui/pull/2112
* fix:modiy condition of registry user config validation by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/2099
* feat: `useResourceLimitAndRemaining` hook by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2108
* fix:Add white-space style by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/2095
* fix:UserDropdownMenu userName's item overflow issue by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/2116
* feat:Implement notice alert and delete notice-ticker and announcement panel. by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/2098
* refactor: Signout modal by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/2093
* docs: fix GitLab branding by @Yaminyam in https://github.com/lablup/backend.ai-webui/pull/2122
* fix: env variable validation rule in neo session lanuncher  by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2110
* style: remove `whiteSpace` to fix the broken UI of the announcement. by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2126
* fix: implement Neo Session column's content by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/2130
* Revert "fix: implement Neo Session column's content" by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2132
* feat: implement custom hooks to use React dark mode by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/2120
* feat: `allow_manual_image_name_for_session` option in ServiceLauncher by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2136
* fix: model service owner always represented as logged in user by @kyujin-cho in https://github.com/lablup/backend.ai-webui/pull/2138
* feat: add session name validator to the session launcher by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2123
* fix: default select value is appeared correctly in add-folder-dialog by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/2144
* fix: apply overflow style and modify option to mwc-list-item in modify-permission-dialog by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/2143
* feat: add session info to the neo session list by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2133
* feat: refactoring ErrorLogList to react by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/2131
* feat: improve log search performance and UX by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2146
* fix: omit the mark if it is greater than the max by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2152
* fix: improve session status info by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/2150
* feat: Improve edu-applauncher scalability for adding session templates by @fregataa in https://github.com/lablup/backend.ai-webui/pull/2147
* fix: show antd error message when failed to terminate in-service model by @ironAiken2 in https://github.com/lablup/backend.ai-webui/pull/2157
* fix: UserInfoModal is displayed previous data by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/2153

## New Contributors
* @ironAiken2 made their first contribution in https://github.com/lablup/backend.ai-webui/pull/2157

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v23.09.7...v23.09.8

---

## v23.09.7 (25/11/2023)
## What's Changed
* fix: Data&Storage menu is not visible by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/2051

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v23.09.6...v23.09.7

---

## v23.09.6 (24/11/2023)
## What's Changed
* feature: rename `blockedMenuItem` to `inactiveMenuItem` by @rapsealk in https://github.com/lablup/backend.ai-webui/pull/2040
* fix: exception caused by mismatched selected resource group information. by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2043
* fix: Use `blockedMenuItem` to hide and show pipeline button by @rapsealk in https://github.com/lablup/backend.ai-webui/pull/2036
* Feat:Cancelled session's log button is disabled by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/2045
* fix: update edu app launcher by @fregataa in https://github.com/lablup/backend.ai-webui/pull/1993
* fix: add blockedMenuItem again by @inureyes in https://github.com/lablup/backend.ai-webui/pull/2049

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v23.09.5...v23.09.6

---

## v23.09.5 (21/11/2023)
## What's Changed
* update: stand-alone local proxy packaging by @inureyes in https://github.com/lablup/backend.ai-webui/pull/2013
* docs: Update documentation link by @adrysn in https://github.com/lablup/backend.ai-webui/pull/1994
* update: change NPU device limit per node to 8 by @inureyes in https://github.com/lablup/backend.ai-webui/pull/2014
* add: read NPU limit per node configuration from config.toml by @inureyes in https://github.com/lablup/backend.ai-webui/pull/2015
* fix: add optional chaining to call support by @inureyes in https://github.com/lablup/backend.ai-webui/pull/2019
* feat: Link FastTrack button to frontend server by @rapsealk in https://github.com/lablup/backend.ai-webui/pull/2020
* add: a draft for updated sliderInputItem with selectable AI accelerator by @lizable in https://github.com/lablup/backend.ai-webui/pull/2017
* Fix: hide `max_vfolder_count` setting according to the api version by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2016
* feature: hide size of directory by option by @lizable in https://github.com/lablup/backend.ai-webui/pull/2021
* feature: update existing components for neo session launcher by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2023
* feat: Neo session launcher - alpha by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1953
* feat: VFolderPermissionTag component by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2024
* feature: Response style for `ImageEnvironmentSelectFormItems` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2028
* feat: cluster mode in Neo Session launcher  by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2026
* fix: variable name validation rule of `EnvVarFormList` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2029
* add: bundle option to Makefile with auto-release bundle by @inureyes in https://github.com/lablup/backend.ai-webui/pull/2034

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v23.09.4...v23.09.5

---

## v23.09.4 (05/11/2023)
## What's Changed
* feat: new GraphQL directive on Client, `@since(version:)` and `@deprecatedSince(version:)` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1999
* fix: UI with multiple types of accelerators by @adrysn in https://github.com/lablup/backend.ai-webui/pull/2012
* feat: add `allowAppDownloadPanel` that can hide app download panel by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/1996
* feature: set password to `undefined` when no change is desired. by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2010
* bugfix: GraphQL variable type error by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/2011

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v23.09.3...v23.09.4

---

## v23.09.3 (01/11/2023)
## What's Changed
* fix: remove image naming checking when selecting sftp image by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2007
* fix: touchup sftp connection example text by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2004
* fix: limit number of characters of model service name by @kyujin-cho in https://github.com/lablup/backend.ai-webui/pull/2003
* build(deps): bump actions/setup-node from 3 to 4 by @dependabot in https://github.com/lablup/backend.ai-webui/pull/2001
* feat: add config option that can hide custom resource allocation by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/1998
* fix: hide inference app from app launcher by @kyujin-cho in https://github.com/lablup/backend.ai-webui/pull/2002
* feat: add passwordless sudo user management UI by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/2005

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v23.09.2...v23.09.3

---

## v23.09.2 (26/10/2023)
## What's Changed
* update: i18n resources by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1989
* update: PULL_REQUEST_TEMPLATE.md by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1990
* feature: split copy to clipboard in sftp session connection dialog by @lizable in https://github.com/lablup/backend.ai-webui/pull/1986
* feature: Registry management UI using GraphQL by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1975
* fix: revert max_vfolder_count removing by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1995

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v23.09.1...v23.09.2

---

## v23.09.1 (24/10/2023)
## What's Changed
* update: change label on terms of service dialog's close button by @rapsealk in https://github.com/lablup/backend.ai-webui/pull/1957
* feat: Neo session launcher (Step 3&4) by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1896
* fix: remove warnings/errors and unused logs in the browser console by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1961
* style: widen control column to show rescan icon by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/1963
* feature: hide sftp resource group by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/1966
* feature: Enable create session with bootstrap script by @fregataa in https://github.com/lablup/backend.ai-webui/pull/1944
* fix: remove `max_vfolder_count` from keypair resource policy by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/1972
* fix: empty filtered scaling groups generates error by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1982
* add: disable hostkey checking option for sftp session by @lizable in https://github.com/lablup/backend.ai-webui/pull/1984

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v23.09.0...v23.09.1

---

## v23.09.0 (27/09/2023)
## What's Changed
* feat: add copy to clipboard button by @mnxmnz in https://github.com/lablup/backend.ai-webui/pull/1846
* update: modify regexTable to use error notification when referenced resource is deleted by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/1844
* test: Flex component rendering test & snapshot by @KSoonYo in https://github.com/lablup/backend.ai-webui/pull/1857
* feat: Do not allow batch session startup command to have an empty string. by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/1875
* fix: password validation rule on "Modify User Detail" Modal by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/1868
* feature: allow eduapplauncher to pass `resources` option by @fregataa in https://github.com/lablup/backend.ai-webui/pull/1780
* feature: add tab for pipeline dedicated folder list by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1871
* style: apply custom header to Modal  by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/1877
* Refactor maintenance view by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/1850
* Refactor user pref modal by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/1849
* fix: rename backend-ai-session-launcher-neo by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1883
* ci: Add auto-label-in-issue action by @Yaminyam in https://github.com/lablup/backend.ai-webui/pull/1885
* feature: set prettier formatter to pre-commit hook by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1884
* fix: incomplete URL substring sanitization by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1889
* update: change '몇 일' to '며칠' for gpu/accelerator text by @rapsealk in https://github.com/lablup/backend.ai-webui/pull/1892
* update: 키 수명 -> 키 경과시간 by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/1895
* feature: add sorting filter in new column `created_at` in serving list by @lizable in https://github.com/lablup/backend.ai-webui/pull/1888
* Fix: resource monitor's right border is not visible by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/1886
* feature: react error boundary component for pages by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1890
* style: reduce sftp icon size by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/1903
* Refactor user dropdown menu by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/1882
* fix: "Invalid Host header error of React dev server by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1904
* feature: add token generation UI in routing by @lizable in https://github.com/lablup/backend.ai-webui/pull/1901
* feat: redirect to error page if it is `blockedMenuItem` by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/1902
* fix build error: remove unused previous user dropdown menu by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1907
* fix: add optional chaining to show app launcher by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/1908
* feat: better msg when coordinator connection timeout by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/1906
* fix: Change WARBOY resource display icon to FuriosaAI by @rapsealk in https://github.com/lablup/backend.ai-webui/pull/1912
* add: automatic Windows / Linux builds on GitHub action by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1910
* ci: Bump checkout from v3 to v4 by @Yaminyam in https://github.com/lablup/backend.ai-webui/pull/1916
* feat: update legacy key(`ram`) from device metadata by @rapsealk in https://github.com/lablup/backend.ai-webui/pull/1917
* feat: add support for OpenID login by @kyujin-cho in https://github.com/lablup/backend.ai-webui/pull/1914
* update: base node.js version to 20 by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1921
* fix: set the max limit and display ui of resource numbers by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1918
* ci: GitHub Action to run jest on `/react` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1920
* fix: errors in test code for iSizeToSize by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1925
* feat: display vfolder in Service detail page by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1924
* feat: add an auto selected volume in creating and cloning a data folder by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/1915
* fix: use "sftp-upload" image in sftp upload session by @adrysn in https://github.com/lablup/backend.ai-webui/pull/1927
* feature: set up day.js extentions and custom scalar type of GraphQL config by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1911
* fix: the ant.d tooltip is covered in modal with mwc drawer by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1928
* test: automatic translation with tooling by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1922
* ci: Manage actions version with dependabot by @Yaminyam in https://github.com/lablup/backend.ai-webui/pull/1930
* update: node.js packages by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1932
* build(deps): bump actions/checkout from 3 to 4 by @dependabot in https://github.com/lablup/backend.ai-webui/pull/1931
* fix: broken `Select` UI by using inline-flex (since ant.d 5.9.1) by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1933
* fix: update incorrectly matched cluster mode translation by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/1935
* feature: add showPrivate props to ImageEnvironmentSelectFormItems by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1940
* fix: resolve resource allocation related errors in session launchers when there are multiple AI accelerators. by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/1936
* feat: add fasttrack link to webui by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/1929
* fix: specify possible i18n static values in comments by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1945
* fix: signing only macOS packages with apple signing system on GitHub Action by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1941
* add: Spanish, Finnish translation by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1946
* add: multilingual support for 14 more languages by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1948
* feat: replace translations in language selector with translations in each country by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/1952
* style: match end of endpoint layout by @agatha197 in https://github.com/lablup/backend.ai-webui/pull/1954
* fix: wrong component hierarchy by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1947
* update: node.js packages by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1955

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v23.03.5...v23.09.0

---

## v23.03.5 (19/08/2023)
## What's Changed
* build(deps): bump semver from 6.3.0 to 6.3.1 in /react by @dependabot in https://github.com/lablup/backend.ai-webui/pull/1774
* build(deps): bump tough-cookie from 4.1.2 to 4.1.3 in /react by @dependabot in https://github.com/lablup/backend.ai-webui/pull/1772
* fix: update the text of launch button using @property by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1783
* update: node.js package dependencies by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1781
* fix: fill missing return value of login function by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1784
* update: add  watchman installation guide to README.md by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1785
* update: clearer button role on log page by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1787
* add: hover tooltips on storage control icons by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1788
* bugfix: prevent flicking of StorageStatusPanel using deferredFetchKey  by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1790
* update: github actions to track the latest releases by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1796
* build(deps): bump word-wrap from 1.2.3 to 1.2.4 in /react by @dependabot in https://github.com/lablup/backend.ai-webui/pull/1797
* refactor: remove `any` from code typing by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1791
* feat: add react copy code component and apply it to vscode password and otp code by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1798
* fix: vscode graphql extention configuration by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1802
* update: new brand logo by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1804
* feature: setup basic react test environment by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1808
* refactor: replace weightless-based component with  mwc-webcomponents v2 by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1786
* refactor: import new icon scheme from window mode branch by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1816
* fix: Solve to extract `backend-ai-multi-select` tag from scheduler options by @Choi-Jiwon-38 in https://github.com/lablup/backend.ai-webui/pull/1815
* update: change '표시 할' to '표시할' for no-announcement text by @rapsealk in https://github.com/lablup/backend.ai-webui/pull/1814
* feature: Support model serving UI 2 by @lizable in https://github.com/lablup/backend.ai-webui/pull/1801
* feat: use GraphQL `endpoint_list` instaed REST `/services` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1820
* fix: unable to terminate a compute session when wsproxy address is not properly by @pderer in https://github.com/lablup/backend.ai-webui/pull/1819
* refactor: change user info and setting modal to react component by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1821
* feat: authorize app by query param by @adrysn in https://github.com/lablup/backend.ai-webui/pull/1817
* fix: serving dialog popup generates error when unexpected image metadata is loaded without icon URL by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1825
* fix: modify the logic to validate the URL input by @kimjinmyeong in https://github.com/lablup/backend.ai-webui/pull/1806
* feature: Proxy react server to web dev server by using `devServer` and `proxy` by @Choi-Jiwon-38 in https://github.com/lablup/backend.ai-webui/pull/1803
* hotfix: revert port for dev environment by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1829
* feat: update model-service related i18n by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1831
* refactor: modify totp initializing logic by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1826
* update: Change helper-text and add `inputLimit` by @Choi-Jiwon-38 in https://github.com/lablup/backend.ai-webui/pull/1837
* style: import custom.css to statistics-view by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1840
* add: Ubuntu mono font for monospace text by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1841
* fix: Add the React component to i18n scan target by @Choi-Jiwon-38 in https://github.com/lablup/backend.ai-webui/pull/1842
* fix: http status code by @pderer in https://github.com/lablup/backend.ai-webui/pull/1833
* feat: add preopen ports configs on the session launcher by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1843
* hotfix: custom.css and theme.json for react component by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1836
* update: fix '자원를' to '자원을' for smaller resource text by @mnxmnz in https://github.com/lablup/backend.ai-webui/pull/1852
* feat: display pre open ports to the inside of lablup-expansion by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1854
* refactor: modify client config constructor type check in backend.ai-client-esm.ts by @KSoonYo in https://github.com/lablup/backend.ai-webui/pull/1853
* feat: update preopen port detail info by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1856
* fix:  Remove license errors in open-source project version by @Choi-Jiwon-38 in https://github.com/lablup/backend.ai-webui/pull/1847
* fix: set the popup container to shadowRoot always by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1860
* feat: unify terminology to `preopen ports` by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1861
* Add toggle visibility function and button at login page by @gee05053 in https://github.com/lablup/backend.ai-webui/pull/1848
* feat: edu-applauncher opens app for a session by @adrysn in https://github.com/lablup/backend.ai-webui/pull/1862
* fix: version label overlapping by @hamo-o in https://github.com/lablup/backend.ai-webui/pull/1866
* style: set card tab background color to white by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1865
* refactor: Change manage apps dialog to react component by @Choi-Jiwon-38 in https://github.com/lablup/backend.ai-webui/pull/1858
* feat: react-based image environment select display tags with search highlight by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1859
* fix: react dev server to proxy any unknown requests to web-dev-server by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1869
* fix: model service stability by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1864
* feature: show an error message when the service fails to start by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1872
* update: node.js module dependencies by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1873

## New Contributors
* @Choi-Jiwon-38 made their first contribution in https://github.com/lablup/backend.ai-webui/pull/1815
* @rapsealk made their first contribution in https://github.com/lablup/backend.ai-webui/pull/1814
* @pderer made their first contribution in https://github.com/lablup/backend.ai-webui/pull/1819
* @kimjinmyeong made their first contribution in https://github.com/lablup/backend.ai-webui/pull/1806
* @mnxmnz made their first contribution in https://github.com/lablup/backend.ai-webui/pull/1852
* @KSoonYo made their first contribution in https://github.com/lablup/backend.ai-webui/pull/1853
* @gee05053 made their first contribution in https://github.com/lablup/backend.ai-webui/pull/1848
* @hamo-o made their first contribution in https://github.com/lablup/backend.ai-webui/pull/1866

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v23.03.3...v23.03.5

---

## v23.03.4 (31/07/2023)
## What's Changed
* build(deps): bump semver from 6.3.0 to 6.3.1 in /react by @dependabot in https://github.com/lablup/backend.ai-webui/pull/1774
* build(deps): bump tough-cookie from 4.1.2 to 4.1.3 in /react by @dependabot in https://github.com/lablup/backend.ai-webui/pull/1772
* fix: update the text of launch button using @property by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1783
* update: node.js package dependencies by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1781
* fix: fill missing return value of login function by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1784
* update: add  watchman installation guide to README.md by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1785
* update: clearer button role on log page by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1787
* add: hover tooltips on storage control icons by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1788
* bugfix: prevent flicking of StorageStatusPanel using deferredFetchKey  by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1790
* update: github actions to track the latest releases by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1796
* build(deps): bump word-wrap from 1.2.3 to 1.2.4 in /react by @dependabot in https://github.com/lablup/backend.ai-webui/pull/1797
* refactor: remove `any` from code typing by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1791
* feature: add react copy code component and apply it to vscode password and otp code by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1798
* fix: vscode graphql extention configuration by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1802
* update: new brand logo by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1804
* feature: setup basic react test environment by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1808
* refactor: replace weightless-based component with  mwc-webcomponents v2 by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1786
* refactor: import new icon scheme from window mode branch by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1816
* fix: Solve to extract `backend-ai-multi-select` tag from scheduler options by @Choi-Jiwon-38 in https://github.com/lablup/backend.ai-webui/pull/1815
* update: change '표시 할' to '표시할' for no-announcement text by @rapsealk in https://github.com/lablup/backend.ai-webui/pull/1814
* feature: Support model serving UI 2 by @lizable in https://github.com/lablup/backend.ai-webui/pull/1801
* feature: use GraphQL `endpoint_list` instaed REST `/services` by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1820
* fix: unable to terminate a compute session when wsproxy address is not properly by @pderer in https://github.com/lablup/backend.ai-webui/pull/1819
* refactor: change user info and setting modal to react component by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1821
* feature: authorize app by query param by @adrysn in https://github.com/lablup/backend.ai-webui/pull/1817

## New Contributors
* @Choi-Jiwon-38 made their first contribution in https://github.com/lablup/backend.ai-webui/pull/1815
* @rapsealk made their first contribution in https://github.com/lablup/backend.ai-webui/pull/1814
* @pderer made their first contribution in https://github.com/lablup/backend.ai-webui/pull/1819

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v23.03.3...v23.03.4

---

## v23.03.3 (17/07/2023)
## What's Changed
* feature: update to electron 25 by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1291
* feat: merge running and others tab in the session list by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1768
* feat: Remove resource policy panel on Quota setting and bugfix by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1769
* feat: add loading indicator on UserSelector by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1770
* feat: remove per-vfolder usage stats in Web UI by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1771
* update: spring clean - node.js packages by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1766
* update: reactjs components (2023. 7) by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1775
* refactor: refactoring storage status and add quota per storage volume by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1778
* fix: `newPublicRequest` -> `newSignedRequest` when getting resource-slots by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1776
* feat: add setup GUI for `is_public` to resource group by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1718


**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v23.03.2...v23.03.3

---

## v23.03.2 (05/07/2023)
## What's Changed
* hotfix: enable sftp-scaling-group feature from manager v22.03.3 by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1732
* feat: automatically fill sign up token if query param exists by @kyujin-cho in https://github.com/lablup/backend.ai-webui/pull/1733
* fix: touchup description for ssh sftp session by @lizable in https://github.com/lablup/backend.ai-webui/pull/1734
* fix: set timeout value to 10sec on fetching `user_stats` by @lizable in https://github.com/lablup/backend.ai-webui/pull/1736
* fix: SFTP scaling group session refusing to be created by @kyujin-cho in https://github.com/lablup/backend.ai-webui/pull/1738
* fix: manually add roundup decimal places in used_slots and total_slots by @lizable in https://github.com/lablup/backend.ai-webui/pull/1740
* misc: update image metadata with additional Python and CUDA versions by @adrysn in https://github.com/lablup/backend.ai-webui/pull/1756
* fix: do not auto logout when preserve login true by @chisacam in https://github.com/lablup/backend.ai-webui/pull/1752
* docs: Modified to fit nvidia brand notation by @Yaminyam in https://github.com/lablup/backend.ai-webui/pull/1748
* feat: add support for Furiosa Warboy accelerator by @kyujin-cho in https://github.com/lablup/backend.ai-webui/pull/1702
* feat: hide directory-based usage information based on configuration by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1737
* feature: vfolder v3 setting UI by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1750
* fix: parse fgpu slots to float by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1759
* fix: annotate unused codes by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1760
* hotfix: vfolder quota support by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1762
* cosmetic changes of quota scope setting page by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1763
* fix: used, capacity was changed in the resource panel and change the unset icon by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1764
* compact ui version of storage quota setting by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1765

## New Contributors
* @chisacam made their first contribution in https://github.com/lablup/backend.ai-webui/pull/1752

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v23.03.1...v23.03.2

---

## v23.03.1 / v22.09.21 (30/05/2023)
## What's Changed
* fix:  compile block of Make file for react build multi target (web,app) by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1727
* fix: enable npu resource slider when limited by @lizable in https://github.com/lablup/backend.ai-webui/pull/1729
* fix: let base64 encode convert padding with byte triplet condition by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1731

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v22.09.20...v22.09.21

---

## v23.03.0 / v22.09.20 (25/05/2023)
## What's Changed
* hotfix: remove inline styling applied in force terminate button by @lizable in https://github.com/lablup/backend.ai-webui/pull/1680
* Support local vscode using remote ssh mode to session container by @studioego in https://github.com/lablup/backend.ai-webui/pull/1487
* fix: import `wl-textfield` to display env list to apply in session launcher by @lizable in https://github.com/lablup/backend.ai-webui/pull/1684
* fix: show correct msg when vfolder sharing fails by @lizable in https://github.com/lablup/backend.ai-webui/pull/1673
* fix: unable to launch VSCode in web version by @adrysn in https://github.com/lablup/backend.ai-webui/pull/1685
* add: type annotations for ESM SDK by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1480
* refactor: remove innerHTML-based content rendering on session list status dialog by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1675
* ci: Add size label automation actions job by @Yaminyam in https://github.com/lablup/backend.ai-webui/pull/1688
* feat: add endpoint validation by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1689
* feat: add sorting button to project selector by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1687
* feat: show agent id to session list if `hideAgent` is false by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1691
* add: event-driven metadata reload by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1693
* fix: regression of manually setting HPC optimization value in session launcher by @lizable in https://github.com/lablup/backend.ai-webui/pull/1697
* Revert "fix: regression of manually setting HPC optimization value in session launcher" by @lizable in https://github.com/lablup/backend.ai-webui/pull/1698
* fix: regression of session creation on disabled openmp optimization by @lizable in https://github.com/lablup/backend.ai-webui/pull/1699
* feature: rename usage tab and add info dialog in statistics page by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1692
* feature: folder upload  by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1690
* fix: utilization values in idle checker pop-up are not updated after the initial rendering by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1705
* feat: show idle check information based on only applied configurations#361 by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1703
* feat: support i18n ally extension for VS Code by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1704
* hotfix: Disable the app icon if the user is not the owner of the session. by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1711
* Hotfix/manual image input is not displayed on desktop app by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1709
* feat: configuration to use react component in web component by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1646
* feat: display allocated shared memory in session config column by @lizable in https://github.com/lablup/backend.ai-webui/pull/1710
* feat: set `allowed_session_types` default value and make required. by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1701
* feat: connect ssh / sftp in filebrowser dialog by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1694
* feat: Support max_password_age by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1716
* feat: new `SYSTEM` tab for session list by @kyujin-cho in https://github.com/lablup/backend.ai-webui/pull/1720

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v22.09.19...v22.09.20

---

## v22.09.19 (03/04/2023)
## What's Changed
* feat: add support for setting `inference` as allowed session type by @kyujin-cho in https://github.com/lablup/backend.ai-webui/pull/1668
* fix: escape status info detail message text. by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1670
* refactor: change idle checks column based on changed data structure by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1666
* fix: display explicit message when a user tries to create a session with the same name of a running session by @adrysn in https://github.com/lablup/backend.ai-webui/pull/1674
* fix: add `enqueueOnly` option to image installation by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1672
* fix: unable to open app launcher dialog by @adrysn in https://github.com/lablup/backend.ai-webui/pull/1677
* fix: incorrect display of grace idle period over one day by @adrysn in https://github.com/lablup/backend.ai-webui/pull/1678

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v22.09.18...v22.09.19

---

## v22.09.18 (26/03/2023)
## What's Changed
* fix: use SI unit (e.g., GB not GiB) for quota-related fields by @adrysn in https://github.com/lablup/backend.ai-webui/pull/1650
* fix : remain highlight after click on help button by @kin4496 in https://github.com/lablup/backend.ai-webui/pull/1655
* feat: add confirm dialog for delete credentials by @raipen in https://github.com/lablup/backend.ai-webui/pull/1658
* feat: vscode prettier extension issue by @krokerdile in https://github.com/lablup/backend.ai-webui/pull/1657
* fix: sorting installed environments up when visiting environment menu by @seokiis in https://github.com/lablup/backend.ai-webui/pull/1659
* fix: change messege type of delete user by @raipen in https://github.com/lablup/backend.ai-webui/pull/1662
* fix: add margin to resource preset dialog by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1654
* fix: resize column for resolve disappearing-icon by @raipen in https://github.com/lablup/backend.ai-webui/pull/1663
* fix: session launcher's environment variable editor dialog button is broken in Korean by @krokerdile in https://github.com/lablup/backend.ai-webui/pull/1665
* add: add utilization idle checks column by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1651

## New Contributors
* @kin4496 made their first contribution in https://github.com/lablup/backend.ai-webui/pull/1655
* @raipen made their first contribution in https://github.com/lablup/backend.ai-webui/pull/1658
* @krokerdile made their first contribution in https://github.com/lablup/backend.ai-webui/pull/1657
* @seokiis made their first contribution in https://github.com/lablup/backend.ai-webui/pull/1659

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v22.09.17...v22.09.18

---

## v22.09.17 (23/03/2023)
## What's Changed
* feat: add `allowPreferredPort` to show/hide `Try preferred port` by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1647
* feat: make use of SI/binary prefixes consistent for disk, network, and memory by @lizable in https://github.com/lablup/backend.ai-webui/pull/1636
* add: basic support for IPU / ATOM GUI menu by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1644
* feat: add a host usage indicator to "create vFolder dialog" by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1640
* hotfix: rename `volumeInfo` property to `storageProxyInfo` by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1648
* fix: check if app port checkbox exists by @adrysn in https://github.com/lablup/backend.ai-webui/pull/1649
* feat: display idle checker remaining time by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1645

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v22.09.16...v22.09.17

---

## v22.09.16 (19/03/2023)

## What's Changed
* feat: add service definition for gradio-cat-client by @kyujin-cho in https://github.com/lablup/backend.ai-webui/pull/1635
* feature: show tooltips on every icon in controls tab by @lizable in https://github.com/lablup/backend.ai-webui/pull/1641
* feature: hide vfolder sharing when invite others disabled by @lizable in https://github.com/lablup/backend.ai-webui/pull/1642

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v22.09.15...v22.09.16

---

## v22.09.15 (16/03/2023)
## What's Changed
* update: change '강제종료' to '종료' for multiple session termination button text by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1626
* update: spring-cleaning time (component updates) by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1627
* feat: add force 2fa option by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1628
* add: handle inference type on WebUI by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1586
* feat: display usage_mode to folder-info-dialog by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1639

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v22.09.14...v22.09.15

---

## v22.09.14 (09/03/2023)
## What's Changed
* fix: minor capital letter issue by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1619
* fix: 2FA item in user preference menu is not displayed after the initial login by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1622
* fix: apply ellipsis when username or userid exceeds total width of user dropdown menu by @lizable in https://github.com/lablup/backend.ai-webui/pull/1624
* hotfix: Remove the waiting text in the login dialog in typing OTP by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1623

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v22.09.13...v22.09.14

---

## v22.09.13 (05/03/2023)
## What's Changed
* feat: set columns in the registry-list page to be resizable by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1613
* feat: add the flag to hide 2fa by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1612
* style: display all characters of session image tag by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1614
* fix: get `totpSupported` flag asynchronously by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1615
* refactor: change 2FA option name: `hide2FA` -> `enable2FA` by @adrysn in https://github.com/lablup/backend.ai-webui/pull/1616

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v22.09.12...v22.09.13

---

## v22.09.12 (26/02/2023)
## What's Changed
* fix: expand space between resources displaying and fix decimal points by @lizable in https://github.com/lablup/backend.ai-webui/pull/1603
* fix: align gpu process bar by @leejiwon1125 in https://github.com/lablup/backend.ai-webui/pull/1585
* fix: allow any special characters in password input by @adrysn in https://github.com/lablup/backend.ai-webui/pull/1606
* ci: add an `add-to-project` workflow by @Yaminyam in https://github.com/lablup/backend.ai-webui/pull/1590
* fix: display all available presets when `always_enqueue_compute_session` options is configured by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1607
* hotfix: typo errors in getting 2FA by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1604
* refactor: display total remaining resources in resource group indicator by @adrysn in https://github.com/lablup/backend.ai-webui/pull/1610

## New Contributors
* @leejiwon1125 made their first contribution in https://github.com/lablup/backend.ai-webui/pull/1585

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v22.09.11...v22.09.12

---

## v22.09.11 (20/02/2023)
## What's Changed
* feature: show total resource group amount in resource monitor gauge by @lizable in https://github.com/lablup/backend.ai-webui/pull/1593
* feat: add support for TOTP integration by @kyujin-cho in https://github.com/lablup/backend.ai-webui/pull/1596
* fix: increase item count 20 -> 100 for agent summary list query by @adrysn in https://github.com/lablup/backend.ai-webui/pull/1599
* feature: 2fa management by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1600

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v22.09.10...v22.09.11

---

## v22.09.10 (17/02/2023)
## What's Changed
* fix: incorrect display of GPU memory utilization by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1588
* fix: incorrect assignment of signin mode config by @adrysn in https://github.com/lablup/backend.ai-webui/pull/1591
* add: more CSS injection point to custom.css by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1594

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v22.09.9...v22.09.10

---

## v22.09.9 (12/02/2023)
## What's Changed
* hotfix: broken environment list UI because of the unmatched tag by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1571
* fix: merge splitted conditional render html template on controls column by @lizable in https://github.com/lablup/backend.ai-webui/pull/1574
* feat: Add modal to enter SSH keypair manually by @yomybaby in https://github.com/lablup/backend.ai-webui/pull/1578
* feat: display CUDA memory utilization in node and session pages by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1572
* bugfix: insert a dash in image Requirements (tag) in launching a compute session by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1576
* feat: add status column and disable deleting folders by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1573
* fix: display cuda memory utilization info even if its value is zero by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1580
* misc: change data folder's status color by @adrysn in https://github.com/lablup/backend.ai-webui/pull/1581

## New Contributors
* @yomybaby made their first contribution in https://github.com/lablup/backend.ai-webui/pull/1578

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v22.09.8...v22.09.9

---

## v22.09.8 (04/02/2023)
## What's Changed
* update: change slash / colon escaping to apply whole string by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1556
* fix: temporally comment out unused folder usage mode by @lizable in https://github.com/lablup/backend.ai-webui/pull/1562
* fix: wrapping notice-ticker to fit in the layout with bigger font-size by @lizable in https://github.com/lablup/backend.ai-webui/pull/1563
* feat: add disk column on agent tab and display the total capacity of the storage by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1567
* fix: refactor vfolder quota setting dialog by @lizable in https://github.com/lablup/backend.ai-webui/pull/1566
* Fix: remove '.git' suffix about git repos by @studioego in https://github.com/lablup/backend.ai-webui/pull/1565
* refactor: limit the maximum height of announcement panels by @adrysn in https://github.com/lablup/backend.ai-webui/pull/1568
* refactor/add more sort columns for multiple pages by @adrysn in https://github.com/lablup/backend.ai-webui/pull/1570
* update: package running script to npx-based CLI by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1558

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v22.09.7...v22.09.8

---

## v22.09.7 (25/01/2023)
## What's Changed
* style: set font-weight for readability and align `lablup-shields` as center by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1542
* fix: call `toString` method in setting quota value by @adrysn in https://github.com/lablup/backend.ai-webui/pull/1547
* feat: add sort feature for endpoint, starts, and schedulable columns in Agent list page by @ChangHoon-Sung in https://github.com/lablup/backend.ai-webui/pull/1546
* add: new environment image tag parsing aliases by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1535
* fix: display full image tags in session launcher and environment list to better distinguish images with long similar tags by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1549
* chore(deps): bump decode-uri-component from 0.2.0 to 0.2.2 by @dependabot in https://github.com/lablup/backend.ai-webui/pull/1527
* feat/fix: initialize aliases after successfully creating a session and fix the error that mounts using another name by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1545
* fix: minor typo errors which block compile by @fregataa in https://github.com/lablup/backend.ai-webui/pull/1548
* bugfix: gpu, fgpu progress bar are always zero by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1553
* update: check login status to show notification after logout by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1554

## New Contributors
* @ChangHoon-Sung made their first contribution in https://github.com/lablup/backend.ai-webui/pull/1546
* @fregataa made their first contribution in https://github.com/lablup/backend.ai-webui/pull/1548

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v22.09.6...v22.09.7

---

## v22.09.6 (09/01/2023)
## What's Changed
* feat: add IBM Spectrum Scale and WekaIO to quota support storage list by @adrysn in https://github.com/lablup/backend.ai-webui/pull/1537

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v22.09.5...v22.09.6

---

## v22.09.5 (03/01/2023)
## What's Changed
* fix: build correct app url in `_terminateApp` regardless of the existence of trailing slash by @adrysn in https://github.com/lablup/backend.ai-webui/pull/1533
* fix: broken logic in initializing browser backendai client by @adrysn in https://github.com/lablup/backend.ai-webui/pull/1532
* feat: show all resource templates when `alwaysEnqueueComputeSession` is true by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1530

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v22.09.4...v22.09.5

---

## v22.09.4 (09/12/2022)
## What's Changed
* feat: add support for header based authentication on wsproxy by @kyujin-cho in https://github.com/lablup/backend.ai-webui/pull/1528
* Show warning dialog and validation message when setting rate limit below 100 by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1482

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v22.09.3...v22.09.4

---

## v22.09.3 (27/11/2022)
## What's Changed
* add: Electron app debugging content on README by @studioego in https://github.com/lablup/backend.ai-webui/pull/1485
* style: change `modify-env-dialog` style by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1476
* fix: remove the invalid redirect URL for vnc-web by @adrysn in https://github.com/lablup/backend.ai-webui/pull/1496
* fix: build correct app url regardless of the existence of trailing slash by @adrysn in https://github.com/lablup/backend.ai-webui/pull/1497
* feature: unify folder view icon and directory list into one column by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1490
* update: remove template from vaadin table for resource group by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1491
* fix: typo error by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1498
* feature: modular top-bar items by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1489
* fix: modify y-axis value setting callback function to have only unique integer values. by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1501
* ci: Fix sync-labels option error by @Yaminyam in https://github.com/lablup/backend.ai-webui/pull/1500
* fix: can't upload to vfolder after canceling upload by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1502
* fix: make available to select project in creating the project data folder by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1506
* feature: Open dialog and add credential with URL option by @snaag in https://github.com/lablup/backend.ai-webui/pull/1495
* fix: show session language description by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1507
* feature: chore(backend-ai-dialog): translate new-keypair-dialog in kor by @100sun in https://github.com/lablup/backend.ai-webui/pull/1494
* hotfix: remove invalid import statements by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1512
* feature: add download link button for webui desktop by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1503
* feature: add log download button on session log dialog by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1505
* fix: send preferred port when only checked by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1516
* feature: update data handling part in receiving and updating keypair resource policy by @lizable in https://github.com/lablup/backend.ai-webui/pull/1517
* Revert "Feature/update data handling part in receiving and updating keypair resource policy (#1517)" by @lizable in https://github.com/lablup/backend.ai-webui/pull/1519
* feature: update data handling on keypair resource policy by @lizable in https://github.com/lablup/backend.ai-webui/pull/1520
* fix: TOS dialog doesn't show because of id mismatching by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1518
* feature: add sticky title option to `backend-ai-dialog` by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1514
* add: header-based session login feature by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1521

## New Contributors
* @snaag made their first contribution in https://github.com/lablup/backend.ai-webui/pull/1495
* @100sun made their first contribution in https://github.com/lablup/backend.ai-webui/pull/1494

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v22.09.2...v22.09.3

---

## v22.09.2 (28/10/2022)
## What's Changed
* feature : annotate plastic components and ESModule SDK by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1479
* feature: allow plugins work as hidden page plugin. by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1481
* fix: Cannot set the maximum shared memory size via configuration by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1483

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v22.09.1...v22.09.2

---

## v22.09.1 (19/09/2022)
## What's Changed
* update: lit and mwc-components to the latest version by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1445
* refactor: use type alias for `listCondition` by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1447
* feature: add extra information in the last page of session launcher by @mihilt in https://github.com/lablup/backend.ai-webui/pull/1427
* update: typing shadowRoot from any type by @Jaewoook in https://github.com/lablup/backend.ai-webui/pull/1359
* feature: add agent summary page by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1439
* fix: rename `BackendAIAgent` to `BackendAIAgentSummaryList` and add detail typings by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1449
* fix: remove animation of buttons that do not trigger other events by @jangjichang in https://github.com/lablup/backend.ai-webui/pull/1454
* style: unify style of the list by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1456
* fix: add type-check before initializing chart by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1459
* hotfix: add type definition to show `agent-summary-list` by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1457
* update: node.js base version to 18 by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1461
* style: total allocation pane is too big by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1463
* fix: add title to show what the Control icons do by @di-uni in https://github.com/lablup/backend.ai-webui/pull/1465
* fix: cluster size slider to be active by cluster mode selection by @Jaewoook in https://github.com/lablup/backend.ai-webui/pull/1356
* feature: send target app's protocol (http or tcp) when starting wsproxy by @kyujin-cho in https://github.com/lablup/backend.ai-webui/pull/1211
* fix: remove animations from which events do not occur by @suyeon12 in https://github.com/lablup/backend.ai-webui/pull/1472
* style: adjust the License Key button size by @ky3vin in https://github.com/lablup/backend.ai-webui/pull/1477
* fix: add helper dialog for endpoint by @di-uni in https://github.com/lablup/backend.ai-webui/pull/1473

## New Contributors
* @jangjichang made their first contribution in https://github.com/lablup/backend.ai-webui/pull/1454
* @di-uni made their first contribution in https://github.com/lablup/backend.ai-webui/pull/1465
* @suyeon12 made their first contribution in https://github.com/lablup/backend.ai-webui/pull/1472
* @ky3vin made their first contribution in https://github.com/lablup/backend.ai-webui/pull/1477

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v22.09.0...v22.09.1

---

## v22.09.0 (31/08/2022)
## What's Changed
* fix: add validation check and enable button only valid status in import and run page by @mihilt in https://github.com/lablup/backend.ai-webui/pull/1400
* hotfix: don't show the Environments Images list by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1431
* fix: automatically set the height of `list-wrapper`, which wraps grids, to avoid the height mismatch between the two elements by @lizable in https://github.com/lablup/backend.ai-webui/pull/1436
* feature: display richer agent information by @lizable in https://github.com/lablup/backend.ai-webui/pull/1435
* fix: CUDA utilization was displayed as `Infinity` by @adrysn in https://github.com/lablup/backend.ai-webui/pull/1437
* fix: disable container commit when session is batch type by @lizable in https://github.com/lablup/backend.ai-webui/pull/1438
* Feature: refactor pipeline by @lizable in https://github.com/lablup/backend.ai-webui/pull/1221
* refactor: temporally block pages related to pipeline menu by @lizable in https://github.com/lablup/backend.ai-webui/pull/1440
* hotfix: remove wrong parsing number logic in initial configuration by @lizable in https://github.com/lablup/backend.ai-webui/pull/1444
* bugfix: list status unrecognized by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1441

## New Contributors
* @mihilt made their first contribution in https://github.com/lablup/backend.ai-webui/pull/1400

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v22.03.7...v22.09.0

---

## v22.03.7 (22/08/2022)
## What's Changed
* Feature: webui grid status by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1138
* Hotfix: Temporally disable terminate and container commit on running session by @lizable in https://github.com/lablup/backend.ai-webui/pull/1425
* feature: display message when session's status is `no-available-instances` by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1426


**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v22.03.6...v22.03.7

---

## v22.03.6 (18/08/2022)
## What's Changed
* add: Required field for validation whether input field in command area by @lizable in https://github.com/lablup/backend.ai-webui/pull/1408
* fix: show the modified registry information by @dan-2ee in https://github.com/lablup/backend.ai-webui/pull/1385
* feature: support SSO login (SAML 2.0) by @adrysn in https://github.com/lablup/backend.ai-webui/pull/1413
* fix: save button was not working due to the wrong function call by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1418
* style: remove `flex-grow="0"` from paramaters column in log page by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1421
* ci: pr auto author assign by @Yaminyam in https://github.com/lablup/backend.ai-webui/pull/1420
* fix: do not allow blank username / password by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1423
* feature: provide toggle(enable/disable) in project field by @dan-2ee in https://github.com/lablup/backend.ai-webui/pull/1414
* fix: inconsistent login style by @Jaewoook in https://github.com/lablup/backend.ai-webui/pull/1411
* change: es-dev-server to @web/dev-server by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1403
* fix: SAML login via form submit instead of `fetch` by @adrysn in https://github.com/lablup/backend.ai-webui/pull/1419
* feature: provide UI for requesting container commit by @lizable in https://github.com/lablup/backend.ai-webui/pull/1412

## New Contributors
* @Yaminyam made their first contribution in https://github.com/lablup/backend.ai-webui/pull/1420

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v22.03.5...v22.03.6

---

## v22.03.5  (04/08/2022)
## What's Changed
* feature: application signing with GitHub Actions by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1308
* hotfix: hide resource statics panel when login by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1407


**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v22.03.4...v22.03.5

---

## v22.03.4  (04/08/2022)
## What's Changed
* add: storage host that supports directory based quota setting by @lizable in https://github.com/lablup/backend.ai-webui/pull/1332
* fix: mount shared folders when creating a session by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1340
* hotfix: import client-esm to fix backend-ai client ReferenceError by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1339
* fix: support wd permission in initial sharing process by @Jaewoook in https://github.com/lablup/backend.ai-webui/pull/1351
* fix typo and translate into Korean by @studioego in https://github.com/lablup/backend.ai-webui/pull/1348
* Fix: Add missing configurations by @lizable in https://github.com/lablup/backend.ai-webui/pull/1343
* docs: Clarify dev-setup guide and fix code-block formats by @achimnol in https://github.com/lablup/backend.ai-webui/pull/1341
* fix: make gpu required image available to download by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1337
* fix: prevents resource policy updates with incorrect values by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1338
* feat: allow user to force termination of sessions by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1358
* feat(wsproxy): Add dotenv support and parse env-vars more carefully by @achimnol in https://github.com/lablup/backend.ai-webui/pull/1363
* fix: show resource statistics about current resource group by @dan-2ee in https://github.com/lablup/backend.ai-webui/pull/1362
* feat: option to enqueue compute session by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1162
* feat: refresh image list after rescanning by @YejeeHa in https://github.com/lablup/backend.ai-webui/pull/1090
* fix: change the size of the popup to fit the text by @dan-2ee in https://github.com/lablup/backend.ai-webui/pull/1383
* fix: side menu icon button ripple to disappear after click by @Jaewoook in https://github.com/lablup/backend.ai-webui/pull/1361
* fix: Refactor mwc-select&mwc-list-item style & layout (#1207) by @studioego in https://github.com/lablup/backend.ai-webui/pull/1319
* Feature: refactor storage host selection by @lizable in https://github.com/lablup/backend.ai-webui/pull/1327
* fix: disable resource policy control button for domain admin by @Jaewoook in https://github.com/lablup/backend.ai-webui/pull/1386
* fix: parse unicode strings for some items in the toml config by @adrysn in https://github.com/lablup/backend.ai-webui/pull/1395
* fix: Incorrect warning message is output when allocating a size small… by @hotkimho in https://github.com/lablup/backend.ai-webui/pull/1399
* fix: typo in Korean translation for SessionTerminated by @Jaewoook in https://github.com/lablup/backend.ai-webui/pull/1401
* build(deps): bump moment from 2.29.3 to 2.29.4 by @dependabot in https://github.com/lablup/backend.ai-webui/pull/1372
* fix: Manual image name is not required in Session launcher by @dan-2ee in https://github.com/lablup/backend.ai-webui/pull/1397

## New Contributors
* @Jaewoook made their first contribution in https://github.com/lablup/backend.ai-webui/pull/1351
* @achimnol made their first contribution in https://github.com/lablup/backend.ai-webui/pull/1341
* @dan-2ee made their first contribution in https://github.com/lablup/backend.ai-webui/pull/1362
* @hotkimho made their first contribution in https://github.com/lablup/backend.ai-webui/pull/1399

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v22.03.3...v22.03.4

---

## v22.03.3 (26/06/2022)
## What's Changed
* refactor: querySelector with leading Number id string(#1321) by @studioego in https://github.com/lablup/backend.ai-webui/pull/1322
* fix: some session description dialog does not appear. by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1323
* feat: distinguish image tag for Custom Environments(#1255) by @studioego in https://github.com/lablup/backend.ai-webui/pull/1324
* fix: css variable typo error on `mwc` by @lizable in https://github.com/lablup/backend.ai-webui/pull/1325
* feat : encode basic info without ssl by @inureyes in https://github.com/lablup/backend.ai-webui/pull/1331
* fix: mounted folders change to unchecked after moving the session launcher page. by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1334
* build(deps): bump shell-quote from 1.7.2 to 1.7.3 by @dependabot in https://github.com/lablup/backend.ai-webui/pull/1333

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v22.03.2...v22.03.3

---

## v22.03.2 (25/05/2022)

NOTE: This WebUI version is for Backend.AI cluster 22.03. Please use [latest 22.09 version](https://github.com/lablup/backend.ai-webui/releases/tag/v21.09.3) if you are Backend.AI cluster 21.03 / 21.09 user.

## What's Changed
* fix: `ResourceGroup` typo error ( #1311 ) by @studioego in https://github.com/lablup/backend.ai-webui/pull/1312
* fix: logic error on validating scheduler options in creating resource group by @lizable in https://github.com/lablup/backend.ai-webui/pull/1314
* Hotfix: translation for missing content by @lizable in https://github.com/lablup/backend.ai-webui/pull/1315
* Feature: enable filebrowser in readonly folder by @lizable in https://github.com/lablup/backend.ai-webui/pull/1313
* Fix: display rich and more detailed msg in status info of session by @lizable in https://github.com/lablup/backend.ai-webui/pull/1316
* fix: extend resources control detail popup width by @studioego in https://github.com/lablup/backend.ai-webui/pull/1310
* fix: add the value of `wsproxy_addr` so that reflecting the setting value by @Sujin-Kim1 in https://github.com/lablup/backend.ai-webui/pull/1317
* fix: consistent use of versioned wsproxy url in app launching and termination by @adrysn in https://github.com/lablup/backend.ai-webui/pull/1318


**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v22.03.1...v22.03.2

---

## v22.03.1 (10/05/2022)

NOTE: This WebUI version is for Backend.AI cluster 22.03. Please use [latest 22.09 version](https://github.com/lablup/backend.ai-webui/releases/tag/v21.09.3) if you are Backend.AI cluster 21.03 / 21.09 user.


#### Enhancements:

- [**enhancement**] support to select folder hosts for import Github/Gitlab [#1278](https://github.com/lablup/backend.ai-webui/issues/1278)
- [**enhancement**][**UI / UX**] Show vfolder host when creating a session [#1271](https://github.com/lablup/backend.ai-webui/issues/1271)
- [**enhancement**][**UI / UX**] Show only folders that included in the allowed folder hosts [#1270](https://github.com/lablup/backend.ai-webui/issues/1270)
- [**enhancement**][**UI / UX**][**maintenance**][**web**] Support to import Gitlab repository [#1267](https://github.com/lablup/backend.ai-webui/issues/1267)
- [**enhancement**][**good first issue**][**easy**][**UI / UX**] Let's provide Create/Update UI for `scheduler_opts` in scaling group [#1190](https://github.com/lablup/backend.ai-webui/issues/1190)
- [**enhancement**][**good first issue**][**minor**][**easy**] Alert users with notification dialog when the user needs to update their password [#1183](https://github.com/lablup/backend.ai-webui/issues/1183)
- [**enhancement**][**good first issue**][**easy**][**UI / UX**] Add margins to policy dialog to distinguish fields [#1111](https://github.com/lablup/backend.ai-webui/issues/1111)
- [**enhancement**][**good first issue**][**easy**][**UI / UX**] Make the text of the config button horizontally. [#1110](https://github.com/lablup/backend.ai-webui/issues/1110)

#### Bug Fixes:

- [**bug**] Custom resource allocation panel is broken [#1292](https://github.com/lablup/backend.ai-webui/issues/1292)
- [**bug**][**app**] Unable to import GitHub repository in a desktop app [#1288](https://github.com/lablup/backend.ai-webui/issues/1288)
- [**bug**][**app**] Max memory per container is limited to 16GB in desktop app [#1287](https://github.com/lablup/backend.ai-webui/issues/1287)
- [**bug**] Clicking "RUNNING" tab will issue many requests to fetch the session list [#1274](https://github.com/lablup/backend.ai-webui/issues/1274)
- [**bug**][**good first issue**][**easy**][**UI / UX**] GPU value is broken when creating a cluster session (N=3) with 0.3 fGPU [#1249](https://github.com/lablup/backend.ai-webui/issues/1249)
- [**bug**][**good first issue**][**minor**][**UI / UX**] Initialize all fields in the create-registry-dialog.  [#1204](https://github.com/lablup/backend.ai-webui/issues/1204)
- [**bug**][**good first issue**][**UI / UX**] A wide blank is created when reducing the size of window. [#1202](https://github.com/lablup/backend.ai-webui/issues/1202)
- [**bug**][**UI / UX**][**blocker**] Login is not working from develop environment to cloud [#706](https://github.com/lablup/backend.ai-webui/issues/706)

---

## v22.03.0 (12/04/2022)

NOTE: This WebUI version is for Backend.AI cluster 22.03. Please use [latest 22.09 version](https://github.com/lablup/backend.ai-webui/releases/tag/v21.09.3) if you are Backend.AI cluster 21.03 / 21.09 user.

#### Enhancements:

- [**enhancement**][**good first issue**][**UI / UX**] Show Scheduler Options using lablup shields component. [#1263](https://github.com/lablup/backend.ai-webui/issues/1263)
- [**enhancement**][**minor**][**easy**] An option to mask user's information [#1251](https://github.com/lablup/backend.ai-webui/issues/1251)
- [**enhancement**][**minor**][**easy**] Display bootstrap script button in user settings page [#1248](https://github.com/lablup/backend.ai-webui/issues/1248)
- [**enhancement**][**minor**][**UI / UX**] Enable terminal app for a batch-type session [#1243](https://github.com/lablup/backend.ai-webui/issues/1243)
- [**bug**][**enhancement**][**good first issue**][**UI / UX**] Session resource allocation doesn't match [#1199](https://github.com/lablup/backend.ai-webui/issues/1199)
- [**bug**][**enhancement**][**good first issue**][**UI / UX**] support mini ui for session tab [#1198](https://github.com/lablup/backend.ai-webui/issues/1198)
- [**enhancement**] Support session renaming [#1176](https://github.com/lablup/backend.ai-webui/issues/1176)
- [**enhancement**][**good first issue**][**UI / UX**] Add a new page into the new-session-dialog. [#1107](https://github.com/lablup/backend.ai-webui/issues/1107)
- [**enhancement**][**good first issue**][**UI / UX**] Improve the design of the custom allocation in the session creation dialog. [#1094](https://github.com/lablup/backend.ai-webui/issues/1094)
- [**enhancement**][**library / SDK**][**UI / UX**][**enterprise**][**cloud**] Attach virtual folder with alias name [#1081](https://github.com/lablup/backend.ai-webui/issues/1081)
- [**enhancement**][**good first issue**][**minor**][**easy**][**UI / UX**] Let's provide filter on status and user name. [#1077](https://github.com/lablup/backend.ai-webui/issues/1077)
- [**enhancement**][**good first issue**][**easy**][**UI / UX**] Let's display image name in the last page of the session launcher [#1074](https://github.com/lablup/backend.ai-webui/issues/1074)
- [**enhancement**][**good first issue**][**library / SDK**][**UI / UX**][**blocker**] Option to change number of retries to skip session start [#960](https://github.com/lablup/backend.ai-webui/issues/960)

#### Bug Fixes:

- [**bug**][**UI / UX**][**blocker**] Even if there is a gpu available, the gpu slider is disabled. [#1268](https://github.com/lablup/backend.ai-webui/issues/1268)
- [**bug**] Failing to update a compute session's name will set the value of edit element to `undefined` [#1260](https://github.com/lablup/backend.ai-webui/issues/1260)
- [**bug**][**good first issue**][**easy**][**UI / UX**] vfolder invitee doesn't appear properly. [#1232](https://github.com/lablup/backend.ai-webui/issues/1232)
- [**bug**][**good first issue**][**minor**][**easy**][**UI / UX**] Korean translation related to the session rename does not work properly. [#1229](https://github.com/lablup/backend.ai-webui/issues/1229)
- [**bug**][**good first issue**][**minor**][**easy**][**UI / UX**] The folder ID does not appear. [#1226](https://github.com/lablup/backend.ai-webui/issues/1226)
- [**bug**][**minor**] Unable to import GitHub repository if "master" is not the default branch [#1224](https://github.com/lablup/backend.ai-webui/issues/1224)
- [**bug**][**minor**][**easy**][**UI / UX**] lablup-silder generates forbidden min/max value error [#1223](https://github.com/lablup/backend.ai-webui/issues/1223)
- [**bug**][**minor**][**UI / UX**]  lablup-shields does not work on environment selector [#1222](https://github.com/lablup/backend.ai-webui/issues/1222)
- [**bug**][**minor**][**blocker**] `Auto-logout` feature seems not working properly [#1173](https://github.com/lablup/backend.ai-webui/issues/1173)
- [**bug**][**good first issue**][**easy**][**UI / UX**] Prevent to disappear the login dialog when the esc button is pressed. [#1168](https://github.com/lablup/backend.ai-webui/issues/1168)
- [**bug**][**UI / UX**][**cloud**] The graph of statistic page doesn't respond. [#1147](https://github.com/lablup/backend.ai-webui/issues/1147)
- [**bug**][**good first issue**][**minor**] Text overlapping of the resources in the "Total Allocation" panel [#1122](https://github.com/lablup/backend.ai-webui/issues/1122)

---

## v21.09.3 (13/01/2022)

#### Enhancements:

- [**bug**][**enhancement**][**minor**][**easy**][**urgency**] Add an option to hide the [invitation token field] and [email sent dialog] during user signup [#1185](https://github.com/lablup/backend.ai-webui/issues/1185)
- [**enhancement**][**UI / UX**][**urgency**] Let's support batch session UI. [#1180](https://github.com/lablup/backend.ai-webui/issues/1180)
- [**enhancement**][**good first issue**][**easy**][**UI / UX**][**urgency**] UI to query and update Agent's schedulable field [#1166](https://github.com/lablup/backend.ai-webui/issues/1166)
- [**enhancement**][**major**][**hard**][**library / SDK**][**UI / UX**][**maintenance**] Migrate lit-element to lit 1.0 rc [#966](https://github.com/lablup/backend.ai-webui/issues/966)
- [**enhancement**][**major**][**library / SDK**][**UI / UX**] Let's show status detail when user created session is pending or failed in session list  [#882](https://github.com/lablup/backend.ai-webui/issues/882)

#### Bug Fixes:

- [**bug**] Unable to allocate a GPU in device mode when there is only on GPU is left and the minimum required GPU of an environment image is set to 1 [#1191](https://github.com/lablup/backend.ai-webui/issues/1191)
- [**bug**][**blocker**] Unable to mount a data folder in creating a compute session [#1184](https://github.com/lablup/backend.ai-webui/issues/1184)
- [**bug**][**good first issue**][**easy**][**UI / UX**] Let's split the display for signup button and change password button independently [#1179](https://github.com/lablup/backend.ai-webui/issues/1179)
- [**bug**][**good first issue**][**UI / UX**] App does not launch when clicking image part of the app button [#1175](https://github.com/lablup/backend.ai-webui/issues/1175)
- [**bug**][**UI / UX**][**urgency**] Progress bar does not appear in uploading a file in the file explorer [#1164](https://github.com/lablup/backend.ai-webui/issues/1164)
- [**bug**][**good first issue**][**easy**][**UI / UX**] Resources description in Configuration column of session list record overlaps when resource exceeds certain values. [#1125](https://github.com/lablup/backend.ai-webui/issues/1125)
- [**bug**][**good first issue**][**easy**][**UI / UX**] ToS(Terms of Service) / Privacy Policy dialog disappears after closing one of them. [#1123](https://github.com/lablup/backend.ai-webui/issues/1123)

---

## v21.09.2 (11/11/2021)

#### Bug Fixes:

- [**bug**] Error on visiting Data & Storage page [#1158](https://github.com/lablup/backend.ai-webui/issues/1158)

---

## v21.09.1 (21/10/2021)

#### Bug Fixes:

- [**bug**][**minor**] List components generate allItems is not iterable error [#1156](https://github.com/lablup/backend.ai-webui/issues/1156)
- [**bug**][**easy**][**blocker**][**urgency**] Web-UI always follows v2 wsproxy path [#1154](https://github.com/lablup/backend.ai-webui/issues/1154)
- [**bug**] Data list is not shown when user refreshes on the folder list page [#1153](https://github.com/lablup/backend.ai-webui/issues/1153)

---

## v21.09.0 (21/10/2021)

#### Enhancements:

- [**enhancement**][**minor**][**easy**][**UI / UX**] Update help link from console to webui [#1149](https://github.com/lablup/backend.ai-webui/issues/1149)
- [**enhancement**][**minor**][**UI / UX**] Searchable filter on Data / virtual folder items [#1148](https://github.com/lablup/backend.ai-webui/issues/1148)
- [**enhancement**][**major**][**UI / UX**][**urgency**] Support XFS backend-specific disk quota UI [#1146](https://github.com/lablup/backend.ai-webui/issues/1146)
- [**enhancement**][**major**][**library / SDK**] Add support for direct wsproxy connection mode to agents [#1144](https://github.com/lablup/backend.ai-webui/issues/1144)
- [**enhancement**] Hide specific information from log file [#1136](https://github.com/lablup/backend.ai-webui/issues/1136)
- [**enhancement**] Option UI to turn off accelerated computing [#1119](https://github.com/lablup/backend.ai-webui/issues/1119)
- [**enhancement**][**good first issue**][**easy**][**UI / UX**] Unify padding on all pages. [#1108](https://github.com/lablup/backend.ai-webui/issues/1108)
- [**enhancement**][**UI / UX**] Support for modifying registry configurations [#1102](https://github.com/lablup/backend.ai-webui/issues/1102)

#### Bug Fixes:

- [**bug**] Remove one of the two scrolls in the TOS/PP dialog [#1139](https://github.com/lablup/backend.ai-webui/issues/1139)

---

## v21.03.11 (13/09/2021)

#### Bugfixes

- [**bug**][**blocker**][**UI / UX**][**minor**]  remove legacy code in user creation [#1127](https://github.com/lablup/backend.ai-webui/pull/1127)

---

## v21.03.10 (02/09/2021)

#### Enhancements:

- [**enhancement**][**UI / UX**] add overlay network settings dialog and increase code flexibility [#1120](https://github.com/lablup/backend.ai-webui/issues/1120)
- [**enhancement**] Option UI to modify accelerated computing parameters [#1119](https://github.com/lablup/backend.ai-webui/issues/1119)
- [**enhancement**] Change the width of the Resource Statistics panel to be the same as the Session list panel. [#1113](https://github.com/lablup/backend.ai-webui/issues/1113)
- [**enhancement**] Support Indonesian language [#1100](https://github.com/lablup/backend.ai-webui/issues/1100)
- [**enhancement**] Support Mongolian language [#1099](https://github.com/lablup/backend.ai-webui/issues/1099)

#### Bugfixes

- [**bug**][**UI / UX**] change width Resource Statics panel [#1117](https://github.com/lablup/backend.ai-webui/pull/1117)
- [**bug**][**maintenance**][**minor**] cannot build docker-compose [#1116](https://github.com/lablup/backend.ai-webui/pull/1116)
- [**blocker**][**UI / UX**][**minor**]  comment out number of file item in folder info dialog [#1101](https://github.com/lablup/backend.ai-webui/pull/1101)

---

## v21.03.9 (09/08/2021)

#### Enhancements:

- [**enhancement**][**major**][**library / SDK**][**UI / UX**][**enterprise**] General image allowlist [#1096](https://github.com/lablup/backend.ai-webui/issues/1096)
- [**enhancement**][**minor**] Uneven margin at `Force Quit` button [#1091](https://github.com/lablup/backend.ai-webui/issues/1091)
- [**enhancement**][**good first issue**][**easy**][**UI / UX**] Let's expand the range of Change User Info menu to show AK/SK of the logined account [#1058](https://github.com/lablup/backend.ai-webui/issues/1058)
- [**enhancement**][**good first issue**][**minor**][**UI / UX**] Let's disable description icon in controls panel of Storages tab in Resources page  [#1055](https://github.com/lablup/backend.ai-webui/issues/1055)
- [**enhancement**] Clean-up button layout [#1016](https://github.com/lablup/backend.ai-webui/issues/1016)

#### Bug Fixes:

- [**bug**][**minor**] Inconsistent width of environment dropdown menu in the session launch dialog [#1084](https://github.com/lablup/backend.ai-webui/issues/1084)

---

## v21.03.8 (26/07/2021)

#### Enhancements:

- [**UI / UX**][**enhancement**][**minor**] Increase default resource limit [#1083](https://github.com/lablup/backend.ai-webui/issues/1083)
- [**UI / UX**][**library / SDK**][**cloud**][**major**][**localization**] Attach virtual folder with alias name [#1081](https://github.com/lablup/backend.ai-webui/issues/1081)

#### Bug Fixes:

- [**UI / UX**][**library / SDK**][**minor**][**blocker**][**urgency**] Decimal point fixing in resource slots [#1079](https://github.com/lablup/backend.ai-webui/issues/1079)

---

## v21.03.7 (19/07/2021)

#### Enhancements:

- [**UI / UX**][**easy**][**enhancement**][**good first issue**] Let's synchronize the speed of the progress bar and the current page of new session launcher. [#1073](https://github.com/lablup/backend.ai-webui/issues/1073)

#### Bug Fixes:

- [**UI / UX**][**blocker**][**bug**][**easy**][**good first issue**][**urgency**] Manual image doesn't get applied in a session creating process. [#1069](https://github.com/lablup/backend.ai-webui/issues/1069)
- [**UI / UX**][**bug**][**easy**][**good first issue**] clamping shared memory according to max shared memory value in config file doesn't work [#1063](https://github.com/lablup/backend.ai-webui/issues/1063)

---

## v21.03.6 (14/07/2021)

#### Enhancements:

- [**UI / UX**][**enhancement**][**enterprise**][**minor**] Manual image name support without debug flag [#1052](https://github.com/lablup/backend.ai-webui/issues/1052)
- [**UI / UX**][**enhancement**][**minor**] Support longer host name for new virtual folder [#1049](https://github.com/lablup/backend.ai-webui/issues/1049)
- [**UI / UX**][**enhancement**][**localization**] Support French language [#1038](https://github.com/lablup/backend.ai-webui/issues/1038)
- [**enhancement**][**localization**] Support Russian language [#1037](https://github.com/lablup/backend.ai-webui/issues/1037)
- [**UI / UX**][**enhancement**][**enterprise**] More injection points for site-specific custom CSS [#1015](https://github.com/lablup/backend.ai-webui/issues/1015)
- [**UI / UX**][**enhancement**][**enterprise**][**major**] Prevent login trial for monitor (bot) user [#997](https://github.com/lablup/backend.ai-webui/issues/997)
- [**UI / UX**][**enhancement**][**working**] Apply carousel UI in current session-launcher [#915](https://github.com/lablup/backend.ai-webui/issues/915)

#### Bug Fixes:

- [**bug**] BackendAiSessionLauncher is duplicated declaration. [#1056](https://github.com/lablup/backend.ai-webui/issues/1056)
- [**bug**][**easy**] Waiting animation shows up when session cookies for login is empty [#1047](https://github.com/lablup/backend.ai-webui/issues/1047)
- [**UI / UX**][**bug**][**good first issue**] dropdown UI in modify permissions dialog in Data & Storage menu gets updated although it's not applied [#949](https://github.com/lablup/backend.ai-webui/issues/949)

---

## v21.03.5 (07/06/2021)

#### Enhancements:

- [**UI / UX**][**enhancement**][**library / SDK**][**minor**] Support for SCHEDULED session with conditional manager version [#1013](https://github.com/lablup/backend.ai-webui/issues/1013)
- [**UI / UX**][**enhancement**][**good first issue**] Modify top bar style [#1004](https://github.com/lablup/backend.ai-webui/issues/1004)

#### Bug Fixes:

- [**UI / UX**][**bug**][**good first issue**][**minor**] When user see login form, cloud icon has different style [#1011](https://github.com/lablup/backend.ai-webui/issues/1011)
- [**UI / UX**][**bug**][**good first issue**] Make available to see all icons of custom environments [#1001](https://github.com/lablup/backend.ai-webui/issues/1001)

#### UI / UX:

- [**UI / UX**][**easy**][**good first issue**] the password masking on "Add registry" dialog is triangle. change to the circle one. [#993](https://github.com/lablup/backend.ai-webui/issues/993)

---

## v21.03.4 (17/05/2021)

#### Enhancements:

- [**enhancement**][**minor**] Display SCHEDULED session status [#977](https://github.com/lablup/backend.ai-webui/issues/977)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Support force terminating 'PREPARING', 'TERMINATING' and 'PENDING' session on GUI [#948](https://github.com/lablup/backend.ai-webui/issues/948)

#### Bug Fixes:

- [**UI / UX**][**bug**][**minor**] Language of "Project" on top bar does not live change [#1003](https://github.com/lablup/backend.ai-webui/issues/1003)
- [**UI / UX**][**blocker**][**bug**][**minor**] Session list is not refreshing at the first visit [#1002](https://github.com/lablup/backend.ai-webui/issues/1002)
- [**UI / UX**][**blocker**][**bug**][**urgency**] Environment dropdown overlaps when there are more than eight options. [#999](https://github.com/lablup/backend.ai-webui/issues/999)
- [**UI / UX**][**bug**][**easy**][**good first issue**] login panel height gets jagged when the user inputs invalid account. [#995](https://github.com/lablup/backend.ai-webui/issues/995)
- [**UI / UX**][**blocker**][**bug**][**enterprise**][**library / SDK**][**major**] Reduce folder refresh calls to keep user query limit [#990](https://github.com/lablup/backend.ai-webui/issues/990)
- [**UI / UX**][**bug**][**good first issue**] the Web Terminal guide dialog is not changed according to the window size [#988](https://github.com/lablup/backend.ai-webui/issues/988)
- [**UI / UX**][**bug**][**good first issue**] not being able to check the contents of the right end of the screen when writing contents beyond the screen width. [#983](https://github.com/lablup/backend.ai-webui/issues/983)
- [**bug**][**easy**][**minor**] we cannot enable auto logout feature in Backend.AI Cloud [#978](https://github.com/lablup/backend.ai-webui/issues/978)
- [**UI / UX**][**bug**][**library / SDK**][**urgency**] creation new resource group is failed [#975](https://github.com/lablup/backend.ai-webui/issues/975)
- [**blocker**][**bug**][**urgency**] 500 error during session creation [#968](https://github.com/lablup/backend.ai-webui/issues/968)
- [**bug**][**easy**][**good first issue**] Learn more link in Web terminal guide is broken. [#961](https://github.com/lablup/backend.ai-webui/issues/961)
- [**UI / UX**][**bug**][**easy**][**good first issue**] update operation in username does not reflect. [#957](https://github.com/lablup/backend.ai-webui/issues/957)

#### UI / UX:

- [**UI / UX**][**good first issue**] Default icon for non-recognized service apps [#985](https://github.com/lablup/backend.ai-webui/issues/985)

---

## v21.03.3 (30/04/2021)

#### Enhancements:

- [**UI / UX**][**enhancement**][**good first issue**] the text in the total resource quota is broken. [#963](https://github.com/lablup/backend.ai-webui/issues/963)
- [**enhancement**][**library / SDK**][**minor**][**need confirmation**] Share a group folder directly with overriding permission [#956](https://github.com/lablup/backend.ai-webui/issues/956)
- [**enhancement**] Spring cleanup [#940](https://github.com/lablup/backend.ai-webui/issues/940)
- [**UI / UX**][**enhancement**] Provide cloning Vfolder feature [#899](https://github.com/lablup/backend.ai-webui/issues/899)
- [**UI / UX**][**enhancement**] Provide total resource allocation explicitly in session launcher [#891](https://github.com/lablup/backend.ai-webui/issues/891)
- [**UI / UX**][**enhancement**][**library / SDK**][**urgency**] Enable Tensorboard path [#680](https://github.com/lablup/backend.ai-webui/issues/680)

#### Bug Fixes:

- [**UI / UX**][**blocker**][**bug**][**easy**] Cannot update decimal points in FGPU input field of resource policy. [#971](https://github.com/lablup/backend.ai-webui/issues/971)
- [**UI / UX**][**bug**][**easy**][**good first issue**] Sometimes the invitation card and the button inside it overlap. [#950](https://github.com/lablup/backend.ai-webui/issues/950)
- [**UI / UX**][**blocker**][**bug**][**urgency**] Inhibit deleting Folders mounted in one or more sessions. [#921](https://github.com/lablup/backend.ai-webui/issues/921)

---

## v21.03.2 (02/04/2021)

#### Enhancements:

- [**UI / UX**][**enhancement**][**minor**] Disable (non-working) app / terminal button when admin lists other users' session list [#945](https://github.com/lablup/backend.ai-webui/issues/945)
- [**app**][**enhancement**][**major**] Support Apple Silicon macs [#942](https://github.com/lablup/backend.ai-webui/issues/942)
- [**enhancement**][**good first issue**][**minor**] Let users to change .vimrc and .tmux.conf for better customizability [#935](https://github.com/lablup/backend.ai-webui/issues/935)

#### Bug Fixes:

- [**UI / UX**][**bug**][**maintenance**][**minor**] It looks like the domain administrator can create the keypair resource policy, but it doesn't actually do it. [#946](https://github.com/lablup/backend.ai-webui/issues/946)

---

## v21.03.1 (24/03/2021)

#### Enhancements:

- [**UI / UX**][**enhancement**][**enterprise**][**minor**] Easier custom logo for login screen [#941](https://github.com/lablup/backend.ai-webui/issues/941)
- [**UI / UX**][**app**][**cloud**][**enhancement**][**enterprise**][**minor**] Support Apache Spark image [#932](https://github.com/lablup/backend.ai-webui/issues/932)
- [**UI / UX**][**app**][**enhancement**] Move app window position before login to system [#925](https://github.com/lablup/backend.ai-webui/issues/925)

#### Bug Fixes:

- [**bug**] R container images are not displayed properly on environment list [#938](https://github.com/lablup/backend.ai-webui/issues/938)
- [**bug**] GPU slider in session launch dialog is always fixed as zero when discrete mode is enabled [#937](https://github.com/lablup/backend.ai-webui/issues/937)
- [**bug**][**major**] Unable to login when localStorage items exceeds size limit [#928](https://github.com/lablup/backend.ai-webui/issues/928)
- [**bug**] Proxy is not working on desktop app from Electron 12 [#923](https://github.com/lablup/backend.ai-webui/issues/923)

---

## v21.03.0 (08/03/2021)

#### Enhancements:

- [**easy**][**enhancement**][**good first issue**][**urgency**] Let's rename Backend.AI GUI console to Backend.AI Web UI [#919](https://github.com/lablup/backend.ai-webui/issues/919)

#### Bug Fixes:

- [**UI / UX**][**bug**][**good first issue**][**urgency**] Let's fix the floating point in shared memory value of resource preset [#917](https://github.com/lablup/backend.ai-webui/issues/917)

---

## v21.02.3 (22/02/2021)

#### Enhancements:

- [**enhancement**] R studio support [#916](https://github.com/lablup/backend.ai-console/issues/916)
- [**enhancement**] Swift For TensorFlow support [#916](https://github.com/lablup/backend.ai-console/issues/916)
- [**enhancement**] FluxML support [#916](https://github.com/lablup/backend.ai-console/issues/916)

---

## v21.02.2 (17/02/2021)

#### Enhancements:

- [**enhancement**] Update Julia with Flux.ji support for scientific computing [#913](https://github.com/lablup/backend.ai-console/issues/913)
- [**UI / UX**][**enhancement**][**minor**] Support Swift language [#912](https://github.com/lablup/backend.ai-console/issues/912)
- [**enhancement**] Adopt runtime environment parameter / argument feature [#910](https://github.com/lablup/backend.ai-console/issues/910)
- [**UI / UX**][**enhancement**][**good first issue**] Filter for storage folders  [#909](https://github.com/lablup/backend.ai-console/issues/909)
- [**UI / UX**][**enhancement**] Let's provide leaving the invited folder. [#907](https://github.com/lablup/backend.ai-console/issues/907)
- [**UI / UX**][**enhancement**][**minor**] Support Swift for TensorFlow environment [#904](https://github.com/lablup/backend.ai-console/issues/904)
- [**UI / UX**][**enhancement**] Let's show an alert message when user rename the file including file extension in the Vfolder. [#803](https://github.com/lablup/backend.ai-console/issues/803)
- [**UI / UX**][**enhancement**][**library / SDK**] Storage resource tab on computation resources [#336](https://github.com/lablup/backend.ai-console/issues/336)

#### Bug Fixes:

- [**UI / UX**][**blocker**][**bug**][**major**] Queue file deletion [#572](https://github.com/lablup/backend.ai-console/issues/572)

---

## v21.02.1 (03/02/2021)

#### Enhancements:

- [**enhancement**] Provide environment configuration on session launcher [#902](https://github.com/lablup/backend.ai-console/issues/902)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Adopt background task id [#898](https://github.com/lablup/backend.ai-console/issues/898)
- [**enhancement**][**library / SDK**][**minor**] Change perSession scheme to perContainer [#889](https://github.com/lablup/backend.ai-console/issues/889)
- [**UI / UX**][**enhancement**][**minor**] Let's support folder upload in vfolder [#885](https://github.com/lablup/backend.ai-console/issues/885)
- [**enhancement**][**library / SDK**][**major**] add maxCUDASharesPerContainer to limit fGPU slice size [#788](https://github.com/lablup/backend.ai-console/issues/788)
-

---

## v21.02.0 (03/02/2021)

#### Enhancements:

- [**enhancement**] Provide environment configuration on session launcher [#902](https://github.com/lablup/backend.ai-console/issues/902)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Adopt background task id [#898](https://github.com/lablup/backend.ai-console/issues/898)
- [**enhancement**][**library / SDK**][**minor**] Change perSession scheme to perContainer [#889](https://github.com/lablup/backend.ai-console/issues/889)
- [**UI / UX**][**enhancement**][**minor**] Let's support folder upload in vfolder [#885](https://github.com/lablup/backend.ai-console/issues/885)

---

## v21.01.1 (07/01/2021)

#### Enhancements:

- [**enhancement**][**enterprise**][**library / SDK**][**minor**] Query waiting margin to session list / node list [#886](https://github.com/lablup/backend.ai-console/issues/886)

#### Bug Fixes:

- [**bug**] Unable to explore virtual folder in data & storage page [#888](https://github.com/lablup/backend.ai-console/issues/888)
- [**bug**][**invalid**] Image downloading tag disappears when the user redirects to other pages and come back. [#757](https://github.com/lablup/backend.ai-console/issues/757)
- [**bug**] Increase compatibility with Backend.AI 20.03 [#887](https://github.com/lablup/backend.ai-console/pull/887)
- [**UI / UX**][**bugfix**] Hide storage proxy features on Backend.AI 20.03/APIv5 (#869)

---

## v21.01.0 (04/01/2021)

#### Bug Fixes:

- [**UI / UX**][**bugfix**] Rearrange layout (#883)

---

## v20.12.6 (30/12/2020)

#### Bug Fixes:

- [**UI / UX**][**blocker**][**bug**][**urgency**] Value and the maximum value of shared memory in session launcher does not updated by selected resource preset [#880](https://github.com/lablup/backend.ai-console/issues/880)

---

## v20.12.5 (29/12/2020)

#### Enhancements:

- [**UI / UX**][**cloud**][**enhancement**][**enterprise**][**library / SDK**][**minor**] Option to change kernel to use import feature [#876](https://github.com/lablup/backend.ai-console/issues/876)

#### Bug Fixes:

- [**UI / UX**][**bug**][**minor**] User setting button / help button is missing when mini sidebar is enabled. [#878](https://github.com/lablup/backend.ai-console/issues/878)
- [**bug**][**urgency**] Directory is displays as a normal file in vfolder explorer on vfolder host of purestorage type [#874](https://github.com/lablup/backend.ai-console/issues/874)

---

## v20.12.4 (27/12/2020)

#### Enhancements:

- [**UI / UX**][**app**][**cloud**][**enhancement**][**enterprise**][**major**] App category support [#872](https://github.com/lablup/backend.ai-console/issues/872)

---

## v20.12.3 (25/12/2020)

#### Bug Fixes:

- [**UI / UX**][**bug**] Update virtual folder naming validation pattern [#873](https://github.com/lablup/backend.ai-console/issues/873)

---

## v20.12.2 (23/12/2020)

#### Enhancements:

- [**enhancement**][**library / SDK**] Support hardware metadata queries [#869](https://github.com/lablup/backend.ai-console/issues/869)
- [**UI / UX**][**enhancement**][**enterprise**][**library / SDK**] Set fractional GPU to multiple of integer when using multi-node / multi-container [#868](https://github.com/lablup/backend.ai-console/issues/868)
- [**UI / UX**][**enhancement**][**minor**] Session creation UI should allow manual input of image reference [#825](https://github.com/lablup/backend.ai-console/issues/825)
- [**UI / UX**][**enhancement**] Resource usage gauge per session [#771](https://github.com/lablup/backend.ai-console/issues/771)
- [**UI / UX**][**easy**][**enhancement**][**minor**] Limit maximum height of statistics graph [#703](https://github.com/lablup/backend.ai-console/issues/703)

---

## v20.12.1 (18/12/2020)

#### Enhancements:

- [**UI / UX**][**minor**] Set default auto logout to false [#851](https://github.com/lablup/backend.ai-console/issues/851)
- [**UI / UX**][**enhancement**][**enterprise**][**minor**] System setting for auto logout enable / disable feature [#865](https://github.com/lablup/backend.ai-console/issues/865)

---

## v20.12.0 (18/12/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**] Let's show current invited vfolders and created vfolders. [#858](https://github.com/lablup/backend.ai-console/issues/858)
- [**enhancement**] Support harbor v2 [#856](https://github.com/lablup/backend.ai-console/issues/856)
- [**blocker**][**enhancement**][**urgency**] Let's show a warning and confirmation dialog if the user tries to re-upload same file at same directory in Vfolder [#836](https://github.com/lablup/backend.ai-console/issues/836)
- [**UI / UX**][**blocker**][**easy**][**enhancement**][**urgency**] Let's initialize those adding / deleting input fields after applying or closing the dialog. [#835](https://github.com/lablup/backend.ai-console/issues/835)
- [**UI / UX**][**blocker**][**enhancement**][**urgency**] When the value of input exceeds the maximum, let's automatically apply each check box to be checked (unlimited) in the Create/Modify Resource Policy dialog. [#834](https://github.com/lablup/backend.ai-console/issues/834)
- [**UI / UX**][**blocker**][**enhancement**][**urgency**] Let's limit all the input field to prevent from malicious input [#832](https://github.com/lablup/backend.ai-console/issues/832)
- [**bug**][**enhancement**][**minor**] Option to change upload file size [#830](https://github.com/lablup/backend.ai-console/issues/830)
- [**app**][**blocker**][**bug**][**enhancement**][**major**] Stablize websocket proxy connection with proxy node health check [#828](https://github.com/lablup/backend.ai-console/issues/828)
- [**enhancement**] Inactive user list / control panel for superadmin [#826](https://github.com/lablup/backend.ai-console/issues/826)
- [**UI / UX**][**blocker**][**enhancement**][**urgency**] Let's hide per week option in the statistics for the users that assigned less than a week. [#812](https://github.com/lablup/backend.ai-console/issues/812)
- [**UI / UX**][**enhancement**][**minor**] Change dialog element to handle long list [#792](https://github.com/lablup/backend.ai-console/issues/792)
- [**enhancement**] Configurable max cores, devices, and shared memory per session [#788](https://github.com/lablup/backend.ai-console/issues/788)
- [**UI / UX**][**enhancement**] Provide responsive design for Backend.AI GUI console [#786](https://github.com/lablup/backend.ai-console/issues/786)
- [**UI / UX**][**cloud**][**enhancement**][**major**] Force service worker update without waiting for 24 hours [#765](https://github.com/lablup/backend.ai-console/issues/765)
- [**UI / UX**][**enhancement**][**enterprise**][**hard**][**library / SDK**][**major**] Support multi-node multi-GPU on GUI [#710](https://github.com/lablup/backend.ai-console/issues/710)
- [**UI / UX**][**enhancement**] Reimplement editor for TF.js [#649](https://github.com/lablup/backend.ai-console/issues/649)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Migrate TF.js test module for statistics insight model [#648](https://github.com/lablup/backend.ai-console/issues/648)
- [**enhancement**][**library / SDK**][**major**] Match node.js SDK naming schema with python SDK [#604](https://github.com/lablup/backend.ai-console/issues/604)
- [**UI / UX**][**enhancement**][**library / SDK**] Manage inactive users in console [#557](https://github.com/lablup/backend.ai-console/issues/557)
- [**enhancement**][**library / SDK**][**major**] Adopt V5 API specification [#515](https://github.com/lablup/backend.ai-console/issues/515)
- [**UI / UX**][**enhancement**][**library / SDK**] Plugin architecture for menus [#315](https://github.com/lablup/backend.ai-console/issues/315)
- [**enhancement**][**library / SDK**] Modular structure to make child projects [#285](https://github.com/lablup/backend.ai-console/issues/285)

#### Bug Fixes:

- [**UI / UX**][**bug**] User cannot login due to previous session cookie [#860](https://github.com/lablup/backend.ai-console/issues/860)
- [**UI / UX**][**blocker**][**bug**][**easy**][**urgency**] sometimes some charts in Statistics breaks the layout [#849](https://github.com/lablup/backend.ai-console/issues/849)
- [**bug**] Default Language in the user settings page not working [#840](https://github.com/lablup/backend.ai-console/issues/840)
- [**UI / UX**][**blocker**][**bug**][**urgency**] Let's make user information update operation applied right after completion [#839](https://github.com/lablup/backend.ai-console/issues/839)
- [**UI / UX**][**blocker**][**bug**][**easy**][**urgency**] Description of each user shows same after changing. [#833](https://github.com/lablup/backend.ai-console/issues/833)
- [**UI / UX**][**blocker**][**bug**][**urgency**] Let's allow vfolder renaming option only for the owner of the folder. [#822](https://github.com/lablup/backend.ai-console/issues/822)
- [**UI / UX**][**blocker**][**bug**][**urgency**] Sometimes mouse click doesn't work after clicking exporting csv menu. [#815](https://github.com/lablup/backend.ai-console/issues/815)
- [**UI / UX**][**blocker**][**bug**][**easy**][**good first issue**] Let's delete unnecessary warning message at csv exporting dialog in the session list [#814](https://github.com/lablup/backend.ai-console/issues/814)
- [**UI / UX**][**blocker**][**bug**][**easy**][**urgency**] Control panel should support scrollbar when the screen width is narrow. [#813](https://github.com/lablup/backend.ai-console/issues/813)
- [**UI / UX**][**blocker**][**bug**][**urgency**] Resource Group and resource statistics don't sync each other. [#811](https://github.com/lablup/backend.ai-console/issues/811)
- [**UI / UX**][**blocker**][**bug**][**urgency**] Let's disable file dropzone when the permission of the Vfolder is read-only [#810](https://github.com/lablup/backend.ai-console/issues/810)
- [**blocker**][**bug**][**urgency**] GPU resource in the session launcher value doesn't get changed. [#809](https://github.com/lablup/backend.ai-console/issues/809)
- [**UI / UX**][**blocker**][**bug**][**urgency**] Vfolder selection in session launcher dialog doesn't get initialized after session creation completed. [#807](https://github.com/lablup/backend.ai-console/issues/807)
- [**UI / UX**][**blocker**][**bug**][**urgency**] enable file operation in group type Vfolder for admin and super-admin user only. [#804](https://github.com/lablup/backend.ai-console/issues/804)
- [**blocker**][**bug**][**urgency**] Updated resource policy assigned to user doesn't applied immediately in the session launcher. [#799](https://github.com/lablup/backend.ai-console/issues/799)
- [**blocker**][**bug**][**urgency**] Keypair can be created even though the user not exists. [#798](https://github.com/lablup/backend.ai-console/issues/798)
- [**blocker**][**bug**][**urgency**] User detail doesn't change after modification. [#797](https://github.com/lablup/backend.ai-console/issues/797)
- [**UI / UX**][**bug**][**easy**] Resource Policy name in modification should be disabled. [#789](https://github.com/lablup/backend.ai-console/issues/789)
- [**UI / UX**][**bug**][**minor**] some administration pages is accessible to every user [#769](https://github.com/lablup/backend.ai-console/issues/769)
- [**UI / UX**][**bug**][**minor**] No error messages when session creation failed due to insufficient resources [#678](https://github.com/lablup/backend.ai-console/issues/678)

#### UI / UX:

- [**UI / UX**][**minor**] Make session launch dialog not close by clicking outside [#842](https://github.com/lablup/backend.ai-console/issues/842)
- [**UI / UX**][**good first issue**][**library / SDK**] Add user name registration / modification UI [#693](https://github.com/lablup/backend.ai-console/issues/693)

---

## v20.11.2 / v20.11.3 (16/11/2020)

#### Enhancements:

- [**enhancement**] Limit login trial number [#783](https://github.com/lablup/backend.ai-console/issues/783)
- [**UI / UX**][**bug**][**enhancement**][**library / SDK**][**major**] Retry manager connection while some requests are failed [#778](https://github.com/lablup/backend.ai-console/issues/778)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Simple webcomponent to use / test TensorFlow.js [#668](https://github.com/lablup/backend.ai-console/issues/668)

#### Bug Fixes:

- [**UI / UX**][**bug**][**urgency**] Prevent folder creation/file upload from only read permission [#777](https://github.com/lablup/backend.ai-console/issues/777)
- [**UI / UX**][**bug**][**invalid**] Vfolder creation/updating/deletion operation should be fixed. [#776](https://github.com/lablup/backend.ai-console/issues/776)
- [**UI / UX**][**bug**][**invalid**] Vfolder invitation in the summary page shows up only after redirected to the summary page more than once. [#761](https://github.com/lablup/backend.ai-console/issues/761)
- [**blocker**][**bug**] When session failed to start, App selection dialog still appears. [#758](https://github.com/lablup/backend.ai-console/issues/758)
 - [**bugfix**][**minor**][**UI / UX**] Project dropdown in top-app-bar overlaps when value is longer than the width of the element. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] Mini-ui should show every menu title as an tooltip in the navigation sidebar when hovering to the each menu. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] Footer in the navigation sidebar should be located in to bottom. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] Language Select buttons in the terms-of-services and privacy policy dialog should be converted to dropdown. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] Enable the sign-out feature*. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] Change password request in login panel throws error. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] Agreement for terms-of-services and privacy policy should support language translation. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] Limit the number of login attempts. (e.g. disable login If login fails more than 5 times in a row.) [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] **[Admin/Superadmin Only]** Change hyper reference link in Maintain Keypairs button to the proper page in Summary page. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] **[Admin/Superadmin Only]** Access key in the session list looks like as if is covered by the panel inside. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] Notebook Badge code area should be Read-Only field. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] Support Copying to the clipboard when user clicks notebook badge code area. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] In each width email input field in vfolder sharing invitation at Data & Storage page should be same. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] Permission selection in the permission settings dialog in the Data & Storage page overlaps in the grid row. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] Input area in Current Public key shows "null" literally. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] Hide Beta Feature description and toggle button in the usersettings page if there's no beta feature is available. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] Shell environment title in the usersettings page doesn't change when language is changed. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] The label of dropdown in shell script configuration dialog should support multi-language translation. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] **[Admin/Superadmin Only]** Active user text is redundantly duplicated in the Keypair resource policy modification dialog at Users page. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] **[Admin/Superadmin Only]** Allowed host selection dropdown width is too narrow to recognize the values inside. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] **[Admin/Superadmin Only]** Modify App dialog should alert after adding/deleting app information in case of user mistakes. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] **[Admin/Superadmin Only]** Delete button in image list at environments page should be hidden since it's not implemented yet. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] **[Admin/Superadmin Only]** Some of resource presets in modification resource preset dialog should support multi-language. (e.g. Korean) [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] **[Admin/Superadmin Only]** Hide disabled buttons in the control panel at Resources page If related features are not available. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] **[Admin/Superadmin Only]** Hide cleanup images button with title and description in the Image / Environment panel at Maintenance page If the feature is not available. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] Show proper help page for usersettings when the user clicks help button at the usersettings page. [#782](https://github.com/lablup/backend.ai-console/issues/782)

#### UI / UX:

- [**UI / UX**][**easy**] Apply loading indicator in the login process. [#760](https://github.com/lablup/backend.ai-console/issues/760)

---

## v20.11.1 (02/11/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**enterprise**][**library / SDK**][**major**] GPU/ASIC usage gauge per node [#766](https://github.com/lablup/backend.ai-console/issues/766)

#### Bug Fixes:

- [**bug**] verifying email and changing password page doesn't show anything on the page. [#767](https://github.com/lablup/backend.ai-console/issues/767)

---

## v20.11.0 (01/11/2020)

#### Bug Fixes:

- [**blocker**][**bug**][**library / SDK**][**major**] Invitation token page is not showing [#764](https://github.com/lablup/backend.ai-console/issues/764)

---

## v20.10.1 (30/10/2020)

#### Enhancements:

- [**enhancement**][**library / SDK**][**minor**] Prevent console from automatic login to unreachable manager [#762](https://github.com/lablup/backend.ai-console/issues/762)

#### UI / UX:

- [**UI / UX**][**need confirmation**] requested UI updates [#750](https://github.com/lablup/backend.ai-console/issues/750)

---

## v20.10.0 (23/10/2020)

#### Enhancements:

- [**UI / UX**][**easy**][**enhancement**][**minor**] Implicitly let user know when no folder exists on session launcher [#753](https://github.com/lablup/backend.ai-console/issues/753)
- [**UI / UX**][**enhancement**][**library / SDK**][**minor**] Change ownership delegation component on session launcher to mwc-select [#731](https://github.com/lablup/backend.ai-console/issues/731)
- [**UI / UX**][**enhancement**][**enterprise**][**library / SDK**][**major**] UI update (20.10) [#729](https://github.com/lablup/backend.ai-console/issues/729)
- [**UI / UX**][**enhancement**][**minor**] Validate app labels of images before saving [#715](https://github.com/lablup/backend.ai-console/issues/715)

#### Bug Fixes:

- [**UI / UX**][**bug**][**library / SDK**][**major**] Resource group deletion doesn't get reflected to the table of resource groups tab in the Resources page. [#743](https://github.com/lablup/backend.ai-console/issues/743)
- [**blocker**][**bug**] Minor errors occur in Environments page. [#742](https://github.com/lablup/backend.ai-console/issues/742)
- [**blocker**][**bug**] Cannot create user in the users page. [#741](https://github.com/lablup/backend.ai-console/issues/741)
- [**blocker**][**bug**] Minor errors occur in the creating folder dialog from Data & Storage page. [#740](https://github.com/lablup/backend.ai-console/issues/740)
- [**UI / UX**][**bug**][**library / SDK**][**major**] exporting CSV in Sessions page doesn't work. [#739](https://github.com/lablup/backend.ai-console/issues/739)
- [**UI / UX**][**bug**][**easy**] When clicking Backend.AI Logo in the drawer, nothing happens. [#738](https://github.com/lablup/backend.ai-console/issues/738)
- [**bug**] icons in drawer and some panel don't show up in the new UI. [#736](https://github.com/lablup/backend.ai-console/issues/736)
- [**UI / UX**][**bug**][**easy**] Image rescan/Recalculate usage button throws an error. [#734](https://github.com/lablup/backend.ai-console/issues/734)
- [**UI / UX**][**bug**] Image download dialog appears every time the checkbox is clicked [#725](https://github.com/lablup/backend.ai-console/issues/725)

#### UI / UX:

- [**UI / UX**][**easy**][**good first issue**] Language Setting dropdown overlaps SSH Keypair text [#719](https://github.com/lablup/backend.ai-console/issues/719)

---

## v20.09.2 (28/09/2020)


#### Bug Fixes:

- [**bug**][**easy**][**minor**] Extend current request timeout in session creation [#722](https://github.com/lablup/backend.ai-console/issues/722)
- [**UI / UX**][**bug**] Multiple clicks cause duplicated directory path [#717](https://github.com/lablup/backend.ai-console/issues/717)

---

## v20.09.1 (22/09/2020)

#### Enhancements:

- [**UI / UX**][**blocker**][**bug**] Local proxy is not working on the app mode with Backend.AI 20.09 alpha [#720](https://github.com/lablup/backend.ai-console/issues/720)
- [**UI / UX**][**bug**][**easy**][**good first issue**] Usage shows [Object Object] on finished tab of session list [#685](https://github.com/lablup/backend.ai-console/issues/685)

---

## v20.09.0 (18/09/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**] Provide help about 'copying text from terminal' [#698](https://github.com/lablup/backend.ai-console/issues/698)
- [**UI / UX**][**enhancement**][**good first issue**] Update manual to explain 'SSH Keypair change' menu [#695](https://github.com/lablup/backend.ai-console/issues/695)
- [**UI / UX**][**bug**][**enhancement**][**good first issue**][**minor**] Disable turn off button on finished session list [#686](https://github.com/lablup/backend.ai-console/issues/686)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Refactor storage selection on session launch [#662](https://github.com/lablup/backend.ai-console/issues/662)
- [**UI / UX**][**enhancement**][**minor**] Skip rendering paths to increase speed [#661](https://github.com/lablup/backend.ai-console/issues/661)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Migrate compute_session from v4 to v5 [#651](https://github.com/lablup/backend.ai-console/issues/651)
- [**enhancement**][**maintenance**] Change default branch from master to main [#637](https://github.com/lablup/backend.ai-console/issues/637)
- [**UI / UX**][**enhancement**][**minor**] Show mounted folder information on session list [#628](https://github.com/lablup/backend.ai-console/issues/628)
- [**enhancement**] Add comments on source code [#402](https://github.com/lablup/backend.ai-console/issues/402)
- [**UI / UX**][**enhancement**][**minor**] Support NNI [#207](https://github.com/lablup/backend.ai-console/issues/207)

#### Bug Fixes:

- [**UI / UX**][**bug**][**good first issue**] Dropdown menu is positioned incorrectly [#707](https://github.com/lablup/backend.ai-console/issues/707)
- [**bug**] Login Information mismatch error, when build&run console-server in local environment [#700](https://github.com/lablup/backend.ai-console/issues/700)
- [**bug**][**minor**] Error logs are not displayed [#689](https://github.com/lablup/backend.ai-console/issues/689)
- [**bug**][**major**] Session's app cannot be accessed if there are multiple sessions with the same name prefix [#687](https://github.com/lablup/backend.ai-console/issues/687)
- [**UI / UX**][**bug**] Incorrect image downloaded after filtered by keywords [#679](https://github.com/lablup/backend.ai-console/issues/679)
- [**UI / UX**][**bug**][**easy**] Fix resource preset dialog validation [#672](https://github.com/lablup/backend.ai-console/issues/672)
- [**bug**][**urgency**] Unable to create a session due to vfolder-related issue [#670](https://github.com/lablup/backend.ai-console/issues/670)
- [**UI / UX**][**blocker**][**bug**][**cloud**][**minor**] Wrong password condition error message on signup [#663](https://github.com/lablup/backend.ai-console/issues/663)
- [**UI / UX**][**blocker**][**bug**] Sometimes GitHub notebook import does not work [#660](https://github.com/lablup/backend.ai-console/issues/660)
- [**UI / UX**][**bug**] After terminating a session, resource occupation is not updated [#639](https://github.com/lablup/backend.ai-console/issues/639)
- [**UI / UX**][**bug**][**easy**] Although user inputs invalid session name, session creating dialog get closed. [#638](https://github.com/lablup/backend.ai-console/issues/638)

#### UI / UX:

- [**UI / UX**][**easy**][**good first issue**][**minor**] Change 'About' to 'About Backend.AI' [#694](https://github.com/lablup/backend.ai-console/issues/694)
- [**UI / UX**][**minor**] No error messages when kernel creation request has error response [#691](https://github.com/lablup/backend.ai-console/issues/691)
- [**UI / UX**][**good first issue**][**minor**] Fix layout overlap in Start new session dialog [#676](https://github.com/lablup/backend.ai-console/issues/676)
- [**UI / UX**][**easy**] Apply toggle visibility in password input field [#665](https://github.com/lablup/backend.ai-console/issues/665)
- [**UI / UX**] Add UI to specify SSH Keypair by user [#657](https://github.com/lablup/backend.ai-console/issues/657)
- [**UI / UX**] Neater message when vfolder invitation is duplicated [#653](https://github.com/lablup/backend.ai-console/issues/653)

---

## v20.08.0 (04/08/2020)

#### Bug Fixes:

- [**bug**][**UI / UX**] After terminating a session, resource occupation is not updated [#639](https://github.com/lablup/backend.ai-console/issues/639)
- [**bug**] In a session log dialog, error message is raised when user clicks refresh log button [#640](https://github.com/lablup/backend.ai-console/issues/640)

---

## v20.07.9 (31/07/2020)

#### Bug Fixes:

- [**bug**][**easy**][**minor**] Cannot create resource preset with proper mem/shmem values [#626](https://github.com/lablup/backend.ai-console/issues/626)

#### UI / UX:

- [**UI / UX**][**minor**] Change minimum fractional GPU step from 0.05 to 0.01 [#629](https://github.com/lablup/backend.ai-console/issues/629)
- [**UI / UX**][**cloud**][**minor**] Show explicit message when user's account is inactive state [#593](https://github.com/lablup/backend.ai-console/issues/593)

---

## v20.07.8 (23/07/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**enterprise**][**library / SDK**][**major**] License information viewer [#623](https://github.com/lablup/backend.ai-console/issues/623)
- [**enhancement**][**urgency**] Add feature to search and/or filter user and keypair by fields such as email, username, etc [#618](https://github.com/lablup/backend.ai-console/issues/618)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Migrate d3.js charts into chart.js [#607](https://github.com/lablup/backend.ai-console/issues/607)

---

## v20.07.7 (23/07/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Migrate repository notebook into cluster [#599](https://github.com/lablup/backend.ai-console/issues/599)

#### Bug Fixes:

- [**bug**][**library / SDK**][**major**][**urgency**] User and keypair page displays only 100 users/keypairs in >20.03 manager [#617](https://github.com/lablup/backend.ai-console/issues/617)

---

## v20.07.6 (20/07/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**minor**] Project color in pull-down menu on top-right corner becomes white when selected [#614](https://github.com/lablup/backend.ai-console/issues/614)
- [**UI / UX**][**blocker**][**easy**][**enhancement**] Problems that do not support password autocomplete in web browsers [#613](https://github.com/lablup/backend.ai-console/issues/613)
- [**UI / UX**][**enhancement**][**library / SDK**] Add edit feature of .Renviron file in home directory [#608](https://github.com/lablup/backend.ai-console/issues/608)

#### Bug Fixes:

- [**blocker**][**bug**][**library / SDK**][**major**] 502 error found when launching app with Backend.AI 20.03 / Enterprise R2 beta [#601](https://github.com/lablup/backend.ai-console/issues/601)

---

## v20.07.5 (09/07/2020)

#### Bug Fixes:

- [**blocker**][**bug**][**library / SDK**][**major**] 502 error found when launching app with Backend.AI 20.03 / Enterprise R2 beta [#601](https://github.com/lablup/backend.ai-console/issues/601)

---

## v20.07.4 (06/07/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Set environment name with tags [#598](https://github.com/lablup/backend.ai-console/issues/598)

---

## v20.07.3 (06/07/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**library / SDK**][**major**][**hard**] Stabilize the resource broker with refactoring [#596](https://github.com/lablup/backend.ai-console/issues/596)

---

## v20.07.2 (03/07/2020)

#### Bug Fixes:

- [**bug**][**cloud**][**easy**] Error on re-send signup verification email [#595](https://github.com/lablup/backend.ai-console/issues/595)

---

## v20.07.1 (03/07/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**library / SDK**][**minor**] Show agent version on resource pane to check upgradable agents [#590](https://github.com/lablup/backend.ai-console/issues/590)

#### Bug Fixes:

- [**blocker**][**bug**][**major**] Cannot see templates / assign resource without GPU [#591](https://github.com/lablup/backend.ai-console/issues/591)

---

## v20.07.0 (02/07/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**minor**] Migrate legacy dialogs to backend.ai dialog for unified look and feel [#584](https://github.com/lablup/backend.ai-console/issues/584)
- [**UI / UX**][**enhancement**][**minor**] Open notification when no virtual folder is attached on console [#583](https://github.com/lablup/backend.ai-console/issues/583)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**][**working**] Unified session information crawler / store [#496](https://github.com/lablup/backend.ai-console/issues/496)

#### Bug Fixes:

- [**UI / UX**][**bug**][**minor**] TOS is not scrollable [#588](https://github.com/lablup/backend.ai-console/issues/588)

---

## v20.06.3 (22/06/2020)

#### Enhancements:

- [**enhancement**] Feature to download vfolder directory [#580](https://github.com/lablup/backend.ai-console/issues/580)
- [**UI / UX**][**enhancement**][**minor**] Migrate legacy dialogs to backend.ai dialog for unified look and feel [#584](https://github.com/lablup/backend.ai-console/issues/584)
- [**UI / UX**][**enhancement**][**minor**] Open notification when no virtual folder is attached on console [#583](https://github.com/lablup/backend.ai-console/issues/583)

#### Bug Fixes:

- [**bug**] After selecting resource template without GPU, advanced panel's GPU value is not respected in creating session [#581](https://github.com/lablup/backend.ai-console/issues/581)

---

## v20.06.2 (16/06/2020)

#### Enhancements:

- [**enhancement**][**hard**][**major**][**UI / UX**][**library / SDK**] Show app launcher after launch a session on summary page (#575) [#575](https://github.com/lablup/backend.ai-console/issues/575)

---

## v20.06.1 (13/06/2020)

#### Bug Fixes:
- [**UI / UX**][**bug**][**major**][**blocker**] Sometimes environment list did not refreshed correctly [#576](https://github.com/lablup/backend.ai-console/issues/576)

---

## v20.06.0 (12/06/2020)

#### Enhancements:

- [**enhancement**][**library / SDK**][**minor**] Change session store method for console-server [#567](https://github.com/lablup/backend.ai-console/issues/567)
- [**cloud**][**enhancement**][**library / SDK**] Let Cloud users to change their forgot password by email verification [#564](https://github.com/lablup/backend.ai-console/issues/564)
- [**UI / UX**][**cloud**][**enhancement**][**enterprise**][**major**] Provide method to turn off some menus by setting [#562](https://github.com/lablup/backend.ai-console/issues/562)
- [**cloud**][**enhancement**][**major**][**web**] Re-enable service worker to reduce traffic load [#554](https://github.com/lablup/backend.ai-console/issues/554)
- [**UI / UX**][**cloud**][**enhancement**][**library / SDK**][**major**] Add support for signup user email verification [#536](https://github.com/lablup/backend.ai-console/issues/536)

#### Bug Fixes:

- [**UI / UX**][**bug**][**minor**] Resource monitor panel is not updated after session creation [#566](https://github.com/lablup/backend.ai-console/issues/566)
- [**UI / UX**][**bug**] Session list has scrollbar on admin mode [#560](https://github.com/lablup/backend.ai-console/issues/560)
- [**blocker**][**bug**][**major**] 'No suitable preset' is not shown when preset does not exist [#559](https://github.com/lablup/backend.ai-console/issues/559)
- [**bug**][**minor**] Preset does not work after cpu/memory values are set manually by Advanced panel [#555](https://github.com/lablup/backend.ai-console/issues/555)
- [**UI / UX**][**bug**][**hard**] Resource slider shows zero on first launch dialog [#553](https://github.com/lablup/backend.ai-console/issues/553)
- [**UI / UX**][**bug**][**minor**] Wait to enable session launch button before SDK is connected to manager [#552](https://github.com/lablup/backend.ai-console/issues/552)
- [**UI / UX**][**blocker**][**bug**] Resource preset is not refreshed at the first launch [#551](https://github.com/lablup/backend.ai-console/issues/551)
- [**UI / UX**][**blocker**][**bug**][**library / SDK**] Check password condition on change [#549](https://github.com/lablup/backend.ai-console/issues/549)

#### UI / UX:

- [**UI / UX**][**easy**][**minor**] Limit maximum allowed CPU cores to 64 [#571](https://github.com/lablup/backend.ai-console/issues/571)
- [**UI / UX**][**minor**] Display TensorFlow/PyTorch versions for NGC images [#569](https://github.com/lablup/backend.ai-console/issues/569)

---

## v20.05.5 (26/05/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**major**] Notification stack UI on sidepanel [#547](https://github.com/lablup/backend.ai-console/issues/547)
- [**UI / UX**][**enhancement**][**major**] Asychronous tooltip to increase UI response speed [#543](https://github.com/lablup/backend.ai-console/issues/543)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] UI for Background task [#542](https://github.com/lablup/backend.ai-console/issues/542)
- [**UI / UX**][**cloud**][**enhancement**][**library / SDK**][**major**] Add support for signup user email verification [#536](https://github.com/lablup/backend.ai-console/issues/536)
- [**UI / UX**][**app**][**enhancement**][**hard**][**library / SDK**][**major**] Task monitor UI component  [#505](https://github.com/lablup/backend.ai-console/issues/505)

#### Bug Fixes:

- [**UI / UX**][**blocker**][**bug**] Resource preset is not refreshed at the first launch [#551](https://github.com/lablup/backend.ai-console/issues/551)
- [**UI / UX**][**bug**][**major**] Tooltip overrided by main content adrea on mini sidebar mode on Safari [#544](https://github.com/lablup/backend.ai-console/issues/544)
- [**UI / UX**][**bug**][**library / SDK**][**minor**] Image install shows error message if it takes more than 5 sec. [#541](https://github.com/lablup/backend.ai-console/issues/541)

---

## v20.05.4 (22/05/2020)

#### Enhancements:

- [**enhancement**][**library / SDK**][**maintenance**] Adopt tus v2 client [#530](https://github.com/lablup/backend.ai-console/issues/530)
- [**UI / UX**][**enhancement**][**major**] New UI for 20.03 (with summary / sidebar) [#518](https://github.com/lablup/backend.ai-console/issues/518)

#### Bug Fixes:

- [**bug**][**easy**] Exception when logged in as a user (or in login page) [#532](https://github.com/lablup/backend.ai-console/issues/532)

---

## v20.05.3 (15/05/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**minor**] Hover menu description on simple sidebar menu [#528](https://github.com/lablup/backend.ai-console/issues/528)
- [**UI / UX**][**cloud**][**enhancement**][**minor**] Link online help page on each menu [#524](https://github.com/lablup/backend.ai-console/issues/524)
- [**enhancement**][**enterprise**][**library / SDK**][**world console**] Change default Dockerfile to use console-server [#523](https://github.com/lablup/backend.ai-console/issues/523)

#### Bug Fixes:

- [**UI / UX**][**bug**] Environment change sometimes does not update presets with GPUs [#525](https://github.com/lablup/backend.ai-console/issues/525)

---

## v20.05.2 (14/05/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**minor**] Modified some missing i18n resources.

---

## v20.05.1 (08/05/2020)

#### Bug Fixes:

- [**UI / UX**][**blocker**][**bug**][**library / SDK**][**major**] Multiple virtual folder does not mount on GUI [#520](https://github.com/lablup/backend.ai-console/issues/520)

---

## v20.05.0 (07/05/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**minor**] Add description about common storage types [#509](https://github.com/lablup/backend.ai-console/issues/509)
- [**UI / UX**][**bug**][**enhancement**] More CUDA resource minimum settings for image default [#507](https://github.com/lablup/backend.ai-console/issues/507)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Unified event tasker [#498](https://github.com/lablup/backend.ai-console/issues/498)


#### Bug Fixes:

- [**UI / UX**][**bug**][**easy**]  Hide GPU pane on summary page if it does not exist [#519](https://github.com/lablup/backend.ai-console/issues/519)
- [**UI / UX**][**bug**][**easy**] Set unlimited concurrent jobs number to 1000000 [#516](https://github.com/lablup/backend.ai-console/issues/516)
- [**bug**][**library / SDK**][**minor**] Resource indicator sometimes does not refreshed after changing resource group [#513](https://github.com/lablup/backend.ai-console/issues/513)
- [**UI / UX**][**bug**][**minor**] Version item does not update when environment is changed on session launch panel [#510](https://github.com/lablup/backend.ai-console/issues/510)
- [**blocker**][**bug**][**library / SDK**][**minor**] etcd broken when image metadata is modified with Harbor registry URL with colon  [#508](https://github.com/lablup/backend.ai-console/issues/508)
#### UI / UX:

- [**UI / UX**][**easy**][**enterprise**] Folder creation keeps last created folder name [#511](https://github.com/lablup/backend.ai-console/issues/511)
- [**UI / UX**][**easy**][**minor**] Add refresh button in session logs dialog [#502](https://github.com/lablup/backend.ai-console/issues/502)

---

## v20.04.5 (27/04/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Unified event tasker [#498](https://github.com/lablup/backend.ai-console/issues/498)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Support shared memory setting to ResourceTemplate [#494](https://github.com/lablup/backend.ai-console/issues/494)

---

## v20.04.4 (26/04/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**library / SDK**] File rename feature [#434](https://github.com/lablup/backend.ai-console/issues/434)
- [**enhancement**][**library / SDK**][**major**] Handle heterogeneous resource slots for v1912+ [#407](https://github.com/lablup/backend.ai-console/issues/407)
- [**UI / UX**][**enhancement**][**hard**][**major**] Detailed kernel selection UI [#258](https://github.com/lablup/backend.ai-console/issues/258)

#### Bug Fixes:

- [**bug**] Blank Data & Storage page [#499](https://github.com/lablup/backend.ai-console/issues/499)

#### UI / UX:

- [**UI / UX**][**easy**][**minor**] Add refresh button in session logs dialog [#502](https://github.com/lablup/backend.ai-console/issues/502)

---

## v20.04.3 (16/04/2020)

#### Enhancements:

- [**enhancement**][**hard**][**library / SDK**][**major**]  add 'automatic download' option to manager [#157](https://github.com/lablup/backend.ai-console/issues/157)

#### Bug Fixes:

- [**UI / UX**][**blocker**][**bug**][**library / SDK**] Block usage mode / permission setting on Backend.AI 19.09 [#492](https://github.com/lablup/backend.ai-console/issues/492)
- [**UI / UX**][**bug**][**minor**] FOUC during login on Firefox [#491](https://github.com/lablup/backend.ai-console/issues/491)
- [**bug**][**enterprise**][**library / SDK**] Image rescan button returns error due to short timeout [#490](https://github.com/lablup/backend.ai-console/issues/490)

---

## v20.04.2 (15/04/2020)

#### Enhancements:

- [**enhancement**][**library / SDK**][**major**] Implement general user settings store [#484](https://github.com/lablup/backend.ai-console/issues/484)
- [**enhancement**][**library / SDK**][**major**] Account for vfolder permission and usage mode during vfolder creation [#482](https://github.com/lablup/backend.ai-console/issues/482)
- [**UI / UX**][**easy**][**enhancement**] Support major password managers [#480](https://github.com/lablup/backend.ai-console/issues/480)
- [**UI / UX**][**blocker**][**bug**][**enhancement**][**minor**] Login sometimes changes to IAM and not returned [#479](https://github.com/lablup/backend.ai-console/issues/479)
- [**UI / UX**][**app**][**enhancement**][**enterprise**][**library / SDK**][**major**][**web**][**working**] Automatic release check [#443](https://github.com/lablup/backend.ai-console/issues/443)
- [**UI / UX**][**enhancement**] Keep last used group on console [#437](https://github.com/lablup/backend.ai-console/issues/437)
- [**UI / UX**][**enhancement**][**hard**][**major**] Save previous endpoints for app [#436](https://github.com/lablup/backend.ai-console/issues/436)
- [**UI / UX**][**enhancement**][**library / SDK**][**minor**] Validate whether API endpoint is correct Backend.AI manager / console server or not [#251](https://github.com/lablup/backend.ai-console/issues/251)
- [**enhancement**][**library / SDK**] More diverse resource policy setting [#56](https://github.com/lablup/backend.ai-console/issues/56)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**] Basic settings for admin [#28](https://github.com/lablup/backend.ai-console/issues/28)

#### Bug Fixes:

- [**UI / UX**][**bug**][**minor**] Monitor display does not show animation on resource view when no resource is used [#489](https://github.com/lablup/backend.ai-console/issues/489)
- [**blocker**][**bug**] After completing signout (leave service), no logout or dialog close event is not performed in windows app [#230](https://github.com/lablup/backend.ai-console/issues/230)

#### UI / UX:

- [**UI / UX**] Divide fetch failure and connection lost [#339](https://github.com/lablup/backend.ai-console/issues/339)

---

## v20.04.1 (10/04/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**library / SDK**][**minor**] Provide kill button to errored session in Others tab [#477](https://github.com/lablup/backend.ai-console/issues/477)
- [**UI / UX**][**enhancement**][**minor**] Adopt finer group select element on UI [#475](https://github.com/lablup/backend.ai-console/issues/475)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Provide downtime information when manager is not responding [#473](https://github.com/lablup/backend.ai-console/issues/473)
- [**UI / UX**][**enhancement**][**library / SDK**][**maintenance**][**major**] Spring clean: Remove 19.03 support [#471](https://github.com/lablup/backend.ai-console/issues/471)
- [**UI / UX**][**enhancement**][**minor**] Background on loading screen [#469](https://github.com/lablup/backend.ai-console/issues/469)

#### Web Features:

- [**UI / UX**][**library / SDK**][**minor**][**web**] vFolder file download not working on iOS/iPadOS [#465](https://github.com/lablup/backend.ai-console/issues/465)

#### UI / UX:

- [**UI / UX**][**library / SDK**][**major**] Limit fetch timeout with general / custom timeout value [#472](https://github.com/lablup/backend.ai-console/issues/472)
- [**UI / UX**][**cloud**][**enterprise**][**major**] Update Cloud Terms of Service / Privacy Policy to match with GDPR [#468](https://github.com/lablup/backend.ai-console/issues/468)
- [**UI / UX**][**cloud**][**minor**] Automatic language detection on Terms Of Service panel [#467](https://github.com/lablup/backend.ai-console/issues/467)

---

## v20.04.0 (08/04/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**library / SDK**] GUI option to change image pull behavior [#460](https://github.com/lablup/backend.ai-console/issues/460)
- [**UI / UX**][**cloud**][**enhancement**] Support Ubuntu Desktop environment [#459](https://github.com/lablup/backend.ai-console/issues/459)
- [**app**][**enhancement**][**minor**] Add option for local wsproxy to work behind external http proxy [#456](https://github.com/lablup/backend.ai-console/issues/456)
- [**UI / UX**][**enhancement**] Change invitation panel after decision is made [#426](https://github.com/lablup/backend.ai-console/issues/426)
- [**UI / UX**][**enhancement**][**library / SDK**] GUI option to allow/disallow images from specific repository. [#421](https://github.com/lablup/backend.ai-console/issues/421)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Queue support to upload files [#392](https://github.com/lablup/backend.ai-console/issues/392)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Support ROCm devices on GUI [#308](https://github.com/lablup/backend.ai-console/issues/308)

---

## v20.03.5 (30/03/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Provide i18n framework [#451](https://github.com/lablup/backend.ai-console/issues/451)
- [**UI / UX**][**enhancement**][**easy**][**library / SDK**][**minor**] Delete directory inside folder explorer [#453](https://github.com/lablup/backend.ai-console/issues/453)
- [**UI / UX**][**enhancement**][**library / SDK**] Hide GPU-enabled preset when kernel does not require GPU resource [#445](https://github.com/lablup/backend.ai-console/issues/445)

#### Bug Fixes:

- [**bug**][**library / SDK**] Webpage via proxy sometimes produces 500 error while app is not ready yet [#449](https://github.com/lablup/backend.ai-console/issues/449)

---

## v20.03.4 (23/03/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**] Explanation hover on environment selection menu [#440](https://github.com/lablup/backend.ai-console/issues/440)
- [**UI / UX**][**cloud**][**enhancement**][**web**] Provide EULA with multiple languages [#435](https://github.com/lablup/backend.ai-console/issues/435)
- [**UI / UX**][**enhancement**] Separate automount folders from storage mount selection [#431](https://github.com/lablup/backend.ai-console/issues/431)

#### UI / UX:

- [**UI / UX**][**library / SDK**] Hide GPU-enabled preset when kernel does not require GPU resource [#445](https://github.com/lablup/backend.ai-console/issues/445)

---

## v20.03.3 (17/03/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**] Support TexLive environment [#427](https://github.com/lablup/backend.ai-console/issues/427)
- [**UI / UX**][**enhancement**] Provide release note / app download link on summary page [#425](https://github.com/lablup/backend.ai-console/issues/425)
- [**UI / UX**][**enhancement**][**maintenance**][**major**] Remove polymer-based components [#419](https://github.com/lablup/backend.ai-console/issues/419)

#### Bug Fixes:

- [**bug**] Image installation does not work with both GPU/fGPU resource tag [#428](https://github.com/lablup/backend.ai-console/issues/428)

---

## v20.03.2 (11/03/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**] Add tag to image from custom registries [#420](https://github.com/lablup/backend.ai-console/issues/420)
- [**UI / UX**][**enhancement**][**library / SDK**] Backend.AI edition information from server / client [#417](https://github.com/lablup/backend.ai-console/issues/417)
- [**UI / UX**][**enhancement**] Visible console version on summary statistics panel [#415](https://github.com/lablup/backend.ai-console/issues/415)

#### Bug Fixes:

- [**bug**][**minor**] Bug - session image download raises error when the admin is not in the "default" project [#406](https://github.com/lablup/backend.ai-console/issues/406)

---

## v20.03.1 (09/03/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**library / SDK**] Shell environment setup UI [#391](https://github.com/lablup/backend.ai-console/issues/391)

#### Bug Fixes:

- [**UI / UX**][**blocker**][**bug**] Cannot create storage folder starting with . [#413](https://github.com/lablup/backend.ai-console/issues/413)

---

## v20.03.0 (06/03/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**] Adding explicit gauge descriptions to resource usage information [#411](https://github.com/lablup/backend.ai-console/issues/411)
- [**UI / UX**][**enhancement**] Refactor signup routine to use native form validator [#397](https://github.com/lablup/backend.ai-console/issues/397)
- [**UI / UX**][**enhancement**] Revised storage / folder menu [#395](https://github.com/lablup/backend.ai-console/issues/395)
- [**UI / UX**][**enhancement**][**library / SDK**] Turn on / off beta features [#393](https://github.com/lablup/backend.ai-console/issues/393)
- [**UI / UX**][**enhancement**][**minor**] Provide option to keep the current login session for app [#388](https://github.com/lablup/backend.ai-console/issues/388)
- [**UI / UX**][**enhancement**] User settings page [#319](https://github.com/lablup/backend.ai-console/issues/319)

#### Bug Fixes:

- [**blocker**][**bug**][**library / SDK**] Cannot assign GPU without virtualization (as is for open source edition) [#408](https://github.com/lablup/backend.ai-console/issues/408)
- [**UI / UX**][**bug**] Folders to mount label overlaps selected folders text [#404](https://github.com/lablup/backend.ai-console/issues/404)
- [**UI / UX**][**blocker**][**bug**] Cannot logout on settings / log page [#399](https://github.com/lablup/backend.ai-console/issues/399)
- [**UI / UX**][**blocker**][**bug**] Incorrect image downloaded after sorting [#382](https://github.com/lablup/backend.ai-console/issues/382)
- [**UI / UX**][**blocker**][**bug**] Upgrade session launch UI [#374](https://github.com/lablup/backend.ai-console/issues/374)
- [**bug**][**library / SDK**] Reliable upload session on poor network circumstances [#369](https://github.com/lablup/backend.ai-console/issues/369)

#### UI / UX:

- [**UI / UX**][**minor**] Remember last selected group (project) [#396](https://github.com/lablup/backend.ai-console/issues/396)
- [**UI / UX**] change dropdown web component [#386](https://github.com/lablup/backend.ai-console/issues/386)

---

## v20.02.5 (27/02/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**] Option to turn off desktop notification [#365](https://github.com/lablup/backend.ai-console/issues/365)
- [**UI / UX**][**enhancement**] Pagniated user list [#345](https://github.com/lablup/backend.ai-console/issues/345)
- [**UI / UX**][**enhancement**] Modify login mode change button to be displayed with the signup button [#325](https://github.com/lablup/backend.ai-console/issues/325)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Appropriate shared memory size setting [#314](https://github.com/lablup/backend.ai-console/issues/314)

#### Bug Fixes:

- [**UI / UX**][**bug**] uncheck image if downloading fails [#383](https://github.com/lablup/backend.ai-console/issues/383)
- [**bug**][**urgency**] Scaling group not updated when Project is changed in session list page [#376](https://github.com/lablup/backend.ai-console/issues/376)
- [**UI / UX**][**blocker**][**bug**] Version on session list displays wrong number [#373](https://github.com/lablup/backend.ai-console/issues/373)
- [**UI / UX**][**bug**] session slider is enabled even if resource is not available  [#362](https://github.com/lablup/backend.ai-console/issues/362)

#### UI / UX:

- [**UI / UX**][**minor**] move export csv feature into menu in user/credentials and sessions [#380](https://github.com/lablup/backend.ai-console/issues/380)
- [**UI / UX**][**easy**] Input validation check in resource policy setting [#354](https://github.com/lablup/backend.ai-console/issues/354)

---

## v20.02.4 (19/02/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**library / SDK**][**major**] .csv export features of Credentials, Users and Sessions lists for admin. [#348](https://github.com/lablup/backend.ai-console/issues/348)

#### UI / UX:

- [**UI / UX**][**minor**] Turn off spinner when request fails [#359](https://github.com/lablup/backend.ai-console/issues/359)

---

## v20.02.3 (18/02/2020)

#### UI / UX:

- [**UI / UX**][**minor**] Increase app launch delay from 1 to 3 sec. to prevent from 500 error [#360](https://github.com/lablup/backend.ai-console/issues/360)

---

## v20.02.2 (18/02/2020)
*No changelog for this release.*

---

## v20.02.1 (18/02/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**] More detailed login failure message [#352](https://github.com/lablup/backend.ai-console/issues/352)
- [**UI / UX**][**bug**][**enhancement**] Make session delete button appear when no service app available [#350](https://github.com/lablup/backend.ai-console/issues/350)
- [**UI / UX**][**easy**][**enhancement**] Hide session delete icon when the state is PREPARING and PULLING [#349](https://github.com/lablup/backend.ai-console/issues/349)
- [**UI / UX**][**enhancement**] Pagniated session list [#328](https://github.com/lablup/backend.ai-console/issues/328)
- [**UI / UX**][**enhancement**][**major**] Log page for app / web instance [#320](https://github.com/lablup/backend.ai-console/issues/320)

#### Bug Fixes:

- [**UI / UX**][**bug**] Show admins project list items only when admin is a member of it [#358](https://github.com/lablup/backend.ai-console/issues/358)

#### UI / UX:

- [**UI / UX**][**minor**] Apply monospace font to UUID on storage [#357](https://github.com/lablup/backend.ai-console/issues/357)
- [**UI / UX**][**minor**] Node name information on resource nodes [#356](https://github.com/lablup/backend.ai-console/issues/356)
- [**UI / UX**][**library / SDK**][**minor**] Disable project list item when the project is deactivated [#351](https://github.com/lablup/backend.ai-console/issues/351)

---

## v20.02.0 (03/02/2020)

#### Enhancements:

- [**bug**][**enhancement**][**library / SDK**] Support raw file download feature introduced in 19.09 [#342](https://github.com/lablup/backend.ai-console/issues/342)
- [**UI / UX**][**enhancement**][**minor**] Remove registry and namespace from alias and basename [#341](https://github.com/lablup/backend.ai-console/issues/341)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Reliable upload component with tus.io [#305](https://github.com/lablup/backend.ai-console/issues/305)

---

## v20.01.6 (30/01/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**minor**] Add text input to resource policy settings [#277](https://github.com/lablup/backend.ai-console/issues/277)

---

## v20.01.5 (28/01/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**minor**] Support custom image even it does not follow naming convention [#334](https://github.com/lablup/backend.ai-console/issues/334)
- [**bug**][**enhancement**][**library / SDK**][**major**] Handle docker registry path prefix with slash / colon / dash [#333](https://github.com/lablup/backend.ai-console/issues/333)

#### Bug Fixes:

- [**UI / UX**][**bug**][**library / SDK**][**urgency**] Registry name with colon generates error while rescan registry information [#335](https://github.com/lablup/backend.ai-console/issues/335)

#### UI / UX:

- [**UI / UX**][**easy**] Let user management be the first page of Users tab [#337](https://github.com/lablup/backend.ai-console/issues/337)

---

## v20.01.4 (22/01/2020)
*No changelog for this release.*

---

## v20.01.3 (22/01/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**urgency**] Sorting function on environment list [#331](https://github.com/lablup/backend.ai-console/issues/331)

---

## v20.01.2 (21/01/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**major**] Turn off user-specific login mode setting when login mode is fixed [#326](https://github.com/lablup/backend.ai-console/issues/326)
- [**enhancement**][**library / SDK**][**major**] Update JavaScript SDK to accept v5 specification [#323](https://github.com/lablup/backend.ai-console/issues/323)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Clean up global settings [#318](https://github.com/lablup/backend.ai-console/issues/318)
- [**UI / UX**][**easy**][**enhancement**][**good first issue**] Enlarge session resource text input on session start dialog [#311](https://github.com/lablup/backend.ai-console/issues/311)

#### Bug Fixes:

- [**UI / UX**][**bug**][**library / SDK**][**major**] Relevant memory allocation for installing remote kernels [#321](https://github.com/lablup/backend.ai-console/issues/321)

#### UI / UX:

- [**UI / UX**][**good first issue**][**minor**] Let superadmin can see agent ID in session list [#313](https://github.com/lablup/backend.ai-console/issues/313)

---

## v20.01.1 (07/01/2020)

#### Bug Fixes:

- [**bug**][**library / SDK**] Cannot generate keypair without giving manual accesskey/secretkey [#312](https://github.com/lablup/backend.ai-console/issues/312)

---

## v20.01.0 (03/01/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**] Add region / cloud icon on resource tab [#304](https://github.com/lablup/backend.ai-console/issues/304)
- [**UI / UX**][**easy**][**enhancement**] Optimize manifest resources [#300](https://github.com/lablup/backend.ai-console/issues/300)

#### Bug Fixes:

- [**bug**][**minor**] Alive agent is listed in the Terminated Agents tab [#306](https://github.com/lablup/backend.ai-console/issues/306)
- [**bug**] Windows app cannot built with specific configuration [#303](https://github.com/lablup/backend.ai-console/issues/303)
- [**UI / UX**][**bug**] Incorrect image version is selected when launching multiple images [#302](https://github.com/lablup/backend.ai-console/issues/302)

#### UI / UX:

- [**UI / UX**][**minor**] Remove unnecessary menus [#301](https://github.com/lablup/backend.ai-console/issues/301)
- [**UI / UX**][**major**] Group kernels into categories [#284](https://github.com/lablup/backend.ai-console/issues/284)

---

## v19.12.0 (03/12/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Add kernel description to metadata structure [#298](https://github.com/lablup/backend.ai-console/issues/298)
- [**enhancement**][**library / SDK**][**minor**] Reduce app.js for faster loading time [#296](https://github.com/lablup/backend.ai-console/issues/296)
- [**UI / UX**][**enhancement**][**major**] Simplify image metadata structure [#295](https://github.com/lablup/backend.ai-console/issues/295)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Shell-only mode for live update [#294](https://github.com/lablup/backend.ai-console/issues/294)
- [**UI / UX**][**enhancement**][**library / SDK**] Support default SSH / SFTP feature [#265](https://github.com/lablup/backend.ai-console/issues/265)

---

## v19.11.2 (07/11/2019)
*No changelog for this release.*

---

## v19.11.1 (06/11/2019)

#### Enhancements:

- [**enhancement**][**hard**][**major**] Unify error handling on SDK [#288](https://github.com/lablup/backend.ai-console/issues/288)
- [**UI / UX**][**enhancement**][**minor**] Use internal terms of agreements / etc. on sidebar [#287](https://github.com/lablup/backend.ai-console/issues/287)
- [**UI / UX**][**enhancement**][**major**] VNC support [#281](https://github.com/lablup/backend.ai-console/issues/281)
- [**UI / UX**][**enhancement**][**major**] NGC Matlab environment support [#280](https://github.com/lablup/backend.ai-console/issues/280)

#### UI / UX:

- [**UI / UX**][**library / SDK**][**major**] Add project resource indicator [#290](https://github.com/lablup/backend.ai-console/issues/290)
- [**UI / UX**][**minor**] More flexible resource setting during resource preset creation [#282](https://github.com/lablup/backend.ai-console/issues/282)

---

## v19.11.0 (04/11/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**] MPI Fortran Kernel support  [#286](https://github.com/lablup/backend.ai-console/issues/286)

---

## v19.10.4 (31/10/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**][**major**] Native support of all public kernels on app menu [#279](https://github.com/lablup/backend.ai-console/issues/279)
- [**UI / UX**][**enhancement**][**hard**][**minor**] Modify resource gauge at session list to support various device screen [#278](https://github.com/lablup/backend.ai-console/issues/278)
- [**UI / UX**][**enhancement**][**major**] Need a UI for admins to create a session on behalf of users [#260](https://github.com/lablup/backend.ai-console/issues/260)
- [**UI / UX**][**enhancement**] UI update (19.10) [#239](https://github.com/lablup/backend.ai-console/issues/239)

---

## v19.10.3 (16/10/2019)

#### Enhancements:

- [**enhancement**][**library / SDK**] Keep login mode (session / API keypair) for app / web after changing it [#276](https://github.com/lablup/backend.ai-console/issues/276)
- [**enhancement**][**library / SDK**][**major**] Change app-localstorage-document to localStorage [#275](https://github.com/lablup/backend.ai-console/issues/275)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Local configuration store [#274](https://github.com/lablup/backend.ai-console/issues/274)
- [**UI / UX**][**blocker**][**bug**][**enhancement**] Sometimes closing window returns `destroy` error [#273](https://github.com/lablup/backend.ai-console/issues/273)
- [**UI / UX**][**enhancement**] Meaningful messages [#161](https://github.com/lablup/backend.ai-console/issues/161)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Image manipulation [#37](https://github.com/lablup/backend.ai-console/issues/37)

#### Bug Fixes:

- [**UI / UX**][**bug**] User cannot use long e-mail address even if it is accepted at sign up [#272](https://github.com/lablup/backend.ai-console/issues/272)

#### UI / UX:

- [**UI / UX**][**minor**] Humanize CPU used time in session information [#150](https://github.com/lablup/backend.ai-console/issues/150)

---

## v19.10.2 (14/10/2019)

#### Bug Fixes:

- [**UI / UX**][**bug**][**minor**] Footer on sidebar / API endpoint content are not showing on Safari [#271](https://github.com/lablup/backend.ai-console/issues/271)
- [**UI / UX**][**bug**][**major**] Statistics page generates error on Safari when visiting through menu navigation [#270](https://github.com/lablup/backend.ai-console/issues/270)

---

## v19.10.1 (14/10/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**] Naming change - scaling group to resource group on UI [#267](https://github.com/lablup/backend.ai-console/issues/267)
- [**UI / UX**][**enhancement**][**major**] Unit on statistics usage graph is missing [#266](https://github.com/lablup/backend.ai-console/issues/266)
- [**UI / UX**][**blocker**][**enhancement**][**minor**] Sometimes date overlaps on statistics panel [#261](https://github.com/lablup/backend.ai-console/issues/261)
- [**enhancement**][**library / SDK**][**major**] External image resource information for better image information control [#259](https://github.com/lablup/backend.ai-console/issues/259)
- [**UI / UX**][**blocker**][**enhancement**][**hard**] Hide GPU-disabled resource templates if kernel requires GPU [#257](https://github.com/lablup/backend.ai-console/issues/257)
- [**enhancement**][**hard**][**major**] Plug-in architecture [#95](https://github.com/lablup/backend.ai-console/issues/95)

#### Bug Fixes:

- [**UI / UX**][**blocker**][**bug**] Statistics page does not initialize if accessed directly [#269](https://github.com/lablup/backend.ai-console/issues/269)
- [**UI / UX**][**bug**][**minor**] Wrong active session count on system health panel  [#264](https://github.com/lablup/backend.ai-console/issues/264)
- [**UI / UX**][**blocker**][**bug**] User can try to terminate kernels on 'finished' tab [#263](https://github.com/lablup/backend.ai-console/issues/263)
- [**UI / UX**][**blocker**][**bug**] Insight tab is viewable even in production mode [#262](https://github.com/lablup/backend.ai-console/issues/262)

---

## v19.10.0 (02/10/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**] Signup is not possible when endpoint is not set [#244](https://github.com/lablup/backend.ai-console/issues/244)
- [**UI / UX**][**enhancement**][**hard**][**major**] Add desktop notification support [#243](https://github.com/lablup/backend.ai-console/issues/243)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Snackbar to trace more error information [#213](https://github.com/lablup/backend.ai-console/issues/213)
- [**UI / UX**][**enhancement**] UI update (19.09) [#199](https://github.com/lablup/backend.ai-console/issues/199)
- [**enhancement**][**library / SDK**][**major**] Add image installation API [#158](https://github.com/lablup/backend.ai-console/issues/158)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] User management feature [#67](https://github.com/lablup/backend.ai-console/issues/67)

#### Bug Fixes:

- [**UI / UX**][**bug**] Scaling group resource indicator does not update when changing SG on summary page [#241](https://github.com/lablup/backend.ai-console/issues/241)

#### UI / UX:

- [**UI / UX**] Resource presets and resource indicator is not updated upon scaling group changed in session list page [#249](https://github.com/lablup/backend.ai-console/issues/249)
- [**UI / UX**][**major**] Per-scaling-group resource slots should be used for sliders' max value in session creation dialog [#248](https://github.com/lablup/backend.ai-console/issues/248)
- [**UI / UX**] "undefined" image for custom, not registered image [#247](https://github.com/lablup/backend.ai-console/issues/247)
- [**UI / UX**][**easy**][**minor**] Add delete resource preset button [#246](https://github.com/lablup/backend.ai-console/issues/246)
- [**UI / UX**][**easy**] Move scaling group selection dropdown one level higher [#245](https://github.com/lablup/backend.ai-console/issues/245)
- [**UI / UX**][**major**] Filter session and vfolder list depending on the selected group(project) [#242](https://github.com/lablup/backend.ai-console/issues/242)
- [**UI / UX**][**blocker**] Browser autodetection [#240](https://github.com/lablup/backend.ai-console/issues/240)

---

## v19.09.9 (30/09/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**] Add debug app port for developing kernel images [#235](https://github.com/lablup/backend.ai-console/issues/235)
- [**UI / UX**][**easy**][**enhancement**] Add version tag on session list element [#234](https://github.com/lablup/backend.ai-console/issues/234)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Support visual studio code app [#233](https://github.com/lablup/backend.ai-console/issues/233)
- [**UI / UX**][**blocker**][**enhancement**][**library / SDK**][**major**] SFTP support [#221](https://github.com/lablup/backend.ai-console/issues/221)
- [**UI / UX**][**enhancement**] Signout feature [#154](https://github.com/lablup/backend.ai-console/issues/154)

#### Bug Fixes:

- [**UI / UX**][**bug**] Scaling Group sometimes does not read from GQL [#232](https://github.com/lablup/backend.ai-console/issues/232)

#### UI / UX:

- [**UI / UX**][**minor**] Permission / UI for domain admin to create group folder for specific group [#231](https://github.com/lablup/backend.ai-console/issues/231)

---

## v19.09.8 (25/09/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**][**library / SDK**] Support detailed status monitor on session list [#228](https://github.com/lablup/backend.ai-console/issues/228)
- [**UI / UX**][**enhancement**] Change snackbar to the top of other elements such as backdrop [#227](https://github.com/lablup/backend.ai-console/issues/227)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Native terminal support for non-jupyter environment [#226](https://github.com/lablup/backend.ai-console/issues/226)
- [**UI / UX**][**enhancement**] Detailed information to status info [#223](https://github.com/lablup/backend.ai-console/issues/223)

#### Bug Fixes:

- [**UI / UX**][**blocker**][**bug**] Sometimes group elements are duplicated [#229](https://github.com/lablup/backend.ai-console/issues/229)

---

## v19.09.7 (22/09/2019)

#### Enhancements:

- [**UI / UX**][**blocker**][**bug**][**enhancement**][**hard**] Open new session in jupyter notebook results in white page [#225](https://github.com/lablup/backend.ai-console/issues/225)
- [**UI / UX**][**easy**][**enhancement**] Remove reload button on app (it does not work) [#224](https://github.com/lablup/backend.ai-console/issues/224)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Let superadmin can specify hostname when creating docker registry [#194](https://github.com/lablup/backend.ai-console/issues/194)
- [**enhancement**][**library / SDK**] Backward compatibility layer [#86](https://github.com/lablup/backend.ai-console/issues/86)
- [**UI / UX**][**enhancement**][**library / SDK**] Use registry for kernel selection [#30](https://github.com/lablup/backend.ai-console/issues/30)

#### Bug Fixes:

- [**blocker**][**bug**][**library / SDK**] Sometimes scaling group query fails on load [#220](https://github.com/lablup/backend.ai-console/issues/220)
- [**UI / UX**][**blocker**][**bug**] Visiting statistics page always generates error and no graph is shown on first visit [#219](https://github.com/lablup/backend.ai-console/issues/219)
- [**bug**] Visiting Resource Presets page by an admin in non-default group raises error [#216](https://github.com/lablup/backend.ai-console/issues/216)

#### UI / UX:

- [**UI / UX**][**major**] Resource preset is not updated when scaling group is changed [#214](https://github.com/lablup/backend.ai-console/issues/214)

---

## v19.09.6 (19/09/2019)

#### Enhancements:

- [**enhancement**][**library / SDK**] Windows app builder script [#218](https://github.com/lablup/backend.ai-console/issues/218)

---

## v19.09.5 (18/09/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**][**hard**] Modify layout component to be modal-compatible [#217](https://github.com/lablup/backend.ai-console/issues/217)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**] Agreement webcomponent [#133](https://github.com/lablup/backend.ai-console/issues/133)
- [**UI / UX**][**enhancement**] UI update (19.08) [#127](https://github.com/lablup/backend.ai-console/issues/127)

#### Bug Fixes:

- [**UI / UX**][**bug**] Uploading indicator does not disappear when 5 or more files are simultaneously uploaded [#198](https://github.com/lablup/backend.ai-console/issues/198)
- [**UI / UX**][**bug**][**hard**] Logout at session page and re-login disables session tab link [#197](https://github.com/lablup/backend.ai-console/issues/197)
- [**UI / UX**][**bug**][**minor**] Focus is moved to Log In button during typing id/password [#162](https://github.com/lablup/backend.ai-console/issues/162)

#### UI / UX:

- [**UI / UX**][**minor**] Remove sharing/invitation icons from group vfolders [#212](https://github.com/lablup/backend.ai-console/issues/212)

---

## v19.09.4 (13/09/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Support shmem option [#209](https://github.com/lablup/backend.ai-console/issues/209)

#### Bug Fixes:

- [**bug**] Downloading from vfolder is not working [#202](https://github.com/lablup/backend.ai-console/issues/202)

---

## v19.09.3 (09/09/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**] Separate app / console-server version query [#205](https://github.com/lablup/backend.ai-console/issues/205)
- [**enhancement**][**hard**][**library / SDK**][**major**] Strict TypeScript codes [#188](https://github.com/lablup/backend.ai-console/issues/188)

---

## v19.09.2 (05/09/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**][**library / SDK**][**major**] App shell mode [#203](https://github.com/lablup/backend.ai-console/issues/203)

---

## v19.09.1 (05/09/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**][**minor**] Support h2o.ai container [#196](https://github.com/lablup/backend.ai-console/issues/196)
- [**UI / UX**][**enhancement**][**major**] Let domain admin can create group vfolder [#192](https://github.com/lablup/backend.ai-console/issues/192)
- [**UI / UX**][**enhancement**][**library / SDK**] Modify image metadata [#175](https://github.com/lablup/backend.ai-console/issues/175)

#### Bug Fixes:

- [**UI / UX**][**bug**][**minor**] Session list sometimes returns weird error [#201](https://github.com/lablup/backend.ai-console/issues/201)
- [**UI / UX**][**blocker**][**bug**] Run button is active even in finished sessions tab [#195](https://github.com/lablup/backend.ai-console/issues/195)
- [**bug**] Domain admin cannot create session [#191](https://github.com/lablup/backend.ai-console/issues/191)

#### UI / UX:

- [**UI / UX**] Prevent domain admin view/edit docker registries [#193](https://github.com/lablup/backend.ai-console/issues/193)

---

## v19.09.0 (02/09/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**][**hard**][**major**] Stackable snackbars [#189](https://github.com/lablup/backend.ai-console/issues/189)
- [**UI / UX**][**enhancement**][**minor**] Splash with about dialog [#187](https://github.com/lablup/backend.ai-console/issues/187)

---

## v19.08.7 (29/08/2019)

#### Bug Fixes:

- [**UI / UX**][**bug**][**hard**][**library / SDK**][**major**] Jupyter notebook window is not closed with "Close" button [#146](https://github.com/lablup/backend.ai-console/issues/146)

---

## v19.08.6 (29/08/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Use server-side app configurations to provide app [#182](https://github.com/lablup/backend.ai-console/issues/182)
- [**UI / UX**][**enhancement**] Support IAM - id/password dual mode [#176](https://github.com/lablup/backend.ai-console/issues/176)
- [**UI / UX**][**enhancement**] Support password manager on login [#167](https://github.com/lablup/backend.ai-console/issues/167)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Registry tab on Environment  [#166](https://github.com/lablup/backend.ai-console/issues/166)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Scaling group tab [#142](https://github.com/lablup/backend.ai-console/issues/142)
- [**UI / UX**][**enhancement**] Check duplicated session name and prevent starting  [#136](https://github.com/lablup/backend.ai-console/issues/136)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Sign-up feature [#124](https://github.com/lablup/backend.ai-console/issues/124)
- [**UI / UX**][**enhancement**][**minor**] Create many sessions at a time [#121](https://github.com/lablup/backend.ai-console/issues/121)
- [**UI / UX**][**enhancement**] Add login cancel button while login [#109](https://github.com/lablup/backend.ai-console/issues/109)
- [**enhancement**][**library / SDK**][**major**] TypeScript support [#107](https://github.com/lablup/backend.ai-console/issues/107)
- [**enhancement**] Group feature [#64](https://github.com/lablup/backend.ai-console/issues/64)

#### Bug Fixes:

- [**UI / UX**][**blocker**][**bug**] Resource panel on start panel in summary page do not refresh after visiting another tab [#177](https://github.com/lablup/backend.ai-console/issues/177)
- [**blocker**][**bug**] Invalid resources indicator after user used all resources [#170](https://github.com/lablup/backend.ai-console/issues/170)
- [**UI / UX**][**bug**] White screen after logout in app [#160](https://github.com/lablup/backend.ai-console/issues/160)

#### UI / UX:

- [**UI / UX**][**easy**][**question**] Connection is failed if endpoint url contains leading/trailing spaces [#181](https://github.com/lablup/backend.ai-console/issues/181)
- [**UI / UX**][**blocker**][**library / SDK**][**major**] Can see other users' sessions with user privileges [#172](https://github.com/lablup/backend.ai-console/issues/172)
- [**UI / UX**][**major**] Treat general kernel names from various repository [#26](https://github.com/lablup/backend.ai-console/issues/26)

---

## v19.08.5 (26/08/2019)

#### Enhancements:

- [**UI / UX**][**bug**][**enhancement**] Weird infinity issue [#169](https://github.com/lablup/backend.ai-console/issues/169)
- [**UI / UX**][**enhancement**] Custom CSS support [#163](https://github.com/lablup/backend.ai-console/issues/163)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Keep domain admin from access unnecessary menus/lists [#156](https://github.com/lablup/backend.ai-console/issues/156)
- [**UI / UX**][**bug**][**enhancement**][**hard**][**library / SDK**][**major**] Closing console app should invalidate session in console-server [#147](https://github.com/lablup/backend.ai-console/issues/147)
- [**UI / UX**][**enhancement**] Change session API key to user name when console is running on SESSION mode [#137](https://github.com/lablup/backend.ai-console/issues/137)

#### Bug Fixes:

- [**UI / UX**][**bug**][**minor**] Strange column in session list page for admins [#173](https://github.com/lablup/backend.ai-console/issues/173)
- [**blocker**][**bug**] Request to check-presets fail for users not in the default group [#153](https://github.com/lablup/backend.ai-console/issues/153)
- [**UI / UX**][**bug**] Session list is not fetched after re-login in window app [#152](https://github.com/lablup/backend.ai-console/issues/152)
- [**UI / UX**][**bug**] Session count is not decreased after terminating a session [#151](https://github.com/lablup/backend.ai-console/issues/151)
- [**UI / UX**][**bug**] Kernels from other repository does not show proper resource slider [#145](https://github.com/lablup/backend.ai-console/issues/145)

#### UI / UX:

- [**UI / UX**][**minor**] Hide disabled pages (features) [#171](https://github.com/lablup/backend.ai-console/issues/171)
- [**UI / UX**][**major**] Prevent user to allocate more resource than it has [#165](https://github.com/lablup/backend.ai-console/issues/165)
- [**UI / UX**][**minor**] Add scaling group column in session list [#155](https://github.com/lablup/backend.ai-console/issues/155)

---

## v19.08.4 (21/08/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**][**minor**] Login with enter key [#149](https://github.com/lablup/backend.ai-console/issues/149)
- [**enhancement**][**hard**][**library / SDK**][**major**] Merge new websocket proxy [#141](https://github.com/lablup/backend.ai-console/issues/141)
- [**enhancement**][**hard**][**library / SDK**] Summer clean component codes [#135](https://github.com/lablup/backend.ai-console/issues/135)

#### Bug Fixes:

- [**UI / UX**][**bug**][**minor**] Signup button is present even config.toml is set to false [#148](https://github.com/lablup/backend.ai-console/issues/148)
- [**blocker**][**bug**][**library / SDK**] Cannot change password on Users - users [#138](https://github.com/lablup/backend.ai-console/issues/138)

---

## v19.08.3 (14/08/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Statistics panel [#80](https://github.com/lablup/backend.ai-console/issues/80)

---

## v19.08.2 (12/08/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**][**library / SDK**] Optimize DOM parsing routines [#130](https://github.com/lablup/backend.ai-console/issues/130)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**] Debug flag in config [#128](https://github.com/lablup/backend.ai-console/issues/128)
- [**UI / UX**][**enhancement**][**library / SDK**] Scaling group support [#126](https://github.com/lablup/backend.ai-console/issues/126)
- [**UI / UX**][**enhancement**] UI update (19.07) [#89](https://github.com/lablup/backend.ai-console/issues/89)
- [**enhancement**][**hard**][**major**] Make active / deactivate codes as hierarchical module [#81](https://github.com/lablup/backend.ai-console/issues/81)
- [**enhancement**][**library / SDK**][**major**] Polite error message component [#76](https://github.com/lablup/backend.ai-console/issues/76)
- [**UI / UX**][**enhancement**][**hard**][**major**] Resource template menu [#52](https://github.com/lablup/backend.ai-console/issues/52)

#### Bug Fixes:

- [**UI / UX**][**bug**] Cannot allocate 1 CPU on advanced settings when 1 CPU is remained  [#132](https://github.com/lablup/backend.ai-console/issues/132)
- [**UI / UX**][**bug**][**invalid**] GPU allocation slider disabled when starting session [#125](https://github.com/lablup/backend.ai-console/issues/125)

---

## v19.08.1 (05/08/2019)

#### Enhancements:

- [**bug**][**enhancement**][**hard**][**library / SDK**][**major**] Reduce too much auto refreshing [#123](https://github.com/lablup/backend.ai-console/issues/123)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Delete file(s) feature [#117](https://github.com/lablup/backend.ai-console/issues/117)
- [**enhancement**] Divide session / api connection variable [#113](https://github.com/lablup/backend.ai-console/issues/113)
- [**UI / UX**][**enhancement**][**library / SDK**] Add resource preset button [#90](https://github.com/lablup/backend.ai-console/issues/90)

#### Bug Fixes:

- [**bug**][**hard**][**library / SDK**][**major**] resource_policy reading fails after login [#118](https://github.com/lablup/backend.ai-console/issues/118)
- [**bug**][**hard**] No session leads memory usage to infinite [#116](https://github.com/lablup/backend.ai-console/issues/116)

#### UI / UX:

- [**UI / UX**][**major**] Firm error message during proxy process [#120](https://github.com/lablup/backend.ai-console/issues/120)
- [**UI / UX**][**easy**][**minor**] Set newest kernel version as default [#119](https://github.com/lablup/backend.ai-console/issues/119)

#### Library / SDK:

- [**hard**][**library / SDK**][**major**] Logout button on app leads user to white blank screen [#110](https://github.com/lablup/backend.ai-console/issues/110)

---

## v19.07.2 (23/07/2019)

#### Enhancements:

- [**enhancement**][**library / SDK**] Change ini to toml config [#114](https://github.com/lablup/backend.ai-console/issues/114)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Multiple choice / confirmation of session management [#102](https://github.com/lablup/backend.ai-console/issues/102)
- [**UI / UX**][**enhancement**] Feature/UI to change resource policy of keypair [#101](https://github.com/lablup/backend.ai-console/issues/101)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Permission change dialog for each folder [#100](https://github.com/lablup/backend.ai-console/issues/100)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Add storage sharing dialog to storage [#94](https://github.com/lablup/backend.ai-console/issues/94)
- [**enhancement**][**library / SDK**] SSL support on docker image [#92](https://github.com/lablup/backend.ai-console/issues/92)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Let maintenance buttons work [#91](https://github.com/lablup/backend.ai-console/issues/91)
- [**UI / UX**][**easy**][**enhancement**] Add intermediate state list on sessions [#88](https://github.com/lablup/backend.ai-console/issues/88)
- [**UI / UX**][**enhancement**][**library / SDK**] Add keypair with manual accessKey / secretKey [#87](https://github.com/lablup/backend.ai-console/issues/87)
- [**UI / UX**][**enhancement**][**library / SDK**] User information change support [#85](https://github.com/lablup/backend.ai-console/issues/85)
- [**enhancement**][**hard**][**library / SDK**] Compress Backend.AI ES6 SDK [#84](https://github.com/lablup/backend.ai-console/issues/84)
- [**bug**][**enhancement**] Robust login fail scenario [#83](https://github.com/lablup/backend.ai-console/issues/83)
- [**enhancement**][**hard**][**library / SDK**] Migrate build chain from polymer to rollup [#82](https://github.com/lablup/backend.ai-console/issues/82)
- [**easy**][**enhancement**] Message while login [#79](https://github.com/lablup/backend.ai-console/issues/79)
- [**UI / UX**][**enhancement**][**good first issue**][**minor**] Differentiate resource monitor UI on session view and summary view [#78](https://github.com/lablup/backend.ai-console/issues/78)
- [**enhancement**][**hard**][**working**] Support session login mode [#63](https://github.com/lablup/backend.ai-console/issues/63)

#### Bug Fixes:

- [**bug**][**minor**] Kernel without app spawns error [#112](https://github.com/lablup/backend.ai-console/issues/112)
- [**UI / UX**][**bug**][**easy**] Validation message is wrong for spacing [#98](https://github.com/lablup/backend.ai-console/issues/98)
- [**bug**][**hard**][**library / SDK**] Resource policy update not working [#97](https://github.com/lablup/backend.ai-console/issues/97)
- [**UI / UX**][**bug**] Weird login panel splashing [#96](https://github.com/lablup/backend.ai-console/issues/96)
- [**bug**][**library / SDK**][**major**] Reduce graphql calls  [#93](https://github.com/lablup/backend.ai-console/issues/93)

#### UI / UX:

- [**UI / UX**][**library / SDK**][**major**][**working**] Concurrency monitor on session [#65](https://github.com/lablup/backend.ai-console/issues/65)

---

## v19.07.0 (08/07/2019)
*No changelog for this release.*

---

## v19.07.1 (08/07/2019)

#### Enhancements:

- [**easy**][**enhancement**][**good first issue**] Add resource monitor / run button on summary [#77](https://github.com/lablup/backend.ai-console/issues/77)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Independent resource monitor / session launch for fluid session command location [#75](https://github.com/lablup/backend.ai-console/issues/75)
- [**Deploy**][**enhancement**][**hard**] Spring clean Javascript SDK [#18](https://github.com/lablup/backend.ai-console/issues/18)

---

## v19.06.1 (28/06/2019)

#### Enhancements:

- [**enhancement**][**library / SDK**][**major**] Add virtual folder with different host [#72](https://github.com/lablup/backend.ai-console/issues/72)
- [**UI / UX**][**enhancement**] Unified snackbar implementation [#71](https://github.com/lablup/backend.ai-console/issues/71)
- [**enhancement**] Remove port dependency of wsproxy [#68](https://github.com/lablup/backend.ai-console/issues/68)
- [**enhancement**][**hard**] custom component migrations into lit-element [#45](https://github.com/lablup/backend.ai-console/issues/45)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Selectable vfolder host on folder creation [#43](https://github.com/lablup/backend.ai-console/issues/43)

#### Library / SDK:

- [**library / SDK**][**major**] ANSI support for logs [#73](https://github.com/lablup/backend.ai-console/issues/73)

---

## v19.06.0 (13/06/2019)

#### Enhancements:

- [**enhancement**][**library / SDK**] Force update service worker footage on index.html [#62](https://github.com/lablup/backend.ai-console/issues/62)
- [**UI / UX**][**easy**][**enhancement**] Embed fonts [#61](https://github.com/lablup/backend.ai-console/issues/61)
- [**enhancement**][**hard**][**library / SDK**][**major**] Versatile configuration for logo, spec., system, etc. [#60](https://github.com/lablup/backend.ai-console/issues/60)
- [**Deploy**][**UI / UX**][**enhancement**][**major**] Docker-compose for console / wsproxy pair [#59](https://github.com/lablup/backend.ai-console/issues/59)
- [**UI / UX**][**enhancement**][**hard**][**major**] UI update (1.4) [#55](https://github.com/lablup/backend.ai-console/issues/55)

---

## v19.03.5 (02/06/2019)
*No changelog for this release.*

---

## v19.03.4 (27/05/2019)
*No changelog for this release.*

---

## v19.03.3 (19/05/2019)

#### Enhancements:

- [**enhancement**][**good first issue**][**hard**] Dockerize for server side serving [#22](https://github.com/lablup/backend.ai-console/issues/22)

#### Library / SDK:

- [**Deploy**][**library / SDK**][**minor**] Match version with backend.ai [#57](https://github.com/lablup/backend.ai-console/issues/57)

---

## v19.03.1 (29/04/2019)

#### Enhancements:

- [**enhancement**] Remove node polyfill from ES6 library [#53](https://github.com/lablup/backend.ai-console/issues/53)
- [**enhancement**][**working**] Adopt Electron shell [#4](https://github.com/lablup/backend.ai-console/issues/4)

---

## v1.4.2 (26/04/2019)
*No changelog for this release.*

---

## v1.4.1 (24/04/2019)
*No changelog for this release.*

---

## v1.4.0 (23/04/2019)
*No changelog for this release.*

---

## v1.3.8 (14/04/2019)

#### Enhancements:

- [**enhancement**][**hard**] Resource monitor [#7](https://github.com/lablup/backend.ai-console/issues/7)
- [**enhancement**][**major**][**working**] Job/session control [#5](https://github.com/lablup/backend.ai-console/issues/5)

#### Bug Fixes:

- [**bug**][**invalid**] Error on vfolder deletion [#51](https://github.com/lablup/backend.ai-console/issues/51)

---

## v1.3.7 (12/04/2019)

#### Enhancements:

- [**enhancement**][**hard**] Generalize app launcher [#50](https://github.com/lablup/backend.ai-console/issues/50)
- [**enhancement**][**hard**] Integrate with Resource Policy [#32](https://github.com/lablup/backend.ai-console/issues/32)

---

## v1.3.6 (07/04/2019)

#### Bug Fixes:

- [**bug**] Wrong max. value of resource per user on session page [#49](https://github.com/lablup/backend.ai-console/issues/49)

---

## v1.3.4 (07/04/2019)

#### Enhancements:

- [**enhancement**] Default language / version for session start [#48](https://github.com/lablup/backend.ai-console/issues/48)
- [**enhancement**][**minor**] Indicator during data load [#38](https://github.com/lablup/backend.ai-console/issues/38)

---

## v1.2.16 (05/04/2019)

#### Enhancements:

- [**enhancement**][**hard**] New service worker loader [#44](https://github.com/lablup/backend.ai-console/issues/44)
- [**enhancement**] Configurable config.js for deploy sources [#42](https://github.com/lablup/backend.ai-console/issues/42)
- [**enhancement**][**hard**] Enable TensorBoard proxy [#40](https://github.com/lablup/backend.ai-console/issues/40)

#### Bug Fixes:

- [**bug**] Cannot change active keypair to inactive keypair [#47](https://github.com/lablup/backend.ai-console/issues/47)

---

## v1.2.2 (27/03/2019)

#### Enhancements:

- [**enhancement**][**hard**] Resource indicator for user session [#41](https://github.com/lablup/backend.ai-console/issues/41)

---

## v1.2.0 (21/03/2019)

#### Enhancements:

- [**enhancement**] Give SysAdmin to delete / log / restart others' sessions [#39](https://github.com/lablup/backend.ai-console/issues/39)

---

## v1.0.2 (08/03/2019)
*No changelog for this release.*

---

## v1.0.1 (05/03/2019)
*No changelog for this release.*

---

## v1.0.0 (04/03/2019)
*No changelog for this release.*

---

## v0.9.6 (21/02/2019)

#### Enhancements:

- [**enhancement**] Convert to lit-element [#35](https://github.com/lablup/backend.ai-console/issues/35)
- [**enhancement**] Show date/time in the file browser as KST [#33](https://github.com/lablup/backend.ai-console/issues/33)
- [**enhancement**][**hard**] Data management support [#16](https://github.com/lablup/backend.ai-console/issues/16)
- [**enhancement**] Data manipulation library [#15](https://github.com/lablup/backend.ai-console/issues/15)

#### Library / SDK:

- [**library / SDK**] Unify wsproxy into console [#36](https://github.com/lablup/backend.ai-console/issues/36)

---

## v0.9.5 (18/02/2019)

#### Enhancements:

- [**enhancement**] Dynamic resource indicator change [#24](https://github.com/lablup/backend.ai-console/issues/24)

#### Bug Fixes:

- [**bug**] Wrong CPU count [#31](https://github.com/lablup/backend.ai-console/issues/31)

---

## v0.9.0 (05/02/2019)

#### Enhancements:

- [**bug**][**enhancement**] Empty kernel selection in session start page [#23](https://github.com/lablup/backend.ai-console/issues/23)
- [**enhancement**] Multiple mount point when starting session [#21](https://github.com/lablup/backend.ai-console/issues/21)
- [**easy**][**enhancement**] Prevent modal close by clicking outside login dialog [#19](https://github.com/lablup/backend.ai-console/issues/19)
- [**enhancement**] Selectable mount virtual folder on session launch time [#17](https://github.com/lablup/backend.ai-console/issues/17)
- [**enhancement**] Load monitor on summary page [#14](https://github.com/lablup/backend.ai-console/issues/14)
- [**enhancement**] Basic user mode support [#11](https://github.com/lablup/backend.ai-console/issues/11)
- [**enhancement**][**hard**] Keypair management [#8](https://github.com/lablup/backend.ai-console/issues/8)

#### Bug Fixes:

- [**bug**] No notebook on pytorch kernels [#29](https://github.com/lablup/backend.ai-console/issues/29)
- [**bug**] Cannot press termination button on specific condition [#27](https://github.com/lablup/backend.ai-console/issues/27)
- [**bug**] version list grows as user visit jobs menu [#20](https://github.com/lablup/backend.ai-console/issues/20)
- [**bug**] routeData.view returns `Y:`  on windows electron [#12](https://github.com/lablup/backend.ai-console/issues/12)

---

## v0.7.0 (16/01/2019)

#### Enhancements:

- [**enhancement**] Strip out mistakenly added trailing slashes in the endpoint URL [#10](https://github.com/lablup/backend.ai-console/issues/10)
- [**enhancement**][**major**] Reduce autoqueries [#9](https://github.com/lablup/backend.ai-console/issues/9)
- [**enhancement**][**hard**] Job list query [#3](https://github.com/lablup/backend.ai-console/issues/3)

---

## v0.5.0 (01/12/2018)
*No changelog for this release.*

---

## v0.3.9 (24/11/2018)

#### Enhancements:

- [**enhancement**][**major**]  Login implementation [#6](https://github.com/lablup/backend.ai-console/issues/6)

---

## v0.2.1 (17/11/2018)
*No changelog for this release.*

---

## v0.2.0 (07/11/2018)

#### Enhancements:

- [**enhancement**][**major**] Add UI backbone frame [#2](https://github.com/lablup/backend.ai-console/issues/2)

---

## v0.1.1 (11/10/2018)

#### Enhancements:

- [**enhancement**] Initialization and testing [#1](https://github.com/lablup/backend.ai-console/issues/1)

---

## v0.1.0 (10/10/2018)
*No changelog for this release.*
