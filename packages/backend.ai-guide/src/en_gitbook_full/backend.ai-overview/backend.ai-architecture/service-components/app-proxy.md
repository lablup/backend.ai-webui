---
title: App Proxy
order: 6
---
# App Proxy

Backend.AI AppProxy acts as an intermediary proxy that manages traffic between user applications running in Backend.AI sessions and external clients, such as web browsers. AppProxy provides a central point for configuring network and firewall policies for user application traffic

## **Operation Modes**

AppProxy supports two main operation modes:

* **Port Mapping:** Each application instance is assigned a TCP port from a pre-configured range. This allows direct access to the application via the assigned port.
* **Wildcard Subdomain:** Each application instance is assigned a system-generated subdomain under a specified top-level domain, enabling access through a unique URL.









Depending on the session type and application launch configurations, it may require an authenticated HTTP session for HTTP-based applications. For instance, you may enforce authentication for interactive development apps like Jupyter while allow anonymous access for AI model service APIs.
