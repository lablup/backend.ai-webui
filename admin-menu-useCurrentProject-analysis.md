# Admin Menu Pages — `useCurrentProject` Dependency Analysis

## Pages that **depend on** `useCurrentProject` (4 pages)

| Route | Page | Role | Dependency chain | Hooks used |
|-------|------|------|------------------|------------|
| `/admin-session` | AdminSessionPage | admin | → `PendingSessionNodeList` | `useCurrentResourceGroupValue` |
| `/environment` | EnvironmentPage (Images tab, Resource Presets tab) | admin | → `ImageList` / → `ResourcePresetList` → `ResourcePresetSettingModal` | `useCurrentProjectValue` |
| `/reservoir/:id` | ReservoirArtifactDetailPage | admin | → `ImportArtifactRevisionToFolderModal` | `useCurrentProjectValue`, `useSetCurrentProject` |
| `/admin-dashboard` *(hidden)* | AdminDashboardPage | superadmin | direct + → `TotalResourceWithinResourceGroup` | `useCurrentProjectValue`, `useCurrentResourceGroupValue` |

### Detailed dependency descriptions

#### 1. `/admin-session` — AdminSessionPage

- **Component**: `PendingSessionNodeList`
- **Hook**: `useCurrentResourceGroupValue`
- **How it's used**:
  - `currentResourceGroup` is passed as a query variable to filter pending sessions by resource group.
  - A deferred version (`deferredCurrentResourceGroup`) is used to show a loading state on the `SharedResourceGroupSelectForCurrentProject` dropdown when the resource group changes.
  - The resource group select dropdown in the header allows switching between groups, and the session list re-fetches accordingly.

#### 2. `/environment` — EnvironmentPage

Two sub-components create dependencies:

**a) `ImageList` (Images tab)**
- **Hook**: `useCurrentProjectValue`
- **How it's used**:
  - `currentProject.id` is used to construct the `scopeId` query variable (`project:${currentProject.id}`) for the `ImageListQuery` GraphQL query.
  - This scopes the image list to show only images available within the current project.

**b) `ResourcePresetSettingModal` (via `ResourcePresetList` in Resource Presets tab)**
- **Hook**: `useCurrentProjectValue`
- **How it's used**:
  - `currentProject.name` is used to render a `BAIProjectResourceGroupSelect` component inside the preset creation/edit form.
  - The `scaling_group_name` form field lets the admin assign a resource group to the preset, and the dropdown options are scoped to the current project.

#### 3. `/reservoir/:id` — ReservoirArtifactDetailPage

- **Component**: `ImportArtifactRevisionToFolderModal`
- **Hooks**: `useCurrentProjectValue`, `useSetCurrentProject`
- **How it's used**:
  - `currentProject.id` is compared against the model store project's ID to determine whether to show a "Create Folder" button or a "Switch to Project" button.
  - If the current project differs from the model store project, `setCurrentProject` is called to switch the user's active project to the model store project before creating a vfolder for the artifact import.
  - This is the only admin page that **writes** to the current project state (via `useSetCurrentProject`).

#### 4. `/admin-dashboard` — AdminDashboardPage *(hidden, not in sidebar)*

- **Hooks**: `useCurrentProjectValue`, `useCurrentResourceGroupValue` (direct usage in page component)
- **Also**: `TotalResourceWithinResourceGroup` component uses `useCurrentResourceGroupValue`
- **How it's used**:
  - `currentProject.id` is used to construct the `scopeId` query variable (`project:${currentProject.id}`) for the dashboard GraphQL query.
  - `currentResourceGroup` is used for:
    - The `resourceGroup` query variable to fetch resource statistics.
    - Constructing the `agentNodeFilter` string to filter agents by scaling group (`scaling_group == "${currentResourceGroup}"`).
  - The `TotalResourceWithinResourceGroup` widget also reads `currentResourceGroup` to display total resources within the selected resource group.
  - All dashboard widgets (session counts, agent stats, active agents, recent sessions) are scoped to the current project and resource group.

---

## Pages that **do not depend on** `useCurrentProject` (11 pages)

| Route | Page | Role |
|-------|------|------|
| `/credential` | UserCredentialsPage (Users / Credentials tabs) | admin |
| `/scheduler` | SchedulerPage (Fair Share Setting) | admin |
| `/resource-policy` | ResourcePolicyPage (Keypair / User / Project tabs) | admin |
| `/reservoir` | ReservoirPage (list page) | admin |
| `/agent` | ResourcesPage (Agents / Storage Proxies / Resource Groups tabs) | superadmin |
| `/storage-settings/:hostname` | StorageHostSettingPage (sub-page) | superadmin |
| `/project` | ProjectPage | superadmin |
| `/settings` | ConfigurationsPage | superadmin |
| `/maintenance` | MaintenancePage | superadmin |
| `/diagnostics` | DiagnosticsPage | superadmin |
| `/branding` | BrandingPage | superadmin |
| `/information` | Information | superadmin |

---

## Summary

- **Most admin pages (11/15) do not depend on `useCurrentProject`.**
- The 4 dependent pages use it for:
  - **Scoping queries** to the current project/resource group (admin-session, environment, admin-dashboard)
  - **Form field options** scoped to current project (environment — resource preset modal)
  - **Project switching** for cross-project operations (reservoir artifact detail)
- Only `ImportArtifactRevisionToFolderModal` on `/reservoir/:id` **mutates** the current project state; the other 3 pages are read-only consumers.
