# Pipeline Creation

Learn how to create automated machine learning pipelines using Backend.AI's FastTrack MLOps platform.

## Overview

FastTrack provides tools for creating end-to-end machine learning pipelines that automate:
- Data preprocessing and validation
- Model training and evaluation
- Hyperparameter optimization
- Model deployment and serving
- Monitoring and maintenance

## Getting Started

### Prerequisites
- Backend.AI platform access
- FastTrack license (Enterprise feature)
- Project setup with appropriate permissions
- Training data and requirements

### Basic Pipeline Concepts
- **Stages**: Individual steps in the ML workflow
- **Dependencies**: Relationships between stages
- **Artifacts**: Data, models, and results passed between stages
- **Parameters**: Configurable values for pipeline execution

## Pipeline Creation Process

### 1. Define Pipeline Structure
Create a pipeline configuration file:

```yaml
name: "ml-training-pipeline"
version: "1.0"
description: "Automated ML training pipeline"

stages:
  - name: data-preprocessing
    image: "python:3.9-ml"
    script: "scripts/preprocess.py"
    inputs:
      - raw_data
    outputs:
      - processed_data

  - name: model-training
    image: "tensorflow:latest"
    script: "scripts/train.py"
    inputs:
      - processed_data
    outputs:
      - trained_model
    depends_on:
      - data-preprocessing

  - name: model-evaluation
    image: "python:3.9-ml"
    script: "scripts/evaluate.py"
    inputs:
      - trained_model
      - test_data
    outputs:
      - evaluation_results
    depends_on:
      - model-training
```

### 2. Create Pipeline Scripts
Implement the processing logic for each stage.

For more details on additional pipeline features and advanced configurations, see the [FastTrack documentation](task-management.md).

## Next Steps
- [Task Management](task-management.md)
- [Job Scheduling](job-scheduling.md)
- [Experiment Tracking](experiment-tracking.md)