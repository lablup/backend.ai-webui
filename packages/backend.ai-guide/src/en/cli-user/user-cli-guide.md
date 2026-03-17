---
title: CLI (User)
order: 95
---
# CLI (User)

The `backend.ai` command-line tool provides terminal access to all Backend.AI features. You can manage compute sessions, storage folders, container images, and model services directly from your terminal without using the web interface.

## Installation

You can install the Backend.AI CLI client using `pip`:

```shell
$ pip install backend.ai-client
```

After installation, verify that the client is available:

```shell
$ backend.ai version
```

## Configuration

Before using the CLI, you must configure your connection credentials using environment variables:

```shell
$ export BACKEND_ENDPOINT=https://api.backend.ai
$ export BACKEND_ACCESS_KEY=YOUR_ACCESS_KEY
$ export BACKEND_SECRET_KEY=YOUR_SECRET_KEY
```

:::tip
You can add these environment variables to your shell profile (e.g., `~/.bashrc` or `~/.zshrc`) so they are set automatically on every terminal session.
:::

## Command Groups

The Backend.AI CLI is organized into the following command groups:

| Command Group | Description |
|---------------|-------------|
| `session` | Create, list, and manage compute sessions |
| `vfolder` | Create and manage storage folders |
| `image` | List and inspect available container images |
| `service` | Create and manage model serving endpoints |
| `app` | Access application services running inside sessions |
| `dotfile` | Manage dotfiles that are auto-loaded into sessions |
| `ssh` | Connect to running sessions via SSH |

## Quick Reference

Below is a quick reference of commonly used commands:

| Task | Command |
|------|---------|
| List running sessions | `backend.ai ps` |
| Create a session | `backend.ai session create IMAGE` |
| Terminate a session | `backend.ai session destroy SESSION_ID` |
| List storage folders | `backend.ai vfolder list` |
| Create a storage folder | `backend.ai vfolder create FOLDER_NAME` |
| List available images | `backend.ai image list` |
| Create a model service | `backend.ai service create ...` |
| SSH into a session | `backend.ai session ssh SESSION_ID` |

## Getting Help

You can view help for any command by appending `--help`:

```shell
$ backend.ai --help
$ backend.ai session create --help
```

For more detailed instructions on each topic, refer to the subsequent sections in this guide.
