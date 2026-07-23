# Example: Component-Specific Question

## User Question
"What does the Backend.AI Manager component do? How is it different from the Agent?"

---

## Ideal Response Format

### Backend.AI Manager Component

The **Manager** is the central API gateway and orchestrator of the Backend.AI cluster. It serves as the brain that coordinates all operations across the distributed system.

---

## Manager's Key Responsibilities

### 1. API Gateway
- Routes all REST and GraphQL API requests
- Validates authentication tokens
- Enforces rate limiting and quotas
- Exposes unified API interface to clients

### 2. Session Scheduling (Sokovan Orchestrator)
- Decides when and where to create compute sessions
- Implements scheduling policies:
  - **FIFO** (First In, First Out)
  - **Priority-based** scheduling
  - **Fair-share** scheduling
- Manages session queues
- Resource allocation decisions

### 3. Authentication & Authorization
- User authentication via API keys or JWT
- **RBAC** (Role-Based Access Control)
- Permission checks for all operations
- Domain/group/user hierarchy management

### 4. Cluster Orchestration
- Monitors Agent heartbeats
- Tracks cluster-wide resource availability
- Manages virtual folders (vfolders)
- Coordinates multi-component operations

### 5. Plugin Management
- Loads and manages plugins:
  - Custom schedulers (`backendai_scheduler_v10`)
  - Agent selectors (`backendai_agentselector_v10`)
  - Lifecycle hooks (`backendai_hook_v20`)
  - Web app extensions (`backendai_webapp_v20`)
  - Monitoring plugins (`backendai_monitor_stats_v10`, `backendai_monitor_error_v10`)

---

## Manager vs Agent: Key Differences

| Aspect | Manager | Agent |
|--------|---------|-------|
| **Scope** | Cluster-wide coordination | Single compute node |
| **Primary Role** | API gateway & orchestrator | Container lifecycle management |
| **Deployment** | Centralized (1-few instances) | Distributed (many nodes) |
| **State** | Stateless (uses PostgreSQL/etcd) | Stateful (manages local containers) |
| **Responsibilities** | Scheduling, auth, API routing | Docker operations, resource monitoring |
| **Hardware** | No accelerator requirements | Direct GPU/NPU access |
| **API Exposure** | REST + GraphQL endpoints | Internal communication only |
| **Plugin Types** | Scheduler, hook, webapp | Accelerator, monitoring |

---

## How They Work Together

### Session Creation Example

```
User Request: "Create Python kernel with 2 GPUs"
       ↓
┌──────────────────┐
│    Manager       │  1. Receives API request
│                  │  2. Authenticates user
│                  │  3. Checks resource quotas
└────────┬─────────┘
         │
         │  4. Sokovan scheduler finds available resources
         │
         ↓
┌──────────────────┐
│    Agent #3      │  5. Selected Agent with 2 free GPUs
│                  │  6. Creates Docker container
│                  │  7. Allocates GPUs
│                  │  8. Reports status back to Manager
└──────────────────┘
         │
         ↓
    Container running with 2 GPUs
```

### Key Interaction Points

1. **Heartbeat Mechanism**
   - Agents send periodic heartbeats to Manager
   - Manager tracks Agent availability and resources
   - Failed heartbeats trigger Agent removal

2. **Resource Tracking**
   - Agents report available CPU, memory, GPU to Manager
   - Manager maintains cluster-wide resource view
   - Scheduling decisions based on real-time data

3. **Container Operations**
   - Manager issues container commands (create, destroy, restart)
   - Agent executes commands via Docker API
   - Agent reports operation results to Manager

---

## Manager Architecture Details

### Technology Stack
- **Python 3.13.x** - Core implementation
- **PostgreSQL** - Metadata storage
- **Redis** - Caching and rate limiting
- **etcd** - Cluster state coordination
- **aiohttp** - Async HTTP server

### API Endpoints

