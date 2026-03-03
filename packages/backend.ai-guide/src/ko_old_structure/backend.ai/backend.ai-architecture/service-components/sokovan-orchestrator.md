---
title: 소코반 오케스트레이터 (Sokovan Orchestrator)
order: 8
---
# 소코반 오케스트레이터 (Sokovan Orchestrator)

Sokovan은 가속 컴퓨팅에 특화된 오케스트레이터입니다.&#x20;

Sokovan은 가속화 인식, 멀티 테넌트, 배치 지향 작업 스케줄링을 제공하며 다양한 시스템 레이어에 여러 하드웨어 가속 기술을 완전히 통합하여 잠재력 있는 성능을 발휘합니다.​

Sokovan은 클러스터 수준 노드 할당 스케줄러와 노드 수준 리소스/장치 할당 스케줄러 두 가지 수준의 스케줄링을 제공합니다. 클러스터 수준 스케줄러는 사용자가 작업 배치 전략을 사용자 정의하고 워크로드의 밀도와 우선 순위를 제어할 수 있도록 합니다. 노드 수준 스케줄러는 각 컨테이너에 하드웨어 가속기를 자동으로 감지하고 활성화하여 컨테이너 당 성능을 최적화합니다.​

이는 Slurm 및 기존 도구와 비교하여 AI 워크로드의 성능을 향상시키는 데 도움이 됩니다. Sokovan은 또한 AI 훈련 및 서비스를 포함한 다양한 GPU 워크로드에 대해 다양한 산업에서 대규모로 배포되었습니다. 그 설계와 기능은 컨테이너 기반 MLOps 플랫폼이 최신 하드웨어 기술을 더욱 효과적으로 활용할 수 있도록 도와줍니다.​



소코반은 컨테이너+VM 오케스트레이터로써 쿠버네티스와 비슷한 일을 수행 하지만, 훨씬 더 강력하고 빠른 성능을 발휘해요. 특히 구조적으로 배치 작업과 분산처리에 특화되어 있으면서도, 성능에 집중해 설계한 엄청나게 다른 추상화 계층을 기반으로 새로운 하드웨어의 성능을 극대화 하거나 초고속 네트워크를 지원하는데에 굉장히 최적화 되어 있답니다.



Backend.AI Sokovan is the central cluster-level scheduler running inside the manager. It monitors the resource usage of agents and assigns new containers from the job queue to the agents.

Each [resource group](https://docs.backend.ai/ko/latest/concepts/resources.html#concept-resource-group) may have separate scheduling policy and options. The scheduling algorithm may be extended using a common abstract interface. A scheduler implementation accepts the list of currently running sessions, the list of pending sessions in the job queue, and the current resource usage of target agents. It then outputs the choice of a pending session to start and the assignment of an agent to host it.
