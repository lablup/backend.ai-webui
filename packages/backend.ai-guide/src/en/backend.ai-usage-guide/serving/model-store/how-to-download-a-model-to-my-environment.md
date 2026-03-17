---
title: How to download a model to my environment
order: 86
---
# How to Download a Model to My Environment

You can clone (download) a model from the Model Store to your own storage folder. This creates a personal copy of the model files that you can use for inference, fine-tuning, or experimentation.

## Cloning a Model

1. Navigate to the **Model Store** page from the left sidebar.
2. Click the model card you want to download to open the model detail dialog.
3. Click the **Clone to a folder** button at the bottom of the dialog.
4. In the clone dialog, configure the following fields:
   * **Existing Folder Name**: Shows the original model folder name (read-only).
   * **New Folder Name**: Enter a name for the cloned folder. By default, it appends `_1` to the original name.
   * **Host**: The storage host where the clone will be created. Cloning is only possible on the same host as the source folder.
   * **Permission**: Set the permission for the cloned folder (Read-Write or Read-Only).
5. Click **Clone** to start the cloning process.

<!-- TODO: Capture screenshot of the model detail dialog with the Clone button highlighted -->
<!-- TODO: Capture screenshot of the clone modal dialog -->

:::note
The cloned folder is created as a user-type folder with `model` usage mode. It will appear in your Data page under the model folder tab.
:::

## Monitoring the Clone Progress

After initiating the clone, a notification appears showing the progress. The cloning operation runs as a background task, so you can continue using other features while it completes.

Once the clone is finished, the notification updates with a link to open the cloned folder in the Data page.

## Using the "Run This Model" Button

As an alternative to manual cloning, you can use the **Run this model** button in the model detail dialog. This button performs the following steps automatically:

1. Clones the model folder to your account (if you do not already have a similar folder).
2. Creates a new model serving endpoint using the cloned folder.
3. Starts inference sessions for the endpoint.

If you already have a folder with a similar name, the system asks whether you want to use the existing folder instead of cloning again.

:::warning
The **Run this model** button requires the model folder to contain both `model-definition.yaml` and `service-definition.toml` files. If either file is missing, the button will be disabled with a tooltip explaining which file is needed.
:::
