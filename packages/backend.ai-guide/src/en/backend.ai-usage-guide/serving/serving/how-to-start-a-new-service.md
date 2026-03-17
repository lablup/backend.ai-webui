---
title: How to start a new service
order: 82
---
# How to Start a New Service

You can create a new model serving endpoint from the Serving page. The service launcher form guides you through configuring the model, runtime, resources, and other settings.

## Step-by-Step Guide

1. Navigate to the **Serving** page from the left sidebar.
2. Click the **Start New Service** button.
3. Fill in the service configuration form as described below.
4. Click **Create** to launch the service.

<!-- TODO: Capture screenshot of the service launcher page -->

## Service Configuration

The service launcher form is organized into two cards.

### Basic Settings

- **Service Name**: Enter a unique name for your service (4-24 characters). The name must start with a letter, number, or underscore, and can contain letters, numbers, underscores, and hyphens in the middle.
- **Open To Public**: Check this box to make the endpoint accessible without authentication tokens.
- **Model Storage to Mount**: Select the storage folder that contains your model files. Only folders with `model` usage mode are shown.
- **Inference Runtime Variant**: Choose the inference runtime to use for serving. Available options include:
   * **vLLM**: A high-throughput serving engine for large language models.
   * **SGLang**: A structured generation language runtime.
   * **NIM**: NVIDIA Inference Microservice runtime.
   * **Custom**: Use a custom model definition file for full control over the serving configuration.
- **Model Mount Destination**: (Custom runtime only) The path inside the container where the model folder will be mounted. Defaults to `/models`.
- **Model Definition File Path**: (Custom runtime only) The path to the `model-definition.yaml` file within the model folder.
- **Environment Variable**: Add key-value pairs for environment variables. Some runtime variants automatically suggest required and optional variables.
- **Additional Mounts**: Optionally mount extra storage folders to the inference session.

### Resource Settings

- **Number of Replicas**: Set the number of inference session replicas. The maximum value is determined by your resource policy.
- **Image**: Select the container image and version to use for inference sessions.
- **Resource Allocation**: Configure CPU, memory, GPU, and shared memory for each replica. You can use resource presets or customize the allocation.

## Validating Your Configuration

Before creating the service, you can click the **Validate** button to check whether your configuration is valid. This opens a validation dialog that verifies the model definition files and resource availability.

:::note
The model storage folder should contain a `model-definition.yaml` file (or `model-definition.yml`) that defines how the model should be served. For the **Run this model** feature in the Model Store, a `service-definition.toml` file is also required.
:::

## After Creation

Once the service is created successfully, you will be redirected to the Serving page. The new endpoint will appear in the list with a PROVISIONING status. Once the inference sessions are healthy, the status changes to READY and a service endpoint URL becomes available.

<!-- TODO: Capture screenshot of a newly created endpoint in PROVISIONING status -->
