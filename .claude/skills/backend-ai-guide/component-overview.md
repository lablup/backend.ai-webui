# Backend.AI Component Overview

Quick reference guide for Backend.AI's major components. This document provides at-a-glance summaries for fast lookups.

---

## Server-Side Components

### Manager
**Repository**: `src/ai/backend/manager/`
**Documentation**: https://github.com/lablup/backend.ai/blob/main/src/ai/backend/manager/README.md

**Purpose**: Central API gateway and cluster orchestrator

**Key Responsibilities**:
- Routes REST and GraphQL API requests
- Orchestrates cluster-wide operations
- Session scheduling via **Sokovan** orchestrator
- User authentication and RBAC authorization
- Plugin management and extensibility

**Plugin Interfaces**:
- `backendai_scheduler_v10` - Custom schedulers
- `backendai_agentselector_v10` - Agent selection strategies
- `backendai_hook_v20` - Lifecycle hooks
- `backendai_webapp_v20` - Web app extensions
- `backendai_monitor_stats_v10` - Statistics monitoring
- `backendai_monitor_error_v10` - Error monitoring

**Start Command**: `./backend.ai mgr start-server --debug`

---

### Agent
**Repository**: `src/ai/backend/agent/`
**Documentation**: https://github.com/lablup/backend.ai/blob/main/src/ai/backend/agent/README.md

**Purpose**: Kernel lifecycle management on compute nodes

**Key Responsibilities**:
- Manages Docker containers on individual nodes
- Self-registers to cluster via heartbeat mechanism
- Monitors container health and resource usage
- Executes kernel operations (create, destroy, restart)

**Plugin Interfaces**:
- `backendai_accelerator_v21` - Hardware accelerator support
- `backendai_monitor_stats_v10` - Statistics monitoring
- `backendai_monitor_error_v10` - Error monitoring

**Supported Accelerators**:
- CUDA GPU (NVIDIA)
- ROCm GPU (AMD)
- Rebellions NPU
- FuriosaAI NPU
- HyperAccel LPU
- Google TPU
- Graphcore IPU

**Start Command**: `./backend.ai ag start-server --debug`

---

### Storage Proxy
**Repository**: `src/ai/backend/storage/`
**Documentation**: https://github.com/lablup/backend.ai/blob/main/src/ai/backend/storage/README.md

**Purpose**: Virtual folder and storage backend abstraction

**Key Responsibilities**:
- Provides unified interface for multiple storage backends
- Manages virtual folders (vfolders) for data persistence
- Real-time performance metrics and monitoring
- Storage acceleration APIs for optimized I/O

**Supported Backends**:
- Local filesystem
- NFS
- Ceph
- AWS S3
- Azure Blob Storage
- Google Cloud Storage

**Start Command**: `./py -m ai.backend.storage.server`

---

### Webserver
**Repository**: `src/ai/backend/web/`
**Documentation**: https://github.com/lablup/backend.ai/blob/main/src/ai/backend/web/README.md

**Purpose**: Web UI hosting and session management

**Key Responsibilities**:
- Hosts Backend.AI WebUI (Single Page Application)
- Manages web sessions and cookies
- API request signing for authentication
- Serves static assets

**Default URL**: http://localhost:8090

**Start Command**: `./py -m ai.backend.web.server`

---

### App Proxy
**Repository**: `src/ai/backend/appproxy/coordinator/`
**Documentation**: https://github.com/lablup/backend.ai/blob/main/src/ai/backend/appproxy/coordinator/README.md

**Purpose**: Service routing and load balancing for in-container services

**Key Responsibilities**:
- Routes traffic to in-container services (Jupyter, VSCode, SSH, etc.)
- Dynamic circuit provisioning between external clients and containers
- Health monitoring and automatic failover
- Load balancing across multiple container instances

**Supported Services**:
- Jupyter Notebook/Lab
- VSCode Server
- Terminal (ttyd)
- SSH/SFTP/SCP
- Custom web applications

---

## Container Runtime Elements

### Kernels
**Repository**: https://github.com/lablup/backend.ai-kernels

**Purpose**: Container image recipes for computing environments

**Description**: Dockerfile-based recipes that define computing environments with specific frameworks, languages, and tools.

**Intrinsic Support**:
- Jupyter Notebook/Lab
- Terminal (ttyd)
- SSH/SFTP/SCP
- VSCode Server

**Popular Kernel Images**:
- Python (TensorFlow, PyTorch, JAX)
- R (with statistical packages)
- Julia
- C/C++ (with compilers)
- Java, Go, Rust, Node.js

---

### Jail
**Repository**: https://github.com/lablup/backend.ai-jail

**Purpose**: Programmable sandbox for security isolation

