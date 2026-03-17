---
title: How to fine-tune the uploaded model
order: 87
---
# How to Fine-Tune the Uploaded Model

After cloning a model from the Model Store to your own storage folder, you can fine-tune it using Backend.AI compute sessions. Fine-tuning allows you to adapt a pre-trained model to your specific dataset or use case.

## Prerequisites

Before fine-tuning, ensure the following:

- You have cloned the model from the Model Store to your own storage folder (see [How to Download a Model to My Environment](./how-to-download-a-model-to-my-environment.md)).
- You have a training dataset uploaded to a storage folder.
- You have sufficient compute resources (GPU, memory) allocated by your resource policy.

## General Workflow

1. **Create a compute session**: Navigate to the **Sessions** page and create a new interactive session. Select an appropriate container image that includes the ML framework matching your model (e.g., PyTorch, TensorFlow).

2. **Mount folders**: Mount both the model folder and your training data folder when creating the session. The model folder should be the one you cloned from the Model Store.

3. **Run fine-tuning scripts**: Open a Jupyter notebook or terminal in the session and run your fine-tuning code. The model files are accessible at the mount path you configured.

4. **Save results**: Save the fine-tuned model weights back to the mounted model folder or a separate output folder. Data saved to mounted storage folders persists after the session ends.

5. **Deploy the fine-tuned model**: After fine-tuning, you can create a new model serving endpoint using the updated model folder. Navigate to the **Serving** page, click **Start New Service**, and select the folder containing your fine-tuned model.

:::info
The specific fine-tuning procedure depends on the model architecture, framework, and your dataset. Backend.AI provides the compute infrastructure and storage management, while the actual fine-tuning logic is defined by your training scripts.
:::

## Tips for Fine-Tuning

- **Resource allocation**: Fine-tuning large models requires significant GPU memory. Ensure you allocate enough GPU resources when creating the compute session.
- **Shared memory**: For data-loading pipelines that use multiple workers, increase the shared memory allocation in the resource settings.
- **Checkpointing**: Save checkpoints periodically to your mounted storage folder to avoid losing progress if the session terminates.
- **Cluster sessions**: For large-scale fine-tuning, consider using Backend.AI cluster sessions that distribute training across multiple nodes.

:::note
Fine-tuning workflows vary significantly depending on the model and framework. Refer to the model's official documentation for specific fine-tuning instructions and recommended hyperparameters.
:::
