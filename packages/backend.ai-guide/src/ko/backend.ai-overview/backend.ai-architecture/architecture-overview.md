---
title: Backend.AI Architecture
order: 3
---
# Backend.AI Architecture

Here we describe the key concepts that are required to understand and follow this documentation.

<figure><img src="../../images/server-architecture.svg" alt=""><figcaption><p>Fig. 1 The diagram of a typical multi-node Backend.AI server architecture</p></figcaption></figure>

Fig. 1 shows a brief Backend.AI server-side architecture where the components are what you need to install and configure.

Each border-connected group of components is intended to be run on the same server, but you may split them into multiple servers or merge different groups into a single server as you need. For example, you can run separate servers for the nginx reverse-proxy and the Backend.AI manager or run both on a single server. In the [development setup](https://github.com/lablup/backend.ai-docs-2024/blob/eng-latest/en/backend.ai-overview/backend.ai-architecture/broken-reference/README.md), all these components run on a single PC such as your laptop.
