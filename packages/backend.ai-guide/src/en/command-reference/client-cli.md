---
title: Client CLI
order: 171
---
# Client CLI

The Backend.AI Client CLI (`backend.ai`) is the primary command-line tool for interacting with the Backend.AI platform. It provides access to session management, storage operations, image inspection, model serving, and administrative functions.

## Usage Pattern

```shell
$ backend.ai <command> [subcommand] [options]
```

## Global Options

The following options are available across all commands:

| Option | Description |
|--------|-------------|
| `--help` | Display help for a command |
| `--output json` | Output results in JSON format |
| `--output table` | Output results in table format (default) |
| `--endpoint-url URL` | Override the API endpoint URL |

## Command Groups

### Session Management

| Command | Description |
|---------|-------------|
| `backend.ai session create` | Create a new compute session |
| `backend.ai session list` | List active sessions |
| `backend.ai session destroy` | Terminate a running session |
| `backend.ai session info` | Show details of a specific session |
| `backend.ai ps` | Shorthand for listing active sessions |

### Storage Folders

| Command | Description |
|---------|-------------|
| `backend.ai vfolder create` | Create a new storage folder |
| `backend.ai vfolder list` | List all storage folders |
| `backend.ai vfolder delete` | Delete a storage folder |
| `backend.ai vfolder upload` | Upload files to a storage folder |
| `backend.ai vfolder download` | Download files from a storage folder |

### Container Images

| Command | Description |
|---------|-------------|
| `backend.ai image list` | List available container images |
| `backend.ai image info` | Show details of a specific image |

### Model Serving

| Command | Description |
|---------|-------------|
| `backend.ai service create` | Create a new model serving endpoint |
| `backend.ai service list` | List active model services |
| `backend.ai service update` | Update a model service configuration |
| `backend.ai service delete` | Delete a model service |

### Application Access

| Command | Description |
|---------|-------------|
| `backend.ai app` | Access application services running inside sessions |

### Configuration and Utilities

| Command | Description |
|---------|-------------|
| `backend.ai config` | Display current client configuration |
| `backend.ai dotfile` | Manage dotfiles auto-loaded into sessions |
| `backend.ai ssh` | Connect to a running session via SSH |

### Administration

| Command | Description |
|---------|-------------|
| `backend.ai admin` | Access admin subcommands (requires admin keypair) |

:::info
For admin-specific commands, refer to the [CLI (Admin)](#cli-admin) section. Admin commands require an admin or superadmin keypair.
:::

## Examples

```shell
$ backend.ai config
$ backend.ai session list --output json
$ backend.ai session create --help
```
