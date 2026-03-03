# Table of contents

## Backend.AI Overview

* [Introduction](README.md)
* [Disclaimer](backend.ai-overview/disclaimer.md)
* [Backend.AI Architecture](backend.ai-overview/backend.ai-architecture/README.md)
  * [Service Components](backend.ai-overview/backend.ai-architecture/service-components/README.md)
    * [Manager and Webserver](backend.ai-overview/backend.ai-architecture/service-components/manager-and-webserver.md)
    * [App Proxy](backend.ai-overview/backend.ai-architecture/service-components/app-proxy.md)
    * [Storage Proxy](backend.ai-overview/backend.ai-architecture/service-components/storage-proxy.md)
    * [Sokovan Orchestrator](backend.ai-overview/backend.ai-architecture/service-components/sokovan-orchestrator.md)
    * [Container Registry](backend.ai-overview/backend.ai-architecture/service-components/container-registry.md)
  * [Computing](backend.ai-overview/backend.ai-architecture/computing.md)
  * [Resource Management](backend.ai-overview/backend.ai-architecture/resource-management.md)
  * [Cluster Networking](backend.ai-overview/backend.ai-architecture/cluster-networking.md)
  * [Storage Management](backend.ai-overview/backend.ai-architecture/storage-management.md)
  * [Configuration](backend.ai-overview/backend.ai-architecture/configuration.md)
* [Enterprise Applications](backend.ai-overview/enterprise-applicatioins/README.md)
  * [FastTrack MLOps](backend.ai-overview/enterprise-applicatioins/fasttrack-mlops.md)
  * [Control Panel](backend.ai-overview/enterprise-applicatioins/control-panel.md)
  * [Reservoir](backend.ai-overview/enterprise-applicatioins/reservoir.md)
  * [Dashboard](backend.ai-overview/enterprise-applicatioins/monitoring.md)
* [Backend.AI Cloud](backend.ai-overview/backend.ai-cloud.md)
* [FAQ](backend.ai-overview/faq/README.md)
  * [Concepts](backend.ai-overview/faq/concepts.md)
  * [Backend.AI Troubleshooting](backend.ai-overview/faq/backend.ai-troubleshooting.md)

## Install and Run

* [Supported Environments](install-and-run/support-environments.md)
* [Prerequisites](install-and-run/prerequisites/README.md)
  * [Setup OS Environment](install-and-run/prerequisites/setup-os-environment.md)
  * [Install Prerequisites](install-and-run/prerequisites/install-database.md)
  * [Configurate WSL](install-and-run/prerequisites/configurate-wsl.md)
* [All-in-one (Single-node) Installation](install-and-run/single-node-all-in-one/README.md)
  * [Install from Binary](install-and-run/single-node-all-in-one/install-from-binary/README.md)
    * [Manual Installation](install-and-run/single-node-all-in-one/install-from-binary/manual-installation.md)
  * [Install from Source Code](install-and-run/single-node-all-in-one/install-from-source-code.md)
  * [Install from PyPI Package](install-and-run/single-node-all-in-one/install-from-pypi-package.md)
* [Advanced (Multi-node) Installation](install-and-run/advanced-installation/README.md)
  * [Multi-node Setup](install-and-run/advanced-installation/multi-node-setup.md)
* [Install from Packages](install-and-run/install-from-packages/README.md)
  * [Install Backend.AI Manager](install-and-run/install-from-packages/install-backend.ai-manager.md)
* [Install on Cloud Services](install-and-run/install-on-cloud-services/README.md)
  * [Install on AWS](install-and-run/install-on-cloud-services/install-on-aws.md)
  * [Install on Azure](install-and-run/install-on-cloud-services/install-on-azure.md)
  * [Install on GCP](install-and-run/install-on-cloud-services/install-on-gcp.md)
  * [Install on Naver Cloud](install-and-run/install-on-cloud-services/install-on-naver-cloud.md)

***

* [Upgrade a Backend.AI Cluster](upgrade-a-backend.ai-cluster.md)

## Get Started

* [Signup and Login](get-started/signup-and-login.md)
* [General Interface](get-started/general-interface.md)
* [Create Storage Folder](get-started/create-storage-folder.md)
* [Start a New Session](get-started/start-a-new-session.md)
* [Run Applications](get-started/run-applications/README.md)
  * [Jupyter Notebook](get-started/run-applications/jupyter-notebook.md)
  * [Web Terminal](get-started/run-applications/web-terminal.md)
