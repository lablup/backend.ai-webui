---
title: Command Line Interface
order: 180
---
# Command Line Interface

The Backend.AI Python SDK includes a built-in command-line interface (CLI) that
you can use to interact with a Backend.AI cluster directly from your terminal.
The CLI is installed automatically when you install the
`backend.ai-client` package.

## Command Structure

All CLI commands follow this pattern:

```text
backend.ai <command> [subcommand] [options] [arguments]
```

You can view the top-level help at any time:

```shell
$ backend.ai --help
```

## Main Command Groups

| Command Group | Description |
|---------------|-------------|
| `session` | Create, list, destroy, and manage compute sessions |
| `vfolder` | Create, list, upload to, download from, and delete storage folders |
| `image` | List and inspect available container images |
| `config` | Show the current client configuration |
| `keypair` | Manage API keypairs (admin) |
| `user` | Manage user accounts (admin) |
| `domain` | Manage domains (admin) |
| `group` | Manage projects (admin) |
| `resource-policy` | Manage resource policies (admin) |
| `scaling-group` | Manage resource groups (admin; note: the CLI command uses the legacy name "scaling-group") |
| `ps` | Shortcut to list running sessions |
| `run` | Shortcut to create and run a session |

:::note
Admin command groups such as `keypair`, `user`, and `domain` require
superadmin or domain admin privileges. They will return a permission error if
your keypair does not have sufficient access.
:::

## Global Options

| Option | Description |
|--------|-------------|
| `--help` | Show help for the command |
| `--version` | Print the SDK version |
| `--output` / `-o` | Set output format: `json`, `yaml`, or the default table format |
| `--debug` | Enable debug-level logging for troubleshooting |

By default, the CLI renders results as human-readable tables. You can switch
to machine-readable formats for scripting:

```shell
$ backend.ai session list -o json
```

## Environment Variables

The CLI reads its configuration from environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `BACKEND_ENDPOINT` | The API endpoint URL (e.g., `https://api.backend.ai`) | Yes |
| `BACKEND_ENDPOINT_TYPE` | Endpoint type: `api` or `session` | No (default: `api`) |
| `BACKEND_ACCESS_KEY` | Your API access key | Yes |
| `BACKEND_SECRET_KEY` | Your API secret key | Yes |
| `BACKEND_VFOLDER_MOUNTS` | Comma-separated list of vfolders to auto-mount | No |

:::info
For a detailed explanation of each variable, see the
[Client Configuration](../client-configuration.md) page.
:::

## Quick Examples

List running sessions:

```shell
$ backend.ai ps
```

Create and enter an interactive session:

```shell
$ backend.ai run -t python:3.10 -- /bin/bash
```

List storage folders:

```shell
$ backend.ai vfolder list
```

Upload a file to a storage folder:

```shell
$ backend.ai vfolder upload my-folder ./local-file.csv
```

## Further Reference

For comprehensive command-by-command documentation, refer to:

- **CLI User Guide** -- Covers everyday commands for session management,
  file operations, and image queries.
- **CLI Admin Guide** -- Covers administrative commands for user management,
  resource policies, and cluster configuration.
