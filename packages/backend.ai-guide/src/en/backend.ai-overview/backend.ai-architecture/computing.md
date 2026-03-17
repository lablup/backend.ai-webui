---
title: Computing
order: 10
---
# Computing

This section covers the computing concepts in Backend.AI, including sessions, kernels, scheduling, and resource management.

## Sessions and Kernels

Backend.AI spawns _sessions_ to host various kinds of computation with associated computing resources. Each session may have one or more _kernels_. We call sessions with multiple kernels "cluster sessions".

A _kernel_ represents an isolated unit of computation such as a container, a virtual machine, a native process, or even a Kubernetes pod, depending on the Agent's backend implementation and configurations. The most common form of a kernel is a Docker container. For container or VM-based kernels, they are also associated with the base images. The most common form of a base image is [the OCI container images](https://github.com/opencontainers/image-spec/blob/main/spec.md).

### Kernel Roles in a Cluster Session

In a cluster session with multiple kernels, each kernel has a role. By default, the first container takes the "main" role while others take the "sub" role. All kernels are given unique hostnames like "main1", "sub1", "sub2", ..., and "subN" (the cluster size is N+1 in this case). A non-cluster session has one "main1" kernel only.

All interactions with a session are routed to its "main1" kernel, while the "main1" kernel is allowed to access all other kernels via a private network.

:::info
For more details, see the Backend.AI documentation on [Cluster Networking](https://docs.backend.ai/ko/latest/concepts/networking.html#concept-cluster-networking).
:::

## Session Templates

A session template is a predefined set of parameters to create a session, while they can be overridden by the caller. It may define additional kernel roles for a cluster session, with different base images and resource specifications.

## Session Types

There are several classes of sessions for different purposes having different features.

| Feature        | <p>Compute<br>(Interactive)</p> | <p>Compute<br>(Batch)</p> | Inference | System |
| -------------- | ------------------------------- | ------------------------- | --------- | ------ |
| Code execution | ✓                               | ✗                         | ✗         | ✗      |
| Service port   | ✓                               | ✓                         | ✓         | ✓      |
| Dependencies   | ✗                               | ✓                         | ✗         | ✗      |
| Session result | ✗                               | ✓                         | ✗         | ✗      |
| Clustering     | ✓                               | ✓                         | ✓         | ✓      |

Compute session is the most generic form of session to host computations. It has two operation modes: _interactive_ and _batch_.

### Interactive Compute Session

Interactive compute sessions are used to run various interactive applications and development tools, such as Jupyter Notebooks, web-based terminals, and more. It is expected that the users control their lifecycles (e.g., terminating them) while Backend.AI offers configuration knobs for the administrators to set idle timeouts with various criteria.

There are two major ways to interact with an interactive compute session: _service ports_ and _the code execution API_.

#### Service Ports

<!-- TODO: Add content describing service ports and how they work in interactive sessions -->

Refer to the Backend.AI architecture documentation for detailed diagrams.

#### Code Execution

<!-- TODO: Add content describing the code execution API for interactive sessions -->

Refer to the Backend.AI architecture documentation for detailed diagrams.

### Batch Compute Session

Batch compute sessions are used to host a "run-to-completion" script with a finite execution time. It has two result states: SUCCESS or FAILED, which is defined by whether the main program's exit code is zero or not.

### Dependencies Between Compute Sessions

#### Pipelining

<!-- TODO: Add content describing pipelining and dependencies between compute sessions -->

### Inference Session

#### Service Endpoint and Routing

<!-- TODO: Add content describing service endpoints and routing for inference sessions -->

#### Auto-Scaling

<!-- TODO: Add content describing auto-scaling for inference sessions -->

### System Session

#### SFTP Access

<!-- TODO: Add content describing SFTP access through system sessions -->

## Scheduling

Backend.AI keeps track of sessions using a state-machine to represent the various lifecycle stages of them.

Refer to the Backend.AI architecture documentation for detailed diagrams.

:::info
For more details, see the Backend.AI documentation on [Resource Groups](https://docs.backend.ai/ko/latest/concepts/resources.html#concept-resource-group).
:::

### Session Selection Strategy

#### Heuristic FIFO

The default session selection strategy is the heuristic FIFO. It mostly works like a FIFO queue to select the oldest pending session, but offers an option to enable a head-of-line (HoL) blocking avoidance logic.

The HoL blocking problem happens when the oldest pending session requires too much resources so that it cannot be scheduled while other subsequent pending sessions fit within the available cluster resources. Those subsequent pending sessions that can be started never have chances until the oldest pending session ("blocker") is either cancelled or more running sessions terminate and release more cluster resources.

When enabled, the HoL blocking avoidance logic keeps track of the retry count of scheduling attempts of each pending session and pushes back the pending sessions whose retry counts exceed a certain threshold. This option should be explicitly enabled by the administrators or during installation.

#### Dominant Resource Fairness (DRF)

<!-- TODO: Add content describing the DRF scheduling strategy -->

### Agent Selection Strategy

#### Concentrated

<!-- TODO: Add content describing the concentrated agent selection strategy -->

#### Dispersed

<!-- TODO: Add content describing the dispersed agent selection strategy -->

#### Custom

<!-- TODO: Add content describing custom agent selection strategies -->