* [Model Serving](get-started/model-serving.md)

## Backend.AI Usage Guide

* [Start](backend.ai-usage-guide/start.md)
* [Summary](backend.ai-usage-guide/summary/README.md)
  * [How to accept / reject invitations](backend.ai-usage-guide/summary/how-to-accept-reject-invitations.md)
* [Storage](backend.ai-usage-guide/storage/README.md)
  * [Data](backend.ai-usage-guide/storage/data/README.md)
    * [How to create / rename / update / delete storage folders](backend.ai-usage-guide/storage/data/how-to-create-rename-update-delete-storage-folders.md)
    * [How to upload a files / folders to your folder](backend.ai-usage-guide/storage/data/how-to-upload-a-files-folders-to-your-folder.md)
    * [How to share folders](backend.ai-usage-guide/storage/data/how-to-share-folders.md)
    * [CLI...](backend.ai-usage-guide/storage/data/cli....md)
* [Workload](backend.ai-usage-guide/workload/README.md)
  * [Sessions](backend.ai-usage-guide/workload/sessions/README.md)
    * [How to start / terminate a session](backend.ai-usage-guide/workload/sessions/how-to-start-terminate-a-session.md)
    * [Optional settings when creating a session](backend.ai-usage-guide/workload/sessions/optional-settings-when-creating-a-session.md)
    * [How to  existing sessions](backend.ai-usage-guide/workload/sessions/how-to-existing-sessions.md)
    * [How to use Backend.AI Cluster Session](backend.ai-usage-guide/workload/sessions/how-to-use-backend.ai-cluster-session.md)
    * [How to optimize Accelerated Computing](backend.ai-usage-guide/workload/sessions/how-to-optimize-accelerated-computing.md)
    * [Mounting Folders to a Compute Session](backend.ai-usage-guide/workload/sessions/mounting-folders-to-a-compute-session.md)
    * [SSH/SFTP Connection to a Compute Session](backend.ai-usage-guide/workload/sessions/ssh-sftp-connection-to-a-compute-session.md)
  * [Import & Run](backend.ai-usage-guide/workload/import-and-run/README.md)
    * [How to import notebooks and web based Git repositories](backend.ai-usage-guide/workload/import-and-run/how-to-import-notebooks-and-web-based-git-repositories.md)
  * [My Environments](backend.ai-usage-guide/workload/my-environment.md)
* [Playground](backend.ai-usage-guide/playground/README.md)
  * [AI Agents](backend.ai-usage-guide/playground/ai-agents.md)
  * [Chat](backend.ai-usage-guide/playground/chat/README.md)
    * [How to create multiple chat windows](backend.ai-usage-guide/playground/chat/how-to-create-multiple-chat-windows.md)
* [Service](backend.ai-usage-guide/serving/README.md)
  * [Serving](backend.ai-usage-guide/serving/serving/README.md)
    * [How to start a new service](backend.ai-usage-guide/serving/serving/how-to-start-a-new-service.md)
    * [How to add a new environment variable to a service](backend.ai-usage-guide/serving/serving/how-to-add-a-new-environment-variable-to-a-service.md)
  * [Model Store](backend.ai-usage-guide/serving/model-store/README.md)
    * [How to search a model](backend.ai-usage-guide/serving/model-store/how-to-search-a-model.md)
    * [How to download a model to my environment](backend.ai-usage-guide/serving/model-store/how-to-download-a-model-to-my-environment.md)
    * [How to fine-tune the uploaded model](backend.ai-usage-guide/serving/model-store/how-to-fine-tune-the-uploaded-model.md)
* [Metrics](backend.ai-usage-guide/preferences/README.md)
  * [Statistics](backend.ai-usage-guide/preferences/statistics.md)
* [Profile & Preferences](backend.ai-usage-guide/data-and-storage/README.md)
  * [How to change personal informations](backend.ai-usage-guide/data-and-storage/how-to-change-personal-informations.md)
  * [How to change system settings](backend.ai-usage-guide/data-and-storage/how-to-change-system-settings.md)
  * [How to customize theme and logo](backend.ai-usage-guide/data-and-storage/how-to-customize-theme-and-logo.md)
  * [How to view logs & errors](backend.ai-usage-guide/data-and-storage/how-to-view-logs-and-errors.md)