**Description**: Rust-based ptrace-based system call filtering mechanism that provides fine-grained control over container operations.

**Features**:
- System call filtering and interception
- Resource access control
- Security policy enforcement
- Process isolation

---

### Hook
**Repository**: https://github.com/lablup/backend.ai-hook

**Purpose**: In-container runtime library for resource control

**Description**: Library with libc overrides that provides resource monitoring and control from within containers.

**Features**:
- Resource usage monitoring
- Standard input (stdin) support for batch jobs
- Environment variable management
- Inter-process communication hooks

---

## Client SDKs

### Python Client
**Package**: `backend.ai-client`
**Repository**: https://github.com/lablup/backend.ai/blob/main/src/ai/backend/client
**Install**: `pip install backend.ai-client`

**Features**:
- Full REST and GraphQL API support
- Command-line interface (CLI)
- Session management
- Virtual folder operations
- Async/await support

---

### Java Client
**Repository**: https://github.com/lablup/backend.ai-client-java
**Install**: Available via releases

**Features**:
- REST API support
- Session lifecycle management
- Type-safe API bindings

---

### JavaScript Client
**Package**: `backend.ai-client`
**Repository**: https://github.com/lablup/backend.ai-client-js
**Install**: `npm install backend.ai-client`

**Features**:
- Browser and Node.js support
- Promise-based API
- WebSocket support for streaming

---

### PHP Client
**Package**: `lablup/backend.ai-client`
**Repository**: https://github.com/lablup/backend.ai-client-php
**Install**: `composer require lablup/backend.ai-client` (under preparation)

**Status**: Under development

---

## Architecture Concepts

### Sokovan Orchestrator
**Purpose**: Custom job scheduler and resource orchestrator

**Description**: Backend.AI's built-in orchestrator that handles session scheduling, resource allocation, and cluster-wide coordination.

**Features**:
- Multi-tenant resource isolation
- Priority-based scheduling
- Fair-share scheduling
- Resource quota management
- Custom scheduling policies via plugins

---

### Virtual Folders (vfolders)
**Purpose**: Cloud storage abstraction for data persistence

**Description**: Abstraction layer over various storage backends that provides consistent API for file operations across sessions.

**Features**:
- Cross-session data sharing
- Permission management
- Quota enforcement
- Multiple storage backend support
- Performance monitoring

---

## API Types

### REST API
**Purpose**: Primary interface for cluster operations

**Features**:
- Standard HTTP methods (GET, POST, PUT, DELETE)
- JSON request/response format
- Authentication via API keys
- Rate limiting and quotas

**Common Endpoints**:
- `/auth/login` - User authentication
- `/session` - Session management
- `/kernel` - Kernel operations
- `/vfolder` - Virtual folder operations
- `/admin` - Administrative operations

---

### GraphQL API
**Purpose**: Flexible query interface for complex data retrieval

**Features**:
- Single endpoint for all queries
- Precise data fetching (no over-fetching)
- Type-safe schema
- Real-time subscriptions

**Common Queries**:
- `compute_session` - Session information
- `user` - User details
- `group` - Group and project information
- `keypair` - API key management

---

## Infrastructure Requirements

### Development Setup

**Python**: 3.13.x (CPython 3.13.7 for main branch)
**Pantsbuild**: 2.27.x
**Docker**: 20.10+ (with Compose v2)
**PostgreSQL**: 16+ (tested with 16.3)
**Redis**: 7.2+ (tested with 7.2.11)
**etcd**: 3.5+ (tested with 3.5.14)
**Prometheus**: 3.x (tested with 3.1.0)

### Recommended Observability Stack

**Grafana**: 11.x (tested with 11.4.0)
**Loki**: 3.x (tested with 3.5.0)
**Tempo**: 2.x (tested with 2.7.2)
**OpenTelemetry Collector**: Latest

---

## Quick Reference: Component Communication

```
User/Client
    ↓
Webserver (hosts WebUI, signs requests)
    ↓
Manager (API gateway, orchestration, scheduling)
    ↓ (allocates resources)
Agent (manages containers on compute nodes)
    ↓ (provisions storage)
Storage Proxy (virtual folder access)
    ↓ (routes app traffic)
App Proxy (Jupyter, VSCode, SSH access)
```

---

## Additional Resources

- **Official Documentation**: http://docs.backend.ai
- **Main Repository**: https://github.com/lablup/backend.ai
- **Contributing Guidelines**: https://github.com/lablup/backend.ai/blob/main/.github/CONTRIBUTING.md
- **Migration Guide**: https://github.com/lablup/backend.ai/blob/main/MIGRATION.md
- **Development Agent Guide**: https://github.com/lablup/backend.ai/blob/main/CLAUDE.md
