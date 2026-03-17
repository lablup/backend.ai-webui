---
title: How to add a new environment variable to a service
order: 83
---
# How to Add a New Environment Variable to a Service

Environment variables allow you to pass configuration parameters to your model serving sessions. This is especially important for runtime-specific settings such as model paths, parallelism options, and quantization parameters.

## Adding Environment Variables When Creating a Service

1. On the service launcher page, scroll to the **Environment Variable** section.
2. Click the **Add** button to add a new row.
3. Enter the variable name in the **Variable** field and the value in the **Value** field.
4. Repeat for additional variables as needed.

<!-- TODO: Capture screenshot of the environment variable form section -->

## Runtime-Specific Environment Variables

When you select an inference runtime variant, the system automatically suggests required and optional environment variables for that runtime. These variables are pre-populated in the form.

### vLLM Runtime Variables

- **Model name**: The Hugging Face model identifier (e.g., `meta-llama/Llama-2-7b-chat-hf`).
- **Tensor parallel size**: Number of GPUs for tensor parallelism (e.g., `2`, `4`, `8`).
- **Pipeline parallel size**: Number of stages for pipeline parallelism (e.g., `2`, `4`).
- **Quantization**: Quantization method (e.g., `awq`, `gptq`, `fp8`).
- **Additional vLLM arguments**: Extra command-line arguments for the vLLM server.

### SGLang Runtime Variables

- **Model name**: The model identifier (e.g., `gpt-oss-20b`).
- **Tensor parallel size**: GPU count for tensor parallelism.
- **Pipeline parallel size**: Pipeline parallelism stages.
- **Quantization**: Quantization method (e.g., `awq`, `awq_marlin`, `gptq`, `int4`, `fp8`).
- **Extra arguments**: Additional command-line arguments.

:::warning
If you switch the runtime variant after setting environment variables, a warning will appear for variables that belong to a different runtime. Review your environment variables after changing the runtime to ensure they are appropriate.
:::

## Editing Environment Variables on an Existing Service

1. Navigate to the endpoint detail page by clicking the endpoint name on the Serving page.
2. Click the **Edit** button in the Service Info card.
3. Modify the environment variables in the **Environment Variable** section.
4. Click **Update** to apply the changes.

:::note
When editing a service, environment variable changes take effect on the next replica restart. Existing running sessions will continue using the previous configuration until they are replaced.
:::
