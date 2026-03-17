---
title: Agent API Reference
order: 168
---
# Agent API Reference

The Backend.AI Agent is a daemon process that runs on each agent node in the cluster. It exposes an internal RPC interface used exclusively by the Manager to orchestrate container lifecycle and monitor resource usage. These APIs are not directly accessible to end users or client applications.

## Overview

The Agent communicates with the Manager through a ZeroMQ-based RPC protocol. When the Manager needs to create, destroy, or inspect compute sessions on a particular node, it sends RPC commands to the Agent running on that node. The Agent then interacts with the local container runtime (e.g., Docker or containerd) to carry out the requested operations.

:::warning
The Agent API is an internal system interface. You cannot call it directly from client applications or the Backend.AI SDK. All user-facing operations should go through the [Manager API](manager-api-reference/manager-api-overview.md) instead.
:::

## Communication Architecture

The Manager-Agent communication follows a request-reply pattern over ZeroMQ sockets. Each Agent binds to a designated port and registers itself with the Manager upon startup. The Manager maintains a registry of all active Agents and routes commands to the appropriate node based on scheduling decisions.

| Component | Role |
| --- | --- |
| Manager | Sends RPC commands to Agents based on scheduling decisions |
| Agent | Receives commands, executes them on the local container runtime, and returns results |
| ZeroMQ | Provides the transport layer for low-latency, reliable messaging |

## Key Operations

The Agent handles the following categories of operations on behalf of the Manager:

### Container Lifecycle Management

- **Create Kernel**: Provisions a new container on the agent node using the specified kernel image, resource limits, and mount configurations. The Agent pulls the image if it is not already cached locally, creates the container, and starts the kernel runtime process inside it.
- **Destroy Kernel**: Terminates a running container and cleans up associated resources such as temporary volumes, network endpoints, and process state. The Agent reports final resource usage statistics back to the Manager.
- **Restart Kernel**: Stops and restarts the kernel process within an existing container without destroying the container itself. This preserves the container's resource allocation while resetting the execution environment.

### Resource Monitoring

- **Get Container Stats**: Collects real-time resource usage metrics from running containers, including CPU utilization, memory consumption, GPU usage, and network I/O. The Manager periodically polls Agents for these statistics to update the cluster-wide resource dashboard.
- **Resource Heartbeat**: The Agent periodically reports its total and available resources (CPU cores, memory, GPU devices) to the Manager. This information is used by the scheduler to make placement decisions for new sessions.

### Health Check

- **Heartbeat / Ping**: The Manager sends periodic health check messages to each Agent to verify that the node is alive and responsive. If an Agent fails to respond within a configured timeout, the Manager marks the node as unavailable and may reschedule affected sessions.

## Agent Lifecycle

The following table summarizes the key lifecycle events of an Agent:

| Event | Description |
| --- | --- |
| Startup | The Agent starts, detects available hardware resources (CPUs, GPUs, memory), and registers with the Manager |
| Heartbeat | The Agent sends periodic resource reports to the Manager at a configurable interval |
| Task Execution | The Agent receives and executes RPC commands from the Manager (create, destroy, restart kernels) |
| Shutdown | The Agent deregisters from the Manager and optionally terminates running containers |

## Configuration

The Agent is configured through a TOML configuration file or environment variables. Key configuration parameters include:

| Parameter | Description |
| --- | --- |
| `agent.rpc-listen-addr` | The ZeroMQ address on which the Agent listens for Manager commands |
| `agent.region` | The region identifier for the agent node |
| `agent.scaling-group` | The resource group to which this agent node belongs (note: the configuration key name uses the legacy term "scaling-group") |
| `container.scratch-root` | The local filesystem path used for temporary container storage |
| `resource.reserved-cpu` | The number of CPU cores reserved for system use and excluded from allocation |
| `resource.reserved-mem` | The amount of memory reserved for system use |

:::info
For detailed Agent configuration options, refer to the Backend.AI installation guide for your deployment method (Docker Compose, Kubernetes, or source installation).
:::

## Relationship to Other Components

The Agent works in conjunction with several other Backend.AI components:

- **Manager**: Issues commands to the Agent and aggregates resource information from all Agents in the cluster.
- **Storage Proxy**: The Agent may interact with the Storage Proxy to mount virtual folders (vfolders) into containers.
- **Container Registry**: The Agent pulls kernel images from configured container registries when creating new sessions.

:::note
If you are integrating with Backend.AI as a client or application developer, you should use the Manager REST API or GraphQL API. The Agent API details on this page are provided for architectural understanding and system administration purposes only.
:::
