---
title: Model Service
order: 50
---
# Model Service

## Runtime Variant

In the standard Model Service execution flow, the model folder must contain a `model-definition.yaml` file to run the service ([ref](https://webui.docs.backend.ai/ko/latest/model_serving/model_serving.html#creating-a-model-definition-file)). By specifying a particular `runtime_variant` parameter when creating or modifying a Model Service, you can run a Model Service without the `model-definition.yaml` file.

### Requirements
- Backend.AI 24.03.5 or later (Model Service feature must be enabled)
- A Backend.AI kernel image that supports the Runtime Variant feature
  - NGC-NIM images
  - vLLM images (0.5.0 or later)
  - Other user-created images that require a `CMD` value to be specified (refer to the `Predefined Image Command` section below for details)

### Specifying a Runtime Variant via API
When creating a new Model Service using the REST API, you must include the `runtime_variant` parameter in the request body. To change the Runtime Variant of an existing Model Service using a GQL Mutation, set the `runtime_variant` parameter in the `ModifyEndpointInput` object. You can check the currently available Runtime Variants using the `GET /services/_/runtimes` REST API. The value specified in the `name` field of each Runtime Variant is the value you can use for the `runtime_variant` parameter.

### Runtime Variant Types
- CUSTOM (default)
  Reads the `model-definition.yaml` file, infers the model server startup command, and starts the Model Service.
- CMD
  Uses the CMD command specified in the image as the model server startup command to run the Model Service. Health Check is not supported when using this variant.
- VLLM
  Functions the same as CMD mode but configures the Health Check Endpoint based on the vLLM model server. To run a model in VLLM mode, you must meet the following requirements:
    - The checkpoint must exist under the root of the storage folder
    - Set the following environment variables:
      - BACKEND_MODEL_NAME: Corresponds to vLLM's `--model-name`
      - VLLM_QUANTIZATION (optional): Corresponds to vLLM's `--quantization`
      - VLLM_TP_SIZE (optional): Corresponds to vLLM's `--tensor-parallel-size`
      - VLLM_PP_SIZE (optional): Corresponds to vLLM's `--pipeline-parallel-size`
      - VLLM_EXTRA_ARGS (optional): Use this to pass additional parameters to vLLM beyond those listed above
      - Example: VLLM_EXTRA_ARGS="--tokenizer=/models/custom-tokenizer --dtype=half"
- NIM
  Functions the same as CMD mode but configures the Health Check Endpoint based on the NVIDIA NIM model server. To run a model in NIM mode, you must meet the following requirements:
    - Set the following environment variables:
      - NGC_API_KEY: An API key generated from an account with access to the NGC NIM Model Registry
