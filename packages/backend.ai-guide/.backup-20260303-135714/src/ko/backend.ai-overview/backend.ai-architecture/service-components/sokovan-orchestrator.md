---
title: Sokovan Orchestrator
order: 8
---
# Sokovan Orchestrator

Backend.AI Sokovan is the central cluster-level scheduler running inside the manager. It monitors the resource usage of agents and assigns new containers from the job queue to the agents.

Each [resource group](https://docs.backend.ai/ko/latest/concepts/resources.html#concept-resource-group) may have separate scheduling policy and options. The scheduling algorithm may be extended using a common abstract interface. A scheduler implementation accepts the list of currently running sessions, the list of pending sessions in the job queue, and the current resource usage of target agents. It then outputs the choice of a pending session to start and the assignment of an agent to host it.
