# E2E Test Coverage Report

> **Last Updated:** 2026-03-10
> **Router Source:** [`react/src/routes.tsx`](../react/src/routes.tsx)
> **E2E Root:** [`e2e/`](.)
>
> **Note:** Feature counts and coverage status may contain inaccuracies or omissions. If you find discrepancies, please update accordingly.

---

## Coverage Summary

**Scope:** Coverage metrics apply only to the routes listed below and do **not** include all entries from `react/src/routes.tsx`. Routes such as `/admin-dashboard` (not yet exposed in menu) and `/ai-agent` (experimental) are currently out of scope.

**Overall (in-scope routes): 111 / 289 features covered (38%)**

| Page | Route | Features | Covered | Status |
|------|-------|:--------:|:-------:|:------:|
| Authentication | `/interactive-login` | 10 | 7 | 🔶 70% |
| Start Page | `/start` | 8 | 6 | 🔶 75% |
| Dashboard | `/dashboard` | 9 | 7 | 🔶 78% |
| Session List | `/session` | 20 | 12 | 🔶 60% |
| Session Launcher | `/session/start` | 12 | 1 | 🔶 8% |
| Serving | `/serving` | 7 | 0 | ❌ 0% |
| Endpoint Detail | `/serving/:serviceId` | 14 | 0 | ❌ 0% |
| Service Launcher | `/service/start` | 5 | 0 | ❌ 0% |
| VFolder / Data | `/data` | 38 | 25 | 🔶 66% |
| Model Store | `/model-store` | 6 | 0 | ❌ 0% |
| Storage Host | `/storage-settings/:hostname` | 3 | 0 | ❌ 0% |
| My Environment | `/my-environment` | 2 | 2 | ✅ 100% |
| Environment | `/environment` | 24 | 18 | 🔶 75% |
| Configurations | `/settings` | 10 | 8 | 🔶 80% |
| Resources | `/agent-summary`, `/agent` | 8 | 3 | 🔶 38% |
| Resource Policy | `/resource-policy` | 13 | 10 | 🔶 77% |
| User Credentials | `/credential` | 16 | 9 | 🔶 56% |
| Maintenance | `/maintenance` | 3 | 2 | 🔶 67% |
| User Settings | `/usersettings` | 10 | 0 | ❌ 0% |
| Project | `/project` | 6 | 5 | 🔶 83% |
| Statistics | `/statistics` | 2 | 2 | ✅ 100% |
| Scheduler | `/scheduler` | 6 | 0 | ❌ 0% |
| Reservoir | `/reservoir`, `/reservoir/:artifactId` | 18 | 0 | ❌ 0% |
| Branding | `/branding` | 14 | 0 | ❌ 0% |
| App Launcher | (modal) | 18 | 10 | 🔶 56% |
| Chat | `/chat/:id?` | 6 | 0 | ❌ 0% |
| Plugin System | (config-based) | 12 | 12 | ✅ 100% |
| **Total** | | **289** | **111** | **38%** |

---

## Detailed Coverage by Page (Route)

### Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Covered by E2E test |
| 🔶 | Partially covered |
| ❌ | Not covered |
| 🚧 | Skipped/WIP test exists |

---

### 1. Authentication (`/interactive-login`)

**Test files:** [`e2e/auth/login.spec.ts`](auth/login.spec.ts)

| Feature | Status | Test |
|---------|--------|------|
| Display login form | ✅ | `should display the login form` |
| Successful login & redirect | ✅ | `should redirect to the Summary` |
| Invalid email error | ✅ | `should display error message for non-existent email` |
| Invalid password error | ✅ | `should display error message for incorrect password` |
| Endpoint URL normalization (trailing slash) | ✅ | `user can login with endpoint that has a single trailing slash` |
| Endpoint URL normalization (multiple slashes) | ✅ | `user can login with endpoint that has multiple trailing slashes` |
| Endpoint URL normalization (double-slash prevention) | ✅ | `API requests do not contain double-slash after endpoint normalization` |
| OAuth/SSO login flow | ❌ | - |
| Session persistence | ❌ | - |
| Account switching | ❌ | - |

**Coverage: 🔶 7/10 features**

---

### 2. Start Page (`/start`)

**Test files:** [`e2e/start/start-page.spec.ts`](start/start-page.spec.ts), visual regression: [`e2e/visual_regression/start/start_page.test.ts`](visual_regression/start/start_page.test.ts)

**Modals:** `FolderCreateModal`, `StartFromURLModal`

| Feature | Status | Test |
|---------|--------|------|
| Board layout rendering | ✅ | `Admin can see draggable cards` |
| Quick action: Create folder → FolderCreateModal | ✅ | `Admin can open/create folder` |
| Quick action: Start interactive session → `/session/start` | ✅ | `Admin can navigate to Session Launcher` |
| Quick action: Start batch session → `/session/start` | ✅ | `Admin can navigate in batch mode` |
| Quick action: Start model service → `/service/start` | ✅ | `Admin can navigate to Model Service` |
| Quick action: Import from URL → StartFromURLModal | ✅ | `Admin can open Start From URL modal` |
| Board item drag & reorder | ❌ | - |
| VFolder invitation notifications | ❌ | - |

**Coverage: 🔶 6/8 features**

---

### 3. Dashboard (`/dashboard`)

**Test files:** [`e2e/dashboard/dashboard.spec.ts`](dashboard/dashboard.spec.ts), visual regression: [`e2e/visual_regression/dashboard/dashboard_page.test.ts`](visual_regression/dashboard/dashboard_page.test.ts)

| Feature | Status | Test |
|---------|--------|------|
| Dashboard rendering | ✅ | `Admin can see all expected dashboard widgets` |
| Session count cards | ✅ | `Admin can see session type breakdown` |
| Resource usage display (MyResource) | ✅ | `Admin can view CPU and Memory usage` |
| Resource usage per resource group | ✅ | `Admin can view resource usage per group` |
| Agent statistics (admin) | ✅ | `Admin can view Agent Stats widget` |
| Active agents list (admin) | ❌ | - |
| Recent sessions list | ✅ | `Admin can view recently created sessions` |
| Auto-refresh (15s) | ❌ | - |
| Dashboard item drag/resize | ✅ | `Admin can see resizable widgets` |

