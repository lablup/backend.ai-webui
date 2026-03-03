---
title: Container Registry
order: 9
---
# Container Registry

Backend.AI supports integration with several common container registry solutions, while open source users may also rely on our official registry service with prebuilt images in [https://cr.backend.ai](https://cr.backend.ai/):

* [Docker’s vanilla open-source registry](https://docs.docker.com/registry/)
  * It is simplest to set up but does not provide advanced access controls and namespacing over container images.
* [Harbor v2](https://goharbor.io/) (recommended)
  * It provides a full-fledged container registry service including ACLs with project/user memberships, cloning from/to remote registries, on-premise and cloud deployments, security analysis, and etc.
