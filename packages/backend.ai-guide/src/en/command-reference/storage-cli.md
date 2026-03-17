---
title: Storage CLI
order: 174
---
# Storage CLI

The Backend.AI Storage Proxy CLI provides commands for managing the Backend.AI Storage Proxy component. This tool handles volume management, quota configuration, and storage backend administration.

:::warning
The Storage CLI is intended for storage administrators who have direct access to the storage proxy host. It is not an end-user tool and should not be confused with the `backend.ai vfolder` commands in the Client CLI.
:::

## Usage Pattern

```shell
$ backend.ai storage <subcommand> [options]
```

## Volume Management

The Storage CLI allows you to manage storage volumes that back virtual folders (vfolders):

| Command | Description |
|---------|-------------|
| `backend.ai storage volume list` | List all configured storage volumes |
| `backend.ai storage volume info` | Show details of a specific volume |

Example: List all available storage volumes:

```shell
$ backend.ai storage volume list
```

## Quota Management

You can configure and inspect storage quotas for individual users and projects:

| Command | Description |
|---------|-------------|
| `backend.ai storage quota list` | List quota configurations |
| `backend.ai storage quota set` | Set a quota for a user or project |
| `backend.ai storage quota unset` | Remove a quota configuration |

Example: Set a 100 GB quota for a specific scope:

```shell
$ backend.ai storage quota set --scope-id SCOPE_ID --limit 100g
```

:::note
Quota enforcement depends on the underlying storage backend. Not all storage systems support quota settings. Compatible backends include XFS, CephFS, NetApp, and Purestorage.
:::

## Storage Backend Configuration

The Storage Proxy is configured through the `storage-proxy.toml` file. Key configuration sections include:

| Section | Description |
|---------|-------------|
| `[storage-proxy]` | Core proxy settings (bind address, manager authentication) |
| `[volume]` | Configured storage volumes and their mount points |
| `[backend]` | Backend-specific settings for each storage type |

## Starting the Storage Proxy

To start the Storage Proxy service:

```shell
$ backend.ai storage start-server
```

:::note
In production environments, the Storage Proxy is typically managed by a process supervisor (e.g., systemd) rather than started manually.
:::

## Additional Commands

Use the `--help` flag to explore all available subcommands:

```shell
$ backend.ai storage --help
```
