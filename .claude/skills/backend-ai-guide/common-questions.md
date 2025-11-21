# Backend.AI Common Questions

Frequently asked questions about Backend.AI platform. Use this as a quick reference for common inquiries.

---

## Architecture & Components

### Q: What is Backend.AI?

**A**: Backend.AI is a streamlined, container-based computing cluster platform that hosts popular computing/ML frameworks and diverse programming languages, with pluggable heterogeneous accelerator support. It allocates computing resources for multi-tenant sessions on-demand or in batches through its orchestrator called "Sokovan".

**Key Characteristics**:
- Container-based isolation
- Multi-tenant resource allocation
- Heterogeneous accelerator support (CUDA, ROCm, TPU, NPU)
- REST and GraphQL APIs for all operations
- Built for ML/AI workloads and scientific computing

---

### Q: What are the main components of Backend.AI?

**A**: Backend.AI consists of 5 major server-side components:

1. **Manager** - Central API gateway, orchestrator, session scheduler, authentication
2. **Agent** - Kernel lifecycle management on compute nodes, container management
3. **Storage Proxy** - Virtual folder and storage backend abstraction
4. **Webserver** - Hosts the WebUI, manages web sessions
5. **App Proxy** - Routes traffic to in-container services (Jupyter, VSCode, SSH)

**Container Runtime Elements**:
- **Kernels** - Dockerfile recipes for computing environments
- **Jail** - Rust-based ptrace sandbox for security
- **Hook** - In-container runtime library for resource control

---

### Q: How do the components communicate with each other?

**A**: Component communication flow:

```
User → Webserver → Manager → Agent → Storage Proxy
                       ↓
                  App Proxy
```

1. **User** accesses via WebUI or Client SDK
2. **Webserver** hosts WebUI, signs API requests
3. **Manager** receives requests, orchestrates operations, schedules sessions
4. **Agent** executes container operations, manages kernels
5. **Storage Proxy** provides virtual folder access
6. **App Proxy** routes traffic to in-container services

All communication uses REST/GraphQL APIs with authentication tokens.

---

### Q: What is Sokovan?

**A**: Sokovan is Backend.AI's built-in orchestrator responsible for:
- Session scheduling and resource allocation
- Multi-tenant resource isolation
- Priority-based and fair-share scheduling
- Resource quota management
- Custom scheduling policies via plugins

It's named after the warehouse keeper puzzle game (Sokoban), reflecting its role in organizing and managing resources efficiently.

---

## WebUI Integration

### Q: How does this WebUI project connect to Backend.AI?

**A**: The Backend.AI WebUI is a **client application** that connects to the Backend.AI backend platform:

1. **WebUI** (this project) runs as a Single Page Application (SPA)
2. **Webserver** component hosts the WebUI and manages web sessions
3. **Manager** component provides REST/GraphQL APIs
4. **WebUI** uses APIs to:
   - Authenticate users
   - Create/manage compute sessions
   - Access virtual folders
   - Monitor resources
   - Configure settings

**Connection Flow**:
```
WebUI Code (React/Lit) → API Calls → Manager API → Backend Operations
```

---

### Q: What APIs does the WebUI use?

**A**: The WebUI uses both REST and GraphQL APIs:

**REST API**: For operations like:
- Authentication (`/auth/login`)
- Session management (`/session`)
- Kernel operations (`/kernel`)
- File uploads/downloads

**GraphQL API**: For complex queries like:
- User information (`query user`)
- Session details (`query compute_session`)
- Group/project data (`query group`)
- Aggregated statistics

**Authentication**: API keys or JWT tokens signed by the Webserver component.

---

## Features & Capabilities

### Q: What accelerators does Backend.AI support?

**A**: Backend.AI supports heterogeneous accelerators through the Agent's plugin system:

**GPU**:
- NVIDIA CUDA GPUs
- AMD ROCm GPUs

**NPU (Neural Processing Units)**:
- Rebellions NPU
- FuriosaAI NPU

**Other Accelerators**:
- HyperAccel LPU (Language Processing Unit)
- Google TPU (Tensor Processing Unit)
- Graphcore IPU (Intelligence Processing Unit)

New accelerators can be added via the `backendai_accelerator_v21` plugin interface.

---

### Q: What is multi-tenancy in Backend.AI?

**A**: Multi-tenancy means Backend.AI can:
- **Isolate resources** between different users/organizations
- **Allocate quotas** for CPU, memory, GPU, storage
- **Enforce permissions** via RBAC (Role-Based Access Control)
- **Share infrastructure** while maintaining security boundaries

**Organizational Hierarchy**:
```
Domain (Organization)
  └─ Group/Project
      └─ User
          └─ Session (Kernel)
```

Each level has resource quotas and permission policies.

---

### Q: What are virtual folders (vfolders)?

**A**: Virtual folders are Backend.AI's abstraction for persistent storage:

