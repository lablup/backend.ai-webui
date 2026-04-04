# Session Template Management UI

## Overview

Add a Session Template management UI to the Backend.AI WebUI that allows administrators to view, create, edit, and delete session templates. Session templates are reusable configurations for launching compute sessions with pre-defined images, resources, and settings. They are used by the App Launcher (`/applauncher`) to create sessions on behalf of users (e.g., education portal integrations).

## Background

### What are Session Templates?

Session templates define reusable session configurations including:
- Container image (e.g., `cr.backend.ai/stable/python:3.9-ubuntu20.04`)
- Resource allocation (CPU, memory, GPU)
- Session type (interactive or batch)
- Scaling group, mounts, and environment variables

### Why is this needed?

- Admins currently have no way to manage session templates from the WebUI
- The control panel (`backend.ai-control-panel`) has this feature, but the WebUI does not
- Session templates are required for the `/applauncher` flow (education portal integration)
- Without this UI, admins must use CLI or API directly to manage templates

### Reference Implementation

The control panel has a working implementation:
- `frontend-react/src/components/SessionTemplateList.tsx` - List component
- `frontend-react/src/components/SessionTemplateSettingModal.tsx` - Create/edit modal

## Backend API

Session templates use **REST API only** (no GraphQL types exist). The Backend.AI client SDK provides:

### Endpoints

| Method | Endpoint | Operation |
|--------|----------|-----------|
| GET | `/template/session/` | List all accessible templates |
| GET | `/template/session/{id}` | Get a single template |
| POST | `/template/session/` | Create one or more templates |
| PUT | `/template/session/{id}` | Update a template |
| DELETE | `/template/session/{id}` | Soft-delete a template |

### Client SDK Methods

```typescript
// Available on globalThis.backendaiclient (BackendAIClient)
baiClient.sessionTemplate.list(listAll?: boolean): Promise<SessionTemplate[]>
baiClient.sessionTemplate.get(templateId: string): Promise<SessionTemplate>
baiClient.sessionTemplate.create(template: string, domain?: string, group?: string, ownerAccessKey?: string): Promise<{id: string, user: string}[]>
baiClient.sessionTemplate.put(templateId: string, template: string): Promise<{success: boolean}>
baiClient.sessionTemplate.delete(templateId: string): Promise<{success: boolean}>
```

### Template Data Model

```typescript
interface SessionTemplate {
  id: string;                    // UUID
  name: string | null;           // Template name
  type: 'task' | 'cluster';     // Template type
  is_active: boolean;
  domain_name: string;
  user: string;                  // Owner UUID
  user_email: string | null;
  group: string | null;          // Group UUID
  group_name: string | null;
  is_owner: boolean;
  created_at: string;            // ISO-8601
  template: {
    api_version: string;         // e.g., "6"
    kind: string;                // "task_template"
    metadata: {
      name: string;              // Image name prefix
      tag: string | null;
    };
    spec: {
      session_type: 'interactive' | 'batch';
      kernel: {
        image: string;           // Full container image URI
        architecture?: string;   // Default: "x86_64"
        environ?: Record<string, string>;
        run?: {
          bootstrap?: string;
          startup_command?: string;
        };
      };
      scaling_group?: string;    // Default: "default"
      mounts?: Record<string, any>;
      resources?: {
        cpu?: string;
        mem?: string;            // In bytes
        'cuda.device'?: string;
        'cuda.shares'?: string;
        [key: string]: string | undefined;
      };
      agent_list?: string[] | null;
    };
  };
}
```

## Requirements

### Functional Requirements

#### FR-1: Session Template List Page
- Display session templates in a table (BAITable pattern)
- Columns: Name, ID, Image, Session Type, Resources, Domain, Project, Owner Email, Created At
- Resource display: Use `ResourceNumbersOfSession` component (same as `SessionDetailContent.tsx`) instead of raw tags
- Note: Backend API does NOT support server-side filtering or pagination (`GET /template/session/` returns all templates). Client-side filtering by name may be added if needed.
- Refresh button for manual data refetch
- "Create" button to open creation modal
- Edit/Delete action buttons per row

