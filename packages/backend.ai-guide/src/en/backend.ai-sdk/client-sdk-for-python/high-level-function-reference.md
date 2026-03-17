---
title: High-level Function Reference
order: 187
---
# High-level Function Reference

The Backend.AI Python SDK provides high-level async functions that simplify
common operations such as managing compute sessions, storage folders, and
container images. These functions wrap the underlying REST API calls and handle
authentication, request signing, and response parsing for you.

## Key Classes

The high-level API is organized around a small set of resource classes:

- **`ComputeSession`** -- Create, inspect, and destroy compute sessions.
- **`VFolder`** -- Manage virtual (storage) folders and their contents.
- **`Image`** -- Query available container images registered on the server.
- **`KeyPair`** -- Manage API keypairs (admin only).
- **`User`** -- Manage user accounts (admin only).

All high-level calls are asynchronous. You invoke them inside an
`APISession` context manager, which handles connection setup and teardown.

## Using the API Session Context Manager

Every high-level operation must run within an `APISession` block. The context
manager reads your configuration from environment variables (or an explicit
`APIConfig` object) and creates a reusable HTTP session.

```python
from ai.backend.client.session import APISession

async with APISession() as api_session:
    result = await api_session.ComputeSession.hello()
    print(result)
```

:::note
If you have not configured environment variables, you can pass an `APIConfig`
instance directly to `APISession()`. See the
[Client Configuration](client-configuration.md) page for details.
:::

## Session Management

You can create, list, and destroy compute sessions through `ComputeSession`.

```python
async with APISession() as api_session:
    session = await api_session.ComputeSession.create(
        image="cr.backend.ai/stable/python:3.10-ubuntu22.04",
        name="my-session",
        resources={"cpu": "2", "mem": "4g"},
    )

    sessions = await api_session.ComputeSession.paginated_list(status="RUNNING")
    await api_session.ComputeSession.destroy(session["sessionId"])
```

## Virtual Folder Management

Use the `VFolder` resource to manage storage folders.

```python
async with APISession() as api_session:
    await api_session.VFolder.create("my-data")
    await api_session.VFolder("my-data").upload(["/local/data.csv"], basedir=".")
    await api_session.VFolder("my-data").download(["data.csv"], dest="./downloads")
    await api_session.VFolder("my-data").delete()
```

:::warning
Deleting a storage folder is irreversible. All data stored in the folder will
be permanently removed.
:::

## Image Queries

You can list the container images available on the server.

```python
async with APISession() as api_session:
    images = await api_session.Image.list()
    for img in images:
        print(img["name"], img["tag"], img["registry"])
```

## Admin Functions

Admin-level operations require superadmin or domain admin privileges.

```python
async with APISession() as api_session:
    users = await api_session.User.list()
    keypairs = await api_session.KeyPair.list()
```

:::info
Admin functions will raise a permission error if the current keypair does not
have sufficient privileges. Ensure you are using an admin-level keypair.
:::

## Error Handling

All high-level functions raise SDK-specific exceptions on failure. Wrap your
calls in `try`/`except` blocks to handle errors gracefully.

```python
from ai.backend.client.exceptions import BackendAPIError

async with APISession() as api_session:
    try:
        await api_session.ComputeSession.destroy("nonexistent-id")
    except BackendAPIError as e:
        print(f"API error: {e.status} {e.reason}")
```
