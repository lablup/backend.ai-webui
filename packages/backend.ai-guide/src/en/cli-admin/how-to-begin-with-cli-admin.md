---
title: How to begin with CLI (Admin)
order: 107
---
# How to begin with CLI (Admin)

This section explains how to set up and start using the Backend.AI admin CLI. The admin CLI shares the same installation process as the user CLI, but requires an admin-level keypair to access administrative commands.

## Installation

Install the Backend.AI CLI client using `pip`:

```shell
$ pip install backend.ai-client
```

Verify the installation:

```shell
$ backend.ai version
```

## Setting Up Admin Credentials

You must configure your environment with admin-level API credentials. Set the following environment variables:

```shell
$ export BACKEND_ENDPOINT=https://api.backend.ai
$ export BACKEND_ACCESS_KEY=YOUR_ADMIN_ACCESS_KEY
$ export BACKEND_SECRET_KEY=YOUR_ADMIN_SECRET_KEY
```

:::tip
Add these variables to your shell profile (e.g., `~/.bashrc` or `~/.zshrc`) so they persist across terminal sessions.
:::

:::note
Your access key must belong to an admin or superadmin account. Regular user keypairs cannot execute admin commands.
:::

## Verifying Admin Access

After configuring your credentials, verify that you have admin access by running:

```shell
$ backend.ai admin user list
```

If your keypair has admin privileges, you will see a list of users. If you receive a permission error, confirm that the configured keypair belongs to an admin account.

## First Admin Commands to Try

Once your credentials are verified, try these commands to familiarize yourself with the admin CLI:

1. List all registered agent nodes:

   ```shell
   $ backend.ai admin agent list
   ```

2. List available container images:

   ```shell
   $ backend.ai admin image list
   ```

3. View existing domains:

   ```shell
   $ backend.ai admin domain list
   ```

4. Check resource policies:

   ```shell
   $ backend.ai admin resource-policy list
   ```

:::info
All admin commands follow the pattern `backend.ai admin <resource> <action>`. Use `--help` on any command to see available options and arguments.
:::
