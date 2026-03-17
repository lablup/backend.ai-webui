---
title: Model Store
order: 84
---
# Model Store

The Model Store provides a centralized catalog of pre-registered models available in your Backend.AI deployment. You can browse models, view their details, clone them to your own storage folders, and launch model serving endpoints directly.

<!-- TODO: Capture screenshot of the Model Store page showing the card grid -->

## Accessing the Model Store

Click **Model Store** in the left sidebar under the **Service** group. The page displays available models as a grid of cards.

## Model Cards

Each model is displayed as a card showing:

- **Title**: The display name of the model.
- **Description**: A brief summary of what the model does.
- **Category**: The broad category of the model (e.g., NLP, vision).
- **Task**: The specific task the model is designed for (e.g., text-generation, image-classification).
- **Labels**: Additional tags for filtering and identification.
- **Thumbnail**: A preview image representing the model.

Click any model card to open the model detail dialog.

## Model Detail Dialog

The model detail dialog provides comprehensive information about the selected model:

- **Author**: The creator or publisher of the model.
- **Version**: The model version.
- **Architecture**: The model architecture (e.g., transformer).
- **Framework**: The ML framework used (e.g., PyTorch, TensorFlow).
- **Created / Last Modified**: Timestamps for the model record.
- **Min Resource**: The minimum compute resources recommended for running the model.
- **License**: The license governing the model usage.
- **README**: If available, the full README content is rendered as Markdown.

<!-- TODO: Capture screenshot of the model detail dialog -->

### Available Actions

From the model detail dialog, you can:

- **Run this model**: Clones the model to your storage (if needed) and automatically creates a serving endpoint. This button is only enabled when the model folder contains both `model-definition.yaml` and `service-definition.toml` files.
- **Clone to a folder**: Copies the model files to a new storage folder in your account for further use.

:::info
The **Run this model** button streamlines the entire workflow: it clones the model, creates an endpoint, and starts inference sessions. Once the service is healthy, you can test it directly in the Chat interface.
:::
