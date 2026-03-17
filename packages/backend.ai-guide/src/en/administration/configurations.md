---
title: Configurations
order: 117
---
# Configurations

The Configurations page allows superadmins to view and manage system-wide settings for the Backend.AI cluster. You can access this page by selecting **Configurations** from the administration section in the sidebar menu.

![](../images/configurations_page.png)
<!-- TODO: Capture screenshot -->

The page provides a searchable list of settings organized into three groups. You can use the search bar at the top to filter settings by name, and toggle the **Display Only Changes** filter to view only settings that differ from their defaults.

## General

The General settings section contains core system configuration options.

### Image Auto Install / Update Rule

Controls how Backend.AI handles new container images when a new version is registered in the registry. Select one of the following behaviors:

- **Digest**: Automatically download new images when a new version is detected by digest comparison. This is the default and recommended setting.
- **Tag**: Automatically download images based on tag changes.
- **None**: Do not automatically download new images. You must manually trigger image updates.

### Overlay Network

Click the **Config** button to open the Overlay Network settings modal. An overlay network is a distributed network layered on top of the underlying Docker daemon host network, used by the Backend.AI manager for inter-container communication.

- **MTU**: Maximum Transmission Unit, the size of the largest packet that the network protocol can transmit.

### Scheduler

Click the **Config** button to open the Scheduler settings modal. This configures the default job scheduler behavior used when a resource group does not have its own scheduler configuration.

- **Scheduler type**: Select the scheduling algorithm (FIFO, LIFO, or DRF).
- **Session creation retries**: The number of times Backend.AI retries session creation if it fails. If the session cannot be created within the specified retries, the request is skipped and the next request is processed.

:::note
If a resource group has its own scheduler setting, the resource group setting takes precedence over this global default.
:::

## Plugins

The Plugins section displays the status of accelerator plugins currently installed on the system. These settings are automatically determined by the installation environment and cannot be changed through the WebUI.

- **Open Source CUDA GPU support**: Shows whether NVIDIA CUDA GPU support is enabled. Requires the Backend.AI CUDA Plugin.
- **ROCm GPU support**: Shows whether AMD ROCm GPU support is enabled. Requires the Backend.AI ROCm Plugin.

:::info
The settings in this section are read-only and reflect the current plugin installation status. To change plugin availability, update your Backend.AI cluster configuration.
:::

## Enterprise Features

The Enterprise Features section displays the status of enterprise-grade accelerator plugins. Like the Plugins section, these settings are automatically applied based on the installation environment.

- **Fractional GPU**: GPU virtualization using the Backend.AI Virtual CUDA API Layer Plugin (fGPU).
- **TPU**: Google Cloud TPU accelerator support.
- **IPU**: Graphcore IPU accelerator support.
- **ATOM**: Rebellions ATOM accelerator support.
- **ATOM+**: Rebellions ATOM+ accelerator support.
- **ATOM Max**: Rebellions ATOM Max accelerator support.
- **Gaudi 2**: Intel Gaudi 2 accelerator support.
- **Warboy**: Furiosa Warboy accelerator support.
- **RNGD**: Furiosa RNGD accelerator support.
- **Hyperaccel LPU**: Hyperaccel LPU accelerator support.

Each item shows a checkbox indicating whether the corresponding plugin is active. These checkboxes are read-only and reflect the current system state.

