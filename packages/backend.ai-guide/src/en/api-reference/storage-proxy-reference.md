---
title: Storage Proxy Reference
order: 169
---
# Storage Proxy Reference

The Storage Proxy is a dedicated microservice in the Backend.AI architecture that handles all file I/O operations between the platform and the underlying storage backends. It acts as an abstraction layer, providing a uniform interface regardless of the actual storage technology in use.

## Overview

In a Backend.AI cluster, the Manager and Agent components do not interact with storage backends directly. Instead, they delegate all file operations (uploads, downloads, directory management, quota enforcement) to the Storage Proxy. This design decouples compute orchestration from storage management, allowing you to swap or add storage backends without modifying the core platform.

:::note
The Storage Proxy API is an internal system interface used by the Manager and Agent. End users interact with storage through the [Virtual Folders REST API](manager-api-reference/manager-rest-api/virtual-folders.md) or the WebUI, both of which communicate with the Storage Proxy on your behalf.
:::

## Architecture

The Storage Proxy sits between the Manager/Agent and the physical storage systems. When a user requests a file operation (e.g., uploading a file to a virtual folder), the request flows through the following path:

1. The client sends the request to the Manager REST API
2. The Manager authenticates the request and resolves the target storage backend
3. The Manager issues an internal request to the Storage Proxy
4. The Storage Proxy performs the operation on the actual storage backend
5. The result is returned through the same chain back to the client

| Component | Responsibility |
| --- | --- |
| Manager | Authentication, authorization, and routing of storage requests |
| Storage Proxy | Translation of abstract operations into backend-specific calls |
| Storage Backend | Physical data storage (filesystem, network storage, object store) |

## Supported Storage Backends

The Storage Proxy supports multiple storage backend types through a plugin architecture. Each backend has a dedicated volume driver that implements the required operations.

| Backend | Type | Description |
| --- | --- | --- |
| XFS | Local filesystem | Uses XFS project quotas for per-folder quota enforcement |
| CephFS | Distributed filesystem | Ceph distributed file system with native quota support |
| NetApp ONTAP | Network-attached storage | NetApp NAS with qtree-based volume management |
| PureStorage FlashBlade | Network-attached storage | Pure Storage all-flash file and object storage |
| GPFS / Spectrum Scale | Parallel filesystem | IBM parallel filesystem for high-performance computing |
| WekaFS | Parallel filesystem | High-performance parallel filesystem |
| VastData | Universal storage | VastData universal storage platform |

:::info
The set of available storage backends depends on your Backend.AI deployment and licensed plugins. Contact your administrator or Lablup to learn which backends are supported in your environment.
:::

## Key Operations

The Storage Proxy handles the following categories of operations:

### Volume Management

- **Create Volume**: Provisions a new storage volume (virtual folder) on the target backend. The proxy creates the underlying directory or quota tree structure specific to each backend type.
- **Delete Volume**: Removes a storage volume and its contents from the backend. This operation is irreversible.
- **Clone Volume**: Creates a copy of an existing volume, including all of its files and directory structure.
- **Get Volume Info**: Retrieves metadata about a volume, such as its current size and quota limits.

### Quota Management

- **Set Quota**: Configures storage quota limits for a specific volume. The implementation varies by backend (e.g., XFS project quotas, CephFS quotas, NetApp qtree limits).
- **Get Quota**: Retrieves the current quota settings and usage for a volume.

:::warning
Not all storage backends support quota management. If your backend does not support quotas, the Storage Proxy will report unlimited capacity for the volume. Consult your storage administrator for backend-specific limitations.
:::

### File Operations

- **Upload File**: Writes a file to the specified path within a volume. The Storage Proxy supports both single-shot uploads and chunked/resumable uploads via the tus protocol.
- **Download File**: Reads a file from the specified path and streams it to the client.
- **Create Directory**: Creates a new directory at the specified path within a volume.
- **List Directory**: Returns the contents (files and subdirectories) of a directory within a volume.
- **Delete File/Directory**: Removes a file or directory from a volume.
- **Move/Rename**: Moves or renames a file or directory within a volume.

### Scanning and Metadata

- **Scan Directory Tree**: Recursively scans a directory and returns a full tree structure of files and subdirectories.
- **Get File Stat**: Retrieves metadata (size, timestamps, permissions) for a specific file.

## API Protocol

The Storage Proxy exposes a REST-based HTTP API. Communication between the Manager and the Storage Proxy is authenticated using internal tokens issued by the Manager.

### Authentication

| Mechanism | Description |
| --- | --- |
| Manager Token | The Manager generates short-lived tokens for each Storage Proxy request. These tokens encode the user identity and authorized operations. |
| mTLS (optional) | In production deployments, mutual TLS can be configured between the Manager and Storage Proxy for transport-level security. |

### Base URL

The Storage Proxy listens on a configurable address and port. The default configuration uses:

```text
https://<storage-proxy-host>:6021/
```

The Manager resolves the correct Storage Proxy address based on the storage host configuration for each virtual folder.

## Configuration

The Storage Proxy is configured through a TOML configuration file. Key configuration sections include:

| Section | Description |
| --- | --- |
| `etcd` | Connection settings for the etcd cluster used for service discovery |
| `storage-proxy` | Network binding address, TLS certificate paths, and authentication settings |
| `volume` | Backend-specific volume driver configurations and mount points |

**Example configuration snippet:**

```toml title="storage-proxy.toml"
[etcd]
addr = ["localhost:2379"]
namespace = "local"

[storage-proxy]
node-id = "storage-proxy-01"
num-proc = 4
pid-file = "/var/run/backend.ai/storage-proxy.pid"

[volume]
default-host = "local:volume1"

[volume.local]
backend = "xfs"
path = "/vfroot/local"
```

## Relationship to Other Components

The Storage Proxy interacts with the following Backend.AI components:

- **Manager**: Routes all user-initiated storage operations to the appropriate Storage Proxy instance. The Manager maintains the mapping between storage hosts and Storage Proxy addresses.
- **Agent**: Mounts virtual folder volumes into session containers. The Agent may communicate with the Storage Proxy to resolve volume paths and verify access permissions.
- **etcd**: The Storage Proxy registers itself with etcd for service discovery, allowing the Manager to locate available Storage Proxy instances.

:::note
For high availability, you can deploy multiple Storage Proxy instances across different nodes. Each instance can serve different storage backends or provide redundancy for the same backend.
:::
