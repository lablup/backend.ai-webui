---
title: Agent CLI
order: 173
---
# Agent CLI

The Backend.AI Agent CLI (`backend.ai agent`) provides commands for managing the Backend.AI Agent process on agent nodes. This tool is used to start, stop, and diagnose the agent daemon that runs containers for compute sessions.

:::warning
The Agent CLI is intended for infrastructure operators who have direct access to agent node hosts. It is not an end-user tool.
:::

## Usage Pattern

```shell
$ backend.ai agent <subcommand> [options]
```

## Starting the Agent

To start the Backend.AI Agent daemon on an agent node:

```shell
$ backend.ai agent start-server
```

The agent reads its configuration from `agent.toml` and registers itself with the Backend.AI Manager.

:::note
In production deployments, the agent is typically managed by a process supervisor (e.g., systemd) rather than started manually from the command line.
:::

## Stopping the Agent

To gracefully stop the agent daemon:

```shell
$ backend.ai agent stop-server
```

This allows currently running sessions to continue until they complete or are explicitly terminated.

## Configuration

The agent is configured through the `agent.toml` file. Key configuration sections include:

| Section | Description |
|---------|-------------|
| `[agent]` | Core agent settings (ID, resource group, mode) |
| `[container]` | Container runtime settings (sandbox type, memory limits) |
| `[resource]` | GPU and accelerator resource configuration |
| `[network]` | Network settings for manager communication |

To validate the agent configuration before starting:

```shell
$ backend.ai agent config validate
```

## Diagnostics

You can gather diagnostic information about the agent node using:

```shell
$ backend.ai agent diagnostics
```

This reports the current status of the agent, available resources, and any detected issues with the compute environment.

## Additional Commands

Use the `--help` flag to discover all available subcommands:

```shell
$ backend.ai agent --help
```
