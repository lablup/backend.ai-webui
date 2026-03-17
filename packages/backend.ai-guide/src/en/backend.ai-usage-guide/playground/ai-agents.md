---
title: AI Agents
order: 77
---
# AI Agents

:::info
AI Agents is an experimental feature. To enable it, go to **User Settings** and turn on the **Experimental AI Agents** toggle. Once enabled, the **AI Agents** menu item appears under the **Playground** section in the sidebar.
:::

The AI Agents page allows you to browse, create, and manage pre-configured AI agent profiles. Each agent combines a system prompt, endpoint connection settings, and optional LLM parameters into a reusable profile. When you click on an agent card, you are taken directly to the Chat page with the agent's configuration pre-applied, so you can start chatting immediately.

![](../../images/ai_agents_page.png)
<!-- TODO: Capture screenshot -->

## Built-in and Custom Agents

Backend.AI provides a set of built-in agents that come pre-configured with common use cases. These built-in agents appear as cards on the AI Agents page alongside any custom agents you create.

- **Built-in agents**: Provided by the system. You can edit them to override their settings, but the original definition is preserved. If you have edited a built-in agent, a **Reset to Default** option becomes available.
- **Custom agents**: Agents you create from scratch. You can edit or delete them at any time.

Each agent card displays the agent's title, avatar, description, tags, and endpoint information.

## Creating an Agent

1. Click the **Add** button at the top right of the AI Agents page.
2. Fill in the agent configuration form in the modal that appears.
3. Click **Create** to save the new agent.

### Agent Configuration Fields

The agent creation/edit form includes the following fields:

- **Title**: A descriptive name for the agent (required).
- **Avatar**: An emoji character used as the agent's icon. Defaults to the robot emoji.
- **Description**: A brief description of what the agent does.
- **Tags**: Optional labels for organizing agents. Type a tag and press comma or space to add it.
- **System Prompt**: The system-level instruction sent to the LLM before every conversation (required). This defines the agent's behavior, personality, and expertise.
- **Connection Type**: Choose how the agent connects to the LLM:
   * **Backend.AI Endpoint**: Connect through a Backend.AI model serving endpoint. Requires an endpoint name and endpoint ID.
   * **External Endpoint**: Connect directly to an external OpenAI-compatible API. Requires an endpoint URL (e.g., `https://api.example.com/v1`) and optionally an API key.
- **Default Model**: The model identifier to use by default when chatting with this agent.
- **LLM Parameters**: Toggle this switch to pre-configure generation parameters (Temperature, Max Tokens, Top P, Top K, Frequency Penalty, Presence Penalty). When enabled, these parameters are automatically applied when using the agent in a chat.

## Editing an Agent

Hover over an agent card and click the **more** button (three dots) that appears in the top-right corner. Select **Edit** from the dropdown menu to open the editing modal with the agent's current settings pre-filled.

## Deleting an Agent

For custom agents, click the **more** button on the agent card and select **Delete Agent**. A confirmation dialog appears before the agent is permanently removed.

:::warning
Deleting a custom agent is irreversible. Make sure you no longer need the agent before confirming deletion.
:::

## Resetting a Built-in Agent

If you have edited a built-in agent and want to restore it to its original configuration, click the **more** button on the agent card and select **Reset to Default**. This removes your custom overrides and restores the original built-in agent definition.

## Using an Agent in Chat

Click on any agent card on the AI Agents page. You are redirected to the Chat page with the agent's endpoint, model, system prompt, and parameters already configured. You can start chatting immediately, or adjust settings further if needed.

When the AI Agents feature is enabled, an agent selector also appears in the header of each chat card on the Chat page, allowing you to switch agents without leaving the Chat page.

