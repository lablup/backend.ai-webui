# Example: WebUI Integration Question

## User Question
"How does this Backend.AI WebUI connect to and communicate with the Backend.AI backend? What APIs does it use?"

---

## Ideal Response Format

### Backend.AI WebUI Integration Architecture

The **Backend.AI WebUI** (this project) is a **client application** that communicates with the Backend.AI backend platform through well-defined APIs. It's a hybrid Single Page Application (SPA) using both Lit-Element and React frameworks.

---

## WebUI to Backend.AI Connection Flow

```
┌─────────────────────────────────────────────┐
│  Backend.AI WebUI (this project)            │
│  - React components (/react)                │
│  - Lit-Element components (/src)            │
│  - Ant Design + Relay (GraphQL)             │
└──────────────────┬──────────────────────────┘
                   │
                   │ API Calls (REST + GraphQL)
                   │ Authentication: API Key / JWT
                   │
                   ↓
┌─────────────────────────────────────────────┐
│  Backend.AI Webserver Component             │
│  - Hosts the WebUI SPA                      │
│  - Manages web sessions                     │
│  - Signs API requests                       │
│  - Default: http://localhost:8090           │
└──────────────────┬──────────────────────────┘
                   │
                   │ Forwarded Requests
                   │
                   ↓
┌─────────────────────────────────────────────┐
│  Backend.AI Manager Component               │
│  - REST API endpoints                       │
│  - GraphQL API endpoint                     │
│  - Authentication & Authorization (RBAC)    │
│  - Orchestrates backend operations          │
└─────────────────────────────────────────────┘
```

---

## API Communication Methods

### 1. REST API
**Used for**: Direct operations, file uploads/downloads, authentication

**Common Endpoints**:
```javascript
// Authentication
POST /auth/login
{
  "username": "user@example.com",
  "password": "password"
}
→ Response: { "access_token": "...", "refresh_token": "..." }

// Session Management
POST /session
{
  "image": "python:3.11",
  "resources": {
    "cpu": "2",
    "mem": "8g",
    "cuda.shares": "1"
  }
}
→ Response: { "session_id": "...", "status": "pending" }

// Get Session Status
GET /session/{session_id}
→ Response: { "id": "...", "status": "running", "kernels": [...] }

// Virtual Folder Operations
GET /vfolder
POST /vfolder/create
DELETE /vfolder/{vfolder_name}
POST /vfolder/{vfolder_name}/upload
GET /vfolder/{vfolder_name}/download/{file_path}
```

---

### 2. GraphQL API
**Used for**: Complex queries, nested data fetching, real-time subscriptions

**Endpoint**: `POST /admin/graphql`

**Common Queries in WebUI**:

```graphql
# User Information
query GetUserInfo {
  user {
    id
    email
    username
    role
    domain_name
    groups {
      id
      name
    }
  }
}

# Compute Sessions
query GetComputeSessions($status: String) {
  compute_session_list(status: $status) {
    items {
      id
      name
      image
      status
      created_at
      terminated_at
      kernels {
        id
        occupied_slots
        live_stat
      }
    }
    total_count
  }
}

# Resource Presets
query GetResourcePresets {
  keypair_resource_policies {
    name
    default_for_unspecified
    total_resource_slots
    max_concurrent_sessions
  }
}

# Virtual Folders (with Fragment)
fragment VFolderInfo on VirtualFolder {
  id
  name
  host
  quota
  used_bytes
  max_size
  created_at
  permission
}

query GetVirtualFolders {
  vfolders {
    ...VFolderInfo
  }
}
```

---

## Authentication Flow

### Initial Login
```
1. User enters credentials in WebUI
   ↓
2. WebUI sends POST /auth/login to Webserver
   ↓
3. Webserver forwards to Manager
   ↓
4. Manager validates credentials
   ↓
5. Manager returns JWT tokens (access + refresh)
   ↓
6. WebUI stores tokens (localStorage/sessionStorage)
   ↓
7. All subsequent requests include: Authorization: Bearer <token>
```