**Coverage: 🔶 7/9 features**

---

### 4. Session List (`/session`)

**Test files:** [`e2e/session/session-creation.spec.ts`](session/session-creation.spec.ts), [`e2e/session/session-lifecycle.spec.ts`](session/session-lifecycle.spec.ts), [`e2e/session/session-scheduling-history-modal.spec.ts`](session/session-scheduling-history-modal.spec.ts)

**Tabs:** `all` | `interactive` | `batch` | `inference` | `system`
**Sub-tabs:** Running | Finished
**Modals/Drawers:** `TerminateSessionModal`, `SessionDetailDrawer` (via name click), `SessionSchedulingHistoryModal`

| Feature | Status | Test |
|---------|--------|------|
| Create interactive session (Start page) | ✅ | `User can create interactive session on the Start page` |
| Create batch session (Start page) | ✅ | `User can create batch session on the Start page` |
| Create interactive session (Session page) | ✅ | `User can create interactive session on the Sessions page` |
| Create batch session (Session page) | ✅ | `User can create batch session on the Sessions page` |
| Session lifecycle (create/monitor/terminate) | ✅ | `Create, monitor, and terminate interactive session` |
| Batch session auto-completion | ✅ | `Batch session completes automatically` |
| View container logs | ✅ | `View session container logs` |
| Monitor resource usage | ✅ | `Monitor session resource usage` |
| Status transitions | ✅ | `Session status transitions are correct` |
| Bulk terminate disabled for terminated | ✅ | `Cannot select terminated sessions for bulk operations` |
| Sensitive env vars cleared on reload | ✅ | `Sensitive environment variables are cleared` |
| Session type filtering (interactive/batch/inference) | ❌ | - |
| Running/Finished status toggle | ❌ | - |
| Property filtering (name, resource group, agent) | ❌ | - |
| Session table sorting | ❌ | - |
| Pagination | ❌ | - |
| Batch terminate → TerminateSessionModal | ❌ | - |
| Session name click → SessionDetailDrawer | ❌ | - |
| Scheduling history modal → SessionSchedulingHistoryModal | ✅ | `Admin can see the scheduling history button` + 18 more tests |
| Resource policy warnings | 🚧 | Skipped: `superadmin to modify keypair resource policy` |

**Coverage: 🔶 12/20 features**

---

### 5. Session Launcher (`/session/start`)

**Test files:** Covered indirectly via [`e2e/session/session-creation.spec.ts`](session/session-creation.spec.ts)

**Steps:** 1.Session Type → 2.Environments & Resource → 3.Data & Storage → 4.Network → 5.Confirm
**Modals:** `SessionTemplateModal` (recent history)

| Feature | Status | Test |
|---------|--------|------|
| Basic session creation | ✅ | Via session creation tests |
| Multi-step form navigation (5 steps) | ❌ | - |
| Environment/image selection | 🔶 | Partial (used in creation tests) |
| Resource allocation (CPU/memory/GPU) | ❌ | - |
| Resource presets | ❌ | - |
| HPC optimization settings | ❌ | - |
| VFolder mounting (Step 3) | ❌ | - |
| Port configuration (Step 4) | ❌ | - |
| Batch schedule/timeout options | ❌ | - |
| Session owner selection (admin) | ❌ | - |
| Form validation errors | ❌ | - |
| Session history → SessionTemplateModal | ❌ | - |

**Coverage: 🔶 1/12 features (most only indirectly tested)**

---

### 6. Serving / Model Service (`/serving`)

**Test files:** None (visual regression only: [`e2e/visual_regression/serving/serving_page.test.ts`](visual_regression/serving/serving_page.test.ts))

**Filter:** Active | Destroyed (radio)
**Primary action:** "Start Service" → navigates to `/service/start`
**Table link:** Endpoint name → navigates to `/serving/:serviceId`
**Row actions:** Edit → `/service/update/:endpointId`, Delete → confirm modal

| Feature | Status | Test |
|---------|--------|------|
| Endpoint list rendering | ❌ | - |
| "Start Service" → navigate to `/service/start` | ❌ | - |
| Endpoint name click → EndpointDetailPage | ❌ | - |
| Status filtering (Active/Destroyed) | ❌ | - |
| Property filtering | ❌ | - |
| Edit endpoint → navigate to `/service/update/:endpointId` | ❌ | - |
| Delete endpoint → confirm dialog | ❌ | - |

**Coverage: ❌ 0/7 features**

---

### 7. Endpoint Detail (`/serving/:serviceId`)

**Test files:** None

**Cards:** ServiceInfo, AutoScalingRules, GeneratedTokens, Routes
**Modals:** `AutoScalingRuleEditorModal`, `EndpointTokenGenerationModal`, `BAIJSONViewerModal`, `SessionDetailDrawer`, `InferenceSessionErrorModal`

| Feature | Status | Test |
|---------|--------|------|
| Service info display | ❌ | - |
| Edit button → navigate to `/service/update/:endpointId` | ❌ | - |
| "Add Rules" → AutoScalingRuleEditorModal (create) | ❌ | - |
| Edit scaling rule → AutoScalingRuleEditorModal (edit) | ❌ | - |
| Delete scaling rule → Popconfirm | ❌ | - |
| "Generate Token" → EndpointTokenGenerationModal | ❌ | - |
| Token list display | ❌ | - |
| Routes table display | ❌ | - |
| Route error → BAIJSONViewerModal | ❌ | - |
| Route session ID click → SessionDetailDrawer | ❌ | - |
| Session error → InferenceSessionErrorModal | ❌ | - |
| "Sync Routes" action | ❌ | - |
| "Clear Errors" action | ❌ | - |
| Chat test link | ❌ | - |

**Coverage: ❌ 0/14 features**

---

### 8. Service Launcher (`/service/start`, `/service/update/:endpointId`)

**Test files:** None

| Feature | Status | Test |
|---------|--------|------|
| Create model service | ❌ | - |
| Update existing service | ❌ | - |
| Resource configuration | ❌ | - |
| Model folder selection | ❌ | - |
| Form validation | ❌ | - |

**Coverage: ❌ 0/5 features**

---

### 9. Data / VFolder (`/data`)

