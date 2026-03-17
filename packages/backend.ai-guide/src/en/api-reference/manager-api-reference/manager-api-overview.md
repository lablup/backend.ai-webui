---
title: Manager API Reference
order: 153
---
# Manager API Reference

The Backend.AI Manager is the central control plane of the platform. It provides two primary API interfaces for interacting with the system: a REST API for session and resource management, and a GraphQL API for administrative operations and complex queries.

## API Interfaces

### REST API

The REST API handles core compute operations including session lifecycle management, code execution, and file operations. It follows standard HTTP conventions and uses JSON for request and response bodies.

Key capabilities of the REST API include:

- **Session Management**: Create, destroy, restart, and query compute sessions
- **Code Execution**: Execute code in query mode, batch mode, or streaming mode
- **Virtual Folder Operations**: Create, list, upload to, and download from storage folders
- **Resource Presets**: Query available resource allocation presets
- **Event Monitoring**: Subscribe to real-time session and system events

For detailed REST API documentation, see the [Manager REST API](manager-rest-api/rest-api-reference.md) section.

### GraphQL API

The GraphQL API is accessible at the `/admin/graphql` endpoint and is primarily used for administrative operations. It provides a flexible query interface that allows you to request exactly the data you need in a single request.

Key capabilities of the GraphQL API include:

- **User and Keypair Management**: Create, modify, and deactivate users and their API keypairs
- **Resource Policy Configuration**: Define and assign resource usage policies
- **Domain and Project Management**: Organize users and resources into domains and projects
- **Agent and Resource Group Monitoring**: Query cluster status and hardware availability
- **Image Management**: List, register, and configure kernel images
- **Storage Volume Administration**: Manage storage backends and quota policies

:::info
The Backend.AI WebUI uses the GraphQL API extensively for its admin panels. If you are building custom admin tools, the GraphQL API is the recommended interface for querying and mutating administrative data.
:::

## API Versioning

The Backend.AI API uses a versioning scheme in the format `vX.YYYYMMDD`, where:

- `X` is the major version number
- `YYYYMMDD` is the minor release date

For example, `v4.20190615` indicates major version 4 with a minor release on June 15, 2019.

You must specify the API version in every request using the `X-BackendAI-Version` header. The server will process the request according to the behavior defined for that version.

| Version | Description |
| --- | --- |
| `v2.YYYYMMDD` | Legacy version (deprecated) |
| `v3.YYYYMMDD` | Introduced rate limiting improvements |
| `v4.YYYYMMDD` | Current stable version with session enqueue, multi-container sessions |
| `v5.YYYYMMDD` | Introduced named sessions and session dependencies |
| `v6.YYYYMMDD` | Latest version with expanded session lifecycle and routing features |

:::note
When the major version changes, there may be breaking changes in request/response formats. Minor version updates (date changes) within the same major version are backward-compatible.
:::

## Base URL Structure

All API requests are made to the Manager's base URL. The typical structure is:

```text
https://<manager-host>:<port>/
```

- **REST API endpoints** are accessed at paths like `/session`, `/folders`, `/resource/presets`
- **GraphQL endpoint** is accessed at `/admin/graphql`
- **Version check** is available at the root path `/`

For local development environments, the default Manager address is typically `http://127.0.0.1:8081`.

## Content Type Requirements

| Requirement | Value |
| --- | --- |
| Request Content-Type | `application/json` |
| Response Content-Type | `application/json` (or `application/problem+json` for errors) |
| Character Encoding | UTF-8 |

All request bodies must be JSON-encoded, and all responses are returned as JSON.

## Common Concepts

Before using the API, familiarize yourself with the following foundational topics:

- **[Authentication](manager-api-common-concepts/authentication.md)**: All API requests must be signed using HMAC-SHA256 with your access key and secret keypair.
- **[Rate Limiting](manager-api-common-concepts/rate-limiting.md)**: The server imposes rate limits on API calls within a rolling time window.
- **[JSON Object References](manager-api-common-concepts/json-object-references.md)**: Standard object types used in API responses, such as Execution Result Objects and Service Port Objects.
- **[API and Document Conventions](manager-api-common-concepts/api-and-document-conventions.md)**: Notation and conventions used throughout the API documentation.

:::warning
You must include a valid `Authorization` header with every API request. Requests without proper authentication will receive a `401 Unauthorized` response. See the [Authentication](manager-api-common-concepts/authentication.md) page for details on generating the signature.
:::

## Quick Start

To make your first API call, follow these steps:

1. Obtain an API access key and secret key from your administrator or the Backend.AI cloud console
2. Set the `X-BackendAI-Version` header to the desired API version (e.g., `v6.20220615`)
3. Sign the request using the HMAC-SHA256 procedure described in [Authentication](manager-api-common-concepts/authentication.md)
4. Send the request to the Manager's base URL with the appropriate endpoint path

```bash
GET / HTTP/1.1
Host: api.backend.ai
Content-Type: application/json
X-BackendAI-Version: v6.20220615
Authorization: BackendAI signMethod=HMAC-SHA256, credential=<access-key>:<signature>
Date: 20230101T00:00:00Z
```

A successful version check returns:

```json
{
  "version": "v6.20220615",
  "manager": "24.03.0"
}
```
