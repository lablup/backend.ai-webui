---
title: Deleting a Model Service
order: 104
---
# Deleting a Model Service

When you no longer need a model service, you can remove it using the Backend.AI CLI. Deleting a service terminates all associated routing sessions and removes the service endpoint.

## Deleting a Service

Use the `service destroy` command to delete a model service:

```shell
$ backend.ai service destroy SERVICE_NAME
```

You can also use the `rm` alias:

```shell
$ backend.ai service rm SERVICE_NAME
```

### Example

```shell
$ backend.ai service destroy my-inference-service
```

:::note
The CLI will prompt you for confirmation before deleting the service. You can bypass the confirmation prompt by adding the `-f` or `--force` flag:

```shell
$ backend.ai service destroy -f my-inference-service
```
:::

## What Happens When a Service Is Deleted

When you delete a model service:

- All routing sessions associated with the service are terminated.
- The service endpoint becomes unavailable immediately.
- Any in-flight inference requests may fail.
- Resources allocated to the service (CPU, memory, GPU) are released back to the resource group.

:::warning
Deleting a model service is irreversible. Once deleted, the service endpoint URL will no longer accept requests. Make sure no active clients depend on the service before proceeding.
:::

## Verifying Deletion

After deleting a service, you can confirm it has been removed by listing your services:

```shell
$ backend.ai service list
```

The deleted service should no longer appear in the output.