**Test files:** [`e2e/vfolder/vfolder-crud.spec.ts`](vfolder/vfolder-crud.spec.ts), [`e2e/vfolder/vfolder-explorer-modal.spec.ts`](vfolder/vfolder-explorer-modal.spec.ts), [`e2e/vfolder/vfolder-consecutive-deletion.spec.ts`](vfolder/vfolder-consecutive-deletion.spec.ts), [`e2e/vfolder/file-upload.spec.ts`](vfolder/file-upload.spec.ts), [`e2e/vfolder/file-upload-dnd.spec.ts`](vfolder/file-upload-dnd.spec.ts), [`e2e/vfolder/file-upload-duplicate.spec.ts`](vfolder/file-upload-duplicate.spec.ts), [`e2e/vfolder/file-upload-permissions.spec.ts`](vfolder/file-upload-permissions.spec.ts), [`e2e/vfolder/file-upload-subdirectory.spec.ts`](vfolder/file-upload-subdirectory.spec.ts), [`e2e/vfolder/file-create.spec.ts`](vfolder/file-create.spec.ts)

**Tabs:** Active | Deleted
**Filter (Active tab):** all | general | pipeline | automount | model
**Primary action:** "Create Folder" → `FolderCreateModal`
**Table link:** Folder name → Folder Explorer
**Bulk actions (Active):** Move to Trash → `DeleteVFolderModal`
**Bulk actions (Deleted):** Restore → `RestoreVFolderModal`
**Row actions:** Share → `InviteFolderSettingModal`, Permission info → `SharedFolderPermissionInfoModal`

| Feature | Status | Test |
|---------|--------|------|
| Create folder (default) → FolderCreateModal | ✅ | `User can create default vFolder` |
| Create folder (specific location) → FolderCreateModal | ✅ | `User can create a vFolder by selecting a specific location` |
| Create model folder → FolderCreateModal | ✅ | `User can create Model vFolder` |
| Create cloneable model folder | ✅ | `User can create cloneable Model vFolder` |
| Create R/W folder | ✅ | `User can create Read & Write vFolder` |
| Create R/O folder | ✅ | `User can create Read Only vFolder` |
| Create auto-mount folder | ✅ | `User can create Auto Mount vFolder` |
| Delete / trash / restore / purge | ✅ | `User can create, delete(move to trash), restore, delete forever` |
| Consecutive deletion | ✅ | `User can create and permanently delete multiple VFolders` |
| Share folder → InviteFolderSettingModal | ✅ | `User can share vFolder` |
| File upload (button) | ✅ | `User can upload a single/multiple files via Upload button` |
| File upload (drag & drop) | ✅ | `User can upload a file via drag and drop` |
| File upload (duplicate handling) | ✅ | `User sees duplicate confirmation` / `User can cancel duplicate` |
| File upload (permissions) | ✅ | `User cannot upload files to read-only VFolder` |
| File upload (subdirectory) | ✅ | `User can upload a file to a subdirectory` |
| Explorer modal (CRUD) | ✅ | `User can create folders and upload files` |
| Explorer modal (read-only) | ✅ | `User can view files but cannot upload to read-only` |
| Explorer modal (error handling) | ✅ | `User sees error message when accessing non-existent` |
| Explorer modal (open/close) | ✅ | `User can open and close VFolder explorer modal` |
| Explorer modal (file browser) | ✅ | `User can access File Browser from VFolder explorer` |
| Explorer modal (details view) | ✅ | `User can view VFolder details in the explorer` |
| File creation (Create File button) | ✅ | `User can see Create File button in file explorer` |
| File creation (new file) | ✅ | `User can create a new file in the file explorer` |
| File creation (yaml config) | ✅ | `User can create a yaml configuration file` |
| File creation (empty name validation) | ✅ | `User cannot create a file with empty name` |
| File creation (invalid chars validation) | ✅ | `User cannot create a file with invalid characters in name` |
| File creation (read-only disabled) | 🚧 | Skipped: `User cannot create files in read-only VFolder` |
| Active/Deleted tab switching | ❌ | - |
| Usage mode filtering (general/pipeline/automount/model) | ❌ | - |
| Property filtering (name, status, location) | ❌ | - |
| Folder table sorting | ❌ | - |
| Pagination | ❌ | - |
| Storage status / quota display | ❌ | - |
| Bulk trash → DeleteVFolderModal | ❌ | - |
| Bulk restore → RestoreVFolderModal | ❌ | - |
| Invitation notifications | ❌ | - |
| Shared folder permission → SharedFolderPermissionInfoModal | ❌ | - |
| File download | ❌ | - |
| File/folder rename | ❌ | - |
| File/folder delete within explorer | ❌ | - |

**Coverage: 🔶 25/38 features (includes 1 skipped)**

---

### 10. Model Store (`/model-store`)

**Test files:** None

**Modal:** `ModelCardModal` (card click)

| Feature | Status | Test |
|---------|--------|------|
| Model card list rendering | ❌ | - |
| Search by title/description | ❌ | - |
| Category filtering | ❌ | - |
| Task filtering | ❌ | - |
| Label filtering | ❌ | - |
| Model card click → ModelCardModal | ❌ | - |

**Coverage: ❌ 0/6 features**

---

### 11. Storage Host Settings (`/storage-settings/:hostname`)

**Test files:** None

| Feature | Status | Test |
|---------|--------|------|
| Storage host details | ❌ | - |
| Resource panel | ❌ | - |
| Quota settings | ❌ | - |

**Coverage: ❌ 0/3 features**

---

### 12. My Environment (`/my-environment`)

**Test files:** [`e2e/my-environment/my-environment.spec.ts`](my-environment/my-environment.spec.ts)

| Feature | Status | Test |
|---------|--------|------|
| Custom image list | ✅ | `User can see custom image list with expected columns` |
| Image management | ✅ | `User can search custom images` |

**Coverage: ✅ 2/2 features**

---

### 13. Environment / Images (`/environment`)

**Test files:** [`e2e/environment/environment.spec.ts`](environment/environment.spec.ts), [`e2e/environment/registry.spec.ts`](environment/registry.spec.ts)

**Tabs:** Images | Resource Presets | Container Registries (superadmin)

