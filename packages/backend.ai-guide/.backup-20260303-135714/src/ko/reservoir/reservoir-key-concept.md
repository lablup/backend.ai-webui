---
title: Reservoir Key Concept
order: 144
---
# Reservoir Key Concept

## What is Backend.AI Reservoir

Backend.AI Reservoir is a local package repository service designed for closed (air-gapped) environments, private clouds, and offline sites, providing essential open-source and operating system packages for AI/ML development and operations securely within internal networks. Many enterprises and research institutions face significant challenges when operating AI research and services in environments separated from external networks due to security policies. In such settings, installing and updating essential packages and libraries is cumbersome and carries considerable risk.

Because air-gapped environments are completely isolated from the external internet, it is not possible to download AI libraries, frameworks, or datasets directly from external repositories. All required packages and dependencies must be acquired externally in advance and then transferred into the internal network. Furthermore, environments separated from external networks within organizations require strict security inspections for any materials brought in from outside.

<figure><img src="../images/Reservoir - 202504v1-2.png" alt=""><figcaption></figcaption></figure>

To address these challenges, Reservoir provides only packages that have passed security verification and incorporates a built-in pipeline for open-source license checking and management, thereby enhancing the transparency and safety of the package import process. In addition, Reservoir supports a wide range of package repositories-including PyPI, CRAN (R), Ubuntu, DGX OS, and AlmaLinux-enabling a consistent development experience across various environments, such as Backend.AI clusters and internal development PCs.

Backend.AI Reservoir is offered as an additional component of the Backend.AI Enterprise suite and is configured as a local package server integrated with the Lablup storage hub service. This setup supports the complete construction of required software environments internally, without the need for external internet connectivity.

## What to Expect

By introducing the Reservoir service, necessary packages can be rapidly installed within the internal network without requiring access to external repositories. The periodic repository synchronization feature ensures that the system remains up to date. This approach significantly reduces security risks and operational overhead associated with firewall exception configurations or manual package imports. Furthermore, when used in internet-connected environments, the package repository caching function reduces network traffic and enables stable package delivery, even in bandwidth-limited conditions.

Backend.AI Reservoir is more than a simple package repository; it is a core infrastructure that enables enterprises and institutions to efficiently and securely manage AI/ML development and service environments within internal networks. It offers specialized features in areas such as security, currency, scalability, and operational convenience, and provides an enterprise-optimized solution through close integration with the Backend.AI platform.
