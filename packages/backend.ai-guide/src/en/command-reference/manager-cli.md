---
title: Manager CLI
order: 172
---
# Manager CLI

The Backend.AI Manager CLI (`backend.ai mgr`) provides server-side management commands for administering the Backend.AI Manager component. This tool is used for database operations, configuration validation, and schema management.

:::warning
The Manager CLI is intended for server administrators who have direct access to the Backend.AI Manager host. It is not an end-user tool and should not be confused with the Client CLI (`backend.ai`).
:::

## Usage Pattern

```shell
$ backend.ai mgr <subcommand> [options]
```

## Database Migration

The Manager CLI includes commands for managing database schema migrations using Alembic:

| Command | Description |
|---------|-------------|
| `backend.ai mgr schema show` | Display the current database schema revision |
| `backend.ai mgr schema oneshot` | Apply all pending migrations in a single operation |
| `backend.ai mgr schema upgrade` | Upgrade the database schema to a target revision |
| `backend.ai mgr schema downgrade` | Downgrade the database schema to a previous revision |

Example: Check the current schema revision:

```shell
$ backend.ai mgr schema show
```

Example: Apply all pending migrations:

```shell
$ backend.ai mgr schema oneshot
```

:::danger
Downgrading the database schema can result in data loss. Always back up your database before performing schema downgrades.
:::

## Configuration Validation

You can validate the Manager configuration to ensure all required settings are properly defined:

```shell
$ backend.ai mgr config validate
```

This command checks the `manager.toml` configuration file and reports any missing or invalid settings.

## Starting the Manager

To start the Backend.AI Manager process:

```shell
$ backend.ai mgr start-server
```

:::note
In production environments, the Manager is typically managed by a process supervisor (e.g., systemd) rather than started manually.
:::

## Additional Commands

Use the `--help` flag to discover all available subcommands and their options:

```shell
$ backend.ai mgr --help
```
