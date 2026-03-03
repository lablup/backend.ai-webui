---
title: FAQ
order: 21
---
# FAQ

## vs. Notebooks

| Product                           | Role                                       | Value                                                                                              |
| --------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Apache Zeppelin, Jupyter Notebook | Notebook-style document + code _frontends_ | Familiarity from data scientists and researchers, but hard to avoid insecure host resource sharing |
| **Backend.AI**                    | Pluggable _backend_ to any frontends       | Built for multi-tenancy: scalable and better isolation                                             |

## vs. Orchestration Frameworks

| Product                        | Target                                                          | Value                                                                  |
| ------------------------------ | --------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Amazon ECS, Kubernetes         | Long-running interactive services                               | Load balancing, fault tolerance, incremental deployment                |
| Amazon Lambda, Azure Functions | Stateless light-weight, short-lived functions                   | Serverless, zero-management                                            |
| **Backend.AI**                 | Stateful batch computations mixed with interactive applications | Low-cost high-density computation, maximization of hardware potentials |

## vs. Big-data and AI Frameworks

| Product                               | Role                         | Value                                                                                         |
| ------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------- |
| TensorFlow, Apache Spark, Apache Hive | Computation runtime          | Difficult to install, configure, and operate at scale                                         |
| Amazon ML, Azure ML, GCP ML           | Managed MLaaS                | Highly scalable but dependent on each platform, still requires system engineering backgrounds |
| **Backend.AI**                        | Host of computation runtimes | Pre-configured, versioned, reproducible, customizable (open-source)                           |

:::info
All product names and trade-marks are the properties of their respective owners.
:::
