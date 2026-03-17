---
title: CLI: Troubleshooting
order: 105
---
# CLI: Troubleshooting

This section covers common issues you may encounter when using the Backend.AI CLI and their solutions.

## macOS Security Warnings (Gatekeeper)

On macOS, the system security feature Gatekeeper may block the CLI from running. If you see a warning such as "cannot be opened because the developer cannot be verified," follow these steps:

1. Open **System Preferences** and navigate to **Security & Privacy**.
2. Under the **General** tab, find the message about the blocked application.
3. Click **Open Anyway** to allow the CLI to run.

:::warning
This warning occurs because the CLI binary is not signed with an Apple Developer certificate. It is safe to allow the application if you installed it from an official source.
:::

## Connection Errors

If you see errors like `ConnectionError` or `Cannot connect to the API server`, check the following:

- Verify that `BACKEND_ENDPOINT` is set correctly:
  ```shell
  $ echo $BACKEND_ENDPOINT
  ```
- Ensure the API endpoint URL includes the correct protocol (`https://`).
- Check that your network can reach the Backend.AI API server.
- If you are behind a proxy, configure the `HTTP_PROXY` and `HTTPS_PROXY` environment variables.

## Authentication Errors

If you receive `401 Unauthorized` or `Authentication failed` errors:

- Confirm that `BACKEND_ACCESS_KEY` and `BACKEND_SECRET_KEY` are set:
  ```shell
  $ echo $BACKEND_ACCESS_KEY
  $ echo $BACKEND_SECRET_KEY
  ```
- Verify that your keypair is still valid and has not been deactivated by an administrator.
- Ensure there are no extra whitespace characters in your key values.

## SSL Certificate Issues

If you encounter SSL-related errors such as `SSLCertVerificationError`:

- Verify that the API server's SSL certificate is valid and not expired.
- If you are using a self-signed certificate, set the `BACKEND_TLS_VERIFY` environment variable to `0`:
  ```shell
  $ export BACKEND_TLS_VERIFY=0
  ```

:::warning
Disabling TLS verification is not recommended for production environments. Use this only for testing with self-signed certificates.
:::

## Permission Denied Errors

If you see `PermissionError` or `Access denied` messages:

- Your account may not have sufficient permissions for the requested operation.
- Contact your administrator to verify your role and resource policy.
- Some commands (e.g., managing other users' sessions) require domain admin or superadmin privileges.

## Session Creation Failures

If session creation fails with resource-related errors:

- Check available resources in your resource group:
  ```shell
  $ backend.ai admin resource check-presets
  ```
- Reduce the requested resource amounts (CPU, memory, fGPU).
- Verify that the requested container image exists and is accessible:
  ```shell
  $ backend.ai image list
  ```
- Contact your administrator if you consistently run out of resources.

## Version Mismatch Warnings

If you see warnings about API version compatibility:

- Update your CLI client to the latest version:
  ```shell
  $ pip install --upgrade backend.ai-client
  ```
- Check your current client version:
  ```shell
  $ backend.ai version
  ```
- The CLI client should match or be compatible with the Backend.AI server version. Contact your administrator to confirm the server version.

:::info
For issues not covered here, you can run any command with the `--debug` flag to get detailed error output:

```shell
$ backend.ai --debug ps
```

This provides additional information useful for diagnosing problems or reporting issues.
:::
