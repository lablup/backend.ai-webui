---
title: CLI (Admin)
order: 106
---
# CLI (Admin)

The Backend.AI admin CLI provides a set of commands for managing platform resources, users, and policies. These commands are accessed through the `backend.ai admin` subcommand and require an admin or superadmin keypair.

## Prerequisites

To use admin CLI commands, you must have:

- The Backend.AI CLI client installed (`pip install backend.ai-client`)
- An admin-level or superadmin-level keypair configured

:::warning
Admin commands are not available to regular user keypairs. If you receive a permission error, verify that your keypair has the appropriate admin privileges.
:::

## Admin Command Groups

The `backend.ai admin` subcommand is organized into the following command groups:

| Command Group | Description |
|---------------|-------------|
| `user` | Create, list, update, and deactivate user accounts |
| `group` | Manage projects within domains |
| `domain` | Create and configure organizational domains |
| `resource-policy` | Define and assign resource usage policies |
| `agent` | View and manage agent nodes in the cluster |
| `image` | List, rescan, and configure container images |
| `announcement` | Create and manage WebUI announcements |
| `keypair` | Manage API keypairs for user authentication |
| `vfolder` | Manage storage folders across all users |
| `storage` | View and configure storage backends |

## Quick Reference

Below is a quick reference of commonly used admin commands:

| Task | Command |
|------|---------|
| List all users | `backend.ai admin user list` |
| List all agents | `backend.ai admin agent list` |
| Rescan container images | `backend.ai admin image rescan` |
| List resource policies | `backend.ai admin resource-policy list` |
| Create an announcement | `backend.ai admin announcement create` |
| List domains | `backend.ai admin domain list` |
| List projects in a domain | `backend.ai admin group list DOMAIN` |

## Getting Help

You can view detailed help for any admin command by appending `--help`:

```shell
$ backend.ai admin --help
$ backend.ai admin user list --help
```

For more detailed instructions on specific admin tasks, refer to the subsequent sections in this guide.
