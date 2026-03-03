---
title: Code Execution (Streaming)
order: 163
---
# Code Execution (Streaming)

The streaming mode provides a lightweight and interactive method to connect with the session containers.

## Code Execution

* URI: `/stream/session/:id/execute`
* Method: `GET` upgraded to WebSockets

This is a real-time streaming version of [Code Execution (Batch Mode)](code-execution-batch-mode.md) and [Code Execution (Query Mode)](code-execution-query-mode.md) which uses long polling via HTTP.

(under construction)

Added in version v4.20181215.

## Terminal Emulation

* URI: `/stream/session/:id/pty?app=:service`
* Method: `GET` upgraded to WebSockets

This endpoint provides a duplex continuous stream of JSON objects via the native WebSocket. Although WebSocket supports binary streams, we currently rely on TEXT messages only conveying JSON payloads to avoid quirks in typed array support in Javascript across different browsers.

The service name should be taken from the list of [service port objects](../manager-api-common-concepts/json-object-references.md#service-port-object) returned by [the session creation API](session-management.md#creating-session).

:::info
**Note**

We do _not_ provide any legacy WebSocket emulation interfaces such as socket.io or SockJS. You need to set up your own proxy if you want to support legacy browser users.
:::

Changed in version v4.20181215: Added the `service` query parameter.

### Parameters


| Parameter | Type | Description |
| --- | --- | --- |
| :id | slug | The session ID. |
| :service | slug | The service name to connect. |



### Client-to-Server Protocol

The endpoint accepts the following four types of input messages.

### **Standard input stream**

All ASCII (and UTF-8) inputs must be encoded as base64 strings. The characters may include control characters as well.

```bash
{
  "type": "stdin",
  "chars": "<base64-encoded-raw-characters>"
}
```

#### **Terminal resize**

Set the terminal size to the given number of rows and columns. You should calculate them by yourself.

For instance, for web-browsers, you may do a simple math by measuring the width and height of a temporarily created, invisible HTML element with the (monospace) font styles same to the terminal container element that contains only a single ASCII character.

```bash
{
  "type": "resize",
  "rows": 25,
  "cols": 80
}
```

#### **Ping**

Use this to keep the session alive (preventing it from auto-terminated by idle timeouts) by sending pings periodically while the user-side browser is open.

```bash
{
  "type": "ping",
}
```

#### **Restart**

Use this to restart the session without affecting the working directory and usage counts. Useful when your foreground terminal program does not respond for whatever reasons.

```bash
{
  "type": "restart",
}
```

### Server-to-Client Protocol

#### **Standard output/error stream**

Since the terminal is an output device, all stdout/stderr outputs are merged into a single stream as we see in real terminals. This means there is no way to distinguish stdout and stderr in the client-side, unless your session applies some special formatting to distinguish them (e.g., make all stderr otuputs red).

The terminal output is compatible with xterm (including 256-color support).

```bash
{
  "type": "out",
  "data": "<base64-encoded-raw-characters>"
}
```

#### **Server-side errors**

```bash
{
  "type": "error",
  "data": "<human-readable-message>"
}
```