**REST API Examples**:
- `POST /auth/login` - User authentication
- `POST /session` - Create compute session
- `GET /session/:id` - Get session status
- `DELETE /session/:id` - Destroy session
- `GET /resource` - Check resource availability

**GraphQL API Examples**:
```graphql
query {
  compute_session(id: "session-id") {
    id
    status
    kernels {
      id
      image
      resource_opts
    }
  }
}
```

---

## Plugin System

The Manager's plugin system enables extensibility:

### Scheduler Plugins (`backendai_scheduler_v10`)
Custom scheduling algorithms:
```python
class MyScheduler:
    async def schedule_session(self, session_ctx):
        # Custom logic to select Agent
        return selected_agent
```

### Hook Plugins (`backendai_hook_v20`)
Lifecycle hooks for custom actions:
```python
class MyHook:
    async def on_session_created(self, session_ctx):
        # Custom logic after session creation
        pass
```

---

## Agent Component (For Comparison)

### Agent's Key Responsibilities

1. **Container Management**
   - Creates/destroys Docker containers
   - Monitors container health
   - Manages container networking

2. **Resource Monitoring**
   - Tracks CPU, memory, GPU usage
   - Reports real-time metrics to Manager
   - Enforces resource limits

3. **Accelerator Management**
   - Direct GPU/NPU access
   - Allocates accelerators to containers
   - Supports multiple accelerator types via plugins

4. **Self-Registration**
   - Discovers Manager via etcd
   - Sends heartbeat every few seconds
   - Auto-registers on startup

---

## Deployment Patterns

### Typical Cluster Setup

```
┌─────────────────────────────────────────┐
│  Load Balancer                          │
└────────────┬────────────────────────────┘
             │
    ┌────────┴────────┐
    ↓                 ↓
┌─────────┐      ┌─────────┐
│ Manager │      │ Manager │  (HA setup)
│  #1     │      │  #2     │
└────┬────┘      └────┬────┘
     │                │
     └────────┬───────┘
              │ (orchestrates)
    ┌─────────┼─────────────┐
    ↓         ↓             ↓
┌────────┐ ┌────────┐  ┌────────┐
│ Agent  │ │ Agent  │  │ Agent  │
│  #1    │ │  #2    │  │  #3    │
│ 4 GPUs │ │ 8 GPUs │  │ 2 TPUs │
└────────┘ └────────┘  └────────┘
```

**Manager**: Centralized, stateless, can be replicated
**Agent**: Distributed across compute nodes, stateful

---

## Performance Considerations

### Manager Bottlenecks
- API request throughput
- Database query performance
- Scheduling algorithm complexity

**Solutions**:
- Horizontal scaling (multiple Manager instances)
- Database connection pooling
- Caching frequently accessed data (Redis)

### Agent Bottlenecks
- Docker daemon performance
- Network I/O for container images
- GPU allocation overhead

**Solutions**:
- Pre-pull container images
- Optimize Docker storage driver
- Use local image registry

---

## Source Documentation

- **Manager README**: https://github.com/lablup/backend.ai/blob/main/src/ai/backend/manager/README.md
- **Agent README**: https://github.com/lablup/backend.ai/blob/main/src/ai/backend/agent/README.md
- **Main README**: https://github.com/lablup/backend.ai/blob/main/README.md
- **Plugin Development**: https://github.com/lablup/backend.ai/blob/main/src/ai/backend/README.md

---

## Quick Summary

**Manager**:
- 🧠 Cluster brain - makes decisions
- 🚪 API gateway - handles all client requests
- 📅 Sokovan scheduler - resource allocation
- 🔐 Auth & RBAC - security enforcement
- 📊 Cluster orchestrator - coordinates operations

**Agent**:
- 🐳 Container manager - Docker operations
- 💪 Resource executor - runs actual workloads
- 🎮 GPU/NPU handler - accelerator management
- 💓 Heartbeat sender - self-registration
- 📈 Metrics reporter - real-time monitoring

**Key Difference**: Manager decides **what** and **where**, Agent executes **how** and **monitors**.