#### FR-2: Create Session Template Modal
- Form fields:
  - Name (text input, optional)
  - Domain Name (dropdown select, required)
  - Project/Group Name (dropdown, enabled after domain selected, optional)
  - Owner Access Key or User Email (for admin to set owner)
  - Session Type (dropdown: interactive / batch, required)
  - Image (text input or image selector, required)
  - Resources: Resource allocation inputs with units fetched from server (resource slots API)
    - Each resource type has its own unit/step (e.g., CPU: 1 core step, fGPU: 0.1 step, memory: GiB/MiB)
    - Units and steps should NOT be hardcoded — fetch from server resource slot metadata
    - Reference: Session Launcher resource allocation UI for patterns
- Validation: Image is required, at least basic resources should be set
- On submit: Call client SDK to create template

#### FR-3: Edit Session Template Modal
- Same form as Create, pre-populated with existing template data
- Update via PUT endpoint
- Show template ID (read-only)

#### FR-4: Delete Session Template
- Use `BAIConfirmModalWithInput` for deletion confirmation (requires typing template name to confirm)
- Warning: "Deleting a session template is irreversible"
- Call DELETE endpoint on confirmation

#### FR-5: Navigation & Access Control
- Add as a new tab in the existing **Admin Session page** (`/admin-session`)
- Tab key: `session-templates` (URL: `/admin-session?tab=session-templates`)
- The admin session page already uses `nuqs` (`useQueryStates`) for URL-persisted tab state, so tab selection survives page refresh
- Only visible to admin/superadmin users (inherits from admin-session page access control)
- No new route or menu entry needed - leverages existing admin-session infrastructure

### Non-Functional Requirements

#### NFR-1: E2E Tests
- Full Playwright E2E test coverage for all CRUD operations
- Test that templates are actually created/updated/deleted by verifying via API after UI operations
- Test list display
- Test form validation (required fields, invalid inputs)
- Test error handling (network errors, permission errors)

#### NFR-2: i18n
- All UI strings must use i18n keys
- Add keys for: page title, column headers, form labels, validation messages, success/error notifications, confirmation dialogs

#### NFR-3: Consistency
- **Component priority**: Prefer BAI package components over antd equivalents (BAIModal > Modal, BAIButton > Button, BAIFlex, BAITable, etc.)
- Follow existing WebUI patterns (BAITable, BAIModal, Jotai state)
- Use `useSuspendedBackendaiClient()` for API calls
- Use `useBAINotification` for success/error messages
- Follow React component patterns established in the codebase

## UI Design

### List View
A standard admin table view following the pattern of other list pages (e.g., `VFolderNodeListPage`, `EnvironmentPage`):
- Page header with title and "Create" button
- Table with optional client-side name filtering
- Action column with edit/delete icons

### Create/Edit Modal
BAIModal with a form, similar to existing modal patterns:
- Organized form sections
- Resource allocation inputs with server-fetched units/steps
- Form validation with inline error messages

### Delete Confirmation
`BAIConfirmModalWithInput` — requires typing the template name to confirm deletion.

## Scope

### In Scope
- Session template list page/tab with table
- Create session template modal with form
- Edit session template modal (reuses create form)
- Delete with confirmation
- i18n keys for all strings
- E2E Playwright tests for all CRUD operations
- New tab in Admin Session page (`/admin-session?tab=session-templates`), URL-persisted via `nuqs`

### Out of Scope
- Cluster template management (type="cluster") - can be added later
- Template versioning or history
- Template sharing between users
- Template import/export
- GraphQL schema additions (using REST API via client SDK)
- Integration with session launcher (existing SessionTemplateModal handles session history, not these templates)
