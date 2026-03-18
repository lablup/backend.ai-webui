---
title: Workload
order: 64
---
# Workload

In Backend.AI, a *workload* refers to any computational task that runs inside the platform. Workloads are executed as compute sessions -- isolated environments where you can run code, train models, perform data analysis, or serve inference endpoints using allocated resources such as CPU, memory, and AI accelerators.

The **Sessions** page is the central hub for managing all workloads. From this page, you can create new compute sessions, monitor running sessions, review finished sessions, and terminate sessions you no longer need.

## Session Types

Backend.AI supports several types of compute sessions, each designed for different use cases:

- **Interactive session**: You interact with the session after creation using applications such as Jupyter Notebook, VS Code, or a web terminal. The session remains active until you explicitly terminate it or an idle check triggers automatic termination. This is ideal for exploratory data analysis, model prototyping, and interactive development.

- **Batch session**: You pre-define a script that executes as soon as the session is ready. The session automatically terminates after the script finishes. This is useful for training pipelines, scheduled jobs, and any workload where you can write the execution script in advance.

- **Inference session**: You deploy a trained model as an API endpoint for serving predictions. Inference sessions are managed through the **Model Serving** page and are optimized for low-latency, high-throughput serving workloads.

## What You Can Do From the Sessions Page

The Sessions page provides a comprehensive view of your workloads:

- **Start new sessions** by clicking the **START** button and following the session launcher workflow
- **Filter sessions** by type (Interactive, Batch, Inference) and status (Running, Finished)
- **View session details** including resource allocation, elapsed time, status, and logs
- **Access running sessions** through built-in applications like Jupyter Notebook, web terminal, and VS Code
- **Terminate sessions** to free up resources when your work is complete

:::tip
You can customize the session list columns by clicking the **Settings** button at the bottom right of the table to show or hide specific columns.
:::

## Related Pages

For detailed instructions on specific workload operations, refer to the following pages:

- [Sessions](sessions/session-management.md) -- Overview of the Sessions page and session list
- [How to Start / Terminate a Session](sessions/how-to-start-terminate-a-session.md) -- Step-by-step session creation and termination
- [How to Manage Existing Sessions](sessions/how-to-existing-sessions.md) -- Working with running sessions
- [How to Optimize Accelerated Computing](sessions/how-to-optimize-accelerated-computing.md) -- GPU and fGPU resource allocation
- [Mounting Folders to a Compute Session](sessions/mounting-folders-to-a-compute-session.md) -- Persistent data storage across sessions
