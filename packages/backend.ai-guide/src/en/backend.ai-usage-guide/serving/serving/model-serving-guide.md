---
title: Serving Page
order: 81
---
# Serving Page

The Serving page displays all model serving endpoints in your current project. You can create new endpoints, monitor their status, and manage existing services from this page.

<!-- TODO: Capture screenshot of the Serving (endpoint list) page -->

## Endpoint List

The endpoint list table shows the following information for each service:

- **Endpoint Name**: The name of the service. Click the name to navigate to the endpoint detail page.
- **Endpoint ID**: A unique identifier for the endpoint.
- **Service Endpoint**: The URL where the model is accessible for inference requests. You can copy this URL or open it in a new browser tab.
- **Status**: The current state of the endpoint (e.g., READY, PROVISIONING, DESTROYED).
- **Owner**: The user who created the endpoint (visible to administrators).
- **Created At**: The date and time when the endpoint was created.
- **Number of Replicas**: The number of inference session replicas running for this endpoint.
- **Routings Count**: The count of active (healthy) routes versus total routes.
- **Public**: Indicates whether the endpoint is open to public access.

## Endpoint Controls

Each endpoint in the list provides the following actions:

- **Edit** (gear icon): Opens the service launcher page to modify the endpoint configuration including resources, replicas, image, and environment variables.
- **Delete** (trash icon): Terminates the endpoint. You will be asked to confirm before deletion. This action cannot be undone.

:::warning
Deleting an endpoint is irreversible. All inference sessions associated with the endpoint will be terminated, and the service URL will no longer be accessible.
:::

## Endpoint Detail Page

Click an endpoint name to view its detail page. The detail page shows comprehensive information organized into several sections:

### Service Info

Displays the core configuration of the endpoint:

- **Endpoint Name**, **Status**, **Endpoint ID**, **Session Owner**
- **Number of Replicas**: The desired replica count for this service.
- **Service Endpoint**: The inference URL. If the endpoint is healthy, you can also launch an LLM Chat Test directly.
- **Open To Public**: Whether the endpoint accepts unauthenticated requests.
- **Resources**: The resource group and allocated resources (CPU, memory, GPU) per replica.
- **Model Storage**: The storage folder containing the model files, along with its mount destination path.
- **Additional Mounts**: Any extra storage folders mounted to the inference sessions.
- **Environment Variable**: Environment variables configured for the service.
- **Image**: The container image used for inference.

You can click the **Edit** button to modify the service configuration.

### Auto-Scaling Rules

If your deployment supports auto-scaling, you can define rules that automatically adjust the number of replicas based on metrics. Each rule includes:

- **Scaling Type**: Up or Down, determined by the step size direction.
- **Metric Source**: The source of the metric being monitored (e.g., KERNEL).
- **Condition**: The metric name, comparator, and threshold that triggers scaling.
- **Step Size**: How many replicas to add or remove when the rule triggers.
- **MIN/MAX Replicas**: The boundary limits for scaling.
- **Cool Down Seconds**: The minimum time between consecutive scaling actions.

### Generated Tokens

Manage API tokens for authenticating requests to this endpoint. Click **Generate Token** to create a new token with a configurable expiration date (7 days, 30 days, 90 days, or a custom date).

### Routes Info

View the routing table showing individual inference session routes, their status (HEALTHY, PROVISIONING, UNHEALTHY), session IDs, and traffic ratios. You can click **Sync routes** to synchronize the routing table with the current state of the backend.
