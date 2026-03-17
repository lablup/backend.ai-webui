---
title: Serving
order: 80
---
# Serving

Backend.AI provides model serving capabilities that allow you to deploy trained models as inference endpoints. The Serving section in the WebUI is organized under the **Service** group in the left sidebar and consists of two main features:

- **Serving**: Create and manage model serving endpoints that expose your models as API services. You can configure replicas, resources, environment variables, and auto-scaling rules for each endpoint.
- **Model Store**: Browse, search, and manage pre-registered models available in your deployment. You can view model details, clone models to your own storage folders, and launch serving endpoints directly from the Model Store.

## Key Concepts

- **Endpoint**: A model serving endpoint is the access point for inference requests. Each endpoint runs one or more replicas (sessions) that serve the model.
- **Replica**: The number of inference sessions running behind an endpoint. You can scale replicas up or down to handle varying traffic loads.
- **Routing**: Each replica has a route that distributes inference traffic. Routes can be in HEALTHY, PROVISIONING, or UNHEALTHY status.
- **Token**: API access tokens generated for an endpoint to authenticate inference requests.
- **Runtime Variant**: The inference runtime used to serve the model (e.g., vLLM, NIM, SGLang, or custom).

## Navigation

You can access model serving features from the left sidebar:

- Click **Serving** to view and manage your model serving endpoints.
- Click **Model Store** to browse available models and launch services.

<!-- TODO: Capture screenshot of the sidebar showing Serving and Model Store menu items -->

:::note
Model serving features require appropriate resource policies and permissions configured by your administrator. The available runtime variants and resource limits may vary depending on your deployment configuration.
:::
