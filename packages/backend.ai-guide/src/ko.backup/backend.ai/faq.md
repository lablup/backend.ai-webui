---
title: 자주 하는 질문
order: 22
---
# FAQ

## 오픈소스 버전과 엔터프라이즈 버전의 차이

##

##

##

## Backend.AI vs. Notebooks

| 제품명                               | 역할                             | 특징                                                                                                 |
| --------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------- |
| Apache Zeppelin, Jupyter Notebook | 노트북 스타일의 문서 + 코드 _프론트엔드_       | Familiarity from data scientists and researchers, but hard to avoid insecure host resource sharing |
| **Backend.AI**                    | 모든 프론트엔드들에 연결 가능한 _backend_ 구조 | Built for multi-tenancy: scalable and better isolation                                             |

## vs. 오케스트레이션 프레임워크

| 제품명                            | 대상                                                              | 특징                                                                     |
| ------------------------------ | --------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Amazon ECS, Kubernetes         | Long-running interactive services                               | Load balancing, fault tolerance, incremental deployment                |
| Amazon Lambda, Azure Functions | Stateless light-weight, short-lived functions                   | 관리가 필요없는 서버리스 구조                                                       |
| **Backend.AI**                 | Stateful batch computations mixed with interactive applications | Low-cost high-density computation, maximization of hardware potentials |

## vs. 빅데이터와 AI 프레임워크

| 제품명                                   | 역할            | 특징                                                                                            |
| ------------------------------------- | ------------- | --------------------------------------------------------------------------------------------- |
| TensorFlow, Apache Spark, Apache Hive | 연산 런타임        | Difficult to install, configure, and operate at scale                                         |
| Amazon ML, Azure ML, GCP ML           | Managed MLaaS | Highly scalable but dependent on each platform, still requires system engineering backgrounds |
| **Backend.AI**                        | 연산 런타임의 호스트   | Pre-configured, versioned, reproducible, customizable (open-source)                           |

(모든 상품명과 트레이드 마크들은 각 소유자의 재산입니다.)