***

* [CLI (User)](cli-user/README.md)
  * [How to begin with CLI (User)](cli-user/how-to-begin-with-cli-user.md)
  * [Starting a Session with CLI](cli-user/starting-a-session-with-cli.md)
  * [Commiting a Session with CLI](cli-user/commiting-a-session-with-cli.md)
  * [Downloading Files from Session with CLI](cli-user/downloading-files-from-session-with-cli.md)
  * [Terminating a Session with CLI](cli-user/terminating-a-session-with-cli.md)
  * [Using SSH in a compute session](cli-user/using-ssh-in-a-compute-session.md)
  * [Creating a Model Service](cli-user/creating-a-model-service.md)
  * [Updating a Model Service](cli-user/updating-a-model-service.md)
  * [Deleting a Model Service](cli-user/deleting-a-model-service.md)
  * [CLI: Troubleshooting](cli-user/cli-troubleshooting.md)
* [CLI (Admin)](cli-admin/README.md)
  * [How to begin with CLI (Admin)](cli-admin/how-to-begin-with-cli-admin.md)
  * [Resource Management](cli-admin/resource-management.md)
  * [User Management](cli-admin/user-management.md)
  * [Data Folder and Storage Management](cli-admin/data-folder-and-storage-management.md)
  * [Image Management](cli-admin/image-management.md)
  * [Updating WebUI announcements](cli-admin/updating-webui-announcements.md)

## 🏢 Administration

* [User Settings](administration/user-settings.md)
* [Environments](administration/environments.md)
* [Resources](administration/resources.md)
* [Configurations](administration/configurations.md)
* [Maintenance](administration/maintenance.md)
* [Information](administration/information.md)

## 🏢 FastTrack 2 MLOps

* [FastTrack 2 Key Concept](fasttrack-2-mlops/fasttrack-key-concept.md)
* [Structure](fasttrack-2-mlops/structure.md)
* [Starting FastTrack 2](fasttrack-2-mlops/starting-fasttrack-2/README.md)
  * [Registering account and Logging-in](fasttrack-2-mlops/starting-fasttrack-2/registering-account-and-logging-in.md)
* [Pipelines](fasttrack-2-mlops/pipelines/README.md)
  * [Creating and editing a new pipeline](fasttrack-2-mlops/pipelines/creating-and-editing-a-new-pipeline.md)
  * [Adding Tasks within a Pipeline](fasttrack-2-mlops/pipelines/adding-tasks-within-a-pipeline.md)
  * [Creating dependencies between tasks](fasttrack-2-mlops/pipelines/creating-dependencies-between-tasks.md)
  * [Importing a Pipeline](fasttrack-2-mlops/pipelines/importing-a-pipeline.md)
  * [Editing the created Pipeline](fasttrack-2-mlops/pipelines/editing-the-created-pipeline.md)
  * [Skipping a Task](fasttrack-2-mlops/pipelines/skipping-a-task.md)
  * [Reverting Pipeline Version](fasttrack-2-mlops/pipelines/reverting-pipeline-version.md)
* [Pipeline Jobs](fasttrack-2-mlops/pipeline-jobs/README.md)
  * [Creating a Pipeline Job](fasttrack-2-mlops/pipeline-jobs/creating-a-pipeline-job.md)
  * [Scheduling a Pipeline Job](fasttrack-2-mlops/pipeline-jobs/scheduling-a-pipeline-job.md)
  * [Tracking the running Pipeline Job](fasttrack-2-mlops/pipeline-jobs/tracking-the-running-pipeline-job.md)

***

* [Settings](settings.md)

## 🏢 Control Panel

* [Control Panel Key Concepts](control-panel/control-panel-key-concepts.md)
* [Getting Started](control-panel/getting-started.md)
* [Dashboard](control-panel/dashboard.md)
* [Management](control-panel/management.md)

## 🏢 Reservoir

* [Reservoir Key Concept](reservoir/reservoir-key-concept.md)

## Migration Guide

