---
title: 클러스터 네트워킹
order: 12
---
# Cluster Networking

## 싱글 노드 클러스터 세션

단일 노드 옵션을 사용해 여러 컨테이너로 세션을 생성하면, 모든 컨테이너가 단일 에이전트에서 생성됩니다. 이 컨테이너들은 기본 네트워크와 별도로 프라이빗 브리지 네트워크를 공유하며, 서로 비공개 상호작용이 가능합니다. 또한, 해당 프라이빗 브리지 네트워크는 방화벽 제한을 받지 않습니다.

## 멀티 노드 클러스터 세션

대규모 계산을 위해 여러 에이전트에 걸친 멀티노드 클러스터 세션을 구성할 수 있습니다. 이 경우, 관리자는 컨테이너들이 서로 통신할 수 있도록 프라이빗 오버레이 네트워크를 자동으로 설정합니다. 이 네트워크에는 방화벽 제한이 적용되지 않습니다.

## Detection of clustered setups

There is a concept called _cluster role_. The current version of Backend.AI creates homogeneous cluster sessions by replicating the same resource configuration and the same container image, but we have plans to add heterogeneous cluster sessions that have different resource and image configurations for each cluster role. For instance, a Hadoop cluster may have two types of containers: name nodes and data nodes, where they could be mapped to `main` and `sub` cluster roles.

All interactive apps are executed only in the `main1` container which is always present in both cluster and non-cluster sessions. It is the user application’s responsibility to connect with and utilize other containers in a cluster session. To ease the process, Backend.AI injects the following environment variables into the containers and sets up a random-generated SSH keypairs between the containers so that each container ssh into others without additional prompts.:

| 환경 변수                          | 의미                                          | 예시                     |
| ------------------------------ | ------------------------------------------- | ---------------------- |
| `BACKENDAI_CLUSTER_SIZE`       | 해당 클러스터 세션의 컨테이너 수                          | `4`                    |
| `BACKENDAI_CLUSTER_HOSTS`      | 해당 클러스터 세션에 있는, 컨테이너 호스트 이름의 쉼표로 구분된 목록     | `main1,sub1,sub2,sub3` |
| `BACKENDAI_CLUSTER_REPLICAS`   | 쉼표로 구분된 키: 클러스터 역할의 값 쌍과 각 역할의 복제본 개수       | `main:1,sub:3`         |
| `BACKENDAI_CLUSTER_HOST`       | 현재 컨테이너의 컨테이너 호스트 이름                        | `main1`                |
| `BACKENDAI_CLUSTER_IDX`        | 동일한 클러스터 역할을 공유하는 컨테이너에서 현재 컨테이너의 단일 기반 인덱스 | `1`                    |
| `BACKENDAI_CLUSTER_ROLE`       | 현재 컨테이너의 클러스터 역할 이름                         | `main`                 |
| `BACKENDAI_CLUSTER_LOCAL_RANK` | 전체 클러스터 세션 내에서 현재 컨테이너의 0 기반 전역 인덱스         | `0`                    |

[Previous](https://docs.backend.ai/ko/latest/concepts/users.html)[Next](https://docs.backend.ai/ko/latest/concepts/storage.html)[\
](https://www.facebook.com/lablupInc)
