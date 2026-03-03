---
title: Sessions
order: 65
---
# Sessions

## Session Structure



### Cluster Session (a.k.a Multi-container Session)

Backend.AI supports multi-node workloads to let users create a bundle of containers from multiple nodes. This leverages distributed deep learning and big data analysis. We'd supported cluster bundle since v19.09, and session bundle since v20.09.&#x20;









Each compute session now consists of one or more kernels. In the Docker backend, a kernel corresponds to a container. In the Kubernetes backend, a session corresponds to a pod, and each kernel represents a container within that pod.

<figure><img src="../../../images/image (17).png" alt=""><figcaption></figcaption></figure>

:::info
**Notes**

Some setups may use the host networking mode which transparently opens the host IP and ports to all containers. In that case, there are no bridge/overlay networks. All overlapping apps (e.g., sshd) in different user sessions will get unique port numbers automatically.
:::









##

##

## Idleness Checks

## Add environment variable on creating a session

## Add preopen ports before creating a session

## Save container commit

## Utilize converted images of ongoing sessions

## Optimizing Accelerated Computing
