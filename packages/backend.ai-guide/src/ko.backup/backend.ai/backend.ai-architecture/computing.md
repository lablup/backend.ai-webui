---
title: Computing
order: 10
---
# Computing

## 세션과 커널

Backend.AI는 세션을 생성하여 관련 컴퓨팅 리소스와 함께 다양한 종류의 계산을 호스팅합니다. 각 세션에는 하나 이상의 커널이 있을 수 있습니다. 여러 커널이 있는 세션을 "클러스터 세션"이라고 부릅니다.

A _kernel_ represents an isolated unit of computation such as a container, a virtual machine, a native process, or even a Kubernetes pod, depending on the Agent’s backed implementation and configurations. The most common form of a kernel is a Docker container. For container or VM-based kernels, they are also associated with the base images. The most common form of a base image is [the OCI container images](https://github.com/opencontainers/image-spec/blob/main/spec.md).

### 클러스터 세션에서의 커널 역할

In a cluster session with multiple kernels, each kernel has a role. By default, the first container takes the “main” role while others takes the “sub” role. All kernels are given unique hostnames like “main1”, “sub1”, “sub2”, …, and “subN” (the cluster size is N+1 in this case). A non-cluster session has one “main1” kernel only.

All interactions with a session are routed to its “main1” kernel, while the “main1” kernel is allowed to access all other kernels via a private network.

:::info
더 보기

[Cluster Networking](cluster-networking.md)
:::

## 세션 템플릿

A session template is a predefined set of parameters to create a session, while they can be overriden by the caller. It may define additional kernel roles for a cluster session, with different base images and resource specifications.

## 세션 종류

There are several classes of sessions for different purposes having different features.

| Feature        | <p>Compute<br>(Interactive)</p> | <p>Compute<br>(Batch)</p> | Inference | System |
| -------------- | ------------------------------- | ------------------------- | --------- | ------ |
| Code execution | ✓                               | ✗                         | ✗         | ✗      |
| Service port   | ✓                               | ✓                         | ✓         | ✓      |
| Dependencies   | ✗                               | ✓                         | ✗         | ✗      |
| Session result | ✗                               | ✓                         | ✗         | ✗      |
| Clustering     | ✓                               | ✓                         | ✓         | ✓      |

Compute session is the most generic form of session to host computations. It has two operation modes: _interactive_ and _batch_.

### Interactive compute session

Interactive compute sessions are used to run various interactive applications and development tools, such as Jupyter Notebooks, web-based terminals, and etc. It is expected that the users control their lifecycles (e.g., terminating them) while Backend.AI offers configuration knobs for the administrators to set idle timeouts with various criteria.

There are two major ways to interact with an interactive compute session: _service ports_ and _the code execution API_.

Service ports

TODO: port mapping diagram

Code execution

TODO: execution API state diagram

### Batch compute session

Batch compute sessions are used to host a “run-to-completion” script with a finite execution time. It has two result states: SUCCESS or FAILED, which is defined by whether the main program’s exit code is zero or not.

### **Dependencies between compute sessions**

Pipelining

### Inference session

Service endpoint and routing

Auto-scaling

### System session

SFTP access

## Scheduling

Backend.AI keeps track of sessions using a state-machine to represent the various lifecycle stages of them.

TODO: session/kernel state diagram

TODO: two-level scheduler architecture diagram

:::info
더 보기

[Resource groups](https://docs.backend.ai/ko/latest/concepts/resources.html#concept-resource-group)
:::

### Session selection strategy

**Heuristic FIFO**

The default session selection strategy is the heuristic FIFO. It mostly works like a FIFO queue to select the oldest pending session, but offers an option to enable a head-of-line (HoL) blocking avoidance logic.

The HoL blocking problem happens when the oldest pending session requires too much resources so that it cannot be scheduled while other subsequent pending sessions fit within the available cluster resources. Those subsequent pending sessions that can be started never have chances until the oldest pending session (“blocker”) is either cancelled or more running sessions terminate and release more cluster resources.

When enabled, the HoL blocking avoidance logic keeps track of the retry count of scheduling attempts of each pending session and pushes back the pending sessions whose retry counts exceed a certain threshold. This option should be explicitly enabled by the administrators or during installation.

**Dominant resource fairness (DRF)**

### Agent selection strategy

#### **Concentrated**

#### **Dispersed**

#### **Custom**