**Features**:
- **Cross-session persistence** - Data survives kernel restarts
- **Multi-backend support** - Local FS, NFS, Ceph, S3, Azure Blob, GCS
- **Permission management** - Share folders between users/groups
- **Quota enforcement** - Size limits per folder
- **Performance monitoring** - Real-time I/O metrics

**Use Cases**:
- Store datasets across multiple training sessions
- Share code/data between team members
- Persist model checkpoints
- Mount cloud storage into containers

---

### Q: What are kernels in Backend.AI?

**A**: Kernels are containerized computing environments:

**Definition**: Docker containers running specific frameworks/languages with intrinsic service support.

**Intrinsic Services**:
- Jupyter Notebook/Lab
- Terminal (ttyd)
- SSH/SFTP/SCP
- VSCode Server

**Popular Kernels**:
- Python (TensorFlow, PyTorch, JAX)
- R (with statistical packages)
- Julia, C/C++, Java, Go, Rust, Node.js

**Kernel Lifecycle**: Manager schedules → Agent creates container → User interacts → Agent destroys container

---

## Development & Setup

### Q: What are the system requirements to run Backend.AI?

**A**: Development/Production Requirements:

**Software**:
- Python 3.13.x (CPython 3.13.7)
- Pantsbuild 2.27.x
- Docker 20.10+ (with Compose v2)
- PostgreSQL 16+
- Redis 7.2+
- etcd 3.5+
- Prometheus 3.x

**OS**:
- Linux (Debian/RHEL-based distributions)
- macOS (with sudo access)

**Hardware** (recommended):
- Multi-core CPU
- 16GB+ RAM for development
- SSD storage
- GPU optional (for accelerator support)

---

### Q: How do I start developing with Backend.AI?

**A**: Quick development setup:

```bash
# Clone repository
git clone https://github.com/lablup/backend.ai.git
cd backend.ai

# Install development dependencies
./scripts/install-dev.sh

# Start components (in separate terminals)
./backend.ai mgr start-server --debug    # Manager
./backend.ai ag start-server --debug     # Agent
./py -m ai.backend.storage.server        # Storage Proxy
./py -m ai.backend.web.server            # Webserver

# Access WebUI
open http://localhost:8090
```

**Documentation**: https://github.com/lablup/backend.ai/blob/main/src/ai/backend/README.md

---

### Q: How do I use Backend.AI from my application?

**A**: Use one of the official Client SDKs:

**Python**:
```bash
pip install backend.ai-client

# CLI usage
backend.ai session create python:3.11
backend.ai run python -c "print('Hello')"

# SDK usage
from ai.backend.client import Session
async with Session() as session:
    result = await session.execute("print('Hello')")
```

**JavaScript**:
```bash
npm install backend.ai-client

// SDK usage
import BackendAIClient from 'backend.ai-client';
const client = new BackendAIClient(config);
await client.session.create('python:3.11');
```

**Java**: Download from https://github.com/lablup/backend.ai-client-java
**PHP**: Coming soon - https://github.com/lablup/backend.ai-client-php

---

## Plugin System

### Q: What plugins does Backend.AI support?

**A**: Backend.AI has a rich plugin system for extensibility:

**Manager Plugins**:
- `backendai_scheduler_v10` - Custom schedulers (e.g., FIFO, priority, fair-share)
- `backendai_agentselector_v10` - Agent selection strategies
- `backendai_hook_v20` - Lifecycle hooks (pre/post operations)
- `backendai_webapp_v20` - Web app extensions
- `backendai_monitor_stats_v10` - Statistics monitoring
- `backendai_monitor_error_v10` - Error monitoring

**Agent Plugins**:
- `backendai_accelerator_v21` - Hardware accelerator support
- `backendai_monitor_stats_v10` - Statistics monitoring
- `backendai_monitor_error_v10` - Error monitoring

**Use Cases**:
- Add custom GPU support
- Implement organization-specific scheduling policies
- Integrate monitoring systems (Prometheus, Grafana)
- Add custom authentication backends

---

## Security & Isolation

### Q: How does Backend.AI ensure security and isolation?

**A**: Multi-layered security approach:

**Container Isolation**:
- Docker container boundaries
- Resource limits (CPU, memory, GPU)
- Network isolation per session

**Jail Sandbox**:
- Rust-based ptrace system call filtering
- Prevents dangerous system calls
- Fine-grained access control

**Hook Library**:
- Resource monitoring and limits
- Standard input control
- Environment variable management

**RBAC (Role-Based Access Control)**:
- User/group/domain hierarchy
- Permission policies per resource
- API key management

**Quota Enforcement**:
- CPU/memory/GPU limits
- Storage quota per vfolder
- Rate limiting on API calls

---

## Performance & Scaling

### Q: How does Backend.AI handle scaling?

**A**: Horizontal and vertical scaling strategies:

**Horizontal Scaling**:
- Add more **Agent** nodes for compute capacity
- Add **Storage Proxy** instances for I/O throughput
- Load balance via **App Proxy** for service routing

**Vertical Scaling**:
- Increase resources on existing nodes
- Add more GPUs/accelerators per Agent

