---
title: Configuration
order: 14
---
# Configuration

## Shared config

Most cluster-level configurations are stored in an Etcd service. The Etcd server is also used for service discovery; when new agents boot up they register themselves to the cluster manager via etcd. For production deployments, we recommend to use an Etcd cluster composed of odd (3, 5, or higher) number of nodes to keep high availability.

## Local config

Each service component has a [TOML](https://toml.io/en/)-based local configuration. It defines node-specific configurations such as the agent name, the resource group where it belongs, specific system limits, the IP address and the TCP port(s) to bind their service traffic, and etc.

The configuration files are named after the service components, like `manager.toml`, `agent.toml`, and `storage-proxy.toml`. The search paths are: the current working directory, `~/.config/backend.ai`, and `/etc/backend.ai`.

:::info
**Note:** [The sample configurations in our source repository](https://github.com/lablup/backend.ai/tree/main/configs). Inside each component directory, `sample.toml` contains the full configuration schema and descriptions.
:::
