# Service Components

Backend.AI's architecture is built around several core service components that work together to provide a comprehensive AI computing platform.

## Core Components

### Manager
The central orchestration service that coordinates all platform operations:
- Resource allocation and scheduling
- User authentication and authorization
- Session lifecycle management
- Policy enforcement

### Agent
Worker nodes that execute computational workloads:
- Container runtime management
- Resource monitoring and reporting
- Session isolation and security
- Hardware acceleration support

### Storage Proxy
Manages persistent storage and data operations:
- Virtual folder management
- Data transfer operations
- Storage backend integration
- Access control and permissions

### Gateway
API gateway providing external access:
- REST API endpoints
- Authentication middleware
- Rate limiting and security
- Request routing

## Communication Flow

The components communicate through a well-defined protocol:
1. Client requests are received by the Gateway
2. Manager processes and schedules workloads
3. Agent nodes execute the computational tasks
4. Storage Proxy handles data operations
5. Results are returned to the client

## Scalability and High Availability

- **Horizontal scaling**: Add more agent nodes as needed
- **Load balancing**: Distribute workloads across available resources
- **Fault tolerance**: Automatic failover and recovery mechanisms
- **State management**: Distributed state for high availability

For detailed installation instructions, see the [Installation Guide](../../install/environments.md).