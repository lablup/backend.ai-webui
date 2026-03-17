---
title: Playground
order: 76
---
# Playground

The Playground section in Backend.AI WebUI provides tools for interacting with large language models (LLMs) served through Backend.AI endpoints or external OpenAI-compatible APIs. You can access the Playground features from the **Playground** group in the sidebar menu.

## Features

The Playground section includes the following pages:

- **Chat**: A full-featured chat interface for conversing with LLMs. You can create multiple chat cards for side-by-side model comparison, synchronize inputs across cards, and fine-tune generation parameters. Chat history is automatically saved in your browser's local storage. See the [Chat Page](./chat.md) section for details.
- **AI Agents** (experimental): A page for managing pre-configured AI agent profiles that combine system prompts, endpoint settings, and LLM parameters into reusable configurations. Clicking an agent card takes you to the Chat page with the agent's settings applied. See the [AI Agents](./ai-agents.md) section for details.

## Prerequisites

To use the Playground features, you need at least one active model serving endpoint. Endpoints can be created from the **Model Serving** page. The Chat page communicates with endpoints using the OpenAI-compatible chat completions API format.

:::note
The AI Agents feature is experimental and must be enabled in **User Settings** before it appears in the sidebar menu.
:::