* [Upgrading from 20.x to 24.x](migration-guide/upgrading-from-20.x-to-24.x.md)
* [Migrating from the Docker Hub to cr.backend.ai](migration-guide/migrating-from-the-docker-hub-to-cr.backend.ai.md)

## Developer Guide

* [Development Setup](developer-guide/development-setup.md)
* [Daily Development Workflows](developer-guide/daily-development-workflows.md)
* [Version Numbering](developer-guide/version-numbering.md)

## API Reference

* [Manager API Reference](api-reference/manager-api-reference/README.md)
  * [Manager API Common Concepts](api-reference/manager-api-reference/manager-api-common-concepts/README.md)
    * [API and Document Conventions](api-reference/manager-api-reference/manager-api-common-concepts/api-and-document-conventions.md)
    * [JSON Object References](api-reference/manager-api-reference/manager-api-common-concepts/json-object-references.md)
    * [Authentication](api-reference/manager-api-reference/manager-api-common-concepts/authentication.md)
    * [Rate Limiting](api-reference/manager-api-reference/manager-api-common-concepts/rate-limiting.md)
  * [Manager REST API](api-reference/manager-api-reference/manager-rest-api/README.md)
    * [Session Management](api-reference/manager-api-reference/manager-rest-api/session-management.md)
    * [Code Execution (Query Mode)](api-reference/manager-api-reference/manager-rest-api/code-execution-query-mode.md)
    * [Code Execution (Batch Mode)](api-reference/manager-api-reference/manager-rest-api/code-execution-batch-mode.md)
    * [Code Execution (Streaming)](api-reference/manager-api-reference/manager-rest-api/code-execution-streaming.md)
    * [Event Monitoring](api-reference/manager-api-reference/manager-rest-api/event-monitoring.md)
    * [Service Ports](api-reference/manager-api-reference/manager-rest-api/service-ports.md)
    * [Resource Presets](api-reference/manager-api-reference/manager-rest-api/resource-presets.md)
    * [Virtual Folders](api-reference/manager-api-reference/manager-rest-api/virtual-folders.md)
* [Agent API Reference](api-reference/agent-api-reference.md)
* [Storage Proxy Reference](api-reference/storage-proxy-reference.md)

## Command Reference

* [Client CLI](command-reference/client-cli.md)
* [Manager CLI](command-reference/manager-cli.md)
* [Agent CLI](command-reference/agent-cli.md)
* [Storage CLI](command-reference/storage-cli.md)

## Backend.AI SDK

* [Client SDK for TypeScript](backend.ai-sdk/client-sdk-for-typescript.md)
* [Client SDK for Python](backend.ai-sdk/client-sdk-for-python.md)
  * [Installation](backend.ai-sdk/client-sdk-for-python/installation.md)
  * [Client Configuration](backend.ai-sdk/client-sdk-for-python/client-configuration.md)
  * [Command Line Interface](backend.ai-sdk/client-sdk-for-python/command-line-interface/README.md)
    * [Configuration](backend.ai-sdk/client-sdk-for-python/command-line-interface/configuration.md)
    * [Compute Sessions](backend.ai-sdk/client-sdk-for-python/command-line-interface/compute-sessions.md)
    * [Container Applications](backend.ai-sdk/client-sdk-for-python/command-line-interface/container-applications.md)
    * [Storage Management](backend.ai-sdk/client-sdk-for-python/command-line-interface/storage-management.md)
    * [Advanced Code Execution](backend.ai-sdk/client-sdk-for-python/command-line-interface/advanced-code-execution.md)
    * [Session Templates](backend.ai-sdk/client-sdk-for-python/command-line-interface/session-templates.md)
  * [High-level Function Reference](backend.ai-sdk/client-sdk-for-python/high-level-function-reference.md)
  * [Low-level SDK Reference](backend.ai-sdk/client-sdk-for-python/low-level-sdk-reference.md)

## Deprecated

* [Forklift Key Concepts](deprecated/forklift-key-concepts/README.md)
  * [Build with OpenAPI](deprecated/forklift-key-concepts/build-with-openapi.md)
  * [Build with GUI](deprecated/forklift-key-concepts/build-with-gui.md)

## Terms of License Agreement

* [Backend.AI License (Software)](terms-of-license-agreement/backend.ai-license-software.md)
