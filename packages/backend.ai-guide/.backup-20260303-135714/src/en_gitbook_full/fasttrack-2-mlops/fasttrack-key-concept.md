---
title: FastTrack 2 Key Concept
order: 121
---
# FastTrack 2 Key Concept

## What is Backend.AI FastTrack 2?

Backend.AI FastTrack is an MLOps platform designed to simplify the building, execution, and sharing of complex machine learning pipelines. FastTrack enables the organization of all stages of AI development-including data preprocessing, training, validation, deployment, and inference-into a single, streamlined workflow. Workflow dependencies can be managed efficiently through an intuitive user interface.

The development of FastTrack was driven by the increasing complexity of recent AI and machine learning projects, as well as the exponential growth in the scale of data and models. As a result, the need for repetitive and efficient workflow management has become more pronounced. Existing open-source MLOps tools have proven insufficient to fully meet the diverse requirements encountered in real-world scenarios. To simplify the creation and management of complex pipelines, Lablup has enhanced the existing pipeline features of Backend.AI and introduced FastTrack-a solution that operates independently while maintaining close integration with Backend.AI.







* Pipeline
* Pipeline Job
* Task
* Task instance



Backend.AI FastTrack2 는 AI 개발 및 운영을 위한 MLOps 파이프라인 플랫폼으로, 데이터 전처리부터 모델 학습, 검증, 배포, 추론에 이르는 전 과정을 하나의 파이프라인으로 구성하고 손쉽게 커스터마이징할 수 있도록 설계되었습니다. FastTrack 2는 Backend.AI가 설치된 클러스터에 호환되며, 사용자는 최적의 성능과 비용 효율을 동시에 누릴 수 있습니다.

FastTrack이 개발된 배경에는 최근 AI와 머신러닝 프로젝트의 복잡성이 크게 증가하고, 데이터와 모델의 규모 역시 기하급수적으로 커지는 현실이 있습니다. 이에 따라 반복적이고 효율적인 워크플로우 관리의 필요성이 대두되었고, 기존의 오픈소스 MLOps 도구들만으로는 다양한 현장 요구를 모두 충족하기 어려웠습니다. 복잡한 파이프라인의 생성과 관리를 보다 간소화하고자, 래블업에서는 Backend.AI의 기존 파이프라인 기능을 한 단계 발전시켜, 독립적이면서도 Backend.AI와 긴밀히 연동되는 FastTrack을 출시하게 되었습니다.

FastTrack의 가장 큰 특징 중 하나는 드래그 앤 드롭 방식의 직관적인 GUI를 통해 누구나 손쉽게 파이프라인을 설계하고 수정할 수 있다는 점입니다. 모든 파이프라인은 DAG(Directed Acyclic Graph) 구조로 관리되어, 작업 간의 의존성과 실행 순서를 명확하게 정의할 수 있습니다. 사용자는 각 파이프라인을 여러 개의 작업 단위(Task)로 세분화하여 관리할 수 있으며, 각 작업마다 필요한 자원을 개별적으로 설정할 수 있습니다. 파이프라인이 실행되는 시점의 상태는 잡(Job)이라는 단위로 관리되어, 언제든지 동일한 환경에서 재현하거나 반복 실행이 가능합니다.

또한 FastTrack은 파이프라인, 데이터, 코드, 실행 환경을 함께 관리함으로써 다양한 환경에 손쉽게 배포하거나 이식할 수 있는 높은 이식성과 재사용성을 제공합니다. YAML 파일 기반의 내보내기와 불러오기 기능을 통해 사용자 간에 파이프라인을 손쉽게 공유할 수 있고, GPU 및 AI 가속칩 지원, 연산 자원 최적화, 망분리와 같은 보안 환경 대응 등 엔터프라이즈 환경에 적합한 확장성과 보안성도 갖추고 있습니다. 파이프라인 실행 및 모델 학습 결과는 Slack 등 외부 시스템으로 자동 알림을 받을 수 있어 운영 효율을 크게 높일 수 있습니다.

FastTrack을 도입함으로써 사용자는 반복적이고 복잡한 AI/ML 워크플로우를 자동화하여 개발 본연의 문제 해결에 더욱 집중할 수 있게 됩니다. GUI 기반의 노코드 환경과 파이프라인 템플릿, 그리고 공유 기능을 통해 팀 내외 협업이 한층 쉬워지며, 유휴 GPU 자원 최소화와 단계별 자원 설정, 효율적인 스케줄링을 통해 비용 효율성도 극대화할 수 있습니다. 다양한 조직 구조와 하드웨어 환경에 유연하게 적용할 수 있고, 프로젝트의 성장에 따라 손쉽게 확장할 수 있다는 점도 큰 장점입니다.





##

##

## Emergence of MLOps

MLOps의 대두: 인공지능/HPC 기술의 폭발적 성장 ...

MLOps 플랫폼에 대한 수요 증가​

## Fast Track Features

MLOps platform embeds dedicated runtime (Backend.AI 22.09)​

Easily design batch job pipeline / runtime optimization of task graph​

Per-task resource allocation for heterogenious jobs​

Support standard shell environment to execute anything / model versioning​

Task customization and sharing (via GitHub/GitLab repositories and/or Backend.AI data folder)​

Easy deployment in inference-dedicated servers​

<figure><img src="../images/image (4) (1) (1).png" alt=""><figcaption></figcaption></figure>

## Fast Track Structure

<figure><img src="../images/image (2) (1) (1) (1) (1) (1) (1) (1) (1).png" alt=""><figcaption><p>FastTrack Architecture</p></figcaption></figure>

## Pipeline & Pipeline Job

### Pipeline

Collection of DAG-structured tasks (jobs) and their dependencies​

Execution structures are saved in a single YAML​

Dedicated pipeline data folders per pipeline​

GUI interface to design task graph​

Pipeline is a kind of template,​ and it should be transformed to a pipeline job​ to be executed​

### Pipeline Job

Instantiated, executable form of a pipeline​

Cannot be modified​

Has information on task instances (jobs)​

The status is updated by those of task instances​

Termianted when every of its tasks are finished​

## Task & Task Instance

### Task

The execution unit of a pipeline job​

Per-task resource allocation​

e.g. Only allocate GPU for training tasks​

Per-task execution environment​

TensorFlow 2.x, PyTorch 1.x, Python 3.x…​

Configure data folder mounts​

### Task Instance

Instantiated form of a task during​ the instantiation of pipeline job from a pipeline​

1:1 correspondence to Backend.AI compute session​

Session status == task instance status​

## Pipeline Data Folder

<figure><img src="../images/image (3) (1) (1) (1) (1) (1).png" alt=""><figcaption></figcaption></figure>

Created when a pipeline is created​

In eash task instance (compute session), the​ folder is mounted under /pipeline​

For a Task 3, the Task1 and Task2’s output​ folders are mounted as:​

Task1’s /pipeline/output → Task3’s /pipeline/input1​

Task2’s /pipeline/output → Task3’s /pipeline/input2​ ​
