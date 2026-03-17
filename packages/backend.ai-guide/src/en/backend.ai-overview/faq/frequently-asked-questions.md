---
title: FAQ
order: 21
---
# FAQ

## How Does Backend.AI Compare to Other Solutions?

### vs. Notebooks

| Product                           | Role                                       | Value                                                                                              |
| --------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Apache Zeppelin, Jupyter Notebook | Notebook-style document + code _frontends_ | Familiarity from data scientists and researchers, but hard to avoid insecure host resource sharing |
| **Backend.AI**                    | Pluggable _backend_ to any frontends       | Built for multi-tenancy: scalable and better isolation                                             |

Backend.AI can run Jupyter Notebooks as one of its session types, but it goes far beyond providing a notebook interface. It manages the entire compute lifecycle, including resource isolation, scheduling, storage management, and multi-tenancy.

### vs. Orchestration Frameworks

| Product                        | Target                                                          | Value                                                                  |
| ------------------------------ | --------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Amazon ECS, Kubernetes         | Long-running interactive services                               | Load balancing, fault tolerance, incremental deployment                |
| Amazon Lambda, Azure Functions | Stateless light-weight, short-lived functions                   | Serverless, zero-management                                            |
| **Backend.AI**                 | Stateful batch computations mixed with interactive applications | Low-cost high-density computation, maximization of hardware potentials |

While Kubernetes focuses on general-purpose container orchestration, Backend.AI is purpose-built for AI/ML workloads with features like fractional GPU (fGPU) sharing, automatic session scheduling, and resource quota management.

### vs. Big-data and AI Frameworks

| Product                               | Role                         | Value                                                                                         |
| ------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------- |
| TensorFlow, Apache Spark, Apache Hive | Computation runtime          | Difficult to install, configure, and operate at scale                                         |
| Amazon ML, Azure ML, GCP ML           | Managed MLaaS                | Highly scalable but dependent on each platform, still requires system engineering backgrounds |
| **Backend.AI**                        | Host of computation runtimes | Pre-configured, versioned, reproducible, customizable (open-source)                           |

Backend.AI provides pre-configured container images for popular frameworks like TensorFlow, PyTorch, and others. Users can start training immediately without spending time on environment setup.

:::info
All product names and trademarks are the properties of their respective owners.
:::

## General Questions

### What is Backend.AI?

Backend.AI is an open-source platform for managing and orchestrating AI/ML computing resources. It provides secure, multi-tenant access to GPUs and other accelerators, allowing multiple users and teams to share expensive hardware efficiently.

### What user roles does Backend.AI support?

Backend.AI has three user roles:

- **User**: Standard access for creating sessions, managing storage folders, and running workloads.
- **Domain Admin**: Manages users and resources within a specific domain.
- **Superadmin**: Full system access across all domains, including cluster configuration and maintenance.

### What is fractional GPU (fGPU)?

Fractional GPU is Backend.AI's GPU virtualization technology. It allows a single physical GPU to be shared across multiple compute sessions by allocating fractional portions of GPU memory and compute capacity. This maximizes hardware utilization and reduces costs.

### Can I use Backend.AI with my own GPU hardware?

Yes. Backend.AI supports a wide range of accelerator hardware including NVIDIA CUDA GPUs, AMD ROCm GPUs, Intel Gaudi, Graphcore IPUs, and others. As long as your hardware has a supported Backend.AI accelerator plugin, you can integrate it into the cluster.

## WebUI Questions

### Which browsers are supported?

The Backend.AI WebUI supports the latest versions of Google Chrome, Mozilla Firefox, Apple Safari, and Microsoft Edge (Chromium-based). Internet Explorer is not supported.

### Why can I not see certain menu items?

Menu visibility depends on your user role and your cluster's configuration. Some menu items are only available to domain admins or superadmins. Additionally, system administrators can configure block lists and inactive lists that hide or disable specific menu items.

### Where is my chat history stored?

Chat history on the Chat page is stored in your browser's local storage. It is not synced across browsers or devices. Clearing your browser data will erase all saved chat history.

### How do I connect to an external LLM from the Chat page?

On the Chat page, if no Backend.AI endpoint is available or if the models list is empty, a custom model configuration form appears. Enter the base URL of the external OpenAI-compatible API (e.g., `https://api.openai.com/v1`) and an API key to connect.