#### Images Tab
**Row actions:** `ImageInstallModal`, `ManageAppsModal`, `ManageImageResourceLimitModal`
**Filter:** `BAIPropertyFilter` (Name, Architecture, Status, Type, Registry)

| Feature | Status | Test |
|---------|--------|------|
| Image list rendering | ✅ | `Rendering Image List` |
| Image resource limit → ManageImageResourceLimitModal | ✅ | `user can modify image resource limit` |
| Image app management → ManageAppsModal | ✅ | `user can manage apps` |
| Image installation → ImageInstallModal | 🚧 | Skipped: `user can install image` |
| BAIPropertyFilter UI rendering | ✅ | `Admin can see the BAIPropertyFilter on the Images tab` |
| Filter by name (free text) | ✅ | `Admin can filter images by name using a text value` |
| Filter by architecture (strict selection) | ✅ | `Admin can filter images by architecture using strict selection` |
| Filter by status (strict selection) | ✅ | `Admin can filter images by status using strict selection` |
| Filter by type (strict selection) | ✅ | `Admin can filter images by type using strict selection` |
| Filter by registry (free text) | ✅ | `Admin can filter images by registry using a text value` |
| Multiple filters with reset-all | ✅ | `Admin can apply multiple filters simultaneously and see reset-all button` |
| Clear single filter tag | ✅ | `Admin can clear a single filter tag by clicking its close button` |
| Clear all filters (reset-all button) | ✅ | `Admin can clear all filters at once using the reset-all button` |
| Pagination reset on filter | ✅ | `Admin sees pagination reset to page 1 when a filter is applied on page 2` |
| Strict selection rejects freeform | ✅ | `Admin cannot add a filter for architecture with an invalid freeform value` |
| Empty state for non-matching filter | ✅ | `Admin sees empty state when filtering by a non-existent image name` |
| Table column settings → TableColumnsSettingModal | ❌ | - |

#### Resource Presets Tab
**Primary action:** "+" → `ResourcePresetSettingModal`
**Row actions:** Edit → `ResourcePresetSettingModal`, Delete → Popconfirm

| Feature | Status | Test |
|---------|--------|------|
| Preset list rendering | ❌ | - |
| Create preset → ResourcePresetSettingModal | ❌ | - |
| Edit preset → ResourcePresetSettingModal | ❌ | - |
| Delete preset → Popconfirm | ❌ | - |

#### Container Registries Tab (superadmin)
**Primary action:** "+" → `ContainerRegistryEditorModal`
**Row actions:** Edit → `ContainerRegistryEditorModal`, Delete → Popconfirm

| Feature | Status | Test |
|---------|--------|------|
| Registry list rendering | ✅ | `Admin can see the registry table with all expected columns` |
| Create registry → ContainerRegistryEditorModal | ✅ | `Admin can add a new registry with required fields only` |
| Edit registry → ContainerRegistryEditorModal | ✅ | `Admin can edit the registry URL and project name` |
| Delete registry → Popconfirm | ✅ | `Admin can delete the registry with correct name confirmation` |

**Coverage: 🔶 18/24 features**

---

### 14. Configurations (`/settings`)

**Test files:** [`e2e/config/config.spec.ts`](config/config.spec.ts), [`e2e/config/page-access-control.spec.ts`](config/page-access-control.spec.ts)

**Modals:** `OverlayNetworkSettingModal`, `SchedulerSettingModal`

| Feature | Status | Test |
|---------|--------|------|
| Block list menu hiding | ✅ | `block list` |
| Inactive list menu disabling | ✅ | `inactiveList` |
| 404 for blocked pages | ✅ | `404 page when accessing blocklisted pages` |
| 401 for unauthorized pages | ✅ | `Regular user sees 401 page` |
| Root redirect with blocklist | ✅ | `redirected to first available page` |
| Combined blocklist + inactiveList | ✅ | `correct behavior when both configured` |
| Config clear restore behavior | ✅ | `Configuration can be cleared to restore` |
| showNonInstalledImages setting | ✅ | `showNonInstalledImages` |
| Overlay network setting → OverlayNetworkSettingModal | ❌ | - |
| Scheduler setting → SchedulerSettingModal | ❌ | - |

**Coverage: 🔶 8/10 features**

---

### 15. Resources (`/agent-summary`, `/agent`)

**Test files:** [`e2e/agent/agent.spec.ts`](agent/agent.spec.ts), `e2e/agent-summary/agent-summary.spec.ts`

**Tabs:** Agents | Storage Proxies | Resource Groups

#### Agent Summary (`/agent-summary`)

| Feature | Status | Test |
|---------|--------|------|
| Agent Summary list with columns | ✅ | `Admin can see Agent Summary page with expected columns` |
| Connected/Terminated filter switching | ✅ | `Admin can switch between Connected and Terminated agents` |

#### Agents Tab
**Table link:** Agent name → `AgentDetailDrawer`

| Feature | Status | Test |
|---------|--------|------|
| Agent list with connected agents | ✅ | `should have at least one connected agent` |
| Agent name click → AgentDetailDrawer | ❌ | - |

#### Storage Proxies Tab

| Feature | Status | Test |
|---------|--------|------|
| Storage proxy list rendering | ❌ | - |

#### Resource Groups Tab
**Primary action:** "+" → `ResourceGroupSettingModal`
**Table link:** Name → `ResourceGroupInfoModal`
**Row actions:** Edit → `ResourceGroupSettingModal`, Delete → Popconfirm

| Feature | Status | Test |
|---------|--------|------|
| Resource group list rendering | ❌ | - |
| Create resource group → ResourceGroupSettingModal | ❌ | - |
| Resource group name click → ResourceGroupInfoModal | ❌ | - |
| Edit resource group → ResourceGroupSettingModal | ❌ | - |
| Delete resource group → Popconfirm | ❌ | - |

**Coverage: 🔶 3/8 features**

---

### 16. Resource Policy (`/resource-policy`)

**Test files:** `e2e/resource-policy/resource-policy.spec.ts`

**Tabs:** Keypair Policies | User Policies | Project Policies

#### Keypair Policies Tab
**Primary action:** "+" → `KeypairResourcePolicySettingModal`
**Table link:** Info icon → `KeypairResourcePolicyInfoModal`
**Row actions:** Edit → `KeypairResourcePolicySettingModal`, Delete → mutation

