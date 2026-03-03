# Glossary

Definitions of key terms and concepts used throughout Backend.AI platform and documentation.

## A

**Agent**
A worker node in the Backend.AI cluster that executes compute sessions and manages containerized workloads.

**Agent Node**
A physical or virtual machine running the Backend.AI Agent service, providing compute resources to the cluster.

**API Gateway**
A service that manages API requests, providing authentication, rate limiting, and request routing capabilities.

**Auto-mount**
A feature that automatically mounts virtual folders when creating compute sessions.

## B

**Batch Session**
A non-interactive compute session designed for automated job execution and long-running tasks.

**Backend.AI**
An open-source platform for AI computing that provides scalable, containerized environments for machine learning workloads.

## C

**Compute Session**
An isolated container environment where users can run code, perform computations, and access various tools and frameworks.

**Container Image**
A pre-configured environment containing an operating system, runtime, libraries, and tools needed for specific computational tasks.

**Control Panel**
An enterprise management interface providing advanced monitoring, analytics, and administration capabilities.

## D

**Domain**
An organizational boundary that provides resource isolation, user management, and billing separation within Backend.AI.

**Docker**
A containerization platform used by Backend.AI to create isolated compute environments.

## E

**Environment**
A pre-configured container image containing specific software stacks, libraries, and tools for computational tasks.

**Endpoint**
A URL or API address that provides access to Backend.AI services or model serving capabilities.

## F

**FastTrack**
Backend.AI's MLOps platform providing pipeline creation, experiment tracking, and automated machine learning workflows.

**fGPU (Fractional GPU)**
Backend.AI's GPU virtualization technology that allows sharing a single physical GPU across multiple compute sessions.

## G

**GPU Virtualization**
Technology that allows multiple users to share GPU resources efficiently through fractional allocation.

**GraphQL**
A query language and runtime for APIs used by Backend.AI for flexible data fetching.

## H

**High Availability**
System design ensuring continuous operation through redundancy, failover mechanisms, and fault tolerance.

**HPC (High-Performance Computing)**
Computational approaches using parallel processing and advanced hardware to solve complex problems.

## I

**Interactive Session**
A real-time compute session allowing direct user interaction through Jupyter notebooks, terminals, or IDEs.

**Image Registry**
A storage and distribution system for container images used by Backend.AI.

## J

**Jupyter Notebook**
A web-based interactive computing environment for creating and sharing documents with live code, equations, visualizations, and text.

## K

**Keypair**
Authentication credentials consisting of public and private keys used for API access and session authentication.

**Kubernetes**
An orchestration platform for managing containerized applications, supported as a deployment option for Backend.AI.

## L

**Load Balancing**
Distribution of computational workloads across multiple resources to optimize performance and utilization.

## M

**Manager**
The central control plane service in Backend.AI responsible for orchestrating resources, sessions, and user management.

**MLOps**
Machine Learning Operations - practices and tools for deploying and maintaining ML models in production.

**Mount Point**
A directory path where virtual folders are made accessible within compute sessions.

**Multi-tenancy**
Architecture allowing multiple users or organizations to share resources while maintaining isolation and security.

## N

**Node**
A physical or virtual machine participating in the Backend.AI cluster, typically running Agent services.

**Namespace**
A logical separation mechanism providing isolated environments for different users, projects, or organizations.

## O

**Orchestration**
Automated management and coordination of computational resources, sessions, and workflows.

## P

**Project**
An organizational unit within a domain that groups users, resources, and workloads for collaboration and management.

**Policy**
Configuration rules that define resource limits, access controls, and usage parameters for users or groups.

## Q

**Quota**
Limits placed on resource usage, storage consumption, or session creation to manage costs and prevent overuse.

**Queue**
A system for managing and prioritizing pending compute session requests when resources are fully utilized.

## R

**Resource Group**
A collection of compute nodes with similar hardware specifications or organizational purposes.

**REST API**
Representational State Transfer - an architectural style for web services used by Backend.AI for programmatic access.

**Role-Based Access Control (RBAC)**
Security mechanism that assigns permissions based on user roles within the organization.

## S

**Scaling Group**
A group of agent nodes that can be scaled horizontally to meet computational demands.

**Session**
An isolated compute environment where users execute code and perform computational tasks.

**Storage Proxy**
A service component that manages persistent storage, virtual folders, and data transfer operations.

## T

**Tenant**
An individual user, organization, or group using Backend.AI in a multi-tenant environment.

**Terminal**
Command-line interface access within compute sessions for direct system interaction.

## U

**User Management**
Administrative functions for creating, configuring, and managing user accounts and permissions.

## V

**Virtual Folder (VFolder)**
Persistent storage containers that can be mounted in compute sessions and shared among users.

**Virtualization**
Technology that creates isolated environments for running multiple workloads on shared hardware.

## W

**Web UI**
The web-based user interface providing graphical access to Backend.AI platform features.

**Workload**
Computational tasks or jobs executed within Backend.AI compute sessions.

**Worker Node**
Another term for Agent Node - a machine that provides computational resources to the Backend.AI cluster.

## Acronyms and Abbreviations

**AI** - Artificial Intelligence
**API** - Application Programming Interface
**AWS** - Amazon Web Services
**CLI** - Command Line Interface
**CPU** - Central Processing Unit
**CSV** - Comma-Separated Values
**DNS** - Domain Name System
**GPU** - Graphics Processing Unit
**HTTP** - HyperText Transfer Protocol
**HTTPS** - HTTP Secure
**IDE** - Integrated Development Environment
**JSON** - JavaScript Object Notation
**ML** - Machine Learning
**NAS** - Network Attached Storage
**OS** - Operating System
**RAM** - Random Access Memory
**REST** - Representational State Transfer
**SDK** - Software Development Kit
**SSH** - Secure Shell
**SSL** - Secure Sockets Layer
**TLS** - Transport Layer Security
**UI** - User Interface
**URL** - Uniform Resource Locator
**VM** - Virtual Machine
**YAML** - YAML Ain't Markup Language

## See Also

- [Architecture Overview](../overview/architecture/service-components.md)
- [Installation Guide](../install/environments.md)
- [User Guide](../get-started/first-login.md)
- [API Reference](../api/manager/auth.md)