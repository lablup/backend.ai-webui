---
title: Low-level SDK Reference
order: 188
---
# Low-level SDK Reference

The Backend.AI Python SDK includes a low-level API layer that gives you direct
control over HTTP request construction and authentication signing. While most
users should prefer the [high-level function API](high-level-function-reference.md),
the low-level API is useful when you need to call endpoints that the high-level
wrappers do not yet cover.

## When to Use the Low-level API

Consider using the low-level API when:

- You need to call a REST endpoint not yet wrapped by a high-level function.
- You want fine-grained control over request headers or the request body.
- You are building a custom integration layer on top of the SDK.
- You need to debug authentication issues at the protocol level.

## APIConfig

The `APIConfig` class holds the endpoint URL, API keypair, and other
connection parameters.

```python
from ai.backend.client.config import APIConfig

config = APIConfig(
    endpoint="https://api.backend.ai",
    endpoint_type="api",
    access_key="AKIA...",
    secret_key="...",
)
```

You can also load configuration from environment variables:

```python
config = APIConfig.from_env()
```

:::info
See the [Client Configuration](client-configuration.md) page for the full
list of supported environment variables.
:::

## Request Signing

Backend.AI uses HMAC-based request signing for authentication. The low-level
layer handles this automatically when you issue requests through the session
object. Each outgoing request is signed with your secret key:

1. A canonical request string is constructed from the HTTP method, URI,
   date, host, and content-type headers.
2. The string is signed with HMAC-SHA256 using your secret key.
3. The resulting signature is attached to the `Authorization` header.

You do not need to implement signing yourself. However, understanding the
mechanism is helpful for debugging `401 Unauthorized` responses.

## Making Raw API Requests

You can issue raw HTTP requests through the `APISession` object. This
bypasses the high-level resource classes while still using the SDK's
authentication and connection management.

```python
from ai.backend.client.session import APISession

async with APISession() as api_session:
    response = await api_session.request("GET", "/")
    print(response.status)
    data = await response.json()
    print(data)
```

For endpoints that require a JSON body:

```python
async with APISession() as api_session:
    response = await api_session.request(
        "POST",
        "/resource/endpoint",
        json={"key": "value"},
    )
    result = await response.json()
```

:::warning
When using the low-level request method, you are responsible for constructing
the correct request path and body according to the Backend.AI REST API
specification.
:::

## Custom Headers and Query Parameters

You can pass additional headers or query parameters to any low-level request:

```python
async with APISession() as api_session:
    response = await api_session.request(
        "GET", "/resource/list",
        params={"limit": "50", "offset": "0"},
        headers={"X-Custom-Header": "value"},
    )
```

## Combining Low-level and High-level APIs

You can mix both API layers within the same `APISession` context. They share
the same authentication context and HTTP connection pool.

```python
async with APISession() as api_session:
    sessions = await api_session.ComputeSession.paginated_list(status="RUNNING")
    response = await api_session.request("GET", "/custom/endpoint")
    custom_data = await response.json()
```
