---
title: Service Components
order: 4
---
# Service Components

Here is a list of the main service components of the Backend.AI architecture:

1. **Manager and Webserver**: Manages the entire cluster centrally.
2. **App Proxy**: A proxy that mediates traffic between user applications and clients such as browsers.
3. **Storage Proxy**: A proxy that offloads the transfer of large files from the manager.
4. **Sokovan Orchestrator**: A central cluster-level scheduler that runs inside the manager.
5. **Container Registry**: Integrates with various container registry solutions.
