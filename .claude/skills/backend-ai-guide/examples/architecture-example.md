# Example: Backend.AI Architecture Question

## User Question
"Can you explain Backend.AI's architecture? How do the components work together?"

---

## Ideal Response Format

### Backend.AI Distributed Computing Platform Architecture

Backend.AI is a container-based distributed computing platform where 5 major server components collaborate to provide seamless resource orchestration.

---

## Major Components and Roles

### 1. Manager (Central Gateway)
**Role**: The brain of the cluster
- Routes REST/GraphQL API requests
- Session scheduling via **Sokovan** orchestrator
- User authentication and RBAC authorization
- Orchestrates cluster-wide operations

**Start Command**: `./backend.ai mgr start-server --debug`

**Documentation**: https://github.com/lablup/backend.ai/blob/main/src/ai/backend/manager/README.md

---

### 2. Agent (Compute Node Manager)
**Role**: Manages containers on individual nodes
- Creates/destroys/monitors Docker containers
- Self-registers to cluster via heartbeat mechanism
- Manages hardware accelerators (GPU/NPU)
- Handles kernel lifecycle operations

**Start Command**: `./backend.ai ag start-server --debug`

**Documentation**: https://github.com/lablup/backend.ai/blob/main/src/ai/backend/agent/README.md

---

### 3. Storage Proxy (Storage Abstraction)
**Role**: Virtual folder and storage backend management
- Unified interface for multiple storage backends (Local FS, NFS, Ceph, S3, Azure Blob, GCS)
- Virtual folder (vfolder) creation and permission management
- Real-time I/O performance metrics
- Storage acceleration APIs

**Start Command**: `./py -m ai.backend.storage.server`

**Documentation**: https://github.com/lablup/backend.ai/blob/main/src/ai/backend/storage/README.md

---

### 4. Webserver (WebUI Hosting)
**Role**: Provides web interface
- Hosts Backend.AI WebUI (Single Page Application)
- Web session and cookie management
- API request signing
- Serves static assets

**Start Command**: `./py -m ai.backend.web.server`
**Default URL**: http://localhost:8090

**Documentation**: https://github.com/lablup/backend.ai/blob/main/src/ai/backend/web/README.md

---

### 5. App Proxy (Service Routing)
**Role**: Access to in-container services
- Routes traffic to in-container services (Jupyter, VSCode, SSH, etc.)
- Dynamic circuit provisioning
- Health monitoring and automatic failover
- Load balancing

**Documentation**: https://github.com/lablup/backend.ai/blob/main/src/ai/backend/appproxy/coordinator/README.md

---

## Component Communication Flow

```
┌─────────────────────────────────────────────────────────┐
│                   User / Client                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
         ┌───────────────────────┐
         │     Webserver         │  Web session management, request signing
         │   (WebUI Hosting)     │
         └───────────┬───────────┘
                     │
                     ↓
         ┌───────────────────────┐
         │      Manager          │  API gateway, orchestration
         │   (Central Coord)     │  Sokovan scheduler
         └─────┬─────────────┬───┘
               │             │
       ┌───────┘             └───────┐
       ↓                             ↓
┌──────────────┐              ┌──────────────┐
│    Agent     │ ← Heartbeat → │    Agent     │  Container management
│  (Node #1)   │              │  (Node #2)   │  GPU/NPU allocation
└──────┬───────┘              └──────┬───────┘
       │                             │
       │         ┌───────────────────┘
       │         │
       ↓         ↓
┌────────────────────────┐
│   Storage Proxy        │  Virtual folder access
│  (Storage Backend)     │  Data persistence
└────────────────────────┘
       │
       ↓
┌────────────────────────┐
│    App Proxy           │  Jupyter, VSCode access
│  (Service Routing)     │  SSH/SFTP connections
└────────────────────────┘
```

---

## Key Workflow Example

### Session Creation Flow
1. **User**: Requests "Create Python kernel" via WebUI
2. **Webserver**: Signs request and forwards to Manager
3. **Manager**:
   - Verifies user authentication
   - Sokovan scheduler decides resource allocation
   - Selects appropriate Agent
4. **Agent**:
   - Creates Docker container
   - Allocates required GPU/NPU
   - Mounts vfolder via Storage Proxy
5. **User**: Accesses Jupyter routed through App Proxy

---

## Container Runtime Elements

Backend.AI provides additional functionality at the container level:

### Kernels
- Dockerfile-based computing environment recipes
- Various frameworks: TensorFlow, PyTorch, R, Julia
- Repository: https://github.com/lablup/backend.ai-kernels

### Jail (Sandbox)
- Rust-based ptrace system call filtering
- Enforces security policies
- Repository: https://github.com/lablup/backend.ai-jail

### Hook (Runtime Library)
- Resource control via libc overrides
- stdin support, environment variable management
- Repository: https://github.com/lablup/backend.ai-hook

---

## Scalability and High Availability

### Horizontal Scaling
- **Add Agent nodes**: Increases compute capacity
- **Add Storage Proxy instances**: Increases I/O throughput
- **App Proxy load balancing**: Distributes service routing

### High Availability
- **Manager**: Stateless design allows replication
- **Agent**: Auto-removal on heartbeat failure, re-registration
- **etcd**: Distributed storage of cluster state
- **PostgreSQL**: HA configuration support (replication, failover)

---

## Required Infrastructure Components

Backend.AI cluster requires the following infrastructure:

| Component | Version | Role |
|-----------|---------|------|
| Python | 3.13.x | Backend.AI codebase |
| Docker | 20.10+ | Container runtime |
| PostgreSQL | 16+ | Metadata storage |
| Redis | 7.2+ | Caching and session management |
| etcd | 3.5+ | Cluster state management |
| Prometheus | 3.x | Metrics collection |

---

## Source Documentation

- **Main README**: https://github.com/lablup/backend.ai/blob/main/README.md
- **Component Architecture**: https://github.com/lablup/backend.ai/blob/main/src/ai/backend/README.md
- **Manager README**: https://github.com/lablup/backend.ai/blob/main/src/ai/backend/manager/README.md
- **Agent README**: https://github.com/lablup/backend.ai/blob/main/src/ai/backend/agent/README.md
- **Storage Proxy README**: https://github.com/lablup/backend.ai/blob/main/src/ai/backend/storage/README.md
- **Official Docs**: http://docs.backend.ai

---

## Key Takeaways

✅ **Distributed Architecture**: 5 major components collaborating
✅ **Sokovan Orchestrator**: Intelligent resource scheduling
✅ **Diverse Accelerator Support**: CUDA, ROCm, TPU, NPU
✅ **Multi-tenancy**: User/group/domain isolation
✅ **REST + GraphQL APIs**: All functions programmable
✅ **Container-based**: Docker + custom runtime elements
✅ **Horizontally Scalable**: Dynamic Agent node addition
