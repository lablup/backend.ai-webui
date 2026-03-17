---
title: How to begin with CLI (User)
order: 96
---
# How to Begin with CLI (User)

This section walks you through the initial setup of the Backend.AI CLI client so you can start managing sessions and resources from your terminal.

## Prerequisites

Before installing the CLI, ensure you have the following:

- Python 3.8 or higher
- `pip` package manager
- Network access to your Backend.AI API endpoint
- A valid access key and secret key (obtainable from the WebUI or your administrator)

## Installation

Install the Backend.AI client package from PyPI:

```shell
$ pip install backend.ai-client
```

:::note
It is recommended to use a Python virtual environment to avoid conflicts with other packages:

```shell
$ python -m venv bai-env
$ source bai-env/bin/activate
$ pip install backend.ai-client
```
:::

## Setting Up Environment Variables

Configure the CLI by exporting your Backend.AI credentials as environment variables:

```shell
$ export BACKEND_ENDPOINT=https://api.backend.ai
$ export BACKEND_ACCESS_KEY=YOUR_ACCESS_KEY
$ export BACKEND_SECRET_KEY=YOUR_SECRET_KEY
```

Replace the values above with your actual API endpoint and keypair credentials.

## Verifying the Installation

Run the following command to verify that the CLI is properly installed and configured:

```shell
$ backend.ai ps
```

If the configuration is correct, this command displays your currently running sessions (or an empty list if you have none).

## First Commands to Try

Once the CLI is set up, try the following commands to explore the platform:

```shell
$ backend.ai image list          # List available container images
$ backend.ai vfolder list        # List your storage folders
$ backend.ai session create cr.backend.ai/stable/python:3.11-ubuntu22.04  # Create a session
$ backend.ai ps                  # Check running sessions
```

:::info
**How to resolve warnings that may occur on macOS**

When running the CLI on macOS, a warning message sometimes occurs and the client may not open. If this happens, refer to the [CLI: Troubleshooting](#cli-troubleshooting) section.
:::
