---
title: FastTrack 핵심 콘셉트
order: 90
---
# FastTrack 핵심 콘셉트

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

<figure><img src="../images/image (4).png" alt=""><figcaption></figcaption></figure>

## Fast Track Structure

<figure><img src="../images/image (2) (1).png" alt=""><figcaption><p>FastTrack Architecture</p></figcaption></figure>

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

<figure><img src="../images/image (3) (1).png" alt=""><figcaption></figcaption></figure>

Created when a pipeline is created​

In eash task instance (compute session), the​ folder is mounted under /pipeline​

For a Task 3, the Task1 and Task2’s output​ folders are mounted as:​

Task1’s /pipeline/output → Task3’s /pipeline/input1​

Task2’s /pipeline/output → Task3’s /pipeline/input2​ ​
