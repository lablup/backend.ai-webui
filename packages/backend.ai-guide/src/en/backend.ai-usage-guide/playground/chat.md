---
title: Chat Page
order: 80
---
# Chat Page

Starting from version 25.05, the LLM Playground feature has been separated into its own page and renamed to **Chat**. The Chat page enables you to conveniently compare and interact with different LLMs all in one location. This allows you to experience the services offered by Backend.AI as well as a variety of large language models (LLMs).

You can access the Chat page by selecting **Chat** from the **Playground** section in the sidebar menu.

![](../../images/chat_page.png)

## Selecting Endpoints and Models

You can select the endpoint and model from the top left corner of each chat card on the Chat page. Clicking the endpoint field allows you to search for or choose from available endpoints, and you can select the model in the same way. If no model is associated with the selected endpoint, verify the base path and token compatibility with OpenAI, then click the **Refresh model info** button.

![](../../images/custom_model.png)

When the selected endpoint does not return a model list, a custom model configuration form appears. The following inputs are available to configure custom model settings:

- **baseURL** (optional): Base URL of the server where the model is located. Make sure to include the version information. For instance, when utilizing the OpenAI API, you should enter `https://api.openai.com/v1`.
- **Token** (optional): An authentication key to access the model service. Tokens can be generated from various services, not just Backend.AI. The format and generation process may vary depending on the service. Always refer to the specific service's guide for details.

:::note
The Chat page communicates with endpoints using an OpenAI-compatible API format. Any endpoint that supports the OpenAI chat completions API can be used.
:::

### Selecting AI Agents

If the experimental AI Agents feature is enabled, you can also select an AI agent from the header of each chat card. When you select an agent, the chat automatically applies the agent's system prompt, default model, endpoint settings, and any pre-configured LLM parameters. For more details on AI agents, refer to the [AI Agents](./ai-agents.md) section.

## Sending Messages

Type your message in the input field at the bottom of a chat card and press **Enter** or click the **Send** button to submit it. The chat supports file attachments: you can drag and drop files onto the chat card or use the file upload feature to include images and other files alongside your text messages.

While the model is generating a response, you can click the **Stop** button to cancel the streaming output.

## Add or Remove Comparison Chat Cards

To add new comparison chat cards, click the comparison icon button located in the top right corner. You can have up to 10 chat cards open simultaneously for side-by-side comparison of different models or configurations.

![](../../images/add_cards.png)

To remove a chat card, click the **more** button located in the upper right corner of the chat card. A dropdown menu will appear, and you can select **Delete Chat** to remove the card.

![](../../images/delete_chatting_session.png)

:::warning
Deleting a chat card will remove all entered content. This action cannot be undone.
:::

## Clear Chat History

Click the **more** button to reveal the **Clear chat** option. Selecting this erases all chat history associated with the card, although the card itself remains active. This is useful when you want to start a fresh conversation without creating a new card.

![](../../images/delete_chatting_session.png)

## Synchronize Input

The **Sync Input** button, located at the top right, enables the synchronization of input across chat cards where the option is enabled. When you enable **Sync input**, pressing **Enter** or clicking the **Send** button on any card submits the input from the card you are currently working on. This functionality is beneficial for comparing the outputs of various models using identical input data.

![](../../images/synchronized_input.png)

:::tip
Use synchronized input together with multiple chat cards to quickly compare how different models or parameter settings respond to the same prompt.
:::

## Parameter Adjustment

Click the parameter button in the top-right corner to adjust the parameters for each model. A popover panel appears with a toggle switch to enable or disable custom parameters. When enabled, you can set the following values using sliders:

- **Max Tokens**: The maximum number of tokens the model can generate in a response (range: 50 to 16384).
- **Temperature**: Controls the randomness of the output. Lower values produce more deterministic responses (range: 0.0 to 1.0).
- **Top P**: Controls nucleus sampling. The model considers tokens whose cumulative probability reaches this threshold (range: 0.0 to 1.0).
- **Top K**: Limits the number of highest-probability tokens considered at each step (range: 1 to 500).
- **Frequency Penalty**: Reduces repetition by penalizing tokens based on their frequency in the output so far (range: 0.0 to 2.0).
- **Presence Penalty**: Reduces repetition by penalizing tokens that have already appeared in the output (range: 0.0 to 2.0).

Using the synchronize feature, you can apply different parameters to the same model and then compare the results.

![](../../images/parameter_settings.png)

## Chat Sessions and History

### Starting a New Chat

To start a new chat session, click the **+** button located in the top right corner. Each chat session maintains its own set of chat cards, endpoint selections, and conversation history.

![](../../images/new_chat.png)

You can rename a chat session by clicking on its title in the header and typing a new name.

### Browsing Chat History

All chat history is stored in local storage. You can access previous chats by clicking the history button in the top-right corner, which opens a side drawer listing all saved sessions with their names and last-updated timestamps.

![](../../images/history_button.png)

![](../../images/chat_history.png)

From the history drawer, you can:

- Click on any session to switch to it.
- Click the trash icon next to a session to delete it.

:::warning
Chat history is saved in your browser's local storage. Clearing your browser data or switching to a different browser will result in the loss of all chat history.
:::