| Feature | Status | Test |
|---------|--------|------|
| Keypair policy list rendering | ✅ | `Admin can see Keypair policy list with expected columns` |
| Create keypair policy → KeypairResourcePolicySettingModal | ✅ | `Admin can create a Keypair policy` |
| View keypair policy → KeypairResourcePolicyInfoModal | ❌ | - |
| Edit keypair policy → KeypairResourcePolicySettingModal | ✅ | `Admin can edit a Keypair policy` |
| Delete keypair policy | ✅ | `Admin can delete a Keypair policy` |

#### User Policies Tab
**Primary action:** "+" → `UserResourcePolicySettingModal`
**Row actions:** Edit → `UserResourcePolicySettingModal`, Delete → Popconfirm

| Feature | Status | Test |
|---------|--------|------|
| User policy list rendering | ✅ | `Admin can see User policy list` |
| Create user policy → UserResourcePolicySettingModal | ✅ | `Admin can create a User policy` |
| Edit user policy → UserResourcePolicySettingModal | ❌ | - |
| Delete user policy → Popconfirm | ✅ | `Admin can delete a User policy` |

#### Project Policies Tab
**Primary action:** "+" → `ProjectResourcePolicySettingModal`
**Row actions:** Edit → `ProjectResourcePolicySettingModal`, Delete → Popconfirm

| Feature | Status | Test |
|---------|--------|------|
| Project policy list rendering | ✅ | `Admin can see Project policy list` |
| Create project policy → ProjectResourcePolicySettingModal | ✅ | `Admin can create a Project policy` |
| Edit project policy → ProjectResourcePolicySettingModal | ❌ | - |
| Delete project policy → Popconfirm | ✅ | `Admin can delete a Project policy` |

**Coverage: 🔶 10/13 features**

---

### 17. User Credentials (`/credential`)

**Test files:** [`e2e/user/user-crud.spec.ts`](user/user-crud.spec.ts)

**Tabs:** Users | Credentials

#### Users Tab
**Primary action:** "+" → `UserSettingModal`
**Table link:** User name → `UserInfoModal`
**Row actions:** Edit → `UserSettingModal`, Delete → Popconfirm
**Bulk actions:** Bulk edit → `UpdateUsersModal`, Bulk delete → `PurgeUsersModal`

| Feature | Status | Test |
|---------|--------|------|
| Create user → UserSettingModal | ✅ | `Admin can create a new user` |
| Update user → UserSettingModal | ✅ | `Admin can update user information` |
| Deactivate user | ✅ | `Admin can deactivate a user` |
| Reactivate user | ✅ | `Admin can reactivate an inactive user` |
| Purge user → PurgeUsersModal | ✅ | `Admin can deactivate and permanently delete` |
| Deleted user login blocked | ✅ | `Deleted user cannot log in` |
| User name click → UserInfoModal | ❌ | - |
| Bulk edit → UpdateUsersModal | ❌ | - |
| User table filtering | ❌ | - |
| User table sorting | ❌ | - |

#### Credentials Tab
**Primary action:** "+" → `KeypairSettingModal`
**Table link:** Keypair name → `KeypairInfoModal`
**Row actions:** Edit → `KeypairSettingModal`, SSH → `SSHKeypairManagementModal`, Delete → Popconfirm

| Feature | Status | Test |
|---------|--------|------|
| Keypair list rendering | ✅ | `Admin can see Credential list with expected columns` |
| Create keypair → KeypairSettingModal | ❌ | - |
| Keypair name click → KeypairInfoModal | ✅ | `Admin can view Keypair info modal` |
| Edit keypair → KeypairSettingModal | ❌ | - |
| SSH key management → SSHKeypairManagementModal | ❌ | - |
| Delete keypair → Popconfirm | ❌ | - |
| Active/Inactive filter | ✅ | `Admin can see Active/Inactive radio filter` |

**Coverage: 🔶 9/16 features**

---

### 18. Maintenance (`/maintenance`)

**Test files:** [`e2e/maintenance/maintenance.spec.ts`](maintenance/maintenance.spec.ts)

| Feature | Status | Test |
|---------|--------|------|
| Recalculate usage | ✅ | `click the Recalculate Usage button` |
| Rescan images | ✅ | `click the Rescan Images button` |
| Other maintenance actions | ❌ | - |

**Coverage: 🔶 2/3 features**

---

### 19. User Settings (`/usersettings`)

**Test files:** None

**Tabs:** General | Logs

#### General Tab
**Modals:** `MyKeypairInfoModal`, `SSHKeypairManagementModal`, `ShellScriptEditModal`

| Feature | Status | Test |
|---------|--------|------|
| Language selection | ❌ | - |
| Desktop notifications toggle | ❌ | - |
| Compact sidebar toggle | ❌ | - |
| Auto-logout configuration | ❌ | - |
| SSH keypair info → MyKeypairInfoModal | ❌ | - |
| SSH keypair management → SSHKeypairManagementModal | ❌ | - |
| Bootstrap script → ShellScriptEditModal | ❌ | - |
| User config script → ShellScriptEditModal | ❌ | - |
| Experimental features toggle | ❌ | - |

#### Logs Tab

| Feature | Status | Test |
|---------|--------|------|
| Error log viewing | ❌ | - |

**Coverage: ❌ 0/10 features**

---

### 20. Project (`/project`)

**Test files:** `e2e/project/project-crud.spec.ts`

**Primary action:** "Create Project" → `BAIProjectSettingModal`
**Table link:** Project name → `BAIProjectSettingModal` (edit mode)
**Bulk action:** "Bulk Edit" → `BAIProjectBulkEditModal`

| Feature | Status | Test |
|---------|--------|------|
| Project list rendering | ✅ | `Admin can see project list with expected columns` |
| Create project → BAIProjectSettingModal | ✅ | `Admin can create a new project` |
| Project name click → BAIProjectSettingModal (edit) | ✅ | `Admin can edit a project name` |
| Project filtering | ✅ | `Admin can filter projects by name` |
| Bulk edit → BAIProjectBulkEditModal | ❌ | - |
| Delete project | ✅ | `Admin can delete a project` |