### API Request Signing (Alternative Method)
Some deployments use API key signing:
```javascript
// WebUI generates signed request
const signature = generateSignature({
  method: 'POST',
  url: '/session',
  body: requestBody,
  accessKey: userAccessKey,
  secretKey: userSecretKey,
  timestamp: Date.now()
});

// Request includes signature headers
fetch('/session', {
  method: 'POST',
  headers: {
    'X-BackendAI-Version': 'v5.20240101',
    'X-BackendAI-Date': timestamp,
    'Authorization': `BackendAI signedToken=${signature}`
  },
  body: JSON.stringify(requestBody)
});
```

---

## WebUI Technology Stack

### Framework Architecture
```
Backend.AI WebUI (Hybrid)
├── React Components (/react)
│   ├── Ant Design UI Library
│   ├── Relay (GraphQL Client)
│   ├── Recoil (Global State)
│   └── Modern features (new development)
└── Lit-Element Components (/src)
    ├── Material Web Components
    ├── Redux (Legacy State)
    └── Legacy features (maintenance mode)
```

### React + Relay Pattern (Preferred)
```typescript
// Modern WebUI pattern using Relay
import { useLazyLoadQuery, graphql } from 'react-relay';

const SessionList: React.FC = () => {
  const data = useLazyLoadQuery(
    graphql`
      query SessionListQuery {
        compute_session_list(status: "RUNNING") {
          items {
            id
            name
            status
            ...SessionCard_session
          }
        }
      }
    `,
    {}
  );

  return (
    <div>
      {data.compute_session_list.items.map(session => (
        <SessionCard key={session.id} sessionRef={session} />
      ))}
    </div>
  );
};
```

---

## Key WebUI-Backend Interactions

### 1. Session Creation
```typescript
// WebUI initiates session creation
const createSession = async () => {
  const response = await fetch('/session', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      image: 'python:3.11-tensorflow',
      resources: {
        cpu: '4',
        mem: '16g',
        'cuda.shares': '2'
      },
      mounts: ['my-dataset-vfolder'],
      env: {
        'JUPYTER_TOKEN': 'secret'
      }
    })
  });

  const session = await response.json();
  // session.id can now be used to access the kernel
};
```

**Backend Flow**:
1. Webserver receives request
2. Manager validates token, checks quotas
3. Sokovan scheduler selects Agent
4. Agent creates Docker container
5. Storage Proxy mounts vfolders
6. Manager returns session ID to WebUI

---

### 2. Service Access (Jupyter, VSCode, Terminal)
```typescript
// WebUI generates service URL
const jupyterUrl = `/proxy/${sessionId}/jupyter/`;
const vscodeUrl = `/proxy/${sessionId}/vscode/`;
const terminalUrl = `/proxy/${sessionId}/ttyd/`;

// User clicks "Open Jupyter"
// Browser navigates to proxy URL
// App Proxy routes request to container's Jupyter service
```

**Backend Flow**:
1. WebUI requests service access
2. App Proxy receives request
3. App Proxy looks up session ID → container IP
4. App Proxy establishes circuit to container
5. Traffic flows: Browser ↔ App Proxy ↔ Container

---

### 3. Virtual Folder File Operations
```typescript
// List files in vfolder
const listFiles = async (vfolderName: string) => {
  const response = await fetch(`/vfolder/${vfolderName}/files`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  return await response.json();
};

// Upload file
const uploadFile = async (vfolderName: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  await fetch(`/vfolder/${vfolderName}/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}` },
    body: formData
  });
};

// Download file
const downloadFile = (vfolderName: string, filePath: string) => {
  const url = `/vfolder/${vfolderName}/download/${filePath}?token=${accessToken}`;
  window.open(url, '_blank');
};
```

