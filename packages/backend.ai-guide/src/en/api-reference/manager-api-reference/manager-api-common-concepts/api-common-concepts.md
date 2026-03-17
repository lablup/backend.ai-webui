---
title: Manager API Common Concepts
order: 154
---
# Manager API Common Concepts

This section covers the foundational concepts that apply across all Backend.AI Manager API calls. Before working with specific API endpoints, you should understand how authentication, rate limiting, and standard data formats work.

## Authentication

All API requests to the Backend.AI Manager must be authenticated using HMAC-SHA256 request signing. Each request includes an `Authorization` header containing a signature computed from your secret key, the request content, and the current timestamp.

The signing process involves:

1. Generating a signing key derived from your API secret key and the current date
2. Constructing a canonical string from the HTTP method, URI, headers, and body hash
3. Computing the HMAC-SHA256 signature and attaching it to the `Authorization` header

:::note
Both an **access key** (for identification) and a **secret key** (for signature generation) are required. You can obtain these from your Backend.AI administrator or the cloud console.
:::

For the complete signing procedure and code examples, see the [Authentication](authentication.md) page.

## Rate Limiting

The API server enforces rate limits to protect against overloading. Rate limits are applied on a rolling window basis (default: 15 minutes) and are tracked per access key for authenticated requests or per IP address for public endpoints.

Each API response includes rate limit headers:

| Header | Description |
| --- | --- |
| `X-RateLimit-Limit` | Maximum number of requests allowed in the current window |
| `X-RateLimit-Remaining` | Number of requests remaining before the limit is reached |
| `X-RateLimit-Window` | The size of the rolling window in seconds |

When the limit is exceeded, the server responds with HTTP `429 Too Many Requests`.

For detailed information on rate limit behavior and best practices, see the [Rate Limiting](rate-limiting.md) page.

## JSON Object References

The API uses several standard JSON object types across multiple endpoints. Understanding these common structures helps you interpret responses consistently regardless of which endpoint you are calling.

Key object types include:

- **Execution Result Object**: Returned by code execution APIs, containing the execution status, console output, and media content
- **Service Port Object**: Describes the network services available within a compute session (e.g., Jupyter, TensorBoard)
- **Container Stats Object**: Provides resource usage statistics for a session at the time of termination
- **Creation Config Object**: Specifies resource requirements and environment settings when creating a new session

For the complete schema of each object type, see the [JSON Object References](json-object-references.md) page.

## API and Document Conventions

The API documentation follows specific notation conventions to describe endpoints, parameters, and behavior:

- **URI Parameters**: Path parameters are denoted with a colon prefix (e.g., `:id` in `/session/:id`)
- **Optional Parameters**: Marked as `(optional)` in parameter tables, with default values noted where applicable
- **Type Notation**: Parameters use standard type names such as `str`, `int`, `bool`, `slug`, `object`, and `list`
- **Version Tags**: Features introduced or changed in specific API versions are annotated with "Added in version" or "Changed in version" markers

:::info
A `slug` type refers to a short string identifier containing only ASCII alphanumeric characters and hyphens. Slugs are used for session IDs, resource names, and other human-readable identifiers.
:::

For the full list of conventions, see the [API and Document Conventions](api-and-document-conventions.md) page.

## Common HTTP Status Codes

The following status codes are used consistently across all API endpoints:

| Status Code | Meaning |
| --- | --- |
| `200 OK` | The request succeeded and the response body contains the result |
| `201 Created` | A new resource was successfully created |
| `204 No Content` | The request succeeded but there is no response body |
| `400 Bad Request` | The request contains invalid or malformed parameters |
| `401 Unauthorized` | Authentication failed or the `Authorization` header is missing |
| `403 Forbidden` | The authenticated user does not have permission for the requested operation |
| `404 Not Found` | The requested resource does not exist |
| `429 Too Many Requests` | The rate limit has been exceeded |
| `500 Internal Server Error` | An unexpected error occurred on the server |

:::warning
Error responses use the `application/problem+json` content type and include `type`, `title`, and `detail` fields to help you diagnose the issue. Always check the `detail` field for a human-readable description of the error.
:::

## Common Request Headers

Every API request should include the following headers:

| Header | Required | Description |
| --- | --- | --- |
| `Content-Type` | Yes | Must be `application/json` |
| `Authorization` | Yes | HMAC-SHA256 signature (see [Authentication](authentication.md)) |
| `Date` or `X-BackendAI-Date` | Yes | Request timestamp in RFC 8022 or ISO 8601 format |
| `X-BackendAI-Version` | Yes | The API version string (e.g., `v6.20220615`) |
| `X-BackendAI-Client-Token` | No | Optional client-generated token for request deduplication |