**Coverage: 🔶 5/6 features**

---

### 21. Statistics (`/statistics`)

**Test files:** `e2e/statistics/statistics.spec.ts`

**Tabs:** Usage History | User Session History (conditional)

| Feature | Status | Test |
|---------|--------|------|
| Allocation history tab | ✅ | `Admin can see Statistics page with Allocation History tab` |
| User session history tab | ✅ | `Admin can switch to User Session History tab` |

**Coverage: ✅ 2/2 features**

---

### 22. Scheduler (`/scheduler`)

**Test files:** None

**Primary action:** Refresh (auto-update 7s)
**Resource group selector:** `SharedResourceGroupSelectForCurrentProject`
**Table link:** Session name → `SessionDetailAndContainerLogOpenerLegacy` drawer

| Feature | Status | Test |
|---------|--------|------|
| Pending session list rendering | ❌ | - |
| Resource group filtering | ❌ | - |
| Session name click → SessionDetail drawer | ❌ | - |
| Auto-refresh (7s interval) | ❌ | - |
| Pagination and page size | ❌ | - |
| Column visibility settings | ❌ | - |

**Coverage: ❌ 0/6 features**

---

### 23. Reservoir (`/reservoir`, `/reservoir/:artifactId`)

**Test files:** None

**Mode toggle:** Active (ALIVE) | Inactive (DELETED)
**Primary action:** "Pull from HuggingFace" → `ScanArtifactModelsFromHuggingFaceModal`
**Filter:** `BAIGraphQLPropertyFilter` (name, source, registry, type)
**Row actions:** Pull → `BAIImportArtifactModal`, Delete → `BAIDeactivateArtifactsModal`, Restore → `BAIActivateArtifactsModal`
**Bulk actions:** Deactivate / Activate

#### Main Page (`/reservoir`)

| Feature | Status | Test |
|---------|--------|------|
| Artifact list rendering | ❌ | - |
| Mode toggle (Active/Inactive) | ❌ | - |
| Artifact filtering (name, source, registry, type) | ❌ | - |
| Pull from HuggingFace → ScanArtifactModelsFromHuggingFaceModal | ❌ | - |
| Row action: Pull → BAIImportArtifactModal | ❌ | - |
| Row action: Delete → BAIDeactivateArtifactsModal | ❌ | - |
| Row action: Restore → BAIActivateArtifactsModal | ❌ | - |
| Bulk deactivate/activate | ❌ | - |
| Pagination and page size | ❌ | - |

#### Detail Page (`/reservoir/:artifactId`)

**Primary action:** "Pull Latest Version"
**Filter:** `BAIGraphQLPropertyFilter` (status, version, size)
**Row actions:** Pull → `BAIImportArtifactModal`, Import to Folder → `ImportArtifactRevisionToFolderModal`, Delete → `BAIDeleteArtifactRevisionsModal`
**Bulk actions:** Pull selected, Import to folder, Delete selected

| Feature | Status | Test |
|---------|--------|------|
| Artifact info display | ❌ | - |
| Revision list rendering | ❌ | - |
| Revision filtering (status, version, size) | ❌ | - |
| Pull latest version | ❌ | - |
| Row action: Pull revision → BAIImportArtifactModal | ❌ | - |
| Row action: Import to folder → ImportArtifactRevisionToFolderModal | ❌ | - |
| Row action: Delete revision → BAIDeleteArtifactRevisionsModal | ❌ | - |
| Bulk pull/import/delete selected revisions | ❌ | - |
| Pulling status alert with progress | ❌ | - |

**Coverage: ❌ 0/18 features**

---

### 24. Branding (`/branding`)

**Test files:** None

**Primary actions:** "Preview" (opens new window), "JSON Config" → `ThemeJsonConfigModal`, "Reset All"
**Modals:** `ThemeJsonConfigModal`

#### Theme Customization

| Feature | Status | Test |
|---------|--------|------|
| Primary color picker | ❌ | - |
| Header background color picker | ❌ | - |
| Link / Info / Error / Success / Text color pickers | ❌ | - |
| Individual color reset buttons | ❌ | - |

#### Logo Customization

| Feature | Status | Test |
|---------|--------|------|
| Wide logo size configuration | ❌ | - |
| Collapsed logo size configuration | ❌ | - |
| Light/Dark mode logo upload & preview | ❌ | - |
| Light/Dark collapsed logo upload & preview | ❌ | - |
| Individual logo reset buttons | ❌ | - |

#### General

| Feature | Status | Test |
|---------|--------|------|
| Preview in new window | ❌ | - |
| JSON config editing → ThemeJsonConfigModal | ❌ | - |
| Reset all to defaults | ❌ | - |
| Search/filter settings | ❌ | - |
| Setting persistence across reload | ❌ | - |

**Coverage: ❌ 0/14 features**

---

### 25. App Launcher (modal from Session page)

**Test files:** [`e2e/app-launcher/app-launcher-basic.spec.ts`](app-launcher/app-launcher-basic.spec.ts), [`e2e/app-launcher/app-launcher-launch.spec.ts`](app-launcher/app-launcher-launch.spec.ts)

**Sub-modals:** `SFTPConnectionInfoModal`, `VNCConnectionInfoModal`, `XRDPConnectionInfoModal`, `VSCodeDesktopConnectionModal`, `TensorboardPathModal`, `AppLaunchConfirmationModal`, `TCPConnectionInfoModal`

| Feature | Status | Test |
|---------|--------|------|
| Open modal from session actions | ✅ | `User can open app launcher modal` |
| Apps grouped by category | ✅ | `User sees apps grouped by category` |
| App icons and titles correct | ✅ | `User sees correct app icons and titles` |
| Close modal | ✅ | `User can close app launcher modal` |
| Launch Terminal (ttyd) | ✅ | `User can launch Console app` |
| Launch Jupyter Notebook | ✅ | `User can launch Jupyter Notebook app` |
| Launch JupyterLab | ✅ | `User can launch JupyterLab app` |
| Launch VS Code (web) | ✅ | `User can launch Visual Studio Code app` |
| SSH/SFTP → SFTPConnectionInfoModal | ✅ | `User sees SFTP connection info modal` |
| VS Code Desktop → VSCodeDesktopConnectionModal | ✅ | `User sees VS Code Desktop connection modal` |
| VNC → VNCConnectionInfoModal | ❌ | - |
| XRDP → XRDPConnectionInfoModal | ❌ | - |
| Tensorboard → TensorboardPathModal | ❌ | - |
| NNI Board / MLflow UI → AppLaunchConfirmationModal | ❌ | - |
| Generic TCP apps → TCPConnectionInfoModal | ❌ | - |
| Pre-open port apps launch | ❌ | - |
| "Open to Public" option with client IPs | ❌ | - |
| "Preferred Port" option | ❌ | - |

