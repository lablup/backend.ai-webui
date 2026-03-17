---
title: Using SSH in a Compute Session
order: 101
---
# Using SSH in a Compute Session

Backend.AI supports direct SSH connections to running compute sessions. This allows you to use your preferred terminal tools, editors, and workflows inside the session environment.

## Prerequisites

Before connecting via SSH, ensure the following:

- The compute session is in a **running** state.
- The session image supports the SSH service (most official images do).
- The Backend.AI CLI client is installed and configured on your local machine.

## Connecting to a Session via SSH

Use the `session ssh` command to open an SSH connection to your running session:

```shell
$ backend.ai session ssh SESSION_ID_OR_NAME
```

### Example

```shell
$ backend.ai session ssh my-training-session
```

This opens an interactive SSH shell inside the specified session.

## SSH Keypair Management

Backend.AI manages SSH keypairs for session access. You can generate and manage your SSH keypairs using the `keypair` commands:

```shell
$ backend.ai ssh generate-keypair
```

:::note
The generated SSH keypair is stored in your Backend.AI account and is automatically used when connecting to sessions. You do not need to manually configure SSH keys.
:::

## Port Forwarding

You can forward local ports to services running inside the session using the `app` command. This is useful for accessing web-based tools such as Jupyter Notebook or TensorBoard.

```shell
$ backend.ai app SESSION_ID_OR_NAME -b PORT_NUMBER
```

### Example

```shell
$ backend.ai app my-session -b 8888
```

This forwards local port 8888 to port 8888 inside the session, allowing you to access services at `http://localhost:8888`.

## Example Workflow

A typical SSH workflow involves the following steps:

1. Create a compute session:
   ```shell
   $ backend.ai session create -r cpu=4 -r mem=8192 cr.backend.ai/stable/python:3.11-ubuntu22.04
   ```

2. Check the session status:
   ```shell
   $ backend.ai ps
   ```

3. Connect via SSH:
   ```shell
   $ backend.ai session ssh SESSION_NAME
   ```

4. Run your commands inside the session and exit when done.

5. Terminate the session:
   ```shell
   $ backend.ai session destroy SESSION_NAME
   ```

:::warning
When you terminate a session, all data not saved to a mounted storage folder is lost. Make sure to save your work to a storage folder before ending the session.
:::
