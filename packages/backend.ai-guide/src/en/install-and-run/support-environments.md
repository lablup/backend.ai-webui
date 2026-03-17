---
title: Supported Environments
order: 25
---
# Supported Environments

Backend.AI supports a wide range of hardware, operating systems, and storage solutions. This page summarizes the supported environments for both the Backend.AI server infrastructure and the WebUI client.

## Supported Operating Systems (Server)

The following operating systems are supported for running Backend.AI server components (manager, agents, and storage proxies).

| Operating System | Minimum Version | Recommended Version |
| --- | --- | --- |
| Ubuntu | 22.04 | 24.04 |
| RHEL | 8 | 9+ |
| Alma Linux | 9 | 9+ |

:::note
Backend.AI server components require Python 3.12 or later as of version 24.03 and above.
:::

## Supported Accelerator Types

Backend.AI supports the following accelerator hardware through its plugin system.

### NVIDIA (CUDA)

All NVIDIA GPUs that support CUDA 8.0 and above are compatible. Common GPU models include:

| Series | Models |
| --- | --- |
| Consumer | RTX 4090 |
| Data Center | A100, DGX |
| Data Center (Next-gen) | H100, HGX |
| Data Center (Latest) | B100, B200 |

Backend.AI also supports fractional GPU (fGPU) for NVIDIA GPUs through the Backend.AI Virtual CUDA API Layer Plugin, enabling GPU sharing across multiple sessions.

### AMD

AMD ROCm-compatible GPUs (e.g., MI250X) are supported through the Backend.AI ROCm Plugin.

### Intel

Intel Gaudi 2 accelerators are supported through the Backend.AI Gaudi 2 Plugin.

### Graphcore

Graphcore IPU accelerators are supported through the Backend.AI IPU Plugin.

### Furiosa AI

- **Warboy**: Supported through the Backend.AI Warboy Plugin.
- **RNGD**: Supported through the Backend.AI RNGD Plugin.

### Rebellions

- **ATOM**: Supported through the Backend.AI ATOM Plugin.
- **ATOM+**: Supported through the Backend.AI ATOM+ Plugin.
- **ATOM Max**: Supported through the Backend.AI ATOM Max Plugin.

### Other

- **Hyperaccel LPU**: Supported through the Backend.AI Hyperaccel LPU Plugin.
- **Google Cloud TPU**: Supported on Google Cloud instances with Cloud TPU enabled and bound.

## Supported High-Performance Storage Types

Backend.AI integrates with the following enterprise storage solutions for high-performance data access.

| Storage Solution | Notes |
| --- | --- |
| WekaFS | High-performance parallel file system |
| Pure Storage | Enterprise all-flash storage |
| VAST Data | Universal storage platform |
| NetApp | Enterprise data management |
| Ceph | Open-source distributed storage |
| DDN | High-performance parallel storage |

:::info
Storage support availability depends on your Backend.AI edition and configuration. Contact your system administrator for details on which storage backends are configured in your cluster.
:::

## WebUI Client Requirements

### Supported Browsers

The Backend.AI WebUI is a modern web application that supports the following browsers:

| Browser | Minimum Version |
| --- | --- |
| Google Chrome | Latest 2 versions |
| Mozilla Firefox | Latest 2 versions |
| Apple Safari | Latest 2 versions |
| Microsoft Edge | Latest 2 versions (Chromium-based) |

:::warning
Internet Explorer and Opera Mini are not supported. For the best experience, use the latest version of Google Chrome.
:::

### Desktop Application

Backend.AI also provides an Electron-based desktop application that bundles the WebUI with a built-in WebSocket proxy. The desktop app is available for:

- **macOS**: macOS 11 (Big Sur) and later
- **Windows**: Windows 10 and later
- **Linux**: Ubuntu 20.04 and later (AppImage or deb package)

## Backend.AI Installation Requirements

The following components are required for a Backend.AI cluster installation:

| Component | Description |
| --- | --- |
| Docker | Container runtime for running compute sessions |
| PostgreSQL | Database system for Backend.AI metadata |
| ETCD | Distributed key-value store for configuration registry |
| Redis | Cache and temporary storage; also used for asynchronous communication between agents |

For detailed installation instructions, refer to the Backend.AI installation guide for your deployment method (Docker Compose, Kubernetes, or source installation).
