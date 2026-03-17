---
title: Creating a Model Service
order: 102
---
# Creating a Model Service

You can create a model service (inference endpoint) using the Backend.AI CLI. A model service deploys a trained model as an HTTP endpoint that can serve inference requests.

## Creating a Service

Use the `service create` command to create a new model service:

```shell
$ backend.ai service create [OPTIONS] SERVICE_NAME IMAGE
```

### Required Parameters

- `SERVICE_NAME`: A unique name for the model service.
- `IMAGE`: The container image to use for the service.

### Common Options

| Option | Description |
|--------|-------------|
| `--model-folder` | Name of the storage folder containing the model |
| `--model-mount-destination` | Mount path for the model inside the container |
| `-r, --resources KEY=VAL` | Resource allocation (e.g., `-r cpu=2 -r mem=4096`) |
| `--min-replicas` | Minimum number of worker replicas |
| `--max-replicas` | Maximum number of worker replicas |
| `--desired-routing-count` | Desired number of active routing sessions |

## Example: Creating a Simple Inference Endpoint

The following example creates a model service with specified resources and a model storage folder:

```shell
$ backend.ai service create my-inference-service \
    cr.backend.ai/stable/python:3.11-ubuntu22.04 \
    --model-folder my-model-folder \
    --model-mount-destination /models \
    -r cpu=2 -r mem=4096 -r cuda.shares=1 \
    --desired-routing-count 1
```

This creates a service named `my-inference-service` that:

- Uses the specified Python image
- Mounts the `my-model-folder` storage folder at `/models`
- Allocates 2 CPU cores, 4 GiB memory, and 1 fGPU
- Starts with 1 routing session

## Checking Service Status

After creating a service, you can check its status:

```shell
$ backend.ai service list
```

To view detailed information about a specific service:

```shell
$ backend.ai service info SERVICE_NAME
```

:::note
It may take a few moments for the service to become fully operational after creation. The status will transition from `PROVISIONING` to `HEALTHY` once the service is ready to accept requests.
:::

:::warning
Ensure that the storage folder specified by `--model-folder` exists and contains the required model files before creating the service. Otherwise, the service may fail to start.
:::