**Coverage: 🔶 10/18 features**

---

### 26. Chat (`/chat/:id?`)

**Test files:** None

**Drawer:** `ChatHistoryDrawer`

| Feature | Status | Test |
|---------|--------|------|
| Chat card interface | ❌ | - |
| Chat history → ChatHistoryDrawer | ❌ | - |
| New chat creation | ❌ | - |
| Message sending/receiving | ❌ | - |
| Provider/model selection | ❌ | - |
| Chat history deletion | ❌ | - |

**Coverage: ❌ 0/6 features**

---

### 27. Plugin System (config-based)

**Test files:** [`e2e/plugin/plugin-system.spec.ts`](plugin/plugin-system.spec.ts)

**Plugin fixtures:** `test-plugin.js`, `admin-test-plugin.js`, `plugin-a.js`, `plugin-b.js`

| Feature | Status | Test |
|---------|--------|------|
| Admin sees user-permission plugin in sidebar | ✅ | `Admin can see user-permission plugin menu item in sidebar` |
| User sees user-permission plugin in sidebar | ✅ | `User can see user-permission plugin menu item in sidebar` |
| Admin sees admin-permission plugin in Admin Settings | ✅ | `Admin can see admin-permission plugin in Admin Settings panel` |
| No plugin menu without config | ✅ | `Admin cannot see extra plugin menu when plugin.page is not set` |
| No plugin menu when JS returns 404 | ✅ | `Admin cannot see plugin menu when plugin JS file returns 404` |
| Plugin menu click opens new tab | ✅ | `Admin can open external link plugin in new tab` |
| User cannot see admin-permission plugin | ✅ | `User cannot see admin-permission plugin menu item` |
| Blocklisted plugin is hidden | ✅ | `Admin cannot see plugin that is in the blocklist` |
| Non-blocklisted plugin visible alongside blocklist | ✅ | `Admin can see plugin that is not in the blocklist while blocked item is hidden` |
| Multiple plugins visible simultaneously | ✅ | `Admin can see multiple plugin menu items when multiple plugins are configured` |
| Valid plugin visible when sibling fails to load | ✅ | `Admin can see valid plugin when one of multiple plugins fails to load` |
| Plugin state persists after page reload | ✅ | `Admin can see plugin menu item after page reload` |

**Coverage: ✅ 12/12 features**

---

## Visual Regression Tests

Visual regression tests exist for most pages but only capture screenshots, not functional behavior.

| Page | Visual Test |
|------|------------|
| Login | ✅ |
| Start | ✅ |
| Summary/Dashboard | ✅ |
| Session | ✅ |
| Serving | ✅ |
| VFolder/Data | ✅ |
| Environments | ✅ |
| My Environments | ✅ |
| Resources | ✅ |
| Resource Policy | ✅ |
| Users/Credentials | ✅ |
| Configurations | ✅ |
| Maintenance | ✅ |
| Information | ✅ |
| AI Agents | ✅ |
| Import | ✅ |
| Dashboard | ✅ |

---

## Priority Recommendations for New E2E Tests

### Priority 1: Critical - High User Impact, High Risk

These are core user workflows that affect the largest number of users.

| # | Page/Feature | Reason | Estimated Complexity |
|---|-------------|--------|---------------------|
| 1 | **Serving - Create & Manage Model Service** (`/serving`, `/service/start`) | Core revenue feature. Zero coverage. Complete CRUD lifecycle needed. | High |
| 2 | **Session Launcher - Advanced Options** (`/session/start`) | Resource allocation, VFolder mounting, and form validation are critical for correct session behavior. | Medium |
| 3 | **Dashboard - Key Metrics** (`/dashboard`) | Landing page for most users. Session counts and resource usage display should be verified. | Low |
| 4 | **Start Page - Quick Actions** (`/start`) | Primary entry point. Quick actions should correctly navigate to session launcher/service creator. | Low |

### Priority 2: Important - Admin Features, Data Integrity

| # | Page/Feature | Reason | Estimated Complexity |
|---|-------------|--------|---------------------|
| 5 | **Resource Policy CRUD** (`/resource-policy`) | 3 tabs with 13 features. Affects resource allocation for all users. Misconfiguration can block sessions. | Medium |
| 6 | **Project CRUD** (`/project`) | Multi-tenancy management. Projects control user access and resource isolation. Includes bulk edit. | Medium |
| 7 | **User Settings Persistence** (`/usersettings`) | 2 tabs, 4 modals. Language, auto-logout, SSH keys, shell scripts must persist correctly. | Low |
| 8 | **VFolder - Filtering, Sorting, Bulk ops** (`/data`) | Data page has good CRUD but table interactions and bulk modals (DeleteVFolderModal, RestoreVFolderModal) untested. | Low |
| 9 | **Credential - Keypairs Tab** (`/credential`) | API access keys (6 uncovered features). Security-critical. Only Users tab is tested. | Medium |
| 10 | **Reservoir - Artifact Management** (`/reservoir`) | 18 features across main and detail pages. HuggingFace import, revision management, bulk operations. | High |

### Priority 3: Nice to Have - Edge Cases, Admin Tools

