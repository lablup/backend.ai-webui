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



Backend.AI FastTrack 2 is an MLOps pipeline platform for AI development and operations, designed to organize and easily customize the entire process from data preprocessing to model training, validation, deployment, and inference into a single pipeline. FastTrack 2 is compatible with clusters where Backend.AI is installed, allowing you to achieve optimal performance and cost efficiency simultaneously.

The development of FastTrack was driven by the significant increase in complexity of recent AI and machine learning projects, along with the exponential growth in the scale of data and models. As a result, the need for repetitive and efficient workflow management became pronounced, and existing open-source MLOps tools proved insufficient to meet the diverse requirements encountered in real-world scenarios. To simplify the creation and management of complex pipelines, Lablup advanced the existing pipeline features of Backend.AI and released FastTrack as an independent solution that maintains close integration with Backend.AI.

One of the key features of FastTrack is its intuitive drag-and-drop GUI, which allows anyone to easily design and modify pipelines. All pipelines are managed in a DAG (Directed Acyclic Graph) structure, enabling you to clearly define dependencies and execution order between tasks. You can subdivide each pipeline into multiple task units and configure the required resources individually for each task. The state of a pipeline at the time of execution is managed as a unit called a Job, enabling reproducibility and repeated execution in the same environment at any time.

FastTrack also provides high portability and reusability by managing pipelines, data, code, and execution environments together, making it easy to deploy or migrate across different environments. Through YAML file-based export and import functionality, you can easily share pipelines between users. FastTrack is also equipped with enterprise-grade scalability and security features, including GPU and AI accelerator chip support, compute resource optimization, and support for air-gapped security environments. Pipeline execution and model training results can be automatically sent as notifications to external systems such as Slack, significantly improving operational efficiency.

By adopting FastTrack, you can automate repetitive and complex AI/ML workflows, allowing you to focus more on core development challenges. The GUI-based no-code environment, pipeline templates, and sharing capabilities make collaboration within and across teams much easier. Cost efficiency is maximized through idle GPU resource minimization, per-stage resource configuration, and efficient scheduling. FastTrack can be flexibly applied to diverse organizational structures and hardware environments, and it scales easily as your project grows.





##

##

## Emergence of MLOps

The rise of MLOps: Explosive growth in AI/HPC technology...

Increasing demand for MLOps platforms

## Fast Track Features

MLOps platform embeds dedicated runtime (Backend.AI 22.09)​

Easily design batch job pipeline / runtime optimization of task graph​

Per-task resource allocation for heterogenious jobs​

Support standard shell environment to execute anything / model versioning​

Task customization and sharing (via GitHub/GitLab repositories and/or Backend.AI data folder)​

Easy deployment in inference-dedicated servers​

<figure><img src="../images/complex_pattern_8.png (4) (1) (1).png" alt=""><figcaption></figcaption></figure>

## Fast Track Structure

<figure><img src="../images/complex_pattern_8.png (2) (1) (1) (1) (1) (1) (1) (1) (1).png" alt=""><figcaption><p>FastTrack Architecture</p></figcaption></figure>

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

<figure><img src="../images/complex_pattern_8.png (3) (1) (1) (1) (1) (1).png" alt=""><figcaption></figcaption></figure>

Created when a pipeline is created​

In eash task instance (compute session), the​ folder is mounted under /pipeline​

For a Task 3, the Task1 and Task2’s output​ folders are mounted as:​

Task1’s /pipeline/output → Task3’s /pipeline/input1​

Task2’s /pipeline/output → Task3’s /pipeline/input2​ ​
