# Model Service

## Runtime Variants
In general, starting Model Service requires a definition file called `model-definition.yaml` set up separately under model folder ([ref](https://webui.docs.backend.ai/en/latest/model_serving/model_serving.html#creating-a-model-definition-file)). By setting Runtime Variant feature when creating the service, you can simply provision your model without writing down such files.    
A runtime variant definition is a set of health check endpoints and an open port number utilized by the inference runtime. This data is encapsulated within the Backend.AI manager and is not modifiable by either users or administrators.
Pinning a runtime variant does not imply that the Backend.AI Agent will automatically install all required dependencies and the actual inference runtime; rather, it is the responsibility of the image creator to ensure that the image includes all required components during the image baking process.

### Requirements
- Backend.AI with Model Service enabled (24.03.5 or above)
- Backend.AI Kernel Image packed with Runtime Variant support
  - NGC-NIM Images
  - vLLM Images (0.5.0 or above)
  - Or any other images with `CMD` set (see `Predefined Image Command` section below)

### Selecting runtime variant with API
When creating a new model service through a REST API, you can specify the runtime variant by including the `runtime_variant` parameter in the request body. Same parameter can also be used to update the runtime variant of an existing model service through a GQL Mutation; simply pass the value to the `runtime_variant` parameter within the `ModifyEndpointInput` object.
To determine the appropriate value to use, initiate with `GET /services/_/runtimes` REST API query. This will return a list of available runtime variants. Select a parameters listed under the `name` field and pass it to server when creating or modifying the model service.

### Runtime Variant List
- CUSTOM (Default)
  Performs steps described at `model-definition.yaml` file.
- Predefined Image Command
  Assumes `CMD` parameter defined at image as a command to start up the inference runtime. Health check is not supported when this runtime variant is used.
- VLLM
  Assumes `CMD` parameter defined at image as a command to start the vLLM runtime. Following environment variables are required:
    - `BACKEND_MODEL_NAME` (Required): fills out `--model-name` parameter of vLLM
    - `VLLM_QUANTIZATION` (Optional): fills out `--quantization`
    - `VLLM_TP_SIZE` (Optional): fills out `--tensor-parallel-size`
    - `VLLM_PP_SIZE` (Optional): fills out `--pipeline-parallel-size`
    - `VLLM_EXTRA_ARGS` (Optional): for cases when trying to pass extra parameters other than above, e.g. `VLLM_EXTRA_ARGS="--tokenizer=/models/custom-tokenizer --dtype=half"`
  The VLLM runtime variant becomes available only when the model checkpoints are prepared and placed at the root directory of the model folder.
- NGC-NIM
  Assumes Backend.AI Kernel image is based on NGC NIM image. Following environment variables are required:
    - `NGC_API_KEY` (Required): NGC API Key with access granted to NGC's model repository
