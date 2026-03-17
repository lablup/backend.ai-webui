---
title: Resource Presets
order: 166
---
# Resource Presets

Resource presets are predefined combinations of compute resources (CPU, memory, GPU, etc.) that simplify session creation. Instead of specifying individual resource values each time, you can select a preset that matches your workload requirements.

## Listing Resource Presets

- URI: `/resource/presets`
- Method: `GET`

Returns a list of available resource presets configured by the administrator. Each preset defines a named set of resource slot allocations.

### Parameters

This endpoint does not require any request body parameters.

:::note
The available presets may vary depending on your keypair's resource policy and the resource group you belong to. The API returns only the presets that are accessible to the requesting user.
:::

### Response

| HTTP Status Code | Description |
| --- | --- |
| 200 OK | The list of resource presets is successfully returned. |
| 401 Unauthorized | Authentication failed or the authorization header is missing. |

The response body contains a `presets` array, where each element has the following fields:

| Field | Type | Description |
| --- | --- | --- |
| `name` | `str` | The human-readable name of the resource preset. |
| `resource_slots` | `object` | A JSON object mapping resource slot keys to their allocated amounts. |

#### Resource Slot Keys

The `resource_slots` object uses the following standard keys:

| Key | Type | Description |
| --- | --- | --- |
| `cpu` | `str` | Number of CPU cores allocated (e.g., `"2"`) |
| `mem` | `str` | Amount of memory allocated in bytes (e.g., `"4294967296"` for 4 GiB) |
| `cuda.shares` | `str` | Number of fractional GPU (fGPU) shares allocated (e.g., `"0.5"`) |
| `cuda.devices` | `str` | Number of whole GPU devices allocated (e.g., `"1"`) |
| `rocm.devices` | `str` | Number of AMD ROCm GPU devices allocated |

:::info
Resource slot values are always represented as strings, even for numeric quantities. This allows for consistent handling of fractional values and large integers across different resource types.
:::

### Example

**Request:**

```bash
GET /resource/presets HTTP/1.1
Host: api.backend.ai
Content-Type: application/json
X-BackendAI-Version: v6.20220615
Authorization: BackendAI signMethod=HMAC-SHA256, credential=<access-key>:<signature>
Date: 20230101T00:00:00Z
```

**Response:**

```json
{
  "presets": [
    {
      "name": "small",
      "resource_slots": {
        "cpu": "2",
        "mem": "4294967296",
        "cuda.shares": "0"
      }
    },
    {
      "name": "medium",
      "resource_slots": {
        "cpu": "4",
        "mem": "8589934592",
        "cuda.shares": "0.5"
      }
    },
    {
      "name": "large",
      "resource_slots": {
        "cpu": "8",
        "mem": "17179869184",
        "cuda.shares": "1.0"
      }
    },
    {
      "name": "gpu-intensive",
      "resource_slots": {
        "cpu": "8",
        "mem": "34359738368",
        "cuda.devices": "2"
      }
    }
  ]
}
```

## Managing Resource Presets

Resource presets are created and managed by administrators through the GraphQL API. The REST API provides read-only access to the list of available presets.

### Creating Presets via GraphQL

Administrators can create new presets by sending a mutation to the `/admin/graphql` endpoint:

```graphql
mutation {
  create_resource_preset(name: "custom-preset", input: {
    resource_slots: "{\"cpu\": \"4\", \"mem\": \"8589934592\", \"cuda.shares\": \"1.0\"}"
  }) {
    ok
    msg
  }
}
```

### Modifying Presets via GraphQL

Existing presets can be updated using the `modify_resource_preset` mutation:

```graphql
mutation {
  modify_resource_preset(name: "custom-preset", input: {
    resource_slots: "{\"cpu\": \"8\", \"mem\": \"17179869184\", \"cuda.shares\": \"2.0\"}"
  }) {
    ok
    msg
  }
}
```

:::warning
Modifying a resource preset does not affect sessions that were already created using that preset. Changes apply only to new sessions created after the modification.
:::

## Using Presets When Creating Sessions

When creating a new session via the [Session Management](session-management.md) API, you can reference a resource preset in the `config` object instead of specifying individual resource values:

```json
{
  "image": "python:3.9-ubuntu20.04",
  "clientSessionToken": "my-session-01",
  "config": {
    "preset": "medium"
  }
}
```

If both a `preset` and explicit `resources` are specified in the `config`, the explicit resource values take precedence over the preset values.