**Architecture Benefits**:
- **Stateless Manager** - Scale API gateway independently
- **Self-registering Agents** - Add nodes dynamically via heartbeats
- **Distributed Storage** - Backends like Ceph scale independently
- **Sokovan Orchestrator** - Efficient resource allocation across cluster

---

## Troubleshooting

### Q: Where can I find logs and metrics?

**A**: Observability stack integration:

**Logs**:
- Component logs in stdout/stderr
- Structured logging (JSON format)
- **Loki** integration for log aggregation

**Metrics**:
- **Prometheus** metrics endpoint on each component
- Resource usage (CPU, memory, GPU, I/O)
- Session statistics
- **Grafana** dashboards for visualization

**Tracing**:
- **OpenTelemetry** instrumentation
- **Tempo** for distributed tracing
- Request flow across components

**Default Monitoring URL**: http://localhost:9090 (Prometheus)

---

### Q: How do I debug Backend.AI issues?

**A**: Debugging strategies:

**Check Component Logs**:
```bash
./backend.ai mgr start-server --debug    # Verbose Manager logs
./backend.ai ag start-server --debug     # Verbose Agent logs
```

**Verify Component Status**:
```bash
# Check if services are running
docker ps                    # Container status
etcdctl member list          # etcd cluster health
redis-cli ping               # Redis connectivity
psql -h localhost -U backend.ai  # PostgreSQL connection
```

**API Testing**:
```bash
# Test REST API
curl -X POST http://localhost:8090/auth/login

# Test GraphQL API
curl -X POST http://localhost:8090/admin/graphql \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query": "{ user { id email } }"}'
```

**Common Issues**:
- **Agent not registering**: Check etcd connectivity, verify heartbeat config
- **Session creation fails**: Check Agent resources, Docker daemon status
- **Storage access fails**: Verify Storage Proxy config, backend credentials
- **WebUI not loading**: Check Webserver logs, CORS settings

---

## Migration & Updates

### Q: How do I migrate between Backend.AI versions?

**A**: Follow the official migration guide:

**Documentation**: https://github.com/lablup/backend.ai/blob/main/MIGRATION.md

**General Process**:
1. **Backup databases** (PostgreSQL, etcd, Redis)
2. **Review release notes** for breaking changes
3. **Update dependencies** (Python packages, system libraries)
4. **Run database migrations** (via Alembic)
5. **Restart components** in order (Manager → Agent → Storage → Web)
6. **Verify functionality** (test sessions, API calls)

**Compatibility**:
- Manager/Agent versions should match
- Client SDKs compatible within major version
- Kernel images updated separately

---

## Additional Resources

### Q: Where can I find more information?

**A**: Official resources:

**Documentation**:
- Main Docs: http://docs.backend.ai
- GitHub: https://github.com/lablup/backend.ai
- Contributing: https://github.com/lablup/backend.ai/blob/main/.github/CONTRIBUTING.md

**Development**:
- Development Setup: https://github.com/lablup/backend.ai/blob/main/src/ai/backend/README.md
- Claude Agent Guide: https://github.com/lablup/backend.ai/blob/main/CLAUDE.md
- Migration Guide: https://github.com/lablup/backend.ai/blob/main/MIGRATION.md

**Client SDKs**:
- Python: https://github.com/lablup/backend.ai/blob/main/src/ai/backend/client
- Java: https://github.com/lablup/backend.ai-client-java
- JavaScript: https://github.com/lablup/backend.ai-client-js
- PHP: https://github.com/lablup/backend.ai-client-php

**Container Runtime**:
- Kernels: https://github.com/lablup/backend.ai-kernels
- Jail: https://github.com/lablup/backend.ai-jail
- Hook: https://github.com/lablup/backend.ai-hook

---

## WebUI-Specific Questions

### Q: What's the difference between React and Lit-Element code in this WebUI?

**A**: This WebUI is a **hybrid architecture**:

**Lit-Element (`/src`)**:
- Legacy web components
- Material Web Components
- Older features and pages

**React (`/react`)**:
- Modern UI components
- Ant Design + Relay (GraphQL)
- New features and pages

**Integration**: Both coexist, gradually migrating from Lit to React.

---

### Q: How does the WebUI handle state management?

**A**: Different strategies for different frameworks:

**React Components**:
- **Relay** for GraphQL-backed state
- **Recoil** for global client state
- **React hooks** for local state

**Lit-Element Components**:
- **Redux** for global state
- Component properties for local state

**Recommendation**: New features should use React + Relay + Recoil pattern.

---

### Q: How do I fetch Backend.AI data in the WebUI?

**A**: Use appropriate method for the framework:

**React + Relay** (preferred):
```typescript
const data = useLazyLoadQuery(
  graphql`
    query MyComponentQuery {
      compute_session {
        id
        status
      }
    }
  `,
  {}
);
```

**REST API** (when GraphQL not available):
```typescript
const response = await fetch('/session', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**Refer to**: `@.github/instructions/react.instructions.md` for React patterns.

---
