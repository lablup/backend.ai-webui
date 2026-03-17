---
title: Updating a Model Service
order: 103
---
# Updating a Model Service

You can update the configuration of an existing model service using the Backend.AI CLI. This allows you to adjust scaling, resource allocation, and other parameters without recreating the service.

## Updating a Service

Use the `service update` command to modify a running service:

```shell
$ backend.ai service update [OPTIONS] SERVICE_NAME
```

### Modifiable Parameters

| Option | Description |
|--------|-------------|
| `--desired-routing-count` | Adjust the number of active routing sessions |
| `--min-replicas` | Update minimum number of worker replicas |
| `--max-replicas` | Update maximum number of worker replicas |
| `--image` | Change the container image used by the service |

## Example: Scaling Up Workers

To increase the number of routing sessions for a service:

```shell
$ backend.ai service update my-inference-service \
    --desired-routing-count 3
```

This scales the service to run 3 concurrent routing sessions to handle increased traffic.

## Example: Changing the Container Image

To update the image used by the service:

```shell
$ backend.ai service update my-inference-service \
    --image cr.backend.ai/stable/python:3.12-ubuntu24.04
```

## Service Update Behavior

When you update a service, Backend.AI applies changes using a rolling update strategy:

- New routing sessions are created with the updated configuration.
- Existing sessions are gradually replaced as new ones become ready.
- The service remains available during the update process, minimizing downtime.

:::note
Some parameter changes (such as changing the container image) may require existing routing sessions to be replaced entirely. During this transition, there may be a brief period of reduced capacity.
:::

:::warning
Verify that the new configuration is valid before applying an update. For example, if you change the image, ensure that the new image is compatible with your model and serving code.
:::