| # | Page/Feature | Reason | Estimated Complexity |
|---|-------------|--------|---------------------|
| 11 | **Endpoint Detail - Auto-scaling & Tokens** (`/serving/:serviceId`) | 14 features with 5 modals. Complex admin feature, but lower user count. | High |
| 12 | **Session - Filtering, Drawer** (`/session`) | Session list already has creation/lifecycle coverage. SessionDetailDrawer is significant. | Low |
| 13 | **Environment - Presets & Registries** (`/environment`) | 8 uncovered features across 2 tabs. Each with CRUD modals. | Medium |
| 14 | **Resources - Resource Groups** (`/agent`) | 5 uncovered features with 3 modals (create/edit/info). Agent drawer also untested. | Medium |
| 15 | **Model Store** (`/model-store`) | Browse/search models. ModelCardModal for detail. Read-only interface. | Low |
| 16 | **Scheduler** (`/scheduler`) | 6 features. Pending session queue monitoring. Admin tool. | Low |
| 17 | **Branding** (`/branding`) | 14 features. Theme/logo customization. Admin tool. | Medium |
| 18 | **Statistics** (`/statistics`) | Read-only analytics. Low risk of breakage. | Low |
| 19 | **Storage Host Settings** (`/storage-settings/:hostname`) | Niche admin feature. | Low |
| 20 | **Chat** (`/chat/:id?`) | Experimental feature. Depends on external LLM endpoints. ChatHistoryDrawer. | High |

---

## Test Infrastructure

### Existing Page Object Models

| Class | Location | Purpose |
|-------|----------|---------|
| `BasePage` | [`e2e/utils/classes/base/BasePage.ts`](utils/classes/base/BasePage.ts) | Base page class |
| `BaseModal` | [`e2e/utils/classes/base/BaseModal.ts`](utils/classes/base/BaseModal.ts) | Base modal class |
| `StartPage` | [`e2e/utils/classes/common/StartPage.ts`](utils/classes/common/StartPage.ts) | Start page helpers |
| `SessionLauncher` | [`e2e/utils/classes/session/SessionLauncher.ts`](utils/classes/session/SessionLauncher.ts) | Session creation helpers |
| `SessionDetailPage` | [`e2e/utils/classes/session/SessionDetailPage.ts`](utils/classes/session/SessionDetailPage.ts) | Session detail helpers |
| `AppLauncherModal` | [`e2e/utils/classes/session/AppLauncherModal.ts`](utils/classes/session/AppLauncherModal.ts) | App launcher helpers |
| `FolderCreationModal` | [`e2e/utils/classes/vfolder/FolderCreationModal.ts`](utils/classes/vfolder/FolderCreationModal.ts) | Folder creation helpers |
| `FolderExplorerModal` | [`e2e/utils/classes/vfolder/FolderExplorerModal.ts`](utils/classes/vfolder/FolderExplorerModal.ts) | Folder explorer helpers |
| `UserSettingModal` | [`e2e/utils/classes/user/UserSettingModal.ts`](utils/classes/user/UserSettingModal.ts) | User settings helpers |
| `PurgeUsersModal` | [`e2e/utils/classes/user/PurgeUsersModal.ts`](utils/classes/user/PurgeUsersModal.ts) | User deletion helpers |
| `NotificationHandler` | [`e2e/utils/classes/common/NotificationHandler.ts`](utils/classes/common/NotificationHandler.ts) | Notification assertion helpers |

### Shared Utilities

| Utility | Location | Purpose |
|---------|----------|---------|
| `test-util.ts` | [`e2e/utils/test-util.ts`](utils/test-util.ts) | Login, config modification, TOML helpers |
| `test-util-antd.ts` | [`e2e/utils/test-util-antd.ts`](utils/test-util-antd.ts) | Ant Design component interaction helpers |

### Page Object Models Needed

To efficiently build new E2E tests, these POMs should be created:

| POM | For Page | Priority |
|-----|----------|----------|
| `ServingPage` | `/serving` | P1 |
| `ServiceLauncherPage` | `/service/start` | P1 |
| `EndpointDetailPage` | `/serving/:serviceId` | P3 |
| `DashboardPage` | `/dashboard` | P1 |
| `ResourcePolicyPage` | `/resource-policy` | P2 |
| `ProjectPage` | `/project` | P2 |
| `UserSettingsPage` | `/usersettings` | P2 |

---

## Coverage Matrix (Quick Reference)

| Page Route | Functional Tests | Visual Tests | Priority |
|------------|:---:|:---:|:---:|
| `/interactive-login` | 🔶 | ✅ | - |
| `/start` | 🔶 | ✅ | - |
| `/dashboard` | 🔶 | ✅ | - |
| `/session` | ✅ | ✅ | P3 |
| `/session/start` | 🔶 | ✅ | P1 |
| `/serving` | ❌ | ✅ | **P1** |
| `/serving/:serviceId` | ❌ | ❌ | P3 |
| `/service/start` | ❌ | ❌ | **P1** |
| `/service/update/:endpointId` | ❌ | ❌ | P3 |
| `/data` | ✅ | ✅ | P2 |
| `/model-store` | ❌ | ❌ | P3 |
| `/storage-settings/:hostname` | ❌ | ❌ | P3 |
| `/my-environment` | ✅ | ✅ | - |
| `/environment` | 🔶 | ✅ | P3 |
| `/settings` (config) | ✅ | ✅ | - |
| `/agent-summary` | 🔶 | ✅ | P3 |
| `/agent` | 🔶 | ✅ | P3 |
| `/resource-policy` | 🔶 | ✅ | P2 |
| `/credential` | 🔶 | ✅ | P2 |
| `/maintenance` | 🔶 | ✅ | - |
| `/project` | 🔶 | ❌ | P2 |
| `/statistics` | ✅ | ❌ | - |
| `/usersettings` | ❌ | ❌ | **P2** |
| `/scheduler` | ❌ | ❌ | P3 |
| `/reservoir` | ❌ | ❌ | P3 |
| `/branding` | ❌ | ❌ | P3 |
| `/chat/:id?` | ❌ | ❌ | P3 |
| `/information` | 🔶 | ✅ | P3 |
| App Launcher (modal) | 🔶 | ❌ | - |
| Plugin System (config-based) | ✅ | ❌ | - |

---

## How to Update This Report

When adding new E2E tests:

1. Add the test file to the relevant section under "Detailed Coverage by Page"
2. Update the feature table: change `❌` to `✅` and add test name
3. Update the "Coverage Summary" table counts
4. Update the "Coverage Matrix" quick reference
5. Remove completed items from "Priority Recommendations"
6. Update the "Last Updated" date at the top