**Backend Flow**:
1. WebUI sends vfolder operation request
2. Manager authenticates and checks permissions
3. Storage Proxy performs actual file operation
4. Result returned to WebUI

---

## Real-Time Updates

### WebSocket Connections
```typescript
// WebUI establishes WebSocket for real-time updates
const ws = new WebSocket(
  `wss://${host}/events?token=${accessToken}`
);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case 'session_status_changed':
      // Update session status in UI
      updateSessionStatus(data.session_id, data.status);
      break;

    case 'resource_usage_updated':
      // Update resource metrics
      updateMetrics(data.session_id, data.metrics);
      break;
  }
};
```

---

## Configuration

### WebUI Config (`config.toml`)
```toml
[general]
apiEndpoint = "https://api.backend.ai"  # Manager API endpoint
webserverUrl = "https://console.backend.ai"  # Webserver URL

[wsproxy]
proxyURL = "wss://api.backend.ai/events"  # WebSocket endpoint

[authorization]
enableSignature = true  # Use signature-based auth
```

### Connection Setup
```typescript
// WebUI initializes connection
import { BackendAIClient } from './backend-ai-client';

const client = new BackendAIClient({
  endpoint: config.apiEndpoint,
  accessKey: userAccessKey,
  secretKey: userSecretKey
});

// Client handles:
// - Request signing
// - Token refresh
// - Error handling
// - Rate limiting
```

---

## WebUI Source Code Structure

```
backend.ai-webui/
├── react/                    # React components (modern)
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── __generated__/    # Relay generated files
│   │   └── App.tsx           # Main React app
│   └── relay.config.js       # Relay compiler config
│
├── src/                      # Lit-Element components (legacy)
│   ├── components/           # Web components
│   ├── lib/                  # Shared libraries
│   └── backend-ai-client.ts  # API client implementation
│
└── resources/
    ├── config.toml.sample    # Configuration template
    └── i18n/                 # Translations
```

---

## Development Workflow

### Running WebUI Locally
```bash
# Terminal 1: Build and serve WebUI
pnpm run server:d   # Watch mode, auto-reload

# Terminal 2: WebSocket proxy (for desktop app)
pnpm run wsproxy

# Terminal 3: Backend.AI components (if running locally)
./backend.ai mgr start-server --debug
./backend.ai ag start-server --debug
```

### API Testing
```bash
# Test REST API
curl -X POST http://localhost:8090/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin@lablup.com", "password": "password"}'

# Test GraphQL API
curl -X POST http://localhost:8090/admin/graphql \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ user { email } }"}'
```

---

## Source Documentation

- **WebUI Repository**: https://github.com/lablup/backend.ai-webui
- **Webserver Component**: https://github.com/lablup/backend.ai/blob/main/src/ai/backend/web/README.md
- **Manager API**: https://github.com/lablup/backend.ai/blob/main/src/ai/backend/manager/README.md
- **Client SDK (Python)**: https://github.com/lablup/backend.ai/blob/main/src/ai/backend/client
- **Client SDK (JavaScript)**: https://github.com/lablup/backend.ai-client-js

---

## Summary: WebUI-Backend Communication

**Key Points**:
✅ **Hybrid Architecture**: React (modern) + Lit-Element (legacy)
✅ **Dual API Support**: REST for operations, GraphQL for queries
✅ **Authentication**: JWT tokens or signed requests
✅ **Hosted by**: Backend.AI Webserver component
✅ **State Management**: Relay (GraphQL) + Recoil (global) for React
✅ **Real-time Updates**: WebSocket connections for live data
✅ **Service Access**: App Proxy routes to in-container services
✅ **File Operations**: Storage Proxy handles vfolder operations

**Communication Flow**:
```
WebUI → Webserver (session mgmt) → Manager (API) → Agent (execution)
                                  ↓
                          Storage Proxy (files)
                                  ↓
                          App Proxy (services)
```
