---
title: Model Serving
order: 53
---
# Model Serving

Backend.AI supports deploying trained models as inference API endpoints through its *Model Serving* feature. This allows end-users (such as AI-based mobile apps and web service backends) to make inference API calls against deployed models.

![](../images/model-serving-diagram.png)

:::note
The Model Service feature is supported in Enterprise version only and is officially available from version 23.09 onwards.
:::

## Overview

The Model Service extends the functionality of existing compute sessions, enabling automated maintenance, scaling, and permanent port and endpoint address mapping for production services. Developers or administrators only need to specify the scaling parameters required for the Model Service, without the need to manually create or delete compute sessions.

## Quick Steps to Use Model Serving

To use the Model Service, follow these steps:

1. **Create a model definition file** (`model-definition.yaml`): Define the model name, path, start command, port, and health check configuration.
2. **Create a service definition file** (`service-definition.toml`): Configure the runtime environment, resource allocation, and environment variables.
3. **Upload the definition files** to a model-type storage folder.
4. **Create the Model Service**: Click the **Start Service** button on the Model Serving page and configure the service settings.
5. **Generate tokens** (if the service is not public): Issue authentication tokens for endpoint access.
6. **Access the endpoint**: Share the service endpoint URL with end users for inference requests.

For detailed instructions on each step, refer to the [Session Management](../backend.ai-usage-guide/workload/sessions/session-management.md) section.

## Accessing the Endpoint

Once the model service is running and the status shows `HEALTHY`, you can access the endpoint using a simple `curl` command:

```bash
$ export API_TOKEN="<token>"
$ curl -H "Content-Type: application/json" -X GET \
  -H "Authorization: BackendAI $API_TOKEN" \
  <model-service-endpoint>
```

:::warning
By default, end users must be on a network that can access the endpoint. If the service was created in a closed network, only users within that network can access the service.
:::
